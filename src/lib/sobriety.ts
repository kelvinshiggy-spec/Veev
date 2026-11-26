import type { Streak, Vault } from "./types";
import { dayKey, daysBetween } from "./util";

/** A streak runs from `start` (first sober day) to `end` (the day of a lapse). Open streaks have no end. */
const len = (s: Streak, today: string) => Math.max(0, daysBetween(s.start, s.end ?? today));

export function sobrietyStats(v: Vault, today = dayKey()) {
  const streaks = v.streaks.length ? v.streaks : [{ start: v.profile.sobrietyStart }];
  const open = streaks.find((s) => !s.end);
  const current = open ? len(open, today) : 0;
  const total = streaks.reduce((a, s) => a + len(s, today), 0);
  const longest = streaks.reduce((a, s) => Math.max(a, len(s, today)), 0);
  const estSaved = total * (v.profile.dailyDrinkSpend || 0);
  return { current, total, longest, estSaved, since: open?.start, open: !!open, streaks };
}

export const MILESTONES = [1, 3, 7, 14, 21, 30, 45, 60, 90, 120, 180, 270, 365, 500, 730, 1000, 1095];

export function nextMilestone(days: number) {
  return MILESTONES.find((m) => m > days) ?? Math.ceil((days + 1) / 365) * 365;
}

export function milestoneLabel(d: number) {
  if (d === 365) return "One year";
  if (d === 730) return "Two years";
  if (d === 1095) return "Three years";
  if (d % 30 === 0 && d < 365) return `${d / 30} month${d === 30 ? "" : "s"}`;
  return `${d} day${d === 1 ? "" : "s"}`;
}

/** Record a lapse while preserving every previous sober day. */
export function recordLapse(v: Vault, lapseDay: string, restartDay: string): Vault {
  const streaks = (v.streaks.length ? v.streaks : [{ start: v.profile.sobrietyStart }]).map((s) =>
    s.end ? s : { ...s, end: lapseDay },
  );
  streaks.push({ start: restartDay });
  return { ...v, streaks, profile: { ...v.profile, sobrietyStart: restartDay } };
}
