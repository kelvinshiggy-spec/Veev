import type { Vault } from "./types";
import { addDays, dayKey, daysBetween, parseDay } from "./util";
import { sobrietyStats, MILESTONES, milestoneLabel } from "./sobriety";

const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function series(v: Vault, days = 30) {
  const today = dayKey();
  const out: { key: string; label: string; mood: number | null; craving: number | null; sleep: number | null }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const k = addDays(today, -i);
    const cs = v.checkIns.filter((c) => c.date === k);
    const avg = (f: (c: (typeof cs)[number]) => number | undefined) => {
      const vals = cs.map(f).filter((x): x is number => typeof x === "number");
      return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null;
    };
    out.push({
      key: k,
      label: parseDay(k).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      mood: avg((c) => c.mood),
      craving: avg((c) => c.craving),
      sleep: avg((c) => c.sleepHours),
    });
  }
  return out;
}

export interface Observation {
  text: string;
  why: string; // the data behind it (observation), kept separate from the suggestion
  action?: { label: string; href: string };
}

/**
 * Gentle, transparent observations from what Veev reported. These describe her own
 * entries; they don't predict relapse or anything else.
 */
export function observations(v: Vault): Observation[] {
  const out: Observation[] = [];
  const cs = v.checkIns;
  if (cs.length >= 6) {
    // cravings by weekday
    const by: Record<number, number[]> = {};
    cs.forEach((c) => (by[parseDay(c.date).getDay()] ??= []).push(c.craving));
    const overall = cs.reduce((a, c) => a + c.craving, 0) / cs.length;
    const top = Object.entries(by)
      .filter(([, arr]) => arr.length >= 2)
      .map(([d, arr]) => ({ d: Number(d), avg: arr.reduce((a, b) => a + b, 0) / arr.length, n: arr.length }))
      .sort((a, b) => b.avg - a.avg)[0];
    if (top && top.avg >= overall + 1.5 && top.avg >= 3)
      out.push({
        text: `You've reported stronger cravings on ${DOW[top.d]}s. Would you like to plan something enjoyable for the next one?`,
        why: `${DOW[top.d]} average ${top.avg.toFixed(1)}/10 across ${top.n} check-ins, versus ${overall.toFixed(1)} overall.`,
        action: { label: "Plan something", href: "/future/sober-life" },
      });

    // sleep vs mood
    const withSleep = cs.filter((c) => typeof c.sleepHours === "number");
    const low = withSleep.filter((c) => c.sleepHours! < 6);
    const ok = withSleep.filter((c) => c.sleepHours! >= 7);
    if (low.length >= 2 && ok.length >= 2) {
      const m = (a: typeof cs) => a.reduce((x, c) => x + c.mood, 0) / a.length;
      const k = (a: typeof cs) => a.reduce((x, c) => x + c.craving, 0) / a.length;
      if (m(ok) - m(low) >= 0.8 || k(low) - k(ok) >= 1.5)
        out.push({
          text: "Your entries suggest poor sleep and harder days sometimes show up together. Would an earlier evening routine help?",
          why: `Under 6 hours: mood ${m(low).toFixed(1)}, craving ${k(low).toFixed(1)}. 7+ hours: mood ${m(ok).toFixed(1)}, craving ${k(ok).toFixed(1)}.`,
          action: { label: "Evening ritual", href: "/journey/rituals?evening=1" },
        });
    }

    // good mood + cravings (confidence / celebration pattern)
    const goodButPulled = cs.filter((c) => c.mood >= 4 && c.craving >= 5);
    if (goodButPulled.length >= 2)
      out.push({
        text: "Some of your stronger pulls have come on days you felt good. That's common. Would it help to plan how you'll celebrate wins?",
        why: `${goodButPulled.length} check-ins with mood 4+ and craving 5+.`,
        action: { label: "Handling success", href: "/clarity/studio/handling-success" },
      });
  }

  // triggers from craving events
  const trig: Record<string, number> = {};
  v.cravings.forEach((c) => c.trigger.split(" · ").filter(Boolean).forEach((t) => (trig[t] = (trig[t] ?? 0) + 1)));
  const topTrig = Object.entries(trig).sort((a, b) => b[1] - a[1])[0];
  if (topTrig && topTrig[1] >= 2)
    out.push({
      text: `“${topTrig[0]}” has come up most often before cravings. Is there a skill or plan you'd like ready for it?`,
      why: `Mentioned in ${topTrig[1]} of ${v.cravings.length} craving moments.`,
      action: { label: "Wellness Studio", href: "/clarity/studio" },
    });

  // emotions that co-occur with cravings
  const emo: Record<string, number[]> = {};
  cs.forEach((c) => c.emotions.forEach((e) => (emo[e] ??= []).push(c.craving)));
  const hot = Object.entries(emo)
    .filter(([, a]) => a.length >= 3)
    .map(([e, a]) => ({ e, avg: a.reduce((x, y) => x + y, 0) / a.length }))
    .sort((a, b) => b.avg - a.avg)[0];
  if (hot && hot.avg >= 5)
    out.push({
      text: `When you feel ${hot.e.toLowerCase()}, cravings have tended to be stronger. Worth noticing early.`,
      why: `Average craving ${hot.avg.toFixed(1)}/10 on days you chose “${hot.e}”.`,
    });

  // positive pattern
  const managed = v.cravings.filter((c) => c.outcome === "passed" || c.outcome === "eased");
  if (managed.length >= 2)
    out.push({
      text: `You've ridden out ${managed.length} cravings with VEEV. Would you like to revisit some good sober memories?`,
      why: `${managed.length} craving moments recorded as passed or eased.`,
      action: { label: "Memories", href: "/future/memories" },
    });

  // missed routines
  const habits = v.habits.filter((h) => !h.archived);
  if (habits.length) {
    const last7 = Array.from({ length: 7 }, (_, i) => addDays(dayKey(), -i));
    const rate = habits.map((h) => ({ h, n: last7.filter((d) => h.log[d]).length }));
    const quiet = rate.filter((r) => r.n === 0 && Object.keys(r.h.log).length > 0);
    if (quiet.length)
      out.push({
        text: `“${quiet[0].h.name}” has been quiet this week. No pressure. Want to try it once in the next few days?`,
        why: "No check-offs in the last 7 days.",
        action: { label: "Habits", href: "/journey/habits" },
      });
  }
  return out;
}

export function achievements(v: Vault) {
  const s = sobrietyStats(v);
  const list: { title: string; sub: string }[] = [];
  MILESTONES.filter((m) => m <= s.longest).forEach((m) => list.push({ title: milestoneLabel(m), sub: "of sobriety" }));
  const managed = v.cravings.filter((c) => c.outcome === "passed" || c.outcome === "eased").length;
  if (managed) list.push({ title: `${managed} cravings`, sub: "ridden out" });
  if (v.memories.length) list.push({ title: `${v.memories.length} memories`, sub: "captured sober" });
  if (v.letters.length) list.push({ title: `${v.letters.length} letters`, sub: "to future you" });
  const studio = v.journal.filter((j) => j.kind === "studio").length;
  if (studio) list.push({ title: `${studio} skill sessions`, sub: "practiced" });
  const done = v.activities.filter((a) => a.status === "done").length;
  if (done) list.push({ title: `${done} experiences`, sub: "enjoyed clear-headed" });
  return list;
}

export function weekRange(offset = 0) {
  const end = addDays(dayKey(), -7 * offset);
  const start = addDays(end, -6);
  return { start, end };
}

export function weekly(v: Vault, offset = 0) {
  const { start, end } = weekRange(offset);
  const inR = (iso: string) => {
    const k = iso.length === 10 ? iso : dayKey(new Date(iso));
    return k >= start && k <= end;
  };
  const s = sobrietyStats(v, end);
  const ci = v.checkIns.filter((c) => inR(c.date));
  const avgMood = ci.length ? ci.reduce((a, c) => a + c.mood, 0) / ci.length : null;
  const emotions: Record<string, number> = {};
  ci.forEach((c) => c.emotions.forEach((e) => (emotions[e] = (emotions[e] ?? 0) + 1)));
  const cravings = v.cravings.filter((c) => inR(c.at));
  const managed = cravings.filter((c) => c.outcome === "passed" || c.outcome === "eased").length;
  const soberThisWeek = Array.from({ length: 7 }, (_, i) => addDays(start, i)).filter((d) =>
    s.streaks.some((st) => d >= st.start && (!st.end || d < st.end)),
  ).length;
  const habitDays = v.habits.reduce((a, h) => a + Object.entries(h.log).filter(([d, on]) => on && d >= start && d <= end).length, 0);
  const gym = v.habits.filter((h) => /gym|move|workout|train|run|fitness/i.test(h.name)).reduce((a, h) => a + Object.entries(h.log).filter(([d, on]) => on && d >= start && d <= end).length, 0);
  const tools = new Map<string, number>();
  cravings.forEach((c) => c.tools.forEach((t) => tools.set(t, (tools.get(t) ?? 0) + 1)));
  v.journal.filter((j) => j.kind === "studio" && inR(j.createdAt)).forEach((j) => tools.set(j.title ?? "Studio", (tools.get(j.title ?? "Studio") ?? 0) + 1));
  const experiences = v.activities.filter((a) => a.status === "done" && a.date && a.date >= start && a.date <= end);
  const memories = v.memories.filter((m) => inR(m.createdAt));
  const therapyTopics = v.journal.filter((j) => j.forTherapy && inR(j.createdAt));
  const ahead = v.activities.filter((a) => a.status === "planned" && a.date && a.date > end).slice(0, 4);
  return {
    start,
    end,
    s,
    soberThisWeek,
    estSaved: soberThisWeek * v.profile.dailyDrinkSpend,
    checkIns: ci.length,
    avgMood,
    topEmotions: Object.entries(emotions).sort((a, b) => b[1] - a[1]).slice(0, 4),
    cravings: cravings.length,
    managed,
    habitDays,
    gym,
    tools: [...tools.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4),
    experiences,
    memories,
    therapyTopics,
    ahead,
    days: daysBetween(start, end) + 1,
  };
}
