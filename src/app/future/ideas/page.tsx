"use client";

import { useState } from "react";
import Link from "next/link";
import { Lightbulb, Sparkles, Trash2, Wand2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, Card, Chips, Input, Label, PageHeader, Section, TextArea, Pill, Notice } from "@/components/ui";
import { AiErrorNote, useAiReady } from "@/components/ai-gate";
import { buildContext, callClarityJson, type AiError } from "@/lib/ai";
import { VISION_CATEGORIES } from "@/data/options";
import { fmtDate, uid } from "@/lib/util";
import type { Idea, IdeaTarget, Vault } from "@/lib/types";

interface Built {
  kind: "goal" | "vision" | "plan" | "bucket" | "habit" | "note";
  title: string;
  summary: string;
  category: string;
  milestones: string[];
  affirmation: string;
  firstStep: string;
  when: string;
  withWho: "alone" | "family" | "partner" | "friends";
}

const KINDS: { v: Built["kind"]; label: string; where: string; href: string }[] = [
  { v: "goal", label: "Goal", where: "your goals", href: "/future/vision" },
  { v: "vision", label: "Vision board", where: "your vision board", href: "/future/vision" },
  { v: "plan", label: "Plan", where: "your plans", href: "/future/sober-life" },
  { v: "bucket", label: "Bucket list", where: "your bucket list", href: "/future/sober-life" },
  { v: "habit", label: "Habit", where: "your habits", href: "/journey/habits" },
  { v: "note", label: "Reflection", where: "your journal", href: "/journey" },
];

function applyBuilt(v: Vault, idea: Idea, b: Built): Vault {
  const now = new Date().toISOString();
  const refId = uid();
  let next: Vault = v;
  if (b.kind === "goal" || b.kind === "vision") {
    next = {
      ...v,
      vision: [
        ...v.vision,
        {
          id: refId,
          category: VISION_CATEGORIES.includes(b.category) ? b.category : b.kind === "goal" ? "Personal confidence" : "Peaceful living",
          title: b.title,
          note: [b.summary, b.firstStep && `First step: ${b.firstStep}`, b.when && `When: ${b.when}`].filter(Boolean).join("\n"),
          affirmation: b.affirmation,
          progress: 0,
          milestones: b.milestones.filter(Boolean).map((t) => ({ id: uid(), text: t, done: false })),
          createdAt: now,
        },
      ],
      profile: b.kind === "goal" && !v.profile.goals.includes(b.title) ? { ...v.profile, goals: [...v.profile.goals, b.title] } : v.profile,
    };
  } else if (b.kind === "plan" || b.kind === "bucket") {
    next = {
      ...v,
      activities: [
        ...v.activities,
        {
          id: refId,
          title: b.title,
          category: b.category || "Weekend",
          notes: [b.summary, b.firstStep && `First step: ${b.firstStep}`, b.when && `When: ${b.when}`, ...b.milestones].filter(Boolean).join("\n"),
          status: b.kind === "plan" ? "planned" : "idea",
          bucket: b.kind === "bucket",
          with: b.withWho,
          createdAt: now,
        },
      ],
    };
  } else if (b.kind === "habit") {
    next = { ...v, habits: [...v.habits, { id: refId, name: b.title, days: [0, 1, 2, 3, 4, 5, 6], log: {} }] };
  } else {
    next = { ...v, journal: [...v.journal, { id: refId, kind: "reflection", createdAt: now, title: b.title, fields: { idea: idea.raw, reflection: b.summary } }] };
  }
  return {
    ...next,
    ideas: next.ideas.map((x) => (x.id === idea.id ? { ...x, status: "built", builtAs: { kind: b.kind as IdeaTarget, refId, summary: b.title } } : x)),
  };
}

export default function Ideas() {
  const { vault, update } = useStore();
  const ready = useAiReady();
  const [raw, setRaw] = useState("");
  const [building, setBuilding] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ idea: Idea; built: Built } | null>(null);
  const [error, setError] = useState<AiError>();
  const inbox = vault.ideas.filter((i) => i.status === "inbox");
  const built = vault.ideas.filter((i) => i.status === "built").slice(0, 12);

  const add = () => {
    if (!raw.trim()) return;
    update((v) => ({ ...v, ideas: [{ id: uid(), raw: raw.trim(), createdAt: new Date().toISOString(), status: "inbox" }, ...v.ideas] }));
    setRaw("");
  };

  const manual = (idea: Idea): Built => ({
    kind: "goal",
    title: idea.raw.slice(0, 70),
    summary: idea.raw,
    category: "Personal confidence",
    milestones: [],
    affirmation: "",
    firstStep: "",
    when: "",
    withWho: "alone",
  });

  const build = async (idea: Idea) => {
    setError(undefined);
    if (!ready) {
      setPreview({ idea, built: manual(idea) });
      return;
    }
    setBuilding(idea.id);
    const r = await callClarityJson<Built>({ task: "idea", text: idea.raw, context: buildContext(vault) });
    setBuilding(null);
    if (r.error) {
      setError(r.error);
      setPreview({ idea, built: manual(idea) });
    } else if (r.data) setPreview({ idea, built: { ...r.data, milestones: r.data.milestones ?? [] } });
  };

  if (preview) {
    const b = preview.built;
    const set = (patch: Partial<Built>) => setPreview({ ...preview, built: { ...b, ...patch } });
    const k = KINDS.find((x) => x.v === b.kind)!;
    return (
      <div>
        <PageHeader eyebrow="Build it" title={ready ? "Here's a shape for it." : "Give it a shape."} subtitle={`“${preview.idea.raw}”`} />
        <div className="space-y-5">
          <div>
            <Label>Make it a…</Label>
            <Chips options={KINDS.map((x) => x.label)} value={[k.label]} multi={false} onChange={(v) => v[0] && set({ kind: KINDS.find((x) => x.label === v[0])!.v })} />
          </div>
          <div>
            <Label>Title</Label>
            <Input value={b.title} onChange={(e) => set({ title: e.target.value })} />
          </div>
          <div>
            <Label>Details</Label>
            <TextArea rows={3} value={b.summary} onChange={(v) => set({ summary: v })} />
          </div>
          {(b.kind === "goal" || b.kind === "vision") && (
            <>
              <div>
                <Label>Category</Label>
                <Chips options={VISION_CATEGORIES} value={[b.category]} multi={false} onChange={(v) => v[0] && set({ category: v[0] })} />
              </div>
              <div>
                <Label hint="One per line.">Milestones</Label>
                <TextArea rows={4} value={b.milestones.join("\n")} onChange={(v) => set({ milestones: v.split("\n") })} />
              </div>
              <div>
                <Label>Affirmation</Label>
                <Input value={b.affirmation} onChange={(e) => set({ affirmation: e.target.value })} />
              </div>
            </>
          )}
          {b.kind !== "note" && b.kind !== "habit" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First step</Label>
                <Input value={b.firstStep} onChange={(e) => set({ firstStep: e.target.value })} />
              </div>
              <div>
                <Label>When</Label>
                <Input value={b.when} onChange={(e) => set({ when: e.target.value })} />
              </div>
            </div>
          )}
          <Button
            full
            size="lg"
            disabled={!b.title.trim()}
            onClick={() => {
              update((v) => applyBuilt(v, preview.idea, b));
              setPreview(null);
            }}
          >
            Add to {k.where}
          </Button>
          <Button full variant="ghost" onClick={() => setPreview(null)}>
            Not now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader back="/future" eyebrow="Idea inbox" title="Dump it here. We'll help you build it." subtitle="Half-formed thoughts welcome. Turn any of them into a goal, a plan, a habit or something for your vision board." />
      <div className="flex gap-2">
        <div className="flex-1">
          <TextArea voice rows={3} value={raw} onChange={setRaw} placeholder="Ski trip with my sister in February… start a savings jar for a Range Rover… learn to make fresh pasta…" />
        </div>
      </div>
      <Button full className="mt-3" onClick={add} disabled={!raw.trim()}>
        <Lightbulb size={16} /> Save idea
      </Button>
      {!ready && (
        <div className="mt-4">
          <Notice>With the AI companion on, ideas get shaped for you automatically. Without it, you can still shape them yourself in a few taps.</Notice>
        </div>
      )}
      <div className="mt-3">
        <AiErrorNote error={error} />
      </div>

      <Section title={`Inbox${inbox.length ? ` · ${inbox.length}` : ""}`} className="mt-8">
        {inbox.length === 0 ? (
          <p className="text-sm text-ink-3">Nothing waiting. Your next idea goes here.</p>
        ) : (
          <div className="space-y-2">
            {inbox.map((i) => (
              <Card key={i.id} className="!p-4">
                <p className="text-[15px] leading-relaxed">{i.raw}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Button size="sm" onClick={() => build(i)} disabled={building === i.id}>
                    {ready ? <Wand2 size={14} /> : <Sparkles size={14} />} {building === i.id ? "Shaping…" : "Build it"}
                  </Button>
                  <span className="text-xs text-ink-3">{fmtDate(i.createdAt)}</span>
                  <button onClick={() => update((v) => ({ ...v, ideas: v.ideas.filter((x) => x.id !== i.id) }))} aria-label="Delete idea" className="ml-auto text-ink-3 hover:text-rose">
                    <Trash2 size={14} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {built.length > 0 && (
        <Section title="Built">
          <div className="space-y-2">
            {built.map((i) => {
              const k = KINDS.find((x) => x.v === i.builtAs?.kind);
              return (
                <Link key={i.id} href={k?.href ?? "/future"} className="flex items-center justify-between rounded-2xl bg-surface-2 px-4 py-3">
                  <span className="truncate pr-3 text-sm">{i.builtAs?.summary}</span>
                  <Pill tone="forest">{k?.label}</Pill>
                </Link>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}
