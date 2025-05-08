'use client'

import React, { useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { cn } from '@/lib/utils';
import 'katex/dist/katex.min.css';
import WeatherCard from './Widgets/Weather';
import ImageDisplay from './Widgets/ImageDisplay';
import { TextShimmerWave } from './ui/text-shimmer-wave';
import { Brain, Copy, ExternalLink, User, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'react-toastify';
import Image from 'next/image';
import rehypeRaw from 'rehype-raw';
import remarkEmoji from 'remark-emoji';
import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';
import { Attachment } from 'ai';
import { renderers } from '@/constants/renderers';
import { ChatBubbleAvatar } from './ui/chat-bubble';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import Link from 'next/link';

interface ChatMessageProps {
  content: any;
  isUser: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content: msg, isUser }) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    }).catch(err => {
      toast.error('Failed to copy: ', err);
    });
  };

  const imageAttachments = useMemo(() =>
    msg?.experimental_attachments?.filter(
      (attachment: Attachment) => attachment?.contentType?.startsWith('image/')
    ) || [],
    [msg?.experimental_attachments]
  );

  const pdfAttachments = useMemo(() =>
    msg?.experimental_attachments?.filter(
      (attachment: Attachment) => attachment?.contentType?.startsWith('application/pdf')
    ) || [],
    [msg?.experimental_attachments]
  );

  const hasSpokenRef = useRef(false);
  const ttsQueueRef = useRef<string[]>([]);
  const isSpeakingRef = useRef(false);

  const processQueue = async () => {
    if (ttsQueueRef.current.length === 0 || isSpeakingRef.current) return;

    isSpeakingRef.current = true;
    const text = ttsQueueRef.current.shift();

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
          isSpeakingRef.current = false;
          URL.revokeObjectURL(url);
          processQueue();
        });

        audio.addEventListener('error', () => {
          isSpeakingRef.current = false;
          URL.revokeObjectURL(url);
          processQueue();
        });

        await audio.play();
      } catch (err) {
        console.error('TTS error:', err);
        isSpeakingRef.current = false;
        processQueue();
      }
    }
  };

  const enqueueTTS = (text: string) => {
    ttsQueueRef.current.push(text);
    processQueue();
  };

  const variant = msg.role === "user" ? "sent" : "received";

  const memoizedContent = useMemo(() => (
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm, remarkEmoji, remarkToc]}
      rehypePlugins={[rehypeKatex, rehypeRaw]}
      components={renderers}
    >
      {msg?.content}
    </ReactMarkdown>
  ), [msg?.content]);

  return (
    <div className={cn(
      "flex w-full mb-4 animate-fade-in",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className='max-w-[85%]'>
        <div key={msg.id} className="py-6 first:pt-0 last:pb-0">
          <div className="flex gap-3">
            <ChatBubbleAvatar
              Icon={variant !== "sent"
                ? <Brain className='text-blue-500' size={20} />
                : <User className='text-yellow-500' size={20} />
              }
            />
            <div className="flex-1 max-w-[100%]">
              <div>
                {msg.toolInvocations?.map((toolInvocation: any) => {
                  const { toolName, toolCallId, state } = toolInvocation;

                  return (
                    <div key={toolCallId}>
                      {toolName === 'displayWeather' || toolName === 'webSearchTool' || toolName === 'generateImage' ? (
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
                          ) : toolName === 'webSearchTool' ? (
                            <>
                              <Tabs defaultValue='answer'>
                                <TabsList className='w-full'>
                                  <TabsTrigger value='answer'>Answer</TabsTrigger>
                                  <TabsTrigger value='source'>Sources</TabsTrigger>
                                </TabsList>
                                <TabsContent value='answer'>
                                  <ReactMarkdown
                                    remarkPlugins={[remarkMath, remarkGfm, remarkEmoji, remarkToc]}
                                    rehypePlugins={[rehypeKatex, rehypeRaw]}
                                    components={renderers}
                                  >
                                    {toolInvocation?.result?.summary}
                                  </ReactMarkdown>
                                </TabsContent>
                                <TabsContent value='source'>
                                  {toolInvocation?.result?.sources.map((source: any, i: number) =>
                                    <Link href={source.url} target='_blank' key={i}>
                                      <div className="bg-card mb-2 cursor-pointer hover:bg-secondary/20 transition-all duration-300 rounded-xl p-2 shadow-md hover:shadow-xl border border-border/40 backdrop-blur-sm">
                                        <div className="flex items-center gap-3">
                                          <div className="p-2.5 bg-gradient-to-br from-primary/80 to-primary rounded-full flex-shrink-0 shadow-inner flex items-center justify-center text-primary-foreground">
                                            <ExternalLink className="h-5 w-5" />
                                          </div>
                                          <div className="space-y-1">
                                            <h4 className="font-medium line-clamp-1 text-sm">{source.url}</h4>
                                            <p className="text-sm line-clamp-1 text-muted-foreground">{source.title}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </Link>
                                  )
                                  }
                                </TabsContent>
                                <Separator />
                                <p className='text-muted-foreground text-sm'>Summary:</p>
                              </Tabs>
                            </>
                          ) : null
                        ) : (
                          <TextShimmerWave className="font-mono text-sm" duration={1}>
                            {toolName === 'displayWeather' && 'Loading Weather Data...' || toolName === 'webSearchTool' && 'Searching Web..' || toolName === 'generateImage' && 'Generating Image...' || ""}
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
              {memoizedContent}
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
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChatMessage);