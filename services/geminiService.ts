import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import { AnalysisResult } from "../types";
import { ExtractedMetadata } from "./forensicTool";
import { useApiKeys } from "../hooks/useApiKeys";

// Helper to safely retrieve API keys from localStorage
const getApiKeys = () => {
  try {
    const stored = localStorage.getItem('trustlayer-api-keys');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error("Could not parse API keys from storage", e);
  }
  return { groq: '', serp: '' };
};

/**
 * Stage 1: Use Gemini for Vision Analysis
 * This function takes the image and returns a detailed textual description of the scene,
 * focusing on vehicle damage.
 */
const analyzeImageWithVisionModel = async (base64Image: string, mimeType: string): Promise<string> => {
  // Per requirements, the Gemini API key MUST come exclusively from the environment.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

  const prompt = `
You are a world-class vehicle damage assessor and forensic image analyst. Your analysis must be meticulous, objective, and highly detailed. Analyze the provided image and generate a structured report.

**1. Vehicle Identification:**
- **Make & Model:** Identify the vehicle's make and model.
- **Estimated Year:** Provide an estimated manufacturing year range.
- **Color:** State the vehicle's color.

**2. Damage Assessment:**
- **Impact Location:** Describe the primary area of impact (e.g., front-right corner, driver-side door).
- **Damaged Components:** Create a comprehensive list of all visibly damaged parts. For each part, describe the *type* of damage (e.g., deep scratches, cracked, dented, shattered, deformed).
- **Severity Score:** For each component, assign a severity score from 1 (minor cosmetic) to 10 (total destruction).

**3. Environmental Context:**
- **Location Type:** Describe the setting (e.g., urban intersection, highway, residential street, parking garage).
- **Lighting Conditions:** Describe the lighting (e.g., bright daylight, overcast, night, artificial lighting).
- **Weather:** Note any visible weather conditions (e.g., clear, rain, wet pavement, snow).
- **Other Details:** Mention any other relevant details like road debris, other vehicles, or skid marks.
  `;

// Inside geminiService.ts

const response = await ai.models.generateContent({
  // CHANGE THIS LINE: Use a valid model name
  model: "gemini-2.5-flash", 
  contents: {
    parts: [
      { inlineData: { mimeType: mimeType, data: base64Image } },
      { text: prompt }
    ]
  },
  config: {
    temperature: 0.1,
  }
});

  const text = response.text;
  if (!text) throw new Error("Gemini Vision analysis failed: No description generated.");
  return text;
};

// Prioritized list of Groq models to try.
const GROQ_MODELS = [
    "llama-3.1-8b-instant", // Newest fast model
    "gemma2-9b-it",         // Successor to the old gemma model
    "mixtral-8x7b-32768"    // A powerful staple, kept as a fallback
];

/**
 * Stage 2: Use Groq for Reasoning and JSON generation
 * This function takes the vision analysis, forensic data, and generates the final structured report.
 * It will try a list of models in order if one fails.
 */
const generateReportWithGroq = async (apiKey: string, visionAnalysis: string, metadata: ExtractedMetadata): Promise<AnalysisResult> => {
  const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
  
  const systemPrompt = `
You are TrustLayer, an advanced digital forensics and insurance fraud detection AI. Your task is to act as a senior claims investigator and synthesize forensic data and a visual analysis into a structured, highly-detailed JSON report. You must be meticulous and draw logical connections between all data points.

CRITICAL CONTEXT:
1.  **FORENSIC METADATA (Source of Truth):** ${JSON.stringify(metadata)}
2.  **VISUAL ANALYSIS (from Vision Model):** ${visionAnalysis}

YOUR DETAILED TASK:
Analyze all the provided context and generate a final report. Use the forensic metadata as the absolute truth for device, software, and timestamp info. Use the detailed visual analysis to inform the insurance and fraud sections. Use your internal knowledge base for cost estimations in **Indian Rupees (INR)**. Think step-by-step and provide rich, detailed explanations in all free-text fields.

OUTPUT REQUIREMENTS:
- You MUST output a single, valid JSON object and NOTHING else.
- Do not include markdown, comments, or any text outside the JSON object.
- The JSON object must strictly conform to the specified structure.

JSON STRUCTURE & FIELD-LEVEL INSTRUCTIONS:
{
  "forensics": {
    "deviceModel": "string (from metadata)",
    "software": "string (from metadata)",
    "gpsCoordinates": "string (from metadata)",
    "captureTime": "string (from metadata)",
    "visualEnvironment": "string (Synthesize from 'Environmental Context' in the visual analysis. Be descriptive.)"
  },
  "insurance": {
    "vehicleId": "string (from 'Vehicle Identification' in visual analysis)",
    "impactType": "string (Describe the nature of the collision, e.g., 'Front-end collision', 'Side-swipe', 'Rear impact')",
    "damageClass": "'Minor' | 'Moderate' | 'Major' | 'Total Loss' (Based on the number and severity of damaged parts)",
    "damagedParts": [{ "part": "string", "estimatedCost": number (in INR) }],
    "totalEstimatedCost": number (in INR),
    "notes": "string (Provide a comprehensive summary of the damage. Mention the primary impact zone and list the most critically affected components. Speculate on potential unseen damage, e.g., 'frame damage is possible given the severity.')"
  },
  "fraud": {
    "riskScore": number (0-100, calculate based on the number and severity of anomalies),
    "isAiGenerated": boolean (Set to true if you detect any signs of AI generation, like inconsistent shadows, reflections, or digital artifacts),
    "anomalies": ["string"] (List ALL suspicious findings. Examples: 'Timestamp (3:45 AM) is outside typical hours.', 'EXIF software signature 'Photoshop' indicates potential manipulation.', 'Shadow direction is inconsistent with a single light source.', 'GPS coordinates are in a different state than the vehicle's registration.'),
    "conclusion": "'Verified' | 'Suspicious' | 'High Risk'",
    "details": "string (Write a detailed narrative explaining your fraud conclusion. Synthesize all evidence. If metadata is suspicious but the image looks real, explain that discrepancy. If the image itself has visual artifacts, describe them. Justify the risk score.)"
  },
  "summary": {
    "confidenceScore": number (0-100, your confidence in this entire analysis),
    "finalConclusion": "string (A one-sentence executive summary that includes vehicle, damage level, and risk assessment.)",
    "recommendation": "'Approve' | 'Review' | 'Reject' (Base this on the fraud risk score and damage class.)"
  }
}`;
  
  let lastError: any = null;

  for (const model of GROQ_MODELS) {
    try {
      console.log(`Attempting analysis with Groq model: ${model}`);
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate the JSON report based on the context provided in the system prompt." }
        ],
        model: model,
        temperature: 0.2,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
          throw new Error(`Groq model ${model} returned empty content.`);
      }

      try {
        console.log(`Successfully received response from ${model}.`);
        return JSON.parse(content) as AnalysisResult; // Success! Return and exit.
      } catch (parseError) {
        console.error(`Failed to parse JSON response from ${model}:`, content);
        throw new Error(`Groq analysis with ${model} failed: Invalid JSON format.`);
      }

    } catch (error: any) {
      lastError = error;
      console.warn(`Groq model ${model} failed. Error: ${error.message}. Trying next model...`);
    }
  }

  // If the loop completes without returning, all models have failed.
  console.error("All fallback Groq models failed.", lastError);
  throw new Error("Groq analysis failed: All available models are currently unavailable or decommissioned.");
};


export const analyzeImage = async (base64Image: string, metadata: ExtractedMetadata): Promise<AnalysisResult> => {
  const { groq: groqKey } = getApiKeys();

  // The Groq key is user-provided via settings. The app can't function without it for the reasoning step.
  // The Gemini key is assumed to be present in the environment and is handled in its specific function.
  if (!groqKey) {
    console.error("Missing Groq API key. Analysis cannot proceed.");
    throw new Error("CRITICAL: Groq API key is missing. Please configure it in the Settings panel.");
  }

  try {
    // STAGE 1: Vision
    const visionAnalysis = await analyzeImageWithVisionModel(base64Image, metadata.mimeType);
    
    // STAGE 2: Reasoning
    const finalReport = await generateReportWithGroq(groqKey, visionAnalysis, metadata);

    // Note: The original implementation used Gemini's search grounding.
    // A full implementation here would use the SerpAPI key to perform searches for parts pricing
    // and feed that data into the Groq prompt for more accurate results.
    // For now, we rely on the LLM's general knowledge.
    
    return finalReport;

    // FIX: Added curly braces to the catch block to correctly scope the error variable.
  } catch (error: any) {
    console.error("AI Analysis Pipeline Failed:", error);
    // Provide a structured error response
    return {
      forensics: { deviceModel: "Error", software: "N/A", gpsCoordinates: "N/A", captureTime: "N/A", visualEnvironment: "N/A" },
      insurance: { vehicleId: "N/A", impactType: 'N/A', damageClass: "Minor", damagedParts: [], totalEstimatedCost: 0, notes: "API Error" },
      fraud: { riskScore: 50, isAiGenerated: false, anomalies: [], conclusion: "Suspicious", details: error.message || "An unknown processing error occurred." },
      summary: { confidenceScore: 0, finalConclusion: "Analysis failed.", recommendation: "Review" }
    };
  }
};
