import type { Fitness } from "./types";
import { addDays } from "./util";

export const STRENGTH_FOCUS = ["Legs & glutes", "Upper body", "Back & biceps", "Chest & triceps", "Shoulders & arms", "Full body", "Core & abs"];
export const CARDIO_FOCUS = ["Walk", "Incline walk", "Stairmaster", "Run", "Bike", "Dance cardio", "Hike", "Pilates"];

// Her goal: full body, leaner, glutes + legs + abs. Indexed by weekday (Sun = 0).
const ROTATION = ["Core & abs", "Legs & glutes", "Upper body", "Full body", "Legs & glutes", "Core & abs", "Full body"];

export const EXERCISES: Record<string, string[]> = {
  "Legs & glutes": ["Squats", "Hip thrusts", "Romanian deadlifts", "Bulgarian split squats", "Leg press", "Walking lunges", "Abductors", "Leg curls"],
  "Upper body": ["Lat pulldowns", "Seated rows", "Shoulder press", "Chest press", "Bicep curls", "Tricep pushdowns"],
  "Back & biceps": ["Lat pulldowns", "Cable rows", "Single-arm rows", "Face pulls", "Hammer curls", "Bicep curls"],
  "Chest & triceps": ["Dumbbell press", "Incline press", "Cable flys", "Assisted dips", "Overhead extensions", "Tricep pushdowns"],
  "Shoulders & arms": ["Shoulder press", "Lateral raises", "Rear-delt flys", "Bicep curls", "Tricep kickbacks"],
  "Full body": ["Goblet squats", "Deadlifts", "Push-ups", "Dumbbell rows", "Walking lunges", "Plank"],
  "Core & abs": ["Dead bugs", "Cable crunches", "Pallof press", "Leg raises", "Side planks", "Plank"],
};

/** What to train tomorrow, based on what she trained today. */
export const TOMORROW: Record<string, string> = {
  "Legs & glutes": "Upper body + a core finisher",
  "Upper body": "Legs & glutes",
  "Back & biceps": "Legs & glutes",
  "Chest & triceps": "Legs & glutes",
  "Shoulders & arms": "Legs & glutes",
  "Full body": "Core & abs + a longer walk",
  "Core & abs": "Legs & glutes",
  "Upper body + a core finisher": "Legs & glutes",
};

const TIPS: Record<string, string> = {
  "Legs & glutes": "Hip thrusts, Romanian deadlifts, Bulgarian split squats, leg press, abductors. 3–4 sets each.",
  "Upper body": "Lat pulldowns, seated rows, shoulder press, chest press, bicep curls, tricep pushdowns.",
  "Back & biceps": "Lat pulldowns, cable rows, single-arm rows, face pulls, hammer curls.",
  "Chest & triceps": "Dumbbell press, incline press, cable flys, dips (assisted is great), overhead extensions.",
  "Shoulders & arms": "Shoulder press, lateral raises, rear-delt flys, curls, tricep kickbacks.",
  "Full body": "Goblet squats, deadlifts, push-ups, rows, walking lunges, a plank to finish.",
  "Core & abs": "Dead bugs, cable crunches, Pallof press, leg raises, side planks.",
};

/** Vylie's pick for today's strength focus: whatever she hasn't hit recently, in a balanced rotation. */
export function suggestFocus(f: Fitness, today: string): { focus: string; tip: string } {
  const recent = new Set<string>();
  for (let i = 1; i <= 3; i++) {
    const day = f.log[addDays(today, -i)];
    Object.values(day ?? {}).forEach((e) => e.done && e.focus && recent.add(e.focus));
  }
  const start = new Date(`${today}T12:00:00`).getDay();
  for (let i = 0; i < ROTATION.length; i++) {
    const pick = ROTATION[(start + i) % ROTATION.length];
    if (!recent.has(pick)) return { focus: pick, tip: TIPS[pick] };
  }
  return { focus: "Full body", tip: TIPS["Full body"] };
}

export const CARDIO_IDEAS = [
  "Hot girl walk with a podcast",
  "Incline walk, 12% at a steady pace (glutes say thank you)",
  "Stairmaster intervals: 2 minutes steady, 1 minute faster",
  "Sunset walk around the neighborhood",
  "Dance cardio to Afrobeats",
  "Bike ride with an EDM playlist",
  "Easy hike, phone in your pocket",
];

export const WORKOUT_HYPE = [
  "Gym girl era is SO real. Proud of you!",
  "Strong looks so good on you.",
  "You said you would and you did. That's the energy.",
  "Another one in the books. Iconic.",
  "Your future self just high-fived you.",
];

export function dayCount(f: Fitness, day: string) {
  return Object.values(f.log[day] ?? {}).filter((e) => e.done).length;
}

export function minutesOn(f: Fitness, day: string) {
  return Object.entries(f.log[day] ?? {}).reduce((a, [id, e]) => a + (e.done ? (e.mins ?? f.slots.find((s) => s.id === id)?.mins ?? 0) : 0), 0);
}

/** Days in a row (ending today or yesterday) with at least one workout. */
export function streak(f: Fitness, today: string) {
  let d = dayCount(f, today) ? today : addDays(today, -1);
  let n = 0;
  while (dayCount(f, d) > 0) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}
