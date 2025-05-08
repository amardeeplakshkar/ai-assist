'use client'

import React, { useEffect, useState } from 'react'
import { useChat } from '@ai-sdk/react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { TextShimmerWave } from '@/components/ui/text-shimmer-wave';
import { ChatMessageList } from '@/components/ui/chat-message-list';
import { Separator } from '@/components/ui/separator';
import { boolean } from 'zod';

const MainPage = () => {
  const { messages, input, handleInputChange, handleSubmit, isLoading, } = useChat({
    experimental_throttle: 50, onToolCall: (...args) => {
      setIsToolCalling(true);
    },
  });

  const [isToolCalling, setIsToolCalling] = useState(false)

  useEffect(() => {
    if (!isLoading && isToolCalling) {
      setIsToolCalling(false);
    }
  }, [isLoading, isToolCalling]);

  return (
    <div className='flex flex-col overflow-hidden'>
      <ChatMessageList className='flex-1'>
        <ChatMessage isUser={false} content={{
          role: "system",
          content: "Hello, I am IRIS, your Intelligent Response and Interactive System, Sir. I am here to assist you with any questions or tasks related to science, technology, engineering, and mathematics. How may I be of service to you today?"
        }} />
        {
          messages.map((msg, i) =>
            <ChatMessage key={i} isUser={msg.role === "user"} content={msg} />
          )
        }
        {isLoading && !isToolCalling && (
          <TextShimmerWave>
            Typing...
          </TextShimmerWave>
        )}
      </ChatMessageList>
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isGenerating={isLoading}
      />
    </div>
  )
}

export default MainPage