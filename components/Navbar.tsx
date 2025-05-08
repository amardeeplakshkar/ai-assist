import { Brain } from 'lucide-react'
import React from 'react'
import { Separator } from './ui/separator'
import { ThemeToggle } from './ui/theme-toggle'

const Navbar = () => {
    return (
        <>
            <nav className='flex justify-between items-center px-4 p-2'>
                <div className='flex gap-2 items-center'>
                    <Brain className='text-blue-500' />
                    <h1 className='font-bold text-lg'>IRIS</h1>
                </div>
                <ThemeToggle/>
            </nav>
            <Separator />
        </>
    )
}

export default Navbar