import Link from "next/link";
import { Leaf } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="animate-in border-t border-forest-100 bg-white/80 py-10 dark:border-white/10 dark:bg-slate-950">
      <div className="section-shell grid gap-8 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="mb-3 flex items-center gap-2 text-lg font-bold">
            <span className="grid size-9 place-items-center rounded-2xl bg-forest-600 text-white transition hover:-translate-y-1 hover:rotate-3">
              <Leaf className="size-4" />
            </span>
            FoodLoop
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
            Connecting surplus food with people and organizations who can use it before it goes to
            waste.
          </p>
        </div>
        <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="font-semibold text-slate-950 dark:text-white">Platform</span>
          <Link href="/browse" className="transition hover:translate-x-1 hover:text-forest-700">Browse food</Link>
          <Link href="/post" className="transition hover:translate-x-1 hover:text-forest-700">Post surplus</Link>
          <Link href="/impact" className="transition hover:translate-x-1 hover:text-forest-700">Impact dashboard</Link>
        </div>
        <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span className="font-semibold text-slate-950 dark:text-white">Built for</span>
          <span>Restaurants & bakeries</span>
          <span>NGOs & shelters</span>
          <span>Volunteers & neighbors</span>
        </div>
      </div>
    </footer>
  );
}
