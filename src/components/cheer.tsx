"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useCompanionName } from "./companion-name";
import { speakAsCompanion, speechSupported } from "@/lib/voice";

/** Little reactions from her companion when she does something. Local lines only, no AI. */
const LINES = {
  habit: ["Yesss, consistency queen.", "Look at you showing up.", "That's the girl I know.", "Tiny habits, big glow-up."],
  intention: ["Ooh, I like that intention.", "Okay, we have a vibe for today.", "Love that for you."],
  checkinGood: ["Love that you're feeling good. Let's keep it going.", "Okay good mood! Protect that energy.", "Thriving. Noted."],
  checkinLow: ["Thanks for being honest with me. I'm right here.", "Hard day noted. We go gentle today, okay?", "I've got you. One small thing at a time."],
  checkinCraving: ["Cravings are loud today, huh. Want to talk it out? Tap 'I want a drink' anytime.", "Thanks for telling me. We're not doing that today. Let's find something better."],
  journal: ["Saved. Proud of you for getting that out.", "Writing it down? So healthy of you.", "Got it, safe and private."],
  rodeOut: ["You rode it out! Honestly iconic.", "Craving: 0. You: 1.", "That's real strength, bestie."],
  manifesto: ["Okay this manifesto is everything.", "Signed, sealed, main character."],
  goal: ["One step closer, queen!", "Look at you making it happen.", "Progress looks so good on you.", "Okay goal-getter!", "Checked! The vision is visioning."],
  bye: ["Loved that chat. Go text someone you love too. Talk soon, bestie.", "Proud of you for talking it out. I'm here whenever you want me.", "That was good. Go be iconic. Come back anytime."],
  newThing: ["Trying new things? That's so you.", "Okay adventurous queen!", "New era unlocked."],
  routine: ["Added to your routine. Future you says thanks.", "Daily ritual unlocked. We love consistency."],
} as const;

export type CheerKind = keyof typeof LINES;

export function cheer(kind: CheerKind) {
  if (typeof window === "undefined") return;
  const pool = LINES[kind];
  window.dispatchEvent(new CustomEvent("veev:cheer", { detail: pool[Math.floor(Math.random() * pool.length)] }));
}

export function CheerBubble() {
  const { vault } = useStore();
  const cn = useCompanionName();
  const [msg, setMsg] = useState<{ text: string; n: number } | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      const text = (e as CustomEvent<string>).detail;
      setMsg({ text, n: Date.now() });
      clearTimeout(timer);
      timer = setTimeout(() => setMsg(null), 3200);
      try {
        if (localStorage.getItem("veev.companionTalks") === "1" && speechSupported()) speakAsCompanion(text, vault.companion);
      } catch {}
    };
    window.addEventListener("veev:cheer", on);
    return () => {
      window.removeEventListener("veev:cheer", on);
      clearTimeout(timer);
    };
  }, [vault.companion]);

  if (!msg) return null;
  return (
    <button
      key={msg.n}
      onClick={() => setMsg(null)}
      className="bubble-in fixed inset-x-4 bottom-24 z-40 mx-auto flex max-w-md items-center gap-3 rounded-3xl border border-line bg-surface p-3 pr-4 text-left shadow-[var(--shadow)]"
      aria-live="polite"
    >
      <span
        className="orb-pop h-9 w-9 shrink-0 rounded-full"
        style={{ background: "radial-gradient(circle at 35% 30%, #fff 0%, #f7f3e9 18%, #eac8ae 42%, #a9c5b4 72%, #2b5443 100%)" }}
        aria-hidden
      />
      <span>
        <span className="block text-[11px] uppercase tracking-wider text-ink-3">{cn}</span>
        <span className="block text-[15px] leading-snug text-ink">{msg.text}</span>
      </span>
    </button>
  );
}
