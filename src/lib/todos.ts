import type { Todo, Vault } from "./types";
import { dayKey, uid } from "./util";

/** Split something like "gym, call mom and then skincare" into separate items. */
export function splitTasks(text: string): string[] {
  return text
    .split(/\s*(?:[,;\n]|\band then\b|\bthen\b|\balso\b)\s*/i)
    .map((t) => t.replace(/^(and|i need to|i have to|i gotta|i want to|i wanna|to)\s+/i, "").replace(/[.!]+$/, "").trim())
    .filter((t) => t.length > 1)
    .map((t) => t[0].toUpperCase() + t.slice(1))
    .slice(0, 12);
}

export function addTodos(v: Vault, texts: string[], from: Todo["from"] = "me", date = dayKey()): Vault {
  const have = new Set(v.todos.filter((t) => t.date === date).map((t) => t.text.toLowerCase()));
  const fresh = texts
    .map((t) => t.trim().slice(0, 140))
    .filter((t) => t && !have.has(t.toLowerCase()))
    .map((text) => ({ id: uid(), text, date, done: false, from }));
  // Keep roughly two months so the list never grows without bound.
  const cutoff = new Date(Date.now() - 60 * 86400_000).toISOString().slice(0, 10);
  return { ...v, todos: [...v.todos.filter((t) => t.date >= cutoff), ...fresh] };
}

/** Loose match so "check off gym" finds "Gym at 6". */
export function findTodo(todos: Todo[], text: string): Todo | undefined {
  const q = text.toLowerCase().trim();
  return todos.find((t) => t.text.toLowerCase() === q) ?? todos.find((t) => t.text.toLowerCase().includes(q) || q.includes(t.text.toLowerCase()));
}

export const ASK_LINES = [
  "So, what's going on today?",
  "Okay babe, what's the plan today? Tell me everything.",
  "What are we getting done today, bestie?",
  "Spill: what's on the agenda today?",
];

export const ADDED_LINES = ["Love that. It's on the list.", "Done, added. Look at you, organized queen.", "Noted, bestie.", "Ooh okay, plans. I'm here for it."];

export const DONE_LINES = [
  "Yesss, one down!",
  "Okay productive queen!",
  "Look at you go.",
  "Obsessed with this energy.",
  "Checked. That's my girl.",
  "We love a girl who follows through.",
  "Another one! Iconic.",
];

export const ALL_DONE_LINES = [
  "Everything's done?! Okay, you're actually unstoppable.",
  "List cleared. Go do something cute for yourself.",
  "All done, bestie. Proud of you, for real.",
];

export const UNDO_LINES = ["No stress, it's back on the list.", "Okay, unchecked. We'll get it."];

export const SUGGESTIONS = ["Workout", "Drink water", "Skincare", "Feed Cookies & Codie", "Text someone I love", "Go for a walk", "Read 10 pages", "Early night"];

export const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
