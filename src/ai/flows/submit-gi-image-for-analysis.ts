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
  prediction: z.string().describe('The overall predicted disease or condition (e.g., Healthy, Polyp, Ulcer).'),
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
  prompt: `You are a medical diagnostic AI specialized in gastroenterology.
Analyze the following endoscopic image: {{media url=imageDataUri}}

Identify if the tissue appears 'Healthy' or if there are signs of conditions like 'Polyp', 'Ulcer', 'Infection', or 'Tumor'.

Return a comprehensive diagnostic report in JSON format.
To simulate a multi-model ensemble system:
1. Provide an overall 'prediction' and 'confidence'.
2. Provide 'vgg_prediction', 'resnet_prediction', and 'inception_prediction' with their respective simulated confidence scores. These should generally align with your overall finding but can reflect minor variations in architectural sensitivity to simulate a real-world ensemble.`,
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
