'use client';

import { UIMessage } from 'ai';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type MessagesContextType = {
    initialMessages: UIMessage[];
    setInitialMessages: React.Dispatch<React.SetStateAction<UIMessage[]>>;
    initialPrompt: string | undefined,
    setInitialPrompt: React.Dispatch<React.SetStateAction<string>>
};

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
    const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
    const [initialPrompt, setInitialPrompt] = useState<string>('');

    return (
        <MessagesContext.Provider value={{ initialMessages, setInitialMessages, initialPrompt, setInitialPrompt }}>
            {children}
        </MessagesContext.Provider>
    );
};

export const useMessages = (): MessagesContextType => {
    const context = useContext(MessagesContext);
    if (!context) {
        throw new Error('useMessages must be used within a MessagesProvider');
    }
    return context;
};
