import type { Vault, Habit } from "./types";
import { dayKey, uid } from "./util";

export const DEFAULT_HABITS = [
  "Protect my sobriety",
  "Move my body",
  "Sleep by 11",
  "Drink water",
  "A nourishing meal",
  "Journal",
  "Practice a therapy skill",
  "Family time",
  "Money habit",
  "Read or learn",
  "Morning ritual",
  "Evening ritual",
];

export function makeHabit(name: string): Habit {
  return { id: uid(), name, days: [0, 1, 2, 3, 4, 5, 6], log: {} };
}

export const AI_MEMORY_KEYS: { key: string; label: string }[] = [
  { key: "name", label: "Your name" },
  { key: "becoming", label: "Who you want to become" },
  { key: "goals", label: "Personal goals" },
  { key: "whySober", label: "Reasons for sobriety" },
  { key: "hobbies", label: "Favorite things and hobbies" },
  { key: "afterFirstDrink", label: "What happens after the first drink" },
  { key: "appealingSituations", label: "Known triggers" },
  { key: "warningSigns", label: "Early warning signs" },
  { key: "copingTools", label: "Therapy and coping tools" },
  { key: "grounding", label: "What grounds you" },
  { key: "communicationStyle", label: "Preferred communication style" },
  { key: "streak", label: "Your sober day count" },
  { key: "recentMood", label: "Today's check-in" },
  { key: "faith", label: "That faith matters to you" },
];

export function emptyVault(): Vault {
  const now = new Date().toISOString();
  return {
    version: 1,
    updatedAt: now,
    profile: {
      name: "",
      becoming: "",
      idealLife: "",
      happiness: "",
      hobbies: [],
      goals: [],
      whySober: "",
      afterFirstDrink: "",
      appealingSituations: [],
      warningSigns: [],
      copingTools: [],
      grounding: [],
      safePeople: "",
      communicationStyle: "",
      directness: "firm",
      futureSelfNote: "",
      sobrietyStart: dayKey(),
      dailyDrinkSpend: 25,
      currency: "USD",
      onboarded: false,
    },
    streaks: [],
    checkIns: [],
    intentions: {},
    cravings: [],
    letters: [],
    memories: [],
    journal: [],
    chats: [],
    drafts: [],
    pauses: [],
    therapy: { appointments: [], homework: [], skills: [], questions: [], takeaways: [], goals: [], summaries: [] },
    contacts: [],
    vision: [],
    futureDay: {},
    funds: [],
    habits: [],
    activities: [],
    ideas: [],
    customSkills: [],
    reminders: {
      enabled: false,
      morning: "08:00",
      evening: "21:00",
      friday: true,
      privateText: true,
      tone: "warm",
      lastShown: {},
    },
    settings: {
      theme: "system",
      reducedMotion: false,
      haptics: true,
      aiConsent: false,
      aiMemory: Object.fromEntries(AI_MEMORY_KEYS.map((k) => [k.key, true])),
      patternsConsent: false,
      lockMinutes: 5,
      faith: true,
      ritualHidden: [],
    },
  };
}

/** Fill any fields missing from older saved vaults */
export function migrate(v: Partial<Vault>): Vault {
  const base = emptyVault();
  return {
    ...base,
    ...v,
    profile: { ...base.profile, ...(v.profile ?? {}) },
    therapy: { ...base.therapy, ...(v.therapy ?? {}) },
    reminders: { ...base.reminders, ...(v.reminders ?? {}) },
    settings: {
      ...base.settings,
      ...(v.settings ?? {}),
      aiMemory: { ...base.settings.aiMemory, ...(v.settings?.aiMemory ?? {}) },
    },
  } as Vault;
}
