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
  { key: "qualities", label: "Qualities you're growing into" },
  { key: "values", label: "Your values" },
  { key: "lifeHopes", label: "Family, money and fitness hopes" },
  { key: "soberJoys", label: "What you love about sober life" },
  { key: "myWorld", label: "Your world (pets, people, little things)" },
  { key: "family", label: "Your parents and family" },
  { key: "tastes", label: "Movies, shows and music you love" },
  { key: "manifesto", label: "Your Life Manifesto (once approved)" },
  { key: "patterns", label: "Triggers and impulses you're working on" },
];

export function emptyVault(): Vault {
  const now = new Date().toISOString();
  return {
    version: 1,
    updatedAt: now,
    profile: {
      name: "Veev",
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
      qualities: [],
      values: [],
      familyHopes: "",
      moneyHopes: "",
      fitnessGoals: "",
      soberJoys: "",
      personalized: false,
      myWorld: ["My cats, Cookies and Codie"],
      bpdTriggers: ["Feeling abandoned, ignored or left out", "Push-pull relationships (intense highs, painful lows)"],
      impulses: ["Saying hurtful things during arguments", "Impulse spending", "Driving fast when upset"],
      family: "",
      favMovies: "",
      favMusic: "EDM and Afrobeats",
    },
    streaks: [],
    checkIns: [],
    intentions: {},
    todos: [],
    lookbook: [],
    quickMood: {},
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
      quietStart: "22:30",
      quietEnd: "07:30",
      weekend: true,
      topics: ["sobriety", "joy", "perspective", "future"],
      maxPerDay: 3,
    },
    settings: {
      theme: "auto",
      themeV2: true,
      coverPhotoIds: [],
      editions: { morning: true, evening: true },
      reducedMotion: false,
      haptics: true,
      aiConsent: false,
      aiMemory: Object.fromEntries(AI_MEMORY_KEYS.map((k) => [k.key, true])),
      patternsConsent: false,
      lockMinutes: 5,
      faith: true,
      ritualHidden: [],
    },
    companion: {
      persona: "vylie",
      name: "Vylie",
      voiceURI: "",
      rate: 1,
      warmth: 4,
      enthusiasm: 3,
      affectionate: false,
      greeting: "",
      subtitles: true,
      handsFree: true,
      saveTranscripts: false,
    },
    manifesto: { title: "The Life I'm Building", text: "", approved: false, updatedAt: "", photoIds: [], inMorning: true },
    usage: { month: "", aiCalls: 0, voiceMinutes: 0 },
  };
}

/** Fill any fields missing from older saved vaults */
export function migrate(v: Partial<Vault>): Vault {
  const base = emptyVault();
  const settings = { ...base.settings, ...(v.settings ?? {}) } as Vault["settings"];
  // 2.0: VEEV became brighter. Anyone still on the old default ("follow the phone") moves to
  // automatic day/night once. A deliberate light or dark choice is kept.
  if (!v.settings?.themeV2) {
    if (settings.theme === "system") settings.theme = "auto";
    settings.themeV2 = true;
  }
  return {
    ...base,
    ...v,
    profile: { ...base.profile, ...(v.profile ?? {}) },
    therapy: { ...base.therapy, ...(v.therapy ?? {}) },
    reminders: { ...base.reminders, ...(v.reminders ?? {}) },
    companion: { ...base.companion, ...(v.companion ?? {}) },
    manifesto: { ...base.manifesto, ...(v.manifesto ?? {}) },
    usage: { ...base.usage, ...(v.usage ?? {}) },
    settings: {
      ...settings,
      editions: { ...base.settings.editions, ...(v.settings?.editions ?? {}) },
      aiMemory: { ...base.settings.aiMemory, ...(v.settings?.aiMemory ?? {}) },
    },
  } as Vault;
}
