import { Category, calculateEmission } from "./carbon-engine";
import { geocode, getRoutingDistanceKm } from "./geo-utils";

/**
 * Aether-Carbon Neural-Fluid Logic Guard
 * Provides carbon optimization deltas and DEI (Dynamic Emission Intelligence)
 */

export interface OptimizationResult {
  current_carbon_kg: number;
  optimized_carbon_kg: number;
  carbon_saved_kg: number;
  recommendation: string;
}

export class LogicGuard {
  /**
   * Provides a "Carbon-Saved" forecast during data entry
   */
  static async getOptimization(category: Category, subcategory: string, value: number): Promise<OptimizationResult | null> {
    const current = calculateEmission(category, subcategory, value);
    let optimized_carbon_kg = current.carbon_kg;
    let recommendation = "";

    // Optimization Logic per Category
    if (category === "FOOD") {
      if (subcategory === "beef") {
        const alt = calculateEmission(category, "chicken", value);
        optimized_carbon_kg = alt.carbon_kg;
        recommendation = `Switching beef to chicken saves ${+(current.carbon_kg - alt.carbon_kg).toFixed(2)} kg CO2e`;
      } else if (subcategory === "meat_meal") {
        const alt = calculateEmission(category, "vegan_meal", value);
        optimized_carbon_kg = alt.carbon_kg;
        recommendation = `Opting for a vegan alternative reduces your footprint by ${+(current.carbon_kg - alt.carbon_kg).toFixed(2)} kg`;
      }
    }

    if (category === "TRANSPORT") {
      if (subcategory === "car_petrol") {
        const alt = calculateEmission(category, "train", value);
        optimized_carbon_kg = alt.carbon_kg;
        recommendation = `Taking a train instead of driving saves ${+(current.carbon_kg - alt.carbon_kg).toFixed(2)} kg CO2`;
      }
    }

    return {
      current_carbon_kg: current.carbon_kg,
      optimized_carbon_kg,
      carbon_saved_kg: +(current.carbon_kg - optimized_carbon_kg).toFixed(2),
      recommendation
    };
  }

  /**
   * Complex Logic for DEI (Dynamic Emission Intelligence) for Transport
   */
  static async DEI_TransportSummary(startAddr: string, endAddr: string, mode: string) {
    const startCoords = await geocode(startAddr);
    const endCoords = await geocode(endAddr);

    if (!startCoords || !endCoords) return null;

    const distance = await getRoutingDistanceKm(startCoords, endCoords);
    if (!distance) return null;

    const emission = calculateEmission("TRANSPORT", mode, distance);
    return {
        distance_km: distance,
        carbon_kg: emission.carbon_kg,
        optimization: await this.getOptimization("TRANSPORT", mode, distance)
    };
  }
}
