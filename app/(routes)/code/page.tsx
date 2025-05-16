'use client';

import ChatInput from '@/components/ChatInput';
import ChatMessage from '@/components/ChatMessage';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { renderers } from '@/constants/renderers';
import { useChat } from '@ai-sdk/react';
import React, { useEffect, useMemo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown'
import { ChevronLeft } from 'lucide-react';
import CodeComponent from '@/components/Code/CodeComponent';
type BoltAction =
    | {
        type: 'file';
        filePath: string;
        contentType: string;
        content: string;
    }
    | {
        type: 'shell';
        command: string;
    };

type BoltArtifact = {
    id: string;
    title: string;
    actions: BoltAction[];
};

export default function BoltArtifactStreamParser() {
    const [showChat, setShowChat] = useState(false)

    const { messages, handleInputChange, handleSubmit, input, isLoading } = useChat({
        api: '/api/code',
    });
    const parsedMessages = useMemo(() => {
        return messages.map(msg => {
            if (msg.role === 'assistant' && msg.content.includes('<boltArtifact')) {
                return {
                    ...msg,
                    parsed: parseChunk(msg.content),
                };
            }
            return { ...msg, parsed: null };
        });
    }, [messages]);

    const allFiles = useMemo(() => {
        const files: Record<string, { code: string }> = {};
        parsedMessages.forEach((msg) => {
            const parsed = msg.parsed;
            if (parsed?.actions) {
                parsed.actions.forEach((action) => {
                    if (action.type === 'file') {
                        const filePath = action.filePath.startsWith('/') ? action.filePath : `/${action.filePath}`;
                        files[filePath] = { code: action.content };
                    }
                });
            }
        });
        return files;
    }, [parsedMessages]);

    const [activeFile, setActiveFile] = useState<string | null>(null)
    return (
        <section className='flex h-full w-full space-y-6'>
            {showChat && <div className="p-4 font-mono col-span-3 h-[95dvh] overflow-y-auto flex flex-col w-1/3 transition-all duration-300 ease-in-out">
                <div className='flex-1'>
                    {parsedMessages.map((msg, i) => {
                        const beforeArtifact = msg.content.split('<boltArtifact')[0].trim();
                        const afterArtifact = msg.content.split('</boltArtifact>')[1]?.trim() || '';
                        const parsed = msg.parsed;

                        return (
                            <div key={i} className="bg-secondary text-sm p-4 px-6 rounded shadow border">
                                <div className="mb-2">
                                    <span className="text-xs font-semibold text-gray-500">
                                        {msg.role.toUpperCase()}
                                    </span>
                                    <ReactMarkdown components={renderers}>
                                        {beforeArtifact}
                                    </ReactMarkdown>
                                </div>
                                {parsed && (
                                    <Accordion type="single" collapsible className="">
                                        {[parsed]?.map((artifact, index) => (
                                            <AccordionItem key={index} value={`item-${index}`}>
                                                <AccordionTrigger className='cursor-pointer text-start'>{artifact?.title}</AccordionTrigger>
                                                {artifact?.actions?.map((action, j) => (
                                                    <AccordionContent className=' bg-secondary-foreground/5 text-xs rounded-lg my-1 p-2' key={j}>
                                                        {action?.type === 'file' && (
                                                            <div
                                                                className='hover:underline underline-offset-[5px] cursor-pointer'
                                                                onClick={() => setActiveFile(action?.filePath || "")}
                                                            >
                                                                <strong>create : {action?.filePath}</strong>
                                                                <pre>{action?.content}</pre>
                                                            </div>
                                                        )}
                                                        {action?.type === 'shell' && (
                                                            <strong className='flex items-center'> excute :
                                                                <SyntaxHighlighter language="bash" style={dracula} customStyle={{
                                                                    borderRadius: '6px', padding: '10px',
                                                                    width: "80%"
                                                                }}>
                                                                    {String(action?.command)}
                                                                </SyntaxHighlighter>
                                                            </strong>
                                                        )}
                                                    </AccordionContent>
                                                ))}
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                )}
                                <ReactMarkdown components={renderers}>
                                    {afterArtifact}
                                </ReactMarkdown>
                            </div>
                        );
                    })}
                </div>

                {isLoading && <p className="text-gray-500 italic">Waiting for AI response...</p>}
                <ChatInput handleInputChange={handleInputChange} handleSubmit={handleSubmit} input={input} />
            </div>}
            <div className="flex items-center justify-center w-3 bg-border/50 hover:bg-border transition-colors duration-200 cursor-pointer"
                onClick={() => setShowChat(!showChat)}>
                <ChevronLeft className={`h-4 w-4 transform transition-transform duration-300 ${showChat ? '' : 'rotate-180'}`} />
            </div>
            <div className={`h-[93dvh] transition-all duration-300 ease-in-out ${showChat ? 'w-2/3' : 'w-full'}`}>
                <CodeComponent activeFile={activeFile} isLoading={isLoading} files={allFiles} />
            </div>
        </section>
    );
}

function parseChunk(buffer: string): BoltArtifact | null {
    const artifactMatch = buffer.match(/<boltArtifact\s+([^>]+)>/);
    if (!artifactMatch) return null;

    const artifact: BoltArtifact = {
        id: 'default-id',
        title: 'default-title',
        ...parseAttributes(artifactMatch[1]),
        actions: [],
    };

    const actionRegex = /<boltAction\s+([^>]+)>([\s\S]*?)<\/boltAction>/g;
    let match;
    while ((match = actionRegex.exec(buffer)) !== null) {
        const attributes = parseAttributes(match[1]);
        const content = match[2].trim();

        if (attributes.type === 'file') {
            artifact.actions.push({
                type: 'file',
                filePath: attributes.filePath,
                contentType: attributes.contentType,
                content,
            });
        } else if (attributes.type === 'shell') {
            artifact.actions.push({
                type: 'shell',
                command: content,
            });
        }
    }

    return artifact;
}

function parseAttributes(attrString: string): Record<string, string> {
    const attrRegex = /(\w+)=["']([^"']+)["']/g;
    const attrs: Record<string, string> = {};
    let match;
    while ((match = attrRegex.exec(attrString)) !== null) {
        attrs[match[1]] = match[2];
    }
    return attrs;
}
