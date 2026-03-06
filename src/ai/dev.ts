import { config } from 'dotenv';
config();

import '@/ai/flows/adaptive-question-difficulty.ts';
import '@/ai/flows/extract-quiz-data-from-pdf.ts';
import '@/ai/flows/generate-answer-explanations.ts';
import '@/ai/flows/get-study-suggestion.ts';
