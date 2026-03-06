'use server';

/**
 * @fileOverview Extracts quiz data (questions, options, images) from a PDF document.
 *
 * - extractQuizDataFromPdf - A function that extracts quiz data from a PDF.
 * - ExtractQuizDataFromPdfInput - The input type for the extractQuizDataFromPdf function.
 * - ExtractQuizDataFromPdfOutput - The return type for the extractQuizDataFromPdf function.
 */

import {ai} from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import {z} from 'genkit';

const ExtractQuizDataFromPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      'The PDF document content as a data URI, including MIME type and Base64 encoding (e.g., data:application/pdf;base64,...).'
    ),
});
export type ExtractQuizDataFromPdfInput = z.infer<typeof ExtractQuizDataFromPdfInputSchema>;

const QuizQuestionSchema = z.object({
  questionText: z.string().describe('The full text of the question.'),
  options: z.array(z.string()).describe('An array of strings for the possible answer choices. If not a multiple-choice question, return an empty array.'),
  correctAnswer: z.string().optional().describe('The correct answer for the question. If not explicitly found, try to infer it. If it cannot be determined, omit this field.'),
  image: z.string().optional().describe('An image associated with the question, as a data URI. Omit if not present.'),
});

const ExtractQuizDataFromPdfOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe('An array of all quiz questions extracted from the PDF.'),
});

export type ExtractQuizDataFromPdfOutput = z.infer<typeof ExtractQuizDataFromPdfOutputSchema>;

export async function extractQuizDataFromPdf(input: ExtractQuizDataFromPdfInput): Promise<ExtractQuizDataFromPdfOutput> {
  return extractQuizDataFromPdfFlow(input);
}

const extractQuizDataFromPdfPrompt = ai.definePrompt({
  name: 'extractQuizDataFromPdfPrompt',
  input: {schema: ExtractQuizDataFromPdfInputSchema},
  output: {
    format: 'json',
    schema: ExtractQuizDataFromPdfOutputSchema
  },
  model: googleAI.model('gemini-pro-vision'),
  system: `You are an expert data extraction AI. Your one and only task is to analyze the provided document and extract any quiz questions it contains.

You must follow these instructions precisely:
1.  **Analyze the document**: Read the entire document to identify questions, options, and potentially correct answers.
2.  **Format Output**: Your entire output MUST be a single JSON object that strictly conforms to the provided output schema. Do not include any text, notes, or markdown formatting like \`\`\`json ... \`\`\` before or after the JSON object.
3.  **Handle No Questions**: If you analyze the document and find zero questions, you MUST return a valid JSON object with an empty "questions" array. It should look exactly like this: \`{"questions": []}\`. Do not return an error or explanatory text.
4.  **Infer Answers**: If an answer key is provided or if answers are marked, use that to populate the 'correctAnswer' field. If no answer is explicitly given, try to infer it if you are highly confident. If you cannot determine the answer, you MUST omit the 'correctAnswer' field for that question.
5.  **Handle Question Types**: The schema supports multiple-choice questions (with options) and other types like short-answer (with an empty 'options' array). Extract them as you find them.`,
  prompt: `Document: {{media url=pdfDataUri}}`,
});

const extractQuizDataFromPdfFlow = ai.defineFlow(
  {
    name: 'extractQuizDataFromPdfFlow',
    inputSchema: ExtractQuizDataFromPdfInputSchema,
    outputSchema: ExtractQuizDataFromPdfOutputSchema,
  },
  async input => {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('MISSING_API_KEY');
    }

    const {output} = await extractQuizDataFromPdfPrompt(input);
    
    // If the model returns a non-compliant response, or finds no questions,
    // ensure we always return a valid structure to the client. This is a critical safeguard.
    if (!output || !Array.isArray(output.questions)) {
        return { questions: [] };
    }

    return output;
  }
);
