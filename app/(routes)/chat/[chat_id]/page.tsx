import ChatClient from './ChatClient';

export default async function Page({ params }: { params: { chat_id: string } }) {
    const { chat_id } = params
    return <ChatClient chatId={chat_id} />
  }
