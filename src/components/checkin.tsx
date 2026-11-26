"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button, Chips, Label } from "./ui";
import { EMOTIONS } from "@/data/options";
import { dayKey, uid, cx } from "@/lib/util";
import type { CheckIn } from "@/lib/types";
import { screen, INTERRUPTING } from "@/lib/safety";
import { useSafety } from "./safety";

const MOODS = ["Heavy", "Low", "Okay", "Good", "Wonderful"];

export function CheckInForm({ existing, onDone }: { existing?: CheckIn; onDone?: () => void }) {
  const { update } = useStore();
  const safety = useSafety();
  const [mood, setMood] = useState(existing?.mood ?? 0);
  const [energy, setEnergy] = useState(existing?.energy ?? 3);
  const [craving, setCraving] = useState(existing?.craving ?? 0);
  const [emotions, setEmotions] = useState<string[]>(existing?.emotions ?? []);
  const [sleep, setSleep] = useState<number | "">(existing?.sleepHours ?? "");
  const [note, setNote] = useState(existing?.note ?? "");

  const save = () => {
    const c: CheckIn = {
      id: existing?.id ?? uid(),
      date: existing?.date ?? dayKey(),
      at: new Date().toISOString(),
      mood,
      energy,
      craving,
      emotions,
      sleepHours: sleep === "" ? undefined : sleep,
      note: note.trim() || undefined,
    };
    update((v) => ({ ...v, checkIns: [...v.checkIns.filter((x) => x.id !== c.id), c] }));
    const flags = screen(note).filter((k) => INTERRUPTING.includes(k));
    if (flags.length) safety.open(flags[0]);
    onDone?.();
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>How are you, really?</Label>
        <div className="grid grid-cols-5 gap-1.5">
          {MOODS.map((m, i) => (
            <button
              key={m}
              onClick={() => setMood(i + 1)}
              className={cx(
                "rounded-2xl border px-1 py-3 text-[13px] transition",
                mood === i + 1 ? "border-forest bg-forest text-on-forest" : "border-line bg-surface text-ink-2",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label hint="Pick any that fit.">Feelings</Label>
        <Chips options={EMOTIONS} value={emotions} onChange={setEmotions} />
      </div>
      <div>
        <Label hint={craving === 0 ? "None" : craving < 4 ? "A little" : craving < 7 ? "Noticeable" : "Strong"}>Any pull toward drinking? {craving}/10</Label>
        <input type="range" min={0} max={10} value={craving} onChange={(e) => setCraving(Number(e.target.value))} className="w-full accent-[var(--gold)]" aria-label="Craving strength" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Energy {energy}/5</Label>
          <input type="range" min={1} max={5} value={energy} onChange={(e) => setEnergy(Number(e.target.value))} className="w-full accent-[var(--forest)]" aria-label="Energy" />
        </div>
        <div>
          <Label>Sleep (hours)</Label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            max={16}
            step={0.5}
            value={sleep}
            onChange={(e) => setSleep(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full rounded-2xl border border-line bg-surface px-4 py-2.5"
          />
        </div>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Anything on your mind? (optional)"
        rows={2}
        className="w-full rounded-2xl border border-line bg-surface px-4 py-3 outline-none focus:border-gold"
      />
      <Button full onClick={save} disabled={!mood}>
        Save check-in
      </Button>
    </div>
  );
}
