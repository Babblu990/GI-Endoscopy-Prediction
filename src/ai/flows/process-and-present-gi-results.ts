'use server';
/**
 * @fileOverview A Genkit flow for processing and presenting GI endoscopic diagnostic predictions.
 *
 * - processAndPresentGiResults - A function that handles the processing and presentation of AI results.
 * - ProcessAndPresentGiResultsInput - The input type for the processAndPresentGiResults function.
 * - ProcessAndPresentGiResultsOutput - The return type for the processAndPresentGiResults function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProcessAndPresentGiResultsInputSchema = z.object({
  overallPrediction: z.string().describe('The overall prediction from the AI system.'),
  overallConfidence: z.number().describe('The overall confidence percentage for the prediction.'),
  vggPrediction: z.string().describe('Prediction from the VGG16 model.'),
  vggConfidence: z.number().describe('Confidence from the VGG16 model (percentage).'),
  resnetPrediction: z.string().describe('Prediction from the ResNet50 model.'),
  resnetConfidence: z.number().describe('Confidence from the ResNet50 model (percentage).'),
  inceptionPrediction: z.string().describe('Prediction from the InceptionV3 model.'),
  inceptionConfidence: z.number().describe('Confidence from the InceptionV3 model (percentage).'),
});
export type ProcessAndPresentGiResultsInput = z.infer<typeof ProcessAndPresentGiResultsInputSchema>;

const ProcessAndPresentGiResultsOutputSchema = z.object({
  predictionCard: z.object({
    prediction: z.string().describe('The final overall disease prediction.'),
    confidence: z.number().describe('The confidence level for the final prediction (percentage).'),
    status: z.string().describe('The status of the prediction, e.g., "Detected".'),
  }).describe('Summary card for the overall prediction.'),
  modelVoting: z.object({
    vgg16: z.object({
      prediction: z.string().describe('Prediction from VGG16 model.'),
      confidence: z.number().describe('Confidence from VGG16 model.'),
    }).describe('Output from the VGG16 model.'),
    resnet50: z.object({
      prediction: z.string().describe('Prediction from ResNet50 model.'),
      confidence: z.number().describe('Confidence from ResNet50 model.'),
    }).describe('Output from the ResNet50 model.'),
    inceptionv3: z.object({
      prediction: z.string().describe('Prediction from InceptionV3 model.'),
      confidence: z.number().describe('Confidence from InceptionV3 model.'),
    }).describe('Output from the InceptionV3 model.'),
    majorityVoteResult: z.string().describe('The final prediction based on majority voting among the models.'),
  }).describe('Section detailing individual model predictions and the majority vote.'),
});
export type ProcessAndPresentGiResultsOutput = z.infer<typeof ProcessAndPresentGiResultsOutputSchema>;

export async function processAndPresentGiResults(input: ProcessAndPresentGiResultsInput): Promise<ProcessAndPresentGiResultsOutput> {
  return processAndPresentGiResultsFlow(input);
}

const processResultsPrompt = ai.definePrompt({
  name: 'processGiResultsPrompt',
  input: { schema: ProcessAndPresentGiResultsInputSchema },
  output: { schema: ProcessAndPresentGiResultsOutputSchema },
  prompt: `You are an AI assistant specialized in analyzing GI endoscopic diagnostic predictions. Your task is to process individual deep learning model outputs and present a comprehensive summary, including a majority vote result.

Given the following model predictions and confidences:
- VGG16: Prediction = '{{{vggPrediction}}}', Confidence = '{{{vggConfidence}}}%'
- ResNet50: Prediction = '{{{resnetPrediction}}}', Confidence = '{{{resnetConfidence}}}%'
- InceptionV3: Prediction = '{{{inceptionPrediction}}}', Confidence = '{{{inceptionConfidence}}}%'

The overall system prediction is '{{{overallPrediction}}}' with an overall confidence of '{{{overallConfidence}}}%'.

Based on these inputs, determine the majority vote prediction among VGG16, ResNet50, and InceptionV3 models. If two or more models agree on a prediction, that is the majority vote. If all three models predict different outcomes, state 'No clear majority'.

For the 'predictionCard' section, use the 'overallPrediction' and 'overallConfidence' provided, and set the status to 'Detected'.

Provide the output in the specified JSON format.`,
});

const processAndPresentGiResultsFlow = ai.defineFlow(
  {
    name: 'processAndPresentGiResultsFlow',
    inputSchema: ProcessAndPresentGiResultsInputSchema,
    outputSchema: ProcessAndPresentGiResultsOutputSchema,
  },
  async (input) => {
    const { output } = await processResultsPrompt(input);
    if (!output) {
      throw new Error('Failed to get output from processResultsPrompt');
    }
    return output;
  }
);
