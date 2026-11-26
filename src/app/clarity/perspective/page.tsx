"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useSafety } from "@/components/safety";
import { Button, Card, PageHeader, TextArea, Progress } from "@/components/ui";
import { AiErrorNote, NotTherapy, useAiReady } from "@/components/ai-gate";
import { buildContext, companionPayload, streamClarity, type AiError } from "@/lib/ai";
import { screen } from "@/lib/safety";
import { uid } from "@/lib/util";

const QS = [
  ["what", "What happened?", "Briefly, in your own words."],
  ["observed", "What did you directly observe?", "Only what a camera would have recorded. Words said, actions taken."],
  ["feeling", "What are you feeling?", "Name the emotions, and how strong."],
  ["interpret", "What are you interpreting?", "What do you think it means? What are you telling yourself?"],
  ["support", "What evidence supports your interpretation?", ""],
  ["challenge", "What evidence might challenge it?", ""],
  ["missing", "What information is missing?", "What don't you know yet?"],
  ["other", "Is there another reasonable explanation?", "Even one you don't fully believe."],
  ["mine", "What responsibility, if any, belongs to you?", "Only yours. Not everything."],
  ["values", "What response aligns with your values?", "Who do you want to be in this?"],
] as const;

export default function Perspective() {
  const { vault, update } = useStore();
  const safety = useSafety();
  const ready = useAiReady();
  const [i, setI] = useState(0);
  const [a, setA] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AiError>();
  const q = QS[i];

  const finish = () => {
    update((v) => ({ ...v, journal: [...v.journal, { id: uid(), kind: "perspective", createdAt: new Date().toISOString(), title: a.what?.slice(0, 60), fields: a }] }));
    setDone(true);
  };

  const ask = async () => {
    const text = QS.map(([k, label]) => `${label}\n${a[k] || "(skipped)"}`).join("\n\n");
    setBusy(true);
    setError(undefined);
    const res = await streamClarity({ task: "room", mode: "challenge", text, directness: vault.profile.directness, context: buildContext(vault), companion: companionPayload(vault), safety: screen(text) }, setReply);
    setBusy(false);
    if (res.error) setError(res.error);
  };

  if (done)
    return (
      <div>
        <PageHeader back="/clarity" eyebrow="Check the facts" title="You looked at it from more than one side." subtitle="That's not about deciding you were wrong. It's about responding in a way you'll respect tomorrow." />
        <Card>
          <div className="eyebrow mb-2">Your values-based response</div>
          <p className="text-[17px] leading-relaxed">{a.values || "You can come back to this when you're ready."}</p>
        </Card>
        {ready && !reply && (
          <Button full variant="outline" className="mt-4" onClick={ask} disabled={busy}>
            {busy ? "Thinking…" : "Ask for another view"}
          </Button>
        )}
        {reply && <Card className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed">{reply}</Card>}
        <div className="mt-3">
          <AiErrorNote error={error} />
        </div>
        <div className="mt-6 grid gap-2">
          <Button href="/clarity/send" variant="soft">
            Draft a message
          </Button>
          <Button href="/clarity/pause" variant="soft">
            Pause before acting
          </Button>
          <Button href="/clarity" variant="ghost">
            Done
          </Button>
        </div>
        <div className="mt-4">
          <NotTherapy />
        </div>
      </div>
    );

  return (
    <div>
      <PageHeader back="/clarity" eyebrow={`Check the facts · ${i + 1} of ${QS.length}`} title={q[1]} subtitle={q[2] || undefined} />
      <Progress value={((i + 1) / QS.length) * 100} className="mb-6" />
      <TextArea voice key={q[0]} rows={5} value={a[q[0]] ?? ""} onChange={(v) => setA({ ...a, [q[0]]: v })} autoFocus />
      <div className="mt-6 flex items-center gap-2">
        {i > 0 && (
          <Button variant="ghost" onClick={() => setI(i - 1)}>
            Back
          </Button>
        )}
        <div className="flex-1" />
        <Button variant="ghost" onClick={() => (i < QS.length - 1 ? setI(i + 1) : finish())}>
          Skip
        </Button>
        <Button onClick={() => (i < QS.length - 1 ? setI(i + 1) : finish())}>{i < QS.length - 1 ? "Next" : "Finish"}</Button>
      </div>

      <button onClick={() => safety.open("psychosis")} className="mt-10 block w-full text-center text-sm text-ink-3 underline">
        I&apos;m not sure what&apos;s real right now
      </button>
    </div>
  );
}
