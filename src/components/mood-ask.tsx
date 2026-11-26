"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { useCompanionName } from "./companion-name";
import { cheer } from "./cheer";
import { addTodos } from "@/lib/todos";
import { dayKey, pickOfDay } from "@/lib/util";
import { speakAsCompanion, speechSupported } from "@/lib/voice";

const FACES = [
  { v: 5, e: "💖", l: "Slaying" },
  { v: 4, e: "🌸", l: "Cute & good" },
  { v: 3, e: "☁️", l: "Meh" },
  { v: 2, e: "🥺", l: "Low-key sad" },
  { v: 1, e: "💔", l: "Rough day" },
];

const HYPE = [
  "Okay girl, go you! You're literally a star ✨ Let's keep this feeling all day.",
  "Yesss queen! Look at you thriving. We're protecting this energy at all costs 💅",
  "Obsessed with this for you. Main character day, pretty girl. Let's keep it going 💖",
];
const OKAY = ["Meh days are valid, babe. What would make today a little cuter?", "Mid day? Let's give it a little glow-up, bestie 🌷"];
const LOW = ["Aw babe, come here 🤍 What would help you feel even one percent better?", "Thank you for being real with me, love. Soft and gentle today. What do you need?"];

/** The companion's first question on Today: how are you feeling? Then it responds to the answer. */
export function MoodAsk({ name }: { name: string }) {
  const { vault, update } = useStore();
  const cn = useCompanionName();
  const today = dayKey();
  const mood = vault.quickMood?.[today];

  const choose = (v: number) => {
    update((x) => ({ ...x, quickMood: { ...(x.quickMood ?? {}), [today]: v } }));
    const line = (v >= 4 ? pickOfDay(HYPE, 51) : v === 3 ? pickOfDay(OKAY, 51) : pickOfDay(LOW, 51)) ?? "";
    try {
      if (localStorage.getItem("veev.companionTalks") === "1" && speechSupported()) speakAsCompanion(line, vault.companion);
    } catch {}
  };

  const addCozy = (t: string) => {
    update((x) => addTodos(x, [t]));
    cheer("newThing");
  };

  const line = mood === undefined ? `Hiii ${name} 💕 How are we feeling today, pretty girl?` : (mood >= 4 ? pickOfDay(HYPE, 51) : mood === 3 ? pickOfDay(OKAY, 51) : pickOfDay(LOW, 51)) ?? "";

  return (
    <div className="card glow p-5">
      <div className="flex items-start gap-3">
        <span
          key={mood ?? "ask"}
          className={mood === undefined ? "float-slow mt-0.5 h-11 w-11 shrink-0 rounded-full" : "orb-pop mt-0.5 h-11 w-11 shrink-0 rounded-full"}
          style={{ background: "radial-gradient(circle at 35% 30%, #fff 0%, #f7f3e9 18%, #eac8ae 42%, #a9c5b4 72%, #2b5443 100%)" }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="eyebrow">{cn}</div>
          <p key={line} className="bubble-in mt-1 rounded-2xl rounded-tl-md bg-surface-2 px-3.5 py-2.5 font-serif text-[19px] leading-snug" aria-live="polite">
            {line}
          </p>
        </div>
      </div>

      <div className="mt-4 flex justify-between gap-1">
        {FACES.map((f) => (
          <button
            key={f.v}
            onClick={() => choose(f.v)}
            aria-label={f.l}
            className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 transition active:scale-90 ${mood === f.v ? "bg-gold-soft" : ""}`}
          >
            <span className="text-[26px] leading-none">{f.e}</span>
            <span className="text-[11px] text-ink-3">{f.l}</span>
          </button>
        ))}
      </div>

      {mood !== undefined && mood >= 4 && (
        <div className="fade-in mt-3 flex flex-wrap gap-2 text-sm">
          <Link href="/future/sober-life" className="rounded-full bg-surface-2 px-3 py-1.5">✨ Plan something fun</Link>
          <Link href="/future/memories" className="rounded-full bg-surface-2 px-3 py-1.5">📸 Save this feeling</Link>
          <Link href="/edit" className="rounded-full bg-surface-2 px-3 py-1.5">👗 The Edit</Link>
        </div>
      )}
      {mood === 3 && (
        <div className="fade-in mt-3 flex flex-wrap gap-2 text-sm">
          <button onClick={() => addCozy("Go for a walk outside")} className="rounded-full bg-surface-2 px-3 py-1.5">🚶‍♀️ Fresh air</button>
          <button onClick={() => addCozy("Workout")} className="rounded-full bg-surface-2 px-3 py-1.5">💪 Move my body</button>
          <Link href="/future/vibes" className="rounded-full bg-surface-2 px-3 py-1.5">🎧 A good playlist</Link>
          <Link href="/voice" className="rounded-full bg-surface-2 px-3 py-1.5">💬 Talk it out</Link>
        </div>
      )}
      {mood !== undefined && mood <= 2 && (
        <div className="fade-in mt-3 flex flex-wrap gap-2 text-sm">
          <Link href="/voice" className="rounded-full bg-forest px-3 py-1.5 text-on-forest">💬 Talk to {cn}</Link>
          <Link href="/regulate" className="rounded-full bg-surface-2 px-3 py-1.5">🌬️ Calm my body</Link>
          <button onClick={() => addCozy("Something cozy: blanket, tea and cuddles with Cookies & Codie")} className="rounded-full bg-surface-2 px-3 py-1.5">🧸 Something cozy</button>
          <Link href="/me/support" className="rounded-full bg-surface-2 px-3 py-1.5">📞 Reach my people</Link>
          <Link href="/future/letters" className="rounded-full bg-surface-2 px-3 py-1.5">💌 Read my letters</Link>
        </div>
      )}
    </div>
  );
}
