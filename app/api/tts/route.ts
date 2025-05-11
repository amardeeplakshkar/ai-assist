import { NextRequest, NextResponse } from 'next/server';
import { EdgeTTS } from 'node-edge-tts';
import { readFile, unlink } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  const id = randomUUID();
  const audioFileName = `${id}.mp3`;
  const audioPath = path.join('/tmp', audioFileName);

  const tts = new EdgeTTS({
    voice: 'en-US-ChristopherNeural',
    lang: 'en-US',
    pitch: '+0Hz',
    rate: '+0%',
    volume: '+0%',
  });

  try {
    await tts.ttsPromise(text, audioPath);

    const audioBuffer = await readFile(audioPath);

    await unlink(audioPath);

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
  }
}