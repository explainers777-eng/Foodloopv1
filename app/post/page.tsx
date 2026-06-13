import { FoodPostForm } from "@/components/food-post-form";

export default function PostFoodPage() {
  return (
    <main className="section-shell page-enter py-10">
      <div className="animate-in mb-8 max-w-3xl">
        <p className="mb-3 font-bold uppercase tracking-[0.2em] text-forest-600">Donate surplus</p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Post available food</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Add details once. FoodLoop suggests category, serving estimates, freshness, and pickup
          urgency so recipients can act quickly.
        </p>
      </div>
      <div className="animate-in delay-100">
        <FoodPostForm />
      </div>
    </main>
  );
}
