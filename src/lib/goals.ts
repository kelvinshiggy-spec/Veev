import type { Goal } from "./types";

export function goalProgress(g: Goal) {
  const steps = g.steps.length ? g.steps.filter((s) => s.done).length / g.steps.length : 0;
  if (!g.money?.target) return Math.round(steps * 100);
  const saved = g.money.deposits.reduce((a, d) => a + d.amount, 0);
  return Math.round(((steps + Math.min(1, saved / g.money.target)) / 2) * 100);
}

export function nextStep(g: Goal) {
  return g.steps.find((s) => !s.done);
}

