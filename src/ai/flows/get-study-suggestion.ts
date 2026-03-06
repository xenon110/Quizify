'use server';

/**
 * @fileOverview Generates personalized study suggestions based on user performance.
 *
 * - getStudySuggestion - A function that generates a study tip.
 * - GetStudySuggestionInput - The input type for the getStudySuggestion function.
 * - GetStudySuggestionOutput - The return type for the getStudySuggestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExamPerformanceSchema = z.object({
  examTitle: z.string().describe('The title or subject of the exam.'),
  score: z.number().describe('The percentage score the user got on the exam.'),
});

const GetStudySuggestionInputSchema = z.object({
  performanceData: z
    .array(ExamPerformanceSchema)
    .describe('An array of the user\'s past exam performances.'),
});
export type GetStudySuggestionInput = z.infer<
  typeof GetStudySuggestionInputSchema
>;

const GetStudySuggestionOutputSchema = z.object({
  suggestion: z
    .string()
    .describe(
      'A short, actionable study suggestion for the user. e.g., "Revise Topic X" or "Try a quick 10-question quiz on Topic Y".'
    ),
});
export type GetStudySuggestionOutput = z.infer<
  typeof GetStudySuggestionOutputSchema
>;

export async function getStudySuggestion(
  input: GetStudySuggestionInput
): Promise<GetStudySuggestionOutput> {
  return getStudySuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getStudySuggestionPrompt',
  input: { schema: GetStudySuggestionInputSchema },
  output: { schema: GetStudySuggestionOutputSchema },
  prompt: `You are an AI academic advisor. Based on the following user performance data, provide a single, short, and actionable study suggestion.

Focus on the areas with the lowest scores. The suggestion should be concise and encouraging.

Example suggestions:
- "Your scores in 'Biology' are a bit low. Try revising that topic."
- "Great job on 'History'! Maybe try a quick 10-question quiz on 'Geography' next."
- "You're doing great! Keep up the momentum with a practice test on a new topic."

User Performance:
{{#each performanceData}}
- Exam: {{{examTitle}}}, Score: {{{score}}}%
{{/each}}

If there is no performance data, provide a general encouraging message to start the first exam.
`,
});

const getStudySuggestionFlow = ai.defineFlow(
  {
    name: 'getStudySuggestionFlow',
    inputSchema: GetStudySuggestionInputSchema,
    outputSchema: GetStudySuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
