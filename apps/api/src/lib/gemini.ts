import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is required");
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export function getModel(modelName = "gemini-2.5-flash") {
  return genAI.getGenerativeModel({ model: modelName });
}

export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<T> {
  const model = getModel();
  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\nUser Input: ${userPrompt}` }],
      },
    ],
  });

  const text = result.response.text();

  // Extract JSON from markdown code blocks if present
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = jsonMatch ? jsonMatch[1] : text;

  try {
    return JSON.parse(jsonText.trim()) as T;
  } catch {
    // Try to extract first JSON object/array
    const objectMatch = jsonText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (objectMatch) {
      return JSON.parse(objectMatch[1]) as T;
    }
    throw new Error(`Failed to parse Gemini response as JSON: ${text.substring(0, 200)}`);
  }
}

export async function* generateStream(
  systemPrompt: string,
  userPrompt: string
): AsyncGenerator<string> {
  const model = getModel();
  const result = await model.generateContentStream({
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\nUser Input: ${userPrompt}` }],
      },
    ],
  });

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) yield text;
  }
}
