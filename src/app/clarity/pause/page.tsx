"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Button, Card, Chips, Label, Notice, PageHeader, Section, TextArea, Pill } from "@/components/ui";
import { uid, fmtDate, fmtTime } from "@/lib/util";
import type { PauseDecision } from "@/lib/types";

const KINDS = [
  "Send an angry message",
  "Call someone repeatedly",
  "End a relationship",
  "Expensive purchase",
  "Start an argument",
  "Drink",
  "Post something online",
  "Major life decision",
  "Something else",
];

const QS = [
  ["emotion", "What emotion is driving this?"],
  ["urgent", "Does this truly need to happen right now?"],
  ["after", "What could happen afterward?"],
  ["values", "Does this reflect my values?"],
  ["tomorrow", "Would I make the same decision tomorrow morning?"],
  ["calmer", "Is there a calmer alternative?"],
] as const;

const COOL = [
  { label: "1 hour", ms: 3600_000 },
  { label: "Until morning", ms: -1 },
  { label: "24 hours", ms: 86400_000 },
  { label: "3 days", ms: 3 * 86400_000 },
];

/** When a cooling-off period ends: -1 means "tomorrow at 9am", otherwise milliseconds from now. */
function coolUntilFor(ms?: number) {
  if (ms === -1) {
    const d = new Date();
    d.setDate(d.getDate() + (d.getHours() >= 5 ? 1 : 0));
    d.setHours(9, 0, 0, 0);
    return d.toISOString();
  }
  return ms ? new Date(Date.now() + ms).toISOString() : undefined;
}

export default function Pause() {
  const { vault, update } = useStore();
  const [action, setAction] = useState("");
  const [kind, setKind] = useState<string[]>([]);
  const [ans, setAns] = useState<Record<string, string>>({});
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const active = vault.pauses.filter((p) => !p.outcome).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const past = vault.pauses.filter((p) => p.outcome).slice(-5).reverse();

  const save = (ms?: number) => {
    const coolUntil = coolUntilFor(ms);
    const p: PauseDecision = { id: uid(), action, kind: kind[0] ?? "Something else", answers: ans, coolUntil, createdAt: new Date().toISOString() };
    update((v) => ({ ...v, pauses: [...v.pauses, p] }));
    setAction("");
    setKind([]);
    setAns({});
  };

  const resolve = (id: string, outcome: PauseDecision["outcome"]) =>
    update((v) => ({ ...v, pauses: v.pauses.map((p) => (p.id === id ? { ...p, outcome } : p)) }));

  return (
    <div>
      <PageHeader back="/clarity" eyebrow="Pause before acting" title="Urgent feelings, unhurried decisions." />

      {active.length > 0 && (
        <Section title="Cooling off">
          <div className="space-y-2">
            {active.map((p) => {
              const left = p.coolUntil ? new Date(p.coolUntil).getTime() - now : 0;
              return (
                <Card key={p.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{p.action || p.kind}</div>
                      <div className="text-sm text-ink-3">
                        {left > 0
                          ? `Revisit after ${fmtDate(p.coolUntil!, { weekday: "short" })} ${fmtTime(p.coolUntil!)}`
                          : "Cooling-off done. How do you feel about it now?"}
                      </div>
                    </div>
                    <Pill tone={left > 0 ? "gold" : "forest"}>{left > 0 ? `${Math.ceil(left / 3600_000)}h` : "Ready"}</Pill>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" variant="soft" onClick={() => resolve(p.id, "let-go")}>
                      I&apos;ve let it go
                    </Button>
                    <Button size="sm" variant="soft" onClick={() => resolve(p.id, "waited")}>
                      Still want to, calmly
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => resolve(p.id, "acted")}>
                      I did it
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </Section>
      )}

      <div className="space-y-6">
        <div>
          <Label>What do you want to do?</Label>
          <TextArea voice rows={3} value={action} onChange={setAction} placeholder="Describe it plainly." />
        </div>
        <Chips options={KINDS} value={kind} onChange={setKind} multi={false} />
        {kind[0] === "Drink" && (
          <Notice>
            <a href="/protect" className="font-medium underline">
              Open Protect My Future
            </a>{" "}
            for the full craving support.
          </Notice>
        )}
        {kind[0] === "Send an angry message" && (
          <Notice>
            <a href="/clarity/send" className="font-medium underline">
              Pause Before Sending
            </a>{" "}
            can help you rewrite it.
          </Notice>
        )}
        {QS.map(([k, q]) => (
          <div key={k}>
            <Label>{q}</Label>
            <TextArea rows={2} value={ans[k] ?? ""} onChange={(v) => setAns({ ...ans, [k]: v })} />
          </div>
        ))}
        <Notice tone="forest">
          A cooling-off period is for decisions that can wait. Never delay medical care, and never stay somewhere unsafe to &quot;wait it out.&quot;
        </Notice>
        <Section title="Give it time">
          <div className="grid grid-cols-2 gap-2">
            {COOL.map((c) => (
              <Button key={c.label} variant="outline" onClick={() => save(c.ms)} disabled={!action.trim() && !kind.length}>
                {c.label}
              </Button>
            ))}
          </div>
          <Button variant="ghost" full className="mt-2" onClick={() => save()} disabled={!action.trim() && !kind.length}>
            Just save my thinking
          </Button>
        </Section>
      </div>

      {past.length > 0 && (
        <Section title="Decisions you paused" className="mt-8">
          <div className="space-y-2">
            {past.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-2xl bg-surface-2 px-4 py-3 text-sm">
                <span className="truncate pr-3">{p.action || p.kind}</span>
                <span className="shrink-0 text-ink-3">{p.outcome === "let-go" ? "Let go" : p.outcome === "waited" ? "Decided calmly" : "Acted"}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
