'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing GI endoscopic images
 * using Gemini 2.5 Flash. It simulates an ensemble voting system by generating
 * multiple model perspectives (VGG16, ResNet50, InceptionV3) based on the visual input.
 *
 * - submitGiImageForAnalysis - A function that handles the submission and retrieval process.
 * - SubmitGiImageForAnalysisInput - The input type for the submitGiImageForAnalysis function.
 * - SubmitGiImageForAnalysisOutput - The return type for the submitGiImageForAnalysis function.
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

const SubmitGiImageForAnalysisOutputSchema = z.object({
  prediction: z.string().describe('The overall predicted disease or condition (e.g., Healthy, Polyp, Ulcer, Esophagitis, Tumor, Infection).'),
  confidence: z.number().describe('The overall confidence score for the prediction (0.0 to 1.0).'),
  vgg_prediction: z.string().describe('Prediction from the simulated VGG16 model architecture.'),
  vgg_confidence: z.number().describe('Confidence for VGG16 (0.0 to 1.0).'),
  resnet_prediction: z.string().describe('Prediction from the simulated ResNet50 model architecture.'),
  resnet_confidence: z.number().describe('Confidence for ResNet50 (0.0 to 1.0).'),
  inception_prediction: z.string().describe('Prediction from the simulated InceptionV3 model architecture.'),
  inception_confidence: z.number().describe('Confidence for InceptionV3 (0.0 to 1.0).'),
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
  prompt: `You are a medical diagnostic AI specialized in gastroenterology, acting as an ensemble controller for specialized deep learning models.

Analyze the following endoscopic image: {{media url=imageDataUri}}

Identify if the tissue appears 'Healthy' or if there are signs of conditions like 'Polyp', 'Ulcer', 'Infection', 'Tumor', or 'Esophagitis'. 

Note: 'Esophagitis' and 'Infection' typically involve the upper GI tract (Esophagus). 'Polyp', 'Ulcer', and 'Tumor' are often associated with the stomach or lower GI tract.

Return a comprehensive diagnostic report in JSON format.
To simulate a multi-model ensemble system (VGG16, ResNet50, InceptionV3):
1. Provide an overall 'prediction' and 'confidence' representing the system consensus.
2. Provide 'vgg_prediction', 'resnet_prediction', and 'inception_prediction'. 
   - VGG16: Often sensitive to texture and color gradients (Redness in Esophagitis).
   - ResNet50: Strong at identifying structural anomalies and edges (Polyps, Tumors).
   - InceptionV3: Excellent at multi-scale feature detection.
   
Reflect minor variations in architectural sensitivity in the simulated confidence scores to mimic a real-world ensemble where models might slightly disagree on edge cases.`,
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
        throw new Error('AI failed to produce a diagnostic output.');
      }
      return output;
    } catch (error) {
      console.error('Error during GI analysis flow:', error);
      throw new Error(
        `Analysis Failed: ${(error as Error).message}`
      );
    }
  }
);
