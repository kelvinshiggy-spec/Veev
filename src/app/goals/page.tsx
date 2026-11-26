"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Check, CalendarPlus, Trophy, Trash2, Mic, PiggyBank, GraduationCap, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, Card, Input, Label, PageHeader, Section, Sheet, TextArea } from "@/components/ui";
import { MediaView, PhotoPicker } from "@/components/media";
import { useCompanionName } from "@/components/companion-name";
import { cheer } from "@/components/cheer";
import { GOAL_TEMPLATES, GOAL_EMOJIS, tipFor } from "@/data/goals";
import { addToCalendar } from "@/lib/ics";
import { addDays, cx, dayKey, daysBetween, fmtDate, money, uid } from "@/lib/util";
import type { Goal, Vault } from "@/lib/types";
import { goalProgress, nextStep } from "@/lib/goals";

type Tab = "month" | "90" | "school" | "done";

function endOfMonth(today: string) {
  const d = new Date(`${today}T12:00:00`);
  return dayKey(new Date(d.getFullYear(), d.getMonth() + 1, 0, 12));
}

export default function Goals() {
  const { vault, update } = useStore();
  const [tab, setTab] = useState<Tab>("month");
  const [adding, setAdding] = useState(false);
  const active = vault.goals.filter((g) => !g.completedAt);
  const shown = tab === "done" ? vault.goals.filter((g) => g.completedAt) : active.filter((g) => g.horizon === tab);

  return (
    <div className="fade-in">
      <PageHeader back="/future" eyebrow="Goals" title="Plans, but we actually do them." subtitle="Tiny steps, daily nudges, and proof when you crush it." />

      <div className="no-scrollbar -mx-5 mb-5 flex gap-2 overflow-x-auto px-5">
        {(
          [
            ["month", "📅 This month"],
            ["90", "🚀 90 days"],
            ["school", "🎓 School"],
            ["done", "🏆 Trophy case"],
          ] as const
        ).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={cx("shrink-0 rounded-full border px-4 py-2 text-sm", tab === k ? "border-forest bg-forest text-on-forest" : "border-line bg-surface text-ink-2")}>
            {l}
          </button>
        ))}
      </div>

      {tab === "school" ? (
        <School />
      ) : (
        <>
          {shown.length === 0 && tab !== "done" && (
            <Card className="sunlit text-center">
              <div className="text-3xl">🎯</div>
              <p className="mt-2 font-serif text-xl">No {tab === "month" ? "monthly" : "90-day"} goals yet.</p>
              <p className="mt-1 text-sm text-ink-3">Pick one thing. We&apos;ll break it into tiny steps together.</p>
            </Card>
          )}
          {shown.length === 0 && tab === "done" && <p className="text-sm text-ink-3">Finished goals show up here with your proof photos. The first one is coming.</p>}
          <div className="space-y-3">
            {shown.map((g) => (
              <GoalCard key={g.id} g={g} />
            ))}
          </div>
          {tab !== "done" && (
            <Button full className="mt-4" onClick={() => setAdding(true)}>
              <Plus size={16} /> New {tab === "month" ? "monthly" : "90-day"} goal
            </Button>
          )}
        </>
      )}

      <NewGoal
        open={adding}
        horizon={tab === "90" ? "90" : "month"}
        onClose={() => setAdding(false)}
        onCreate={(g) => {
          update((v) => ({ ...v, goals: [...v.goals, g] }));
          setAdding(false);
          cheer("routine");
        }}
        vault={vault}
      />
    </div>
  );
}

function NewGoal({ open, horizon, onClose, onCreate, vault }: { open: boolean; horizon: "month" | "90"; onClose: () => void; onCreate: (g: Goal) => void; vault: Vault }) {
  const today = dayKey();
  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [tpl, setTpl] = useState<string | undefined>();
  const [steps, setSteps] = useState<string[]>([]);
  const [target, setTarget] = useState("");
  const [why, setWhy] = useState("");
  const [h, setH] = useState(horizon);
  const reset = () => {
    setTitle("");
    setEmoji("🎯");
    setTpl(undefined);
    setSteps([]);
    setTarget("");
    setWhy("");
  };

  const pickTemplate = (id: string) => {
    const t = GOAL_TEMPLATES.find((x) => x.id === id)!;
    setTpl(id);
    setTitle(t.title);
    setEmoji(t.emoji);
    setSteps(t.steps.map((s) => s.text));
    setH(t.horizon);
    setTarget(t.money ? String(t.money) : "");
  };

  const create = () => {
    if (!title.trim()) return;
    const amount = Number(target) || 0;
    onCreate({
      id: uid(),
      title: title.trim(),
      emoji,
      horizon: h,
      template: tpl,
      createdAt: new Date().toISOString(),
      due: h === "month" ? endOfMonth(today) : addDays(today, 90),
      steps: (steps.length ? steps : ["Take the first tiny step"]).filter((s) => s.trim()).map((text) => ({ id: uid(), text: text.trim(), done: false })),
      money: amount > 0 ? { target: amount, deposits: [] } : undefined,
      why: why.trim() || undefined,
    });
    reset();
  };

  return (
    <Sheet open={open} onClose={onClose} title="New goal">
      <div className="space-y-5">
        <div>
          <Label>Start from an idea</Label>
          <div className="flex flex-wrap gap-2">
            {GOAL_TEMPLATES.map((t) => (
              <button key={t.id} onClick={() => pickTemplate(t.id)} className={cx("rounded-full border px-3 py-1.5 text-sm", tpl === t.id ? "border-forest bg-forest text-on-forest" : "border-line bg-surface")}>
                {t.emoji} {t.title}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>The goal</Label>
          <div className="flex gap-2">
            <select value={emoji} onChange={(e) => setEmoji(e.target.value)} className="rounded-2xl border border-line bg-surface px-2 text-xl" aria-label="Emoji">
              {GOAL_EMOJIS.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ski trip to Tahoe" />
          </div>
        </div>
        <div className="flex gap-2">
          {(
            [
              ["month", "This month"],
              ["90", "90 days"],
            ] as const
          ).map(([k, l]) => (
            <button key={k} onClick={() => setH(k)} className={cx("flex-1 rounded-2xl border py-2.5 text-sm", h === k ? "border-forest bg-forest-soft" : "border-line")}>
              {l}
            </button>
          ))}
        </div>
        <div>
          <Label hint="Tiny, doable steps. Tap × to remove.">Steps</Label>
          <div className="space-y-1.5">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={s} onChange={(e) => setSteps(steps.map((x, j) => (j === i ? e.target.value : x)))} />
                <button onClick={() => setSteps(steps.filter((_, j) => j !== i))} aria-label="Remove step" className="text-ink-3">
                  <X size={16} />
                </button>
              </div>
            ))}
            <button onClick={() => setSteps([...steps, ""])} className="text-sm text-ink-2">
              + Add a step
            </button>
          </div>
        </div>
        <div>
          <Label hint="Optional. For trips, savings, anything with a price tag.">Money to save ({vault.profile.currency})</Label>
          <Input inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value.replace(/[^\d.]/g, ""))} placeholder="0" />
        </div>
        <div>
          <Label>Why it matters to me</Label>
          <TextArea rows={2} value={why} onChange={setWhy} placeholder="Because I want to remember every second of it." />
        </div>
        <Button full onClick={create} disabled={!title.trim()}>
          Let&apos;s do it
        </Button>
      </div>
    </Sheet>
  );
}

function GoalCard({ g }: { g: Goal }) {
  const { vault, update } = useStore();
  const cn = useCompanionName();
  const [open, setOpen] = useState(false);
  const [newStep, setNewStep] = useState("");
  const [deposit, setDeposit] = useState("");
  const [finishing, setFinishing] = useState(false);
  const [proofIds, setProofIds] = useState<string[]>([]);
  const [proofNote, setProofNote] = useState("");
  const today = dayKey();
  const pct = goalProgress(g);
  const next = nextStep(g);
  const left = daysBetween(today, g.due);
  const saved = g.money?.deposits.reduce((a, d) => a + d.amount, 0) ?? 0;
  const set = (fn: (g: Goal) => Goal) => update((v) => ({ ...v, goals: v.goals.map((x) => (x.id === g.id ? fn(x) : x)) }));

  const toggle = (id: string) => {
    const s = g.steps.find((x) => x.id === id);
    set((x) => ({ ...x, steps: x.steps.map((st) => (st.id === id ? { ...st, done: !st.done, doneAt: !st.done ? new Date().toISOString() : undefined } : st)) }));
    if (s && !s.done) cheer("goal");
  };

  const finish = () => {
    const memoryId = uid();
    const now = new Date().toISOString();
    update((v) => ({
      ...v,
      goals: v.goals.map((x) => (x.id === g.id ? { ...x, completedAt: now, proof: { mediaIds: proofIds, note: proofNote, memoryId } } : x)),
      memories: [
        ...v.memories,
        { id: memoryId, category: "Goals", title: `${g.emoji} ${g.title}: done!`, body: proofNote || `I said I would, and I did.`, mediaId: proofIds[0], mediaType: proofIds[0] ? ("image" as const) : undefined, createdAt: now },
      ],
    }));
    setFinishing(false);
    window.dispatchEvent(new CustomEvent("veev:cheer", { detail: "GOAL COMPLETE. You said you would and you DID. Iconic. 🏆" }));
  };

  const calendar = () => {
    const events = g.steps
      .filter((s) => !s.done)
      .map((s, i) => ({ title: `${g.emoji} ${s.text}`, date: s.date ?? addDays(today, Math.min(i * Math.max(1, Math.floor(Math.max(1, left) / Math.max(1, g.steps.length))) + 1, Math.max(1, left))), time: "18:00", note: `${g.title}. ${tipFor(g.template, s.text) ?? "One tiny step. You've got this."}` }));
    events.push({ title: `${g.emoji} ${g.title} deadline`, date: g.due, time: "10:00", note: "Check in with VEEV and celebrate how far you got." });
    addToCalendar(events, g.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
  };

  return (
    <div className={cx("card overflow-hidden", g.completedAt && "sunlit")}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-4 p-4 text-left">
        <div className="relative grid h-14 w-14 shrink-0 place-items-center">
          <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--line)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--forest)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 97.4} 97.4`} className="transition-all duration-700" />
          </svg>
          <span className="text-2xl">{g.emoji}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-serif text-[21px] leading-tight">{g.title}</div>
          <div className="text-sm text-ink-3">
            {g.completedAt ? `Done ${fmtDate(g.completedAt, { month: "short", day: "numeric" })} 🏆` : `${pct}% · ${left > 0 ? `${left} days left` : left === 0 ? "due today" : "past the date, still worth it"}`}
          </div>
          {!g.completedAt && next && <div className="mt-0.5 truncate text-sm text-ink-2">Next: {next.text}</div>}
        </div>
      </button>

      {open && (
        <div className="fade-in space-y-4 border-t border-line p-4">
          {g.completedAt ? (
            <>
              {g.proof?.mediaIds.length ? (
                <div className="grid grid-cols-3 gap-2">
                  {g.proof.mediaIds.map((id) => (
                    <div key={id} className="aspect-square overflow-hidden rounded-xl">
                      <MediaView id={id} type="image" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}
              {g.proof?.note && <p className="font-serif text-lg italic">&ldquo;{g.proof.note}&rdquo;</p>}
            </>
          ) : (
            <>
              {next && (
                <div className="rounded-2xl bg-surface-2 p-3 text-[15px]">
                  <span className="text-[11px] uppercase tracking-wider text-ink-3">{cn}&apos;s tip</span>
                  <div>{tipFor(g.template, next.text) ?? "Make it so small you can't say no. Five minutes counts."}</div>
                </div>
              )}
              <ul className="space-y-1">
                {g.steps.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 py-1">
                    <button onClick={() => toggle(s.id)} aria-label={s.done ? `Undo ${s.text}` : `Done: ${s.text}`} className={cx("grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition active:scale-90", s.done ? "check-pop border-forest bg-forest text-on-forest" : "border-line")}>
                      {s.done && <Check size={14} strokeWidth={3} />}
                    </button>
                    <span className={cx("flex-1 text-[15px]", s.done && "text-ink-3 line-through")}>{s.text}</span>
                    {!s.done && (s.date || s.id === next?.id) && (
                      <input
                        type="date"
                        value={s.date ?? ""}
                        onChange={(e) => set((x) => ({ ...x, steps: x.steps.map((st) => (st.id === s.id ? { ...st, date: e.target.value || undefined } : st)) }))}
                        aria-label={`Do ${s.text} by`}
                        className="w-[7.5rem] rounded-lg border border-line bg-surface px-1.5 py-1 text-xs text-ink-3"
                      />
                    )}
                  </li>
                ))}
              </ul>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newStep.trim()) return;
                  set((x) => ({ ...x, steps: [...x.steps, { id: uid(), text: newStep.trim(), done: false }] }));
                  setNewStep("");
                }}
              >
                <Input value={newStep} onChange={(e) => setNewStep(e.target.value)} placeholder="Add a step…" />
                <Button type="submit" variant="soft" size="sm">
                  Add
                </Button>
              </form>

              {g.money && (
                <div className="rounded-2xl border border-line p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 font-medium">
                      <PiggyBank size={15} className="text-gold" /> Saved
                    </span>
                    <span>
                      {money(saved, vault.profile.currency)} of {money(g.money.target, vault.profile.currency)}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-gold transition-all duration-700" style={{ width: `${Math.min(100, (saved / g.money.target) * 100)}%` }} />
                  </div>
                  <form
                    className="mt-3 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const amt = Number(deposit);
                      if (!amt) return;
                      set((x) => ({ ...x, money: x.money ? { ...x.money, deposits: [...x.money.deposits, { id: uid(), amount: amt, date: today }] } : x.money }));
                      setDeposit("");
                      window.dispatchEvent(new CustomEvent("veev:cheer", { detail: `${money(amt, vault.profile.currency)} closer. Rich girl behavior. 💸` }));
                    }}
                  >
                    <Input inputMode="decimal" value={deposit} onChange={(e) => setDeposit(e.target.value.replace(/[^\d.]/g, ""))} placeholder="Add money saved" />
                    <Button type="submit" size="sm" variant="soft">
                      Add
                    </Button>
                  </form>
                  {vault.profile.dailyDrinkSpend > 0 && <p className="mt-2 text-xs text-ink-3">Idea: move your not-spent drink money here every week.</p>}
                </div>
              )}
              {g.why && <p className="text-sm italic text-ink-3">Why: {g.why}</p>}

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="soft" onClick={calendar}>
                  <CalendarPlus size={14} /> Add reminders to my calendar
                </Button>
                <Button size="sm" variant="ghost" href={`/voice?topic=goals`}>
                  <Mic size={14} /> Plan it with {cn}
                </Button>
              </div>

              {finishing ? (
                <div className="space-y-3 rounded-2xl bg-gold-soft p-3">
                  <div className="font-medium">Show me the proof, queen 📸</div>
                  {proofIds.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {proofIds.map((id) => (
                        <div key={id} className="aspect-square overflow-hidden rounded-xl">
                          <MediaView id={id} type="image" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  {proofIds.length < 6 && <PhotoPicker label="Add a proof photo" onSaved={(id) => setProofIds([...proofIds, id])} />}
                  <TextArea rows={2} value={proofNote} onChange={setProofNote} placeholder="How does it feel? What do you want to remember?" />
                  <Button full onClick={finish}>
                    <Trophy size={15} /> Mark it done
                  </Button>
                </div>
              ) : (
                <Button full variant={pct >= 100 || !next ? "primary" : "outline"} onClick={() => setFinishing(true)}>
                  <Trophy size={15} /> I did it! Add proof
                </Button>
              )}
              <button
                onClick={() => update((v) => ({ ...v, goals: v.goals.filter((x) => x.id !== g.id) }))}
                className="flex items-center gap-1 text-xs text-ink-3 hover:text-rose"
              >
                <Trash2 size={12} /> Remove goal
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function School() {
  const { vault, update } = useStore();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const today = dayKey();
  const upcoming = vault.exams.filter((e) => !e.done).sort((a, b) => a.date.localeCompare(b.date));
  const hasPharm = vault.goals.some((g) => g.template === "pharmacy" && !g.completedAt);
  const add = () => {
    if (!title.trim() || !date) return;
    update((v) => ({ ...v, exams: [...v.exams, { id: uid(), title: title.trim(), date }] }));
    setTitle("");
    setDate("");
    cheer("intention");
  };
  return (
    <div className="space-y-5">
      <Card className="sunlit">
        <div className="flex items-center gap-2">
          <GraduationCap size={18} className="text-gold" />
          <div className="eyebrow">DVC → pharmacy school</div>
        </div>
        <p className="mt-2 font-serif text-[22px] leading-snug">Future pharmacist energy. Every class is a step toward that white coat. 🤍</p>
        {!hasPharm && (
          <Button
            size="sm"
            className="mt-3"
            onClick={() => {
              const t = GOAL_TEMPLATES.find((x) => x.id === "pharmacy")!;
              update((v) => ({
                ...v,
                goals: [
                  ...v.goals,
                  { id: uid(), title: t.title, emoji: t.emoji, horizon: "90", template: t.id, createdAt: new Date().toISOString(), due: addDays(today, 90), steps: t.steps.map((s) => ({ id: uid(), text: s.text, done: false })) },
                ],
              }));
              cheer("routine");
            }}
          >
            <Plus size={14} /> Start my pharmacy school plan
          </Button>
        )}
        {hasPharm && <p className="mt-2 text-sm text-ink-3">Your pharmacy plan lives in 90 days.</p>}
      </Card>

      <Section title="Exams & due dates">
        {upcoming.length === 0 && <p className="mb-3 text-sm text-ink-3">Add exams and big assignments so I can remind you and hype you up before them.</p>}
        <div className="space-y-2">
          {upcoming.map((e) => {
            const d = daysBetween(today, e.date);
            return (
              <div key={e.id} className="card flex items-center gap-3 p-3">
                <button
                  onClick={() => {
                    update((v) => ({ ...v, exams: v.exams.map((x) => (x.id === e.id ? { ...x, done: true } : x)) }));
                    window.dispatchEvent(new CustomEvent("veev:cheer", { detail: "Done! Future pharmacist behavior. 💊✨" }));
                  }}
                  aria-label={`Done: ${e.title}`}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-line"
                />
                <div className="flex-1">
                  <div className="font-medium">{e.title}</div>
                  <div className="text-xs text-ink-3">
                    {fmtDate(e.date, { weekday: "short", month: "short", day: "numeric" })} · {d > 0 ? `in ${d} day${d === 1 ? "" : "s"}` : d === 0 ? "today!" : "passed"}
                  </div>
                </div>
                <button onClick={() => addToCalendar([{ title: `📚 ${e.title}`, date: e.date, time: "09:00", note: "You studied. You've got this." }, { title: `📚 Study for ${e.title}`, date: addDays(e.date, -3), time: "18:00" }], "exam")} aria-label="Add to calendar" className="text-ink-3">
                  <CalendarPlus size={16} />
                </button>
              </div>
            );
          })}
        </div>
        <Input className="mt-3" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Chem midterm, lab report, application…" />
        <div className="mt-2 flex gap-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date" className="flex-1 rounded-2xl border border-line bg-surface px-3 py-2.5 text-sm" />
          <Button size="sm" onClick={add} disabled={!title.trim() || !date}>
            Add
          </Button>
        </div>
      </Section>
      <Link href="/voice?topic=school" className="card flex items-center gap-3 p-4">
        <Mic size={18} className="text-gold" />
        <div>
          <div className="font-medium">Study buddy mode</div>
          <div className="text-sm text-ink-3">Quiz me, plan my week, or calm my exam nerves</div>
        </div>
      </Link>
    </div>
  );
}
