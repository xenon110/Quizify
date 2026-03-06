'use server';

/**
 * @fileOverview Generates step-by-step explanations for quiz answers using AI.
 *
 * - generateAnswerExplanation - A function that generates the explanation.
 * - GenerateAnswerExplanationInput - The input type for the generateAnswerExplanation function.
 * - GenerateAnswerExplanationOutput - The return type for the generateAnswerExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAnswerExplanationInputSchema = z.object({
  question: z.string().describe('The quiz question.'),
  answer: z.string().describe('The answer provided by the student.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
  subject: z.string().describe('The subject of the quiz question.'),
});
export type GenerateAnswerExplanationInput = z.infer<
  typeof GenerateAnswerExplanationInputSchema
>;

const GenerateAnswerExplanationOutputSchema = z.object({
  explanation: z
    .string()
    .describe(
      'A step-by-step explanation of the correct answer, considering the student\'s answer.'
    ),
});
export type GenerateAnswerExplanationOutput = z.infer<
  typeof GenerateAnswerExplanationOutputSchema
>;

export async function generateAnswerExplanation(
  input: GenerateAnswerExplanationInput
): Promise<GenerateAnswerExplanationOutput> {
  return generateAnswerExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAnswerExplanationPrompt',
  input: {schema: GenerateAnswerExplanationInputSchema},
  output: {schema: GenerateAnswerExplanationOutputSchema},
  prompt: `You are an expert tutor in {{{subject}}}. A student has answered the following question:

Question: {{{question}}}

Student's Answer: {{{answer}}}

Correct Answer: {{{correctAnswer}}}

Provide a step-by-step explanation of how to arrive at the correct answer. Tailor the explanation to address any potential misunderstandings or errors in the student's answer. Be clear, concise, and easy to understand.
`,
});

const generateAnswerExplanationFlow = ai.defineFlow(
  {
    name: 'generateAnswerExplanationFlow',
    inputSchema: GenerateAnswerExplanationInputSchema,
    outputSchema: GenerateAnswerExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
