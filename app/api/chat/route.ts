import { tools } from '@/constants';
import { systemInstructions } from '@/constants';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';

const provider = createOpenAICompatible({
    name: 'azure',
    apiKey: process.env.OPENAPI_API_KEY,
    baseURL: process.env.OPENAI_API_BASE_URL || "",
});

export async function POST(req: Request) {
    const { messages } = await req.json();
    const result = streamText({
        model: provider('openai'),
        system: systemInstructions,
        messages,
        maxSteps: 5,
        tools
    });

    return result.toDataStreamResponse();
}