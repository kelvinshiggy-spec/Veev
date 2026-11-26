"use client";

import { useState } from "react";
import Link from "next/link";
import { HeartCrack, MessageSquareWarning, ShoppingBag, Car, Shuffle, Plus, Check, Repeat, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { useCompanionName } from "./companion-name";
import { cheer } from "./cheer";
import { NEW_THINGS } from "@/data/new-things";
import { addTodos } from "@/lib/todos";
import { makeHabit } from "@/lib/defaults";
import { cx, dayKey, daysBetween } from "@/lib/util";

export type Moment = "abandoned" | "argument" | "spending" | "driving";

const MOMENTS: { id: Moment; label: string; icon: typeof Car }[] = [
  { id: "abandoned", label: "I feel abandoned", icon: HeartCrack },
  { id: "argument", label: "About to say something", icon: MessageSquareWarning },
  { id: "spending", label: "Want to buy something", icon: ShoppingBag },
  { id: "driving", label: "Upset & want to drive", icon: Car },
];

/** Which quick pause fits the feelings she checked in with. */
export function momentFor(emotions: string[] = []): Moment | undefined {
  if (emotions.some((e) => ["Abandoned", "Rejected", "Lonely", "Misunderstood"].includes(e))) return "abandoned";
  if (emotions.some((e) => ["Angry", "Irritable"].includes(e))) return "argument";
  if (emotions.some((e) => ["Empty", "Restless"].includes(e))) return "spending";
  return undefined;
}

export function HardMoments({ highlight }: { highlight?: Moment }) {
  const cn = useCompanionName();
  const hl = MOMENTS.find((m) => m.id === highlight);
  return (
    <div>
      {hl && (
        <p className="bubble-in mb-2 text-[15px] text-ink-2">
          <b className="font-medium text-ink">{cn}:</b> Rough one today? &ldquo;{hl.label}&rdquo; is right here if you need it. No drink required, babe.
        </p>
      )}
      <div className="eyebrow mb-2">Hard moment?</div>
      <div className="grid grid-cols-2 gap-2">
        {MOMENTS.map((m) => (
          <Link
            key={m.id}
            href={`/steady/${m.id}`}
            className={cx("flex items-center gap-2.5 rounded-2xl border p-3 text-[13.5px] font-medium leading-tight active:scale-[0.98]", m.id === highlight ? "border-gold bg-gold-soft" : "border-line bg-surface")}
          >
            <m.icon size={17} className="shrink-0 text-gold" strokeWidth={1.7} />
            {m.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/** One fresh idea every day. She loves routine, so a good one can become a daily habit in one tap. */
export function SomethingNew() {
  const { vault, update } = useStore();
  const today = dayKey();
  const base = daysBetween("2024-01-01", today) * 7;
  const [shift, setShift] = useState(0);
  const [did, setDid] = useState(false);
  const idea = NEW_THINGS[(base + shift) % NEW_THINGS.length];
  const onList = vault.todos.some((t) => t.date === today && t.text === idea.text);
  const inRoutine = vault.habits.some((h) => !h.archived && h.name.toLowerCase() === idea.text.toLowerCase());

  return (
    <div className="card glow p-5">
      <div className="flex items-center justify-between">
        <div className="eyebrow flex items-center gap-1.5">
          <Sparkles size={12} /> Something new today · {idea.kind}
        </div>
        <button onClick={() => setShift((s) => s + 1)} aria-label="Another idea" className="grid h-8 w-8 place-items-center rounded-full bg-surface-2 text-ink-2 active:rotate-180 transition-transform">
          <Shuffle size={14} />
        </button>
      </div>
      <p key={idea.text} className="bubble-in mt-2 font-serif text-[23px] leading-snug">{idea.text}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          disabled={onList}
          onClick={() => {
            update((v) => addTodos(v, [idea.text]));
            cheer("newThing");
          }}
          className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-2 text-sm disabled:opacity-60"
        >
          {onList ? <Check size={14} /> : <Plus size={14} />} {onList ? "On today's list" : "Add to today"}
        </button>
        <button
          disabled={did}
          onClick={() => {
            setDid(true);
            cheer("newThing");
          }}
          className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-2 text-sm disabled:opacity-60"
        >
          <Check size={14} /> {did ? "Done!" : "I did it"}
        </button>
        <button
          disabled={inRoutine}
          onClick={() => {
            update((v) => ({ ...v, habits: [...v.habits, makeHabit(idea.text)] }));
            cheer("routine");
          }}
          className="flex items-center gap-1.5 rounded-full bg-forest px-3 py-2 text-sm text-on-forest disabled:opacity-60"
        >
          <Repeat size={14} /> {inRoutine ? "In my routine" : "Make it my routine"}
        </button>
      </div>
    </div>
  );
}
