"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, Card, Chips, PageHeader, Section, TextArea, Toggle, Pill } from "@/components/ui";
import { AiErrorNote, AiNotice, NotTherapy, useAiReady } from "@/components/ai-gate";
import { buildContext, streamClarity, type AiError } from "@/lib/ai";
import { screen, INTERRUPTING } from "@/lib/safety";
import { useSafety } from "@/components/safety";
import { fmtDate, fmtTime, uid } from "@/lib/util";
import type { JournalEntry } from "@/lib/types";

const MODES: { v: string; label: string }[] = [
  { v: "listen", label: "Just listen" },
  { v: "understand", label: "Help me understand" },
  { v: "challenge", label: "Challenge my perspective" },
  { v: "calm", label: "Help me calm down" },
  { v: "decide", label: "Help me make a decision" },
  { v: "accountability", label: "Help me take accountability" },
  { v: "sober", label: "Help me avoid drinking" },
  { v: "therapy", label: "Prepare this for therapy" },
];

export default function Room() {
  const { vault, update } = useStore();
  const safety = useSafety();
  const ready = useAiReady();
  const [text, setText] = useState("");
  const [mode, setMode] = useState("listen");
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AiError>();
  const [savedId, setSavedId] = useState<string>();
  const [forTherapy, setForTherapy] = useState(false);
  const entries = vault.journal.filter((j) => j.kind === "room").sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const submit = async () => {
    if (!text.trim()) return;
    const flags = screen(text);
    const interrupting = flags.filter((f) => INTERRUPTING.includes(f));
    if (interrupting.length) safety.open(interrupting[0]);
    const id = savedId ?? uid();
    const entry: JournalEntry = {
      id,
      kind: "room",
      createdAt: new Date().toISOString(),
      mode,
      fields: { text },
      forTherapy: forTherapy || mode === "therapy",
    };
    update((v) => ({ ...v, journal: [...v.journal.filter((j) => j.id !== id), entry] }));
    setSavedId(id);
    if (mode === "listen" || !ready) {
      setReply("");
      return;
    }
    setBusy(true);
    setError(undefined);
    const res = await streamClarity(
      { task: "room", mode, text, directness: vault.profile.directness, context: buildContext(vault), safety: flags },
      setReply,
    );
    setBusy(false);
    if (res.error) setError(res.error);
    if (res.text) update((v) => ({ ...v, journal: v.journal.map((j) => (j.id === id ? { ...j, aiResponse: res.text } : j)) }));
  };

  const fresh = () => {
    setText("");
    setReply("");
    setSavedId(undefined);
    setForTherapy(false);
  };

  return (
    <div>
      <PageHeader back="/clarity" eyebrow="The Private Room" title="Say all of it." subtitle="Anger, jealousy, sadness, excitement, confusion. Nothing here is judged, and nothing leaves this room unless you choose." />

      {savedId && !busy && (mode === "listen" || !ready) && !reply ? (
        <Card className="fade-in border-forest/30 bg-forest-soft">
          <div className="font-serif text-2xl">It&apos;s here. You don&apos;t have to do anything else with it.</div>
          <p className="mt-2 text-[15px] text-ink-2">Saved privately. If you want, you can ask for a different kind of response.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setSavedId(undefined)}>
              Keep writing
            </Button>
            <Button size="sm" variant="ghost" onClick={fresh}>
              Start fresh
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <TextArea voice rows={10} value={text} onChange={setText} placeholder="Start anywhere…" aria-label="Write freely" />
          <Section title="What would help right now?" className="mt-5">
            <Chips options={MODES.map((m) => m.label)} value={[MODES.find((m) => m.v === mode)!.label]} multi={false} onChange={(v) => v[0] && setMode(MODES.find((m) => m.label === v[0])!.v)} />
          </Section>
          <Toggle checked={forTherapy} onChange={setForTherapy} label="Flag for therapy" hint="Adds this to things to discuss. Only you see it." />
          {mode !== "listen" && <AiNotice compact />}
          <Button full size="lg" className="mt-4" onClick={submit} disabled={!text.trim() || busy}>
            {mode === "listen" ? "Let it out" : busy ? "Clarity is reading…" : "Save and respond"}
          </Button>
        </>
      )}

      {(reply || busy) && (
        <Card className="fade-in mt-6">
          <Pill tone="gold">{MODES.find((m) => m.v === mode)?.label}</Pill>
          <div className="mt-3 whitespace-pre-wrap text-[15.5px] leading-relaxed">{reply || "…"}</div>
          {!busy && (
            <div className="mt-5 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={fresh}>
                Done
              </Button>
              <Button size="sm" variant="ghost" href="/clarity/chat">
                Keep talking
              </Button>
              <Button size="sm" variant="ghost" href="/clarity/send">
                Draft a message
              </Button>
            </div>
          )}
        </Card>
      )}
      <div className="mt-3">
        <AiErrorNote error={error} />
      </div>
      <div className="mt-4">
        <NotTherapy />
      </div>

      {entries.length > 0 && (
        <Section title="Your room" className="mt-10">
          <div className="space-y-2">
            {entries.slice(0, 20).map((e) => (
              <details key={e.id} className="card group p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <span className="truncate text-[15px]">{e.fields.text?.slice(0, 80)}</span>
                  <span className="shrink-0 text-xs text-ink-3">
                    {fmtDate(e.createdAt)} {fmtTime(e.createdAt)}
                  </span>
                </summary>
                <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-2">{e.fields.text}</p>
                {e.aiResponse && <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-surface-2 p-3 text-sm leading-relaxed">{e.aiResponse}</p>}
                <div className="mt-3 flex items-center gap-3">
                  {e.forTherapy && <Pill tone="forest">For therapy</Pill>}
                  <button
                    onClick={() => update((v) => ({ ...v, journal: v.journal.filter((j) => j.id !== e.id) }))}
                    className="ml-auto inline-flex items-center gap-1 text-xs text-ink-3 hover:text-rose"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </details>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
