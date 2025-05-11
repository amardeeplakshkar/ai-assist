"use client"

import {
  ArrowUpRight,
  Link,
  MoreHorizontal,
  StarOff,
  Trash2,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import TextLink from "next/link"
import { cn } from "@/lib/utils"
import { usePathname, useRouter } from "next/navigation"
interface HistoryItem {
  name: string
  url: string
  emoji: string
}

interface NavHistoryProps {
  history: HistoryItem[]
  deleteChatById: (chatId: string) => Promise<boolean>
  hasMore: boolean,
  loadMoreChats: () => void
}

export function NavHistory({
  history,
  deleteChatById,
  loadMoreChats,
  hasMore
}: NavHistoryProps) {
  const { isMobile } = useSidebar()
  const [withEmojis, setWithEmojis] = useState<HistoryItem[]>(history)
  const pathname = usePathname()
  const router = useRouter()
  useEffect(() => {
    const fetchEmojis = async () => {
      const updated = await Promise.allSettled(
        history.map(async (item): Promise<HistoryItem> => {
          if (item.emoji) return item;
  
          try {
            const res = await fetch(
              `https://text.pollinations.ai/${encodeURIComponent(item.name)}?system=${encodeURIComponent("just reply with one emoji based on prompt in json like {emoji:'👋'}")}&jsonMode=true`
            );
  
            const data = await res.json();  
            const emoji = data?.emoji?.trim?.() ?? "";
  
            return { ...item, emoji };
          } catch (err) {
            console.error("Emoji fetch failed for:", item.name);
            return { ...item, emoji: "" };
          }
        })
      );
  
      // Extract fulfilled results
      const result = updated.map((res, i) =>
        res.status === "fulfilled" ? res.value : { ...history[i], emoji: "" }
      );
  
      setWithEmojis(result);
    };
  
    if (history.length > 0) fetchEmojis();
  }, [history]);
  

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Link copied to clipboard!");
    }).catch((err) => {
      toast.error("Failed to copy link: ", err);
    });
  }

  const handleDelete = async (chatUrl: string) => {
    const chatIdFromUrl = chatUrl?.startsWith('/chat/') ? chatUrl.split('/').pop() : '';
    console.log("urlId", chatIdFromUrl);
    if (pathname === chatUrl) {
      router.push('/chat');
    }

    try {
      const success = await deleteChatById(chatIdFromUrl || "");
      if (success) {
        toast.success('Chat deleted');
      } else {
        toast.error('Failed to delete chat');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    }
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>History</SidebarGroupLabel>
      <SidebarMenu>
        {withEmojis.map((item, i) => (
          <SidebarMenuItem key={i}>
            <SidebarMenuButton asChild>
              <a className={`${pathname === item.url && "bg-secondary"}`} href={item.url} title={item.name}>
                <span>{item.emoji}</span>
                <span className="line-clamp-1">{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem onClick={() => handleCopyLink(item.url)}>
                  <Link className="text-muted-foreground" />
                  <span>Copy Link</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <TextLink href={item.url} target="_blank" className="flex gap-2 ">
                    <ArrowUpRight className="text-muted-foreground" />
                    <span>Open in New Tab</span>
                  </TextLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDelete(item.url)}>
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton onClick={loadMoreChats} disabled={!hasMore} className={cn("text-sidebar-foreground/70 cursor-pointer", !hasMore && "cursor-not-allowed")}>
            <MoreHorizontal />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
