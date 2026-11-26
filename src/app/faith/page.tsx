"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, PageHeader, Section, Toggle, Chips } from "@/components/ui";
import { VERSES, FAITH_IN_RECOVERY, verseFor, type VerseTheme } from "@/data/verses";
import { dayKey, daysBetween, pickOfDay } from "@/lib/util";

const THEMES: { t: VerseTheme; label: string }[] = [
  { t: "strength", label: "Strength" },
  { t: "temptation", label: "Temptation" },
  { t: "peace", label: "Peace" },
  { t: "grace", label: "Grace after a slip" },
  { t: "anger", label: "Anger" },
  { t: "renewal", label: "New beginnings" },
  { t: "joy", label: "Joy" },
  { t: "rest", label: "Rest" },
  { t: "wisdom", label: "Wisdom" },
  { t: "together", label: "Not alone" },
];

export default function Faith() {
  const { vault, update } = useStore();
  const [theme, setTheme] = useState<string[]>([]);
  const today = verseFor(daysBetween("2024-01-01", dayKey()));
  const thought = pickOfDay(FAITH_IN_RECOVERY, 5);
  const list = theme.length ? VERSES.filter((v) => theme.includes(THEMES.find((x) => x.t === v.theme)!.label)) : [];

  return (
    <div>
      <PageHeader back eyebrow="Faith" title="Strength for today." />
      <Card>
        <p className="font-serif text-[24px] leading-snug">“{today.text}”</p>
        <div className="mt-3 text-sm font-medium text-gold">{today.ref} · KJV</div>
        <div className="hairline my-5" />
        <p className="text-[15px] leading-relaxed text-ink-2">{today.reflection}</p>
        <p className="mt-4 font-serif text-lg italic text-ink">{today.prayer}</p>
      </Card>

      {thought && (
        <Section title="Faith in recovery" className="mt-8">
          <Card className="bg-surface-2">
            <p className="text-[15px] leading-relaxed">{thought}</p>
          </Card>
        </Section>
      )}

      <Section title="Find a verse for how you feel">
        <Chips options={THEMES.map((t) => t.label)} value={theme} onChange={(v) => setTheme(v.slice(-1))} />
        <div className="mt-4 space-y-3">
          {list.map((v) => (
            <Card key={v.ref}>
              <p className="font-serif text-lg leading-snug">“{v.text}”</p>
              <div className="mt-2 text-sm text-gold">{v.ref}</div>
              <p className="mt-2 text-sm text-ink-2">{v.reflection}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Card>
        <Toggle
          checked={vault.settings.faith}
          onChange={(v) => update((x) => ({ ...x, settings: { ...x.settings, faith: v } }))}
          label="Show faith content"
          hint="Daily verse on Today, and verses in hard moments."
        />
      </Card>
      <p className="mt-4 text-xs text-ink-3">Scripture quotations from the King James Version (public domain).</p>
    </div>
  );
}
