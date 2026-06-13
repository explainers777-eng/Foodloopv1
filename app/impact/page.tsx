import { Leaf, PackageCheck, Recycle, Truck, Users } from "lucide-react";
import { ImpactCharts } from "@/components/impact-charts";
import { MetricCard } from "@/components/metric-card";
import { impactTotals } from "@/lib/data";

export default function ImpactPage() {
  return (
    <main className="section-shell page-enter py-10">
      <div className="animate-in mb-8 max-w-3xl">
        <p className="mb-3 font-bold uppercase tracking-[0.2em] text-forest-600">Impact dashboard</p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Measure every rescue</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          FoodLoop turns every pickup into measurable social and environmental outcomes.
        </p>
      </div>

      <section className="stagger-list mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={Users} label="Total meals saved" value={impactTotals.meals} />
        <MetricCard icon={Recycle} label="Total food rescued" value={impactTotals.foodKg} suffix=" kg" tone="orange" />
        <MetricCard icon={Leaf} label="Estimated CO₂ reduction" value={impactTotals.co2Kg} suffix=" kg" />
        <MetricCard icon={PackageCheck} label="Verified pickups" value={impactTotals.pickups} tone="slate" />
      </section>

      <div className="animate-in delay-200">
        <ImpactCharts />
      </div>

      <section className="stagger-list mt-8 grid gap-5 md:grid-cols-3">
        {[
          ["Pickup reliability", "97.4%", "On-time donor and recipient handoffs"],
          ["Average claim time", "18 min", "Median time from listing to reservation"],
          ["Volunteer coverage", "82%", "Listings within active rescue radius"]
        ].map(([label, value, copy]) => (
          <div key={label} className="group glass-card motion-card rounded-[2rem] p-6">
            <Truck className="motion-icon mb-4 size-7 text-citrus-500" />
            <div className="text-3xl font-black">{value}</div>
            <h3 className="mt-2 font-bold">{label}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{copy}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
