import { LucideIcon } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export function MetricCard({
  icon: Icon,
  label,
  value,
  suffix = "",
  tone = "green"
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  tone?: "green" | "orange" | "slate";
}) {
  const colors = {
    green: "bg-[#b7e4c7] text-black",
    orange: "bg-[#d9825b] text-black",
    slate: "bg-white text-black"
  };

  return (
    <div className="glass-card p-6">
      <div className={`mb-5 grid size-12 place-items-center border-4 border-black ${colors[tone]}`}>
        <Icon className="size-6" />
      </div>
      <div className="text-3xl font-black tracking-tight">
        {formatNumber(value)}
        {suffix}
      </div>
      <p className="mt-2 text-sm font-black text-slate-800 dark:text-slate-100">{label}</p>
    </div>
  );
}
