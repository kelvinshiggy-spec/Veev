// A positive DBT skills toolkit: self-help practice alongside her therapist, never a diagnosis.

export type DbtModule = "Mindfulness" | "Distress tolerance" | "Emotion regulation" | "Relationships";

export interface DbtSkill {
  id: string;
  name: string;
  module: DbtModule;
  emoji: string;
  vibe: string; // one-line, positive
  steps: string[];
  studio?: string; // guided session id in the app, if there is one
  for?: string[]; // feelings/moments it suits
}

export const DBT_MODULES: { id: DbtModule; emoji: string; blurb: string }[] = [
  { id: "Mindfulness", emoji: "🌿", blurb: "Being right here, on purpose." },
  { id: "Distress tolerance", emoji: "🧊", blurb: "Getting through big moments without making them bigger." },
  { id: "Emotion regulation", emoji: "🌈", blurb: "Understanding feelings and riding the waves." },
  { id: "Relationships", emoji: "💞", blurb: "Asking for what you need and keeping your self-respect." },
];

export const DBT_SKILLS: DbtSkill[] = [
  { id: "wise-mind", name: "Wise Mind", module: "Mindfulness", emoji: "🦉", vibe: "The calm, knowing part of you that blends feelings and facts.", steps: ["Take a slow breath down to your belly.", "Ask: what do my feelings say? What do the facts say?", "Wait for the answer that feels quietly true.", "Let that guide your next step."], for: ["Overwhelmed", "Anxious"] },
  { id: "observe-describe", name: "Observe & Describe", module: "Mindfulness", emoji: "👀", vibe: "Notice it, name it, no judgment.", steps: ["Notice what's happening in your body and mind.", "Describe it in plain words: 'I notice tight shoulders and the thought I'm too much.'", "Skip the judgment. Just the facts.", "Let it be there for a moment."], for: ["Anxious", "Restless"] },
  { id: "one-mindfully", name: "One-Mindfully", module: "Mindfulness", emoji: "🎯", vibe: "Do one thing with your whole heart.", steps: ["Pick one thing: your coffee, your walk, your skincare.", "Put the phone away.", "When your mind wanders, gently bring it back.", "Enjoy being fully there."] },
  { id: "stop", name: "STOP", module: "Distress tolerance", emoji: "✋", vibe: "Your pause button for big moments.", steps: ["Stop. Freeze for a second.", "Take a step back. Breathe.", "Observe what's happening, inside and out.", "Proceed mindfully, toward what you actually want."], studio: "stop", for: ["Angry", "Irritable"] },
  { id: "tipp", name: "TIPP", module: "Distress tolerance", emoji: "🧊", vibe: "Change your body chemistry fast when emotions spike.", steps: ["Temperature: cold water on your face or hold ice.", "Intense exercise: 60 seconds of jumping jacks or a fast walk.", "Paced breathing: breathe out longer than in.", "Paired muscle relaxation: tense, then release."], studio: "tipp", for: ["Overwhelmed", "Angry"] },
  { id: "accepts", name: "ACCEPTS", module: "Distress tolerance", emoji: "🎬", vibe: "Healthy distractions until the wave passes.", steps: ["Activities: do something absorbing.", "Contributing: help someone.", "Comparisons: remember how far you've come.", "Emotions: watch or listen to something that sparks a different feeling.", "Pushing away: set it aside for now.", "Thoughts: count, puzzle, read.", "Sensations: a hot shower, a cold drink, a cozy blanket."], for: ["Restless", "Empty"] },
  { id: "self-soothe", name: "Self-Soothe", module: "Distress tolerance", emoji: "🕯️", vibe: "Comfort through your five senses.", steps: ["See: something beautiful.", "Hear: a calm song.", "Smell: a candle or lotion.", "Taste: tea or something sweet, slowly.", "Touch: a soft blanket, or Cookies and Codie."], for: ["Sad", "Lonely"] },
  { id: "radical-acceptance", name: "Radical Acceptance", module: "Distress tolerance", emoji: "🕊️", vibe: "Accepting what is, so you can move forward.", steps: ["Notice where you're fighting reality.", "Remind yourself: this is what's happening right now.", "Let your body soften: open hands, relaxed shoulders.", "Ask: given this, what's my best next step?"], studio: "radical-acceptance" },
  { id: "check-the-facts", name: "Check the Facts", module: "Emotion regulation", emoji: "🔍", vibe: "Make sure the story matches what actually happened.", steps: ["What happened? Just the facts.", "What am I assuming?", "What else could explain it?", "Does my emotion fit the facts, and how big?"], studio: "check-the-facts", for: ["Abandoned", "Rejected", "Misunderstood"] },
  { id: "opposite-action", name: "Opposite Action", module: "Emotion regulation", emoji: "🔄", vibe: "When a feeling doesn't fit the facts, do the opposite of its urge.", steps: ["Name the emotion and its urge (hide, lash out, isolate).", "Check: does it fit the facts?", "If not, do the opposite, all the way: reach out, be gentle, show up.", "Notice how the feeling shifts."], studio: "opposite-action", for: ["Ashamed", "Lonely", "Angry"] },
  { id: "please", name: "PLEASE", module: "Emotion regulation", emoji: "🌙", vibe: "Take care of your body so your mind is steadier.", steps: ["Treat physical illness.", "Eat balanced meals.", "Avoid mood-altering substances (we love a sober queen).", "Sleep enough.", "Exercise: your workouts count!"], for: ["Tired", "Irritable"] },
  { id: "abc", name: "Build Positive Experiences", module: "Emotion regulation", emoji: "🌸", vibe: "Stack up good moments on purpose.", steps: ["Do one pleasant thing today, on purpose.", "Work toward a goal that matters to you.", "Build mastery: do something a little hard and finish it.", "Notice and savor the good moment."], for: ["Sad", "Empty"] },
  { id: "ride-the-wave", name: "Ride the Wave", module: "Emotion regulation", emoji: "🌊", vibe: "Feelings rise, peak and pass, like waves.", steps: ["Notice the emotion and where it lives in your body.", "Don't push it away or grab onto it.", "Breathe and watch it rise and fall.", "Remind yourself: this will pass."], studio: "urge-surfing", for: ["Anxious", "Overwhelmed"] },
  { id: "dear-man", name: "DEAR MAN", module: "Relationships", emoji: "💬", vibe: "Ask for what you need, clearly and kindly.", steps: ["Describe the situation, just facts.", "Express how you feel (I feel…).", "Assert what you need, simply.", "Reinforce why it helps both of you.", "Stay mindful, appear confident, be willing to negotiate."], studio: "dear-man", for: ["Misunderstood"] },
  { id: "give", name: "GIVE", module: "Relationships", emoji: "🤍", vibe: "Keep the relationship warm while you talk.", steps: ["Gentle: no attacks or threats.", "Interested: listen and ask.", "Validate: 'I get why you'd feel that way.'", "Easy manner: a little lightness helps."], for: ["Angry"] },
  { id: "fast", name: "FAST", module: "Relationships", emoji: "👑", vibe: "Keep your self-respect, always.", steps: ["Fair to yourself and them.", "Apologies only when they're actually owed.", "Stick to your values.", "Truthful, no exaggerating."], studio: "self-respect" },
];

export const SKILL_HYPE = [
  "Skill unlocked! Your toolkit is getting so stacked.",
  "Look at you using real skills in real life. Proud of you.",
  "Every time you practice, it gets easier. That's growth.",
  "Okay emotionally intelligent queen!",
];

/** A gentle skill suggestion based on today's feelings and her known triggers. */
export function skillFor(emotions: string[], mood: number | undefined, triggers: string[], dayIndex: number): DbtSkill {
  for (const e of emotions) {
    const hit = DBT_SKILLS.find((s) => s.for?.includes(e));
    if (hit) return hit;
  }
  if (mood !== undefined && mood <= 2) return DBT_SKILLS.find((s) => s.id === "self-soothe")!;
  const t = triggers.join(" ").toLowerCase();
  const pool = t.includes("abandon") ? ["check-the-facts", "wise-mind", "self-soothe", "opposite-action", "dear-man", "radical-acceptance", "abc"] : DBT_SKILLS.map((s) => s.id);
  return DBT_SKILLS.find((s) => s.id === pool[dayIndex % pool.length])!;
}
