"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Inbox, SlidersHorizontal, Sparkles } from "lucide-react";
import { FoodCard } from "@/components/food-card";
import { getStoredListings, getVerification } from "@/lib/local-food";
import { fetchListingsFromSupabase, fetchMyVerificationFromSupabase } from "@/lib/supabase-food";
import { FoodListing } from "@/types/foodloop";

const filters = {
  Distance: ["Under 1 km", "Under 3 km", "Under 5 km"],
  Category: ["Meals", "Bakery", "Produce", "Groceries"],
  Quantity: ["1–20 servings", "20–50 servings", "50+ servings"],
  "Pickup time": ["Now", "Today evening", "Tomorrow"]
};

export function LiveListings() {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    const syncListings = async () => {
      const supabaseVerification = await fetchMyVerificationFromSupabase();
      const supabaseListings = await fetchListingsFromSupabase();
      const localApproved = getVerification()?.status === "Verified";
      const supabaseApproved = supabaseVerification.verification?.status === "Verified";
      const useLocalFallback = !supabaseVerification.loaded && localApproved;
      setIsApproved(supabaseApproved || useLocalFallback);
      setListings(
        supabaseApproved && supabaseListings.loaded
          ? supabaseListings.listings
          : useLocalFallback
            ? getStoredListings()
            : []
      );
    };
    syncListings();
    const interval = window.setInterval(syncListings, 5000);
    const syncLocal = () => void syncListings();
    window.addEventListener("foodloop:listings-updated", syncLocal);
    window.addEventListener("storage", syncLocal);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("foodloop:listings-updated", syncLocal);
      window.removeEventListener("storage", syncLocal);
    };
  }, []);

  const availableListings = listings
    .filter((listing) => listing.status !== "Expired")
    .sort((a, b) => b.matchedScore - a.matchedScore);

  return (
    <>
      <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 border-4 border-black bg-[#b7e4c7] px-4 py-2 text-sm font-black text-black shadow-[5px_5px_0_#000]">
            <Sparkles className="size-4" /> Verified charities only
          </p>
          <h1 className="text-5xl font-black tracking-tight sm:text-6xl">Browse nearby food</h1>
          <p className="mt-3 max-w-2xl text-lg font-semibold text-slate-900">
            Listings are visible only after NGO ID review and admin approval.
          </p>
        </div>
        <div className="border-4 border-black bg-white px-5 py-3 text-sm font-black shadow-[6px_6px_0_#000]">
          {availableListings.length} live listings
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="glass-card h-fit p-5 lg:sticky lg:top-24">
          <div className="mb-5 flex items-center gap-2 font-black">
            <SlidersHorizontal className="size-5" /> Filters
          </div>
          <div className="grid gap-5">
            {Object.entries(filters).map(([label, options]) => (
              <div key={label}>
                <label className="mb-2 block text-sm font-black">{label}</label>
                <select className="input">
                  <option>Any {label.toLowerCase()}</option>
                  {options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </aside>

        {!isApproved ? (
          <section className="retro-window grid min-h-96 place-items-center p-8 text-center">
            <div>
              <Inbox className="mx-auto mb-5 size-14" />
              <h2 className="text-3xl font-black">Approval required</h2>
              <p className="mx-auto mt-3 max-w-md font-semibold text-slate-800">
                Submit charity verification and wait for admin approval before listings are shown.
              </p>
              <Link href="/verify" className="retro-button mt-6">
                Verify charity
              </Link>
            </div>
          </section>
        ) : availableListings.length > 0 ? (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {availableListings.map((listing) => (
              <FoodCard key={listing.id} listing={listing} />
            ))}
          </section>
        ) : (
          <section className="retro-window grid min-h-96 place-items-center p-8 text-center">
            <div>
              <Inbox className="mx-auto mb-5 size-14" />
              <h2 className="text-3xl font-black">No listings yet</h2>
              <p className="mx-auto mt-3 max-w-md font-semibold text-slate-800">
                Once a restaurant, bakery, home, or store posts surplus food, it will show up here.
              </p>
              <Link href="/post" className="retro-button mt-6">
                Post the first listing
              </Link>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
