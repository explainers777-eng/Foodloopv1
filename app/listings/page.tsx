import { LiveMyListings } from "@/components/live-my-listings";

export default function MyListingsPage() {
  return (
    <main className="section-shell page-enter py-10">
      <div className="animate-in mb-8 max-w-3xl">
        <p className="mb-3 font-bold uppercase tracking-[0.2em] text-forest-600">Operations</p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">My listings</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Track active donations, claimed food, completed pickups, and donor achievements in one
          place.
        </p>
      </div>

      <div className="animate-in delay-100">
        <LiveMyListings />
      </div>
    </main>
  );
}
