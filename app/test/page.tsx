'use client'

import React from 'react'

const Test = () => {
    async function fetchAndPlay(text: string) {
        const res = await fetch('/api/tts2', {
            method: 'POST',
            body: JSON.stringify({ text }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        await audio.play();
    }
    return (
        <div onClick={() => fetchAndPlay("hello there")}>Test</div>
    )
}

export default Test