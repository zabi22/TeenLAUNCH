import { GoogleGenAI, ThinkingLevel } from "@google/genai";

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
}

interface ProviderConfig {
  name: string;
  execute: (options: AIGenerateOptions) => Promise<string>;
  isHealthy: boolean;
  lastFailureTime: number;
}

export class AIProviderManagerService {
  private geminiAi: GoogleGenAI | null = null;
  private providers: ProviderConfig[] = [];
  
  // Health check config
  private readonly HEALTH_RETRY_MS = 60 * 1000; // 1 minute before retrying a failed provider
  private readonly TIMEOUT_MS = 30 * 1000; // 30s timeout for each provider

  constructor() {
    this.initProviders();
  }

  private initProviders() {
    // 1. Gemini
    this.providers.push({
      name: "Gemini",
      isHealthy: true,
      lastFailureTime: 0,
      execute: async (options) => this.executeGemini(options),
    });

    // 2. Groq
    this.providers.push({
      name: "Groq",
      isHealthy: true,
      lastFailureTime: 0,
      execute: async (options) => this.executeGroq(options),
    });

    // 3. OpenRouter
    this.providers.push({
      name: "OpenRouter",
      isHealthy: true,
      lastFailureTime: 0,
      execute: async (options) => this.executeOpenRouter(options),
    });
  }

  private getGeminiAi(): GoogleGenAI {
    if (!this.geminiAi) {
      if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY not set.");
      }
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

    for (const provider of this.providers) {
      // Check health
      if (!provider.isHealthy) {
        if (now - provider.lastFailureTime < this.HEALTH_RETRY_MS) {
          console.log(`[AI Provider] Skipping ${provider.name} (unhealthy)`);
          continue; // Skip if it's still in cooldown
        } else {
          // Time to retry
          console.log(`[AI Provider] Retrying previously failed provider ${provider.name}`);
          provider.isHealthy = true;
        }
      }

      try {
        console.log(`[AI Provider] Attempting generation with ${provider.name}`);
        const result = await this.withTimeout(
          provider.execute(options), 
          this.TIMEOUT_MS, 
          provider.name
        );
        console.log(`[AI Provider] Successfully handled by: ${provider.name}`);
        return result;
      } catch (error) {
        console.error(`[AI Provider] ${provider.name} failed:`, error instanceof Error ? error.message : error);
        provider.isHealthy = false;
        provider.lastFailureTime = Date.now();
        lastError = error;
      }
    }

    throw new Error(`All AI providers failed. Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
  }

  private async executeGemini(options: AIGenerateOptions): Promise<string> {
    const aiClient = this.getGeminiAi();
    
    const modelsToTry = options.isComplex 
      ? ["gemini-3.1-pro-preview", "gemini-2.5-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite"]
      : ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-3.1-flash-lite"];

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

        // Only include thinkingConfig on 3.1-pro-preview
        if (options.isComplex && modelName === "gemini-3.1-pro-preview") {
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
          const response = await aiClient.models.generateContent({
            model: modelName,
            contents: options.prompt,
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

  private async executeGroq(options: AIGenerateOptions): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY not set");

    const messages = [
      { role: "system", content: options.systemInstruction }
    ];
    
    if (options.history) {
      options.history.forEach(m => {
        messages.push({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text });
      });
    }
    
    messages.push({ role: "user", content: options.prompt });

    const groqModels = [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "mixtral-8x7b-32768"
    ];

    let lastError = null;
    for (const model of groqModels) {
      try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model,
            messages,
            response_format: options.isJson ? { type: "json_object" } : undefined
          })
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Groq API error (${model}): ${res.status} ${text}`);
        }
        
        const data = await res.json();
        if (data.choices && data.choices.length > 0) {
           return data.choices[0].message.content;
        }
        throw new Error("No choices returned from Groq");
      } catch (err) {
        lastError = err;
        console.warn(`[AI Provider] Groq model ${model} failed, trying next...`);
      }
    }

    throw lastError || new Error("All Groq models failed");
  }

  private async executeOpenRouter(options: AIGenerateOptions): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

    const messages = [
      { role: "system", content: options.systemInstruction }
    ];
    
    if (options.history) {
      options.history.forEach(m => {
        messages.push({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text });
      });
    }
    
    messages.push({ role: "user", content: options.prompt });

    const modelsToTry = [
      "google/gemma-4-31b-it:free",
      "qwen/qwen3-coder:free",
      "openai/gpt-oss-120b:free",
      "qwen/qwen-2.5-coder-32b-instruct:free",
      "google/gemma-2-9b-it:free",
      "meta-llama/llama-3.1-8b-instruct:free",
      "deepseek/deepseek-r1:free",
      "mistralai/mistral-7b-instruct:free"
    ];

    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://teenlaunch.app", 
            "X-Title": "TeenLaunch"
          },
          body: JSON.stringify({
            model: model,
            messages,
            response_format: options.isJson ? { type: "json_object" } : undefined
          })
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`OpenRouter API error (${model}): ${res.status} ${text}`);
        }
        
        const data = await res.json();
        if (data.choices && data.choices.length > 0) {
           return data.choices[0].message.content;
        }
        throw new Error("No choices returned from OpenRouter");
      } catch (err) {
        lastError = err;
        console.warn(`[AI Provider] OpenRouter model ${model} failed, trying next...`);
      }
    }

    throw lastError || new Error("All OpenRouter models failed");
  }
}

export const aiProviderManager = new AIProviderManagerService();
