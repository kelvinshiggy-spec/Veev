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
import { cx, dayKey, daysBetween, fmtDate } from "@/lib/util";

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

/** Vylie's daily goal check: today's one tiny step, a nudge if it's gone quiet, and upcoming exams. */
export function GoalCheck() {
  const { vault, update } = useStore();
  const cn = useCompanionName();
  const today = dayKey();
  const active = vault.goals.filter((g) => !g.completedAt).sort((a, b) => a.due.localeCompare(b.due));
  const exam = vault.exams.filter((e) => !e.done && e.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
  const examIn = exam ? daysBetween(today, exam.date) : 99;

  if (!active.length && examIn > 7)
    return (
      <Link href="/goals" className="card flex items-center gap-4 p-5 active:scale-[0.99]">
        <span className="text-3xl" aria-hidden>🎯</span>
        <span className="flex-1">
          <span className="eyebrow block">Goals</span>
          <span className="block font-serif text-[21px] leading-tight">What&apos;s one thing you want by the end of the month?</span>
          <span className="text-sm text-ink-3">Ski trip, savings, pharmacy school… we&apos;ll break it into tiny steps.</span>
        </span>
      </Link>
    );

  // Rotate which goal gets the spotlight each day.
  const g = active.length ? active[daysBetween("2024-01-01", today) % active.length] : undefined;
  const next = g?.steps.find((s) => !s.done);
  const lastDone = g?.steps.map((s) => s.doneAt ?? "").sort().pop() || g?.createdAt || "";
  const quiet = g && lastDone ? daysBetween(lastDone.slice(0, 10), today) >= 3 : false;
  const left = g ? daysBetween(today, g.due) : 0;
  const done = g ? g.steps.filter((s) => s.done).length : 0;

  const check = () => {
    if (!g || !next) return;
    update((v) => ({ ...v, goals: v.goals.map((x) => (x.id === g.id ? { ...x, steps: x.steps.map((s) => (s.id === next.id ? { ...s, done: true, doneAt: new Date().toISOString() } : s)) } : x)) }));
    cheer("goal");
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="eyebrow">{cn}&apos;s goal check</div>
        <Link href="/goals" className="text-xs text-ink-3">
          All goals
        </Link>
      </div>
      {g && (
        <>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-3xl">{g.emoji}</span>
            <div>
              <div className="font-serif text-[21px] leading-tight">{g.title}</div>
              <div className="text-xs text-ink-3">
                {done}/{g.steps.length} steps · {left > 0 ? `${left} days left` : left === 0 ? "due today" : "still worth finishing"}
              </div>
            </div>
          </div>
          {next ? (
            <>
              <p className="bubble-in mt-3 rounded-2xl rounded-tl-md bg-surface-2 px-3.5 py-2.5 text-[15.5px]">
                {quiet ? `Bestie, ${g.title.toLowerCase()} has been a little quiet. No guilt! Just one tiny step today: ` : "Today's one step: "}
                <b className="font-medium">{next.text}</b>
                {next.date ? ` (by ${fmtDate(next.date, { month: "short", day: "numeric" })})` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={check} className="flex items-center gap-1.5 rounded-full bg-forest px-3 py-2 text-sm text-on-forest active:scale-95">
                  <Check size={14} /> Done it!
                </button>
                <button
                  onClick={() => {
                    update((v) => addTodos(v, [`${g.emoji} ${next.text}`]));
                    cheer("intention");
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-2 text-sm"
                >
                  <Plus size={14} /> Put it on today&apos;s list
                </button>
              </div>
            </>
          ) : (
            <p className="mt-3 text-[15px]">Every step is checked! Go add your proof photo and claim that trophy 🏆</p>
          )}
        </>
      )}
      {exam && examIn <= 7 && (
        <div className="mt-3 rounded-2xl border border-line p-3 text-sm">
          📚 <b className="font-medium">{exam.title}</b> {examIn === 0 ? "is today. You've got this, future pharmacist!" : `in ${examIn} day${examIn === 1 ? "" : "s"}. A little study session today?`}
        </div>
      )}
    </div>
  );
}

/** Quick workout check-off on Today; the full log lives on /fitness. */
export function WorkoutToday() {
  const { vault, update } = useStore();
  const today = dayKey();
  const f = vault.fitness;
  const entries = f.log[today] ?? {};
  const done = f.slots.filter((s) => entries[s.id]?.done).length;
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="eyebrow">Today&apos;s workout 💪</div>
        <Link href="/fitness" className="text-xs text-ink-3">
          Log details
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {f.slots.slice(0, 4).map((s) => {
          const on = !!entries[s.id]?.done;
          return (
            <button
              key={s.id}
              onClick={() => {
                update((v) => ({
                  ...v,
                  fitness: { ...v.fitness, log: { ...v.fitness.log, [today]: { ...(v.fitness.log[today] ?? {}), [s.id]: { ...(v.fitness.log[today]?.[s.id] ?? {}), done: !on, mins: v.fitness.log[today]?.[s.id]?.mins ?? s.mins } } } },
                }));
                if (!on) cheer("habit");
              }}
              className={cx("flex items-center gap-2.5 rounded-2xl border p-3 text-left transition active:scale-95", on ? "border-forest bg-forest text-on-forest" : "border-line bg-surface")}
            >
              <span className={cx("grid h-7 w-7 shrink-0 place-items-center rounded-full border-2", on ? "border-on-forest" : "border-line")}>{on && <Check size={14} strokeWidth={3} />}</span>
              <span className="leading-tight">
                <span className="block text-[14.5px] font-medium">{s.label}</span>
                <span className={cx("text-xs", on ? "opacity-80" : "text-ink-3")}>{s.mins} min</span>
              </span>
            </button>
          );
        })}
      </div>
      {done === f.slots.length && f.slots.length > 0 && <p className="bubble-in mt-3 text-sm text-forest">Both done?! Gym girl era is SO real. ✨</p>}
    </div>
  );
}
