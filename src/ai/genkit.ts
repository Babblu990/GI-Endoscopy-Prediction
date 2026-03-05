import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: 'AIzaSyAqqhPOuZ1LQKzoBa0STcm5qafNlVpgbnw',
    }),
  ],
  model: 'googleai/gemini-1.5-flash',
});