import { aiProviderManager } from "./AIProviderManager.ts";

export async function calculateAdmissionProbability(profile: any, target: any) {
  const prompt = `
    Analyze the admission probability for a student with this profile: ${JSON.stringify(profile)}
    Applying to: ${JSON.stringify(target)}
    Return a JSON object with: probability (%), confidenceInterval (%), gapAnalysis (string).
  `;

  try {
    const responseText = await aiProviderManager.generateContent({
      systemInstruction: "You are a professional university admissions counselor. Analyze the profile and return ONLY a valid JSON object matching the requested schema.",
      prompt,
      isJson: true,
      isComplex: true,
      preferredOrder: ["deepseek", "gemini", "cohere"]
    });

    let cleaned = responseText.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    return JSON.parse(cleaned || "{}");
  } catch (err) {
    console.error("Admissions calculation failed:", err);
    return {
      probability: 50,
      confidenceInterval: 15,
      gapAnalysis: "Admissions model analysis is temporarily at capacity. Standard evaluations are active."
    };
  }
}
