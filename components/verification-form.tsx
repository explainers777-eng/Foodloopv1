"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { getVerification, saveVerification } from "@/lib/local-food";
import { hasSupabaseEnv } from "@/lib/supabase";
import { fetchMyVerificationFromSupabase, saveVerificationToSupabase } from "@/lib/supabase-food";
import { CharityVerification } from "@/types/foodloop";

export function VerificationForm() {
  const [verification, setVerification] = useState<CharityVerification | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const syncVerification = async () => {
      const supabaseVerification = await fetchMyVerificationFromSupabase();
      setVerification(supabaseVerification.verification ?? getVerification());
    };

    syncVerification();
    const interval = window.setInterval(syncVerification, 5000);
    return () => window.clearInterval(interval);
  }, []);

  async function submitVerification(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextVerification: CharityVerification = {
      id: crypto.randomUUID(),
      contactName: String(form.get("contactName") ?? ""),
      organizationName: String(form.get("organizationName") ?? ""),
      ngoId: String(form.get("ngoId") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      serviceArea: String(form.get("serviceArea") ?? ""),
      status: "Pending"
    };

    const result = await saveVerificationToSupabase(nextVerification);

    if (result.saved || !hasSupabaseEnv()) {
      saveVerification(nextVerification);
      setVerification(nextVerification);
    }

    if (result.saved) {
      setMessage("Verification submitted. An admin must approve your NGO ID before claims are allowed.");
      return;
    }

    if (result.reason?.includes("Sign in")) {
      setMessage("Please sign in before submitting charity verification.");
      return;
    }

    setMessage(result.reason ?? "Unable to submit verification right now.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <form className="glass-card motion-panel grid gap-5 p-6" onSubmit={submitVerification}>
        <div className="stagger-list grid gap-5 md:grid-cols-2">
          <Field label="Contact name">
            <input name="contactName" className="input" defaultValue={verification?.contactName} required />
          </Field>
          <Field label="Organization name">
            <input
              name="organizationName"
              className="input"
              defaultValue={verification?.organizationName}
              required
            />
          </Field>
          <Field label="Registration / NGO ID">
            <input name="ngoId" className="input" defaultValue={verification?.ngoId} required />
          </Field>
          <Field label="Phone">
            <input name="phone" className="input" defaultValue={verification?.phone} required />
          </Field>
          <Field label="Email">
            <input name="email" type="email" className="input" defaultValue={verification?.email} required />
          </Field>
          <Field label="Service area">
            <input name="serviceArea" className="input" defaultValue={verification?.serviceArea} required />
          </Field>
        </div>
        <button className="retro-button">Submit for admin approval</button>
        {message && (
          <div className="animate-pop border-4 border-black bg-[#b7e4c7] p-4 text-sm font-black text-black">
            <CheckCircle2 className="mr-2 inline size-4" /> {message}
            {message.includes("sign in") && (
              <Link href="/auth" className="ml-2 underline">
                Sign in
              </Link>
            )}
          </div>
        )}
      </form>

      <aside className="retro-window motion-panel h-fit p-6">
        <ShieldCheck className="animate-wiggle mb-4 size-10" />
        <h2 className="text-2xl font-black">Claim access</h2>
        <p className="mt-3 font-semibold text-slate-800">
          Status:{" "}
          <span className="border-4 border-black bg-[#b7e4c7] px-2 py-1 text-black">
            {verification?.status ?? "Not verified"}
          </span>
        </p>
        <p className="mt-4 text-sm font-semibold text-slate-800">
          FoodLoop checks the NGO ID first, then an admin approves the charity record in Supabase.
          Only approved charities can see protected listings through RLS.
        </p>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black">{label}</span>
      {children}
    </label>
  );
}
