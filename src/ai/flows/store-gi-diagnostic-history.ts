'use server';
/**
 * @fileOverview This file defines a Genkit flow for storing GI diagnostic history.
 * It specifies the schema for the diagnostic data to be saved, including the
 * submitted image, primary prediction, confidence, timestamp, and individual
 * model outputs (VGG16, ResNet50, InceptionV3 predictions and confidences).
 *
 * - storeGIDiagnosticHistory - A function that serves as a public API for calling this flow.
 * - StoreGIDiagnosticHistoryInput - The input type for the storeGIDiagnosticHistory function.
 * - StoreGIDiagnosticHistoryOutput - The return type for the storeGIDiagnosticHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema for storing GI diagnostic history
const StoreGIDiagnosticHistoryInputSchema = z.object({
  image: z
    .string()
    .describe(
      "The uploaded GI endoscopic image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prediction: z.string().describe('The primary diagnostic prediction (e.g., "Polyp").'),
  confidence: z.number().min(0).max(1).describe('The confidence score (0-1) for the primary prediction (e.g., 0.74).'),
  timestamp: z.string().datetime().describe('The UTC timestamp of the diagnostic session (ISO 8601 format).'),
  vgg16: z.object({
    prediction: z.string().describe('VGG16 model prediction.'),
    confidence: z.number().min(0).max(1).describe('VGG16 model confidence score (0-1).'),
  }).describe('Prediction and confidence from the VGG16 deep learning model.'),
  resnet50: z.object({
    prediction: z.string().describe('ResNet50 model prediction.'),
    confidence: z.number().min(0).max(1).describe('ResNet50 model confidence score (0-1).'),
  }).describe('Prediction and confidence from the ResNet50 deep learning model.'),
  inceptionV3: z.object({
    prediction: z.string().describe('InceptionV3 model prediction.'),
    confidence: z.number().min(0).max(1).describe('InceptionV3 model confidence score (0-1).'),
  }).describe('Prediction and confidence from the InceptionV3 deep learning model.'),
});
export type StoreGIDiagnosticHistoryInput = z.infer<typeof StoreGIDiagnosticHistoryInputSchema>;

// Output Schema for the diagnostic history storage flow
const StoreGIDiagnosticHistoryOutputSchema = z.object({
  success: z.boolean().describe('Indicates if the diagnostic history was successfully processed.'),
  message: z.string().optional().describe('An optional message regarding the processing status.'),
});
export type StoreGIDiagnosticHistoryOutput = z.infer<typeof StoreGIDiagnosticHistoryOutputSchema>;

/**
 * Initiates the storage process for a GI diagnostic session.
 * This function serves as the public API for the Genkit flow and is designed to
 * accept detailed diagnostic data for persistence.
 *
 * @param input - The diagnostic session data to be stored.
 * @returns A promise that resolves to an object indicating the success of the storage operation.
 */
export async function storeGIDiagnosticHistory(
  input: StoreGIDiagnosticHistoryInput
): Promise<StoreGIDiagnosticHistoryOutput> {
  // Call the Genkit flow to process and acknowledge the diagnostic history data.
  return storeGIDiagnosticHistoryFlow(input);
}

// Genkit Flow Definition for storing GI diagnostic history.
// This flow defines the contract for saving diagnostic data.
// In a full implementation, this would involve interaction with a database
// (e.g., Firebase Firestore) or a backend service.
const storeGIDiagnosticHistoryFlow = ai.defineFlow(
  {
    name: 'storeGIDiagnosticHistoryFlow',
    inputSchema: StoreGIDiagnosticHistoryInputSchema,
    outputSchema: StoreGIDiagnosticHistoryOutputSchema,
  },
  async (input) => {
    // In a production scenario, this is where the actual logic for storing
    // the diagnostic data into a database (like Firestore) would reside.
    // For this demonstration, we simulate successful processing.
    console.log(`[storeGIDiagnosticHistoryFlow] Received diagnostic record for ${input.prediction} with confidence ${input.confidence}.`);
    // Example placeholder for actual database storage logic:
    // const firestoreRef = await db.collection('giDiagnosticHistory').add(input);
    // return { success: true, message: `Record stored with ID: ${firestoreRef.id}` };

    return {
      success: true,
      message: 'Diagnostic history data successfully received for storage.',
    };
  }
);
