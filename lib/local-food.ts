"use client";

import { CharityVerification, FoodListing } from "@/types/foodloop";

const listingsKey = "foodloop:listings";
const verificationKey = "foodloop:charity-verification";

export function getStoredListings(): FoodListing[] {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem(listingsKey) ?? "[]") as FoodListing[];
  } catch {
    return [];
  }
}

export function saveStoredListings(listings: FoodListing[]) {
  localStorage.setItem(listingsKey, JSON.stringify(listings));
  window.dispatchEvent(new Event("foodloop:listings-updated"));
}

export function addStoredListing(listing: FoodListing) {
  saveStoredListings([listing, ...getStoredListings()]);
}

export function updateStoredListing(listingId: string, updates: Partial<FoodListing>) {
  const updated = getStoredListings().map((listing) =>
    listing.id === listingId ? { ...listing, ...updates } : listing
  );
  saveStoredListings(updated);
  return updated.find((listing) => listing.id === listingId);
}

export function getVerification(): CharityVerification | null {
  if (typeof window === "undefined") return null;

  try {
    return JSON.parse(localStorage.getItem(verificationKey) ?? "null") as CharityVerification | null;
  } catch {
    return null;
  }
}

export function saveVerification(verification: CharityVerification) {
  localStorage.setItem(verificationKey, JSON.stringify(verification));
  window.dispatchEvent(new Event("foodloop:verification-updated"));
}

export function isVerifiedCharity() {
  return getVerification()?.status === "Verified";
}

export function generatePickupCode(listingId: string) {
  const segment = listingId.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase().padStart(4, "X");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `FL-${segment}-${random}`;
}
