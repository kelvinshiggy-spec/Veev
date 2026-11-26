"use client";

import { useState } from "react";
import { Check, Trash2, Share2, Copy } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, Card, Input, Label, Notice, PageHeader, Section, Sheet, TextArea, Segmented } from "@/components/ui";
import { AiErrorNote, useAiReady } from "@/components/ai-gate";
import { streamClarity, type AiError } from "@/lib/ai";
import { cx, fmtDate, fmtTime, uid } from "@/lib/util";
import type { Therapy, TherapyItem, Vault } from "@/lib/types";
import { sobrietyStats } from "@/lib/sobriety";

type ListKey = "homework" | "skills" | "questions" | "takeaways" | "goals";
const LISTS: { k: ListKey; title: string; ph: string; check?: boolean }[] = [
  { k: "questions", title: "Questions for my therapist", ph: "Something to ask" },
  { k: "homework", title: "Homework", ph: "Assigned practice", check: true },
  { k: "goals", title: "My therapy goals", ph: "What I'm working on" },
  { k: "takeaways", title: "Takeaways", ph: "Something worth remembering" },
  { k: "skills", title: "Skills I've learned", ph: "A skill" },
];

function draftSummary(v: Vault, sinceISO: string) {
  const since = sinceISO.slice(0, 10);
  const ci = v.checkIns.filter((c) => c.date >= since);
  const emo: Record<string, number> = {};
  ci.forEach((c) => c.emotions.forEach((e) => (emo[e] = (emo[e] ?? 0) + 1)));
  const cr = v.cravings.filter((c) => c.at >= sinceISO);
  const room = v.journal.filter((j) => j.createdAt >= sinceISO && (j.forTherapy || j.kind === "perspective" || j.kind === "reflection"));
  const studio = v.journal.filter((j) => j.createdAt >= sinceISO && j.kind === "studio").map((j) => j.title);
  const s = sobrietyStats(v);
  const lines = [
    `Since ${fmtDate(since, { month: "long", day: "numeric" })}`,
    "",
    "Significant emotions",
    Object.entries(emo).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([e, n]) => `- ${e} (${n} check-ins)`).join("\n") || "- (none recorded)",
    "",
    "Cravings",
    cr.length ? `- ${cr.length} craving moments. ${cr.filter((c) => c.outcome === "passed" || c.outcome === "eased").length} passed or eased.${cr.some((c) => c.outcome === "drank") ? " At least one lapse." : ""}` : "- None recorded",
    cr.length ? `- Triggers: ${[...new Set(cr.flatMap((c) => c.trigger.split(" · ")).filter(Boolean))].slice(0, 5).join(", ")}` : "",
    `- Current sober stretch: ${s.current} days (${s.total} total)`,
    "",
    "Difficult situations / things to discuss",
    room.map((j) => `- ${j.title || (j.fields.text ?? j.fields.what ?? "").slice(0, 120)}`).join("\n") || "- (none flagged)",
    "",
    "What helped",
    studio.length ? [...new Set(studio)].map((t) => `- ${t}`).join("\n") : "- (add here)",
    "",
    "Things I'm proud of",
    "- ",
    "",
    "Questions I want to ask",
    v.therapy.questions.filter((q) => !q.done).map((q) => `- ${q.text}`).join("\n") || "- ",
  ];
  return lines.filter((l) => l !== undefined).join("\n");
}

export default function TherapyPage() {
  const { vault, update } = useStore();
  const ready = useAiReady();
  const t = vault.therapy;
  const [appt, setAppt] = useState<{ at: string; with: string } | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [prep, setPrep] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AiError>();
  const [tab, setTab] = useState<"plan" | "prep">("plan");
  const [nowMs] = useState(() => Date.now());
  const now = new Date(nowMs).toISOString();
  const upcoming = t.appointments.filter((a) => a.at >= now).sort((a, b) => a.at.localeCompare(b.at));
  const last = t.appointments.filter((a) => a.at < now).sort((a, b) => b.at.localeCompare(a.at))[0];
  const since = last?.at ?? new Date(nowMs - 14 * 86400_000).toISOString();
  const flagged = vault.journal.filter((j) => j.forTherapy).slice(-8).reverse();

  const setT = (fn: (t: Therapy) => Therapy) => update((v) => ({ ...v, therapy: fn(v.therapy) }));
  const addItem = (k: ListKey) => {
    const text = drafts[k]?.trim();
    if (!text) return;
    setT((x) => ({ ...x, [k]: [...x[k], { id: uid(), text, createdAt: new Date().toISOString() } satisfies TherapyItem] }));
    setDrafts({ ...drafts, [k]: "" });
  };

  return (
    <div>
      <PageHeader back="/me" eyebrow="My actual therapy" title="Make every session count." subtitle="VEEV supports your therapy. It doesn't replace it." />
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: "plan", label: "My therapy" },
          { value: "prep", label: "Prepare for a session" },
        ]}
      />

      {tab === "plan" ? (
        <div className="mt-6">
          <Section title="Appointments" action={<Button size="sm" variant="ghost" onClick={() => setAppt({ at: "", with: "" })}>Add</Button>}>
            {upcoming.length === 0 ? (
              <p className="text-sm text-ink-3">No upcoming appointments saved.</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((a) => (
                  <Card key={a.id} className="flex items-center justify-between !p-4">
                    <div>
                      <div className="font-medium">{a.with || "Therapy"}</div>
                      <div className="text-sm text-ink-3">
                        {fmtDate(a.at, { weekday: "long", month: "short", day: "numeric" })} · {fmtTime(a.at)}
                      </div>
                    </div>
                    <button onClick={() => setT((x) => ({ ...x, appointments: x.appointments.filter((y) => y.id !== a.id) }))} className="text-ink-3" aria-label="Remove appointment">
                      <Trash2 size={15} />
                    </button>
                  </Card>
                ))}
              </div>
            )}
          </Section>

          {flagged.length > 0 && (
            <Section title="Worth discussing">
              <div className="space-y-2">
                {flagged.map((j) => (
                  <div key={j.id} className="flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3 text-sm">
                    <span className="flex-1 truncate">{j.title || j.fields.text?.slice(0, 80)}</span>
                    <span className="text-xs text-ink-3">{fmtDate(j.createdAt)}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {LISTS.map((l) => (
            <Section key={l.k} title={l.title}>
              <div className="space-y-2">
                {t[l.k].map((i) => (
                  <div key={i.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
                    {l.check && (
                      <button
                        onClick={() => setT((x) => ({ ...x, [l.k]: x[l.k].map((y) => (y.id === i.id ? { ...y, done: !y.done } : y)) }))}
                        className={cx("grid h-6 w-6 shrink-0 place-items-center rounded-full border", i.done ? "border-forest bg-forest text-on-forest" : "border-line")}
                        aria-label="Toggle done"
                      >
                        {i.done && <Check size={12} />}
                      </button>
                    )}
                    <span className={cx("flex-1 text-[15px]", i.done && "text-ink-3 line-through")}>{i.text}</span>
                    <button onClick={() => setT((x) => ({ ...x, [l.k]: x[l.k].filter((y) => y.id !== i.id) }))} className="text-ink-3" aria-label="Remove">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input value={drafts[l.k] ?? ""} onChange={(e) => setDrafts({ ...drafts, [l.k]: e.target.value })} onKeyDown={(e) => e.key === "Enter" && addItem(l.k)} placeholder={l.ph} />
                  <Button variant="soft" onClick={() => addItem(l.k)}>
                    Add
                  </Button>
                </div>
              </div>
            </Section>
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <p className="text-[15px] leading-relaxed text-ink-2">
            A draft built from your own entries since {fmtDate(since, { month: "long", day: "numeric" })}. Edit it freely. Nothing is shared unless you choose to copy or share it.
          </p>
          {prep === null ? (
            <Button full size="lg" onClick={() => setPrep(draftSummary(vault, since))}>
              Prepare my summary
            </Button>
          ) : (
            <>
              <TextArea rows={18} value={prep} onChange={setPrep} />
              {ready && (
                <Button
                  variant="ghost"
                  full
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    setError(undefined);
                    const base = prep;
                    const r = await streamClarity({ task: "therapy", text: base }, setPrep);
                    setBusy(false);
                    if (r.error) {
                      setError(r.error);
                      setPrep(base);
                    }
                  }}
                >
                  {busy ? "Polishing…" : "Have Clarity tidy this into clear notes"}
                </Button>
              )}
              <AiErrorNote error={error} />
              <Notice>Please review every line before sharing. You decide what your therapist sees.</Notice>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={async () => {
                    setT((x) => ({ ...x, summaries: [...x.summaries, { id: uid(), createdAt: new Date().toISOString(), text: prep }] }));
                    try {
                      if (navigator.share) await navigator.share({ title: "Therapy notes", text: prep });
                      else await navigator.clipboard.writeText(prep);
                    } catch {}
                  }}
                >
                  <Share2 size={15} /> Approve & share
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(prep);
                    } catch {}
                  }}
                >
                  <Copy size={15} /> Copy
                </Button>
              </div>
            </>
          )}
          {t.summaries.length > 0 && (
            <Section title="Past summaries" className="mt-6">
              {[...t.summaries].reverse().slice(0, 5).map((s) => (
                <details key={s.id} className="card mb-2 p-4">
                  <summary className="cursor-pointer list-none text-sm">{fmtDate(s.createdAt, { month: "long", day: "numeric", year: "numeric" })}</summary>
                  <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-ink-2">{s.text}</pre>
                </details>
              ))}
            </Section>
          )}
        </div>
      )}

      <Sheet open={!!appt} onClose={() => setAppt(null)} title="Add appointment">
        {appt && (
          <div className="space-y-4">
            <div>
              <Label>When</Label>
              <Input type="datetime-local" value={appt.at} onChange={(e) => setAppt({ ...appt, at: e.target.value })} />
            </div>
            <div>
              <Label>With</Label>
              <Input value={appt.with} onChange={(e) => setAppt({ ...appt, with: e.target.value })} placeholder="Dr. …" />
            </div>
            <Button
              full
              disabled={!appt.at}
              onClick={() => {
                setT((x) => ({ ...x, appointments: [...x.appointments, { id: uid(), at: new Date(appt.at).toISOString(), with: appt.with }] }));
                setAppt(null);
              }}
            >
              Save
            </Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
