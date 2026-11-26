"use client";

import { cheer } from "@/components/cheer";
import { useEffect, useState } from "react";
import { Mic, Sparkles, Check, Moon } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, PageHeader, TextArea, Notice } from "@/components/ui";
import { useCompanionName } from "@/components/companion-name";
import { useAiReady, AiErrorNote } from "@/components/ai-gate";
import { streamClarity, type AiError } from "@/lib/ai";
import { screen, INTERRUPTING } from "@/lib/safety";
import { useSafety } from "@/components/safety";
import { speakAsCompanion, stopSpeaking, speechSupported } from "@/lib/voice";
import { dayKey, uid } from "@/lib/util";

const QUESTIONS = [
  { k: "best", q: "What was the best part of today?" },
  { k: "challenge", q: "What challenged you?" },
  { k: "cravings", q: "Any cravings? How did you respond?" },
  { k: "proud", q: "What are you proud of?" },
  { k: "bothering", q: "Is anything still bothering you?" },
  { k: "tomorrow", q: "What would make tomorrow enjoyable?" },
];

export default function EveningEdition() {
  const { vault, update } = useStore();
  const cn = useCompanionName();
  const ready = useAiReady();
  const safety = useSafety();
  const [a, setA] = useState<Record<string, string>>({});
  const [i, setI] = useState(0);
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AiError>();
  const [saved, setSaved] = useState(false);
  useEffect(() => () => stopSpeaking(), []);

  const q = QUESTIONS[i];
  const finished = i >= QUESTIONS.length;
  const name = vault.profile.name || "Veev";

  const ask = (idx: number) => {
    if (speechSupported() && QUESTIONS[idx]) speakAsCompanion(QUESTIONS[idx].q, vault.companion);
  };

  const next = () => {
    const t = a[q.k] ?? "";
    const flags = screen(t).filter((f) => INTERRUPTING.includes(f));
    if (flags.length) safety.open(flags[0]);
    setI(i + 1);
  };

  const text = () =>
    QUESTIONS.filter((x) => a[x.k]?.trim())
      .map((x) => `${x.q}\n${a[x.k].trim()}`)
      .join("\n\n");

  const summarize = async () => {
    setBusy(true);
    setError(undefined);
    const r = await streamClarity({ task: "evening", text: text() }, setSummary);
    setBusy(false);
    if (r.error) setError(r.error);
  };

  const save = () => {
    // Saved only when she taps save.
    update((v) => ({
      ...v,
      journal: [...v.journal, { id: uid(), kind: "evening", createdAt: new Date().toISOString(), title: `Evening · ${dayKey()}`, fields: { ...a, ...(summary ? { summary } : {}) } }],
    }));
    setSaved(true);
    cheer("journal");
  };

  return (
    <div className="dusk page-in -mx-5 -mt-6 min-h-[calc(100dvh-3.5rem)] px-5 pb-28 pt-6">
      <PageHeader back="/today" eyebrow="The Evening Edition" title={`Wind down, ${name}.`} subtitle={<span className="text-[#e8e0d0]">Two minutes. Answer what you want, skip what you don&apos;t.</span>} />

      {!finished ? (
        <div key={q.k} className="fade-in">
          <div className="mb-3 flex gap-1">
            {QUESTIONS.map((x, n) => (
              <div key={x.k} className={`h-[3px] flex-1 rounded-full ${n <= i ? "bg-[#d6b77a]" : "bg-white/15"}`} />
            ))}
          </div>
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-serif text-[30px] leading-tight text-[#f7f3e9]">{q.q}</h2>
            {speechSupported() && (
              <button onClick={() => ask(i)} aria-label={`${cn} asks`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10">
                <Mic size={16} />
              </button>
            )}
          </div>
          <div className="mt-5 [&_textarea]:bg-white/5 [&_textarea]:text-[#f7f3e9] [&_textarea]:border-white/15">
            <TextArea voice rows={4} value={a[q.k] ?? ""} onChange={(v) => setA({ ...a, [q.k]: v })} placeholder="Say it or type it…" />
          </div>
          <div className="mt-6 flex justify-between">
            <button className="text-sm opacity-70" onClick={() => setI(i + 1)}>
              Skip
            </button>
            <Button onClick={next}>{i === QUESTIONS.length - 1 ? "Done" : "Next"}</Button>
          </div>
        </div>
      ) : (
        <div className="fade-in space-y-4">
          <div className="flex items-center gap-2 font-serif text-3xl text-[#f7f3e9]">
            <Moon size={22} /> That&apos;s a wrap on today.
          </div>
          {summary ? (
            <div className="rounded-3xl bg-white/8 p-5 text-[16px] leading-relaxed text-[#efe9dd]">{summary}</div>
          ) : (
            <div className="space-y-3 rounded-3xl bg-white/5 p-5 text-[15px] text-[#e8e0d0]">
              {QUESTIONS.filter((x) => a[x.k]?.trim()).map((x) => (
                <div key={x.k}>
                  <div className="text-xs uppercase tracking-wide opacity-60">{x.q}</div>
                  <div>{a[x.k]}</div>
                </div>
              ))}
              {!Object.values(a).some((x) => x.trim()) && <div>No notes tonight, and that&apos;s fine. Rest well.</div>}
            </div>
          )}
          {ready && Object.values(a).some((x) => x.trim()) && !summary && (
            <Button variant="soft" full onClick={summarize} disabled={busy}>
              <Sparkles size={15} /> {busy ? "Writing…" : `Have ${cn} turn this into a journal entry`}
            </Button>
          )}
          <AiErrorNote error={error} />
          {Object.values(a).some((x) => x.trim()) && (
            <Button full onClick={save} disabled={saved}>
              {saved ? (
                <>
                  <Check size={15} /> Saved privately
                </>
              ) : (
                "Save to my journal"
              )}
            </Button>
          )}
          <Notice tone="forest">Nothing is saved unless you tap save. If tonight feels heavy, the Help button is right at the top.</Notice>
          <Button href="/voice" variant="ghost" full>
            <Mic size={15} /> Talk it through with {cn}
          </Button>
        </div>
      )}
    </div>
  );
}
