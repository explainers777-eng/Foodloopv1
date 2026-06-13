import { Badge, FoodListing } from "@/types/foodloop";

export const listings: FoodListing[] = [
  {
    id: "fl-1001",
    name: "Vegetable Biryani Trays",
    description: "Freshly prepared lunch buffet surplus packed in sealed catering trays.",
    image:
      "https://images.unsplash.com/photo-1631515242808-497c3fbd3972?auto=format&fit=crop&w=1200&q=80",
    quantity: "4 trays",
    servings: 42,
    location: "Indiranagar Community Kitchen",
    distance: 1.2,
    pickupWindow: "Today, 6:00–7:30 PM",
    deadline: "2h 15m",
    category: "Meals",
    donorType: "Restaurant",
    donorName: "Green Bowl Bistro",
    status: "Available",
    freshness: "Fresh",
    co2Kg: 73,
    matchedScore: 98
  },
  {
    id: "fl-1002",
    name: "Assorted Sourdough Loaves",
    description: "End-of-day artisan breads, sliced and bagged for easy distribution.",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
    quantity: "28 loaves",
    servings: 56,
    location: "12th Main Bakery Lane",
    distance: 2.6,
    pickupWindow: "Today, 8:00–9:00 PM",
    deadline: "3h 40m",
    category: "Bakery",
    donorType: "Bakery",
    donorName: "Crust & Crumb",
    status: "Available",
    freshness: "Use Soon",
    co2Kg: 41,
    matchedScore: 91
  },
  {
    id: "fl-1003",
    name: "Organic Fruit Boxes",
    description: "Apples, bananas, oranges, and pears with minor cosmetic imperfections.",
    image:
      "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1200&q=80",
    quantity: "9 crates",
    servings: 90,
    location: "MG Road FreshMart",
    distance: 3.1,
    pickupWindow: "Tomorrow, 9:00–11:00 AM",
    deadline: "15h",
    category: "Produce",
    donorType: "Supermarket",
    donorName: "FreshMart Local",
    status: "Reserved",
    freshness: "Fresh",
    co2Kg: 118,
    matchedScore: 84
  },
  {
    id: "fl-1004",
    name: "Cafe Sandwich Packs",
    description: "Vegetarian sandwiches prepared this afternoon, individually wrapped.",
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1200&q=80",
    quantity: "36 packs",
    servings: 36,
    location: "Koramangala 5th Block",
    distance: 0.8,
    pickupWindow: "Today, 5:30–6:15 PM",
    deadline: "55m",
    category: "Meals",
    donorType: "Cafe",
    donorName: "Loop Cafe",
    status: "Available",
    freshness: "Urgent",
    co2Kg: 59,
    matchedScore: 96
  },
  {
    id: "fl-1005",
    name: "Family Celebration Meal",
    description: "Home-cooked rice, dal, vegetable curry, and chapatis packed hygienically.",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
    quantity: "18 portions",
    servings: 18,
    location: "Domlur Layout",
    distance: 4.4,
    pickupWindow: "Today, 7:00–8:00 PM",
    deadline: "2h 50m",
    category: "Meals",
    donorType: "Home",
    donorName: "Rao Family",
    status: "Available",
    freshness: "Fresh",
    co2Kg: 31,
    matchedScore: 79
  },
  {
    id: "fl-1006",
    name: "Hotel Breakfast Buffet",
    description: "Idlis, upma, cut fruit, and juice from a conference breakfast service.",
    image:
      "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1200&q=80",
    quantity: "65 servings",
    servings: 65,
    location: "Central Business District",
    distance: 5.2,
    pickupWindow: "Completed yesterday",
    deadline: "Completed",
    category: "Meals",
    donorType: "Hotel",
    donorName: "Canopy Suites",
    status: "Picked Up",
    freshness: "Use Soon",
    co2Kg: 107,
    matchedScore: 88
  }
];

export const impactTotals = {
  meals: 248920,
  foodKg: 74680,
  co2Kg: 194120,
  pickups: 18342,
  donors: 1280
};

export const monthlyImpact = [
  { month: "Jan", meals: 12400, co2: 9100 },
  { month: "Feb", meals: 16800, co2: 12800 },
  { month: "Mar", meals: 22100, co2: 17100 },
  { month: "Apr", meals: 28600, co2: 22300 },
  { month: "May", meals: 35400, co2: 27900 },
  { month: "Jun", meals: 42100, co2: 33800 }
];

export const categoryImpact = [
  { name: "Meals", value: 46 },
  { name: "Produce", value: 24 },
  { name: "Bakery", value: 16 },
  { name: "Groceries", value: 14 }
];

export const badges: Badge[] = [
  {
    name: "First Rescue",
    description: "Completed your first successful food rescue.",
    icon: "🌱",
    unlocked: true
  },
  {
    name: "Community Hero",
    description: "Supported more than 10 neighborhood pickups.",
    icon: "🤝",
    unlocked: true
  },
  {
    name: "100 Meals Saved",
    description: "Helped route 100 meals away from waste.",
    icon: "🏅",
    unlocked: true
  },
  {
    name: "Food Waste Fighter",
    description: "Maintained a perfect pickup reliability score.",
    icon: "🛡️",
    unlocked: false
  }
];
