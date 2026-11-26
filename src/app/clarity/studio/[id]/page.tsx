"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { getSession } from "@/data/studio";
import { Button, Card, Empty, Label, PageHeader, Progress, TextArea } from "@/components/ui";
import { uid, haptic } from "@/lib/util";

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const s = getSession(id);
  const { vault, update } = useStore();
  const [i, setI] = useState(-1);
  const [left, setLeft] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const step = s && i >= 0 && i < s.steps.length ? s.steps[i] : undefined;

  useEffect(() => {
    setLeft(step?.seconds ?? null);
  }, [step]);

  useEffect(() => {
    if (left === null || left <= 0) return;
    const t = setTimeout(() => {
      setLeft(left - 1);
      if (left - 1 === 0) haptic(vault.settings.haptics, [15, 50, 15]);
    }, 1000);
    return () => clearTimeout(t);
  }, [left, vault.settings.haptics]);

  if (!s) return <Empty title="Session not found" action={<Button href="/clarity/studio">Back to studio</Button>} />;

  const reflecting = i >= s.steps.length;

  return (
    <div>
      <PageHeader back="/clarity/studio" eyebrow={`${s.skill} · ${s.minutes} min`} title={s.title} />
      {i === -1 && (
        <>
          <p className="text-[17px] leading-relaxed text-ink-2">{s.intro}</p>
          <Button full size="lg" className="mt-8" onClick={() => setI(0)}>
            Begin
          </Button>
          <p className="mt-4 text-xs text-ink-3">Guided self-help, not psychotherapy.</p>
        </>
      )}

      {step && (
        <div className="fade-in" key={i}>
          <Progress value={((i + 1) / s.steps.length) * 100} className="mb-6" />
          <Card className="min-h-[200px]">
            <div className="eyebrow mb-3">
              Step {i + 1} of {s.steps.length}
            </div>
            <p className="font-serif text-[24px] leading-snug">{step.text}</p>
            {left !== null && (
              <div className="mt-6 text-center">
                <div className="font-serif text-5xl tabular-nums text-forest">
                  {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
                </div>
                {left > 0 && <div className="breathe mx-auto mt-4 h-16 w-16 rounded-full bg-forest-soft" />}
              </div>
            )}
          </Card>
          <div className="mt-6 flex gap-2">
            <Button variant="ghost" onClick={() => setI(i - 1)}>
              Back
            </Button>
            <div className="flex-1" />
            <Button onClick={() => setI(i + 1)}>{i === s.steps.length - 1 ? "Reflect" : left ? "Skip timer" : "Next"}</Button>
          </div>
        </div>
      )}

      {reflecting && !done && (
        <div className="fade-in space-y-5">
          {s.reflect.map((q) => (
            <div key={q}>
              <Label>{q}</Label>
              <TextArea rows={3} value={notes[q] ?? ""} onChange={(v) => setNotes({ ...notes, [q]: v })} />
            </div>
          ))}
          <Button
            full
            size="lg"
            onClick={() => {
              update((v) => ({
                ...v,
                journal: [...v.journal, { id: uid(), kind: "studio", createdAt: new Date().toISOString(), title: s.title, fields: notes }],
                therapy: v.therapy.skills.some((x) => x.text === s.skill)
                  ? v.therapy
                  : { ...v.therapy, skills: [...v.therapy.skills, { id: uid(), text: s.skill, createdAt: new Date().toISOString() }] },
              }));
              setDone(true);
            }}
          >
            Finish
          </Button>
        </div>
      )}

      {done && (
        <Card className="fade-in border-forest/30 bg-forest-soft">
          <div className="font-serif text-2xl">Well done for practicing.</div>
          <p className="mt-1 text-[15px] text-ink-2">Skills get stronger every time you use them, especially on calm days.</p>
          <div className="mt-4 flex gap-2">
            <Button href="/clarity/studio" size="sm">
              Studio
            </Button>
            <Button href="/today" size="sm" variant="outline">
              Today
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
