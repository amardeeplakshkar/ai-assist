'use client'

import React, { useEffect, useState } from 'react'
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

    // useEffect(() => {
    //     if (initialMessages.length === 0) {
    //         setInitialMessages([
    //             {
    //                 id: generateId(),
    //                 "role": "user",
    //                 "content": "What is the weather in San Francisco?",
    //                 "parts": [
    //                     {
    //                         "type": "text",
    //                         "text": "What is the weather in San Francisco?"
    //                     }
    //                 ]
    //             },
    //             {
    //                 id: generateId(),
    //                 "role": "assistant",
    //                 "content": "Sir, the current weather in San Francisco, California is as follows:\n\n- **Condition:** Sunny (despite it being nighttime)\n- **Temperature:** 14.4°C (57.9°F)\n- **Feels Like:** 13.2°C (55.8°F)\n- **Wind:** 10.1 mph (16.2 kph) from the west\n- **Humidity:** 55%\n- **Cloud Cover:** 25%\n- **Visibility:** 16 km (9 miles)\n- **Atmospheric Pressure:** 1014 mb\n\nIf you require a forecast or more detailed information, kindly let me know.",
    //                 "toolInvocations": [
    //                     {
    //                         "state": "result",
    //                         "step": 0,
    //                         "toolCallId": "call_t0XTyyIRWzJVhxEJ7VAQfURY",
    //                         "toolName": "displayWeather",
    //                         "args": {
    //                             "location": "San Francisco"
    //                         },
    //                         "result": {
    //                             "location": {
    //                                 "name": "San Francisco",
    //                                 "region": "California",
    //                                 "country": "United States of America",
    //                                 "lat": 37.775,
    //                                 "lon": -122.4183,
    //                                 "tz_id": "America/Los_Angeles",
    //                                 "localtime_epoch": 1746935130,
    //                                 "localtime": "2025-05-10 20:45"
    //                             },
    //                             "current": {
    //                                 "last_updated_epoch": 1746934200,
    //                                 "last_updated": "2025-05-10 20:30",
    //                                 "temp_c": 14.4,
    //                                 "temp_f": 57.9,
    //                                 "is_day": 0,
    //                                 "condition": {
    //                                     "text": "Sunny",
    //                                     "icon": "//cdn.weatherapi.com/weather/64x64/night/113.png",
    //                                     "code": 1000
    //                                 },
    //                                 "wind_mph": 10.1,
    //                                 "wind_kph": 16.2,
    //                                 "wind_degree": 264,
    //                                 "wind_dir": "W",
    //                                 "pressure_mb": 1014,
    //                                 "pressure_in": 29.93,
    //                                 "precip_mm": 0,
    //                                 "precip_in": 0,
    //                                 "humidity": 55,
    //                                 "cloud": 25,
    //                                 "feelslike_c": 13.2,
    //                                 "feelslike_f": 55.8,
    //                                 "windchill_c": 10.2,
    //                                 "windchill_f": 50.4,
    //                                 "heatindex_c": 11.8,
    //                                 "heatindex_f": 53.3,
    //                                 "dewpoint_c": 9.6,
    //                                 "dewpoint_f": 49.2,
    //                                 "vis_km": 16,
    //                                 "vis_miles": 9,
    //                                 "uv": 0,
    //                                 "gust_mph": 16.6,
    //                                 "gust_kph": 26.6
    //                             }
    //                         }
    //                     }
    //                 ],
    //                 "parts": [
    //                     {
    //                         "type": "step-start"
    //                     },
    //                     {
    //                         "type": "tool-invocation",
    //                         "toolInvocation": {
    //                             "state": "result",
    //                             "step": 0,
    //                             "toolCallId": "call_t0XTyyIRWzJVhxEJ7VAQfURY",
    //                             "toolName": "displayWeather",
    //                             "args": {
    //                                 "location": "San Francisco"
    //                             },
    //                             "result": {
    //                                 "location": {
    //                                     "name": "San Francisco",
    //                                     "region": "California",
    //                                     "country": "United States of America",
    //                                     "lat": 37.775,
    //                                     "lon": -122.4183,
    //                                     "tz_id": "America/Los_Angeles",
    //                                     "localtime_epoch": 1746935130,
    //                                     "localtime": "2025-05-10 20:45"
    //                                 },
    //                                 "current": {
    //                                     "last_updated_epoch": 1746934200,
    //                                     "last_updated": "2025-05-10 20:30",
    //                                     "temp_c": 14.4,
    //                                     "temp_f": 57.9,
    //                                     "is_day": 0,
    //                                     "condition": {
    //                                         "text": "Sunny",
    //                                         "icon": "//cdn.weatherapi.com/weather/64x64/night/113.png",
    //                                         "code": 1000
    //                                     },
    //                                     "wind_mph": 10.1,
    //                                     "wind_kph": 16.2,
    //                                     "wind_degree": 264,
    //                                     "wind_dir": "W",
    //                                     "pressure_mb": 1014,
    //                                     "pressure_in": 29.93,
    //                                     "precip_mm": 0,
    //                                     "precip_in": 0,
    //                                     "humidity": 55,
    //                                     "cloud": 25,
    //                                     "feelslike_c": 13.2,
    //                                     "feelslike_f": 55.8,
    //                                     "windchill_c": 10.2,
    //                                     "windchill_f": 50.4,
    //                                     "heatindex_c": 11.8,
    //                                     "heatindex_f": 53.3,
    //                                     "dewpoint_c": 9.6,
    //                                     "dewpoint_f": 49.2,
    //                                     "vis_km": 16,
    //                                     "vis_miles": 9,
    //                                     "uv": 0,
    //                                     "gust_mph": 16.6,
    //                                     "gust_kph": 26.6
    //                                 }
    //                             }
    //                         }
    //                     },
    //                     {
    //                         "type": "step-start"
    //                     },
    //                     {
    //                         "type": "text",
    //                         "text": "Sir, the current weather in San Francisco, California is as follows:\n\n- **Condition:** Sunny (despite it being nighttime)\n- **Temperature:** 14.4°C (57.9°F)\n- **Feels Like:** 13.2°C (55.8°F)\n- **Wind:** 10.1 mph (16.2 kph) from the west\n- **Humidity:** 55%\n- **Cloud Cover:** 25%\n- **Visibility:** 16 km (9 miles)\n- **Atmospheric Pressure:** 1014 mb\n\nIf you require a forecast or more detailed information, kindly let me know."
    //                     }
    //                 ]
    //             },
    //         ])
    //     }
    // }, [initialMessages, setInitialMessages]);

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

    const [chatId, setChatId] = useState<string | null>(null);

    useEffect(() => {
        if (!chatId) {
            setChatId(crypto.randomUUID());
            
        }
    }, []);
    
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