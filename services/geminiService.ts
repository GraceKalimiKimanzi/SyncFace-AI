
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Character, AnalysisResult } from "../types";

export const analyzeMedia = async (
  image: { data: string; mimeType: string },
  audio: { data: string; mimeType: string }
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Analyze the provided image and audio. 
    1. Identify all distinct characters/people in the image. For each, provide a short descriptive name and their bounding box in [ymin, xmin, ymax, xmax] format where 0-1000 covers the full image.
    2. Transcribe the audio clip exactly.
    
    Return the result in JSON format following this schema:
    {
      "characters": [{"name": string, "description": string, "box_2d": [number, number, number, number]}],
      "audioTranscript": string
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: image.data, mimeType: image.mimeType } },
        { inlineData: { data: audio.data, mimeType: audio.mimeType } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          characters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                box_2d: { 
                  type: Type.ARRAY, 
                  items: { type: Type.NUMBER },
                  minItems: 4,
                  maxItems: 4
                }
              },
              required: ["name", "description", "box_2d"]
            }
          },
          audioTranscript: { type: Type.STRING }
        },
        required: ["characters", "audioTranscript"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return {
      characters: data.characters.map((c: any, i: number) => ({ ...c, id: `char-${i}` })),
      audioTranscript: data.audioTranscript
    };
  } catch (e) {
    console.error("Failed to parse analysis result", e);
    throw new Error("Failed to analyze media content");
  }
};

export const generateLipSyncVideo = async (
  image: { data: string; mimeType: string },
  selectedCharacter: Character,
  transcript: string
): Promise<string> => {
  // Check for API key selection for Veo models
  // @ts-ignore
  const hasKey = await window.aistudio.hasSelectedApiKey();
  if (!hasKey) {
    // @ts-ignore
    await window.aistudio.openSelectKey();
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Create a high-quality video starting from this image where the character "${selectedCharacter.name}" (${selectedCharacter.description}) is speaking. 
    The lips should move in perfect sync with these spoken words: "${transcript}". 
    Focus on the facial expressions and realistic mouth movements of that specific character while others remain relatively still or react naturally.
    The video should be vivid and maintain the lighting and style of the original image.
  `;

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: {
      imageBytes: image.data,
      mimeType: image.mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    // @ts-ignore
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed to return a URI");

  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
