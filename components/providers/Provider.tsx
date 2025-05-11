'use client'

import React from 'react'
import { ThemeProvider } from './ThemeProvider'
import { SidebarInset, SidebarProvider } from '../ui/sidebar'
import { AppSidebar } from '../ui/app-sidebar'
import { MessagesProvider } from './MessagesProvider'
import { ClerkProvider } from '@clerk/nextjs'

const Provider = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <ClerkProvider>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <MessagesProvider>
                        <SidebarProvider>
                            <AppSidebar />
                            <SidebarInset>
                                {children}
                            </SidebarInset>
                        </SidebarProvider>
                    </MessagesProvider>
                </ThemeProvider>
            </ClerkProvider>
        </>
    )
}

export default Provider