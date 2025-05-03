import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { cn } from '@/lib/utils';
import 'katex/dist/katex.min.css';
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import WeatherCard from './Widgets/Weather';
import ImageDisplay from './Widgets/ImageDisplay';
import { TextShimmerWave } from './ui/text-shimmer-wave';
import { Copy } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'react-toastify';
import Image from 'next/image';

interface ChatMessageProps {
  content: any;
  isUser: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content: msg, isUser }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content).then(() => {
      toast.success('Copied to clipboard!');
    }).catch(err => {
      toast.error('Failed to copy: ', err);
    });
  };
  return (
    <div className={cn(
      "flex w-full mb-4 animate-fade-in",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className='max-w-[85%]'>
        <div>
          {msg.toolInvocations?.map((toolInvocation: any) => {
            const { toolName, toolCallId, state } = toolInvocation;

            return (
              <div key={toolCallId}>
                {toolName === 'displayWeather' || toolName === 'duckDuckGo' || toolName === 'generateImage' ? (
                  state === 'result' ? (
                    toolName === 'displayWeather' ? (
                      <div>
                        {
                          toolInvocation?.result?.location?.name &&
                          <WeatherCard data={toolInvocation?.result} />
                        }
                      </div>
                    ) : toolName === 'generateImage' ? (
                      <ImageDisplay
                        src={toolInvocation?.result?.imageUrl}
                        prompt={toolInvocation?.result?.prompt}
                      />
                    ) : toolName === 'duckDuckGo' ? (
                      <>
                        called duck duck go
                      </>
                    ) : null
                  ) : (
                    <TextShimmerWave className="font-mono text-sm" duration={1}>
                      {toolName === 'displayWeather' ? 'Loading Weather Data...' : 'Generating Image...'}
                    </TextShimmerWave>
                  )
                ) : null}
              </div>
            );
          })}
          {msg?.experimental_attachments
            ?.filter((attachment: any) => attachment?.contentType?.startsWith('image/'))
            .map((attachment: any, index: number) => (
              <Image
                className='rounded-xl mb-1'
                key={`${msg?.id}-${index}`}
                src={attachment.url}
                width={200}
                height={200}
                alt={attachment.name ?? `attachment-${index}`}
              />
            ))}
        </div>
        {
          !msg.content ? null :
            <div className={cn(
              "rounded-lg px-4 py-3 shadow",
              isUser
                ? "bg-[#f0f9ff] text-gray-800"
                : "bg-gradient-to-r from-[#6366f1] to-[#818cf8] text-white"
            )}>
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className='group relative'>
                        <div className='bg-[#282a36] rounded-md h-[3rem] -mb-7.5' />
                        <SyntaxHighlighter
                          style={dracula}
                          language={"javascript"}
                          PreTag="div"
                          className="rounded-md"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                        <div className="absolute top-2 right-2 transition-opacity duration-200">
                          <Button
                            size="sm"
                            onClick={handleCopy}
                            variant="secondary"
                            className="flex cursor-pointer items-center gap-1 bg-white/10 text-white backdrop-blur-sm hover:bg-white/15 shadow-md"
                          >
                            <Copy size={16} />
                            <span>Copy</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <code className={cn("bg-gray-200 dark:bg-gray-800 rounded-sm px-1 py-0.5", className)} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {msg?.content}
              </ReactMarkdown>
            </div>
        }
      </div>
    </div>
  );
};

export default ChatMessage;