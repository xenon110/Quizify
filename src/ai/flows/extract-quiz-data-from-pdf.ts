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
  model: googleAI.model('models/gemini-2.5-flash-lite-preview-09-2025'),
  system: `You are an AI assistant that extracts quiz questions from a document.
Your task is to find all the questions in the provided document and format them as a JSON object.
The JSON object must have a single key "questions", which is an array of question objects.
Each question object should match the provided JSON schema.

- For each question, extract the question text, the options (if it's a multiple-choice question), and the correct answer if it's available or can be confidently inferred.
- If a question is not multiple-choice, provide an empty array for the "options" field.
- If a correct answer cannot be found, omit the "correctAnswer" field.
- If the document contains no questions at all, you MUST return a JSON object with an empty "questions" array, like this: {"questions": []}.

Your entire response must be ONLY the JSON object, with no other text, comments, or markdown formatting before or after it.`,
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

    try {
      const {output} = await extractQuizDataFromPdfPrompt(input);
      
      // If the model returns a non-compliant response, or finds no questions,
      // ensure we always return a valid structure to the client. This is a critical safeguard.
      if (!output || !Array.isArray(output.questions)) {
          console.error("AI response was not in the expected format or was null.");
          return { questions: [] };
      }

      return output;
    } catch (err) {
      console.error("Error calling extractQuizDataFromPdfPrompt:", err);
      // In case of any catastrophic failure during the AI call, return a valid empty response.
      return { questions: [] };
    }
  }
);
