import { GoogleGenAI, Modality, Type } from "@google/genai";
import { VoiceName } from "../types";

// Initialize Gemini Client
// WARNING: API_KEY must be available in process.env
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Generate a creative script for lip-syncing
 */
export const generateScript = async (topic: string, mood: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, viral-worthy script (max 30 seconds spoken) for a lip-sync video in Arabic.
      Topic: ${topic}. 
      Mood: ${mood}. 
      Format: Return ONLY the spoken Arabic text, no scene descriptions or stage directions.`,
    });
    return response.text || "فشل في توليد النص.";
  } catch (error) {
    console.error("Script generation error:", error);
    throw error;
  }
};

/**
 * Generate Speech from Text (TTS)
 */
export const generateSpeech = async (text: string, voice: VoiceName, style: string = 'Normal'): Promise<string> => {
  try {
    // Prefix the text with style instruction if it's not Normal
    const promptText = style !== 'Normal' ? `Say in a ${style} tone: ${text}` : text;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");
    return base64Audio;
  } catch (error) {
    console.error("Speech generation error:", error);
    throw error;
  }
};

/**
 * Generate an Avatar Image
 */
export const generateAvatar = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A high quality portrait of a character suitable for a lip sync video. 
            The character should be facing forward, looking at the camera, with a neutral or slightly speaking expression.
            Style: ${prompt}`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
};

/**
 * Generate Video using Veo
 */
export const generateVideo = async (prompt: string, imageBase64?: string): Promise<string> => {
  // Create a new instance to ensure we capture the latest API key if selected via UI
  const aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  try {
    let operation;
    
    // Clean base64 string if provided (remove data:image/png;base64, prefix)
    const cleanBase64 = imageBase64 ? imageBase64.split(',')[1] : undefined;

    if (cleanBase64) {
      operation = await aiClient.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt: prompt, 
        image: {
          imageBytes: cleanBase64,
          mimeType: 'image/png', 
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });
    } else {
      operation = await aiClient.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '16:9'
        }
      });
    }

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5 seconds
      operation = await aiClient.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed");

    // We must append the API key to fetch the video content
    return `${videoUri}&key=${process.env.API_KEY}`;
  } catch (error) {
    console.error("Video generation error:", error);
    throw error;
  }
};

export const getGeminiClient = () => ai;