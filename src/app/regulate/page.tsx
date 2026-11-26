"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Button, Card, LinkCard, PageHeader, Section, Segmented } from "@/components/ui";
import { SESSIONS } from "@/data/studio";
import { cx } from "@/lib/util";

const PATTERNS = {
  calm: { label: "4 · 6", inhale: 4, hold: 0, exhale: 6 },
  box: { label: "Box 4·4·4·4", inhale: 4, hold: 4, exhale: 4 },
  sleep: { label: "4 · 7 · 8", inhale: 4, hold: 7, exhale: 8 },
};

export default function Regulate() {
  const { vault } = useStore();
  const [pattern, setPattern] = useState<keyof typeof PATTERNS>("calm");
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const p = PATTERNS[pattern];

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setCount((c) => {
        const limit = phase === "in" ? p.inhale : phase === "hold" ? p.hold : p.exhale;
        if (c + 1 < limit) return c + 1;
        if (phase === "in") setPhase(p.hold ? "hold" : "out");
        else if (phase === "hold") setPhase("out");
        else {
          setPhase("in");
          setCycles((n) => n + 1);
        }
        return 0;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, phase, p]);

  const scale = phase === "in" ? 1 : phase === "hold" ? 1 : 0.62;
  const dur = phase === "in" ? p.inhale : phase === "out" ? p.exhale : 0.2;
  const quick = ["paced-breathing", "grounding-54321", "stop", "tipp", "urge-surfing", "radical-acceptance"].map((id) => SESSIONS.find((s) => s.id === id)!);

  return (
    <div>
      <PageHeader back eyebrow="Help me regulate" title="Slow everything down." subtitle="Breathe out longer than you breathe in. Follow the circle." />
      <Segmented
        value={pattern}
        onChange={(v) => {
          setPattern(v);
          setPhase("in");
          setCount(0);
        }}
        options={Object.entries(PATTERNS).map(([k, v]) => ({ value: k as keyof typeof PATTERNS, label: v.label }))}
      />
      <div className="my-10 grid place-items-center">
        <div className="relative grid h-64 w-64 place-items-center">
          <div
            className="absolute inset-0 rounded-full bg-forest-soft"
            style={{
              transform: `scale(${running ? scale : 0.75})`,
              transition: vault.settings.reducedMotion ? "none" : `transform ${dur}s ease-in-out`,
            }}
          />
          <div className="absolute inset-6 rounded-full border border-gold/40" />
          <div className="relative text-center">
            <div className="font-serif text-3xl">{running ? (phase === "in" ? "Breathe in" : phase === "hold" ? "Hold" : "Breathe out") : "Ready"}</div>
            {running && <div className="mt-1 text-sm text-ink-3">{cycles} breaths</div>}
          </div>
        </div>
      </div>
      <Button full size="lg" variant={running ? "outline" : "primary"} onClick={() => setRunning(!running)}>
        {running ? "Pause" : "Begin"}
      </Button>

      {vault.profile.grounding.length > 0 && (
        <Section title="What grounds you" className="mt-10">
          <Card>
            <div className="flex flex-wrap gap-2">
              {vault.profile.grounding.map((g) => (
                <span key={g} className="rounded-full bg-surface-2 px-3 py-1.5 text-sm">
                  {g}
                </span>
              ))}
            </div>
          </Card>
        </Section>
      )}

      <Section title="Guided" className={cx(vault.profile.grounding.length ? "" : "mt-10")}>
        <div className="grid gap-2">
          {quick.map((s) => (
            <LinkCard key={s.id} href={`/clarity/studio/${s.id}`} className="p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{s.title}</span>
                <span className="text-sm text-ink-3">{s.minutes} min</span>
              </div>
            </LinkCard>
          ))}
        </div>
      </Section>
    </div>
  );
}
