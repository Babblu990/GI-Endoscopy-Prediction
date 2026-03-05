'use server';
/**
 * @fileOverview This file defines a Genkit flow for submitting GI endoscopic images to an external
 * AI backend for diagnostic prediction and retrieving the analysis results.
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
  prediction: z.string().describe('The overall predicted disease or condition.'),
  confidence: z
    .number()
    .describe('The overall confidence score for the prediction (0.0 to 1.0).'),
  vgg_prediction: z.string().describe('Prediction from the VGG16 model.'),
  resnet_prediction: z.string().describe('Prediction from the ResNet50 model.'),
  inception_prediction: z.string().describe('Prediction from the InceptionV3 model.'),
});
export type SubmitGiImageForAnalysisOutput = z.infer<typeof SubmitGiImageForAnalysisOutputSchema>;

export async function submitGiImageForAnalysis(
  input: SubmitGiImageForAnalysisInput
): Promise<SubmitGiImageForAnalysisOutput> {
  return submitGiImageForAnalysisFlow(input);
}

const submitGiImageForAnalysisFlow = ai.defineFlow(
  {
    name: 'submitGiImageForAnalysisFlow',
    inputSchema: SubmitGiImageForAnalysisInputSchema,
    outputSchema: SubmitGiImageForAnalysisOutputSchema,
  },
  async (input) => {
    const FLASK_API_URL = 'http://localhost:5000/predict';

    try {
      const response = await fetch(FLASK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_data_uri: input.imageDataUri,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Flask API request failed with status ${response.status}: ${errorText}`
        );
      }

      const result: SubmitGiImageForAnalysisOutput = await response.json();

      // Validate the received data against the output schema
      SubmitGiImageForAnalysisOutputSchema.parse(result);

      return result;
    } catch (error) {
      console.error('Error submitting image to Flask API:', error);
      throw new Error(
        `Failed to get predictions from AI backend: ${(error as Error).message}`
      );
    }
  }
);
