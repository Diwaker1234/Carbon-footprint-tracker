import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    // Call Groq API
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: 'You are a helpful, enthusiastic carbon footprint tracking assistant for the CarbonTrack app. Answer concisely and kindly about sustainability, carbon calculations, and general app usage.'
            },
            ...messages
        ],
        model: 'llama-3.1-8b-instant', // Fixed model since llama3-8b is decommissioned
        temperature: 0.7,
        max_tokens: 1024,
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || 'I could not generate a response right now.';

    return NextResponse.json({ response: responseContent });
  } catch (error: any) {
    console.error('Groq API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
