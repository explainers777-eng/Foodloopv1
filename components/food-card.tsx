"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CalendarClock, CheckCircle2, KeyRound, MapPin, Sparkles, Users } from "lucide-react";
import { FoodListing } from "@/types/foodloop";
import { pickupUrgencyLabel } from "@/lib/smart-food";
import { StatusPill } from "@/components/status-pill";
import { generatePickupCode, getVerification, isVerifiedCharity, updateStoredListing } from "@/lib/local-food";
import { hasSupabaseEnv } from "@/lib/supabase";
import { reserveListingInSupabase } from "@/lib/supabase-food";

export function FoodCard({ listing, compact = false }: { listing: FoodListing; compact?: boolean }) {
  const [status, setStatus] = useState(listing.status);
  const [confirmation, setConfirmation] = useState<string | null>(listing.claimCode ?? null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const canClaim = status === "Available";

  async function claimListing() {
    setClaimError(null);

    if (!hasSupabaseEnv() && !isVerifiedCharity()) {
      setClaimError("Please verify your charity before claiming food.");
      return;
    }

    const verification = getVerification();
    const code = generatePickupCode(listing.id);
    const updates: Partial<FoodListing> = {
      status: "Reserved",
      claimCode: code,
      claimantName: verification?.contactName,
      claimantOrg: verification?.organizationName,
      claimantPhone: verification?.phone,
      claimedAt: new Date().toISOString()
    };
    const reservedListing = { ...listing, ...updates };

    if (hasSupabaseEnv()) {
      const result = await reserveListingInSupabase(reservedListing, code);
      if (!result.saved) {
        setClaimError(result.reason ?? "Admin-approved charity verification is required.");
        return;
      }
    }

    updateStoredListing(listing.id, updates);
    setStatus("Reserved");
    setConfirmation(code);
  }

  return (
    <article className="group glass-card overflow-hidden transition duration-300 hover:-translate-y-1">
      <div className="retro-titlebar">
        <span className="retro-dot" />
        <span className="retro-dot" />
        <span className="retro-dot" />
      </div>
      <div className="relative h-52 overflow-hidden">
        <Image
          src={listing.image}
          alt={listing.name}
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex gap-2">
          <StatusPill type="status">{status}</StatusPill>
          <StatusPill type="freshness">{listing.freshness}</StatusPill>
        </div>
        <div className="absolute bottom-4 right-4 border-4 border-black bg-[#b7e4c7] px-3 py-1 text-xs font-black text-black">
          {listing.matchedScore}% match
        </div>
      </div>

      <div className="grid gap-4 p-5">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="border-4 border-black bg-[#d9825b] px-3 py-1 text-xs font-black text-black">
              {listing.category}
            </span>
            <span className="text-xs font-black text-slate-700 dark:text-slate-200">
              {listing.donorType}
            </span>
          </div>
          <h3 className="text-xl font-bold tracking-tight">{listing.name}</h3>
          {!compact && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {listing.description}
            </p>
          )}
        </div>

        <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-2">
            <Users className="size-4 text-forest-600" /> {listing.quantity} · {listing.servings}{" "}
            servings
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="size-4 text-forest-600" /> {listing.location} · {listing.distance} km
          </span>
          <span className="flex items-center gap-2">
            <CalendarClock className="size-4 text-forest-600" /> {listing.pickupWindow} ·{" "}
            {listing.deadline}
          </span>
          <span className="flex items-center gap-2">
            <Sparkles className="size-4 text-citrus-500" /> {pickupUrgencyLabel(listing.freshness)}
          </span>
        </div>

        {confirmation ? (
          <div className="border-4 border-black bg-[#b7e4c7] p-4 text-sm font-bold text-black">
            <div className="mb-1 flex items-center gap-2 font-bold">
              <CheckCircle2 className="size-4" /> Pickup reserved
            </div>
            <div className="mt-2 flex items-center gap-2 text-lg">
              <KeyRound className="size-5" /> {confirmation}
            </div>
            Show this unique code at {listing.location}. The donor sees the same code.
          </div>
        ) : (
          <div className="grid gap-3">
            <button type="button" onClick={claimListing} disabled={!canClaim} className="retro-button">
              {canClaim ? "Claim food" : "Already claimed"}
            </button>
            {claimError && (
              <div className="border-4 border-black bg-white p-3 text-sm font-black text-black">
                {claimError}{" "}
                <Link href="/verify" className="text-[#6f42ff] underline">
                  Verify now &gt;&gt;&gt;
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
