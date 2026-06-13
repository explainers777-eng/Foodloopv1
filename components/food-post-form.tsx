"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Ban, Camera, CheckCircle2, Loader2, ScanLine, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";
import { estimateFreshness, estimateServings, pickupUrgencyLabel, suggestFoodCategory } from "@/lib/smart-food";
import { DonorType, FoodCategory, FoodListing } from "@/types/foodloop";
import { StatusPill } from "@/components/status-pill";
import { addStoredListing } from "@/lib/local-food";
import { hasSupabaseEnv } from "@/lib/supabase";
import { insertListingToSupabase } from "@/lib/supabase-food";

const categories: FoodCategory[] = ["Meals", "Bakery", "Produce", "Groceries", "Beverages", "Desserts"];
const donorTypes: DonorType[] = ["Restaurant", "Home", "Bakery", "Cafe", "Supermarket", "Hotel"];
const fallbackImage =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80";
const defaultDescription = "Upload a food photo to generate a safe donation description.";

type FoodAnalysis = {
  status: "fresh" | "spoilt";
  foodName: string;
  quantity: string;
  category: FoodCategory;
  estimatedPreparedHours: number;
  freshnessNotes: string[];
  confidence: number;
  description: string;
};

export function FoodPostForm() {
  const [foodName, setFoodName] = useState("Paneer rice bowls");
  const [quantity, setQuantity] = useState("24 servings");
  const [category, setCategory] = useState<FoodCategory>("Meals");
  const [description, setDescription] = useState(defaultDescription);
  const [hoursSincePrepared, setHoursSincePrepared] = useState(2);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<FoodAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "error" | "warning">("success");

  const smart = useMemo(() => {
    const suggestedCategory = category || suggestFoodCategory(foodName);
    const servings = estimateServings(quantity);
    const freshness = estimateFreshness(foodName || suggestedCategory, hoursSincePrepared);
    return { category: suggestedCategory, servings, freshness, urgency: pickupUrgencyLabel(freshness) };
  }, [category, foodName, hoursSincePrepared, quantity]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setAiAnalysis(null);
    setIsAnalyzing(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/analyze-food", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        // Attempt to read error message from response body, or default to status text
        const errorBody = await res.text();
        let parsedError = errorBody;
        try { parsedError = JSON.parse(errorBody).error; } catch(e) {}
        throw new Error(parsedError || res.statusText);
      }

      const data = await res.json();
      
      if (data.error) throw new Error(data.error);

      if (data.status !== "fresh" && data.status !== "spoilt") {
        throw new Error("AI returned an unexpected food condition.");
      }
      
      setAiAnalysis(data);
      if (data.foodName) setFoodName(data.foodName);
      if (data.quantity) setQuantity(data.quantity);
      if (categories.includes(data.category)) setCategory(data.category);
      if (Number.isFinite(Number(data.estimatedPreparedHours))) {
        setHoursSincePrepared(Math.min(24, Math.max(0, Number(data.estimatedPreparedHours))));
      }
      setDescription(data.description);
      if (data.status === "spoilt") {
        setMessageTone("error");
        setMessage("AI Analysis: This food appears to be spoilt and cannot be posted.");
      } else {
        setMessageTone("success");
        setMessage("AI Analysis complete. Description generated and food is ready to post.");
      }
    } catch (err) {
      setMessageTone("error");
      setMessage(`AI Analysis failed: ${err instanceof Error ? err.message : "Check your connection and API key."}`);
      setFile(null);
      setPreview(null);
      setAiAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canPublish = Boolean(file && aiAnalysis?.status === "fresh" && !isAnalyzing);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <form
        className="glass-card grid gap-5 rounded-[2rem] p-6"
        onSubmit={async (event) => {
          event.preventDefault();

          if (!file || !aiAnalysis) {
            setMessageTone("warning");
            setMessage("Please upload a food photo so AI can check the food condition first.");
            return;
          }

          if (aiAnalysis.status === "spoilt") {
            setMessageTone("error");
            setMessage("This listing cannot be published because the uploaded food photo was marked spoilt or unsafe.");
            return;
          }

          const form = new FormData(event.currentTarget);
          const donorType = String(form.get("donorType") ?? "Restaurant") as DonorType;
          const category = String(form.get("category") ?? smart.category) as FoodCategory;
          const listing: FoodListing = {
            id: crypto.randomUUID(),
            name: foodName,
            description: description.trim() || aiAnalysis.description,
            image: preview || fallbackImage,
            quantity,
            servings: smart.servings,
            location: String(form.get("location") ?? ""),
            distance: 1,
            pickupWindow: String(form.get("pickupWindow") ?? "Today"),
            deadline: "Open",
            category,
            donorType,
            donorName: String(form.get("donorName") ?? ""),
            donorContact: String(form.get("contact") ?? ""),
            status: "Available",
            freshness: smart.freshness,
            co2Kg: Math.round(smart.servings * 1.7),
            matchedScore: Math.max(72, 100 - hoursSincePrepared * 3)
          };

          const result = await insertListingToSupabase(listing);

          if (result.saved || !hasSupabaseEnv()) {
            addStoredListing(listing);
          }

          if (result.saved) {
            setMessageTone("success");
            setMessage("Listing saved to Supabase and published.");
            return;
          }

          setMessageTone("error");
          setMessage(result.reason ?? "Unable to save listing to Supabase.");
        }}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Food name">
            <div className="relative">
              <input value={foodName} onChange={(event) => setFoodName(event.target.value)} className="input pr-12" />
              {aiAnalysis && (
                <WandSparkles className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-citrus-500" />
              )}
            </div>
          </Field>
          <Field label="Quantity / servings">
            <div className="relative">
              <input value={quantity} onChange={(event) => setQuantity(event.target.value)} className="input pr-12" />
              {aiAnalysis && (
                <Sparkles className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-forest-600" />
              )}
            </div>
          </Field>
        </div>
        <Field label="Description">
          <textarea
            name="description"
            className="input min-h-28 resize-none"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Food category">
            <select
              name="category"
              className="input"
              value={category}
              onChange={(event) => setCategory(event.target.value as FoodCategory)}
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </Field>
          <Field label="Donor type">
            <select name="donorType" className="input" defaultValue="Restaurant">
              {donorTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </Field>
          <Field label="Restaurant / donor name">
            <input name="donorName" className="input" defaultValue="Green Bowl Bistro" />
          </Field>
          <Field label="Pickup location">
            <input name="location" className="input" defaultValue="Indiranagar, Bengaluru" />
          </Field>
          <Field label="Pickup deadline">
            <input name="pickupWindow" className="input" type="datetime-local" />
          </Field>
          <Field label="Contact details">
            <input name="contact" className="input" defaultValue="+91 98765 43210" />
          </Field>
        </div>
        <Field label="Preparation age">
          <input
            className="w-full accent-forest-600"
            min={0}
            max={24}
            type="range"
            value={hoursSincePrepared}
            onChange={(event) => setHoursSincePrepared(Number(event.target.value))}
          />
          <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Prepared about {hoursSincePrepared} hours ago
          </div>
        </Field>

        <label className="group relative grid cursor-pointer place-items-center overflow-hidden rounded-[2rem] border-2 border-dashed border-forest-200 bg-forest-50/60 p-8 text-center transition hover:border-forest-500 dark:border-white/10 dark:bg-white/5">
          {isAnalyzing && (
            <div className="pointer-events-none absolute inset-0 z-10 bg-white/65 backdrop-blur-[2px] dark:bg-slate-950/65">
              <div className="ai-scan-line" />
              <div className="absolute inset-x-6 top-6 flex items-center justify-center gap-2 border-4 border-black bg-[#ffe89a] px-4 py-2 text-xs font-black text-black shadow-[5px_5px_0_#000]">
                <Loader2 className="size-4 animate-spin" />
                Gemini is inspecting freshness
              </div>
            </div>
          )}
          {preview ? (
            <div className="relative mb-3 w-full overflow-hidden rounded-lg border-4 border-black bg-white">
              <Image
                src={preview}
                alt="Preview"
                width={640}
                height={256}
                unoptimized
                className="h-44 w-full object-contain"
              />
              {isAnalyzing && <ScanLine className="absolute bottom-3 right-3 size-7 animate-pulse text-forest-600" />}
            </div>
          ) : (
            <div className="mb-3 grid size-16 place-items-center rounded-full border-4 border-black bg-[#ffe89a] shadow-[5px_5px_0_#000] transition group-hover:-translate-y-1">
              <Camera className="size-8 text-forest-600" />
            </div>
          )}
          <span className="font-bold">{isAnalyzing ? "Analyzing photo and auto-filling details..." : "Upload food photo (Required)"}</span>
          <span className="mt-2 text-xs font-bold text-slate-500">
            Gemini fills name, quantity, category, description, and safety notes.
          </span>
          <input 
            type="file" 
            accept="image/png, image/jpeg, image/jpg, image/webp" 
            className="sr-only" 
            onChange={handleFileChange}
            disabled={isAnalyzing}
          />
        </label>

        <button 
          className="retro-button gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed" 
          disabled={!canPublish}
        >
          {isAnalyzing ? <Loader2 className="size-5 animate-spin" /> : <ShieldCheck className="size-5" />}
          Publish listing
        </button>
        
        {message && (
          <div className={`border-4 border-black p-4 text-sm font-black text-black ${messageTone === "error" ? "bg-red-200" : messageTone === "warning" ? "bg-[#f2d38b]" : "bg-[#b7e4c7]"}`}>
            <CheckCircle2 className="mr-2 inline size-4" /> {message}
          </div>
        )}
      </form>

      <aside className="grid h-fit gap-5">
        <div className="glass-card rounded-[2rem] p-6">
          <div className="mb-4 flex items-center gap-2 font-bold">
            <Sparkles className="size-5 text-citrus-500" /> AI Food Recognition
          </div>
          {isAnalyzing ? (
            <div className="grid gap-3">
              <AnalysisSkeleton label="Identifying food" />
              <AnalysisSkeleton label="Checking spoilage" />
              <AnalysisSkeleton label="Writing listing" />
            </div>
          ) : aiAnalysis ? (
            <div className="space-y-4">
              <div className={`inline-flex items-center gap-2 border-4 border-black px-3 py-1 text-xs font-black text-black ${aiAnalysis.status === "fresh" ? "bg-[#b7e4c7]" : "bg-red-200"}`}>
                {aiAnalysis.status === "fresh" ? <ShieldCheck className="size-4" /> : <Ban className="size-4" />}
                {aiAnalysis.status === "fresh" ? "Safe-looking food" : "Blocked as unsafe"}
              </div>
              <SmartRow label="Detected" value={aiAnalysis.foodName} />
              <SmartRow label="Quantity" value={aiAnalysis.quantity} />
              <SmartRow label="Confidence" value={`${Math.round(aiAnalysis.confidence)}%`} />
              <div>
                <p className="mb-2 text-xs font-bold uppercase text-slate-400">Freshness Notes</p>
                <div className="grid gap-2">
                  {aiAnalysis.freshnessNotes.map((note) => (
                    <div key={note} className="border-4 border-black bg-white p-3 text-xs font-bold text-slate-700">
                      {note}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs font-bold uppercase text-slate-400">Charity Description</p>
              <p className="text-sm italic text-slate-700">{aiAnalysis.description}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Upload a photo to see AI description.</p>
          )}
        </div>
        <div className="glass-card rounded-[2rem] p-6">
          <div className="mb-4 font-bold">Freshness Assistant</div>
          <StatusPill type="freshness">{smart.freshness}</StatusPill>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{smart.urgency}</p>
        </div>
      </aside>
    </div>
  );
}

function AnalysisSkeleton({ label }: { label: string }) {
  return (
    <div className="overflow-hidden border-4 border-black bg-white p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-black text-slate-600">
        <Loader2 className="size-4 animate-spin text-forest-600" />
        {label}
      </div>
      <div className="ai-shimmer h-3 w-full bg-slate-200" />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">{label}</span>
      {children}
    </label>
  );
}

function SmartRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 p-3 dark:bg-white/5">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
