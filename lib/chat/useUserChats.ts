import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

interface ChatListItem {
  name: string;
  url: string;
  emoji: string;
}

export const useUserChats = () => {
  const { user } = useUser();
  const [items, setItems] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('chats')
        .select('chat_id, messages')
        .eq('clerk_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching chats:', error.message);
      } else {
        const formattedItems: ChatListItem[] = data.map((chat) => ({
          name: chat.messages?.[0]?.content || 'Untitled',
          url: `/chat/${chat.chat_id}`,
          emoji: '',
        }));

        setItems(formattedItems);
      }

      setLoading(false);
    };

    fetchChats();
  }, [user]);

  return { items, loading };
};
