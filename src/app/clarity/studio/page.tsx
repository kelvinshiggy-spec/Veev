"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { SESSIONS, type Session } from "@/data/studio";
import { Button, Chips, Input, PageHeader, Section, TextArea, Sheet, Label, Notice } from "@/components/ui";
import { SessionList } from "@/components/session-list";
import { uid } from "@/lib/util";

const CATS: Session["category"][] = ["Steady yourself", "Cravings", "Emotions", "Relationships", "Growth"];

export default function Studio() {
  const { vault, update } = useStore();
  const [cat, setCat] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", steps: "", from: "My therapist" });
  const items = cat.length ? SESSIONS.filter((s) => s.category === cat[0]) : SESSIONS;

  return (
    <div>
      <PageHeader back="/clarity" eyebrow="Wellness Studio" title="Skills, practiced gently." subtitle="DBT-informed guided sessions with timers and a short reflection." />
      <Notice>These are guided self-help exercises, not psychotherapy. They work best alongside your therapist.</Notice>

      <Section title="From my therapist" className="mt-6" action={<Button size="sm" variant="ghost" onClick={() => setAdding(true)}>Add a skill</Button>}>
        {vault.customSkills.length === 0 ? (
          <p className="text-sm text-ink-3">Add skills your therapist assigned, in their words, so they live alongside everything else.</p>
        ) : (
          <div className="space-y-2">
            {vault.customSkills.map((s) => (
              <details key={s.id} className="card p-4">
                <summary className="cursor-pointer list-none font-medium">{s.name}</summary>
                <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-ink-2">{s.steps}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-ink-3">
                  <span>From {s.from}</span>
                  <button onClick={() => update((v) => ({ ...v, customSkills: v.customSkills.filter((x) => x.id !== s.id) }))} className="inline-flex items-center gap-1">
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </details>
            ))}
          </div>
        )}
      </Section>

      <Section title="Library">
        <Chips options={CATS} value={cat} onChange={(v) => setCat(v.slice(-1))} className="mb-4" />
        <SessionList items={items} />
      </Section>

      <Sheet open={adding} onClose={() => setAdding(false)} title="Add a skill">
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div>
            <Label>Steps or instructions</Label>
            <TextArea rows={6} value={draft.steps} onChange={(v) => setDraft({ ...draft, steps: v })} />
          </div>
          <div>
            <Label>From</Label>
            <Input value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} />
          </div>
          <Button
            full
            disabled={!draft.name.trim()}
            onClick={() => {
              update((v) => ({ ...v, customSkills: [...v.customSkills, { id: uid(), ...draft }] }));
              setDraft({ name: "", steps: "", from: "My therapist" });
              setAdding(false);
            }}
          >
            Save skill
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
