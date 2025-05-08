'use client'

import React from 'react'
import { ThemeProvider } from './ThemeProvider'

const Provider = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                {children}
            </ThemeProvider>
        </>
    )
}

export default Provider