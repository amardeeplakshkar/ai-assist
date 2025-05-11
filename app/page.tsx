'use client';

import React, { useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import ChatInput from '@/components/ChatInput';
import { useMessages } from '@/components/providers/MessagesProvider';
import { useRouter } from 'next/navigation';
import { unstable_ViewTransition as ViewTransition } from 'react'
import { suggestedActions } from '@/constants';
import { Button } from '@/components/ui/button';
import { ChatMessageList } from '@/components/ui/chat-message-list';
import { useUser } from '@clerk/nextjs';
const MainPage = () => {
  const router = useRouter();
  const { setInitialPrompt } = useMessages();
  const [isToolCalling, setIsToolCalling] = useState(false);

  const {
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    messages,
    setInput,
  } = useChat({
    experimental_throttle: 50,
    onToolCall: () => {
      setIsToolCalling(true);
    },
  });
  const { user } = useUser()

  const [shouldSubmitInitialPrompt, setShouldSubmitInitialPrompt] = useState(false);

  useEffect(() => {
    if (!input) {
    } else {
      setInput(input);
      setShouldSubmitInitialPrompt(true);
    }
  }, [setInput]);

  useEffect(() => {
    if (shouldSubmitInitialPrompt && input.trim()) {
      setShouldSubmitInitialPrompt(false);
      handleInitialSubmit();
    }
  }, [shouldSubmitInitialPrompt, input, handleSubmit]);

  const handleInitialSubmit = () => {
    if (!input.trim()) return;
    setInitialPrompt(input);
    router.push(`/chat`);
  };

  useEffect(() => {
    if (!isLoading && isToolCalling) {
      setIsToolCalling(false);
    }
  }, [isLoading, isToolCalling]);

  return (
    <div className='flex flex-col w-full h-full justify-center items-center overflow-hidden'>
      <ChatMessageList className='flex-1 flex flex-col'>
        {messages?.length < 1 &&
          <>
            <div className='flex w-full text-2xl h-[40dvh] justify-center flex-col'>
              <h3 className='font-semibold'>
                Hello There, {user?.firstName}!
              </h3>
              <h4 className='text-muted-foreground'>
                How can I help you today?
              </h4>
            </div>
            <section className='grid sm:grid-cols-2 gap-2 w-full'>
              {suggestedActions.map((suggestedAction, index) => (
                <div
                  key={`suggested-action-${suggestedAction.title}-${index}`}
                  className={index > 1 ? 'hidden sm:block' : 'block '}
                >
                  <Button
                    variant="ghost"
                    onClick={async () => {
                      setInput(suggestedAction.action)
                    }}
                    className="text-left cursor-pointer border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
                  >
                    <span className="font-medium">{suggestedAction.title}</span>
                    <span className="text-muted-foreground">
                      {suggestedAction.label}
                    </span>
                  </Button>
                </div>
              ))}
            </section>
          </>
        }
      </ChatMessageList>
      <ViewTransition name='chatInput'>
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleInitialSubmit}
          isGenerating={isLoading}
          setInput={setInput}
        />
      </ViewTransition>
    </div>
  );
};

export default MainPage;
