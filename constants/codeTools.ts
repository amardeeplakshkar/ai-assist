import { tool as createTool, generateObject, generateText, streamObject } from 'ai';
import { z } from 'zod';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { CodePrompt } from '.';
const provider = createOpenAICompatible({
    name: 'azure',
    apiKey: process.env.OPENAPI_API_KEY,
    baseURL: process.env.OPENAI_API_BASE_URL || "",
});

export const codeTool = createTool({
    description: 'Generates high-quality React + Tailwind CSS code using ShadCN UI components and Lucide icons based on the given UI design query.',
    parameters: z.object({
        query: z
            .string()
            .describe('A detailed UI design or feature request for a single-page application using React, Tailwind CSS, ShadCN UI, and Lucide icons.'),
    }),
    execute: async function ({ query }) {
        const schema = z.object({
            title: z.string(),
            brief: z.string(),
            files: z.array(z.record(z.string(), z.string())),
        });
        try {
            const { object } = await generateObject({
                model: provider("openai-fast"),
                mode: 'json',
                system: CodePrompt,
                schema,
                messages: [
                    {
                        role: 'system',
                        content: CodePrompt,
                    },
                    {
                        role: 'user',
                        content: query,
                    },
                ],
            });

            console.log("result", object);

            return object;
        } catch (error: any) {
            return {
                error: 'error.',
                details: error?.message || error,
            };
        }
    },
});

export const codeTools = {
    codeTool,
};