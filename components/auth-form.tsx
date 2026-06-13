"use client";

import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { createOptionalClient } from "@/lib/supabase";

export function AuthForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const role = String(form.get("role") ?? "charity");
    const supabase = createOptionalClient();

    if (!supabase) {
      setMessage("Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to use auth.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
        data: { role }
      }
    });

    setMessage(error ? error.message : "Magic link sent. Check your email.");
    setLoading(false);
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={signIn}>
      <label>
        <span className="mb-2 block text-sm font-bold">Email</span>
        <input name="email" className="input" type="email" placeholder="you@example.org" required />
      </label>
      <label>
        <span className="mb-2 block text-sm font-bold">Account type</span>
        <select name="role" className="input" defaultValue="charity">
          <option value="charity">Charity / NGO</option>
          <option value="donor">Food donor</option>
        </select>
      </label>
      <button className="retro-button gap-2" disabled={loading}>
        <LockKeyhole className="size-4" /> {loading ? "Sending..." : "Send magic link"}
      </button>
      {message && (
        <div className="border-4 border-black bg-white p-3 text-sm font-black text-black">
          {message}
        </div>
      )}
    </form>
  );
}
