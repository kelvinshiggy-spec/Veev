export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export const pad = (n: number) => String(n).padStart(2, "0");

/** Local calendar date as yyyy-mm-dd */
export const dayKey = (d: Date = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const parseDay = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (k: string, n: number) => {
  const d = parseDay(k);
  d.setDate(d.getDate() + n);
  return dayKey(d);
};

/** Whole calendar days from a to b (b - a) */
export const daysBetween = (a: string, b: string) =>
  Math.round((parseDay(b).getTime() - parseDay(a).getTime()) / 86400000);

export const fmtDate = (
  k: string | Date,
  opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
) => (typeof k === "string" ? (k.length === 10 ? parseDay(k) : new Date(k)) : k).toLocaleDateString(undefined, opts);

export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

export const money = (n: number, currency = "USD") => {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${Math.round(n)}`;
  }
};

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export function partOfDay(d = new Date()): "morning" | "afternoon" | "evening" | "night" {
  const h = d.getHours();
  if (h < 5) return "night";
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  if (h < 22) return "evening";
  return "night";
}

export function haptic(enabled: boolean, pattern: number | number[] = 8) {
  if (!enabled) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {}
}

/** Deterministic pick for "of the day" content */
export function pickOfDay<T>(arr: T[], salt = 0, k = dayKey()): T | undefined {
  if (!arr.length) return undefined;
  let h = salt;
  for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return arr[h % arr.length];
}

export const splitList = (s: string) =>
  s
    .split(/[\n,]/)
    .map((x) => x.trim())
    .filter(Boolean);
