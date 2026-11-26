"use client";

import { useState } from "react";
import { Check, Trash2, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, Card, Chips, Input, Label, PageHeader, Section, Sheet, Segmented, TextArea, Pill } from "@/components/ui";
import { ACTIVITY_CATEGORIES, IDEAS, type ActivityIdea } from "@/data/activities";
import { addDays, dayKey, fmtDate, uid } from "@/lib/util";
import type { Activity } from "@/lib/types";

const BUDGET = ["$", "$$", "$$$"];
const TIME: Record<ActivityIdea["time"], string> = { hour: "An hour", half: "Half a day", day: "A day", weekend: "A weekend" };
const WHO = { alone: "Just me", family: "Family", partner: "Partner", friends: "Friends" } as const;

function weekendRange() {
  const d = new Date();
  const dow = d.getDay();
  const sat = addDays(dayKey(d), dow === 0 ? -1 : 6 - dow);
  return [addDays(sat, -1), addDays(sat, 1)];
}

export default function SoberLife() {
  const { vault, update } = useStore();
  const [tab, setTab] = useState<"mine" | "discover">("mine");
  const [f, setF] = useState<{ budget: string[]; time: string[]; energy: string[]; who: string[]; cat: string[] }>({ budget: [], time: [], energy: [], who: [], cat: [] });
  const [edit, setEdit] = useState<Activity | null>(null);
  const today = dayKey();
  const [wkStart, wkEnd] = weekendRange();

  const acts = vault.activities;
  const planned = acts.filter((a) => a.status === "planned").sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999"));
  const weekend = planned.filter((a) => a.date && a.date >= wkStart && a.date <= wkEnd);
  const ahead = planned.filter((a) => !a.date || a.date >= today);
  const next = planned.find((a) => /Travel|Skiing|Road/.test(a.category) && (!a.date || a.date >= today));
  const bucket = acts.filter((a) => a.bucket && a.status !== "done");
  const done = acts.filter((a) => a.status === "done").slice(-6).reverse();

  const ideas = IDEAS.filter(
    (i) =>
      (!f.budget.length || f.budget.includes(BUDGET[i.budget - 1])) &&
      (!f.time.length || f.time.includes(TIME[i.time])) &&
      (!f.energy.length || f.energy.includes(i.energy[0].toUpperCase() + i.energy.slice(1) + " energy")) &&
      (!f.who.length || i.with.some((w) => f.who.includes(WHO[w]))) &&
      (!f.cat.length || f.cat.includes(i.category)),
  );

  const fromIdea = (i: ActivityIdea, bucketItem = false): Activity => ({
    id: uid(),
    title: i.title,
    category: i.category,
    notes: "",
    status: bucketItem ? "idea" : "planned",
    bucket: bucketItem,
    with: i.with[0],
    createdAt: new Date().toISOString(),
  });
  const save = (a: Activity) => update((v) => ({ ...v, activities: [...v.activities.filter((x) => x.id !== a.id), a] }));

  const Row = ({ a }: { a: Activity }) => (
    <button onClick={() => setEdit(a)} className="card flex w-full items-center justify-between gap-3 p-4 text-left">
      <div>
        <div className="font-medium">{a.title}</div>
        <div className="text-xs text-ink-3">
          {a.date ? fmtDate(a.date, { weekday: "short", month: "short", day: "numeric" }) : a.bucket ? "Someday" : "No date yet"} · {WHO[a.with]}
        </div>
      </div>
      <Pill>{a.category}</Pill>
    </button>
  );

  return (
    <div>
      <PageHeader back="/future" eyebrow="Something to look forward to" title="Main character plans only." subtitle="Make the weekend, the evening, the next adventure something worth staying clear for." />
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: "mine", label: "My plans" },
          { value: "discover", label: "Discover" },
        ]}
      />

      {tab === "mine" ? (
        <div className="mt-6">
          <Button
            full
            variant="outline"
            onClick={() => setEdit({ id: uid(), title: "", category: "Self-care", notes: "", status: "planned", bucket: false, with: "alone", createdAt: new Date().toISOString() })}
          >
            <Plus size={16} /> Plan something
          </Button>
          {next && (
            <Section title="My next adventure" className="mt-6">
              <Card className="bg-forest text-on-forest">
                <div className="font-serif text-3xl">{next.title}</div>
                <div className="mt-1 text-sm text-on-forest/80">{next.date ? fmtDate(next.date, { weekday: "long", month: "long", day: "numeric" }) : "Date to be decided"}</div>
              </Card>
            </Section>
          )}
          <Section title="This weekend" className="mt-6">
            {weekend.length ? <div className="space-y-2">{weekend.map((a) => <Row key={a.id} a={a} />)}</div> : <p className="text-sm text-ink-3">Nothing yet. Fridays and weekends go better with a plan.</p>}
          </Section>
          <Section title="Things I'm looking forward to">
            {ahead.length ? <div className="space-y-2">{ahead.map((a) => <Row key={a.id} a={a} />)}</div> : <p className="text-sm text-ink-3">Add something from Discover.</p>}
          </Section>
          <Section title="My sober bucket list">
            {bucket.length ? <div className="space-y-2">{bucket.map((a) => <Row key={a.id} a={a} />)}</div> : <p className="text-sm text-ink-3">Big dreams welcome.</p>}
          </Section>
          {done.length > 0 && (
            <Section title="Done, clear-headed">
              <div className="space-y-2">
                {done.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3 text-sm">
                    <Check size={14} className="text-forest" /> {a.title}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <Chips options={ACTIVITY_CATEGORIES} value={f.cat} onChange={(v) => setF({ ...f, cat: v.slice(-1) })} />
          <div className="flex flex-wrap gap-2">
            <Chips options={BUDGET} value={f.budget} onChange={(v) => setF({ ...f, budget: v })} />
            <Chips options={Object.values(TIME)} value={f.time} onChange={(v) => setF({ ...f, time: v })} />
            <Chips options={["Low energy", "Medium energy", "High energy"]} value={f.energy} onChange={(v) => setF({ ...f, energy: v })} />
            <Chips options={Object.values(WHO)} value={f.who} onChange={(v) => setF({ ...f, who: v })} />
          </div>
          <div className="space-y-2 pt-2">
            {ideas.map((i) => (
              <Card key={i.title} className="!p-4">
                <div className="font-medium">{i.title}</div>
                <div className="mt-1 text-xs text-ink-3">
                  {i.category} · {BUDGET[i.budget - 1]} · {TIME[i.time]} · {i.with.map((w) => WHO[w]).join(", ")}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => setEdit(fromIdea(i))}>
                    Plan it
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => save(fromIdea(i, true))}>
                    Bucket list
                  </Button>
                </div>
              </Card>
            ))}
            {ideas.length === 0 && <p className="text-sm text-ink-3">No matches. Try fewer filters.</p>}
          </div>
          <p className="text-xs text-ink-3">Ideas are general suggestions. VEEV doesn&apos;t list real venues, prices or events.</p>
        </div>
      )}

      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.title || "Plan something"}>
        {edit && (
          <div className="space-y-4">
            <div>
              <Label>What</Label>
              <Input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} />
            </div>
            <Chips options={ACTIVITY_CATEGORIES} value={[edit.category]} multi={false} onChange={(v) => v[0] && setEdit({ ...edit, category: v[0] })} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>When</Label>
                <Input type="date" value={edit.date ?? ""} onChange={(e) => setEdit({ ...edit, date: e.target.value || undefined })} />
              </div>
              <div>
                <Label>With</Label>
                <select value={edit.with} onChange={(e) => setEdit({ ...edit, with: e.target.value as Activity["with"] })} className="w-full rounded-2xl border border-line bg-surface px-4 py-3">
                  {Object.entries(WHO).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <TextArea rows={3} value={edit.notes} onChange={(v) => setEdit({ ...edit, notes: v })} placeholder="Notes" />
            <Button
              full
              disabled={!edit.title.trim()}
              onClick={() => {
                save({ ...edit, status: edit.status === "idea" && edit.date ? "planned" : edit.status });
                setEdit(null);
              }}
            >
              Save
            </Button>
            {vault.activities.some((a) => a.id === edit.id) && (
              <div className="flex gap-2">
                <Button
                  variant="soft"
                  className="flex-1"
                  href="/future/memories?new=1"
                  onClick={() => save({ ...edit, status: "done" })}
                >
                  Done. Capture it
                </Button>
                <button
                  onClick={() => {
                    update((v) => ({ ...v, activities: v.activities.filter((a) => a.id !== edit.id) }));
                    setEdit(null);
                  }}
                  className="grid h-11 w-11 place-items-center rounded-full bg-surface-2 text-ink-3"
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}
