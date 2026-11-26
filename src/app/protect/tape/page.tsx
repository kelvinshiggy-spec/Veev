"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button, Card, PageHeader, TextArea, Segmented } from "@/components/ui";
import { sobrietyStats } from "@/lib/sobriety";
import { money, uid } from "@/lib/util";

type Path = "a" | "b";

export default function TapeForward() {
  const { vault, update } = useStore();
  const p = vault.profile;
  const s = sobrietyStats(vault);
  const [path, setPath] = useState<Path>("a");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [chosen, setChosen] = useState<Path | null>(null);
  const set = (k: string, v: string) => setAnswers((a) => ({ ...a, [k]: v }));

  const pastLapses = vault.journal.filter((j) => j.kind === "reflection").slice(-2);
  const drankCravings = vault.cravings.filter((c) => c.outcome === "drank").length;
  const plans = vault.activities.filter((a) => a.status === "planned").slice(0, 3);
  const funds = vault.funds.slice(0, 2);

  const A = [
    { k: "first", q: "What do you expect the first drink to feel like?", hint: "Be honest. It might feel good, at first." },
    {
      k: "stop",
      q: "Historically, how easy has it been to stop after one?",
      hint: p.afterFirstDrink ? `You wrote: “${p.afterFirstDrink}”` : "Think about the last few times.",
    },
    { k: "tonight", q: "How might the rest of tonight go?", hint: "Conversations, messages, decisions, getting home." },
    { k: "tomorrow", q: "How might you feel tomorrow morning?", hint: "Body, mind, and how you'd feel about yourself." },
    {
      k: "cost",
      q: "What could it affect?",
      hint: `Your relationships, health, plans, ${s.current} clear days, ${money(p.dailyDrinkSpend, p.currency)} or more.`,
    },
  ];
  const B = [
    { k: "wake", q: "Picture waking up tomorrow clear-headed. What does it feel like?", hint: "The light, your coffee, a quiet mind." },
    { k: "proud", q: "How proud would you feel of tonight's decision?", hint: "Name it in a sentence." },
    {
      k: "plans",
      q: "What could you do tomorrow?",
      hint: plans.length ? `You have planned: ${plans.map((x) => x.title).join(", ")}` : "The gym, family time, a beautiful breakfast…",
    },
    {
      k: "goals",
      q: "Which goal does tonight protect?",
      hint: [p.goals.slice(0, 2).join(", "), funds.map((f) => f.name).join(", ")].filter(Boolean).join(" · ") || "Your goals, your peace, your future.",
    },
    { k: "calm", q: "How would staying steady tonight help your relationships and your peace?", hint: "Emotional stability is something you've been building." },
  ];
  const qs = path === "a" ? A : B;

  return (
    <div>
      <PageHeader
        back
        eyebrow="Play the tape forward"
        title="Two possible nights."
        subtitle="No scare tactics. Just your own experience and your own values, side by side."
      />
      <Segmented<Path>
        value={path}
        onChange={setPath}
        options={[
          { value: "a", label: "Path A · Drinking tonight" },
          { value: "b", label: "Path B · Protecting tonight" },
        ]}
      />

      {path === "a" && (pastLapses.length > 0 || drankCravings > 0) && (
        <Card className="mt-5 bg-surface-2">
          <div className="eyebrow mb-2">From your own reflections</div>
          {pastLapses.map((j) => (
            <p key={j.id} className="mb-2 text-[15px] leading-relaxed text-ink-2">
              “{j.fields.learned || j.fields.happened || ""}”
            </p>
          ))}
        </Card>
      )}

      <div className="mt-6 space-y-6">
        {qs.map((x) => (
          <div key={path + x.k}>
            <div className="font-serif text-xl leading-snug">{x.q}</div>
            <div className="mb-2 mt-1 text-sm text-ink-3">{x.hint}</div>
            <TextArea voice rows={2} value={answers[path + x.k] ?? ""} onChange={(v) => set(path + x.k, v)} />
          </div>
        ))}
      </div>

      {path === "a" ? (
        <Button className="mt-8" full variant="outline" onClick={() => setPath("b")}>
          Now play Path B
        </Button>
      ) : (
        <div className="mt-10">
          <div className="font-serif text-2xl">Which night do you choose?</div>
          <p className="mt-1 text-sm text-ink-3">It&apos;s your decision. You&apos;ve seen both clearly.</p>
          <div className="mt-4 grid gap-2">
            <Button
              size="lg"
              onClick={() => {
                setChosen("b");
                update((v) => ({
                  ...v,
                  journal: [...v.journal, { id: uid(), kind: "reflection", createdAt: new Date().toISOString(), title: "Played the tape forward", fields: answers }],
                }));
              }}
            >
              Path B. I&apos;m protecting tonight
            </Button>
            <Button variant="ghost" href="/clarity/chat?topic=craving">
              I&apos;m still torn. Talk it through
            </Button>
          </div>
          {chosen === "b" && (
            <Card className="mt-6 border-forest/30 bg-forest-soft">
              <div className="font-serif text-2xl">Make tonight something your future self will appreciate.</div>
              <div className="mt-4 flex gap-2">
                <Button href="/future/sober-life" size="sm">
                  Plan tonight
                </Button>
                <Button href="/today" size="sm" variant="outline">
                  Back to today
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
