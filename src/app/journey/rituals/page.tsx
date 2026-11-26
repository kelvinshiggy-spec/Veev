"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button, Card, Label, PageHeader, Segmented, TextArea, Toggle, Sheet } from "@/components/ui";
import { dayKey, uid } from "@/lib/util";
import { screen, INTERRUPTING } from "@/lib/safety";
import { useSafety } from "@/components/safety";

const MORNING = [
  ["feeling", "How are you feeling?"],
  ["forward", "What are you looking forward to?"],
  ["intention", "What is today's intention?"],
  ["accomplish", "What do you want to accomplish?"],
  ["peace", "How will you protect your peace?"],
  ["reason", "What is one reason to stay sober today?"],
] as const;

const EVENING = [
  ["well", "What went well?"],
  ["challenge", "What challenged you?"],
  ["cravings", "Did you experience cravings?"],
  ["respond", "How did you respond?"],
  ["proud", "What are you proud of?"],
  ["differently", "Anything you want to handle differently tomorrow?"],
  ["protect", "What is one thing worth protecting?"],
] as const;

export default function RitualsPage() {
  return (
    <Suspense>
      <Rituals />
    </Suspense>
  );
}

function Rituals() {
  const params = useSearchParams();
  const { vault, update } = useStore();
  const safety = useSafety();
  const [which, setWhich] = useState<"morning" | "evening">("morning");
  useEffect(() => {
    if (params.get("evening")) setWhich("evening");
    else if (new Date().getHours() >= 17) setWhich("evening");
  }, [params]);
  const [ans, setAns] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [customize, setCustomize] = useState(false);
  const hidden = vault.settings.ritualHidden;
  const qs = (which === "morning" ? MORNING : EVENING).filter(([k]) => !hidden.includes(`${which}.${k}`));
  const today = dayKey();
  const alreadyToday = vault.journal.some((j) => j.kind === which && j.createdAt.startsWith(today));

  const save = () => {
    update((v) => ({
      ...v,
      journal: [...v.journal, { id: uid(), kind: which, createdAt: new Date().toISOString(), title: which === "morning" ? "Morning ritual" : "Evening ritual", fields: ans }],
      intentions: which === "morning" && ans.intention ? { ...v.intentions, [today]: ans.intention } : v.intentions,
      habits: v.habits.map((h) => (h.name.toLowerCase() === `${which} ritual` ? { ...h, log: { ...h.log, [today]: true } } : h)),
    }));
    const flags = screen(Object.values(ans).join(" ")).filter((k) => INTERRUPTING.includes(k));
    if (flags.length) safety.open(flags[0]);
    setDone(true);
  };

  return (
    <div>
      <PageHeader
        back="/journey"
        eyebrow="Rituals"
        title={which === "morning" ? "Begin on purpose." : "Close the day gently."}
        subtitle="A few minutes. Skip anything."
        action={
          <Button size="sm" variant="ghost" onClick={() => setCustomize(true)}>
            Customize
          </Button>
        }
      />
      <Segmented
        value={which}
        onChange={(v) => {
          setWhich(v);
          setAns({});
          setDone(false);
        }}
        options={[
          { value: "morning", label: "Morning" },
          { value: "evening", label: "Evening" },
        ]}
      />
      {alreadyToday && !done && <p className="mt-3 text-sm text-ink-3">You already did this today. Another one is welcome.</p>}

      {done ? (
        <Card className="fade-in mt-6 border-forest/30 bg-forest-soft">
          <div className="font-serif text-3xl">{which === "morning" ? "Go have a beautiful day." : "Rest well. Tomorrow is yours."}</div>
          {which === "morning" && ans.intention && <p className="mt-2 text-[15px] text-ink-2">Today&apos;s intention: {ans.intention}</p>}
          <Button href="/today" size="sm" className="mt-4">
            Back to today
          </Button>
        </Card>
      ) : (
        <div className="mt-6 space-y-6">
          {qs.map(([k, q]) => (
            <div key={k}>
              <Label>{q}</Label>
              <TextArea voice rows={2} value={ans[k] ?? ""} onChange={(v) => setAns({ ...ans, [k]: v })} />
            </div>
          ))}
          <Button full size="lg" onClick={save}>
            Save
          </Button>
        </div>
      )}

      <Sheet open={customize} onClose={() => setCustomize(false)} title="Customize questions">
        {[...MORNING.map(([k, q]) => ["morning", k, q]), ...EVENING.map(([k, q]) => ["evening", k, q])].map(([w, k, q]) => {
          const key = `${w}.${k}`;
          return (
            <Toggle
              key={key}
              label={q}
              hint={w === "morning" ? "Morning" : "Evening"}
              checked={!hidden.includes(key)}
              onChange={(on) =>
                update((v) => ({
                  ...v,
                  settings: { ...v.settings, ritualHidden: on ? v.settings.ritualHidden.filter((x) => x !== key) : [...v.settings.ritualHidden, key] },
                }))
              }
            />
          );
        })}
      </Sheet>
    </div>
  );
}
