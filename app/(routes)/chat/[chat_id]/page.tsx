'use client'

import { usePathname } from 'next/navigation';
import ChatClient from './ChatClient';

export default function Page() {
    const pathname = usePathname()
    const chatIdFromPath = pathname?.startsWith('/chat/') ? pathname.split('/').pop() : '';
    return <ChatClient chatId={chatIdFromPath || ""} />;
}
