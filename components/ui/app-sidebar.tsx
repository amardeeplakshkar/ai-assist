"use client"

import * as React from "react"
import {
  Home,
  Loader,
  MessageCircleQuestion,
  Search,
  Settings2,
  Sparkles,
} from "lucide-react"

import { NavHistory } from "@/components/ui/nav-favorites"
import { NavMain } from "@/components/ui/nav-main"
import { NavSecondary } from "@/components/ui/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useUserChats } from "@/lib/chat/useUserChats"
import { ClerkLoaded } from "@clerk/nextjs"

const data = {
  navMain: [
    {
      title: "Search",
      url: "",
      icon: Search,
    },
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "New Chat",
      url: "/chat",
      icon: Sparkles,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "",
      icon: Settings2,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { items, loading, deleteChatById, loadMoreChats, hasMore } = useUserChats();
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        <ClerkLoaded>
          {
            loading ?
              <div className="flex justify-center items-center">
                <Loader className="animate-spin" />
              </div>
              :
              <>
                <NavHistory hasMore={hasMore} loadMoreChats={loadMoreChats} deleteChatById={deleteChatById} history={items} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
              </>
          }
        </ClerkLoaded>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
