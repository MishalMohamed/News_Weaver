'use server';

/**
 * @fileOverview An article classification AI agent.
 *
 * - classifyArticle - A function that handles the article classification process.
 * - ClassifyArticleInput - The input type for the classifyArticle function.
 * - ClassifyArticleOutput - The return type for the classifyArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyArticleInputSchema = z.object({
  title: z.string().describe('The title of the article.'),
  content: z.string().describe('The content or snippet of the article.'),
});
export type ClassifyArticleInput = z.infer<typeof ClassifyArticleInputSchema>;

const ClassifyArticleOutputSchema = z.object({
  sentiment: z.enum(['positive', 'negative', 'neutral']).describe('The overall sentiment of the article.'),
  topic: z.string().describe('The primary topic of the article (e.g., Technology, Science, Business, Health, Sports).'),
});
export type ClassifyArticleOutput = z.infer<typeof ClassifyArticleOutputSchema>;

export async function classifyArticle(input: ClassifyArticleInput): Promise<ClassifyArticleOutput> {
  return classifyArticleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyArticlePrompt',
  input: {schema: ClassifyArticleInputSchema},
  output: {schema: ClassifyArticleOutputSchema},
  prompt: `You are an expert content analyst. Analyze the following article and determine its sentiment and primary topic.

The topic should be a single, general category like Technology, Science, Business, Health, Sports, Politics, or Entertainment.

Title: {{{title}}}
Content: {{{content}}}`,
});

const classifyArticleFlow = ai.defineFlow(
  {
    name: 'classifyArticleFlow',
    inputSchema: ClassifyArticleInputSchema,
    outputSchema: ClassifyArticleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
