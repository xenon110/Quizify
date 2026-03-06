'use server';

/**
 * @fileOverview An AI agent that dynamically adjusts the difficulty of quiz questions based on student performance.
 *
 * - adjustQuestionDifficulty - A function that adjusts the difficulty of the next question.
 * - AdjustQuestionDifficultyInput - The input type for the adjustQuestionDifficulty function.
 * - AdjustQuestionDifficultyOutput - The return type for the adjustQuestionDifficulty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustQuestionDifficultyInputSchema = z.object({
  studentId: z.string().describe('The unique identifier of the student.'),
  currentDifficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The difficulty of the current question.'),
  correctlyAnswered: z.boolean().describe('Whether the student answered the question correctly.'),
});
export type AdjustQuestionDifficultyInput = z.infer<typeof AdjustQuestionDifficultyInputSchema>;

const AdjustQuestionDifficultyOutputSchema = z.object({
  nextDifficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The difficulty of the next question.'),
  reason: z.string().describe('Reasoning for the difficulty adjustment.'),
});
export type AdjustQuestionDifficultyOutput = z.infer<typeof AdjustQuestionDifficultyOutputSchema>;

export async function adjustQuestionDifficulty(
  input: AdjustQuestionDifficultyInput
): Promise<AdjustQuestionDifficultyOutput> {
  return adjustQuestionDifficultyFlow(input);
}

const adjustQuestionDifficultyPrompt = ai.definePrompt({
  name: 'adjustQuestionDifficultyPrompt',
  input: {schema: AdjustQuestionDifficultyInputSchema},
  output: {schema: AdjustQuestionDifficultyOutputSchema},
  prompt: `You are an AI that dynamically adjusts the difficulty of quiz questions based on a student's performance.

The student's ID is {{{studentId}}}.

The current question difficulty is {{{currentDifficulty}}}.

The student answered the question correctly: {{{correctlyAnswered}}}.

Based on the student's performance, determine the difficulty of the next question and provide a reason for the adjustment.

If the student answered correctly, increase the difficulty, otherwise decrease the difficulty. Do not make the difficulty lower than Easy, or higher than Hard.

Output the next difficulty in JSON format and the reasoning behind it in the reason field.
`,
});

const adjustQuestionDifficultyFlow = ai.defineFlow(
  {
    name: 'adjustQuestionDifficultyFlow',
    inputSchema: AdjustQuestionDifficultyInputSchema,
    outputSchema: AdjustQuestionDifficultyOutputSchema,
  },
  async input => {
    const {output} = await adjustQuestionDifficultyPrompt(input);
    return output!;
  }
);
