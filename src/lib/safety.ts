// Safety signals. This is a simple, transparent keyword screen that runs on the device,
// before anything is sent to AI. It is a backstop, not a diagnosis: the Help button is
// always visible, and Veev can open safety mode herself at any time.

export type SafetyKind = "suicide" | "psychosis" | "medical" | "withdrawal" | "intoxicated" | "danger" | "abuse";

export const CRISIS = {
  emergency: { label: "Emergency", number: "911", tel: "tel:911", note: "Immediate danger, seizures, trouble breathing, can't stay awake, severe confusion." },
  lifeline: { label: "988 Suicide & Crisis Lifeline", number: "988", tel: "tel:988", sms: "sms:988", note: "Call or text, 24/7. For suicidal thoughts or any mental health crisis." },
  samhsa: { label: "SAMHSA National Helpline", number: "1-800-662-4357", tel: "tel:18006624357", note: "Free, confidential, 24/7 treatment referral for substance use." },
  dv: { label: "National Domestic Violence Hotline", number: "1-800-799-7233", tel: "tel:18007997233", sms: "sms:88788", note: "If someone is hurting or threatening you. Text START to 88788." },
};

const PATTERNS: { kind: SafetyKind; re: RegExp }[] = [
  {
    kind: "suicide",
    re: /\b(kill myself|end (it|my life|things)|suicid|don'?t want to (live|be alive|wake up)|better off (dead|without me)|hurt(ing)? myself|self[- ]?harm|cut(ting)? myself|overdose|no reason to live|want to die)\b/i,
  },
  {
    kind: "psychosis",
    re: /\b(hearing (voices|things)|voices (are )?(telling|say)|seeing things|hallucinat|they('re| are) (watching|following|tracking) me|being (watched|followed|poisoned)|cameras? (in|on) (my|the)|reading my (mind|thoughts)|not sure what('s| is) real|nothing (feels|is) real)\b/i,
  },
  {
    kind: "medical",
    re: /\b(seizure|can'?t breathe|trouble breathing|chest pain|passing out|passed out|vomiting blood|throwing up blood|can'?t stay awake|blacking out)\b/i,
  },
  {
    kind: "withdrawal",
    re: /\b(withdrawal|the shakes|shaking|tremor|sweating .*(stop|quit)|d\.?t\.?s?\b|delirium|haven'?t had a drink .* (shak|sweat|sick))\b/i,
  },
  {
    kind: "intoxicated",
    re: /\b(i'?m (so )?(drunk|wasted|hammered|smashed)|been drinking|had (a few|some|too many) drinks|already (drank|drinking|had a drink)|i drank)\b/i,
  },
  {
    kind: "abuse",
    re: /\b(hit me|hits me|hurt me|choked|threaten(ed|ing) (me|to)|afraid (of|for) (him|her|them)|not safe at home|scared for my (life|safety))\b/i,
  },
  { kind: "danger", re: /\b(drive (drunk|home)|get in the car|going to drive)\b/i },
];

export function screen(text: string): SafetyKind[] {
  const found = new Set<SafetyKind>();
  for (const p of PATTERNS) if (p.re.test(text)) found.add(p.kind);
  return [...found];
}

/** Kinds that should interrupt the normal UI with the simplified safety screen */
export const INTERRUPTING: SafetyKind[] = ["suicide", "psychosis", "medical", "withdrawal", "abuse", "danger"];

export const SAFETY_COPY: Record<SafetyKind, { title: string; lines: string[]; primary: keyof typeof CRISIS }> = {
  suicide: {
    title: "You matter. Let's get you support right now.",
    lines: [
      "You don't have to carry this alone.",
      "Please reach a real person now. 988 is free and open 24/7, by call or text.",
      "If you might act on these thoughts, call 911.",
      "If you can, move away from anything you could use to hurt yourself.",
    ],
    primary: "lifeline",
  },
  psychosis: {
    title: "Let's slow everything down.",
    lines: [
      "What you're experiencing sounds really frightening.",
      "You are here, right now. Feel your feet on the floor.",
      "Please reach a sober person you trust, and ask for help getting checked by a professional soon.",
      "If you're seeing or hearing things that scare you, or feel confused, call 911 or 988.",
      "Please don't drive.",
    ],
    primary: "lifeline",
  },
  medical: {
    title: "This needs medical help now.",
    lines: [
      "Call 911.",
      "Stay where you are, and unlock the door if you can.",
      "If someone is with you, ask them to stay.",
    ],
    primary: "emergency",
  },
  withdrawal: {
    title: "Withdrawal can be serious. You deserve real care.",
    lines: [
      "Alcohol withdrawal can be dangerous and isn't a willpower test.",
      "Please contact a doctor today, or call SAMHSA for help finding care.",
      "If you have shaking with confusion, seeing things, a seizure, or a racing heart, call 911.",
      "Please don't try to detox alone.",
    ],
    primary: "samhsa",
  },
  intoxicated: {
    title: "Your previous progress still matters. Right now, your safety matters most.",
    lines: [
      "Please don't drive.",
      "Let's avoid big conversations or decisions tonight.",
      "Water, something to eat, and a safe place to rest.",
      "Reach out to someone sober you trust.",
    ],
    primary: "samhsa",
  },
  danger: {
    title: "Please don't drive.",
    lines: [
      "Nothing tonight is worth that risk.",
      "Stay where you are, or ask a sober person to get you.",
      "If you're in danger, call 911.",
    ],
    primary: "emergency",
  },
  abuse: {
    title: "Your safety comes first.",
    lines: [
      "What you're describing matters, and it is not your fault.",
      "If you're in immediate danger, call 911.",
      "The National Domestic Violence Hotline can help you think through options, confidentially.",
    ],
    primary: "dv",
  },
};
