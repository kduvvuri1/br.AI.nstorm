"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GOOGLE_API_KEY) {
  throw new Error("Missing GOOGLE_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function transcribeAudio(audioUrl: string): Promise<string> {
  try {
    if (!audioUrl || !audioUrl.startsWith("http")) {
      return "This file doesn't contain any audio content.";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `
    Please transcribe this meeting audio accurately and:
    1. Include all spoken words
    2. Note speaker changes if detectable
    3. Remove filler words (um, ah, like)
    4. Format with paragraphs for readability
    
    Audio: ${audioUrl}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return cleanTranscription(text);
  } catch (error: any) {
    console.error('Transcription error:', error);
    if (error.message.includes('API_KEY_INVALID')) {
      throw new Error('Invalid Google API key');
    }
    return "Unable to process audio content.";
  }
}

function cleanTranscription(text: string): string {
  return text
    .replace(/\[\d{2}:\d{2}:\d{2}\]/g, '') // Remove timestamps
    .replace(/\n{3,}/g, '\n\n')             // Remove extra newlines
    .trim();
}