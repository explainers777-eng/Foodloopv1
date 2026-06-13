"use client";

import { useEffect, useMemo, useState } from "react";
import { Leaf, PackageCheck, Recycle, Users } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { getStoredListings } from "@/lib/local-food";
import { fetchListingsFromSupabase } from "@/lib/supabase-food";
import { FoodListing } from "@/types/foodloop";

export function LiveHomeStats() {
  const [listings, setListings] = useState<FoodListing[]>([]);

  useEffect(() => {
    const sync = async () => {
      const supabaseListings = await fetchListingsFromSupabase();
      setListings(supabaseListings.loaded ? supabaseListings.listings : getStoredListings());
    };
    sync();
    const syncLocal = () => void sync();
    window.addEventListener("foodloop:listings-updated", syncLocal);
    window.addEventListener("storage", syncLocal);
    return () => {
      window.removeEventListener("foodloop:listings-updated", syncLocal);
      window.removeEventListener("storage", syncLocal);
    };
  }, []);

  const totals = useMemo(
    () => ({
      meals: listings
        .filter((listing) => listing.status === "Reserved" || listing.status === "Picked Up")
        .reduce((sum, listing) => sum + listing.servings, 0),
      foodKg: Math.round(listings.reduce((sum, listing) => sum + listing.servings * 0.45, 0)),
      co2Kg: listings.reduce((sum, listing) => sum + listing.co2Kg, 0),
      pickups: listings.filter((listing) => listing.status === "Reserved" || listing.status === "Picked Up").length
    }),
    [listings]
  );

  return (
    <section className="section-shell py-12">
      <div className="mb-5 border-4 border-black bg-white p-4 font-black shadow-[6px_6px_0_#000]">
        Live totals from actual posted listings. If nothing is posted yet, the numbers stay at zero.
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Users} label="Meals claimed" value={totals.meals} tone="green" />
        <MetricCard icon={Recycle} label="Food listed" value={totals.foodKg} suffix=" kg" tone="orange" />
        <MetricCard icon={Leaf} label="Estimated CO₂ impact" value={totals.co2Kg} suffix=" kg" />
        <MetricCard icon={PackageCheck} label="Reserved pickups" value={totals.pickups} tone="slate" />
      </div>
    </section>
  );
}
