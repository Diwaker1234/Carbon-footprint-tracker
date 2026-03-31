"use server";

import { Category } from "@/lib/carbon-engine";
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

export async function saveActivity(data: {
  category: Category;
  subcategory: string;
  value: number;
  unit: string;
  date: string;
  facility?: string;
  note?: string;
  source?: "MANUAL" | "OCR" | "API";
}) {
  try {
    const user = await getOrCreateDummyUser();
    
    // Call the Aether-Carbon Logic Guard for DEI and Optimization
    const optimization = await LogicGuard.getOptimization(data.category, data.subcategory, data.value);
    const carbon_equivalent = optimization?.current_carbon_kg || 0;

    const activityDate = data.date ? new Date(data.date) : new Date();

    // The Aether-Carbon Ledger Write
    const result = await prisma.activity.create({
      data: {
        userId: user.id,
        category: data.category,
        subcategory: data.subcategory,
        raw_value: data.value,
        unit: data.unit, // Use user defined unit 
        facility: data.facility,
        carbon_equivalent,
        optimization_recommendation: optimization?.recommendation,
        potential_savings_kg: optimization?.carbon_saved_kg,
        source: data.source || "MANUAL",
        date: activityDate,
      }
    });

    return { success: true, message: "Activity successfully logged to Ledger!", result };
  } catch (error) {
    console.error("Aether-Carbon Ledger Error:", error);
    throw new Error("Failed to save to production database");
  }
}
