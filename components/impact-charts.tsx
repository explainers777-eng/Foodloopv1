"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { categoryImpact, monthlyImpact } from "@/lib/data";

const colors = ["#25a55b", "#ffb23f", "#188247", "#db6815"];

export function ImpactCharts() {
  return (
    <section className="grid gap-5 lg:grid-cols-[1.4fr_.8fr]">
      <div className="glass-card rounded-[2rem] p-5">
        <h2 className="mb-5 text-xl font-black">Meals rescued over time</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyImpact}>
              <defs>
                <linearGradient id="meals" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#25a55b" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#25a55b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.25)" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Area type="monotone" dataKey="meals" stroke="#25a55b" fill="url(#meals)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] p-5">
        <h2 className="mb-5 text-xl font-black">Rescue mix</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryImpact} dataKey="value" nameKey="name" innerRadius={68} outerRadius={105} paddingAngle={4}>
                {categoryImpact.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] p-5 lg:col-span-2">
        <h2 className="mb-5 text-xl font-black">CO₂ prevented by month</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyImpact}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.25)" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="co2" radius={[14, 14, 0, 0]} fill="#ffb23f" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
