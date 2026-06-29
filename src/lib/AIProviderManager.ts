import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import IORedis from "ioredis";
import crypto from "crypto";

export interface AIHistoryMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AIGenerateOptions {
  systemInstruction: string;
  prompt: string;
  history?: AIHistoryMessage[];
  isJson?: boolean;
  isComplex?: boolean;
  mediaData?: {
    mimeType: string;
    data: string; // base64
  };
  preferredOrder?: ("gemini" | "deepseek" | "cohere")[];
}

export class AIProviderManagerService {
  private geminiAi: GoogleGenAI | null = null;
  private redis: IORedis | null = null;

  private readonly HEALTH_RETRY_MS = 60 * 1000; // 1 minute cooldown
  private readonly TIMEOUT_MS = 30 * 1000; // 30s timeout

  private providerStatus: Record<string, { isHealthy: boolean; lastFailureTime: number; limit: number }> = {
    gemini: { isHealthy: true, lastFailureTime: 0, limit: 1500 },
    deepseek: { isHealthy: true, lastFailureTime: 0, limit: 5000 },
    cohere: { isHealthy: true, lastFailureTime: 0, limit: 30 }
  };

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      this.redis = new IORedis(redisUrl);
      this.redis.on('error', (err) => console.error('Redis Client Error in AIProviderManager', err));
    }
  }

  private getGeminiAi(): GoogleGenAI {
    if (!this.geminiAi) {
      this.geminiAi = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return this.geminiAi;
  }

  private getQuotaKey(provider: string): string {
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `ai_quota:${provider}:${dateStr}`;
  }

  private async checkQuota(provider: string, limit: number): Promise<boolean> {
    if (!this.redis) return true;
    try {
      const key = this.getQuotaKey(provider);
      const valStr = await this.redis.get(key);
      if (valStr) {
        const val = parseInt(valStr, 10);
        if (val >= limit) {
          console.warn(`[AI Provider Quota] Quota exceeded for ${provider}: ${val}/${limit}`);
          return false;
        }
      }
      return true;
    } catch (err) {
      console.error(`Error checking quota for ${provider}:`, err);
      return true; // proceed in case of transient Redis errors
    }
  }

  private async incrementQuota(provider: string): Promise<void> {
    if (!this.redis) return;
    try {
      const key = this.getQuotaKey(provider);
      const val = await this.redis.incr(key);
      if (val === 1) {
        await this.redis.expire(key, 24 * 3600); // 24 hours TTL on first increment
      }
    } catch (err) {
      console.error(`Error incrementing quota for ${provider}:`, err);
    }
  }

  private async fetchWithRetry(
    url: string,
    fetchOptions: RequestInit,
    timeoutMs: number = 30000,
    retries: number = 2,
    delayMs: number = 3000
  ): Promise<Response> {
    let lastError: any = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal
        });
        clearTimeout(id);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API error: ${res.status} ${text}`);
        }
        return res;
      } catch (err: any) {
        clearTimeout(id);
        lastError = err;
        console.warn(`Attempt ${attempt} to ${url} failed: ${err.message || err}`);
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }
    throw lastError || new Error(`Failed after ${retries} retries`);
  }

  private withTimeout<T>(promise: Promise<T>, ms: number, providerName: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Timeout: ${providerName} took longer than ${ms}ms`));
      }, ms);
      
      promise.then(
        (res) => {
          clearTimeout(timeoutId);
          resolve(res);
        },
        (err) => {
          clearTimeout(timeoutId);
          reject(err);
        }
      );
    });
  }

  public async generateContent(options: AIGenerateOptions): Promise<string> {
    const now = Date.now();
    let lastError: any = null;

    // Use preferredOrder if specified, or default fallback chain
    const order = options.preferredOrder || ["gemini", "deepseek", "cohere"];

    for (const providerName of order) {
      const status = this.providerStatus[providerName];
      if (!status) continue;

      // Check circuit breaker status
      if (!status.isHealthy) {
        if (now - status.lastFailureTime < this.HEALTH_RETRY_MS) {
          console.log(`[AI Provider] Skipping ${providerName} (unhealthy cooldown)`);
          continue;
        } else {
          console.log(`[AI Provider] Retrying previously failed provider ${providerName}`);
          status.isHealthy = true;
        }
      }

      // Check quota BEFORE making API call
      const hasQuota = await this.checkQuota(providerName, status.limit);
      if (!hasQuota) {
        continue; // skip to next provider
      }

      try {
        console.log(`[AI Provider] Attempting generation with ${providerName}`);
        
        let result: string;
        if (providerName === "gemini") {
          result = await this.withTimeout(this.executeGemini(options), this.TIMEOUT_MS, "Gemini");
        } else if (providerName === "deepseek") {
          result = await this.callDeepSeek(options);
        } else if (providerName === "cohere") {
          result = await this.callCohere(options);
        } else {
          continue;
        }

        // Increment quota on successful call
        await this.incrementQuota(providerName);

        console.log(`[AI Provider] Successfully handled by: ${providerName}`);
        return result;
      } catch (error: any) {
        console.error(`[AI Provider Error - ${providerName}] Failed: ${error?.message || error}`);
        status.isHealthy = false;
        status.lastFailureTime = Date.now();
        lastError = error;
      }
    }

    console.error(`[AI Provider Circuit Breaker] All AI providers failed or hit quota.`);
    // ALWAYS return errors as { error_code: string, user_friendly_message: string }
    const fallbackResponse = JSON.stringify({
      error_code: "AI_UNAVAILABLE",
      user_friendly_message: "AI services are at capacity. Please try again in a few minutes."
    });
    
    // Throw error containing structured format to allow proper catching in API handlers
    const errObj: any = new Error(fallbackResponse);
    errObj.error_code = "AI_UNAVAILABLE";
    errObj.user_friendly_message = "AI services are at capacity. Please try again in a few minutes.";
    throw errObj;
  }

  private async executeGemini(options: AIGenerateOptions): Promise<string> {
    const aiClient = this.getGeminiAi();
    
    // Prioritize high-quality PRO model for complex queries, else fallback to flash
    const modelsToTry = options.isComplex 
        ? ["gemini-3.1-pro-preview", "gemini-3.5-flash"] 
        : ["gemini-3.5-flash", "gemini-3.1-pro-preview"];

    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`[AI Provider] Attempting Gemini with model: ${modelName}`);
        
        const config: any = {
          systemInstruction: options.systemInstruction,
        };

        if (options.isJson) {
          config.responseMimeType = "application/json";
        }

        // Enable high thinking for complex queries on pro model
        if (options.isComplex && modelName.includes('pro')) {
            config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
        }

        if (options.history && options.history.length > 0) {
          const formattedHistory = options.history.map((msg) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          }));
          
          const chat = aiClient.chats.create({
            model: modelName,
            history: formattedHistory,
            config
          });
          const response = await chat.sendMessage({ message: options.prompt });
          return response.text;
        } else {
          let contents: any = options.prompt;
          if (options.mediaData) {
            contents = [
              {
                inlineData: {
                  mimeType: options.mediaData.mimeType,
                  data: options.mediaData.data,
                }
              },
              { text: options.prompt }
            ];
          }

          const response = await aiClient.models.generateContent({
            model: modelName,
            contents,
            config
          });
          return response.text.trim();
        }
      } catch (err: any) {
        console.warn(`[AI Provider] Gemini model ${modelName} failed: ${err?.message || err}`);
        lastError = err;
      }
    }

    throw lastError || new Error("All Gemini models in the chain failed.");
  }

  public async callDeepSeek(options: AIGenerateOptions): Promise<string> {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY is not set");
    }

    const messages: { role: string; content: string }[] = [];
    if (options.systemInstruction) {
      messages.push({ role: "system", content: options.systemInstruction });
    }

    if (options.history) {
      for (const msg of options.history) {
        messages.push({
          role: msg.role === "model" ? "assistant" : "user",
          content: msg.text
        });
      }
    }

    messages.push({ role: "user", content: options.prompt });

    const body: any = {
      model: "deepseek-chat",
      messages
    };

    if (options.isJson) {
      body.response_format = { type: "json_object" };
    }

    const res = await this.fetchWithRetry(
      "https://api.deepseek.com/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(body)
      },
      30000, // 30 seconds
      2, // 2 retries
      3000 // 3 seconds delay
    );

    const data = await res.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content || "";
    }
    throw new Error("Unexpected DeepSeek API response structure");
  }

  public async callCohere(options: AIGenerateOptions): Promise<string> {
    const apiKey = process.env.COHERE_API_KEY;
    if (!apiKey) {
      throw new Error("COHERE_API_KEY is not set");
    }

    const chat_history: { role: "USER" | "CHATBOT"; message: string }[] = [];
    if (options.history) {
      for (const msg of options.history) {
        chat_history.push({
          role: msg.role === "model" ? "CHATBOT" : "USER",
          message: msg.text
        });
      }
    }

    const body: any = {
      message: options.prompt,
      model: "command-r"
    };

    if (options.systemInstruction) {
      body.preamble = options.systemInstruction;
    }

    if (chat_history.length > 0) {
      body.chat_history = chat_history;
    }

    if (options.isJson) {
      body.response_format = { type: "json_object" };
    }

    const res = await this.fetchWithRetry(
      "https://api.cohere.com/v1/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "X-Client-Name": "TeenLaunch"
        },
        body: JSON.stringify(body)
      },
      30000, // 30 seconds
      2, // 2 retries
      3000 // 3 seconds delay
    );

    const data = await res.json();
    if (data.text) {
      return data.text;
    }
    throw new Error("Unexpected Cohere API response structure");
  }

  private getEmbedCacheKey(text: string): string {
    const hash = crypto.createHash('sha256').update(text).digest('hex');
    return `embed_cohere:${hash}`;
  }

  public async callCohereEmbed(texts: string[]): Promise<number[][]> {
    const apiKey = process.env.COHERE_API_KEY;
    if (!apiKey) {
      throw new Error("COHERE_API_KEY is not set");
    }

    const embeddings: (number[] | null)[] = new Array(texts.length).fill(null);

    // 1. Check Redis Cache
    if (this.redis) {
      try {
        const cacheKeys = texts.map(t => this.getEmbedCacheKey(t));
        const cachedVals = await this.redis.mget(...cacheKeys);
        for (let i = 0; i < texts.length; i++) {
          if (cachedVals[i]) {
            embeddings[i] = JSON.parse(cachedVals[i]!);
          }
        }
      } catch (err) {
        console.error("Redis embedding lookup failed", err);
      }
    }

    // 2. Identify uncached texts
    const uncachedIndices: number[] = [];
    for (let i = 0; i < texts.length; i++) {
      if (embeddings[i] === null) {
        uncachedIndices.push(i);
      }
    }

    // 3. Batch uncached texts up to 96 texts per call
    const BATCH_SIZE = 96;
    for (let i = 0; i < uncachedIndices.length; i += BATCH_SIZE) {
      const batchIndices = uncachedIndices.slice(i, i + BATCH_SIZE);
      const batchTexts = batchIndices.map(idx => texts[idx]);

      try {
        console.log(`[Cohere Embed] Batching ${batchTexts.length} texts to Cohere API`);
        const res = await this.fetchWithRetry(
          "https://api.cohere.com/v1/embed",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              texts: batchTexts,
              model: "embed-english-v3",
              input_type: "search_document",
              embedding_types: ["float"]
            })
          },
          30000,
          2,
          3000
        );

        const data = await res.json();
        let batchEmbeds: number[][] = [];
        if (data.embeddings && data.embeddings.float) {
          batchEmbeds = data.embeddings.float;
        } else if (Array.isArray(data.embeddings)) {
          batchEmbeds = data.embeddings;
        }

        if (batchEmbeds.length !== batchTexts.length) {
          throw new Error("Mismatch in received embeddings count from Cohere API");
        }

        // Save to result array & cache to Redis (30-day TTL)
        for (let b = 0; b < batchIndices.length; b++) {
          const idx = batchIndices[b];
          const embed = batchEmbeds[b];
          embeddings[idx] = embed;

          if (this.redis) {
            try {
              const cacheKey = this.getEmbedCacheKey(texts[idx]);
              await this.redis.set(cacheKey, JSON.stringify(embed), "EX", 30 * 24 * 3600);
            } catch (redisErr) {
              console.error("Redis embedding save failed", redisErr);
            }
          }
        }
      } catch (err) {
        console.error(`[Cohere Embed Error] Failed to generate embeddings for batch`, err);
        throw err;
      }
    }

    // Ensure all embeddings are resolved
    return embeddings.map((e, idx) => {
      if (!e) {
        throw new Error(`Embedding unresolved at index ${idx} for text: "${texts[idx]}"`);
      }
      return e;
    });
  }
}

export const aiProviderManager = new AIProviderManagerService();
