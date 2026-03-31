import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function GET() {
  try {
    const user = await prisma.user.findUnique({ where: { email: "dummy@carbontrack.com" } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    
    const insights = await prisma.aiInsight.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(insights);
  } catch (error) {
    console.error("GET Insights Error:", error);
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { activityData } = await req.json();

    const systemPrompt = `
You are an expert AI sustainability advisor for CarbonTrack.
Analyze the provided user carbon activity data (JSON) and generate ONE actionable, encouraging personalized insight.
Focus on something they can improve. State only the insight, up to 2 sentences. Include the estimated savings quantity if possible. Make it punchy.
`;

    // Call Groq API
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Here is the user's weekly data: ${JSON.stringify(activityData)}` }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.5,
        max_tokens: 256,
    });

    const insight = chatCompletion.choices[0]?.message?.content || 'We noticed your transport emissions. Try carpooling this week to lower your impact!';

    return NextResponse.json({ insight });
  } catch (error: any) {
    console.error('Groq AI Error (Insights):', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
