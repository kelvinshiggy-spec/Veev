"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Single-series charts: one hue each, thin marks, recessive axes, hover tooltips.
// The card title names the series, so no legend is needed.

const axis = { stroke: "var(--ink-3)", fontSize: 11, tickLine: false, axisLine: false } as const;

function Tip({ active, payload, label, unit, fmt }: { active?: boolean; payload?: { value: number }[]; label?: string; unit: string; fmt?: (v: number) => string }) {
  if (!active || !payload?.length || payload[0].value == null) return null;
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow">
      <div className="text-ink-3">{label}</div>
      <div className="font-medium text-ink">{fmt ? fmt(payload[0].value) : `${payload[0].value} ${unit}`}</div>
    </div>
  );
}

const MOOD = ["", "Heavy", "Low", "Okay", "Good", "Wonderful"];

export function MoodChart({ data }: { data: { label: string; mood: number | null }[] }) {
  return (
    <ResponsiveContainer width="100%" height={170}>
      <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -28 }}>
        <defs>
          <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--forest)" stopOpacity={0.22} />
            <stop offset="1" stopColor="var(--forest)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="2 4" />
        <XAxis dataKey="label" {...axis} interval="preserveStartEnd" minTickGap={24} />
        <YAxis domain={[1, 5]} ticks={[1, 3, 5]} {...axis} />
        <Tooltip content={<Tip unit="" fmt={(v) => MOOD[v] ?? String(v)} />} cursor={{ stroke: "var(--ink-3)", strokeWidth: 1 }} />
        <Area type="monotone" dataKey="mood" stroke="var(--forest)" strokeWidth={2} fill="url(#moodFill)" connectNulls dot={false} activeDot={{ r: 4, stroke: "var(--surface)", strokeWidth: 2 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CravingChart({ data }: { data: { label: string; craving: number | null }[] }) {
  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -28 }} barCategoryGap={2}>
        <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="2 4" />
        <XAxis dataKey="label" {...axis} interval="preserveStartEnd" minTickGap={24} />
        <YAxis domain={[0, 10]} ticks={[0, 5, 10]} {...axis} />
        <Tooltip content={<Tip unit="/ 10" />} cursor={{ fill: "var(--surface-2)" }} />
        <Bar dataKey="craving" fill="var(--gold)" radius={[4, 4, 0, 0]} maxBarSize={12} />
      </BarChart>
    </ResponsiveContainer>
  );
}
