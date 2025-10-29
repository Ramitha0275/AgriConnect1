import { GoogleGenAI } from "@google/genai";
import { MarketInfo, CropRecommendation, FarmConditions } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY as string });

function fileToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64,
      mimeType
    },
  };
}

const getLanguageName = (code: string): string => {
    const langMap: { [key: string]: string } = {
        en: 'English',
        hi: 'Hindi',
        ta: 'Tamil',
        te: 'Telugu',
        kn: 'Kannada',
        ml: 'Malayalam',
        bn: 'Bengali',
        mr: 'Marathi',
        gu: 'Gujarati',
        pa: 'Punjabi',
        or: 'Odia'
    };
    return langMap[code] || 'English';
}

export const generateAgriculturalGuide = async (topic: string, language: string): Promise<string> => {
  try {
    const langName = getLanguageName(language);
    const prompt = `Write a concise and practical best practice guide for "${topic}" aimed at small to medium-sized farms. Include actionable steps and key considerations. Format the response using markdown. IMPORTANT: Provide the entire response in the ${langName} language.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error generating guide:", error);
    return "Sorry, I couldn't generate a guide on that topic. Please try again.";
  }
};

export const analyzeCropImage = async (base64Image: string, mimeType: string, prompt: string, language: string): Promise<string> => {
  try {
    const langName = getLanguageName(language);
    const imagePart = fileToGenerativePart(base64Image, mimeType);
    const fullPrompt = {
        parts: [
            { text: `Analyze the provided crop image. The user asks: "${prompt}". Provide a helpful analysis based on what you can see in the image. If you cannot determine an answer from the image, say so clearly. Format the response using markdown. IMPORTANT: Provide the entire response in the ${langName} language.` },
            imagePart
        ]
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt
    });
    
    return response.text;
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "Sorry, I couldn't analyze the image. Please ensure it's a valid image file and try again.";
  }
};

export const findMarkets = async (query: string, language: string, location?: { lat: number; lon: number }): Promise<MarketInfo[]> => {
  try {
    const langName = getLanguageName(language);
    let prompt = `Find a comprehensive list of agricultural markets (mandis) or wholesale shops in India related to the query: "${query}". Please provide at least 5 results, and more if they are relevant. Aim for 5 to 10 results if possible. The names and addresses should be in a way that is locally understandable in ${langName}.`;
    if (location) {
      prompt += ` Prioritize markets near the location with latitude ${location.lat} and longitude ${location.lon}.`;
    }
    prompt += ` For each market found, provide its name, full address (including city and state), a phone number (this is crucial), its latitude and longitude, a direct Google Maps URL, and the current price for the relevant crop(s) in Indian Rupees (INR) per kg.`;
    prompt += ` \n\nIMPORTANT: Respond with ONLY a valid JSON array of objects. Do not include any text, explanation, or markdown formatting before or after the JSON array. Each object in the array should represent a market and have the following structure: { "name": string, "address": string, "city": string, "state": string, "phone": string | null, "latitude": number, "longitude": number, "googleMapsUrl": string, "crops": [{ "name": string, "price": number }] }`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
        }
    });

    if (!response.text) {
      throw new Error("The model returned an empty response. This might be due to content safety filters or the query being too broad. Please try a more specific search.");
    }

    const jsonString = response.text.trim();
    const cleanedJsonString = jsonString.replace(/^```json\s*|```$/g, '');
    const markets = JSON.parse(cleanedJsonString);
    
    if (!Array.isArray(markets)) {
        throw new Error("The response from the model was not a valid JSON array.");
    }

    return markets.map((market: any, index: number) => ({ ...market, id: Date.now() + index }));

  } catch (error) {
    console.error("Error finding markets:", error);
    throw new Error("Sorry, I couldn't find market data. The model may have returned an invalid format or an error occurred.");
  }
};

export const getFarmConditionsFromLocation = async (lat: number, lon: number, language: string): Promise<FarmConditions> => {
    try {
        const langName = getLanguageName(language);
        const prompt = `For the location with latitude ${lat} and longitude ${lon} in India, determine the following agricultural conditions:
- The city/town/village
- The district
- The state
- The dominant soil type in the area (choose from: Alluvial, Black, Red and Yellow, Laterite, Arid, Saline, Peaty, Forest, Loamy, Clay, Sandy)
- The average annual rainfall in millimeters (mm)
- The average annual temperature in Celsius (°C)

The names for city, district, and state should be in the ${langName} language.

IMPORTANT: Respond with ONLY a valid JSON object. Do not include any text, explanation, or markdown formatting before or after the JSON. The object must have this exact structure: { "city": string, "district": string, "state": string, "soilType": string, "rainfall": number, "temperature": number }`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            }
        });

        if (!response.text) {
            throw new Error("The model returned an empty response while fetching farm conditions.");
        }

        const jsonString = response.text.trim().replace(/^```json\s*|```$/g, '');
        const conditions = JSON.parse(jsonString);

        if (
            typeof conditions !== 'object' || 
            conditions === null || 
            typeof conditions.state !== 'string' || 
            typeof conditions.soilType !== 'string' ||
            typeof conditions.rainfall !== 'number' ||
            typeof conditions.temperature !== 'number'
        ) {
            throw new Error("Invalid format received for farm conditions. Required fields are missing or have incorrect types.");
        }

        return conditions;

    } catch (error) {
        console.error("Error getting farm conditions from location:", error);
        throw new Error("Sorry, I couldn't determine the local farm conditions. The AI model may have returned an unexpected format.");
    }
};

export const getCropRecommendation = async (state: string, soilType: string, rainfall: number, temperature: number, language: string): Promise<CropRecommendation[]> => {
  try {
    const langName = getLanguageName(language);
    const prompt = `As an agricultural expert for India, recommend the most suitable and profitable crops based on the following conditions:
- State: ${state}
- Soil Type: ${soilType}
- Average Annual Rainfall: ${rainfall} mm
- Average Temperature: ${temperature}°C

For each recommended crop, provide a brief reason why it is suitable and some key cultivation details.

IMPORTANT: Provide the entire response in the ${langName} language. The response must be ONLY a valid JSON array of objects. Do not include any text, explanation, or markdown formatting before or after the JSON array. Each object in the array should represent a crop and have the following structure:
{ "name": string, "reason": string, "cultivation_details": string }`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    if (!response.text) {
      throw new Error("The model returned an empty response. Please try refining your inputs.");
    }

    const jsonString = response.text.trim();
    const cleanedJsonString = jsonString.replace(/^```json\s*|```$/g, '');
    const recommendations = JSON.parse(cleanedJsonString);
    
    if (!Array.isArray(recommendations)) {
        throw new Error("The response from the model was not a valid JSON array.");
    }

    return recommendations;

  } catch (error) {
    console.error("Error getting crop recommendations:", error);
    throw new Error("Sorry, I couldn't get crop recommendations. The model may have returned an invalid format or an error occurred.");
  }
};