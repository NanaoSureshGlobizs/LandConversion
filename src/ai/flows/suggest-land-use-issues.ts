'use server';
/**
 * @fileOverview AI tool to analyze proposed land use against zoning regulations and suggest potential issues.
 *
 * - suggestLandUseIssues - A function that handles the land use issue suggestion process.
 * - SuggestLandUseIssuesInput - The input type for the suggestLandUseIssues function.
 * - SuggestLandUseIssuesOutput - The return type for the suggestLandUseIssues function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestLandUseIssuesInputSchema = z.object({
  proposedLandUse: z.string().describe('The proposed land use for the application.'),
  existingZoningRegulations: z.string().describe('The existing zoning regulations for the land.'),
});
export type SuggestLandUseIssuesInput = z.infer<typeof SuggestLandUseIssuesInputSchema>;

const SuggestLandUseIssuesOutputSchema = z.object({
  suggestedIssues: z.string().describe('Potential issues or conflicts that might arise with the new land usage plan.'),
});
export type SuggestLandUseIssuesOutput = z.infer<typeof SuggestLandUseIssuesOutputSchema>;

export async function suggestLandUseIssues(input: SuggestLandUseIssuesInput): Promise<SuggestLandUseIssuesOutput> {
  return suggestLandUseIssuesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestLandUseIssuesPrompt',
  input: {schema: SuggestLandUseIssuesInputSchema},
  output: {schema: SuggestLandUseIssuesOutputSchema},
  prompt: `You are an AI assistant designed to identify potential issues or conflicts related to land use applications.

You will analyze the proposed land use against the existing zoning regulations and suggest any concerns that might arise.

Proposed Land Use: {{{proposedLandUse}}}
Existing Zoning Regulations: {{{existingZoningRegulations}}}

Based on the information provided, what potential issues or conflicts might arise with the new land usage plan?`,
});

const suggestLandUseIssuesFlow = ai.defineFlow(
  {
    name: 'suggestLandUseIssuesFlow',
    inputSchema: SuggestLandUseIssuesInputSchema,
    outputSchema: SuggestLandUseIssuesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
