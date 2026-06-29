import { Worker } from 'bullmq';
import puppeteer from 'puppeteer';
import crypto from 'crypto';
import { db, pool } from './db/index.ts';
import { opportunities } from './db/schema.ts';
import { eq } from 'drizzle-orm';
import { aiProviderManager } from './lib/AIProviderManager.ts';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  // add password if required in your environment
};

console.log("Starting Crawler Worker...");

const worker = new Worker('crawlerQueue', async job => {
  const { url, sourceName } = job.data;
  console.log(`[Crawler] Starting job for URL: ${url}`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    // Simulate real user to avoid immediate blocking
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    
    console.log(`[Crawler] Fetching page content...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Extract inner text to avoid massive HTML payloads hitting Gemini token limits
    // We could extract outerHTML if needed, but innerText is cleaner for extracting semantic data
    const rawContent = await page.evaluate(() => {
      // Basic cleaning: remove script/style tags if we were grabbing HTML
      // But document.body.innerText naturally ignores invisible elements
      return document.body.innerText.substring(0, 15000); // Limit length to avoid blowing up context window
    });

    console.log(`[Crawler] Extracted ${rawContent.length} characters. Sending to Gemini for Validation & Structured Extraction...`);

    // Gemini Processing layer
    const systemPrompt = `You are a data extraction AI for TeenLaunch, an opportunity discovery platform for students. 
You will be provided with raw text scraped from a university or career portal.
Extract ANY scholarships, internships, or student opportunities found in the text.
If no opportunities are found, return an empty array [].

For each opportunity found, output a JSON object in this exact schema, enclosed in an array. 
Output ONLY valid JSON, no markdown formatting blocks.
[
  {
    "title": "Full name of opportunity",
    "description": "2-3 sentence summary",
    "category": "One of: Scholarship, Internship, Research, Volunteer, Hackathon",
    "deadline": "YYYY-MM-DD or 'Rolling'",
    "organization": "Sponsoring org/university",
    "eligibility": "Brief eligibility string",
    "applicationUrl": "URL to apply (use the provided base URL if relative)",
    "isRemote": true or false,
    "competitionLevel": "Low, Medium, or High",
    "gradeLevel": "e.g. High School Juniors/Seniors"
  }
]`;

    const aiResult = await aiProviderManager.generateContent({
      systemInstruction: systemPrompt,
      prompt: `Base URL: ${url}\n\nRaw Scraped Text:\n${rawContent}`,
      isComplex: true,
      isJson: true
    });

    let parsedOps: any[] = [];
    try {
      const cleanJsonStr = aiResult.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedOps = JSON.parse(cleanJsonStr);
    } catch (e) {
      console.error("[Crawler] Failed to parse JSON from AI response:", aiResult);
      throw new Error("AI extraction failed to produce valid JSON");
    }

    if (!Array.isArray(parsedOps) || parsedOps.length === 0) {
      console.log(`[Crawler] No opportunities found on ${url}`);
      return;
    }

    console.log(`[Crawler] Extracted ${parsedOps.length} opportunities. Validating and deduplicating...`);

    // Deduplication & Insertion Layer
    for (const op of parsedOps) {
      // 1. Basic Validation
      if (!op.title || !op.description || !op.organization) {
        console.warn(`[Crawler] Skipping invalid opportunity: ${op.title}`);
        continue;
      }

      // 2. Hash generation for quick deduplication
      // A more robust approach uses the pgvector similarity, but deterministic hashing is a good first pass
      const dedupeString = `${op.title.toLowerCase().trim()}|${op.organization.toLowerCase().trim()}`;
      const dedupeHash = crypto.createHash('sha256').update(dedupeString).digest('hex');

      // Check DB
      const existing = await db.select({ id: opportunities.id }).from(opportunities).where(eq(opportunities.dedupeHash, dedupeHash));
      
      if (existing.length > 0) {
        console.log(`[Crawler] Duplicate found (Hash: ${dedupeHash}). Skipping: ${op.title}`);
        continue;
      }

      // 3. Insert
      console.log(`[Crawler] Inserting new opportunity: ${op.title}`);
      await db.insert(opportunities).values({
        title: op.title,
        description: op.description,
        category: op.category || 'Other',
        deadline: op.deadline || 'Rolling',
        organization: op.organization,
        eligibility: op.eligibility || 'See website',
        applicationUrl: op.applicationUrl || url,
        isRemote: op.isRemote || false,
        competitionLevel: op.competitionLevel || 'Medium',
        gradeLevel: op.gradeLevel || 'All',
        source: sourceName || 'crawler_worker',
        dedupeHash: dedupeHash,
        isVerified: true, // we assume crawled institutional data has high trust
        trustScore: 90,
        discoveryDate: new Date(),
      });
    }

    console.log(`[Crawler] Job completed for ${url}`);
  } catch (error) {
    console.error(`[Crawler] Error processing ${url}:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}, { connection });

worker.on('failed', (job, err) => {
  console.error(`[Crawler Worker] Job ${job?.id} failed with error ${err.message}`);
});

process.on('SIGINT', async () => {
  console.log("Shutting down worker...");
  await worker.close();
  await pool.end();
  process.exit(0);
});
