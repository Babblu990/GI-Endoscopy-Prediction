
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI({
      // Prefer standard environment variable for API key
      apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || 'AIzaSyAqqhPOuZ1LQKzoBa0STcm5qafNlVpgbnw',
    }),
  ],
  // Using gemini-1.5-flash as it is more stable for high-volume free tier usage
  model: 'googleai/gemini-1.5-flash',
});
