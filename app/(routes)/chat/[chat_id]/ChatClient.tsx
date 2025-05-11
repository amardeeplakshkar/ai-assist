'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useMessages } from '@/components/providers/MessagesProvider';
import { useChat } from '@ai-sdk/react';
import ChatInput from '@/components/ChatInput';
import ChatMessage from '@/components/ChatMessage';
import { Button } from '@/components/ui/button';
import { ChatMessageList } from '@/components/ui/chat-message-list';
import { TextShimmerWave } from '@/components/ui/text-shimmer-wave';
import { suggestedActions } from '@/constants';
import { unstable_ViewTransition as ViewTransition } from 'react'
import { useUserChats } from '@/lib/chat/useUserChats';
import { Loader } from 'lucide-react';

export default function ChatClient({ chatId }: { chatId: string }) {
    const { setInitialPrompt, setInitialMessages, initialMessages } = useMessages();
    const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
        initialMessages: initialMessages,
        experimental_throttle: 50, onToolCall: (...args) => {
            setIsToolCalling(true);
        },
    });
    const [isToolCalling, setIsToolCalling] = useState(false)
    const { user } = useUser()
    const { loading } = useUserChats()
    useEffect(() => {
        const uploadMessages = async () => {
            if (!user?.id || messages.length === 0) return;

            const { error } = await supabase
                .from('chats')
                .upsert({
                    chat_id: chatId,
                    clerk_id: user.id,
                    messages: messages,
                }, { onConflict: 'chat_id' });

            if (error) {
                console.error('Error uploading messages:', error.message);
            }
        };

        uploadMessages();
    }, [messages, user]);

    useEffect(() => {
        if (!isLoading && isToolCalling) {
            setIsToolCalling(false);
        }
    }, [isLoading, isToolCalling]);


    useEffect(() => {
        if (!user) return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('chats')
                .select('messages')
                .eq('clerk_id', user.id)
                .eq('chat_id', chatId)
                .single();

            if (data) setInitialMessages(data.messages);
            if (error) console.error('Fetch error:', error.message);
        };

        fetchMessages();
    }, [user, chatId]);

    return (
        <div className='flex flex-col overflow-hidden'>
            <ChatMessageList className='flex-1 flex flex-col'>
                {!loading && messages?.length < 1 &&
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
                                        onClick={async () => {
                                            window.history.replaceState({}, '', `/chat/${chatId}`);
                                            setInitialPrompt(suggestedAction.action)
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
                {
                    loading &&
                    <div className='flex justify-center items-center'>
                        <Loader className='animate-spin h-full' />
                    </div>
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
    );
}
