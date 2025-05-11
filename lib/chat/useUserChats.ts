import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface ChatListItem {
  name: string;
  url: string;
  emoji: string;
}

const CHATS_PER_PAGE = 5;

export const useUserChats = () => {
  const { user } = useUser();
  const [items, setItems] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchChats = async (pageIndex: number) => {
    if (!user?.id) return;

    const from = pageIndex * CHATS_PER_PAGE;
    const to = from + CHATS_PER_PAGE - 1;

    const { data, error } = await supabase
      .from('chats')
      .select('chat_id, messages')
      .eq('clerk_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching chats:', error.message);
    } else {
      const formattedItems: ChatListItem[] = data.map((chat) => ({
        name: chat.messages?.find((m: { role: string }) => m.role === 'user')?.content || 'Untitled',
        url: `/chat/${chat.chat_id}`,
        emoji: '',
      }));

      setItems((prev) => [...prev, ...formattedItems]);
      if (formattedItems.length < CHATS_PER_PAGE) {
        setHasMore(false);
      }
    }

    setLoading(false);
  };

  // Initial load
  useEffect(() => {
    if (user?.id) {
      setItems([]);
      setPage(0);
      setHasMore(true);
      fetchChats(0);
    }
  }, [user]);

  // Load next 5 chats
  const loadMoreChats = async () => {
    if (hasMore && user?.id) {
      const nextPage = page + 1;
      setPage(nextPage);
      await fetchChats(nextPage);
    }
  };

  const deleteChatById = async (chatId: string) => {
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('chat_id', chatId)
      .eq('clerk_id', user?.id);

    if (error) {
      console.error('Error deleting chat:', error.message);
      return false;
    }

    setItems((prevItems) => prevItems.filter((item) => !item.url.includes(chatId)));
    return true;
  };

  return { items, loading, deleteChatById, loadMoreChats, hasMore };
};
