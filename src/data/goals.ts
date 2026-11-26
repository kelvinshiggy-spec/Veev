// Goal templates: a fun, deliverable checklist plus a little tip from the companion for each step.
export interface GoalTemplate {
  id: string;
  title: string;
  emoji: string;
  horizon: "month" | "90";
  money?: number; // suggested savings target (she sets the real number)
  steps: { text: string; tip: string }[];
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    id: "pharmacy",
    title: "Pharmacy school, here I come",
    emoji: "💊",
    horizon: "90",
    steps: [
      { text: "List the pharmacy schools I want", tip: "Note each school's prerequisites, application deadline and whether it wants the PCAT. Check their official sites." },
      { text: "Check my prereqs with a DVC counselor", tip: "Book a counseling appointment and bring your list. Ask about anything still missing." },
      { text: "Make a semester study plan", tip: "Put exams and big assignments in School so I can cheer you on." },
      { text: "Get pharmacy experience hours", tip: "Pharmacy tech, volunteering or shadowing. Ask schools what counts." },
      { text: "Ask for recommendation letters", tip: "Ask professors and supervisors early, and give them your resume and a friendly deadline." },
      { text: "Draft my personal statement", tip: "Your story is powerful. Why pharmacy, why you, who you're becoming." },
      { text: "Take the PCAT (if my schools need it)", tip: "Only if your schools require it. Check each school before you sign up." },
      { text: "Submit applications", tip: "Many schools use PharmCAS. Double-check every school's deadline." },
      { text: "Prep for interviews", tip: "Practice out loud with me. Clear head, confident answers." },
    ],
  },
  {
    id: "ski",
    title: "Ski trip",
    emoji: "🎿",
    horizon: "90",
    money: 1000,
    steps: [
      { text: "Pick the mountain and dates", tip: "Pick two or three date options so you have wiggle room." },
      { text: "Set a trip budget", tip: "Add up lodging, lift tickets, rentals, food and gas. Then add a little cushion." },
      { text: "Save the trip money", tip: "Move your not-spent drink money here every week. It adds up fast." },
      { text: "Book lodging", tip: "Compare a couple of places and read recent reviews before you book." },
      { text: "Sort lift tickets and rentals", tip: "Booking ahead online is usually easier than at the window." },
      { text: "Plan cozy sober après", tip: "Hot tub, hot cocoa, a nice dinner. Plan it so the evening feels special." },
      { text: "Pack the cute ski fits", tip: "Layers, goggles, sunscreen, lip balm. And the outfit for photos." },
    ],
  },
  {
    id: "save",
    title: "Save money",
    emoji: "💰",
    horizon: "month",
    money: 500,
    steps: [
      { text: "Pick the number", tip: "A number that stretches you a little but still feels doable." },
      { text: "Set up automatic transfers", tip: "Payday transfers mean you never have to think about it." },
      { text: "Cancel one thing you don't use", tip: "Check subscriptions. There's always one." },
      { text: "Try a no-spend weekend", tip: "Free plans: hike, picnic, movie night at home, museum free day." },
      { text: "Hit the target", tip: "Rich girl behavior. Celebrate with something that doesn't undo it." },
    ],
  },
  {
    id: "fitness",
    title: "Gym girl era",
    emoji: "🏋️‍♀️",
    horizon: "month",
    steps: [
      { text: "Pick 3 workout days a week", tip: "Put them in your calendar like real appointments." },
      { text: "Make the perfect gym playlist", tip: "EDM for cardio, Afrobeats for the cool-down." },
      { text: "Try one new class", tip: "Pilates, boxing, spin. Something that feels a little scary-fun." },
      { text: "Hit 12 workouts this month", tip: "Track it in Habits so you can watch the streak grow." },
      { text: "Take a progress pic", tip: "Not about your body, about how strong and proud you feel." },
    ],
  },
  {
    id: "glow",
    title: "Glow-up month",
    emoji: "✨",
    horizon: "month",
    steps: [
      { text: "Build a morning skincare routine", tip: "Cleanse, serum, moisturizer, SPF. Five minutes, every day." },
      { text: "Drink water daily", tip: "A cute bottle you actually like helps more than you think." },
      { text: "Sleep by 11 five nights a week", tip: "Phone charging across the room is the secret." },
      { text: "Refresh your style", tip: "Try a fit check in The Edit and build 3 outfits from your closet." },
      { text: "Take a glow-up photo", tip: "Same light, same spot as day one, so you can compare." },
    ],
  },
  {
    id: "learn",
    title: "Learn something new",
    emoji: "📚",
    horizon: "90",
    steps: [
      { text: "Choose the skill", tip: "Something you've been curious about forever. DJing? A language? Design?" },
      { text: "Find a beginner course or tutorial", tip: "Free videos are a great way to test if you love it." },
      { text: "Practice 3 times a week", tip: "Twenty minutes counts. Consistency beats marathons." },
      { text: "Make your first real thing", tip: "A mix, a conversation, a design. Something you can show." },
      { text: "Share it with someone", tip: "Showing someone makes it real. Be proud." },
    ],
  },
  {
    id: "brand",
    title: "Start my own thing",
    emoji: "💼",
    horizon: "90",
    steps: [
      { text: "Write down the idea in one sentence", tip: "If you can say it simply, you can build it." },
      { text: "Pick a name and vibe", tip: "Make a mood board in The Edit for the aesthetic." },
      { text: "Make the first version", tip: "Small and imperfect is perfect for version one." },
      { text: "Show 5 people", tip: "Ask what they love and what confuses them." },
      { text: "Launch it", tip: "Main character move. Post it, share it, celebrate it." },
    ],
  },
  {
    id: "selfcare",
    title: "Self-care reset",
    emoji: "🕯️",
    horizon: "month",
    steps: [
      { text: "Book a therapy session", tip: "Put it on the calendar so it's a promise to yourself." },
      { text: "Plan one solo date", tip: "Coffee, a bookstore, a movie. Just you." },
      { text: "Do a full spa night", tip: "Candles, masks, a fancy mocktail, early night." },
      { text: "Reconnect with one friend", tip: "A walk or a coffee instead of drinks." },
      { text: "Write a letter to future you", tip: "Letters from my sober self, in My Future." },
    ],
  },
];

export const GOAL_EMOJIS = ["🎯", "💊", "🎓", "🎿", "💰", "✈️", "🏋️‍♀️", "✨", "📚", "💼", "🕯️", "🏠", "🚗", "💖"];

export const GOAL_HYPE = ["One step closer, queen!", "Look at you making it happen.", "Progress looks so good on you.", "Okay goal-getter!", "Checked! The vision is visioning."];

export function tipFor(templateId: string | undefined, stepText: string): string | undefined {
  return GOAL_TEMPLATES.find((t) => t.id === templateId)?.steps.find((s) => s.text === stepText)?.tip;
}
