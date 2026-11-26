"use client";

import { persona } from "@/data/personas";
import { seasonalContext } from "./seasons";
import { describe } from "./weather";

import { useEffect, useState } from "react";
import type { Vault } from "./types";
import { accessToken } from "./supabase";
import { sobrietyStats } from "./sobriety";
import { dayKey } from "./util";

export interface AiStatus {
  ai: boolean;
  supabase: boolean;
  accessCode: boolean;
  offline: boolean;
  loaded: boolean;
}

let cached: AiStatus | null = null;

export function useAiStatus(): AiStatus {
  const [s, setS] = useState<AiStatus>(cached ?? { ai: false, supabase: false, accessCode: false, offline: false, loaded: false });
  useEffect(() => {
    if (cached) return;
    fetch("/api/status", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        cached = { ...j, offline: false, loaded: true };
        setS(cached!);
      })
      .catch(() => setS({ ai: false, supabase: false, accessCode: false, offline: true, loaded: true }));
  }, []);
  return s;
}

const ACCESS_KEY = "elevate.accessCode";
export const getAccessCode = () => {
  try {
    return localStorage.getItem(ACCESS_KEY) ?? "";
  } catch {
    return "";
  }
};
export const setAccessCode = (c: string) => {
  try {
    localStorage.setItem(ACCESS_KEY, c);
  } catch {}
};

async function headers() {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const t = await accessToken();
  if (t) h.Authorization = `Bearer ${t}`;
  const code = getAccessCode();
  if (code) h["x-veev-access"] = code;
  return h;
}

/** Personal context Clarity may use, limited to what Veev allowed in Me → Clarity's memory */
export function buildContext(v: Vault): string {
  const allow = v.settings.aiMemory;
  const p = v.profile;
  const lines: string[] = [];
  const add = (k: string, label: string, val: string | string[] | undefined) => {
    if (!allow[k]) return;
    const s = Array.isArray(val) ? val.join(", ") : val;
    if (s && s.trim()) lines.push(`${label}: ${s.trim()}`);
  };
  add("name", "Name", p.name);
  add("becoming", "Who she wants to become", p.becoming);
  add("goals", "Goals", p.goals);
  add("whySober", "Why she wants to stay sober", p.whySober);
  add("hobbies", "Loves", p.hobbies);
  add("afterFirstDrink", "What usually happens after her first drink (her words)", p.afterFirstDrink);
  add("appealingSituations", "When drinking sounds appealing", p.appealingSituations);
  add("warningSigns", "Early warning signs", p.warningSigns);
  add("copingTools", "Skills from therapy", p.copingTools);
  add("grounding", "What grounds her", p.grounding);
  add("communicationStyle", "How she likes to be spoken to", p.communicationStyle);
  if (allow.streak) {
    const s = sobrietyStats(v);
    lines.push(`Sober days in current stretch: ${s.current} (total ${s.total})`);
  }
  if (allow.recentMood) {
    const c = v.checkIns.filter((x) => x.date === dayKey()).pop();
    if (c) lines.push(`Today's check-in: mood ${c.mood}/5, craving ${c.craving}/10, feeling ${c.emotions.join(", ") || "unspecified"}`);
  }
  if (allow.faith && v.settings.faith) lines.push("Faith matters to her (Christian).");
  add("qualities", "Qualities she is growing into", p.qualities);
  add("values", "Her values", p.values);
  add("lifeHopes", "Family hopes", p.familyHopes);
  add("lifeHopes", "Financial ambitions", p.moneyHopes);
  add("lifeHopes", "Fitness goals", p.fitnessGoals);
  add("soberJoys", "What she loves about sober life (her words)", p.soberJoys);
  add("family", "Her parents and family (her words)", p.family);
  add("tastes", "Movies and shows she loves", p.favMovies);
  add("tastes", "Music she loves", p.favMusic);
  add("myWorld", "Her world (pets, people and things she'd love to be asked about)", p.myWorld);
  add("becoming", "Her ideal life", p.idealLife);
  if (allow.manifesto && v.manifesto.approved && v.manifesto.text) lines.push(`Her Life Manifesto (approved by her):\n${v.manifesto.text.slice(0, 1500)}`);
  // Date, season, holidays and (if she turned it on) local weather, so the companion stays current.
  let weather: string | undefined;
  try {
    const w = v.settings.weather ? JSON.parse(localStorage.getItem("elevate.weather") || "null") : null;
    if (w && Date.now() - w.at < 3 * 3600_000) weather = `${Math.round(w.temp)}°${w.unit.toUpperCase()}, ${describe(w.code).label.toLowerCase()}`;
  } catch {}
  lines.push(seasonalContext(dayKey(), weather));
  return lines.join("\n");
}

/** The companion's name and personality, sent with each conversation. */
export function companionPayload(v: Vault) {
  const c = v.companion;
  const p = persona(c.persona);
  return { name: c.name || p.name, style: p.style, warmth: c.warmth, enthusiasm: c.enthusiasm, affectionate: c.affectionate };
}

export type AiError = { kind: "not_configured" | "offline" | "auth" | "busy" | "error"; message: string };

function classify(status: number, msg: string): AiError {
  if (msg === "not_configured" || status === 503) return { kind: "not_configured", message: msg === "not_configured" ? "Clarity's AI isn't connected on this deployment yet." : msg };
  if (status === 401 || status === 403) return { kind: "auth", message: msg };
  if (status === 429) return { kind: "busy", message: msg };
  return { kind: "error", message: msg || "Clarity couldn't respond just now." };
}

export async function streamClarity(body: Record<string, unknown>, onDelta: (full: string) => void, signal?: AbortSignal): Promise<{ text: string; error?: AiError }> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return { text: "", error: { kind: "offline", message: "You're offline. Clarity needs a connection, but your tools and safety resources still work." } };
  let res: Response;
  try {
    res = await fetch("/api/clarity", { method: "POST", headers: await headers(), body: JSON.stringify(body), signal });
  } catch {
    return { text: "", error: { kind: "offline", message: "Couldn't reach Clarity. Check your connection." } };
  }
  if (!res.ok || !res.body) {
    const j = await res.json().catch(() => ({ error: "" }));
    return { text: "", error: classify(res.status, j.error) };
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let text = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    text += dec.decode(value, { stream: true });
    onDelta(text);
  }
  return { text };
}

export async function callClarityJson<T>(body: Record<string, unknown>): Promise<{ data?: T; error?: AiError }> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return { error: { kind: "offline", message: "You're offline." } };
  try {
    const res = await fetch("/api/clarity", { method: "POST", headers: await headers(), body: JSON.stringify(body) });
    const j = await res.json();
    if (!res.ok) return { error: classify(res.status, j.error) };
    return { data: j as T };
  } catch {
    return { error: { kind: "offline", message: "Couldn't reach Clarity." } };
  }
}
