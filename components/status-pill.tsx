import { ListingStatus, FreshnessLevel } from "@/types/foodloop";
import { cn } from "@/lib/utils";

const statusStyles: Record<ListingStatus, string> = {
  Available: "bg-[#b7e4c7] text-black",
  Reserved: "bg-[#f2d38b] text-black",
  "Picked Up": "bg-[#2f6f5e] text-white",
  Expired: "bg-[#d9825b] text-black"
};

const freshnessStyles: Record<string, string> = {
  Fresh: "bg-[#b7e4c7] text-black",
  "Use Soon": "bg-[#f2d38b] text-black",
  Urgent: "bg-[#d9825b] text-black", // Assuming Urgent is still a valid status
  Spoilt: "bg-red-600 text-white border-black ring-2 ring-red-500", // High-contrast style for safety
};

export function StatusPill({
  children,
  type,
  className
}: {
  children: ListingStatus | FreshnessLevel;
  type: "status" | "freshness";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex border-4 border-black px-3 py-1 text-xs font-black transition duration-200 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000]",
        type === "status"
          ? statusStyles[children as ListingStatus] || "bg-slate-200"
          : freshnessStyles[children as string] || "bg-slate-200",
        className
      )}
    >
      {children}
    </span>
  );
}
