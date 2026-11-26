// "The Edit": VEEV's little lifestyle magazine. Timeless ideas, no prices, no "in stock" claims.

export type EditTab = "fashion" | "beauty" | "cars" | "travel" | "home" | "fitness";

export interface EditStory {
  title: string;
  dek: string; // one-line summary
  points: string[];
}

export interface EditSection {
  id: EditTab;
  label: string;
  emoji: string;
  headline: string;
  vylie: string[]; // rotating chime-ins
  picks: string[]; // rotating "today's pick"
  stories: EditStory[];
  ask: string; // voice greeting topic hint
}

export const EDIT: EditSection[] = [
  {
    id: "fashion",
    label: "Fashion",
    emoji: "👗",
    headline: "Main character wardrobe.",
    vylie: [
      "Okay, outfit check. What are we wearing today, bestie?",
      "Quiet luxury but make it you. Let's get dressed.",
      "Rule one: if it makes you stand taller, it's a yes.",
    ],
    picks: [
      "Monochrome cream from head to toe, gold hoops",
      "Oversized blazer, fitted tank, straight-leg jeans",
      "Slip skirt with a chunky knit and loafers",
      "All-black with one statement bag",
      "Matching set plus sneakers for errands that feel expensive",
      "White button-down, tucked, sleeves pushed, sunnies on",
      "Leather jacket over a soft dress",
      "Camel coat, turtleneck and knee boots",
    ],
    stories: [
      {
        title: "The capsule closet",
        dek: "Ten pieces, thirty outfits.",
        points: ["A great blazer", "White and black tees", "Straight-leg jeans", "A slip skirt", "A cozy knit", "Trench or camel coat", "Loafers and clean white sneakers", "Gold jewelry you wear every day"],
      },
      {
        title: "Sober night out looks",
        dek: "Dressed up, clear-headed, unforgettable.",
        points: ["Satin top, tailored trousers", "Little black dress with a bold lip", "Corset top with wide-leg pants", "Comfortable heels so you can dance all night"],
      },
      {
        title: "Ski chalet chic",
        dek: "Slopes by day, fireside by night.",
        points: ["Fitted one-piece or a bright jacket", "Cream knit and a fur-look headband", "Après boots with leggings", "Hot cocoa in hand, obviously"],
      },
      {
        title: "Style tricks that look expensive",
        dek: "No new shopping required.",
        points: ["Steam everything", "Tonal outfits (one color family)", "Tuck and belt", "Fewer, bigger accessories", "Good posture is the best accessory"],
      },
    ],
    ask: "fashion",
  },
  {
    id: "beauty",
    label: "Beauty",
    emoji: "💄",
    headline: "Glow, but make it effortless.",
    vylie: ["Sober skin is literally glowing skin. Let's lean in.", "Self-care Sunday energy, any day of the week.", "Hydrate, moisturize, mind your business."],
    picks: [
      "Glazed skin: hydrating serum, moisturizer, a little highlighter",
      "Clean girl bun and a fluffy brow",
      "Brown lip liner with a glossy nude",
      "Soft bronzed look with a sunset blush",
      "Overnight hair mask and silk pillowcase",
      "Ice roller morning",
      "Bold red lip, everything else minimal",
    ],
    stories: [
      { title: "Morning routine in 5", dek: "Fast, fresh, done.", points: ["Gentle cleanse", "Vitamin C or hydrating serum", "Moisturizer", "SPF every single day", "Lip balm and brows"] },
      { title: "Night routine to wind down", dek: "Your evening ritual, but cute.", points: ["Double cleanse if wearing makeup", "Treatment (retinol a few nights a week)", "Rich moisturizer", "Lip mask", "Phone down, lights low"] },
      { title: "Sobriety glow-up", dek: "What changes when alcohol leaves.", points: ["Less puffiness", "Better sleep, brighter eyes", "Skin holds water better", "More energy for routines"] },
      { title: "Spa night at home", dek: "Treat yourself, zero reservations.", points: ["Candles and a playlist", "Face mask and hair mask", "Fresh mani", "Body oil after a warm shower", "A fancy mocktail in a nice glass"] },
    ],
    ask: "beauty",
  },
  {
    id: "cars",
    label: "Cars",
    emoji: "🚗",
    headline: "Dream garage.",
    vylie: ["Okay, dream car energy. What are we pulling up in?", "Classy girls drive calm. Windows down, playlist on.", "Manifesting a pretty car and a peaceful drive."],
    picks: ["Range Rover in white", "Mercedes G-Class in matte black", "Porsche 911 in a soft color", "Tesla Model Y, minimalist and clean", "BMW X5, sporty but grown", "Mini Cooper convertible for fun weekends", "Audi Q8 in grey", "Classic Mercedes SL convertible"],
    stories: [
      { title: "The dream car board", dek: "Pick the vibe, not the price tag.", points: ["Luxury SUV: safe, tall, glam", "Convertible: summer weekends", "Electric: quiet, smooth, modern", "Classic: timeless and photogenic"] },
      { title: "Car glow-up, no new car needed", dek: "Make what you have feel luxe.", points: ["Full detail and fresh interior scent", "A phone mount and good charging cable", "Seat organizer and a mini trash bin", "Your perfect driving playlist"] },
      { title: "Calm driver club", dek: "Classy is calm behind the wheel.", points: ["Only drive when you feel steady", "Leave 10 minutes early so you're never rushing", "Phone on Do Not Disturb", "Upset? Park it, breathe, then decide"] },
      { title: "Saving for it", dek: "Make the dream car a real goal.", points: ["Add a dream car fund in Finances", "Move your not-spent drink money there", "Celebrate milestones, not just the finish"] },
    ],
    ask: "cars",
  },
  {
    id: "travel",
    label: "Travel",
    emoji: "✈️",
    headline: "Passport-ready era.",
    vylie: ["Where are we going next, bestie? Mountains or beach?", "Sober travel hits different. You remember everything.", "Pack light, live loud."],
    picks: ["A ski weekend in the mountains", "A spa resort with a pool day", "A city break full of museums and cafés", "A beach sunrise trip", "A cabin with a fireplace and books", "A food tour somewhere new", "A road trip with the perfect playlist"],
    stories: [
      { title: "Sober vacation, better vacation", dek: "Up for sunrise, never hungover.", points: ["Plan morning adventures", "Have a go-to mocktail order", "Book activities, not bar crawls", "Journal one moment each day"] },
      { title: "Ski trip checklist", dek: "Glam on the slopes.", points: ["Lesson or a new run", "Warm layers and goggles", "Spa or hot tub after", "Cozy dinner and early night"] },
      { title: "Weekend getaway ideas", dek: "Small trips, big reset.", points: ["A nearby town you've never visited", "Hot springs or spa day", "Hiking trail and picnic", "A nice hotel just for the room service"] },
    ],
    ask: "travel",
  },
  {
    id: "home",
    label: "Home",
    emoji: "🕯️",
    headline: "Your space, your sanctuary.",
    vylie: ["A clean room and a candle is basically therapy.", "Make your space feel like a five-star hotel.", "Cookies and Codie deserve an aesthetic home too."],
    picks: ["Fresh flowers on the nightstand", "Hotel-style bed: white sheets, extra pillows", "Warm lamps instead of overhead lights", "A cozy reading nook", "A mocktail bar cart", "A cat corner for Cookies and Codie", "A gallery wall of your favorite photos"],
    stories: [
      { title: "Five-star bedroom", dek: "Sleep like you're on vacation.", points: ["Crisp sheets", "Blackout curtains", "Diffuser or candle", "Phone charging away from the bed"] },
      { title: "The mocktail bar", dek: "Make the alternative the fun part.", points: ["Nice glasses", "Sparkling water and fresh citrus", "Herbs like mint and rosemary", "Bitters-free syrups and fun garnishes"] },
      { title: "Ten-minute reset", dek: "When the room feels like your head.", points: ["Clear one surface", "Open a window", "Make the bed", "Light something that smells good"] },
    ],
    ask: "home",
  },
  {
    id: "fitness",
    label: "Fitness",
    emoji: "🏋️‍♀️",
    headline: "Strong is the new everything.",
    vylie: ["Gym girl era, let's go.", "Move because it feels good, not as punishment.", "Sober and strong? Unmatched."],
    picks: ["Pilates and a smoothie", "Leg day with an EDM playlist", "Hot girl walk with a podcast", "Dance cardio to Afrobeats", "A long stretch and foam roll", "Try a new class this week", "Upper body and core"],
    stories: [
      { title: "Weekly split, simple", dek: "Consistent beats perfect.", points: ["Mon: legs and glutes", "Tue: walk or pilates", "Wed: upper body", "Thu: dance cardio", "Fri: full body", "Weekend: hike, ski or rest"] },
      { title: "Gym bag essentials", dek: "Look good, feel ready.", points: ["Water bottle", "Headphones and your playlist", "Lip balm and a scrunchie", "Fresh tee for after"] },
      { title: "When you don't feel like it", dek: "The 10-minute rule.", points: ["Just start for 10 minutes", "Pick your favorite song", "Movement changes your mood", "Rest days count too"] },
    ],
    ask: "fitness",
  },
];

export const editTab = (id?: string | null) => EDIT.find((e) => e.id === id) ?? EDIT[0];
