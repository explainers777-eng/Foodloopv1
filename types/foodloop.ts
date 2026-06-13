export type FoodCategory =
  | "Meals"
  | "Bakery"
  | "Produce"
  | "Groceries"
  | "Beverages"
  | "Desserts";

export type DonorType = "Restaurant" | "Home" | "Bakery" | "Cafe" | "Supermarket" | "Hotel";

export type ListingStatus = "Available" | "Reserved" | "Picked Up" | "Expired";

export type FreshnessLevel = "Fresh" | "Use Soon" | "Urgent";

export interface FoodListing {
  id: string;
  name: string;
  description: string;
  image: string;
  quantity: string;
  servings: number;
  location: string;
  distance: number;
  pickupWindow: string;
  deadline: string;
  category: FoodCategory;
  donorType: DonorType;
  donorId?: string;
  donorName: string;
  donorContact?: string;
  status: ListingStatus;
  freshness: FreshnessLevel;
  co2Kg: number;
  matchedScore: number;
  claimCode?: string;
  claimantName?: string;
  claimantOrg?: string;
  claimantPhone?: string;
  claimedAt?: string;
}

export interface Badge {
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface CharityVerification {
  id: string;
  userId?: string;
  contactName: string;
  organizationName: string;
  ngoId: string;
  phone: string;
  email: string;
  serviceArea: string;
  status: "Pending" | "Verified" | "Rejected";
  adminNotes?: string;
  verifiedAt?: string;
}
