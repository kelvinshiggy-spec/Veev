export const LOVES = [
  "Family conversations",
  "Building a loving family",
  "Skiing",
  "Mountain vacations",
  "Travel",
  "The gym",
  "Fashion",
  "Luxury cars",
  "Beautiful homes",
  "Classy restaurants",
  "Building wealth",
  "Personal growth",
  "Peaceful mornings",
  "Time with Cookies and Codie",
  "Cooking",
  "Reading",
  "Music",
  "EDM",
  "Afrobeats",
  "Beauty & skincare",
  "Building my own brand",
  "Faith",
];

export const QUALITIES = [
  "Calm",
  "Confident",
  "Disciplined",
  "Honest",
  "Loving",
  "Dependable",
  "Emotionally intelligent",
  "Sophisticated",
  "Healthy",
  "Financially responsible",
  "Accountable",
  "Independent",
  "Resilient",
  "Compassionate",
  "Thoughtful",
];

export const VALUES = ["Family", "Faith", "Honesty", "Health", "Freedom", "Loyalty", "Growth", "Peace", "Adventure", "Kindness", "Excellence", "Independence", "Beauty", "Gratitude"];

export const APPEALING = [
  "Celebrating something",
  "Weekends",
  "Friday evenings",
  "Restaurants and bars",
  "Parties",
  "After an argument",
  "Feeling lonely",
  "Feeling bored",
  "Stress",
  "Feeling rejected",
  "When life is going really well",
  "Holidays",
  "Vacations",
  "Being around people who drink",
];

export const WARNING_SIGNS = [
  "Romanticizing drinking",
  "Thinking 'just one'",
  "Skipping sleep",
  "Skipping the gym",
  "Isolating",
  "Seeking lots of reassurance",
  "Feeling invincible",
  "Irritability",
  "Keeping secrets",
  "Racing thoughts",
  "Skipping therapy homework",
  "Spending impulsively",
];

export const COPING_TOOLS = [
  "STOP",
  "Wise Mind",
  "Check the Facts",
  "Opposite Action",
  "Radical Acceptance",
  "DEAR MAN",
  "TIPP (cold water, intense exercise, paced breathing)",
  "Paced breathing",
  "Urge surfing",
  "Self-soothing",
  "Grounding 5-4-3-2-1",
  "Chain analysis",
  "Pros and cons",
  "Calling someone",
  "Prayer",
];

export const GROUNDING = [
  "A hot shower",
  "Skincare routine",
  "Cuddling Cookies and Codie",
  "A walk outside",
  "The gym",
  "Music",
  "Prayer",
  "Tea and a blanket",
  "Calling family",
  "Tidying my space",
  "Cold water on my face",
  "Journaling",
];

export const HOPES = [
  "Relief",
  "To relax",
  "Excitement",
  "Confidence",
  "To celebrate",
  "To feel less lonely",
  "To stop feeling misunderstood",
  "To numb something",
  "To fit in",
  "Escape from boredom",
  "The buzz itself",
];

export const TRIGGERS = [
  "Boredom",
  "Celebration",
  "Stress",
  "Loneliness",
  "Relationship conflict",
  "Feeling misunderstood",
  "Wanting excitement",
  "Wanting confidence",
  "Social pressure",
  "Wanting emotional relief",
  "Feeling unusually happy",
  "Thinking one drink will be harmless",
  "Missing the feeling of being intoxicated",
  "Anger",
  "Feeling unusually confident",
  "Wanting to escape",
  "Holidays and parties",
];

export const EMOTIONS = [
  "Calm",
  "Happy",
  "Proud",
  "Grateful",
  "Excited",
  "Tired",
  "Anxious",
  "Sad",
  "Lonely",
  "Angry",
  "Irritable",
  "Ashamed",
  "Empty",
  "Overwhelmed",
  "Restless",
  "Misunderstood",
  "Hopeful",
];

export const LETTER_SITUATIONS = [
  "Open when you want a drink",
  "Open when you're angry",
  "Open when you feel abandoned",
  "Open when you feel misunderstood",
  "Open when you're lonely",
  "Open when you're tempted to celebrate with alcohol",
  "Open when you think you can control your drinking",
  "Open when you feel ashamed",
  "Open when life is going well",
  "Open when you've forgotten how far you've come",
];

/** Which letters to suggest for which hopes / triggers */
export const LETTER_FOR: Record<string, string[]> = {
  Celebration: ["Open when you're tempted to celebrate with alcohol", "Open when life is going well"],
  "To celebrate": ["Open when you're tempted to celebrate with alcohol", "Open when life is going well"],
  "Feeling unusually happy": ["Open when life is going well", "Open when you think you can control your drinking"],
  "Thinking one drink will be harmless": ["Open when you think you can control your drinking"],
  Loneliness: ["Open when you're lonely", "Open when you feel abandoned"],
  "To feel less lonely": ["Open when you're lonely"],
  "Relationship conflict": ["Open when you're angry", "Open when you feel misunderstood"],
  "Feeling misunderstood": ["Open when you feel misunderstood"],
  "To stop feeling misunderstood": ["Open when you feel misunderstood"],
  Stress: ["Open when you want a drink"],
  "To numb something": ["Open when you feel ashamed", "Open when you want a drink"],
};

export const MEMORY_CATEGORIES = [
  "Peaceful morning",
  "Family",
  "Gym",
  "Skiing",
  "Travel",
  "Achievement",
  "Money milestone",
  "Beautiful ordinary day",
  "Faith",
  "Love",
];

export const MEMORY_PROMPTS = [
  "How do you feel right now?",
  "What do you love about being sober?",
  "What has improved in your life?",
  "What are you looking forward to?",
  "What would you tell yourself if you wanted a drink tomorrow?",
  "What are you proud of?",
];

export const VISION_CATEGORIES = [
  "Dream home",
  "Dream car",
  "Financial freedom",
  "Beautiful family",
  "Healthy relationships",
  "Skiing",
  "Travel",
  "Fashion",
  "Fitness",
  "Career",
  "Personal confidence",
  "Emotional stability",
  "Peaceful living",
  "Faith",
];

export const SUPPORT_ROLES = [
  "Therapist",
  "Psychiatrist",
  "Treatment provider",
  "Family",
  "Friend",
  "Partner",
  "Sponsor",
  "Emergency contact",
];

export const SUPPORT_TYPES = [
  "Cravings",
  "Just company",
  "Balanced perspective",
  "Practical help",
  "Rides",
  "Emergencies",
  "Celebrating wins",
];
