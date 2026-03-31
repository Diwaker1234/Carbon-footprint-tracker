"use server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Aether-Carbon OCR Neural Core v2.0
 * Powered by Groq Llama 3.2 Vision (11B)
 */

export interface OCRResult {
  activities: Array<{
    name: string;
    category: "TRANSPORT" | "ENERGY" | "FOOD" | "WASTE" | "SHOPPING" | "WATER";
    subcategory: string;
    value: number;
    unit: string;
    carbon_equivalent: number;
    insight_hint?: string;
  }>;
}

/**
 * Parses a base64 encoded receipt image into structured Aether-Carbon activity logs.
 */
export async function parseReceiptOCR(base64Image: string): Promise<OCRResult | null> {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.2-11b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Return a JSON object ONLY. You are the Aether-Carbon Neural Core. Analyze this receipt and extract every line item with a carbon cost. 
              
              MAP to these categories: [TRANSPORT, ENERGY, FOOD, WASTE, SHOPPING, WATER].
              CALCULATE carbon_equivalent (kg CO2e) using your high-accuracy internal knowledge of lifecycle emissions.
              
              Format exactly: 
              { 
                "activities": [{ 
                  "name": string, 
                  "category": string, 
                  "subcategory": string, 
                  "value": number, 
                  "unit": string, 
                  "carbon_equivalent": number,
                  "insight_hint": string (short AI suggestion for reduction)
                }] 
              }`,
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Neural OCR Error:", error);
  }
  return null;
}
