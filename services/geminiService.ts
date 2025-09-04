import { GoogleGenAI, Modality } from "@google/genai";

let ai: GoogleGenAI | null = null;

// This function initializes the AI client on the first call,
// preventing a crash on app load if the API key isn't immediately ready.
const getAIClient = (): GoogleGenAI => {
    if (ai) {
        return ai;
    }
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai;
};


export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
  const client = getAIClient();
  const response = await client.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/png',
      aspectRatio: '4:3', // To match canvas ratio 800x600
    },
  });

  if (!response.generatedImages || response.generatedImages.length === 0) {
    throw new Error("Image generation failed, no images were returned from the API.");
  }

  const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
  return `data:image/png;base64,${base64ImageBytes}`;
};

const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

export const removeImageBackground = async (base64ImageData: string): Promise<string> => {
  try {
    // Dynamically import the module only when needed to prevent app crash on load
    const { removeBackground } = await import("@imgly/background-removal");
    
    const blob = await removeBackground(base64ImageData, {
        publicPath: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.3.1/dist/assets/'
    });
    const dataUrl = await blobToDataURL(blob);
    return dataUrl;
  } catch (error) {
    console.error("Error removing background with @imgly/background-removal:", error);
    throw new Error("Failed to remove background using the code-based method.");
  }
};

export const removeImageBackgroundAI = async (base64ImageData: string): Promise<string> => {
    const mimeType = base64ImageData.substring(base64ImageData.indexOf(":") + 1, base64ImageData.indexOf(";"));
    const pureBase64 = base64ImageData.split(',')[1];
    
    try {
        const client = getAIClient();
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: pureBase64,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: 'Task: Background removal. Input: Image. Action: Identify the primary subject and completely remove the background, replacing it with transparency. Output requirements: Return a PNG image. The background must be a true transparent alpha channel. Do not simulate transparency with a white or other colored background.',
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
    
        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
            const base64ImageBytes: string = imagePart.inlineData.data;
            const newMimeType = imagePart.inlineData.mimeType;
            return `data:${newMimeType};base64,${base64ImageBytes}`;
        } else {
             throw new Error("AI did not return an image. It might have returned text instead.");
        }
    } catch (error) {
        console.error("Error removing background with AI:", error);
        throw new Error("Failed to remove background using the AI method.");
    }
};