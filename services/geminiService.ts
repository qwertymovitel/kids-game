import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini
// Note: In a real production app, you might proxy this through a backend to protect the key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const OFFLINE_PRAISE = [
  "You are a superstar! 🌟",
  "That looked amazing! ✨",
  "Great job, buddy! 🎈",
  "You're a fast learner! 🚀",
  "Perfect! Keep going! 🌈",
  "Wonderful hand shapes! ✋",
  "You are doing so well! 🏆"
];

const getRandomPraise = () => OFFLINE_PRAISE[Math.floor(Math.random() * OFFLINE_PRAISE.length)];

export const verifySign = async (
  imageBase64: string,
  targetLabel: string
): Promise<{ correct: boolean; feedback: string }> => {
  // 1. Offline Fallback: If no internet, simulate a positive response so the kid can still play.
  if (!navigator.onLine) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate "thinking"
    return {
      correct: true,
      feedback: `${getRandomPraise()} (Offline Mode)`
    };
  }

  try {
    const prompt = `
      You are a friendly, encouraging teacher for children learning American Sign Language (ASL).
      The child is trying to sign: "${targetLabel}".
      Look at the image provided. Is the hand shape roughly correct for "${targetLabel}"?
      Be lenient because they are children (3-10 years old) and might have small hands or imperfect coordination.
      
      Respond in JSON format:
      {
        "correct": boolean,
        "feedback": "Simple, encouraging sentence for a child. If wrong, give a tiny hint."
      }
    `;

    // Strip header if present (data:image/jpeg;base64,)
    const cleanBase64 = imageBase64.split(',')[1] || imageBase64;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                correct: { type: Type.BOOLEAN },
                feedback: { type: Type.STRING }
            }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text);
    return result;

  } catch (error) {
    console.error("Error verifying sign:", error);
    // Fallback on error to keep the child happy
    return {
      correct: true,
      feedback: "I think that looked amazing! Good try!"
    };
  }
};

export const getEncouragement = async (lessonLabel: string): Promise<string> => {
    if (!navigator.onLine) return "You are a superstar!";
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Write a very short, fun fact about the word or letter "${lessonLabel}" for a 5 year old kid. Max 10 words.`,
        });
        return response.text || "You are doing great!";
    } catch (e) {
        return "Keep up the good work!";
    }
}