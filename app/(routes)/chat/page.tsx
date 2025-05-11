'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useChat } from '@ai-sdk/react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { TextShimmerWave } from '@/components/ui/text-shimmer-wave';
import { ChatMessageList } from '@/components/ui/chat-message-list';
import { useMessages } from '@/components/providers/MessagesProvider';
import { Button } from '@/components/ui/button';
import { unstable_ViewTransition as ViewTransition } from 'react'
import { suggestedActions } from '@/constants';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

const MainPage = () => {
    const [chatId, setChatId] = useState<string>(() => crypto.randomUUID())
    const { initialPrompt, setInitialPrompt, setInitialMessages, initialMessages } = useMessages();
    const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
        initialMessages: initialMessages,
        experimental_throttle: 50, onToolCall: (...args) => {
            setIsToolCalling(true);
        },
    });
    const [isToolCalling, setIsToolCalling] = useState(false)
    const { user } = useUser()
    const [shouldSubmitInitialPrompt, setShouldSubmitInitialPrompt] = useState(false);

    useEffect(() => {
        if (!initialPrompt) {
        } else {
            setInput(initialPrompt);
            setShouldSubmitInitialPrompt(true);
        }
    }, [initialPrompt, setInput]);

    useEffect(() => {
        if (shouldSubmitInitialPrompt && input.trim()) {
            handleSubmit();
            setShouldSubmitInitialPrompt(false);
        }
    }, [shouldSubmitInitialPrompt, input, handleSubmit]);


    useEffect(() => {
        window.history.replaceState({}, '', `/chat/${chatId}`)
    }, [chatId])

    useEffect(() => {
        const uploadMessages = async () => {
            if (!user?.id || messages.length === 0) return
            const { error } = await supabase
                .from('chats')
                .upsert({
                    chat_id: chatId,
                    clerk_id: user.id,
                    messages,
                }, { onConflict: 'chat_id' })

            if (error) {
                console.error('Error uploading messages:', error.message)
            }
        }

        uploadMessages()
    }, [messages, user, chatId])

    useEffect(() => {
        if (!isLoading && isToolCalling) {
            setIsToolCalling(false)
        }
    }, [isLoading, isToolCalling])

    const handleSuggestedAction = useCallback((action: string) => {
        window.history.replaceState({}, '', `/chat/${chatId}`)
        setInitialPrompt(action)
    }, [chatId, setInitialPrompt])

    return (
        <div className='flex flex-col overflow-hidden'>
            <ChatMessageList className='flex-1 flex flex-col'>
                {messages?.length < 1 &&
                    <>
                        <div className='flex w-full text-2xl h-[40dvh] justify-center flex-col'>
                            <h3 className='font-semibold'>
                                Hello There!
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
                                        onClick={() => handleSuggestedAction(suggestedAction.action)}
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
                {
                    messages?.map((msg, i) =>
                        <ChatMessage key={i} isUser={msg.role === "user"} content={msg} />
                    )
                }
                {isLoading && !isToolCalling && (
                    <TextShimmerWave>
                        Typing...
                    </TextShimmerWave>
                )}
            </ChatMessageList>
            <ViewTransition name='chatInput'>
                <ChatInput
                    input={input}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    isGenerating={isLoading}
                    setInput={setInput}
                />
            </ViewTransition>
        </div>
    )
}

export default MainPage