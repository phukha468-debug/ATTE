import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const geminiService = {
  async generateTestQuestions(category: string, jobTitle: string) {
    const prompt = `Generate 5 multiple-choice questions for an AI competency test.
    Category: ${category}
    Target Job Title: ${jobTitle}
    The questions should evaluate practical knowledge of using AI in this role.
    Return the result as a JSON array of objects with: question, options (4 choices), correct_answer_index (0-3), and explanation.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correct_answer_index: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correct_answer_index", "explanation"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  },

  async evaluateMicroProject(projectDescription: string, jobTitle: string) {
    const prompt = `Evaluate the following AI micro-project proposal for a ${jobTitle}.
    Project: ${projectDescription}
    Criteria:
    1. Practicality (0-10)
    2. Expected ROI (0-10)
    3. AI Tool Selection (0-10)
    Provide a score out of 30 and a detailed feedback comment.
    Return as JSON with: score, feedback, and recommendations.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            recommendations: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["score", "feedback", "recommendations"]
        }
      }
    });

    return JSON.parse(response.text);
  }
};
