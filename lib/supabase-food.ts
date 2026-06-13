"use client";

import { createOptionalClient } from "@/lib/supabase";
import { CharityVerification, FoodListing } from "@/types/foodloop";

type ListingRow = {
  id: string;
  donor_id: string | null;
  food_name: string;
  description: string;
  photo_url: string | null;
  quantity: string;
  servings: number;
  pickup_location: string;
  pickup_window: string | null;
  category: FoodListing["category"];
  donor_type: FoodListing["donorType"];
  donor_name: string;
  donor_contact: string | null;
  status: FoodListing["status"];
  freshness: FoodListing["freshness"];
  co2_kg: number;
  claim_code: string | null;
  claimant_name: string | null;
  claimant_org: string | null;
  claimant_phone: string | null;
  claimed_at: string | null;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80";

type VerificationRow = {
  id: string;
  user_id: string;
  contact_name: string;
  organization_name: string;
  ngo_id: string;
  phone: string;
  email: string;
  service_area: string;
  status: CharityVerification["status"];
  admin_notes: string | null;
  verified_at: string | null;
};

function mapVerification(row: VerificationRow): CharityVerification {
  return {
    id: row.id,
    userId: row.user_id,
    contactName: row.contact_name,
    organizationName: row.organization_name,
    ngoId: row.ngo_id,
    phone: row.phone,
    email: row.email,
    serviceArea: row.service_area,
    status: row.status,
    adminNotes: row.admin_notes ?? undefined,
    verifiedAt: row.verified_at ?? undefined
  };
}

export async function fetchMyVerificationFromSupabase() {
  try {
    const supabase = createOptionalClient();
    if (!supabase) return { loaded: false, verification: null };

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return { loaded: true, verification: null, reason: "Not signed in" };

    const { data, error } = await supabase
      .from("charity_verifications")
      .select(
        "id, user_id, contact_name, organization_name, ngo_id, phone, email, service_area, status, admin_notes, verified_at"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) return { loaded: false, verification: null, reason: error.message };

    return {
      loaded: true,
      verification: data ? mapVerification(data as VerificationRow) : null,
      isVerified: data?.status === "Verified",
      target: "/browse"
    };
  } catch (error) {
    return {
      loaded: false,
      verification: null,
      reason: error instanceof Error ? error.message : "Unable to load verification"
    };
  }
}

export async function fetchPendingVerificationsFromSupabase() {
  try {
    const supabase = createOptionalClient();
    if (!supabase) return { loaded: false, verifications: [] as CharityVerification[] };

    const { data, error } = await supabase
      .from("charity_verifications")
      .select(
        "id, user_id, contact_name, organization_name, ngo_id, phone, email, service_area, status, admin_notes, verified_at"
      )
      .eq("status", "Pending")
      .order("created_at", { ascending: true });

    if (error) return { loaded: false, verifications: [] as CharityVerification[], reason: error.message };

    return {
      loaded: true,
      verifications: ((data ?? []) as VerificationRow[]).map(mapVerification)
    };
  } catch (error) {
    return {
      loaded: false,
      verifications: [] as CharityVerification[],
      reason: error instanceof Error ? error.message : "Unable to load approvals"
    };
  }
}

export async function reviewVerificationInSupabase(
  verificationId: string,
  status: "Verified" | "Rejected",
  adminNotes: string
) {
  try {
    const supabase = createOptionalClient();
    if (!supabase) return { saved: false, reason: "Supabase env not configured" };

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return { saved: false, reason: "Sign in as an admin before approving charities" };

    const { error } = await supabase
      .from("charity_verifications")
      .update({
        status,
        admin_notes: adminNotes,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        verified_at: status === "Verified" ? new Date().toISOString() : null
      })
      .eq("id", verificationId);

    return { saved: !error, reason: error?.message };
  } catch (error) {
    return {
      saved: false,
      reason: error instanceof Error ? error.message : "Unable to review verification"
    };
  }
}

export async function fetchListingsFromSupabase() {
  try {
    const supabase = createOptionalClient();
    if (!supabase) return { listings: [] as FoodListing[], loaded: false };

    const { data, error } = await supabase
      .from("food_listings")
      .select(
        "id, donor_id, food_name, description, photo_url, quantity, servings, pickup_location, pickup_window, category, donor_type, donor_name, donor_contact, status, freshness, co2_kg, claim_code, claimant_name, claimant_org, claimant_phone, claimed_at"
      )
      .order("created_at", { ascending: false });

    if (error) return { listings: [] as FoodListing[], loaded: false, error: error.message };

    return {
      loaded: true,
      listings: ((data ?? []) as ListingRow[]).map((row) => ({
        id: row.id,
        name: row.food_name,
        description: row.description,
        image: row.photo_url ?? fallbackImage,
        quantity: row.quantity,
        servings: row.servings,
        location: row.pickup_location,
        distance: 1,
        pickupWindow: row.pickup_window ?? "Scheduled pickup",
        deadline: "Open",
        category: row.category,
        donorType: row.donor_type,
        donorId: row.donor_id ?? undefined,
        donorName: row.donor_name,
        donorContact: row.donor_contact ?? undefined,
        status: row.status,
        freshness: row.freshness,
        co2Kg: Number(row.co2_kg ?? 0),
        matchedScore: row.status === "Available" ? 95 : 75,
        claimCode: row.claim_code ?? undefined,
        claimantName: row.claimant_name ?? undefined,
        claimantOrg: row.claimant_org ?? undefined,
        claimantPhone: row.claimant_phone ?? undefined,
        claimedAt: row.claimed_at ?? undefined
      }))
    };
  } catch (error) {
    return {
      listings: [] as FoodListing[],
      loaded: false,
      error: error instanceof Error ? error.message : "Unable to load Supabase listings"
    };
  }
}

export async function insertListingToSupabase(listing: FoodListing) {
  try {
    const supabase = createOptionalClient();
    if (!supabase) return { saved: false, reason: "Supabase env not configured" };

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return { saved: false, reason: "Sign in as a donor before posting to Supabase" };

    const { error } = await supabase.from("food_listings").insert({
      id: listing.id,
      donor_id: user.id,
      food_name: listing.name,
      description: listing.description,
      quantity: listing.quantity,
      servings: listing.servings,
      category: listing.category,
      donor_type: listing.donorType,
      donor_name: listing.donorName,
      donor_contact: listing.donorContact,
      pickup_location: listing.location,
      photo_url: listing.image,
      pickup_window: listing.pickupWindow,
      pickup_deadline: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      freshness: listing.freshness,
      status: listing.status,
      co2_kg: listing.co2Kg
    });

    return { saved: !error, reason: error?.message };
  } catch (error) {
    return { saved: false, reason: error instanceof Error ? error.message : "Supabase save failed" };
  }
}

export async function reserveListingInSupabase(listing: FoodListing, code: string) {
  try {
    const supabase = createOptionalClient();
    if (!supabase) return { saved: false, reason: "Supabase env not configured" };

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return { saved: false, reason: "Sign in as an approved charity before claiming" };

    const { data: verification, error: verificationError } = await supabase
      .from("charity_verifications")
      .select("id, organization_name, contact_name, phone")
      .eq("user_id", user.id)
      .eq("status", "Verified")
      .single();

    if (verificationError || !verification) {
      return { saved: false, reason: "Admin-approved charity verification is required" };
    }

    const { error: listingError } = await supabase
      .from("food_listings")
      .update({
        status: "Reserved",
        claim_code: code,
        claimant_id: user.id,
        claimant_name: verification.contact_name,
        claimant_org: verification.organization_name,
        claimant_phone: verification.phone,
        claimed_at: new Date().toISOString()
      })
      .eq("id", listing.id);

    const { error: claimError } = await supabase.from("claims").insert({
      listing_id: listing.id,
      claimant_id: user.id,
      charity_verification_id: verification.id,
      confirmation_code: code,
      status: "Reserved"
    });

    const { error: notificationError } = await supabase.from("notifications").insert({
      listing_id: listing.id,
      donor_id: listing.donorId,
      message: `${listing.claimantOrg ?? "A verified charity"} reserved ${listing.name}. Pickup code: ${code}`,
      claim_code: code
    });

    return {
      saved: !listingError && !claimError && !notificationError,
      reason: listingError?.message ?? claimError?.message ?? notificationError?.message
    };
  } catch (error) {
    return {
      saved: false,
      reason: error instanceof Error ? error.message : "Supabase reservation failed"
    };
  }
}

export async function markListingPickedUpInSupabase(listingId: string) {
  try {
    const supabase = createOptionalClient();
    if (!supabase) return { saved: false, reason: "Supabase env not configured" };

    const { error } = await supabase
      .from("food_listings")
      .update({ status: "Picked Up", updated_at: new Date().toISOString() })
      .eq("id", listingId);

    return { saved: !error, reason: error?.message };
  } catch (error) {
    return { saved: false, reason: error instanceof Error ? error.message : "Supabase update failed" };
  }
}

export async function saveVerificationToSupabase(verification: CharityVerification) {
  try {
    const supabase = createOptionalClient();
    if (!supabase) return { saved: false, reason: "Supabase env not configured" };

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return { saved: false, reason: "Sign in before submitting verification" };

    const { error } = await supabase
      .from("charity_verifications")
      .upsert(
        {
          user_id: user.id,
          contact_name: verification.contactName,
          organization_name: verification.organizationName,
          ngo_id: verification.ngoId,
          phone: verification.phone,
          email: verification.email,
          service_area: verification.serviceArea,
          status: verification.status,
          verified_at: verification.status === "Verified" ? new Date().toISOString() : null
        },
        { onConflict: "user_id" }
      );

    return {
      saved: !error,
      isVerified: !error && verification.status === "Verified",
      target: "/browse",
      reason: error?.message
    };
  } catch (error) {
    return {
      saved: false,
      reason: error instanceof Error ? error.message : "Supabase verification save failed"
    };
  }
}
