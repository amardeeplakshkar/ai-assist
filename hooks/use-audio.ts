'use client'

import React, { useRef, useState } from 'react';

const useTTSQueue = () => {
  const ttsQueueRef = useRef<string[]>([]);
  const isSpeakingRef = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const processQueue = async () => {
    if (ttsQueueRef.current.length === 0 || isSpeakingRef.current) return;

    isSpeakingRef.current = true;
    const text = ttsQueueRef.current.shift();

    if (text) {
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        if (!res.ok) throw new Error('TTS request failed');

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);

        currentAudioRef.current = audio;
        setIsAudioPlaying(true);

        const cleanup = () => {
          URL.revokeObjectURL(url);
          currentAudioRef.current = null;
          isSpeakingRef.current = false;
          setIsAudioPlaying(false);
          processQueue();
        };

        audio.onended = cleanup;
        audio.onerror = cleanup;

        await audio.play();
      } catch (err) {
        console.error('TTS error:', err);
        isSpeakingRef.current = false;
        setIsAudioPlaying(false);
        processQueue();
      }
    }
  };

  const enqueueTTS = (text: string) => {
    ttsQueueRef.current.push(text);
    processQueue();
  };

  const stopAudio = () => {
    const currentAudio = currentAudioRef.current;
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudioRef.current = null;
      isSpeakingRef.current = false;
      setIsAudioPlaying(false);
      ttsQueueRef.current = []; // Optional: Clear the queue when stopped
    }
  };

  return { enqueueTTS, isAudioPlaying, stopAudio };
};

export default useTTSQueue;
