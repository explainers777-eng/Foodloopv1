"use client";

import { useEffect, useState } from "react";
import { Award, ClipboardCheck, Clock, Inbox, KeyRound, PackageCheck, Phone } from "lucide-react";
import { FoodCard } from "@/components/food-card";
import { StatusPill } from "@/components/status-pill";
import { badges } from "@/lib/data";
import { getStoredListings, updateStoredListing } from "@/lib/local-food";
import { fetchListingsFromSupabase, markListingPickedUpInSupabase } from "@/lib/supabase-food";
import { FoodListing, ListingStatus } from "@/types/foodloop";

const groups: { label: string; status: ListingStatus; icon: typeof Clock }[] = [
  { label: "Active listings", status: "Available", icon: Clock },
  { label: "Claimed listings", status: "Reserved", icon: ClipboardCheck },
  { label: "Completed pickups", status: "Picked Up", icon: PackageCheck }
];

export function LiveMyListings() {
  const [listings, setListings] = useState<FoodListing[]>([]);

  useEffect(() => {
    const sync = async () => {
      const supabaseListings = await fetchListingsFromSupabase();
      setListings(supabaseListings.loaded ? supabaseListings.listings : getStoredListings());
    };
    sync();
    const interval = window.setInterval(sync, 5000);
    const syncLocal = () => void sync();
    window.addEventListener("foodloop:listings-updated", syncLocal);
    window.addEventListener("storage", syncLocal);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("foodloop:listings-updated", syncLocal);
      window.removeEventListener("storage", syncLocal);
    };
  }, []);

  async function completePickup(listingId: string) {
    updateStoredListing(listingId, { status: "Picked Up" });
    setListings((current) =>
      current.map((listing) =>
        listing.id === listingId ? { ...listing, status: "Picked Up" } : listing
      )
    );
    await markListingPickedUpInSupabase(listingId);
  }

  return (
    <>
      <section className="mb-8 grid gap-4 md:grid-cols-3">
        {groups.map((group) => {
          const count = listings.filter((listing) => listing.status === group.status).length;
          return (
            <div key={group.label} className="glass-card p-6">
              <group.icon className="mb-4 size-7" />
              <div className="text-4xl font-black">{count}</div>
              <p className="mt-1 text-sm font-black text-slate-800 dark:text-slate-100">{group.label}</p>
            </div>
          );
        })}
      </section>

      <section className="mb-10 grid gap-5 lg:grid-cols-4">
        {badges.map((badge) => (
          <div
            key={badge.name}
            className={`border-4 border-black p-5 shadow-[7px_7px_0_#000] ${
              badge.unlocked ? "bg-[#f2d38b]" : "bg-white opacity-70 dark:bg-slate-900"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-3xl">{badge.icon}</span>
              <Award className="size-5" />
            </div>
            <h3 className="font-black">{badge.name}</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-800 dark:text-slate-100">
              {badge.description}
            </p>
          </div>
        ))}
      </section>

      {listings.length === 0 ? (
        <section className="retro-window grid min-h-80 place-items-center p-8 text-center">
          <div>
            <Inbox className="mx-auto mb-5 size-14" />
            <h2 className="text-3xl font-black">No listings yet</h2>
            <p className="mt-3 font-semibold">Post food first, then restaurant updates will appear here.</p>
          </div>
        </section>
      ) : (
        <div className="grid gap-10">
          {groups.map((group) => {
            const groupListings = listings.filter((listing) => listing.status === group.status);
            return (
              <section key={group.label}>
                <div className="mb-4 flex items-center gap-3">
                  <h2 className="text-2xl font-black">{group.label}</h2>
                  <StatusPill type="status">{group.status}</StatusPill>
                </div>
                {groupListings.length > 0 ? (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {groupListings.map((listing) => (
                      <div key={listing.id} className="grid gap-4">
                        <FoodCard listing={listing} compact />
                        {listing.status === "Reserved" && (
                          <div className="border-4 border-black bg-[#b7e4c7] p-4 text-sm font-black text-black shadow-[6px_6px_0_#000]">
                            <div className="flex items-center gap-2 text-lg">
                              <KeyRound className="size-5" /> Pickup code: {listing.claimCode}
                            </div>
                            <div className="mt-2">
                              Claimed by {listing.claimantOrg ?? "Verified charity"} ·{" "}
                              {listing.claimantName ?? "Verified contact"}
                            </div>
                            {listing.claimantPhone && (
                              <div className="mt-2 flex items-center gap-2">
                                <Phone className="size-4" /> {listing.claimantPhone}
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => completePickup(listing.id)}
                              className="mt-4 border-4 border-black bg-white px-4 py-2 font-black text-black shadow-[4px_4px_0_#000]"
                            >
                              Code matched — mark picked up
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-4 border-black bg-white p-5 font-black shadow-[5px_5px_0_#000] dark:bg-slate-900">
                    No {group.label.toLowerCase()}.
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
