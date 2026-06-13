import Link from "next/link";
import {
  BadgeCheck,
  BarChart3,
  Clock3,
  MapPin,
  Recycle,
  ShieldCheck,
  Sparkles,
  Truck
} from "lucide-react";
import { LiveHomeStats } from "@/components/live-home-stats";

const steps = [
  {
    title: "Post surplus",
    copy: "Donors add food details, photos, pickup windows, and freshness notes.",
    icon: Recycle
  },
  {
    title: "Match nearby",
    copy: "Smart ranking highlights urgent, relevant food for NGOs and volunteers.",
    icon: MapPin
  },
  {
    title: "Claim & pickup",
    copy: "Recipients reserve food, receive confirmation, and complete the pickup.",
    icon: Truck
  }
];

const features = [
  "AI food recognition and serving estimates",
  "Freshness assistant with urgency colors",
  "Pickup confirmations and listing statuses",
  "Badges for reliable donors and rescuers",
  "Supabase-backed verification and listing data",
  "Readable mobile-first retro interface"
];

export default function LandingPage() {
  return (
    <main className="overflow-hidden">
      <section className="relative py-16 sm:py-24">
        <div className="section-shell grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 border-4 border-black bg-[#b7e4c7] px-4 py-2 text-sm font-black text-black shadow-[6px_6px_0_#000]">
              <Sparkles className="size-4" /> Food rescue for verified communities
            </div>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Welcome to FoodLoop!
            </h1>
            <p className="mt-6 max-w-2xl text-xl font-semibold leading-8 text-slate-900">
              A modern food rescue platform where donors post surplus food and verified
              charities claim it with unique pickup codes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/post" className="retro-button gap-2">
                Post surplus food
              </Link>
              <Link href="/verify" className="retro-button bg-[#d9825b] text-black">
                Verify charity
              </Link>
            </div>
          </div>
          <div className="retro-window">
            <div className="retro-titlebar">
              <span className="retro-dot" />
              <span className="retro-dot" />
              <span className="retro-dot" />
            </div>
            <div className="grid place-items-center p-8 text-center sm:p-12">
              <div className="mb-5 grid size-24 place-items-center rounded-full border-4 border-black bg-[#d8a2ff] text-5xl">
                ☺
              </div>
              <h2 className="text-4xl font-black sm:text-5xl">Start &gt;&gt;&gt;</h2>
              <p className="mt-4 max-w-md font-semibold">
                Post food, verify charities, reserve pickups, and show matching codes at handoff.
              </p>
            </div>
          </div>
        </div>
      </section>

      <LiveHomeStats />

      <section className="section-shell py-16">
        <div className="mb-10 max-w-2xl">
          <p className="font-bold uppercase tracking-[0.2em] text-forest-600">Mission</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Make food rescue as easy as ordering delivery.
          </h2>
            <p className="mt-4 text-slate-700">
            FoodLoop reduces friction between surplus and need with clear listings, reliable pickup
            scheduling, smart freshness guidance, and visible community impact.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.title} className="glass-card p-6">
              <div className="mb-5 grid size-12 place-items-center border-4 border-black bg-[#b7e4c7] text-black">
                <step.icon className="size-6" />
              </div>
              <h3 className="text-xl font-black">{step.title}</h3>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">
                {step.copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y-4 border-black bg-[#1f2933] py-16 text-white">
        <div className="section-shell grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="font-bold uppercase tracking-[0.2em] text-citrus-400">Features</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Built like a real startup product.
            </h2>
            <p className="mt-4 text-slate-300">
              A single platform handles donors, claimants, smart assistance, status tracking,
              gamification, and impact reporting.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature} className="border-4 border-black bg-[#fffaf0] p-5 text-black shadow-[7px_7px_0_#000]">
                <BadgeCheck className="mb-4 size-6 text-citrus-400" />
                <p className="font-black">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-16">
        <div className="grid items-center gap-8 border-4 border-black bg-[#2f6f5e] p-8 text-white shadow-[12px_12px_0_#000] md:grid-cols-[1fr_auto] md:p-12">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
              <BarChart3 className="size-4" /> Impact-first operations
            </p>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
              Every claim turns waste into community value.
            </h2>
            <p className="mt-4 max-w-2xl text-forest-50">
              Track meals saved, kilograms rescued, CO₂ prevented, pickup reliability, and donor
              achievements in one responsive dashboard.
            </p>
          </div>
          <Link
            href="/impact"
            className="retro-button gap-2 bg-white text-black"
          >
            View impact <Clock3 className="size-4" />
          </Link>
        </div>
      </section>

      <section className="section-shell pb-20">
        <div className="glass-card grid gap-6 p-8 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="grid size-16 place-items-center border-4 border-black bg-[#d9825b] text-black">
            <ShieldCheck className="size-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Ready to close the loop?</h2>
            <p className="mt-2 text-slate-700">
              Post a real listing, verify a charity, then test the unique-code pickup flow.
            </p>
          </div>
          <Link
            href="/post"
            className="retro-button text-center"
          >
            Donate food
          </Link>
        </div>
      </section>
    </main>
  );
}
