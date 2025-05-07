'use client'

import React from 'react'
import { useChat } from '@ai-sdk/react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { TextShimmerWave } from '@/components/ui/text-shimmer-wave';
import { ChatMessageList } from '@/components/ui/chat-message-list';
import { Separator } from '@/components/ui/separator';

const MainPage = () => {
  const { messages, input, handleInputChange, handleSubmit, isLoading, } = useChat();
  return (
    <div className='flex flex-col h-dvh overflow-hidden'>
      <ChatMessageList className='flex-1'>
        <ChatMessage isUser={false} content={{
          role: "system",
          content: "Hello, I am IRIS, your Intelligent Response and Interactive System, Sir. I am here to assist you with any questions or tasks related to science, technology, engineering, and mathematics. How may I be of service to you today?"
        }} />
        {
          messages.map((msg, i) =>
            <>
              <Separator />
              <ChatMessage key={i} isUser={msg.role === "user"} content={msg} />
            </>
          )
        }
        {
          isLoading &&
          <TextShimmerWave>
            Typing...
          </TextShimmerWave>
        }
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