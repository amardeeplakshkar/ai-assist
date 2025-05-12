import { tools } from '@/constants';
import { NextRequest, NextResponse } from 'next/server'; import { writeFileSync } from "node:fs";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAPI_API_KEY,
    baseURL: process.env.OPENAI_API_BASE_URL || "",
});
export async function POST(request: NextRequest) {
    let body: { text?: string } = {};
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    if (!body.text) {
        return NextResponse.json({ error: "Missing 'text' field in request body." }, { status: 400 });
    }

    try {
        const response = await openai.audio.speech.create({
            model: "openai-audio",
            voice: "nova",
            input: "Today is a wonderful day to build something people love!",
            response_format: "mp3",
        });

        const audioBase64 = response;
        console.log(audioBase64);
        
        if (!audioBase64) {
            return NextResponse.json(
                { error: 'No audio data returned from OpenAI.' },
                { status: 502 },
            );
        }

        return NextResponse.json({
            audio: audioBase64,
        });
    } catch (error: any) {
        return NextResponse.json({
            error: 'Error generating speech.',
            details: error?.message,
        }, { status: 500 });
    }
}