'use client'

import React from 'react'
import { useChat } from '@ai-sdk/react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { TextShimmerWave } from '@/components/ui/text-shimmer-wave';

const MainPage = () => {
  const { messages, input, handleInputChange, handleSubmit, isLoading, } = useChat();
  return (
    <div className='flex flex-col h-dvh'>
      <section className='flex-1'>
        {
          messages.map((msg, i) =>
            <ChatMessage key={i} isUser={msg.role === "user"} content={msg} />
          )
        }
        { 
          isLoading &&
          <TextShimmerWave>
            Typing...
          </TextShimmerWave>
        }
      </section>
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