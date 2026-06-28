import { aiProviderManager } from "./src/lib/AIProviderManager.ts";

async function run() {
  console.log("GEMINI_API_KEY exists:", !!process.env.GEMINI_API_KEY);
  console.log("GEMINI_API_KEY length:", process.env.GEMINI_API_KEY?.length || 0);
  console.log("SQL_HOST exists:", !!process.env.SQL_HOST);
  console.log("SQL_USER exists:", !!process.env.SQL_USER);
  console.log("SQL_DB_NAME exists:", !!process.env.SQL_DB_NAME);

  try {
    console.log("Testing simple content generation...");
    const res = await aiProviderManager.generateContent({
      prompt: "Hello, reply with exactly the word 'OK'",
      systemInstruction: "You are a helpful assistant."
    });
    console.log("Gemini response:", res);
  } catch (err: any) {
    console.error("Gemini call failed:", err);
  }
}

run();
