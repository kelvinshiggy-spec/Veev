"use client";

import { useState } from "react";
import { Check, Dumbbell, Footprints, Flame, Plus, X, Settings2, Mic, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, Card, Input, PageHeader, Section, Sheet, TextArea } from "@/components/ui";
import { useCompanionName } from "@/components/companion-name";
import { cheer } from "@/components/cheer";
import { CARDIO_FOCUS, CARDIO_IDEAS, EXERCISES, STRENGTH_FOCUS, TOMORROW, dayCount, minutesOn, streak, suggestFocus } from "@/lib/fitness";
import { addDays, cx, dayKey, fmtDate, pickOfDay, uid } from "@/lib/util";
import type { ExerciseLog, Fitness, WorkoutEntry, WorkoutSlot } from "@/lib/types";

const fmtMins = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}` : `${m}m`);

export default function FitnessPage() {
  const { vault, update } = useStore();
  const cn = useCompanionName();
  const today = dayKey();
  const [day, setDay] = useState(today);
  const [view, setView] = useState<"week" | "month">("week");
  const [editPlan, setEditPlan] = useState(false);
  const f = vault.fitness;
  const entries = f.log[day] ?? {};
  const pick = suggestFocus(f, day);
  const cardioIdea = pickOfDay(CARDIO_IDEAS, 71, day) ?? CARDIO_IDEAS[0];
  const strengthToday = f.slots.filter((s) => s.kind === "strength").map((s) => entries[s.id]).find((e) => e?.done && e.focus)?.focus;
  const tomorrow = strengthToday ? TOMORROW[strengthToday] : undefined;
  const st = streak(f, today);

  const setEntry = (slot: WorkoutSlot, fn: (e: WorkoutEntry) => WorkoutEntry) =>
    update((v) => {
      const cur = v.fitness.log[day]?.[slot.id] ?? { done: false };
      return { ...v, fitness: { ...v.fitness, log: { ...v.fitness.log, [day]: { ...(v.fitness.log[day] ?? {}), [slot.id]: fn(cur) } } } };
    });

  return (
    <div className="fade-in">
      <PageHeader back="/today" eyebrow="Fitness" title="Gym girl era 💪" subtitle="Log it, check it, watch yourself get stronger." />
      {vault.profile.fitnessGoals && <p className="-mt-3 mb-4 text-sm text-ink-3">🎯 {vault.profile.fitnessGoals}</p>}

      {/* Streak + Vylie */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="!p-3 text-center">
          <Flame size={16} className="mx-auto text-gold" />
          <div className="font-serif text-3xl">{st}</div>
          <div className="text-[11px] text-ink-3">day streak</div>
        </Card>
        <Card className="!p-3 text-center">
          <div className="font-serif text-3xl">{weekCount(f, today)}</div>
          <div className="text-[11px] text-ink-3">workouts this week</div>
        </Card>
        <Card className="!p-3 text-center">
          <div className="font-serif text-3xl">{fmtMins(weekMins(f, today))}</div>
          <div className="text-[11px] text-ink-3">moved this week</div>
        </Card>
      </div>

      {/* Day picker */}
      <div className="mt-5 flex items-center justify-between">
        <button onClick={() => setDay(addDays(day, -1))} aria-label="Previous day" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2">
          <ChevronLeft size={16} />
        </button>
        <div className="text-center">
          <div className="font-serif text-xl">{day === today ? "Today" : fmtDate(day, { weekday: "long" })}</div>
          <div className="text-xs text-ink-3">{fmtDate(day, { month: "long", day: "numeric" })}</div>
        </div>
        <button onClick={() => setDay(addDays(day, 1))} disabled={day >= today} aria-label="Next day" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 disabled:opacity-30">
          <ChevronRight size={16} />
        </button>
      </div>

      {day === today && (
        <div className="bubble-in mt-4 flex items-start gap-3">
          <span className="float-slow mt-1 h-10 w-10 shrink-0 rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, #fff 0%, #f7f3e9 18%, #eac8ae 42%, #a9c5b4 72%, #2b5443 100%)" }} aria-hidden />
          <div className="rounded-2xl rounded-tl-md bg-surface-2 px-4 py-3 text-[15px]">
            <div className="text-[11px] uppercase tracking-wider text-ink-3">{cn}&apos;s pick</div>
            <b className="font-medium">{pick.focus}</b> today. {pick.tip}
            <div className="mt-1 text-ink-2">Later: {cardioIdea.toLowerCase()}.</div>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {f.slots.map((slot) => (
          <SlotCard key={slot.id} slot={slot} entry={entries[slot.id]} suggested={slot.kind === "strength" ? pick.focus : undefined} onChange={(fn) => setEntry(slot, fn)} />
        ))}
      </div>

      {tomorrow && day === today && (
        <Card className="sunlit mt-4">
          <div className="eyebrow">Recommended for tomorrow</div>
          <p className="mt-1 font-serif text-[22px] leading-snug">{tomorrow}</p>
          <p className="mt-1 text-sm text-ink-3">You hit {strengthToday!.toLowerCase()} today, so give those muscles a breather. Rest days count too. 🤍</p>
        </Card>
      )}

      {/* History */}
      <Section
        title={view === "week" ? "This week" : fmtDate(today, { month: "long" })}
        className="mt-6"
        action={
          <div className="flex gap-1 rounded-full bg-surface-2 p-1 text-xs">
            {(["week", "month"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={cx("rounded-full px-3 py-1", view === v && "bg-surface shadow-sm")}>
                {v === "week" ? "Week" : "Month"}
              </button>
            ))}
          </div>
        }
      >
        {view === "week" ? <Week f={f} today={today} onPick={setDay} selected={day} /> : <Month f={f} today={today} onPick={setDay} selected={day} />}
        <p className="mt-3 text-center text-xs text-ink-3">Missed a day? Life happens. We just pick it back up. 💕</p>
      </Section>

      <div className="mt-2 flex flex-wrap gap-2">
        <Button variant="soft" size="sm" href="/voice?topic=fitness">
          <Mic size={14} /> Plan my week with {cn}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setEditPlan(true)}>
          <Settings2 size={14} /> Edit my daily plan
        </Button>
      </div>

      <PlanSheet open={editPlan} onClose={() => setEditPlan(false)} />
    </div>
  );
}

function weekStart(today: string) {
  const d = new Date(`${today}T12:00:00`).getDay(); // 0 = Sun
  return addDays(today, -((d + 6) % 7)); // Monday
}
function weekCount(f: Fitness, today: string) {
  const s = weekStart(today);
  return Array.from({ length: 7 }, (_, i) => dayCount(f, addDays(s, i))).reduce((a, b) => a + b, 0);
}
function weekMins(f: Fitness, today: string) {
  const s = weekStart(today);
  return Array.from({ length: 7 }, (_, i) => minutesOn(f, addDays(s, i))).reduce((a, b) => a + b, 0);
}

function SlotCard({ slot, entry, suggested, onChange }: { slot: WorkoutSlot; entry?: WorkoutEntry; suggested?: string; onChange: (fn: (e: WorkoutEntry) => WorkoutEntry) => void }) {
  const done = !!entry?.done;
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const Icon = slot.kind === "strength" ? Dumbbell : Footprints;
  const focusList = slot.kind === "strength" ? STRENGTH_FOCUS : CARDIO_FOCUS;
  const focus = entry?.focus;
  const exercises = entry?.exercises ?? [];
  const options = slot.kind === "strength" ? (EXERCISES[focus ?? suggested ?? ""] ?? []).filter((n) => !exercises.some((e) => e.name === n)) : [];

  const toggle = () => {
    onChange((e) => ({ ...e, done: !e.done, mins: e.mins ?? slot.mins }));
    if (!done) {
      cheer("habit");
      setOpen(true);
    }
  };
  const setEx = (id: string, fn: (x: ExerciseLog) => ExerciseLog) => onChange((e) => ({ ...e, exercises: (e.exercises ?? []).map((x) => (x.id === id ? fn(x) : x)) }));
  const addEx = (name: string) => onChange((e) => ({ ...e, focus: e.focus ?? suggested, exercises: [...(e.exercises ?? []), { id: uid(), name, sets: 3, reps: 10, done: false }] }));

  return (
    <div className={cx("card overflow-hidden", done && "border-forest/40")}>
      <div className="flex items-center gap-4 p-4">
        <button
          onClick={toggle}
          aria-label={done ? `Undo ${slot.label}` : `Done: ${slot.label}`}
          className={cx("grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 transition active:scale-90", done ? "check-pop border-forest bg-forest text-on-forest" : "border-line bg-surface")}
        >
          {done ? <Check size={24} strokeWidth={3} /> : <Icon size={22} className="text-gold" />}
        </button>
        <button onClick={() => setOpen(!open)} className="min-w-0 flex-1 text-left">
          <div className="font-serif text-[22px] leading-tight">{slot.label}</div>
          <div className="text-sm text-ink-3">
            {entry?.mins ?? slot.mins} min{focus ? ` · ${focus}` : ""}
            {exercises.length ? ` · ${exercises.filter((x) => x.done).length}/${exercises.length} exercises` : ""}
          </div>
        </button>
      </div>

      {open && (
        <div className="fade-in space-y-4 border-t border-line p-4">
          <div className="flex flex-wrap gap-1.5">
            {focusList.map((x) => (
              <button
                key={x}
                onClick={() => onChange((e) => ({ ...e, focus: e.focus === x ? undefined : x }))}
                className={cx("rounded-full border px-3 py-1.5 text-[13px]", focus === x ? "border-forest bg-forest text-on-forest" : x === suggested && !focus ? "border-gold bg-gold-soft" : "border-line bg-surface")}
              >
                {x}
              </button>
            ))}
          </div>

          {slot.kind === "strength" && (
            <div>
              {exercises.length > 0 && (
                <ul className="space-y-2">
                  {exercises.map((x) => (
                    <li key={x.id} className="rounded-2xl bg-surface-2 p-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setEx(x.id, (y) => ({ ...y, done: !y.done }));
                            if (!x.done) cheer("goal");
                          }}
                          aria-label={x.done ? `Undo ${x.name}` : `Done: ${x.name}`}
                          className={cx("grid h-7 w-7 shrink-0 place-items-center rounded-full border-2", x.done ? "check-pop border-forest bg-forest text-on-forest" : "border-line bg-surface")}
                        >
                          {x.done && <Check size={14} strokeWidth={3} />}
                        </button>
                        <span className={cx("flex-1 font-medium", x.done && "text-ink-3 line-through")}>{x.name}</span>
                        <button onClick={() => onChange((e) => ({ ...e, exercises: (e.exercises ?? []).filter((y) => y.id !== x.id) }))} aria-label={`Remove ${x.name}`} className="text-ink-3">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2 pl-10">
                        <Num label="sets" value={x.sets} onChange={(n) => setEx(x.id, (y) => ({ ...y, sets: n ?? 0 }))} />
                        <Num label="reps" value={x.reps} onChange={(n) => setEx(x.id, (y) => ({ ...y, reps: n }))} />
                        <Num label="lbs" value={x.weight} onChange={(n) => setEx(x.id, (y) => ({ ...y, weight: n }))} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {options.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {options.map((n) => (
                    <button key={n} onClick={() => addEx(n)} className="rounded-full border border-dashed border-line px-3 py-1.5 text-[13px] text-ink-2 active:scale-95">
                      + {n}
                    </button>
                  ))}
                </div>
              )}
              <form
                className="mt-2 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!custom.trim()) return;
                  addEx(custom.trim());
                  setCustom("");
                }}
              >
                <Input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Add an exercise…" />
                <Button type="submit" size="sm" variant="soft">
                  <Plus size={14} />
                </Button>
              </form>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <span className="text-ink-3">Minutes</span>
            <input
              inputMode="numeric"
              value={entry?.mins ?? slot.mins}
              onChange={(e) => onChange((x) => ({ ...x, mins: Number(e.target.value.replace(/\D/g, "")) || 0 }))}
              className="w-16 rounded-xl border border-line bg-surface px-2 py-1.5 text-center"
              aria-label="Minutes"
            />
          </div>
          <TextArea rows={2} value={entry?.notes ?? ""} onChange={(t) => onChange((x) => ({ ...x, notes: t }))} placeholder="Notes: felt strong, new PR, sore from yesterday…" />
        </div>
      )}
    </div>
  );
}

function Num({ label, value, onChange }: { label: string; value?: number; onChange: (n?: number) => void }) {
  return (
    <label className="flex items-center gap-1 rounded-xl border border-line bg-surface px-2 py-1">
      <input inputMode="decimal" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value.replace(/[^\d.]/g, "")) || 0)} className="w-full min-w-0 bg-transparent text-center text-sm outline-none" aria-label={label} />
      <span className="text-[11px] text-ink-3">{label}</span>
    </label>
  );
}

function Week({ f, today, onPick, selected }: { f: Fitness; today: string; onPick: (d: string) => void; selected: string }) {
  const s = weekStart(today);
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {Array.from({ length: 7 }, (_, i) => {
        const d = addDays(s, i);
        const n = dayCount(f, d);
        const future = d > today;
        return (
          <button key={d} disabled={future} onClick={() => onPick(d)} className={cx("flex flex-col items-center gap-1.5 rounded-2xl border py-2.5", d === selected ? "border-forest" : "border-transparent", future && "opacity-40")}>
            <span className="text-[11px] text-ink-3">{fmtDate(d, { weekday: "narrow" })}</span>
            <span className={cx("grid h-9 w-9 place-items-center rounded-full text-sm", n >= f.slots.length ? "bg-forest text-on-forest" : n > 0 ? "bg-sage-soft text-forest" : "bg-surface-2 text-ink-3")}>
              {n >= f.slots.length ? "✓" : n > 0 ? n : fmtDate(d, { day: "numeric" })}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Month({ f, today, onPick, selected }: { f: Fitness; today: string; onPick: (d: string) => void; selected: string }) {
  const first = `${today.slice(0, 8)}01`;
  const lead = (new Date(`${first}T12:00:00`).getDay() + 6) % 7;
  const daysIn = new Date(Number(today.slice(0, 4)), Number(today.slice(5, 7)), 0).getDate();
  const total = Array.from({ length: daysIn }, (_, i) => dayCount(f, addDays(first, i))).reduce((a, b) => a + b, 0);
  const activeDays = Array.from({ length: daysIn }, (_, i) => dayCount(f, addDays(first, i))).filter(Boolean).length;
  const mins = Array.from({ length: daysIn }, (_, i) => minutesOn(f, addDays(first, i))).reduce((a, b) => a + b, 0);
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-ink-3">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: lead }, (_, i) => (
          <div key={`b${i}`} />
        ))}
        {Array.from({ length: daysIn }, (_, i) => {
          const d = addDays(first, i);
          const n = dayCount(f, d);
          const future = d > today;
          return (
            <button
              key={d}
              disabled={future}
              onClick={() => onPick(d)}
              className={cx(
                "aspect-square rounded-lg text-[12px]",
                n >= f.slots.length ? "bg-forest text-on-forest" : n > 0 ? "bg-sage-soft text-forest" : "bg-surface-2 text-ink-3",
                d === selected && "ring-2 ring-gold",
                future && "opacity-40",
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="font-serif text-2xl">{activeDays}</div>
          <div className="text-[11px] text-ink-3">active days</div>
        </div>
        <div>
          <div className="font-serif text-2xl">{total}</div>
          <div className="text-[11px] text-ink-3">sessions</div>
        </div>
        <div>
          <div className="font-serif text-2xl">{fmtMins(mins)}</div>
          <div className="text-[11px] text-ink-3">total</div>
        </div>
      </div>
    </div>
  );
}

function PlanSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { vault, update } = useStore();
  const slots = vault.fitness.slots;
  const set = (next: WorkoutSlot[]) => update((v) => ({ ...v, fitness: { ...v.fitness, slots: next } }));
  return (
    <Sheet open={open} onClose={onClose} title="My daily plan">
      <div className="space-y-3">
        {slots.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <Input value={s.label} onChange={(e) => set(slots.map((x) => (x.id === s.id ? { ...x, label: e.target.value } : x)))} />
            <input
              inputMode="numeric"
              value={s.mins}
              onChange={(e) => set(slots.map((x) => (x.id === s.id ? { ...x, mins: Number(e.target.value.replace(/\D/g, "")) || 0 } : x)))}
              className="w-16 rounded-2xl border border-line bg-surface px-2 py-3 text-center"
              aria-label="Minutes"
            />
            <span className="text-sm text-ink-3">min</span>
            {slots.length > 1 && (
              <button onClick={() => set(slots.filter((x) => x.id !== s.id))} aria-label={`Remove ${s.label}`} className="text-ink-3">
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <Button size="sm" variant="soft" onClick={() => set([...slots, { id: uid(), label: "Stretch", mins: 15, kind: "cardio" }])}>
            <Plus size={14} /> Add a slot
          </Button>
        </div>
        <Button full onClick={onClose}>
          Done
        </Button>
      </div>
    </Sheet>
  );
}
