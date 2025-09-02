
'use server';

import { summarizeContent } from '@/ai/flows/dynamic-content-summaries';
import { z } from 'zod';

const summarySchema = z.object({
  content: z.string(),
});

export async function generateSummary(content: string) {
  try {
    const validatedInput = summarySchema.parse({ content });
    const result = await summarizeContent(validatedInput);
    return { summary: result.summary, error: null };
  } catch (e) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { summary: null, error };
  }
}
