'use server';
/**
 * @fileOverview This file defines a consolidated Genkit flow for analyzing GI endoscopic images.
 * It uses Gemini 2.5 Flash to perform a single-pass analysis that simulates an ensemble 
 * voting system (VGG16, ResNet50, InceptionV3) and prepares formatted results for the UI.
 *
 * - submitGiImageForAnalysis - A function that handles the combined analysis and presentation logic.
 * - SubmitGiImageForAnalysisInput - The input type for the flow.
 * - SubmitGiImageForAnalysisOutput - The return type including raw predictions and UI-formatted components.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SubmitGiImageForAnalysisInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A GI endoscopic image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SubmitGiImageForAnalysisInput = z.infer<typeof SubmitGiImageForAnalysisInputSchema>;

const ModelOutputSchema = z.object({
  prediction: z.string().describe('The predicted disease or condition.'),
  confidence: z.number().describe('Confidence score (0.0 to 1.0).'),
});

const SubmitGiImageForAnalysisOutputSchema = z.object({
  // Core prediction data
  prediction: z.string().optional().describe('The overall consensus prediction.'),
  confidence: z.number().optional().describe('The overall consensus confidence score.'),
  status: z.string().optional().describe('Status message, e.g., "Detected" or "No Disease Detected".'),
  
  // Ensemble components
  vgg16: ModelOutputSchema.optional().describe('Simulated VGG16 model output.'),
  resnet50: ModelOutputSchema.optional().describe('Simulated ResNet50 model output.'),
  inceptionV3: ModelOutputSchema.optional().describe('Simulated InceptionV3 model output.'),
  
  // Voting logic
  majorityVoteResult: z.string().optional().describe('The result determined by majority voting.'),
  
  // Error handling
  error: z.string().optional().describe('Error message if the analysis failed due to quota or other issues.'),
  isQuotaExceeded: z.boolean().optional().describe('True if the API quota was exceeded.'),
});
export type SubmitGiImageForAnalysisOutput = z.infer<typeof SubmitGiImageForAnalysisOutputSchema>;

export async function submitGiImageForAnalysis(
  input: SubmitGiImageForAnalysisInput
): Promise<SubmitGiImageForAnalysisOutput> {
  return submitGiImageForAnalysisFlow(input);
}

const giAnalysisPrompt = ai.definePrompt({
  name: 'giAnalysisPrompt',
  input: { schema: SubmitGiImageForAnalysisInputSchema },
  output: { schema: SubmitGiImageForAnalysisOutputSchema },
  prompt: `You are a medical diagnostic AI specialized in gastroenterology, acting as an ensemble controller.

Analyze the following endoscopic image: {{media url=imageDataUri}}

Identify if the tissue appears 'Healthy' or if there are signs of conditions like 'Polyp', 'Ulcer', 'Infection', 'Tumor', or 'Esophagitis'. 

CRITICAL ANATOMICAL MAPPING:
- 'Esophagitis' and 'Infection' MUST be identified as upper GI tract conditions (Esophagus).
- 'Polyp', 'Ulcer', and 'Tumor' are usually stomach or lower GI tract conditions.

SIMULATE ENSEMBLE VOTING (VGG16, ResNet50, InceptionV3):
1. VGG16: Sensitive to color/texture (e.g., redness/inflammation in Esophagitis).
2. ResNet50: Strong at structural anomalies (e.g., Polyps, Tumors).
3. InceptionV3: Excellent at multi-scale features for complex lesions.

Provide:
- A consensus 'prediction' and 'confidence'.
- Individual outputs for 'vgg16', 'resnet50', and 'inceptionV3'.
- A 'majorityVoteResult' based on these three.
- A 'status' (set to 'Detected' if any disease is found, or 'Normal' if healthy).

Return the full report in JSON.`,
});

const submitGiImageForAnalysisFlow = ai.defineFlow(
  {
    name: 'submitGiImageForAnalysisFlow',
    inputSchema: SubmitGiImageForAnalysisInputSchema,
    outputSchema: SubmitGiImageForAnalysisOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await giAnalysisPrompt(input);
      if (!output) {
        return { error: 'AI failed to produce a diagnostic output.' };
      }
      return output;
    } catch (error: any) {
      console.error('Error during consolidated GI analysis flow:', error);
      const isQuota = error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED');
      return { 
        error: isQuota ? 'AI service quota exceeded. Please wait 60 seconds.' : error.message,
        isQuotaExceeded: isQuota
      };
    }
  }
);
