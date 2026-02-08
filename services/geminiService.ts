
import { GoogleGenAI, Type } from "@google/genai";
import { Question, ChatMessage } from "../types";

export const generateQuestionsFromGoal = async (goal: string): Promise<Question[]> => {
  // Fix: Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Fix: Upgraded to gemini-3-pro-preview for complex reasoning task.
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Act as a senior user researcher for Formly AI. Based on the following organizational goal, generate 5 highly effective, evidence-aware questions for a form/interview.
    
    Goal: ${goal}
    
    The output must be JSON format. Include a mix of qualitative (text) and quantitative (scale/choice) questions. For some questions, suggest a short "requiredEvidence" snippet (1-2 sentences) the respondent should acknowledge understanding before answering.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            text: { type: Type.STRING },
            type: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            requiredEvidence: { type: Type.STRING }
          },
          required: ["id", "text", "type"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Failed to parse questions", error);
    return [];
  }
};

/**
 * ADAPTIVE QUESTIONING
 * Generates a follow-up probe based on the current conversation context.
 */
export const generateAdaptiveProbe = async (
  goal: string,
  history: ChatMessage[],
  currentQuestion: string
): Promise<string> => {
  const context = history.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
  
  // Fix: Create a new GoogleGenAI instance right before making an API call.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are an expert interviewer for Formly AI. 
    Goal: ${goal}
    Current Question Context: ${currentQuestion}
    Conversation History:
    ${context}

    Your task:
    If the last user response was brief or lacks depth, generate a polite but probing follow-up question.
    If the response was comprehensive, acknowledge it and ask the user to wait for the next section.
    Keep it conversational, professional, and insight-focused. 
    Return ONLY the text of your response.`,
  });

  return response.text || "Could you expand on that perspective within the context of our strategic goal?";
};

/**
 * NARRATIVE THEME EXTRACTION
 * Identifies recurring semantic patterns and themes from a response.
 */
export const extractNarrativeThemes = async (text: string): Promise<{ theme: string; weight: number }[]> => {
  // Fix: Create a new GoogleGenAI instance right before making an API call.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Fix: Upgraded to gemini-3-pro-preview for complex analytical task.
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Extract the primary narrative themes from the following response. For each theme, provide a confidence weight between 0 and 1.
    
    Response: "${text}"
    
    Return the result as a JSON array of objects with "theme" (string) and "weight" (number).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            theme: { type: Type.STRING },
            weight: { type: Type.NUMBER }
          },
          required: ["theme", "weight"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
};

/**
 * STRATEGIC OUTLIER DETECTION
 * Identifies responses that semantically conflict with the organizational goal.
 */
export const detectStrategicOutliers = async (goal: string, responses: string[]): Promise<{ responseIdx: number; reason: string; risk: number }[]> => {
  // Fix: Create a new GoogleGenAI instance right before making an API call.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Fix: Upgraded to gemini-3-pro-preview for advanced reasoning.
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `You are an organizational risk detection engine.
    Goal: "${goal}"
    Responses: ${JSON.stringify(responses.map((r, i) => ({ id: i, text: r })))}
    
    Identify any responses that indicate significant strategic drift, dissent, or fundamental misunderstanding of the goal.
    Return a JSON array of outliers.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            responseIdx: { type: Type.NUMBER },
            reason: { type: Type.STRING },
            risk: { type: Type.NUMBER }
          },
          required: ["responseIdx", "reason", "risk"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
};

export const analyzeResponses = async (goal: string, responses: any[]): Promise<string> => {
  // Fix: Create a new GoogleGenAI instance right before making an API call.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Fix: Upgraded to gemini-3-pro-preview for high-quality executive synthesis.
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analyze these responses for the project goal: "${goal}".
    
    Responses: ${JSON.stringify(responses)}
    
    Identify:
    1. Key themes of alignment.
    2. Significant outliers or strategic dissent.
    3. Actionable decision-ready insights.
    
    Format the output as professional markdown.`,
  });

  return response.text || "Analysis failed.";
};

/**
 * SEMANTIC EMBEDDING (Mock implementation for vector storage simulation)
 */
export const getSemanticEmbedding = async (text: string): Promise<number[]> => {
  // In a real implementation, this would call 'text-embedding-004'
  // We simulate a 768-dimension vector
  return Array.from({ length: 768 }, () => Math.random() * 2 - 1);
};
