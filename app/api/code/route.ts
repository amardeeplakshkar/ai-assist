import { systemInstructions, tools } from '@/constants';
import { getFineTunedPrompt } from '@/constants/codePromptNew';
import { codeTools } from '@/constants/codeTools';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText, createDataStreamResponse } from 'ai';

export const maxDuration = 30;

const provider = createOpenAICompatible({
  name: 'azure',
  apiKey: process.env.OPENAPI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL || "",
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    return createDataStreamResponse({
      execute: (dataStream) => {
        dataStream.writeData('initialized call');

        const result = streamText({
          model : provider('openai-large'),
          system: getFineTunedPrompt(),
          messages,
          toolCallStreaming: true,
          maxSteps: 5,          
        });

        result.mergeIntoDataStream(dataStream);        
      },
      onError: (error) => {
        return error instanceof Error ? error.message : String(error);
      },
    });
  } catch (error) {
    console.error('POST handler error:', error);

    return new Response(
      JSON.stringify({ error: 'An error occurred while processing the request.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}



// import { CodePrompt } from '@/constants';
// import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
// import { generateObject } from 'ai';
// import { google } from '@ai-sdk/google';
// import { z } from 'zod';

// export const maxDuration = 30;

// const schema = z.object({
//   title: z.string(),
//   brief: z.string(),
//   files: z.array(z.record(z.string(), z.string())),
// });

// const provider = createOpenAICompatible({
//   name: 'azure',
//   apiKey: process.env.OPENAPI_API_KEY,
//   baseURL: process.env.OPENAI_API_BASE_URL || "",
// });

// export async function POST(req: Request) {
//   try {
//     const { messages } = await req.json();

//     const { object } = await generateObject({
//       model: provider("openai-fast"),
//       mode: 'json',
//       system: CodePrompt,
//       messages,
//       schema,
//     });

//     console.log('Generated object:', object);
//     return Response.json(object);
//   } catch (error) {
//     console.error('POST handler error:', error);

//     return new Response(
//       JSON.stringify({ error: 'An error occurred while processing the request.' }),
//       { status: 500, headers: { 'Content-Type': 'application/json' } }
//     );
//   }
// }
