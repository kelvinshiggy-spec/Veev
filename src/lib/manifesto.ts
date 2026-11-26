import type { Profile } from "./types";

const lower = (s: string) => s.trim().replace(/[.!]+$/, "");
const listify = (items: string[]) => {
  const xs = items.map((x) => x.trim()).filter(Boolean);
  if (xs.length <= 1) return xs[0] ?? "";
  return `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
};
const lc = (s: string) => (s ? s[0].toLowerCase() + s.slice(1) : s);

/**
 * A first draft built only from her own answers, on the device. No AI needed, works offline.
 * She edits and approves it before it's used anywhere.
 */
export function draftManifesto(p: Profile): string {
  const lines: string[] = [];
  const loves = p.hobbies.slice(0, 5).map(lc);
  const qualities = p.qualities.slice(0, 4).map(lc);

  if (p.idealLife.trim()) lines.push(`I am building a life that looks like this: ${lower(p.idealLife)}.`);
  else lines.push("I am building a life filled with peace, meaningful relationships, beautiful experiences and genuine happiness.");

  if (loves.length) lines.push(`I want more of what lights me up: ${listify(loves)}.`);
  if (p.familyHopes.trim()) lines.push(`For my family, I hope for ${lc(lower(p.familyHopes))}.`);
  if (qualities.length) lines.push(`I am becoming someone who is ${listify(qualities)}.`);
  else if (p.becoming.trim()) lines.push(`I am becoming ${lc(lower(p.becoming))}.`);
  if (p.moneyHopes.trim()) lines.push(`I am building freedom with my money: ${lc(lower(p.moneyHopes))}.`);
  if (p.fitnessGoals.trim()) lines.push(`I take care of my body: ${lc(lower(p.fitnessGoals))}.`);
  if (p.soberJoys.trim()) lines.push(`Sober, I get to have this: ${lc(lower(p.soberJoys))}.`);
  if (p.whySober.trim()) lines.push(`I stay sober because ${lc(lower(p.whySober))}.`);

  lines.push("I do not need alcohol to celebrate my wins, enjoy my weekends or escape hard feelings.");
  lines.push("I can feel something uncomfortable without acting on it right away.");
  lines.push("I can hear a different perspective without feeling erased.");
  lines.push("I can own my mistakes and keep my self-respect.");
  if (p.values.length) lines.push(`I let ${listify(p.values.slice(0, 4).map(lc))} guide my choices.`);
  lines.push("I am building something meaningful.");
  lines.push("This is the life I choose to protect.");
  return lines.join("\n");
}

/** Answers sent to the AI to write a more polished draft (only with her consent). */
export function manifestoAnswers(p: Profile): string {
  const rows: [string, string][] = [
    ["Name", p.name],
    ["Who I want to become", p.becoming],
    ["Qualities I'm growing into", p.qualities.join(", ")],
    ["My values", p.values.join(", ")],
    ["My ideal life", p.idealLife],
    ["What makes me happy", p.happiness],
    ["What I love", p.hobbies.join(", ")],
    ["Family hopes", p.familyHopes],
    ["Money and freedom", p.moneyHopes],
    ["Fitness and health", p.fitnessGoals],
    ["What I love about sober life", p.soberJoys],
    ["Why I stay sober", p.whySober],
    ["Goals", p.goals.join(", ")],
  ];
  return rows
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `${k}: ${v.trim()}`)
    .join("\n");
}
