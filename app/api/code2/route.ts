import { streamObject } from 'ai';
import { CodePrompt, codeSchema, systemPrompt } from './schema';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { getFineTunedPrompt } from '@/constants/codePromptNew';

const openai = createOpenAICompatible({
  name: 'azure',
  apiKey: process.env.OPENAPI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL || "",
});

export const maxDuration = 30;

export async function POST(req: Request) {
  const context = await req.json();

  const result = streamObject({
    model: openai('openai'),
    system: getFineTunedPrompt(), 
    schema: codeSchema,
    prompt: context,
  });

  return result.toTextStreamResponse();
}