// server/src/services/aiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateAiContent(inputText, mode) {
  try {
    // 1. Force-clean the key
    const rawKey = (process.env.GOOGLE_GEMINI_API_KEY || "").trim();
    const cleanKey = rawKey.replace(/['"]+/g, ''); 

    // 2. Initialize the Official SDK
    const genAI = new GoogleGenerativeAI(cleanKey);
    
    // 3. The Working Model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 4. Prompt Logic
    let prompt = "";
    if (mode === 'flashcards') {
      prompt = `Analyze this text: "${inputText}". 
      Return ONLY a raw JSON array of 5 study flashcards with "question" and "answer" keys.
      Example: [{"question": "...", "answer": "..."}]`;
    } else {
      prompt = `Provide a concise, academic summary of this text in paragraph form: "${inputText}"`;
    }

    // 5. Execution
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error("AI returned an empty response.");
    return text;

  } catch (error) {
    console.error("AI Service Error:", error.message);
    throw error;
  }
}