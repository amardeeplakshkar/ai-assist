'use client'

import React from 'react'
import { ThemeProvider } from './ThemeProvider'
import { SidebarInset, SidebarProvider } from '../ui/sidebar'
import { AppSidebar } from '../ui/app-sidebar'
import { MessagesProvider } from './MessagesProvider'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

const Provider = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                <ClerkProvider appearance={{
                    baseTheme: [dark]
                }}>
                    <MessagesProvider>
                        <SidebarProvider>
                            <AppSidebar />
                            <SidebarInset>
                                {children}
                            </SidebarInset>
                        </SidebarProvider>
                    </MessagesProvider>
                </ClerkProvider>
            </ThemeProvider>
        </>
    )
}

export default Provider