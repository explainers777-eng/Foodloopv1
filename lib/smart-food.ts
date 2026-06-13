import { FoodCategory, FreshnessLevel } from "@/types/foodloop";

const categoryKeywords: Record<FoodCategory, string[]> = {
  Meals: ["meal", "rice", "biryani", "curry", "sandwich", "buffet", "pasta", "soup"],
  Bakery: ["bread", "loaf", "cake", "pastry", "croissant", "bun"],
  Produce: ["fruit", "vegetable", "apple", "banana", "crate", "salad"],
  Groceries: ["grocery", "pantry", "cereal", "milk", "staple"],
  Beverages: ["juice", "tea", "coffee", "drink"],
  Desserts: ["dessert", "sweet", "cookie", "muffin", "brownie"]
};

export function suggestFoodCategory(foodName: string): FoodCategory {
  const normalized = foodName.toLowerCase();
  const match = Object.entries(categoryKeywords).find(([, keywords]) =>
    keywords.some((keyword) => normalized.includes(keyword))
  );

  return (match?.[0] as FoodCategory | undefined) ?? "Meals";
}

export function estimateServings(quantity: string): number {
  const number = Number(quantity.match(/\d+/)?.[0] ?? 8);
  if (/tray|crate|box/i.test(quantity)) return number * 10;
  if (/kg/i.test(quantity)) return number * 3;
  return number;
}

export function estimateFreshness(foodName: string, hoursSincePrepared: number): FreshnessLevel {
  const category = suggestFoodCategory(foodName);
  const shelfLifeHours: Record<FoodCategory, number> = {
    Meals: 6,
    Bakery: 24,
    Produce: 48,
    Groceries: 72,
    Beverages: 24,
    Desserts: 12
  };
  const remainingRatio = 1 - hoursSincePrepared / shelfLifeHours[category];

  if (remainingRatio > 0.55) return "Fresh";
  if (remainingRatio > 0.2) return "Use Soon";
  return "Urgent";
}

export function pickupUrgencyLabel(freshness: FreshnessLevel) {
  if (freshness === "Fresh") return "Pickup flexible within the listed window";
  if (freshness === "Use Soon") return "Prioritize pickup in the next few hours";
  return "Urgent pickup recommended as soon as possible";
}
