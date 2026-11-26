"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, MessageSquare, Mail, Film, Sparkles, Wind, Route } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, Card, Chips, Label, Section, TextArea, Pill } from "@/components/ui";
import { HOPES, TRIGGERS, LETTER_FOR } from "@/data/options";
import { sobrietyStats } from "@/lib/sobriety";
import { uid, cx, daysBetween, dayKey, money, haptic } from "@/lib/util";
import { verseFor } from "@/data/verses";
import { MediaView } from "@/components/media";
import type { CravingEvent } from "@/lib/types";
import { SUPPORT_TEMPLATES } from "@/data/messages";

type Phase = "open" | "intensity" | "hopes" | "trigger" | "plan" | "delay" | "reassess" | "done";
const DELAY_KEY = "elevate.delayUntil";

const HOPE_LINES: Record<string, string> = {
  "To celebrate": "Not every good day needs alcohol to become a celebration. You can mark this moment in a way you'll actually remember.",
  Relief: "It makes sense to want relief. Let's find some that doesn't come with a bill tomorrow.",
  "To relax": "Wanting to unwind is completely human. There are slower, kinder ways to get there tonight.",
  Excitement: "Wanting a spark is real. Let's find one that leaves tomorrow intact.",
  Confidence: "The confidence you're building sober is the kind that lasts past midnight.",
  "To feel less lonely": "Loneliness is a signal for connection. A real voice can help more than a glass.",
  "To stop feeling misunderstood": "Feeling misunderstood is painful. Alcohol tends to make the next conversation harder, not easier.",
  "To numb something": "Something hurts. You deserve care for it, not just a pause from it.",
  "To fit in": "You can belong without the drink. Most people care far less about your glass than it feels.",
  "Escape from boredom": "Boredom is uncomfortable, and it passes. Let's give the next hour a shape.",
  "The buzz itself": "Missing the feeling is honest. Remember the whole feeling, including the next morning.",
};

export default function Protect() {
  const { vault, update } = useStore();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("open");
  const [intensity, setIntensity] = useState(6);
  const [hopes, setHopes] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [what, setWhat] = useState("");
  const [eventId] = useState(uid);
  const [after, setAfter] = useState(5);

  const s = sobrietyStats(vault);
  const p = vault.profile;
  const name = p.name || "you";

  // resume an in-progress delay
  useEffect(() => {
    try {
      const until = Number(localStorage.getItem(DELAY_KEY) || 0);
      if (until > Date.now()) setPhase("delay");
    } catch {}
  }, []);

  const saveEvent = (patch: Partial<CravingEvent>) =>
    update((v) => {
      const existing = v.cravings.find((c) => c.id === eventId);
      const base: CravingEvent = existing ?? {
        id: eventId,
        at: new Date().toISOString(),
        alreadyDrank: false,
        intensity,
        hopes,
        trigger: [...triggers, what].filter(Boolean).join(" · "),
        tools: [],
      };
      const next = { ...base, intensity, hopes, trigger: [...triggers, what].filter(Boolean).join(" · "), ...patch };
      return { ...v, cravings: [...v.cravings.filter((c) => c.id !== eventId), next] };
    });

  const letters = useMemo(() => {
    const keys = [...hopes, ...triggers];
    const wanted = new Set(keys.flatMap((k) => LETTER_FOR[k] ?? []));
    wanted.add("Open when you want a drink");
    if (keys.includes("Thinking one drink will be harmless")) wanted.add("Open when you think you can control your drinking");
    const matched = vault.letters.filter((l) => wanted.has(l.situation));
    return matched.length ? matched : vault.letters.slice(0, 1);
  }, [hopes, triggers, vault.letters]);

  const memories = vault.memories.slice(-6).reverse();
  const contacts = vault.contacts.filter((c) => c.phone);

  return (
    <div className="fade-in">
      {phase === "open" && (
        <div className="pt-6">
          <div className="eyebrow mb-4">Protect my future</div>
          <h1 className="font-serif text-[38px] leading-[1.1]">
            Before you make a decision, give yourself a moment.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-2">
            You deserve to protect everything you&apos;ve been building{s.current > 0 ? `, including ${s.current} clear days` : ""}.
          </p>
          <div className="mt-10">
            <Label>Have you already had a drink?</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="lg" onClick={() => router.push("/back")}>
                Yes
              </Button>
              <Button size="lg" onClick={() => setPhase("intensity")}>
                Not yet
              </Button>
            </div>
          </div>
        </div>
      )}

      {phase === "intensity" && (
        <Step title="How strong is it right now?" onNext={() => setPhase("hopes")}>
          <div className="text-center font-serif text-[88px] leading-none text-forest">{intensity}</div>
          <input
            type="range"
            min={1}
            max={10}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="mt-4 w-full accent-[var(--gold)]"
            aria-label="Craving strength"
          />
          <div className="mt-1 flex justify-between text-xs text-ink-3">
            <span>A passing thought</span>
            <span>Overwhelming</span>
          </div>
        </Step>
      )}

      {phase === "hopes" && (
        <Step title="What are you hoping alcohol will give you?" sub="There's no wrong answer. Pick any." onNext={() => setPhase("trigger")}>
          <Chips options={HOPES} value={hopes} onChange={setHopes} />
        </Step>
      )}

      {phase === "trigger" && (
        <Step
          title="What happened just before?"
          onNext={() => {
            saveEvent({});
            setPhase("plan");
          }}
        >
          <Chips options={TRIGGERS} value={triggers} onChange={setTriggers} />
          <div className="mt-5">
            <TextArea voice value={what} onChange={setWhat} rows={3} placeholder="In your own words (optional)" />
          </div>
        </Step>
      )}

      {phase === "plan" && (
        <div className="space-y-6">
          <div>
            <div className="eyebrow mb-3">For you, right now</div>
            <h1 className="font-serif text-[34px] leading-tight">
              {hopes[0] && HOPE_LINES[hopes[0]] ? HOPE_LINES[hopes[0]] : `It makes sense that part of you wants this, ${name}. Let's look at the whole picture together.`}
            </h1>
          </div>

          {p.afterFirstDrink && (
            <Card className="bg-surface-2">
              <div className="eyebrow mb-2">In your own words</div>
              <p className="font-serif text-xl leading-snug">“{p.afterFirstDrink}”</p>
              <p className="mt-2 text-sm text-ink-3">What you told us usually happens after the first drink.</p>
            </Card>
          )}

          {p.whySober && (
            <Card>
              <div className="eyebrow mb-2">Your why</div>
              <p className="text-[17px] leading-relaxed">{p.whySober}</p>
            </Card>
          )}

          <Card className="border-gold/40">
            <div className="font-serif text-2xl">Give it 20 minutes.</div>
            <p className="mt-1 text-[15px] leading-relaxed text-ink-2">
              A calm countdown with urge surfing, your own reminders and your people one tap away. Cravings often ease with time, though not always on schedule. Then you decide.
            </p>
            <Button
              full
              size="lg"
              className="mt-4"
              onClick={() => {
                try {
                  localStorage.setItem(DELAY_KEY, String(Date.now() + 20 * 60_000));
                } catch {}
                saveEvent({ tools: ["20-minute delay"] });
                setPhase("delay");
              }}
            >
              Start 20 minutes
            </Button>
          </Card>

          <div className="grid grid-cols-2 gap-2">
            <Tile href="/protect/tape" icon={Route} label="Play the tape forward" />
            <Tile href="/clarity/chat?topic=craving" icon={Sparkles} label="Talk it through" />
            <Tile href="/regulate" icon={Wind} label="Regulate first" />
            <Tile href="/future/letters" icon={Mail} label="Your letters" />
          </div>

          <SupportRow contacts={contacts} />
          <CravingVerse />
          <button onClick={() => setPhase("reassess")} className="w-full py-3 text-sm text-ink-3 underline">
            I&apos;m ready to check in on how I feel
          </button>
        </div>
      )}

      {phase === "delay" && (
        <Delay
          letters={letters}
          memories={memories}
          contacts={contacts}
          onDone={() => {
            try {
              localStorage.removeItem(DELAY_KEY);
            } catch {}
            setPhase("reassess");
          }}
        />
      )}

      {phase === "reassess" && (
        <Step title="How strong is it now?" sub="Whatever the number, you've already done something powerful by pausing.">
          <div className="text-center font-serif text-[72px] leading-none text-forest">{after}</div>
          <input type="range" min={0} max={10} value={after} onChange={(e) => setAfter(Number(e.target.value))} className="mt-4 w-full accent-[var(--gold)]" aria-label="Craving now" />
          <div className="mt-8 grid gap-2">
            <Button
              onClick={() => {
                saveEvent({ intensityAfter: after, outcome: after <= 2 ? "passed" : "eased" });
                setPhase("done");
              }}
            >
              I&apos;m protecting tonight
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                saveEvent({ intensityAfter: after, outcome: "still" });
                try {
                  localStorage.setItem(DELAY_KEY, String(Date.now() + 20 * 60_000));
                } catch {}
                setPhase("delay");
              }}
            >
              Still strong. Another 20 minutes
            </Button>
            <Button variant="ghost" onClick={() => router.push("/clarity/chat?topic=craving")}>
              Talk to Clarity
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                saveEvent({ intensityAfter: after, outcome: "drank" });
                router.push("/back");
              }}
            >
              I drank
            </Button>
          </div>
        </Step>
      )}

      {phase === "done" && (
        <div className="pt-6">
          <div className="eyebrow mb-3">Protected</div>
          <h1 className="font-serif text-[40px] leading-[1.05]">You chose tomorrow.</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-2">
            That counts, every single time. Imagine how good tomorrow morning could feel.
          </p>
          <Card className="mt-6">
            <div className="text-sm text-ink-3">Tonight you protected</div>
            <div className="mt-1 font-serif text-2xl">
              {s.current + 1} clear days · {money(p.dailyDrinkSpend, p.currency)} not spent
            </div>
          </Card>
          <div className="mt-6 grid gap-2">
            <Button href="/future/sober-life">Plan something for tonight</Button>
            <Button href="/future/memories?new=1" variant="outline">
              Record a note to future you
            </Button>
            <Button href="/today" variant="ghost">
              Back to today
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Step({ title, sub, children, onNext }: { title: string; sub?: string; children: React.ReactNode; onNext?: () => void }) {
  return (
    <div className="pt-4">
      <h1 className="font-serif text-[34px] leading-tight">{title}</h1>
      {sub && <p className="mt-2 text-ink-2">{sub}</p>}
      <div className="mt-8">{children}</div>
      {onNext && (
        <div className="mt-10 flex justify-end">
          <Button size="lg" onClick={onNext}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}

function Tile({ href, icon: Icon, label }: { href: string; icon: typeof Phone; label: string }) {
  return (
    <Link href={href} className="card flex items-center gap-3 p-4">
      <Icon size={18} className="text-forest" strokeWidth={1.7} />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

function SupportRow({ contacts }: { contacts: { id: string; name: string; phone: string; role: string }[] }) {
  if (!contacts.length)
    return (
      <Link href="/me/support" className="block text-center text-sm text-ink-3 underline">
        Add someone you can call in moments like this
      </Link>
    );
  const msg = encodeURIComponent(SUPPORT_TEMPLATES[0]);
  return (
    <Section title="Reach a real person">
      <div className="space-y-2">
        {contacts.slice(0, 3).map((c) => (
          <div key={c.id} className="card flex items-center gap-3 p-3 pl-4">
            <div className="flex-1">
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-ink-3">{c.role}</div>
            </div>
            <a href={`sms:${c.phone}?&body=${msg}`} aria-label={`Text ${c.name}`} className="grid h-10 w-10 place-items-center rounded-full bg-surface-2">
              <MessageSquare size={16} />
            </a>
            <a href={`tel:${c.phone}`} aria-label={`Call ${c.name}`} className="grid h-10 w-10 place-items-center rounded-full bg-forest text-on-forest">
              <Phone size={16} />
            </a>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-3">Texts open in your messages app with a suggested note. Nothing sends unless you press send.</p>
    </Section>
  );
}

function CravingVerse() {
  const { vault } = useStore();
  if (!vault.settings.faith) return null;
  const v = verseFor(daysBetween("2024-01-01", dayKey()), "craving");
  return (
    <Card className="bg-surface-2">
      <p className="font-serif text-lg leading-snug">“{v.text}”</p>
      <div className="mt-2 text-sm text-gold">{v.ref}</div>
    </Card>
  );
}

function Delay({
  letters,
  memories,
  contacts,
  onDone,
}: {
  letters: ReturnType<typeof useStore>["vault"]["letters"];
  memories: ReturnType<typeof useStore>["vault"]["memories"];
  contacts: { id: string; name: string; phone: string; role: string }[];
  onDone: () => void;
}) {
  const { vault } = useStore();
  const [left, setLeft] = useState(20 * 60);
  const [card, setCard] = useState(0);
  useEffect(() => {
    const tick = () => {
      let until = 0;
      try {
        until = Number(localStorage.getItem(DELAY_KEY) || 0);
      } catch {}
      const l = Math.max(0, Math.round((until - Date.now()) / 1000));
      setLeft(l);
      if (l === 0) {
        haptic(vault.settings.haptics, [20, 60, 20]);
        onDone();
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [onDone, vault.settings.haptics]);

  const p = vault.profile;
  const cards: { key: string; node: React.ReactNode }[] = [
    {
      key: "surf",
      node: (
        <>
          <div className="eyebrow mb-2">Urge surfing</div>
          <p className="text-[17px] leading-relaxed">
            Notice where the craving sits in your body. Breathe into it. You don&apos;t have to fight it or obey it. Just watch it, like a wave rising and falling.
          </p>
        </>
      ),
    },
    ...(p.whySober ? [{ key: "why", node: <><div className="eyebrow mb-2">Your why</div><p className="font-serif text-xl leading-snug">{p.whySober}</p></> }] : []),
    ...letters.map((l) => ({
      key: l.id,
      node: (
        <>
          <div className="eyebrow mb-2">From your sober self · {l.situation.replace("Open when ", "")}</div>
          {l.body && <p className="whitespace-pre-wrap font-serif text-xl leading-snug">{l.body}</p>}
          {l.mediaId && l.mediaType && <MediaView id={l.mediaId} type={l.mediaType} className="mt-3 w-full rounded-2xl" />}
        </>
      ),
    })),
    ...memories.map((m) => ({
      key: m.id,
      node: (
        <>
          <div className="eyebrow mb-2">Remember this feeling · {m.category}</div>
          <div className="font-serif text-xl">{m.title}</div>
          {m.mediaId && m.mediaType && <MediaView id={m.mediaId} type={m.mediaType} className="mt-3 w-full rounded-2xl" />}
          {m.body && <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{m.body}</p>}
        </>
      ),
    })),
    ...(p.grounding.length
      ? [
          {
            key: "ground",
            node: (
              <>
                <div className="eyebrow mb-2">What grounds you</div>
                <ul className="space-y-1.5 text-[17px]">
                  {p.grounding.slice(0, 5).map((g) => (
                    <li key={g}>· {g}</li>
                  ))}
                </ul>
              </>
            ),
          },
        ]
      : []),
    {
      key: "alt",
      node: (
        <>
          <div className="eyebrow mb-2">Instead, for the next hour</div>
          <ul className="space-y-1.5 text-[17px]">
            {["A hot shower and skincare", "A walk, or a quick workout", "Make a beautiful alcohol-free drink", "Call someone you love", "Browse your ski trip or dream home board", ...p.hobbies.slice(0, 2).map((h) => `Something with ${h.toLowerCase()}`)].map((a) => (
              <li key={a}>· {a}</li>
            ))}
          </ul>
        </>
      ),
    },
    ...(p.futureSelfNote ? [{ key: "note", node: <><div className="eyebrow mb-2">You wanted to remember</div><p className="font-serif text-xl leading-snug">{p.futureSelfNote}</p></> }] : []),
  ];

  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");
  const pct = 1 - left / (20 * 60);
  const c = cards[card % cards.length];

  return (
    <div className="space-y-6">
      <div className="relative mx-auto grid h-64 w-64 place-items-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle cx="50" cy="50" r="46" fill="none" stroke="var(--line)" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="46" fill="none" stroke="var(--gold)" strokeWidth="1.5" strokeDasharray={`${pct * 289} 289`} strokeLinecap="round" className="transition-all duration-1000" />
        </svg>
        <div className="breathe absolute h-40 w-40 rounded-full bg-forest-soft" style={{ ["--breath" as string]: "10s" }} />
        <div className="relative text-center">
          <div className="font-serif text-5xl tabular-nums">
            {mm}:{ss}
          </div>
          <div className="mt-1 text-xs text-ink-3">breathe with the circle</div>
        </div>
      </div>

      <Card className="min-h-[180px]">{c.node}</Card>
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {cards.map((x, i) => (
            <span key={x.key} className={cx("h-1.5 w-1.5 rounded-full", i === card % cards.length ? "bg-gold" : "bg-line")} />
          ))}
        </div>
        <Button variant="soft" size="sm" onClick={() => setCard(card + 1)}>
          Next
        </Button>
      </div>

      {letters.length === 0 && (
        <p className="text-center text-sm text-ink-3">
          Tip: on a calm day, <Link href="/future/letters" className="underline">write a letter</Link> for moments like this one.
        </p>
      )}

      <SupportRow contacts={contacts} />
      <div className="flex flex-wrap justify-center gap-2">
        <Pill>
          <Link href="/regulate">Breathing & grounding</Link>
        </Pill>
        <Pill>
          <Link href="/clarity/chat?topic=craving">Talk to Clarity</Link>
        </Pill>
        <Pill>
          <Link href="/protect/tape">
            <Film size={11} className="mr-1 inline" />
            Play the tape forward
          </Link>
        </Pill>
      </div>
      <button onClick={onDone} className="w-full py-3 text-sm text-ink-3 underline">
        I&apos;m ready to check in now
      </button>
    </div>
  );
}
