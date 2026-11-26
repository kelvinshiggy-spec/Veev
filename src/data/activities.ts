// Generic ideas only. No real businesses, prices or events are named.
export interface ActivityIdea {
  title: string;
  category: string;
  budget: 1 | 2 | 3;
  time: "hour" | "half" | "day" | "weekend";
  energy: "low" | "medium" | "high";
  with: ("alone" | "family" | "partner" | "friends")[];
}

export const ACTIVITY_CATEGORIES = [
  "Skiing & mountains",
  "Gym & fitness",
  "Family",
  "Fashion",
  "Cooking",
  "Road trips",
  "Travel",
  "Home",
  "Money goals",
  "Creative",
  "Self-care",
  "Alcohol-free social",
  "Date night",
  "Faith",
];

export const IDEAS: ActivityIdea[] = [
  { title: "Book an early first-chair ski day", category: "Skiing & mountains", budget: 3, time: "day", energy: "high", with: ["alone", "family", "partner", "friends"] },
  { title: "Plan a mountain weekend: lodge, spa, slopes", category: "Skiing & mountains", budget: 3, time: "weekend", energy: "medium", with: ["partner", "family", "friends"] },
  { title: "Snowshoe or winter hike, then hot chocolate", category: "Skiing & mountains", budget: 1, time: "half", energy: "medium", with: ["alone", "family", "partner", "friends"] },
  { title: "Tune up your ski gear and plan next season's runs", category: "Skiing & mountains", budget: 2, time: "hour", energy: "low", with: ["alone"] },
  { title: "Try a new class: pilates, spin or boxing", category: "Gym & fitness", budget: 2, time: "hour", energy: "high", with: ["alone", "friends"] },
  { title: "Set a new personal record at the gym", category: "Gym & fitness", budget: 1, time: "hour", energy: "high", with: ["alone"] },
  { title: "Sunrise walk with a great podcast", category: "Gym & fitness", budget: 1, time: "hour", energy: "low", with: ["alone"] },
  { title: "Pre-ski leg program for the season", category: "Gym & fitness", budget: 1, time: "hour", energy: "high", with: ["alone", "friends"] },
  { title: "Sunday family brunch you host", category: "Family", budget: 2, time: "half", energy: "medium", with: ["family"] },
  { title: "Family game or movie night with snacks", category: "Family", budget: 1, time: "half", energy: "low", with: ["family"] },
  { title: "Call a grandparent or parent and ask about their life", category: "Family", budget: 1, time: "hour", energy: "low", with: ["family"] },
  { title: "Restyle your wardrobe into capsule outfits", category: "Fashion", budget: 1, time: "half", energy: "medium", with: ["alone", "friends"] },
  { title: "Shop for one timeless piece with your savings", category: "Fashion", budget: 3, time: "half", energy: "medium", with: ["alone", "friends", "partner"] },
  { title: "Build a mood board for your signature style", category: "Fashion", budget: 1, time: "hour", energy: "low", with: ["alone"] },
  { title: "Cook a restaurant-style dinner at home", category: "Cooking", budget: 2, time: "half", energy: "medium", with: ["partner", "family", "friends", "alone"] },
  { title: "Craft an elegant alcohol-free cocktail menu", category: "Cooking", budget: 1, time: "hour", energy: "low", with: ["alone", "partner", "friends"] },
  { title: "Learn to make fresh pasta", category: "Cooking", budget: 1, time: "half", energy: "medium", with: ["alone", "partner", "family"] },
  { title: "Scenic drive with a curated playlist", category: "Road trips", budget: 1, time: "half", energy: "low", with: ["alone", "partner", "friends"] },
  { title: "Day trip to a small town you've never seen", category: "Road trips", budget: 2, time: "day", energy: "medium", with: ["partner", "family", "friends"] },
  { title: "Plan your dream trip, itinerary and all", category: "Travel", budget: 1, time: "hour", energy: "low", with: ["alone", "partner"] },
  { title: "Book a sober long weekend somewhere beautiful", category: "Travel", budget: 3, time: "weekend", energy: "medium", with: ["partner", "family", "friends", "alone"] },
  { title: "Tour open houses for dream-home inspiration", category: "Home", budget: 1, time: "half", energy: "medium", with: ["alone", "partner"] },
  { title: "Restyle one room: candles, linen, fresh flowers", category: "Home", budget: 2, time: "half", energy: "medium", with: ["alone"] },
  { title: "Test-drive your dream car", category: "Money goals", budget: 1, time: "hour", energy: "low", with: ["alone", "partner", "friends"] },
  { title: "Money date: review goals, move savings, celebrate", category: "Money goals", budget: 1, time: "hour", energy: "low", with: ["alone", "partner"] },
  { title: "Read one chapter of a finance or business book", category: "Money goals", budget: 1, time: "hour", energy: "low", with: ["alone"] },
  { title: "Photography walk at golden hour", category: "Creative", budget: 1, time: "hour", energy: "medium", with: ["alone", "friends"] },
  { title: "Pottery, painting or flower-arranging class", category: "Creative", budget: 2, time: "half", energy: "medium", with: ["alone", "friends", "partner"] },
  { title: "Spa evening at home: bath, skincare, early night", category: "Self-care", budget: 1, time: "half", energy: "low", with: ["alone"] },
  { title: "Book a massage or facial", category: "Self-care", budget: 3, time: "half", energy: "low", with: ["alone"] },
  { title: "Slow morning: coffee, journal, no phone", category: "Self-care", budget: 1, time: "hour", energy: "low", with: ["alone"] },
  { title: "Host a mocktail dinner party", category: "Alcohol-free social", budget: 2, time: "half", energy: "high", with: ["friends", "family"] },
  { title: "Morning coffee meetup instead of evening drinks", category: "Alcohol-free social", budget: 1, time: "hour", energy: "medium", with: ["friends"] },
  { title: "Brunch at a beautiful spot", category: "Alcohol-free social", budget: 2, time: "half", energy: "medium", with: ["friends", "family", "partner"] },
  { title: "Dress up for a fine-dining dinner, zero-proof pairing", category: "Date night", budget: 3, time: "half", energy: "medium", with: ["partner"] },
  { title: "Sunset picnic with something sparkling and alcohol-free", category: "Date night", budget: 1, time: "half", energy: "low", with: ["partner"] },
  { title: "Live music or theatre night", category: "Date night", budget: 2, time: "half", energy: "medium", with: ["partner", "friends"] },
  { title: "Sunday service, then a long walk", category: "Faith", budget: 1, time: "half", energy: "low", with: ["alone", "family", "partner"] },
  { title: "Volunteer for a morning", category: "Faith", budget: 1, time: "half", energy: "medium", with: ["alone", "family", "friends"] },
  { title: "Quiet devotional and gratitude list", category: "Faith", budget: 1, time: "hour", energy: "low", with: ["alone"] },
];
