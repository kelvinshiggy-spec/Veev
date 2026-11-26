// On-device check for language that tends to escalate conflict. No AI needed.
export interface Flag {
  phrase: string;
  why: string;
}

const RULES: { re: RegExp; why: string }[] = [
  { re: /\b(always|never|every single time|constantly)\b/gi, why: "Absolutes can make the other person defend instead of listen." },
  { re: /\b(you (are|r|'re) (so |such an? )?(selfish|stupid|crazy|pathetic|liar|idiot|useless|toxic|narcissist\w*|psycho))\b/gi, why: "Labels attack the person rather than describe the problem." },
  { re: /\b(f+u+c+k\w*|shit\w*|bitch\w*|asshole\w*|dick\w*|bastard\w*)\b/gi, why: "Swearing at someone usually escalates." },
  { re: /\b(i hate you|i'?m done with you|we'?re done|get out of my life|never speak to me)\b/gi, why: "Final statements are hard to take back once you're calmer." },
  { re: /\b(if you (don'?t|do not)[^.!?]{0,60}(i will|i'?ll)|or else)\b/gi, why: "Ultimatums can feel like threats. A boundary works better as what you will do." },
  { re: /\b(you obviously|you clearly|i know you|you just want(ed)?)\b/gi, why: "Mind-reading. You may be right, but it's an assumption worth checking." },
  { re: /\b(whatever|thanks a lot|nice job|good for you)\b/gi, why: "Can read as sarcasm in a text." },
  { re: /\b(everyone (knows|agrees|says)|my (mom|family|friends) (agree|said|says))\b/gi, why: "Bringing others in can feel like being ganged up on." },
  { re: /!{2,}|\?{2,}/g, why: "Repeated punctuation reads as shouting." },
];

export function detectEscalation(text: string): Flag[] {
  const out: Flag[] = [];
  for (const r of RULES) {
    const m = text.match(r.re);
    if (m) for (const phrase of new Set(m)) out.push({ phrase, why: r.why });
  }
  const caps = text.match(/\b[A-Z]{4,}\b/g)?.filter((w) => !["ASAP", "OKAY"].includes(w));
  if (caps?.length) out.push({ phrase: caps.slice(0, 3).join(" "), why: "ALL CAPS reads as yelling." });
  const youCount = (text.match(/\byou\b/gi) ?? []).length;
  const iCount = (text.match(/\b(i|i'm|i feel)\b/gi) ?? []).length;
  if (youCount >= 5 && youCount > iCount * 2) out.push({ phrase: `“you” × ${youCount}`, why: "Lots of “you” and few “I feel” statements can sound like blame." });
  return out;
}

export const LOCAL_FRAMES = [
  { style: "Calm and direct", frame: "When [what happened], I felt [feeling]. I'd like [what you need]. Can we talk about it [when]?" },
  { style: "Requesting space", frame: "I'm feeling really overwhelmed and I don't want to say something I don't mean. I need some time tonight. Can we talk tomorrow?" },
  { style: "Boundary-setting", frame: "I care about us, and I'm not okay with [behavior]. If it happens again, I'm going to [your action]." },
  { style: "Accountability-focused", frame: "I've been thinking about [situation]. I own that I [your part]. I'm sorry for that. I'd like to [repair]." },
  { style: "Emotionally honest", frame: "I'm hurt, and I'm also scared of how much this is affecting me. I want to understand what happened from your side." },
];
