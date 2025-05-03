import { systemInstructions, tools } from '@/constants';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

export const maxDuration = 30;

const provider = createOpenAICompatible({
  name: 'azure',
  apiKey: process.env.OPENAPI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL || "",
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const messagesHavePDF = messages.some(
      (message: { experimental_attachments: any[] }) =>
        message.experimental_attachments?.some(
          (a: { contentType: string }) => a.contentType === 'application/pdf'
        )
    );

    const result = streamText({
      model: messagesHavePDF
        ? google('gemini-2.5-flash-preview-04-17')
        : provider('openai'),
      system: systemInstructions,
      messages,
      maxSteps: 5,
      tools,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('POST handler error:', error);

    return new Response(
      JSON.stringify({ error: 'An error occurred while processing the request.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
