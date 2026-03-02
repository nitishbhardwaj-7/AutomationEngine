import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function generateDescription(name, category) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
      Write a professional e-commerce product description.

      Product Name: ${name}
      Category: ${category}

      Keep it under 120 words.
    `
  });

  return response.text;
}