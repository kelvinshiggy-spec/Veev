export type ID = string;

export type Directness = "gentle" | "firm" | "straight";
export type ClarityStance = "support" | "reflect" | "challenge" | "practical" | "coach";

export interface Profile {
  name: string;
  becoming: string;
  idealLife: string;
  happiness: string;
  hobbies: string[];
  goals: string[];
  whySober: string;
  afterFirstDrink: string;
  appealingSituations: string[];
  warningSigns: string[];
  copingTools: string[];
  grounding: string[];
  safePeople: string;
  communicationStyle: string;
  directness: Directness;
  futureSelfNote: string;
  sobrietyStart: string; // yyyy-mm-dd
  dailyDrinkSpend: number;
  currency: string;
  onboarded: boolean;
  // 2.0
  qualities: string[]; // Who I'm Becoming
  values: string[];
  familyHopes: string;
  moneyHopes: string;
  fitnessGoals: string;
  soberJoys: string; // positive sober experiences, in her words
  personalized: boolean; // finished the full personalization (vs quick start)
  myWorld: string[]; // pets, people, little things her companion can ask about
  family: string; // parents and family, in her words
  favMovies: string;
  favMusic: string;
}

export type PersonaId = "mila" | "sophie" | "elle" | "luna" | "chloe" | "claire" | "james" | "vylie";

export interface Companion {
  persona: PersonaId;
  name: string;
  voiceURI: string; // device voice; "" = best available
  rate: number; // 0.8 - 1.2
  warmth: number; // 1-5
  enthusiasm: number; // 1-5
  affectionate: boolean; // terms like "love" in greetings (never claims feelings)
  greeting: string;
  subtitles: boolean;
  handsFree: boolean; // automatic turn-taking
  saveTranscripts: boolean;
}

export interface Manifesto {
  title: string;
  text: string;
  approved: boolean;
  updatedAt: string;
  photoIds: string[];
  recordingId?: string;
  recordingType?: "audio" | "video";
  inMorning: boolean;
}

export interface Streak {
  start: string; // yyyy-mm-dd
  end?: string; // yyyy-mm-dd, last sober day
}

export interface CheckIn {
  id: ID;
  date: string; // yyyy-mm-dd
  at: string;
  mood: number; // 1-5
  energy: number; // 1-5
  emotions: string[];
  craving: number; // 0-10
  sleepHours?: number;
  note?: string;
}

export interface CravingEvent {
  id: ID;
  at: string;
  alreadyDrank: boolean;
  intensity: number;
  hopes: string[];
  trigger: string;
  outcome?: "passed" | "eased" | "still" | "drank";
  intensityAfter?: number;
  tools: string[];
}

export interface Letter {
  id: ID;
  situation: string;
  title: string;
  body: string;
  mediaId?: string;
  mediaType?: "audio" | "video";
  createdAt: string;
  openedCount: number;
}

export interface Memory {
  id: ID;
  category: string;
  title: string;
  body: string;
  prompt?: string;
  mediaId?: string;
  mediaType?: "audio" | "video" | "image";
  createdAt: string;
}

export type EntryKind =
  | "room"
  | "morning"
  | "evening"
  | "accountability"
  | "perspective"
  | "pause"
  | "studio"
  | "reflection"
  | "voice";

export interface JournalEntry {
  id: ID;
  kind: EntryKind;
  createdAt: string;
  title?: string;
  mode?: string;
  fields: Record<string, string>;
  aiResponse?: string;
  forTherapy?: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  at: string;
}

export interface ChatThread {
  id: ID;
  title: string;
  stance: ClarityStance;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageDraft {
  id: ID;
  to: string;
  original: string;
  rewritten?: string;
  style?: string;
  createdAt: string;
}

export interface PauseDecision {
  id: ID;
  action: string;
  kind: string;
  answers: Record<string, string>;
  coolUntil?: string;
  outcome?: "waited" | "acted" | "let-go";
  createdAt: string;
}

export interface Appointment {
  id: ID;
  at: string; // ISO local datetime
  with: string;
  note?: string;
}

export interface TherapyItem {
  id: ID;
  text: string;
  done?: boolean;
  createdAt: string;
}

export interface Therapy {
  appointments: Appointment[];
  homework: TherapyItem[];
  skills: TherapyItem[];
  questions: TherapyItem[];
  takeaways: TherapyItem[];
  goals: TherapyItem[];
  summaries: { id: ID; createdAt: string; text: string }[];
}

export interface Contact {
  id: ID;
  name: string;
  role: string;
  phone: string;
  supports: string[];
}

export interface VisionItem {
  id: ID;
  category: string;
  title: string;
  note: string;
  affirmation: string;
  imageId?: string;
  targetDate?: string;
  progress: number;
  milestones: { id: ID; text: string; done: boolean }[];
  createdAt: string;
}

export interface Fund {
  id: ID;
  name: string;
  target: number;
  deposits: { id: ID; amount: number; date: string; note?: string }[];
}

export interface Habit {
  id: ID;
  name: string;
  days: number[]; // 0-6, which weekdays it applies
  log: Record<string, boolean>;
  archived?: boolean;
}

export interface Activity {
  id: ID;
  title: string;
  category: string;
  notes: string;
  date?: string;
  status: "idea" | "planned" | "done";
  bucket: boolean;
  with: "alone" | "family" | "partner" | "friends";
  createdAt: string;
}

export type IdeaTarget = "goal" | "vision" | "plan" | "bucket" | "habit" | "letter-idea" | "note";

export interface Idea {
  id: ID;
  raw: string;
  createdAt: string;
  status: "inbox" | "built" | "archived";
  builtAs?: { kind: IdeaTarget; refId?: string; summary: string };
}

export interface Reminders {
  enabled: boolean;
  morning: string; // HH:MM
  evening: string;
  friday: boolean;
  privateText: boolean;
  tone: "warm" | "direct" | "minimal";
  lastShown: Record<string, string>;
  quietStart: string; // HH:MM
  quietEnd: string;
  weekend: boolean;
  topics: string[];
  maxPerDay: number;
}

export interface Settings {
  theme: "auto" | "system" | "light" | "dark";
  themeV2?: boolean;
  coverPhotoIds: string[]; // her own photos for the dashboard
  editions: { morning: boolean; evening: boolean };
  weather?: { lat: number; lon: number; unit: "f" | "c" }; // opt-in, rounded to ~1 km
  reducedMotion: boolean;
  haptics: boolean;
  aiConsent: boolean;
  aiMemory: Record<string, boolean>;
  patternsConsent: boolean;
  lockMinutes: number;
  faith: boolean;
  ritualHidden: string[];
}

export interface Vault {
  version: 1;
  updatedAt: string;
  profile: Profile;
  streaks: Streak[];
  checkIns: CheckIn[];
  intentions: Record<string, string>;
  cravings: CravingEvent[];
  letters: Letter[];
  memories: Memory[];
  journal: JournalEntry[];
  chats: ChatThread[];
  drafts: MessageDraft[];
  pauses: PauseDecision[];
  therapy: Therapy;
  contacts: Contact[];
  vision: VisionItem[];
  futureDay: Record<string, string>;
  funds: Fund[];
  habits: Habit[];
  activities: Activity[];
  ideas: Idea[];
  customSkills: { id: ID; name: string; steps: string; from: string }[];
  reminders: Reminders;
  settings: Settings;
  companion: Companion;
  manifesto: Manifesto;
  usage: { month: string; aiCalls: number; voiceMinutes: number };
}
