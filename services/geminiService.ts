
import { GoogleGenAI, Type } from "@google/genai";
import { AISuggestion } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const suggestionSchema = {
  type: Type.OBJECT,
  properties: {
    status: {
      type: Type.STRING,
      description: "The suggested status of the item. Must be one of: 'Repairable', 'Scrap', or 'Needs Inspection'.",
      enum: ['Repairable', 'Scrap', 'Needs Inspection'],
    },
    recommendedAction: {
      type: Type.STRING,
      description: "A concise, actionable recommendation for what to do with the defective item.",
    },
  },
  required: ["status", "recommendedAction"],
};

export const getDefectSuggestions = async (defectDescription: string): Promise<AISuggestion> => {
  try {
    const prompt = `
      Analyze the following tool defect description and provide a suggested status and a recommended action.
      Defect Description: "${defectDescription}"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: suggestionSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    // Basic validation to ensure the response matches the expected structure.
    if (parsedJson.status && parsedJson.recommendedAction) {
        return parsedJson as AISuggestion;
    } else {
        throw new Error("AI response is missing required fields.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get suggestions from AI. Please try again.");
  }
};
