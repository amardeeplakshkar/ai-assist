import { tool as createTool } from 'ai';
import { z } from 'zod';

import { WeatherClient } from '@agentic/weather'


export const weatherTool = createTool({
  description: 'Display the weather for a location',
  parameters: z.object({
    location: z.string().describe('The location to get the weather for'),
  }),
  execute: async function ({ location }) {
    try {
      const cleanedLocation = location.trim().toLowerCase()
      const weather = new WeatherClient()
      const res = await weather.getCurrentWeather(cleanedLocation)

      if (!res || !res.current || !res.location) {
        return { error: 'Sorry, we don’t have weather data for that location.' }
      }

      return res;

    } catch (err: any) {
      const status = err?.response?.status || err?.status

      if (status === 400) {
        return {
          error: `Sorry, we don’t have weather data for "${location}".`,
        }
      }

      return {
        error: `Something went wrong while fetching weather for "${location}". Please try again later.`,
      }
    }
  },
})



export const generateImageTool = createTool({
  description: 'Generate an AI image based on a text prompt. Do not give image link at any cost.',
  parameters: z.object({
    prompt: z.string().describe('The text description to generate an image from'),
    width: z.number().optional().describe('Width of the image (optional)'),
    height: z.number().optional().describe('Height of the image (optional)'),
  }),
  execute: async function ({ prompt, width = 1024, height = 1024 }) {
    try {
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&width=${width}&height=${height}`

      const res = await fetch(imageUrl)
      if (!res.ok) {
        return { error: 'Sorry, we couldn’t generate an image for that prompt.' }
      }

      return {
        prompt,
        imageUrl,
      }
    } catch (err: any) {
      return {
        error: 'Something went wrong while generating the image. Please try again later.',
      }
    }
  },
})

import { ArXivClient } from '@agentic/arxiv'

export const arxivSearchTool = createTool({
  description: 'Search academic papers from ArXiv',
  parameters: z.object({
    query: z.string().describe('The search query for academic papers'),
    maxResults: z.number().min(1).max(50).default(10).describe('The maximum number of results to return'),
  }),
  execute: async function ({ query, maxResults }) {
    try {
      const arxiv = new ArXivClient({

      })
      const results = await arxiv.search({ start: 0, searchQuery: query.trim(), maxResults })

      if (!results || results.totalResults === 0) {
        return { error: `No papers found for "${query}".` }
      }
      console.log(results);
      
      return results
    } catch (err: any) {
      return {
        error: `Something went wrong while searching for "${query}". Please try again later.`,
      }
    }
  },
})
export const tools = {
  generateImage: generateImageTool,
  displayWeather: weatherTool,
  duckDuckGo: arxivSearchTool,
};

export const systemInstructions = `
Your name is IRIS (Intelligent Response and Interactive System). You are a helpful AI voice assistant and an expert in all STEM fields, providing concise and accurate information.

- Do not mention that you are a chatbot; you are a female voice assistant.
- Always speak with a polite British tone and address users as "Sir".
- Use LaTeX formatting for all mathematical expressions:
  • Wrap inline math equations in single dollar signs, e.g. $a^2 + b^2 = c^2$
  • Wrap display-style equations in double dollar signs, e.g. $$E = mc^2$$

Response Guidelines:
- When asked to perform a task that involves code or execution, respond with the code block wrapped in triple backticks and the language identifier \`tool_code\`.
- If the task does not require a function or code execution, respond directly with an informative answer.
- Always be helpful, informative, and accurate in your responses.

You are IRIS. You never break character.
`;
