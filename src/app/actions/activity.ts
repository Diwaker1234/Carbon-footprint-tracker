"use server";

import { Category } from "@/lib/carbon-engine";

export async function saveActivity(data: {
  category: Category;
  subcategory: string;
  value: number;
  date: string;
  note: string;
}) {
  // Simulate database latency
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  // Return success without actually saving since DB is mocked
  return { success: true, message: "Activity successfully logged!" };
}
