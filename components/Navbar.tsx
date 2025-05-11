'use client'

import { Brain } from 'lucide-react'
import React, { useEffect } from 'react'
import { Separator } from './ui/separator'
import { ThemeToggle } from './ui/theme-toggle'
import { SidebarTrigger } from './ui/sidebar'

import {
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton,
    useUser,
} from '@clerk/nextjs'
import { Button } from './ui/button'
import { createClient, supabase } from '@/lib/supabase'

const Navbar = () => {
    const { user, isSignedIn, isLoaded } = useUser();
    useEffect(() => {
        const syncUserWithSupabase = async () => {
            if (!isLoaded || !isSignedIn || !user) return;

            const { id, fullName, primaryEmailAddress } = user;

            const { data: existingUser, error: fetchError } = await supabase
                .from("users")
                .select("*")
                .eq("clerk_id", id)
                .single();

            if (fetchError && fetchError.code !== "PGRST116") {
                console.error("Error fetching user:", fetchError);
                return;
            }

            if (!existingUser) {
                const { error: insertError } = await supabase.from("users").insert([
                    {
                        clerk_id: id,
                        name: fullName,
                        email: primaryEmailAddress?.emailAddress,
                    },
                ]);

                if (insertError) {
                    console.error("Error inserting user:", insertError);
                } else {
                    console.log("User created successfully");
                }
            }
        };

        syncUserWithSupabase();
    }, [user, isSignedIn, isLoaded]);


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
                <div className="flex items-center gap-1 ml-auto px-3">
                    <SignedOut>
                        <Button variant={"outline"} className='cursor-pointer'>
                            <SignInButton />
                        </Button>
                    </SignedOut>
                    <ThemeToggle />
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </div>
            </header>
            <Separator />
        </>
    )
}

export default Navbar