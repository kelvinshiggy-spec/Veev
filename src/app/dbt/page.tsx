"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Mic, Plus, Sparkles, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, Card, Input, Label, PageHeader, Section, Sheet, TextArea } from "@/components/ui";
import { useCompanionName } from "@/components/companion-name";
import { DBT_MODULES, DBT_SKILLS, SKILL_HYPE, skillFor, type DbtSkill } from "@/data/dbt";
import { cx, dayKey, daysBetween, fmtDate, uid } from "@/lib/util";
import type { DbtEntry } from "@/lib/types";

const SOURCES: { v: DbtEntry["source"]; l: string }[] = [
  { v: "therapy", l: "Learned in therapy" },
  { v: "self", l: "Used it on my own" },
  { v: "app", l: "Practiced in VEEV" },
];

export default function Dbt() {
  const { vault } = useStore();
  const cn = useCompanionName();
  const today = dayKey();
  const checkIn = vault.checkIns.filter((c) => c.date === today).sort((a, b) => b.at.localeCompare(a.at))[0];
  const pick = skillFor(checkIn?.emotions ?? [], checkIn?.mood ?? vault.quickMood?.[today], vault.profile.bpdTriggers ?? [], daysBetween("2024-01-01", today));
  const [logging, setLogging] = useState<DbtSkill | "custom" | null>(null);
  const [openMod, setOpenMod] = useState<string | null>(null);
  const [openSkill, setOpenSkill] = useState<string | null>(null);
  const counts = vault.dbt.reduce<Record<string, number>>((a, e) => ({ ...a, [e.skill]: (a[e.skill] ?? 0) + 1 }), {});
  const collected = Object.keys(counts).length;
  const recent = [...vault.dbt].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  const nameOf = (id: string) => DBT_SKILLS.find((s) => s.id === id)?.name ?? id;

  return (
    <div className="fade-in">
      <PageHeader back="/clarity" eyebrow="DBT toolkit" title="Your glow-up toolkit ✨" subtitle="Skills that make big feelings easier. Collect them, practice them, watch yourself grow." />

      <div className="grid grid-cols-2 gap-2">
        <Card className="!p-4 text-center">
          <div className="font-serif text-4xl">{collected}</div>
          <div className="text-xs text-ink-3">skills in your collection</div>
        </Card>
        <Card className="!p-4 text-center">
          <div className="font-serif text-4xl">{vault.dbt.length}</div>
          <div className="text-xs text-ink-3">times you practiced</div>
        </Card>
      </div>

      <Card className="glow mt-4">
        <div className="eyebrow flex items-center gap-1.5">
          <Sparkles size={12} /> {cn}&apos;s skill for today
        </div>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-4xl">{pick.emoji}</span>
          <div>
            <div className="font-serif text-[26px] leading-tight">{pick.name}</div>
            <div className="text-sm text-ink-2">{pick.vibe}</div>
          </div>
        </div>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-[15px] text-ink-2">
          {pick.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setLogging(pick)}>
            <Check size={14} /> I practiced this
          </Button>
          {pick.studio && (
            <Button size="sm" variant="soft" href={`/clarity/studio/${pick.studio}`}>
              Walk me through it
            </Button>
          )}
        </div>
      </Card>

      <Button full variant="outline" className="mt-4" onClick={() => setLogging("custom")}>
        <Plus size={15} /> Log something I learned
      </Button>

      {recent.length > 0 && (
        <Section title="My skill wins" className="mt-6">
          <div className="space-y-2">
            {recent.map((e) => (
              <div key={e.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium">
                    {DBT_SKILLS.find((s) => s.id === e.skill)?.emoji ?? "💡"} {nameOf(e.skill)}
                  </div>
                  <div className="text-xs text-ink-3">{fmtDate(e.date, { month: "short", day: "numeric" })}</div>
                </div>
                {e.how && <p className="mt-1 text-[15px] text-ink-2">{e.how}</p>}
                <div className="mt-1 flex items-center gap-2 text-xs text-ink-3">
                  {SOURCES.find((s) => s.v === e.source)?.l}
                  {e.helped ? <span>· {"⭐".repeat(e.helped)}</span> : null}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="The full toolkit" className="mt-6">
        <div className="space-y-2">
          {DBT_MODULES.map((m) => {
            const open = openMod === m.id;
            const skills = DBT_SKILLS.filter((s) => s.module === m.id);
            return (
              <div key={m.id} className="card overflow-hidden">
                <button onClick={() => setOpenMod(open ? null : m.id)} className="flex w-full items-center gap-3 p-4 text-left">
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="flex-1">
                    <span className="block font-serif text-[21px] leading-tight">{m.id}</span>
                    <span className="text-sm text-ink-3">{m.blurb}</span>
                  </span>
                  <span className="text-xs text-ink-3">
                    {skills.filter((s) => counts[s.id]).length}/{skills.length}
                  </span>
                  <ChevronDown size={18} className={cx("text-ink-3 transition-transform", open && "rotate-180")} />
                </button>
                {open && (
                  <div className="fade-in space-y-2 border-t border-line p-3">
                    {skills.map((s) => {
                      const so = openSkill === s.id;
                      return (
                        <div key={s.id} className="rounded-2xl bg-surface-2">
                          <button onClick={() => setOpenSkill(so ? null : s.id)} className="flex w-full items-center gap-3 p-3 text-left">
                            <span className="text-xl">{s.emoji}</span>
                            <span className="flex-1">
                              <span className="block font-medium">{s.name}</span>
                              <span className="text-sm text-ink-3">{s.vibe}</span>
                            </span>
                            {counts[s.id] ? (
                              <span className="flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 text-xs">
                                <Star size={11} /> {counts[s.id]}
                              </span>
                            ) : null}
                          </button>
                          {so && (
                            <div className="px-3 pb-3">
                              <ol className="list-decimal space-y-1 pl-5 text-[15px] text-ink-2">
                                {s.steps.map((x) => (
                                  <li key={x}>{x}</li>
                                ))}
                              </ol>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <Button size="sm" variant="soft" onClick={() => setLogging(s)}>
                                  <Check size={14} /> Log it
                                </Button>
                                {s.studio && (
                                  <Button size="sm" variant="ghost" href={`/clarity/studio/${s.studio}`}>
                                    Guided version
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      <Link href="/voice?topic=dbt" className="card mt-2 flex items-center gap-3 p-4">
        <Mic size={18} className="text-gold" />
        <div>
          <div className="font-medium">Practice with {cn}</div>
          <div className="text-sm text-ink-3">Role-play a DEAR MAN, check the facts, or talk through what you learned</div>
        </div>
      </Link>
      <p className="mt-4 text-xs leading-relaxed text-ink-3">
        This is a self-help practice space that goes alongside your therapist, not instead of them. Bring your skill wins to your next session. They love that.
      </p>

      <LogSheet skill={logging} onClose={() => setLogging(null)} />
    </div>
  );
}

function LogSheet({ skill, onClose }: { skill: DbtSkill | "custom" | null; onClose: () => void }) {
  const { update } = useStore();
  const [name, setName] = useState("");
  const [how, setHow] = useState("");
  const [source, setSource] = useState<DbtEntry["source"]>("self");
  const [helped, setHelped] = useState(0);
  const custom = skill === "custom";
  const save = () => {
    const id = custom ? name.trim() : (skill as DbtSkill).id;
    if (!id) return;
    update((v) => ({ ...v, dbt: [...v.dbt, { id: uid(), skill: id, date: dayKey(), source, how: how.trim(), helped: helped || undefined }] }));
    window.dispatchEvent(new CustomEvent("veev:cheer", { detail: SKILL_HYPE[(how.length + id.length) % SKILL_HYPE.length] }));
    setName("");
    setHow("");
    setHelped(0);
    onClose();
  };
  const sk = skill && skill !== "custom" ? skill : null;
  return (
    <Sheet open={!!skill} onClose={onClose} title={custom ? "What did you learn?" : `${sk?.emoji ?? ""} ${sk?.name ?? ""}`}>
      <div className="space-y-5">
        {custom && (
          <div>
            <Label>Skill or lesson</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Half-smile, PLEASE, a lesson from therapy" list="dbt-skills" />
            <datalist id="dbt-skills">
              {DBT_SKILLS.map((s) => (
                <option key={s.id} value={s.name} />
              ))}
            </datalist>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {SOURCES.map((s) => (
            <button key={s.v} onClick={() => setSource(s.v)} className={cx("rounded-full border px-3 py-1.5 text-sm", source === s.v ? "border-forest bg-forest text-on-forest" : "border-line")}>
              {s.l}
            </button>
          ))}
        </div>
        <div>
          <Label>{custom ? "What I learned" : "How I used it"}</Label>
          <TextArea voice rows={3} value={how} onChange={setHow} placeholder="I felt the urge to text back fast, so I checked the facts first…" />
        </div>
        <div>
          <Label>How much did it help?</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setHelped(n)} className={cx("text-2xl transition", n <= helped ? "opacity-100" : "opacity-30")} aria-label={`${n} stars`}>
                ⭐
              </button>
            ))}
          </div>
        </div>
        <Button full onClick={save} disabled={custom && !name.trim()}>
          Add to my wins
        </Button>
      </div>
    </Sheet>
  );
}
