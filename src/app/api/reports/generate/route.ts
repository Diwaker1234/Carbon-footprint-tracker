import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Groq } from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export async function POST(request: Request) {
  try {
    const email = "dummy@carbontrack.com";
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
       return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const activities = await prisma.activity.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' }
    });

    if (activities.length === 0) {
       return NextResponse.json({ markdown: "No activity data available to generate a report just yet. Start logging your transport, food, and energy!" });
    }

    const totalCarbon = activities.reduce((sum, a) => sum + (a.carbon_equivalent || 0), 0);
    const categoryTotals = activities.reduce((acc, a) => {
        acc[a.category] = (acc[a.category] || 0) + (a.carbon_equivalent || 0);
        return acc;
    }, {} as Record<string, number>);

    // Build the prompt context
    const prompt = `
You are an expert environmental consultant and AI analysis engine for the "Aether-Carbon" ERP platform. 
A user has requested their Official Carbon Audit.

Here is their current dataset summary:
- Total CO2e logged: ${totalCarbon.toFixed(2)} kg
- Total activities logged: ${activities.length}
- Breakdown by Category: ${JSON.stringify(categoryTotals, null, 2)}

And here is their raw activity ledger (latest first):
${JSON.stringify(activities.map(a => ({ date: a.date, category: a.category, subcategory: a.subcategory, amount: a.raw_value, carbon: a.carbon_equivalent })).slice(0, 20), null, 2)}

Provide a highly professional, detailed EXTENSIVE summary in Markdown format only. Do not wrap in markdown code blocks (\`\`\`), just return the raw markdown text. 
Follow this exact structure:
# 🌍 Official Aether-Carbon Audit
*Generated for ${user.name}*

## Executive Summary
(Write a 2 paragraph summary of their environmental P&L context)

## Category Intensity Analysis
(Dive deep into their largest category emissions based on the ledger logs)

## AI Detected Anomalies & Behavioral Trends
(Point out specific patterns you see in the raw data, for instance if they drive too much contextually)

## Actionable Reduction Roadmap
(3-5 very specific, tailored actions they can take this week based EXACTLY on their subcategories, calculating estimated savings).
    `;

    const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
    });

    const markdown = chatCompletion.choices[0]?.message?.content || "Failed to generate AI insights.";

    return NextResponse.json({ markdown });

  } catch (error) {
    console.error("POST Reports Error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
