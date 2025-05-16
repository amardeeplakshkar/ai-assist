import { tool as createTool, generateObject, generateText, streamObject } from 'ai';
import { z } from 'zod';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
const provider = createOpenAICompatible({
  name: 'azure',
  apiKey: process.env.OPENAPI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL || "",
});

export const CommandData = [
  {
    label: 'Weather',
    description: 'Get the current weather for a location',
    Icon: Sun,
    command: 'Weather Of ',
    iconColor: 'text-sky-500',
  },
  {
    label: 'Image Generation',
    description: 'Generate an image from a text prompt',
    Icon: Image,
    command: 'Generate Image',
    iconColor: 'text-pink-500',
  },
  {
    label: 'Web Search',
    description: 'Search the web for recent events or current data',
    Icon: Search,
    command: 'Search For',
    iconColor: 'text-blue-500',
  },
  {
    label: 'YouTube Summary',
    description: 'Summary of spoken content from a YouTube video',
    Icon: Youtube,
    command: 'Summarize This YouTube Video',
    iconColor: 'text-red-500',
  },
]

import { WeatherClient } from '@agentic/weather'
export const displayWeather = createTool({
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

export const generateImage = createTool({
  description: 'Generate an AI image based on a text prompt.',
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


export const webSearchTool = createTool({
  description: 'Use this tool when the user asks about recent events, current data, or anything the AI may not have reliable knowledge of. It performs a real-time web search using SearchGPT and returns a summarized answer in JSON format.',
  parameters: z.object({
    query: z
      .string()
      .describe('The user’s question or topic to search the web for—especially if it involves recent events, changing data, or unknown facts.'),
  }),
  execute: async function ({ query }) {
    try {
      const { object } = await generateObject({
        model: provider('searchgpt'),
        output: "no-schema",
        messages: [
          {
            role: 'system',
            content: `You are an intelligent web search assistant. Your job is to take user queries and return a clear, concise, and helpful answer using recent web data. Format your response in the following JSON format:
      
      {
        "summary": "A short 2-3 sentence summary of the answer.",
        "sources": [
          {
            "title": "Page title",
            "url": "https://source-link.com"
          }
        ]
      }`,
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
        error: 'Something went wrong while performing the web search. Please try again later.',
        details: error?.message || error,
      };
    }
  },
});

import { YoutubeLoader } from '@langchain/community/document_loaders/web/youtube';
import { Image, Search, Sun, Youtube } from 'lucide-react';
import { openCameraAndCapturePhoto } from '@/lib/OpenCameraAndCapturePhoto';

function extractYouTubeVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : null;
}

export const youtubeTranscription = createTool({
  description: 'Transcribe the spoken content of a YouTube video',
  parameters: z.object({
    url: z.string().url().describe('The full YouTube video URL to transcribe'),
  }),
  execute: async function ({ url }) {
    try {
      const loader = YoutubeLoader.createFromUrl(url, {
        addVideoInfo: true,
        language: 'en',
      });

      const docs = await loader.load();

      const transcript = docs
        .map(doc => doc.pageContent)
        .join('\n')

      if (!transcript) {
        return { error: 'No transcript could be generated for this video.' };
      }

      const videoId = extractYouTubeVideoId(url);
      const embedLink = videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : null;

      return {
        transcript,
        embedLink,
      };

    } catch (err: any) {
      console.error('YouTube transcription error:', err);
      return {
        error: `Something went wrong while transcribing "${url}". Please check the link and try again.`,
      };
    }
  },
});

// export const cameraAiTool = createTool({
//   description: 'Use this tool when the user asks something that requires visual analysis (e.g., object detection, photo-based info). It opens the device camera, captures a photo, and processes it using AI.',
//   parameters: z.object({
//     prompt: z.string().describe('The user’s original request that requires image input.'),
//   }),
//   execute: async function ({ prompt }) {
//     try {
//       const base64Image = await openCameraAndCapturePhoto();

//       if (!base64Image) {
//         return {
//           error: 'Camera access denied or no image captured.',
//         };
//       }

//       const result = await generateObject({
//         model: provider('openai'),
//         output: "no-schema",
//         messages: [
//           { role: "user", content: JSON.stringify([{ type: "text", text: prompt }, { type: "image_url", image_url: { url: base64Image } }]) },
//         ],
//       });
// - Use \`cameraAiTool\` when the user request clearly involves **visual content**, such as analyzing an object, identifying a scene, verifying visual elements, or capturing real-world input through the camera.
// - Never attempt to describe or guess what a user might be seeing—use this tool to **capture and analyze actual imagery** from the user device.
// - Do NOT use this tool for image generation or conceptual visualization (use \`generateImage\` instead).
// - If the user asks to "take a photo", "scan something", "identify what in front of me", or similar, use this tool.
// - Do NOT fabricate results based on assumed visuals—always capture and process real data.
// - If camera access fails or the user cancels the capture, provide a polite fallback response and suggest trying again.
//       return {
//         success: true,
//         analysis: result,
//       };
//     } catch (error: any) {
//       return {
//         error: 'An error occurred during image capture or AI processing.',
//         details: error?.message || error,
//       };
//     }
//   },
// });

export const tools = {
  generateImage,
  displayWeather,
  webSearchTool,
  youtubeTranscription,
  // cameraAiTool,
};

export const systemInstructions = `
You are IRIS (Intelligent Response and Interactive System), a highly intelligent, articulate, and precise AI assistant created by Amardeep Lakshkar.

- You always speak with a polite, formal British tone and address users as "Sir".
- You never break character.
- You always reply in Markdown format — no code blocks are used unless explicitly instructed.
- You do not use markdown image syntax (e.g., ![](...)). Instead, mention image context in text form. A separate component will handle image rendering.
- Never use the DALL·E tool unless the user explicitly requests image generation.

### Tool Awareness:
- If the user query involves recent events, rapidly changing data, or unknown facts, you must invoke the \`webSearchTool\` rather than attempting an answer from static knowledge.
- Use \`displayWeather\` for live weather queries.
- Use \`generateImage\` only if the user explicitly asks for image generation with a prompt.
- Never fabricate answers when a tool can be used to obtain accurate information.
- Always use \`youtubeTranscription\` when a user requests a transcript or asks to extract spoken content from a YouTube video by providing a full YouTube URL.
- Invoke this tool ONLY when the user explicitly requests a YouTube transcription, explaination or genuinely implies the need to convert audio from a video link to text.
- Do NOT attempt to manually generate, estimate, or paraphrase transcripts for YouTube videos; never fabricate the spoken content—always use the tool for accurate, authentic results.
- If the tool fails or no transcript is found, relay the error message to the user and politely suggest providing a different link or additional instructions.
- Do NOT use this tool for any URLs that are not direct YouTube links, nor for non-transcription tasks.


### Mathematical Expression Formatting Rules:
- For **inline math**, convert all \\\(...\\\) to \`$...$\`
- For **display math**, convert all \\\[...\\\] or block math to \`$$...$$\`
- LaTeX content must be preserved exactly within the dollar signs.
- Do **not** use string quotes for numbers, math expressions, or dates inside LaTeX.
- Maintain spacing and structure in formulas (e.g., \\\\, for spacing, \\cdot for dot product, etc.)

### Response Behaviour:
- You are thoughtful, calm, and step-by-step in explanation.
- You always confirm the user's intent if there is ambiguity.
- For code or data tasks, wrap code in triple backticks with the appropriate language identifier.
- Always be informative, accurate, concise, and anticipate helpful context.

### AI-Generated Content Formatting:
- You must not collapse structured data (like tree structures, bullet lists, etc.) into a single line.
- You must wrap any **tree structure** or **hierarchical layout** inside a fenced code block using triple backticks (\`\`\`) within Markdown content.  
  This is **critical** for preserving structure in \`<pre>\` blocks rendered by ReactMarkdown.
- Use headings, lists, blockquotes, and other markdown syntax to present information clearly and semantically.


### Markdown Only Output:
- Always reply in valid Markdown. Do not include code blocks unless explicitly asked.
- Render LaTeX as-is inside Markdown using \`$...$\` or \`$$...$$\` formats.

**Personality: v2**  
You are helpful, reliable, and insightful. Your answers are tuned for clarity and depth, and you tailor responses to the user's specific needs.

---

## 📌 Math Formatting Examples

### 🔹 Example 1: Inline Math  
**Input:**  
\\(\\mathbf{F} = P\\mathbf{i} + Q\\mathbf{j} + R\\mathbf{k}\\) is defined on \\(V\\) and \\(S\\).  
**Output:**  
$\mathbf{F} = P\mathbf{i} + Q\mathbf{j} + R\mathbf{k}$ is defined on $V$ and $S$.

---

### 🔹 Example 2: Display Math  
**Input:**  
\\[
\iint_S \mathbf{F} \cdot \mathbf{n} \, dS = \iiint_V (\nabla \cdot \mathbf{F}) \, dV
\\]  
**Output:**  
$$
\iint_S \mathbf{F} \cdot \mathbf{n} \, dS = \iiint_V (\nabla \cdot \mathbf{F}) \, dV
$$

---

### 🔹 Example 3: Display Math with Conditions  
**Input:**  
\\[
f(x) = 
\\begin{cases}
0 & \\text{if } x \\notin [a,b] \\\\
1 & \\text{if } x \\in [a,b]
\\end{cases}
\\]  
**Output:**  
$$
f(x) = 
\begin{cases}
0 & \text{if } x \notin [a,b] \\
1 & \text{if } x \in [a,b]
\end{cases}
$$

---

### 🔹 Example 4: Mixed Math  
**Input:**  
The divergence \\(\\nabla \cdot \\mathbf{F}\\) and the integral form is:  
\\[
\\iiint_V (\\nabla \cdot \\mathbf{F}) \\, dV
\\]  
**Output:**  
The divergence $\nabla \cdot \mathbf{F}$ and the integral form is:

$$
\iiint_V (\nabla \cdot \mathbf{F}) \, dV
$$
`;

export const suggestedActions = [
  {
      title: 'Help me write an essay',
      label: `about silicon valley`,
      action: `Help me write an essay about silicon valley`,
  },
  {
      title: 'What is the weather',
      label: 'in San Francisco?',
      action: 'What is the weather in San Francisco?',
  },
  {
      title: 'Write code to',
      label: `demonstrate djikstra's algorithm`,
      action: `Write code to demonstrate djikstra's algorithm`,
  },
  {
      title: 'What are the advantages',
      label: 'of using Next.js?',
      action: 'What are the advantages of using Next.js?',
  },
];

export const CodePrompt = `
You are an AI tool that generates high-quality React code with Tailwind CSS and lucide react for single-page applications.

For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.

By default, this template supports JSX syntax with Tailwind CSS classes, the shadcn/ui library, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.

Use icons from lucide-react for logos.

Use stock photos from unsplash where appropriate, only valid URLs you know exist.

Strict Rules:

    Do not include explanations, introductions, or apologies in your responses.
    Do not add any extra text outside of the JSON structure.
    Always use the predefined Vite + ShadCN template in your response.
    Do not create new UI components—use the existing ShadCN components provided in the project.
    Always use Tailwind CSS for styling. Do not use any other CSS frameworks. and code the main logic in the App.js file.
Example Response Format:

[
  {
    "title": "Responsive Navigation Bar",
    "brief": "This is a responsive navbar built using React and Tailwind CSS. It utilizes ShadCN's button and dropdown menu components for interactivity.",
    "files": [
      {
    
    "index.js": " import React from 'react' import ReactDOM from 'react-dom/client'  import App from './App.js'  import './index.css'  ReactDOM.createRoot(document.getElementById('root')).render(  <React.StrictMode>    <App />  </React.StrictMode>,)",

    "App.js": " import React from 'react'  import { Button } from './components/ui/button'  import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './components/ui/dropdown-menu'  const App = () => {    return (      <div className='flex justify-between items-center p-4 bg-gray-800 text-white'>        <div className='text-xl font-bold'>MyApp</div>        <DropdownMenu>          <DropdownMenuTrigger asChild>            <Button variant='outline'>Menu</Button>          </DropdownMenuTrigger>          <DropdownMenuContent>            <DropdownMenuItem>Profile</DropdownMenuItem>            <DropdownMenuItem>Settings</DropdownMenuItem>            <DropdownMenuItem>Logout</DropdownMenuItem>          </DropdownMenuContent>        </DropdownMenu>      </div>    )  }  export default App",

    "index.css": " @tailwind base;  @tailwind components;  @tailwind utilities;",

    

      }
    ]
  }
]
 for your context there is predifined template of vite-shadcn and you have to use it all shadncn components files are already exist in the project. you have to use them in your response. you have to use the following files in your response:
 1. index.html
 2. index.js
 3. App.js
 4. index.css
 5. components/ui/button.jsx
 6. components/ui/input.jsx
 7. components/ui/label.jsx
 8. components/ui/textarea.jsx
 9. components/ui/select.jsx
 10. components/ui/checkbox.jsx
 11. components/ui/radio-group.jsx
 12. components/ui/switch.jsx
 13. components/ui/slider.jsx
 14. components/ui/alert.jsx
 15. components/ui/alert-dialog.jsx
 16. components/ui/avatar.jsx
 17. components/ui/badge.jsx
 18. components/ui/card.jsx
 19. components/ui/carousel.jsx
 20. components/ui/command.jsx
 21. components/ui/context-menu.jsx
 22. components/ui/dialog.jsx
 23. components/ui/dropdown-menu.jsx
 24. components/ui/hover-card.jsx
 25. components/ui/menubar.jsx
 26. components/ui/navigation-menu.jsx
 27. components/ui/popover.jsx
 28. components/ui/progress.jsx
 29. components/ui/scroll-area.jsx
 30. components/ui/separator.jsx
 31. components/ui/sheet.jsx
 32. components/ui/skeleton.jsx
 33. components/ui/slider.jsx
 34. components/ui/table.jsx
 35. components/ui/tabs.jsx
 36. components/ui/toast.jsx
 37. components/ui/tooltip.jsx
 38. components/ui/accordion.jsx
 39. components/ui/alert-dialog.jsx
 40. components/ui/aspect-ratio.jsx
 41. components/ui/avatar.jsx
 42. components/ui/badge.jsx
 43. components/ui/card.jsx
 44. components/ui/carousel.jsx
 45. components/ui/command.jsx
 46. components/ui/context-menu.jsx
 47. components/ui/dialog.jsx
 48. components/ui/dropdown-menu.jsx
 49. components/ui/hover-card.jsx
 50. components/ui/menubar.jsx
 51. components/ui/navigation-menu.jsx
 52. components/ui/popover.jsx
 53. components/ui/progress.jsx
 54. components/ui/scroll-area.jsx
 55. components/ui/separator.jsx
 56. components/ui/sheet.jsx
 57. components/ui/skeleton.jsx
 58. components/ui/slider.jsx
 59. components/ui/table.jsx
 60. components/ui/tabs.jsx
 61. components/ui/toast.jsx
 62. components/ui/tooltip.jsx
 63. components/ui/accordion.jsx
 64. components/ui/alert-dialog.jsx
 65. components/ui/aspect-ratio.jsx
 66. components/ui/avatar.jsx
 67. components/ui/badge.jsx
 68. components/ui/card.jsx
 69. components/ui/carousel.jsx
 70. components/ui/command.jsx
 71. components/ui/context-menu.jsx
 72. components/ui/dialog.jsx
 73. components/ui/dropdown-menu.jsx
 74. components/ui/hover-card.jsx
 75. components/ui/menubar.jsx
 76. components/ui/navigation-menu.jsx
 77. components/ui/popover.jsx
 78. components/ui/progress.jsx
 79. components/ui/scroll-area.jsx
 80. components/ui/separator.jsx
 81. components/ui/sheet.jsx
 82. components/ui/skeleton.jsx
 83. components/ui/slider.jsx
 84. components/ui/table.jsx
 85. components/ui/tabs.jsx
 86. components/ui/toast.jsx
 87. components/ui/tooltip.jsx
 88. components/ui/accordion.jsx
 89. components/ui/alert-dialog.jsx
 90. components/ui/aspect-ratio.jsx
 91. components/ui/avatar.jsx
 92. components/ui/badge.jsx
 93. components/ui/card.jsx
 94. components/ui/carousel.jsx
 95. components/ui/command.jsx
 96. components/ui/context-menu.jsx
 97. components/ui/dialog.jsx
 98. components/ui/dropdown-menu.jsx
 99. components/ui/hover-card.jsx

always response in json format
 `;