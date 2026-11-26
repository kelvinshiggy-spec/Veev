"use client";

import { useState } from "react";
import { Copy, Check, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, Card, Chips, Input, Label, Notice, PageHeader, Section, TextArea, Pill } from "@/components/ui";
import { AiErrorNote, AiNotice, useAiReady } from "@/components/ai-gate";
import { callClarityJson, type AiError } from "@/lib/ai";
import { detectEscalation, LOCAL_FRAMES, type Flag } from "@/lib/escalation";
import { screen } from "@/lib/safety";
import { useSafety } from "@/components/safety";
import { fmtDate, uid } from "@/lib/util";

const STYLES = ["Calm and direct", "Emotionally honest", "Respectful but firm", "Boundary-setting", "Accountability-focused", "Apologetic", "Requesting space"];

interface Rewrite {
  flags: Flag[];
  versions: { style: string; text: string }[];
  notes: string;
}

export default function PauseBeforeSending() {
  const { vault, update } = useStore();
  const ready = useAiReady();
  const safety = useSafety();
  const [to, setTo] = useState("");
  const [msg, setMsg] = useState("");
  const [styles, setStyles] = useState<string[]>(["Calm and direct", "Respectful but firm", "Requesting space"]);
  const [checked, setChecked] = useState<Flag[] | null>(null);
  const [result, setResult] = useState<Rewrite>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AiError>();
  const [copied, setCopied] = useState<string>();

  const check = async () => {
    const f = detectEscalation(msg);
    setChecked(f);
    setResult(undefined);
    const s = screen(msg);
    if (s.includes("abuse")) safety.open("abuse");
    if (!ready) return;
    setBusy(true);
    setError(undefined);
    const r = await callClarityJson<Rewrite>({ task: "rewrite", text: msg, context: to ? `Recipient: ${to}` : "", styles });
    setBusy(false);
    if (r.error) setError(r.error);
    if (r.data) setResult(r.data);
  };

  const saveDraft = (text?: string, style?: string) => {
    update((v) => ({ ...v, drafts: [{ id: uid(), to, original: msg, rewritten: text, style, createdAt: new Date().toISOString() }, ...v.drafts] }));
  };

  const copy = async (t: string) => {
    try {
      await navigator.clipboard.writeText(t);
      setCopied(t);
      setTimeout(() => setCopied(undefined), 1500);
    } catch {}
  };

  const flags = result?.flags?.length ? result.flags : checked;

  return (
    <div>
      <PageHeader back="/clarity" eyebrow="Pause before sending" title="Say it in a way that protects you." subtitle="Nothing is ever sent from here. You copy what you choose, when you're ready." />

      <div className="space-y-5">
        <div>
          <Label>To (optional)</Label>
          <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Who is this for?" />
        </div>
        <div>
          <Label>Your message, exactly as you want to send it</Label>
          <TextArea voice rows={7} value={msg} onChange={setMsg} />
        </div>
        {ready && (
          <div>
            <Label hint="Pick the tones you'd like to see.">Rewrite styles</Label>
            <Chips options={STYLES} value={styles} onChange={setStyles} />
          </div>
        )}
        <AiNotice compact />
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={check} disabled={!msg.trim() || busy}>
            {busy ? "Reading…" : ready ? "Check & rewrite" : "Check my message"}
          </Button>
          <Button variant="outline" onClick={() => saveDraft()} disabled={!msg.trim()}>
            Save unsent
          </Button>
        </div>
      </div>

      {flags && (
        <Section title="What might escalate" className="mt-8">
          {flags.length === 0 ? (
            <Notice tone="forest">Nothing obviously escalating. Still worth asking: does this need to be sent tonight?</Notice>
          ) : (
            <div className="space-y-2">
              {flags.map((f, i) => (
                <div key={i} className="rounded-2xl bg-rose-soft px-4 py-3">
                  <div className="font-medium text-rose">“{f.phrase}”</div>
                  <div className="text-sm text-ink-2">{f.why}</div>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      <AiErrorNote error={error} />

      {result && (
        <Section title="Versions" className="mt-6">
          {result.notes && <p className="mb-3 text-[15px] leading-relaxed text-ink-2">{result.notes}</p>}
          <div className="space-y-3">
            {result.versions.map((v) => (
              <Card key={v.style}>
                <Pill tone="gold">{v.style}</Pill>
                <p className="mt-3 whitespace-pre-wrap text-[15.5px] leading-relaxed">{v.text}</p>
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="soft" onClick={() => copy(v.text)}>
                    {copied === v.text ? <Check size={14} /> : <Copy size={14} />} Copy
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => saveDraft(v.text, v.style)}>
                    Save as draft
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {checked && !ready && (
        <Section title="Starting points" className="mt-6">
          <div className="space-y-2">
            {LOCAL_FRAMES.map((f) => (
              <Card key={f.style}>
                <Pill>{f.style}</Pill>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{f.frame}</p>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {vault.drafts.length > 0 && (
        <Section title="Unsent drafts" className="mt-10">
          <div className="space-y-2">
            {vault.drafts.slice(0, 15).map((d) => (
              <details key={d.id} className="card p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <span className="truncate text-[15px]">{d.to ? `To ${d.to}: ` : ""}{(d.rewritten ?? d.original).slice(0, 60)}</span>
                  <span className="shrink-0 text-xs text-ink-3">{fmtDate(d.createdAt)}</span>
                </summary>
                {d.rewritten && <p className="mt-3 whitespace-pre-wrap text-[15px]">{d.rewritten}</p>}
                <p className="mt-3 whitespace-pre-wrap text-sm text-ink-3">Original: {d.original}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="soft" onClick={() => copy(d.rewritten ?? d.original)}>
                    <Copy size={14} /> Copy
                  </Button>
                  <button onClick={() => update((v) => ({ ...v, drafts: v.drafts.filter((x) => x.id !== d.id) }))} className="ml-auto inline-flex items-center gap-1 text-xs text-ink-3">
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
