import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LogicGuard } from "@/lib/logic-guard";

// Ensure a dummy user exists since we don't have real auth yet
async function getOrCreateDummyUser() {
  const email = "dummy@carbontrack.com";
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: "Pranjal Sharma",
        carbon_budget: 2000.0,
      }
    });
  }
  return user;
}

export async function GET() {
  try {
    const user = await getOrCreateDummyUser();
    
    // Fetch the Aether-Carbon Ledger
    const activities = await prisma.activity.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("GET Activities Error:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getOrCreateDummyUser();
    const body = await request.json();
    
    const { category, subcategory, value, unit, note, date, source } = body;
    
    if (!category || !subcategory || !value) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Call the Aether-Carbon Logic Guard for DEI and Optimization
    const optimization = await LogicGuard.getOptimization(category, subcategory, parseFloat(value));
    const carbon_equivalent = optimization?.current_carbon_kg || 0;

    const activityDate = date ? new Date(date) : new Date();

    // The Aether-Carbon Ledger Write
    const result = await prisma.activity.create({
      data: {
        userId: user.id,
        category,
        subcategory,
        raw_value: parseFloat(value),
        unit: unit || "unit",
        carbon_equivalent,
        source: source || "MANUAL",
        date: activityDate,
        optimization_recommendation: optimization?.recommendation,
        potential_savings_kg: optimization?.carbon_saved_kg,
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST Activities Error:", error);
    return NextResponse.json({ error: "Failed to save activity" }, { status: 500 });
  }
}
