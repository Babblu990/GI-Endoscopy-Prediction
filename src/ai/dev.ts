import { config } from 'dotenv';
config();

import '@/ai/flows/submit-gi-image-for-analysis.ts';
import '@/ai/flows/store-gi-diagnostic-history.ts';
import '@/ai/flows/generate-performance-summary.ts';
