"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ShieldAlert, XCircle } from "lucide-react";
import {
  fetchPendingVerificationsFromSupabase,
  reviewVerificationInSupabase
} from "@/lib/supabase-food";
import { CharityVerification } from "@/types/foodloop";

export function AdminApprovals() {
  const [verifications, setVerifications] = useState<CharityVerification[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadApprovals() {
    const result = await fetchPendingVerificationsFromSupabase();
    setVerifications(result.verifications);
    setLoading(false);
    if (!result.loaded && result.reason) {
      setMessage(result.reason);
    }
  }

  useEffect(() => {
    loadApprovals();
    const interval = window.setInterval(loadApprovals, 5000);
    return () => window.clearInterval(interval);
  }, []);

  async function review(id: string, status: "Verified" | "Rejected") {
    const result = await reviewVerificationInSupabase(
      id,
      status,
      status === "Verified" ? "NGO ID checked and approved" : "NGO ID rejected by admin"
    );

    if (!result.saved) {
      setMessage(result.reason ?? "Unable to update verification");
      return;
    }

    setMessage(status === "Verified" ? "Charity approved." : "Charity rejected.");
    await loadApprovals();
  }

  if (loading) {
    return <div className="glass-card p-6 font-black">Loading approval requests...</div>;
  }

  return (
    <section className="grid gap-5">
      {message && (
        <div className="border-4 border-black bg-white p-4 text-sm font-black text-black shadow-[5px_5px_0_#000]">
          {message}
        </div>
      )}

      {verifications.length === 0 ? (
        <div className="retro-window grid min-h-72 place-items-center p-8 text-center">
          <div>
            <ShieldAlert className="mx-auto mb-4 size-12" />
            <h2 className="text-3xl font-black">No pending requests</h2>
            <p className="mt-3 font-semibold text-slate-800">
              New charity verification requests will appear here automatically.
            </p>
          </div>
        </div>
      ) : (
        verifications.map((verification) => (
          <article key={verification.id} className="glass-card grid gap-5 p-6 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-2xl font-black">{verification.organizationName}</h2>
              <div className="mt-3 grid gap-2 text-sm font-semibold text-slate-800 md:grid-cols-2">
                <span>Contact: {verification.contactName}</span>
                <span>NGO ID: {verification.ngoId}</span>
                <span>Email: {verification.email}</span>
                <span>Phone: {verification.phone}</span>
                <span>Area: {verification.serviceArea}</span>
                <span>Status: {verification.status}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => review(verification.id, "Verified")}
                className="retro-button gap-2 bg-[#2f6f5e]"
              >
                <CheckCircle2 className="size-4" /> Approve
              </button>
              <button
                type="button"
                onClick={() => review(verification.id, "Rejected")}
                className="retro-button gap-2 bg-[#d9825b] text-black"
              >
                <XCircle className="size-4" /> Reject
              </button>
            </div>
          </article>
        ))
      )}
    </section>
  );
}
