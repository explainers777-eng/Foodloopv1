import { Leaf } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export default function AuthPage() {
  return (
    <main className="section-shell page-enter grid min-h-[calc(100vh-9rem)] place-items-center py-10">
      <section className="glass-card motion-card w-full max-w-md p-6">
        <div className="animate-wiggle mb-6 grid size-14 place-items-center border-4 border-black bg-[#2f6f5e] text-white">
          <Leaf className="size-7" />
        </div>
        <h1 className="text-3xl font-black tracking-tight">Welcome to FoodLoop</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
          Sign in with Supabase magic links. Charities still need NGO ID review and admin approval
          before listings become visible.
        </p>
        <AuthForm />
      </section>
    </main>
  );
}
