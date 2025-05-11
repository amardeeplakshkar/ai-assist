import ChatClient from './ChatClient';

export default function Page({ params }: { params: { chat_id: string } }) {
  return <ChatClient chatId={params.chat_id} />;
}
