"use client";

import Link from "next/link";
import { useState } from "react";
import { Leaf, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/auth", label: "Sign In" },
  { href: "/post", label: "Post Food" },
  { href: "/verify", label: "Verify" },
  { href: "/listings", label: "My Listings" },
  { href: "/admin", label: "Admin" },
  { href: "/impact", label: "Impact" }
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-4 border-black bg-[#fffaf0]">
      <div className="section-shell flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="grid size-11 place-items-center border-4 border-black bg-[#b7e4c7] text-black shadow-[4px_4px_0_#000]">
            <Leaf className="size-5" />
          </span>
          <span className="text-2xl font-black">FoodLoop</span>
        </Link>

        <nav className="hidden items-center gap-3 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border-2 border-transparent px-3 py-2 text-sm font-black text-slate-950 transition hover:border-black hover:bg-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/post"
            className="hidden border-4 border-black bg-[#2f6f5e] px-5 py-2.5 text-sm font-black text-white shadow-[4px_4px_0_#000] transition hover:-translate-y-0.5 sm:inline-flex"
          >
            Post food
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid size-11 place-items-center border-4 border-black bg-white md:hidden"
            aria-label="Open menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "section-shell grid overflow-hidden transition-all md:hidden",
          open ? "max-h-72 pb-4" : "max-h-0"
        )}
      >
        <nav className="glass-card grid gap-2 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-2 border-transparent px-4 py-3 text-sm font-black text-slate-900 hover:border-black hover:bg-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
