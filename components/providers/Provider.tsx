'use client'

import React from 'react'
import { ThemeProvider } from './ThemeProvider'
import { SidebarInset, SidebarProvider } from '../ui/sidebar'
import { AppSidebar } from '../ui/app-sidebar'

const Provider = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                <SidebarProvider>
                    <AppSidebar/>
                    <SidebarInset>
                    {children}
                    </SidebarInset>
                </SidebarProvider>
            </ThemeProvider>
        </>
    )
}

export default Provider