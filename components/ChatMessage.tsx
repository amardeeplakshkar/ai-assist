'use client'

import React, { useEffect, useRef } from 'react';
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
import { Copy, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'react-toastify';
import Image from 'next/image';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Attachment } from 'ai';

interface ChatMessageProps {
  content: any;
  isUser: boolean;
}

const renderers = {
  table({ node, className, children, ...props }: any) {
    return (
      <div className="my-4 w-full overflow-x-auto">
        <Table
          className='rounded overflow-hidden'
          {...props}
        >
          {children}
        </Table>
      </div>
    );
  },
  thead({ node, ...props }: any) {
    return <TableHeader {...props} />;
  },
  tbody({ node, ...props }: any) {
    return <TableBody {...props} />;
  },
  tr({ node, ...props }: any) {
    return (
      <TableRow
        className='hover:bg-secondary-foreground/20'
        {...props}
      />
    );
  },
  th({ node, ...props }: any) {
    return (
      <TableHead
        className='font-bold border-0 text-white bg-secondary-foreground'
        {...props}
      />
    );
  },
  td({ node, ...props }: any) {
    return (
      <TableCell
        className=''
        {...props}
      />
    );
  },
};

const ChatMessage: React.FC<ChatMessageProps> = ({ content: msg, isUser }) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    }).catch(err => {
      toast.error('Failed to copy: ', err);
    });
  };

  const imageAttachments = msg?.experimental_attachments?.filter(
    (attachment: Attachment) => attachment?.contentType?.startsWith('image/')
  ) || [];

  const pdfAttachments = msg?.experimental_attachments?.filter(
    (attachment: Attachment) => attachment?.contentType?.startsWith('application/pdf')
  ) || [];

  const hasSpokenRef = useRef(false);
  
  useEffect(() => {
    if (msg.role === 'user') return;
  
    const handler = setTimeout(() => {
      if (msg?.content && !hasSpokenRef.current) {
        enqueueTTS(String(msg.content).trim());
        hasSpokenRef.current = true;
      }
    }, 100);
  
    return () => clearTimeout(handler);
  }, [msg?.content]);
  
  let ttsQueue: string[] = [];
  let isSpeaking = false;

  const processQueue = async () => {
    if (ttsQueue.length === 0 || isSpeaking) return;

    isSpeaking = true;
    const text = ttsQueue.shift();

    if (text) {
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);

        audio.addEventListener('ended', () => {
          isSpeaking = false;
          processQueue(); 
        });

        audio.addEventListener('error', () => {
          isSpeaking = false;
          processQueue();
        });

        audio.play();
      } catch (err) {
        console.error('TTS error:', err);
        isSpeaking = false;
        processQueue();
      }
    }
  };

  const enqueueTTS = (text: string) => {
    ttsQueue.push(text);
    processQueue();
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
          {imageAttachments.length > 0 && (
            <div className={`flex flex-wrap ${imageAttachments.length > 1 ? '' : ''}`}>
              {imageAttachments.map((attachment: Attachment, index: number) => (
                <Image
                  key={`${msg?.id}-image-${index}`}
                  src={attachment.url}
                  width={80}
                  height={80}
                  alt={attachment.name ?? `attachment-${index}`}
                  className="rounded-[1.5rem] overflow-hidden"
                />
              ))}
            </div>
          )}

          {pdfAttachments.map((attachment: Attachment, index: number) => (
            <iframe
              key={`${msg?.id}-pdf-${index}`}
              src={attachment.url}
              className="w-full h-96 mt-4 rounded border"
              title={attachment.name ?? `attachment-${index}`}
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
                remarkPlugins={[remarkMath, remarkGfm, remarkEmoji, remarkToc]}
                rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
                components={{
                  ...renderers,
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
                            onClick={() => handleCopy(String(children).replace(/\n$/, ''))}
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
        {
          msg.role !== "user" &&
          <div className='flex items-center gap-2'>
            <Button
              size="sm"
              onClick={() => handleCopy(String(msg.content).replace(/\n$/, ''))}
              variant="outline"
              className="cursor-pointer my-1 shadow-md"
            >
              <Copy size={16} />
            </Button>
            <Button
              size="sm"
              onClick={() => enqueueTTS(String(msg.content).replace(/\n$/, ''))}
              variant="outline"
              className="cursor-pointer my-1 shadow-md"
            >
              <Volume2 size={16} />
            </Button>
          </div>
        }
      </div>
    </div>
  );
};

export default ChatMessage;