import { Brain } from 'lucide-react'
import React from 'react'
import { Separator } from './ui/separator'
import { ThemeToggle } from './ui/theme-toggle'
import { SidebarTrigger } from './ui/sidebar'

const Navbar = () => {
    return (
        <>
            <header className="flex h-14 shrink-0 items-center gap-2">
                <div className="flex flex-1 items-center gap-2 px-3">
                    <SidebarTrigger />
                    <div className="h-6 border-[.5px] shrink-0 w-px" />
                    <div className='flex gap-2 items-center'>
                        <Brain className='text-blue-500' />
                        <h1 className='font-bold text-lg'>IRIS</h1>
                    </div>
                </div>
                <div className="ml-auto px-3">
                    <ThemeToggle />
                </div>
            </header>
            <Separator />
        </>
    )
}

export default Navbar