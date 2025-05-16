'use client'

import ChatInput from '@/components/ChatInput';
import { ChatRequestOptions, JSONValue, UIMessage } from 'ai';
import React from 'react'
import { parseAIResponse } from '@/lib/parseAIResponse';
import { renderers } from '@/constants/renderers';
import ReactMarkdown from 'react-markdown';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (event?: {
    preventDefault?: () => void;
  }, chatRequestOptions?: ChatRequestOptions) => void;
  isLoading?: boolean;
  setInput?: React.Dispatch<React.SetStateAction<string>>
  messages: UIMessage[]
  data: JSONValue[] | undefined
}

const ChatComponent = ({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  setInput,
  messages,
}: ChatProps) => {
  return (
    <div className='h-[92dvh] flex flex-col'>
      <section className='flex-1 p-2 overflow-y-auto'>
        {messages.map((msg, i) => {
          const parsed = msg.role === 'assistant' ? parseAIResponse(msg.content) : null;
          return (
            <div key={i}>
              <div className={`bg-secondary my-2 p-2 rounded-lg flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'user' ? (
                  <div className='bg-green-500'>{msg.content}</div>
                ) : (
                  <div>
                    {JSON.stringify(parsed?.artifacts, null, 2)}
                    {parsed?.message && (
                      <ReactMarkdown components={renderers}>
                        {parsed.message}
                      </ReactMarkdown>
                    )}

                    {parsed?.artifacts && parsed.artifacts.length > 0 && (
                      <Accordion type="single" collapsible className="">
                        {parsed.artifacts.map((artifact, index) => (
                          <AccordionItem key={index} value={`item-${i}-${index}`}>
                            <AccordionTrigger className='text-start'>{artifact.title}</AccordionTrigger>
                            {artifact.actions.map((action, j) => (
                              <AccordionContent className='bg-secondary-foreground/5 rounded-lg my-2 p-2' key={j}>
                                {action.type === 'file' && (
                                  <div>
                                    <strong>create : {action.filePath}</strong>
                                  </div>
                                )}
                                {action.type === 'shell' && (
                                  <strong className='flex items-center'> excute :
                                    <SyntaxHighlighter language="bash" style={dracula} customStyle={{ borderRadius: '6px', padding: '10px',
                                      width: "80%"
                                     }}>
                                      {action.content}
                                    </SyntaxHighlighter>
                                  </strong>
                                )}
                              </AccordionContent>
                            ))}
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <ChatInput
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isGenerating={isLoading}
        input={input}
        setInput={setInput}
      />
    </div>
  )
}

export default ChatComponent
