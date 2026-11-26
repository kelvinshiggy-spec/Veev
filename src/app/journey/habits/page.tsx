"use client";

import { useState } from "react";
import { Check, Archive, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, Card, Chips, Input, PageHeader, Section, Sheet, Label } from "@/components/ui";
import { DEFAULT_HABITS, makeHabit } from "@/lib/defaults";
import { addDays, cx, dayKey, parseDay } from "@/lib/util";
import type { Habit } from "@/lib/types";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export default function Habits() {
  const { vault, update } = useStore();
  const [edit, setEdit] = useState<Habit | null>(null);
  const today = dayKey();
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const habits = vault.habits.filter((h) => !h.archived);
  const toggle = (h: Habit, d: string) =>
    update((v) => ({ ...v, habits: v.habits.map((x) => (x.id === h.id ? { ...x, log: { ...x.log, [d]: !x.log[d] } } : x)) }));
  const showedUp = (h: Habit) => Array.from({ length: 30 }, (_, i) => addDays(today, -i)).filter((d) => h.log[d]).length;
  const unused = DEFAULT_HABITS.filter((n) => !vault.habits.some((h) => h.name === n && !h.archived));

  return (
    <div>
      <PageHeader back="/journey" eyebrow="Discipline without punishment" title="Show up, not perfectly." subtitle="Consistency counts more than streaks. A missed day is just a day." />

      <Card className="!px-3">
        <div className="mb-2 grid grid-cols-[1fr_repeat(7,2rem)] items-center gap-1 px-2 text-center text-[11px] text-ink-3">
          <span />
          {week.map((d) => (
            <span key={d} className={cx(d === today && "font-semibold text-ink")}>
              {DAYS[parseDay(d).getDay()]}
            </span>
          ))}
        </div>
        {habits.length === 0 && <p className="px-2 py-4 text-sm text-ink-3">Add a habit below.</p>}
        {habits.map((h) => (
          <div key={h.id} className="grid grid-cols-[1fr_repeat(7,2rem)] items-center gap-1 border-t border-line px-2 py-2.5">
            <button onClick={() => setEdit(h)} className="truncate text-left text-sm">
              {h.name}
              <span className="block text-[11px] text-ink-3">{showedUp(h)} days this month</span>
            </button>
            {week.map((d) => {
              const applies = h.days.includes(parseDay(d).getDay());
              const on = !!h.log[d];
              return (
                <button
                  key={d}
                  onClick={() => toggle(h, d)}
                  aria-label={`${h.name} ${d}`}
                  aria-pressed={on}
                  className={cx(
                    "mx-auto grid h-7 w-7 place-items-center rounded-full border transition",
                    on ? "border-forest bg-forest text-on-forest" : applies ? "border-line" : "border-transparent opacity-30",
                  )}
                >
                  {on && <Check size={13} />}
                </button>
              );
            })}
          </div>
        ))}
      </Card>

      {unused.length > 0 && (
        <Section title="Add a habit" className="mt-6">
          <Chips options={unused} value={[]} onChange={(v) => v[0] && update((x) => ({ ...x, habits: [...x.habits, makeHabit(v[0])] }))} />
          <Button size="sm" variant="ghost" className="mt-3" onClick={() => setEdit({ ...makeHabit(""), name: "" })}>
            <Plus size={14} /> Something else
          </Button>
        </Section>
      )}

      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.name || "New habit"}>
        {edit && (
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            </div>
            <div>
              <Label>Which days?</Label>
              <div className="flex gap-1.5">
                {DAYS.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setEdit({ ...edit, days: edit.days.includes(i) ? edit.days.filter((x) => x !== i) : [...edit.days, i].sort() })}
                    className={cx("h-10 w-10 rounded-full border text-sm", edit.days.includes(i) ? "border-forest bg-forest text-on-forest" : "border-line")}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <Button
              full
              disabled={!edit.name.trim()}
              onClick={() => {
                update((v) => ({ ...v, habits: [...v.habits.filter((x) => x.id !== edit.id), edit] }));
                setEdit(null);
              }}
            >
              Save
            </Button>
            {vault.habits.some((h) => h.id === edit.id) && (
              <button
                onClick={() => {
                  update((v) => ({ ...v, habits: v.habits.map((x) => (x.id === edit.id ? { ...x, archived: true } : x)) }));
                  setEdit(null);
                }}
                className="inline-flex w-full items-center justify-center gap-1 py-2 text-sm text-ink-3"
              >
                <Archive size={14} /> Archive (history is kept)
              </button>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}
