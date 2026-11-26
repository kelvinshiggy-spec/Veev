"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button, Card, Label, PageHeader, Segmented, TextArea } from "@/components/ui";
import { cx, uid } from "@/lib/util";

const QS = [
  "Was I honest with myself?",
  "Did I communicate respectfully?",
  "Did I act according to my values?",
  "Did I make assumptions without enough information?",
  "Did I consider other perspectives?",
  "Did I take responsibility where appropriate?",
  "Did I seek reassurance instead of tolerating uncertainty?",
  "Did I respect my own boundaries?",
  "Did I protect my sobriety?",
  "Is there anything I want to repair tomorrow?",
] as const;

const OPTS = ["Yes", "Partly", "Not this time"];

export default function Accountability() {
  const { update } = useStore();
  const [period, setPeriod] = useState<"day" | "week">("day");
  const [a, setA] = useState<Record<string, string>>({});
  const [repair, setRepair] = useState("");
  const [done, setDone] = useState(false);
  const notYet = Object.values(a).filter((x) => x === "Not this time").length;

  if (done)
    return (
      <div>
        <PageHeader back="/journey" eyebrow="Honest check-in" title="Thank you for being honest." />
        <Card>
          <p className="text-[17px] leading-relaxed">
            {notYet === 0
              ? "That was a strong stretch. Notice what helped, so you can do it again."
              : "Honesty like this is how people grow. A few 'not this time' answers don't make you a bad person. They show you where to put your care next."}
          </p>
          {repair && <p className="mt-3 text-[15px] text-ink-2">You named something to repair. When you're calm, Pause Before Sending can help you find the words.</p>}
        </Card>
        <div className="mt-4 grid gap-2">
          {repair && <Button href="/clarity/send">Draft a repair message</Button>}
          <Button href="/journey" variant="ghost">
            Done
          </Button>
        </div>
      </div>
    );

  return (
    <div>
      <PageHeader back="/journey" eyebrow="Personal accountability" title="An honest look, without the harshness." subtitle="No scores. Just noticing." />
      <Segmented
        value={period}
        onChange={setPeriod}
        options={[
          { value: "day", label: "Today" },
          { value: "week", label: "This week" },
        ]}
      />
      <div className="mt-6 space-y-5">
        {QS.map((q) => (
          <div key={q}>
            <Label>{q}</Label>
            <div className="flex gap-2">
              {OPTS.map((o) => (
                <button
                  key={o}
                  onClick={() => setA({ ...a, [q]: o })}
                  className={cx("flex-1 rounded-full border py-2 text-sm", a[q] === o ? "border-forest bg-forest text-on-forest" : "border-line bg-surface text-ink-2")}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div>
          <Label hint="Optional. Only if something comes to mind.">Is there anything I want to repair?</Label>
          <TextArea rows={3} value={repair} onChange={setRepair} />
        </div>
        <Button
          full
          size="lg"
          onClick={() => {
            update((v) => ({
              ...v,
              journal: [...v.journal, { id: uid(), kind: "accountability", createdAt: new Date().toISOString(), title: period === "day" ? "Daily honest check-in" : "Weekly honest check-in", fields: { ...a, "Anything to repair": repair } }],
            }));
            setDone(true);
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
