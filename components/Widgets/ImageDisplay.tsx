'use client'

import { Download } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

type ImageDisplayProps = {
    src: string
    prompt: string
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ src, prompt }) => {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)

    const handleDownload = async () => {
        try {
            const response = await fetch(src)
            const blob = await response.blob()
            const url = URL.createObjectURL(blob)

            const link = document.createElement('a')
            link.href = url
            link.download = `ai-image-${prompt.substring(0, 20).replace(/\s+/g, '-').toLowerCase()}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Download failed:', error)
        }
    }

    return (
        <div className="relative group w-full max-w-lg  overflow-hidden">
            <div className="rounded-lg overflow-hidden bg-gray-100 shadow-md relative">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <Skeleton className="h-full w-full" />
                    </div>
                )}
                
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                        <p className="text-gray-500">Failed to load image</p>
                    </div>
                )}
                
                <img
                    src={src}
                    alt={prompt}
                    className={`w-full object-cover rounded-lg transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false)
                        setError(true)
                    }}
                />
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button 
                        onClick={handleDownload} 
                        size="sm" 
                        variant="secondary"
                        className="flex cursor-pointer items-center gap-1 bg-white/90 backdrop-blur-sm hover:bg-white shadow-md"
                    >
                        <Download size={16} />
                        <span>Download</span>
                    </Button>
                </div>
            </div>
            
            <div className="mt-3">
                <div className="bg-secondary/10 backdrop-blur-sm p-3 rounded-lg">
                    <p className="text-sm text-secondary-foreground/60 italic">
                        "{prompt}"
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ImageDisplay
