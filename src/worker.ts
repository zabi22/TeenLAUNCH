import { Worker, Job, Queue } from 'bullmq';
import IORedis from 'ioredis';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { db } from "./db/index.ts";
import { documents, portfolioItems, users } from "./db/schema.ts";
import { eq, sql } from "drizzle-orm";
import { aiProviderManager } from "./lib/AIProviderManager.ts";

const redisUrl = process.env.REDIS_URL;
let connection: IORedis | null = null;
let worker: Worker | null = null;
let documentQueue: Queue | null = null;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

if (redisUrl) {
    connection = new IORedis(redisUrl, {
        maxRetriesPerRequest: null,
    });
    connection.on('error', (err) => console.error('Redis Worker Connection Error', err));

    // Register a repeatable daily job to reset the AI call counter at midnight UTC
    const dailyResetQueue = new Queue('daily-reset', { connection: connection as any });
    dailyResetQueue.add('reset-quota', {}, {
        repeat: {
            pattern: '0 0 * * *' // Midnight UTC
        }
    }).catch(err => console.error('Error scheduling daily reset repeatable job', err));

    // Setup another worker to process quota reset
    new Worker('daily-reset', async (job: Job) => {
        if (job.name === 'reset-quota' && connection) {
            console.log('Resetting daily AI calls quota at Midnight UTC...');
            await connection.set('ai_calls_today', '0');
        }
    }, { connection: connection as any });

    // Initialize documentQueue here to be able to requeue delayed jobs
    documentQueue = new Queue('document-parsing', { connection: connection as any });

    worker = new Worker('document-parsing', async (job: Job) => {
        const { documentId, attemptCount = 1 } = job.data;
        const document = await db.select().from(documents).where(eq(documents.id, documentId)).then(r => r[0]);
        if (!document) {
            console.warn(`[Worker] Document with ID ${documentId} not found.`);
            return;
        }

        // Set state to processing on start
        await db.update(documents).set({ verificationStatus: 'processing' }).where(eq(documents.id, documentId));

        let fileBuffer: Buffer;
        try {
            fileBuffer = await fs.promises.readFile(document.fileUrl);
        } catch (fileErr: any) {
            console.error(`[Worker] Failed to read file at ${document.fileUrl}`, fileErr);
            await db.update(documents).set({ verificationStatus: 'failed' }).where(eq(documents.id, documentId));
            return;
        }

        // Calculate SHA-256 hash of file content
        const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        const cacheKey = `doc_parse:${fileHash}`;

        // 1. Check Cache
        if (connection) {
            try {
                const cached = await connection.get(cacheKey);
                if (cached) {
                    console.log(`[Worker] Cache hit for file ${document.fileUrl} with hash ${fileHash}`);
                    const parsedData = JSON.parse(cached);
                    await finalizeSuccessfulVerification(document, parsedData);
                    return;
                }
            } catch (cacheErr) {
                console.error('[Worker] Cache check failed, proceeding to parse', cacheErr);
            }
        }

        // Determine mimeType for inline data
        let mimeType = 'application/pdf';
        if (document.fileUrl.endsWith('.png')) mimeType = 'image/png';
        else if (document.fileUrl.endsWith('.jpg') || document.fileUrl.endsWith('.jpeg')) mimeType = 'image/jpeg';

        const base64Data = fileBuffer.toString('base64');

        // 2. Execute AI Parsing with exponential backoff (2s, 4s, 8s, 16s) inside
        const systemInstruction = `You are a world-class AI document intelligence system. Your task is to analyze the uploaded certificate, award, or transcript and extract critical data accurately.
Return ONLY a valid JSON object matching the following structure exactly, with NO wrapping markdown code blocks, NO backticks, and NO trailing commas:
{
  "certificateName": "The official name of the certificate, award, or credential",
  "organization": "The name of the issuing school, academy, company, or institution",
  "date": "The issue date in YYYY-MM-DD or Month YYYY format (extract exactly as shown on document, default to null if missing)",
  "extractedText": "A high-quality 2-3 sentence summary of the achievements, subjects, skills, or hours verified by this document"
}`;

        const prompt = "Please analyze the attached document and extract the certificate name, issuing organization, issue date, and high-quality summary. Extract all relevant details strictly as shown.";

        let success = false;
        let parsedData: any = null;
        let lastError: any = null;
        const delays = [2000, 4000, 8000, 16000];

        for (let attempt = 1; attempt <= 4; attempt++) {
            try {
                console.log(`[Worker] Attempt ${attempt} of 4 parsing document ${documentId}`);
                const responseText = await aiProviderManager.generateContent({
                    systemInstruction,
                    prompt,
                    isJson: true,
                    isComplex: false,
                    mediaData: {
                        mimeType,
                        data: base64Data
                    },
                    preferredOrder: ["gemini", "deepseek", "cohere"]
                });

                if (!responseText || responseText.includes("fallback")) {
                    throw new Error("Received fallback or empty response from AI provider");
                }

                // Clean the response from markdown if present
                let cleaned = responseText.trim();
                if (cleaned.startsWith("```")) {
                    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
                }

                parsedData = JSON.parse(cleaned);
                if (parsedData && (parsedData.certificateName || parsedData.organization)) {
                    success = true;
                    break;
                } else {
                    throw new Error("Parsed JSON structure does not contain expected fields");
                }
            } catch (err: any) {
                lastError = err;
                console.warn(`[Worker] Attempt ${attempt} failed for document ${documentId}: ${err.message || err}`);
                if (attempt < 4) {
                    await sleep(delays[attempt - 1]);
                }
            }
        }

        // 3. Handle success or failure
        if (success && parsedData) {
            // Write to Redis cache with 7-day TTL (604800 seconds)
            if (connection) {
                try {
                    await connection.set(cacheKey, JSON.stringify(parsedData), 'EX', 604800);
                } catch (cacheErr) {
                    console.error('[Worker] Failed to write cache', cacheErr);
                }
            }

            await finalizeSuccessfulVerification(document, parsedData);
        } else {
            console.error(`[Worker] Parsing failed permanently for this job attempt ${attemptCount} for document ${documentId}. Last Error:`, lastError);
            
            if (attemptCount < 4) {
                // Mark status as queued_for_retry and requeue with a 1-hour delay
                await db.update(documents).set({ verificationStatus: 'queued_for_retry' }).where(eq(documents.id, documentId));
                if (documentQueue) {
                    console.log(`[Worker] Requeueing document ${documentId} for attempt ${attemptCount + 1} in 1 hour`);
                    await documentQueue.add('parse', { documentId, attemptCount: attemptCount + 1 }, { delay: 60 * 60 * 1000 });
                }
            } else {
                // After 4 job failures, dead-letter permanently
                console.error(`[Worker] Document ${documentId} failed permanently after 4 retries.`);
                await db.update(documents).set({ verificationStatus: 'failed_permanently' }).where(eq(documents.id, documentId));
            }
        }
    }, { connection: connection as any });
} else {
    console.warn('REDIS_URL not set. Redis/BullMQ worker will not start.');
}

async function finalizeSuccessfulVerification(document: any, parsedData: any) {
    // 1. Update document status and store parsed results
    await db.update(documents).set({ 
        parsedData, 
        verificationStatus: 'verified' 
    }).where(eq(documents.id, document.id));

    // 2. Auto-create portfolio item
    const portfolioItemTitle = parsedData.certificateName || 'Verified Achievement';
    const portfolioItemDesc = parsedData.extractedText || `Verified certificate from ${parsedData.organization || 'Issuing Organization'}`;
    const portfolioItemCategory = document.type || 'Certification';

    await db.insert(portfolioItems).values({
        userId: document.userId,
        title: portfolioItemTitle,
        description: portfolioItemDesc,
        category: portfolioItemCategory,
        proofDocumentId: document.id,
        verified: true,
        xpAwarded: 50,
    });

    // 3. Award 50 XP to the user
    await db.update(users).set({ 
        totalXp: sql`${users.totalXp} + 50` 
    }).where(eq(users.id, document.userId));

    console.log(`[Worker] Document ${document.id} verified successfully. Awarded 50 XP to user ${document.userId}.`);
}

export { documentQueue };
