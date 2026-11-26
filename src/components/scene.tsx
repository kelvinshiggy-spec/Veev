"use client";

import { partOfDay } from "@/lib/util";
import { useEffect, useState } from "react";

/** Quiet alpine landscape, tinted by time of day. Pure SVG: no network, works offline. */
export function Scene({ className = "", tone }: { className?: string; tone?: "calm" }) {
  const [pod, setPod] = useState<ReturnType<typeof partOfDay>>("morning");
  useEffect(() => setPod(partOfDay()), []);
  const skies = {
    morning: ["#f4e6cf", "#e9d3b0", "#d9c7a8"],
    afternoon: ["#e8eef0", "#dfe7e6", "#cfd9d3"],
    evening: ["#e7c9a8", "#c99a7a", "#7d6a63"],
    night: ["#2b3a3a", "#1d2826", "#141a19"],
  } as const;
  const s = tone === "calm" ? (["#e6ece6", "#d6e0d8", "#c3d0c6"] as const) : skies[pod];
  const dark = pod === "night" && tone !== "calm";
  const m1 = dark ? "#2e3f39" : "#9fb2a5";
  const m2 = dark ? "#22312c" : "#5f7d6d";
  const m3 = dark ? "#16211d" : "#1f3a2e";
  return (
    <svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={s[0]} />
          <stop offset="0.6" stopColor={s[1]} />
          <stop offset="1" stopColor={s[2]} />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#sky)" />
      <circle cx={pod === "evening" ? 300 : 290} cy={pod === "morning" ? 70 : pod === "evening" ? 112 : 58} r="22" fill={dark ? "#e8e1cf" : "#fbf3e2"} opacity={dark ? 0.8 : 0.9} />
      <path d="M0 150 L60 105 L95 128 L150 78 L205 125 L250 98 L310 140 L360 110 L400 132 L400 220 L0 220Z" fill={m1} opacity="0.8" />
      <path d="M150 78 L165 92 L158 92 L170 104 L150 96 L135 98Z" fill="#fff" opacity={dark ? 0.15 : 0.55} />
      <path d="M0 172 L45 140 L90 160 L140 122 L190 165 L240 135 L300 170 L350 145 L400 165 L400 220 L0 220Z" fill={m2} />
      <path d="M0 200 L70 178 L130 195 L200 172 L270 198 L330 182 L400 196 L400 220 L0 220Z" fill={m3} />
    </svg>
  );
}
