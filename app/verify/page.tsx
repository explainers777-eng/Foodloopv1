"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { VerificationForm } from "@/components/verification-form";
import { fetchMyVerificationFromSupabase } from "@/lib/supabase-food";

export default function VerifyPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      const res = await fetchMyVerificationFromSupabase();
      if (res.loaded && res.isVerified) {
        setIsVerified(true);
      }
      setLoading(false);
    };
    checkStatus();
  }, []);

  return (
    <main className="section-shell py-10">
      <div className="mb-8 max-w-3xl">
        <p className="mb-3 inline-flex border-4 border-black bg-[#b7e4c7] px-4 py-2 font-black text-black shadow-[5px_5px_0_#000]">
          Anti-misuse checkpoint
        </p>
        <h1 className="text-5xl font-black tracking-tight sm:text-6xl">Verify your charity</h1>
        <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
          FoodLoop requires claimants to identify a charity, NGO, shelter, or community food program
          before reserving food.
        </p>
      </div>

      {!loading && isVerified ? (
        <div className="flex flex-col items-center justify-between gap-8 border-4 border-black bg-white p-8 shadow-[10px_10px_0_#000] sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="size-10" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-black">Account Verified</h2>
              <p className="font-bold text-slate-600">You are cleared to start claiming food rescues.</p>
            </div>
          </div>

          <Link
            href="/browse"
            className="group inline-flex items-center gap-2 border-4 border-black bg-[#b7e4c7] px-8 py-4 text-xl font-black text-black shadow-[5px_5px_0_#000] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
          >
            Browse Food Listings
            <ArrowRight className="size-6 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      ) : (
        <VerificationForm />
      )}
    </main>
  );
}
