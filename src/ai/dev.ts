import { config } from 'dotenv';
config();

import '@/ai/flows/submit-gi-image-for-analysis.ts';
import '@/ai/flows/process-and-present-gi-results.ts';
import '@/ai/flows/store-gi-diagnostic-history.ts';