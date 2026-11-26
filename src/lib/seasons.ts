import { dayKey, parseDay, addDays, daysBetween } from "./util";

// Seasons and holidays (US), computed on the device. Holidays can be heavy drinking days,
// so each one comes with sober plans and mocktail ideas, not just decorations.

export type Season = "winter" | "spring" | "summer" | "autumn";

export interface Holiday {
  key: string;
  name: string;
  date: string; // yyyy-mm-dd
  emoji: string;
  greeting: string;
  heads: string; // a light, honest heads-up for a high-pressure day
  plans: string[];
  mocktails: string[];
  accent: string; // gradient accent for the season card
  risky: boolean;
}

const nthWeekday = (y: number, m: number, weekday: number, n: number) => {
  const d = new Date(y, m, 1);
  const add = (weekday - d.getDay() + 7) % 7;
  return new Date(y, m, 1 + add + (n - 1) * 7);
};
const lastWeekday = (y: number, m: number, weekday: number) => {
  const d = new Date(y, m + 1, 0);
  const back = (d.getDay() - weekday + 7) % 7;
  return new Date(y, m, d.getDate() - back);
};
function easter(y: number) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1, day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, month, day);
}

function holidaysFor(y: number): Holiday[] {
  const k = (d: Date) => dayKey(d);
  return [
    {
      key: "newyear", name: "New Year's Day", date: `${y}-01-01`, emoji: "✨", accent: "#d6b77a", risky: false,
      greeting: "New year, same clear-headed queen. Let's make it iconic.",
      heads: "Fresh starts hit different when you actually remember them.",
      plans: ["Write three intentions for the year", "A slow brunch with someone you love", "Plan the first adventure of the year"],
      mocktails: ["Sparkling pomegranate with rosemary", "Grapefruit tonic with a salted rim"],
    },
    {
      key: "valentines", name: "Valentine's Day", date: `${y}-02-14`, emoji: "💗", accent: "#eac8ae", risky: true,
      greeting: "Romance era, but make it self-respect.",
      heads: "Big feelings day. Whatever your plans, you don't need a drink to feel loved.",
      plans: ["A dressed-up dinner, alcohol-free", "Self-love night: face mask, film, flowers for you", "Write a love letter to your future self"],
      mocktails: ["Strawberry basil fizz", "Rose lemonade with sparkling water"],
    },
    {
      key: "stpatricks", name: "St. Patrick's Day", date: `${y}-03-17`, emoji: "🍀", accent: "#a9c5b4", risky: true,
      greeting: "Feeling lucky? You're already winning by staying clear.",
      heads: "This one's basically a drinking holiday. Have a plan and an exit time.",
      plans: ["Brunch instead of bar crawl", "A green smoothie and a long walk", "Movie night at home"],
      mocktails: ["Cucumber mint cooler", "Lime and ginger beer, no booze"],
    },
    {
      key: "easter", name: "Easter", date: k(easter(y)), emoji: "🌷", accent: "#eac8ae", risky: false,
      greeting: "New beginnings, spring blooms and a clear mind.",
      heads: "Family day. Bring your own fancy drink so you're never empty-handed.",
      plans: ["Church or a quiet moment of gratitude", "Spring brunch with family", "Fresh flowers for your home"],
      mocktails: ["Carrot ginger spritz", "Elderflower and lemon sparkler"],
    },
    {
      key: "mothers", name: "Mother's Day", date: k(nthWeekday(y, 4, 0, 2)), emoji: "🌸", accent: "#eac8ae", risky: false,
      greeting: "Celebrating the women who made you, and the one you're becoming.",
      heads: "Family feelings can get big. It's okay to step outside for a breather.",
      plans: ["Call or visit your mom or a mother figure", "Brunch and flowers", "Write about the family you want to build"],
      mocktails: ["Peach iced tea with mint", "Lavender lemonade"],
    },
    {
      key: "memorial", name: "Memorial Day weekend", date: k(lastWeekday(y, 4, 1)), emoji: "🇺🇸", accent: "#d7e5ef", risky: true,
      greeting: "Long weekend energy. Let's make it a good one.",
      heads: "BBQs and day drinking season starts now. Pack your own drinks.",
      plans: ["A hike or beach day", "Host a sober BBQ", "Plan your summer adventures"],
      mocktails: ["Watermelon lime agua fresca", "Iced hibiscus tea"],
    },
    {
      key: "july4", name: "Fourth of July", date: `${y}-07-04`, emoji: "🎆", accent: "#d7e5ef", risky: true,
      greeting: "Fireworks look better when you remember them.",
      heads: "Big party day. Decide your leave time before you go.",
      plans: ["Fireworks with family", "Picnic with a mocktail bar", "Lake or pool day"],
      mocktails: ["Blueberry lemonade fizz", "Cherry vanilla soda"],
    },
    {
      key: "labor", name: "Labor Day weekend", date: k(nthWeekday(y, 8, 1, 1)), emoji: "🌞", accent: "#eac8ae", risky: true,
      greeting: "Last hurrah of summer, clear-headed edition.",
      heads: "End-of-summer parties can sneak up on you. You've got this.",
      plans: ["A last summer day trip", "Reset your routine for fall", "Fall goals with a fresh notebook"],
      mocktails: ["Peach basil smash", "Sparkling iced coffee"],
    },
    {
      key: "halloween", name: "Halloween", date: `${y}-10-31`, emoji: "🎃", accent: "#eac8ae", risky: true,
      greeting: "Spooky season, but your peace stays undefeated.",
      heads: "Costume parties often mean drinks. Bring a cute mocktail and a buddy.",
      plans: ["An iconic costume moment", "Horror movie marathon with snacks", "Pumpkin carving night"],
      mocktails: ["Black cherry 'potion' with dry ice look", "Apple cider with cinnamon"],
    },
    {
      key: "thanksgiving", name: "Thanksgiving", date: k(nthWeekday(y, 10, 4, 4)), emoji: "🦃", accent: "#d6b77a", risky: true,
      greeting: "Grateful, glowing, and fully present. Happy Thanksgiving.",
      heads: "Family plus wine bottles on the table can be a lot. Fancy drink in hand, exit plan ready, and text a sober friend if it gets heavy.",
      plans: ["Bring a signature mocktail to the table", "Share one thing you're grateful for", "Post-dinner walk", "Cozy pie and movie night"],
      mocktails: ["Cranberry rosemary spritz", "Spiced apple cider with a cinnamon stick", "Pomegranate ginger fizz"],
    },
    {
      key: "christmaseve", name: "Christmas Eve", date: `${y}-12-24`, emoji: "🎄", accent: "#a9c5b4", risky: true,
      greeting: "Cozy, glowing, and clear. The best kind of Christmas Eve.",
      heads: "Holiday nostalgia plus eggnog is a lot. Keep your plan close.",
      plans: ["Christmas lights drive", "Church or candlelight service", "Matching pajamas and a movie"],
      mocktails: ["Virgin eggnog with nutmeg", "Hot chocolate bar"],
    },
    {
      key: "christmas", name: "Christmas", date: `${y}-12-25`, emoji: "🎁", accent: "#a9c5b4", risky: true,
      greeting: "Merry Christmas. The best gift is a clear head and a full heart.",
      heads: "Family time can be beautiful and stressful at once. Breaks are allowed.",
      plans: ["Gift exchange and a slow breakfast", "Call the people you love", "A cozy walk in the cold"],
      mocktails: ["Cranberry orange sparkler", "Peppermint hot cocoa"],
    },
    {
      key: "nye", name: "New Year's Eve", date: `${y}-12-31`, emoji: "🥂", accent: "#d6b77a", risky: true,
      greeting: "Ending the year clear and iconic. Midnight hits different sober.",
      heads: "Probably the biggest drinking night of the year. Make a plan now: where, who, and what's in your glass.",
      plans: ["Sparkling cider toast at midnight", "Write your year-in-review", "Dress up for a sober dinner party"],
      mocktails: ["Sparkling cider with pomegranate seeds", "Non-alcoholic sparkling rosé"],
    },
  ];
}

export function season(d = new Date()): Season {
  const m = d.getMonth();
  if (m === 11 || m <= 1) return "winter";
  if (m <= 4) return "spring";
  if (m <= 7) return "summer";
  return "autumn";
}

export const SEASON_COPY: Record<Season, { name: string; vibe: string; ideas: string[] }> = {
  winter: { name: "Winter", vibe: "Ski season, cozy nights and fresh snow.", ideas: ["Plan a ski weekend", "Hot chocolate and a good book", "Winter skincare reset"] },
  spring: { name: "Spring", vibe: "Fresh starts, blooms and long walks.", ideas: ["Spring closet refresh", "Farmers market morning", "Start a new fitness goal"] },
  summer: { name: "Summer", vibe: "Golden hours, lakes and long evenings.", ideas: ["Sunset walk", "Beach or pool day", "Plan a summer trip"] },
  autumn: { name: "Autumn", vibe: "Cozy layers, candles and crisp air.", ideas: ["Fall outfit inspo board", "Apple picking or a pumpkin patch", "Candle-lit reading night"] },
};

/** Today's holiday, or one coming up soon (within `ahead` days). */
export function holidayNear(today = dayKey(), ahead = 6): (Holiday & { inDays: number }) | undefined {
  const y = parseDay(today).getFullYear();
  const all = [...holidaysFor(y), ...holidaysFor(y + 1)];
  const hit = all
    .map((h) => ({ ...h, inDays: daysBetween(today, h.date) }))
    .filter((h) => h.inDays >= 0 && h.inDays <= ahead)
    .sort((a, b) => a.inDays - b.inDays)[0];
  return hit;
}

/** One line for the AI so the companion knows what day it is. */
export function seasonalContext(today = dayKey(), weather?: string) {
  const d = parseDay(today);
  const h = holidayNear(today, 3);
  const parts = [`Today is ${d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} (${SEASON_COPY[season(d)].name.toLowerCase()}).`];
  if (h) parts.push(h.inDays === 0 ? `It's ${h.name} today.` : `${h.name} is in ${h.inDays} day${h.inDays === 1 ? "" : "s"}.`);
  if (h?.risky) parts.push("Holidays like this can be high-pressure drinking days; gently help her have a fun sober plan if it comes up.");
  if (weather) parts.push(`Local weather: ${weather}.`);
  return parts.join(" ");
}

export { addDays };
