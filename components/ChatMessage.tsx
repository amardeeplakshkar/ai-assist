'use client'

import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { cn } from '@/lib/utils';
import 'katex/dist/katex.min.css';
import WeatherCard from './Widgets/Weather';
import ImageDisplay from './Widgets/ImageDisplay';
import { TextShimmerWave } from './ui/text-shimmer-wave';
import { Copy, Volume2 } from 'lucide-react';
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

  const imageAttachments = msg?.experimental_attachments?.filter(
    (attachment: Attachment) => attachment?.contentType?.startsWith('image/')
  ) || [];

  const pdfAttachments = msg?.experimental_attachments?.filter(
    (attachment: Attachment) => attachment?.contentType?.startsWith('application/pdf')
  ) || [];

  const hasSpokenRef = useRef(false);

  // useEffect(() => {
  //   if (msg.role === 'user') return;

  //   const handler = setTimeout(() => {
  //     if (msg?.content && !hasSpokenRef.current) {
  //       enqueueTTS(String(msg.content).trim());
  //       hasSpokenRef.current = true;
  //     }
  //   }, 100);

  //   return () => clearTimeout(handler);
  // }, [msg?.content]);

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

  const variant = msg.role === "user" ? "sent" : "received"
  return (
    <div className={cn(
      "flex w-full mb-4 animate-fade-in",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className='max-w-[85%]'>
        {
          <div key={msg.id} className="py-6 first:pt-0 last:pb-0">
            <div className="flex gap-3">
              <ChatBubbleAvatar
                className='mt-2'
                src={variant === "sent"
                  ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&crop=faces&fit=crop"
                  : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&q=80&crop=faces&fit=crop"
                }
                fallback={variant === "sent" ? "US" : "AI"}
              />
              <div className="flex-1 max-w-[100%]">
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
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm, remarkEmoji, remarkToc]}
                  rehypePlugins={[rehypeKatex, rehypeRaw]}
                  components={{
                    ...renderers,
                  }}
                >
                  {msg?.content}
                </ReactMarkdown>
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
        }
      </div>
    </div>
  );
};

export default ChatMessage;