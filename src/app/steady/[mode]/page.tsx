"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Mic, Mail, MessageSquareText, Phone, Car, Timer, Check, Heart, PiggyBank, Wind } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, Card, Chips, Input, Label, Notice, PageHeader, TextArea } from "@/components/ui";
import { useCompanionName } from "@/components/companion-name";
import { cheer } from "@/components/cheer";
import { uid, money, cx } from "@/lib/util";

/**
 * Fast, guided pauses for her hardest moments: feeling abandoned, about to say something in an
 * argument, wanting to buy something, or upset and wanting to drive. Works without AI.
 */

const STORIES = ["They're leaving me", "I don't matter to them", "They're mad at me", "I'm too much", "Everyone leaves"];
const OTHER = ["They're busy or at work", "Phone's on silent or dead", "They're driving or asleep", "They need a little space, not forever", "They're dealing with their own stuff"];
const SOOTHE = ["Cuddle Cookies & Codie", "Warm shower", "Wrap up in a blanket", "Put on a comfort song", "Hold something cold", "Walk around the block"];

export default function Steady() {
  const { mode } = useParams<{ mode: string }>();
  if (mode === "argument") return <Argument />;
  if (mode === "spending") return <Spending />;
  if (mode === "driving") return <Driving />;
  return <Abandoned />;
}

function Breathe({ onDone, count = 4 }: { onDone: () => void; count?: number }) {
  const [n, setN] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");
  useEffect(() => {
    if (n >= count) return;
    const t = setTimeout(
      () => {
        if (phase === "in") setPhase("out");
        else {
          setPhase("in");
          setN((x) => x + 1);
        }
      },
      phase === "in" ? 4000 : 6000,
    );
    return () => clearTimeout(t);
  }, [n, phase, count]);
  const done = n >= count;
  return (
    <div className="flex flex-col items-center py-4">
      <div
        className={cx("grid h-36 w-36 place-items-center rounded-full bg-sage-soft text-forest transition-transform ease-in-out", done ? "scale-90 duration-700" : phase === "in" ? "scale-110 duration-[4000ms]" : "scale-75 duration-[6000ms]")}
        aria-live="polite"
      >
        <span className="font-serif text-xl">{done ? "Good." : phase === "in" ? "Breathe in" : "Breathe out"}</span>
      </div>
      <div className="mt-3 text-sm text-ink-3">{done ? "Feet on the floor. You're here." : `Breath ${n + 1} of ${count}`}</div>
      <Button className="mt-4" variant={done ? "primary" : "ghost"} onClick={onDone}>
        {done ? "Next" : "Skip"}
      </Button>
    </div>
  );
}

function Steps({ i, total }: { i: number; total: number }) {
  return (
    <div className="mb-4 flex gap-1">
      {Array.from({ length: total }, (_, n) => (
        <div key={n} className={`h-[3px] flex-1 rounded-full ${n <= i ? "bg-gold" : "bg-line"}`} />
      ))}
    </div>
  );
}

function Bubble({ children }: { children: React.ReactNode }) {
  const cn = useCompanionName();
  return (
    <div className="flex items-start gap-3">
      <span className="float-slow mt-1 h-9 w-9 shrink-0 rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, #fff 0%, #f7f3e9 18%, #eac8ae 42%, #a9c5b4 72%, #2b5443 100%)" }} aria-hidden />
      <div className="bubble-in rounded-2xl rounded-tl-md bg-surface-2 px-4 py-3">
        <div className="text-[11px] uppercase tracking-wider text-ink-3">{cn}</div>
        <div className="font-serif text-[19px] leading-snug">{children}</div>
      </div>
    </div>
  );
}

function SafePeople() {
  const { vault } = useStore();
  const people = vault.contacts.filter((c) => c.phone);
  if (!people.length)
    return (
      <Link href="/me/support" className="card block p-4 text-sm text-ink-2">
        Add the people who feel safe to you, so they&apos;re one tap away next time.
      </Link>
    );
  return (
    <div className="space-y-2">
      {people.slice(0, 4).map((c) => (
        <div key={c.id} className="card flex items-center justify-between p-4">
          <div>
            <div className="font-medium">{c.name}</div>
            <div className="text-xs text-ink-3">{c.role}</div>
          </div>
          <div className="flex gap-2">
            <a href={`sms:${c.phone}`} className="grid h-10 w-10 place-items-center rounded-full bg-surface-2" aria-label={`Text ${c.name}`}>
              <MessageSquareText size={16} />
            </a>
            <a href={`tel:${c.phone}`} className="grid h-10 w-10 place-items-center rounded-full bg-forest text-on-forest" aria-label={`Call ${c.name}`}>
              <Phone size={16} />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- I feel abandoned ---------------- */

function Abandoned() {
  const { vault, update } = useStore();
  const cn = useCompanionName();
  const [i, setI] = useState(0);
  const [what, setWhat] = useState("");
  const [story, setStory] = useState<string[]>([]);
  const [other, setOther] = useState<string[]>([]);
  const [evidence, setEvidence] = useState("");
  const [saved, setSaved] = useState(false);
  const letter = vault.letters.find((l) => l.situation === "Open when you feel abandoned" && (l.body || l.mediaId));
  const name = vault.profile.name || "Veev";

  const save = () => {
    update((v) => ({
      ...v,
      journal: [
        ...v.journal,
        {
          id: uid(),
          kind: "perspective",
          createdAt: new Date().toISOString(),
          title: "When I felt abandoned",
          fields: { "What happened": what, "The story my mind told": story.join(", "), "Other explanations": other.join(", "), "Evidence they care": evidence },
        },
      ],
    }));
    setSaved(true);
    cheer("journal");
  };

  return (
    <div className="page-in">
      <PageHeader back="/today" eyebrow="I feel abandoned" title="I'm right here with you." subtitle="This feeling is huge, and it makes sense. Let's slow it down together." />
      <Steps i={i} total={4} />

      {i === 0 && (
        <Card>
          <Bubble>First, just breathe with me. Nothing to decide yet.</Bubble>
          <Breathe onDone={() => setI(1)} />
        </Card>
      )}

      {i === 1 && (
        <div className="fade-in space-y-5">
          <Bubble>Okay. Tell me what actually happened, just the facts.</Bubble>
          <div>
            <Label>What happened?</Label>
            <TextArea voice rows={3} value={what} onChange={setWhat} placeholder="They haven't texted back in 3 hours…" />
          </div>
          <div>
            <Label>What story is my brain telling me?</Label>
            <Chips options={STORIES} value={story} onChange={setStory} />
          </div>
          <Button full onClick={() => setI(2)}>
            Next
          </Button>
        </div>
      )}

      {i === 2 && (
        <div className="fade-in space-y-5">
          <Bubble>Feelings are real, but they aren&apos;t always facts. Silence isn&apos;t the same as leaving. What else could be going on?</Bubble>
          <div>
            <Label>Other possible explanations</Label>
            <Chips options={OTHER} value={other} onChange={setOther} />
          </div>
          <div>
            <Label hint="Times they showed up, said something kind, came back after a fight.">Evidence they care</Label>
            <TextArea voice rows={3} value={evidence} onChange={setEvidence} placeholder="They called me last night just to talk…" />
          </div>
          <Notice tone="forest">Give it 20 minutes before you send anything or make a big move. The urge will still be there if you need it. Usually it softens.</Notice>
          <Button full onClick={() => setI(3)}>
            Next
          </Button>
        </div>
      )}

      {i === 3 && (
        <div className="fade-in space-y-4">
          <Bubble>You did so good, {name}. What would help most right now?</Bubble>
          <div className="grid grid-cols-2 gap-2">
            <Link href={letter ? "/future/letters" : "/future/letters"} className="card p-4">
              <Mail size={18} className="mb-2 text-gold" />
              <div className="font-medium leading-tight">{letter ? "Open my letter" : "Write my letter for next time"}</div>
            </Link>
            <Link href="/clarity/send" className="card p-4">
              <MessageSquareText size={18} className="mb-2 text-gold" />
              <div className="font-medium leading-tight">Write the text, pause before sending</div>
            </Link>
            <Link href="/voice?topic=abandoned" className="card p-4">
              <Mic size={18} className="mb-2 text-gold" />
              <div className="font-medium leading-tight">Talk it out with {cn}</div>
            </Link>
            <Link href="/regulate" className="card p-4">
              <Wind size={18} className="mb-2 text-gold" />
              <div className="font-medium leading-tight">More calming tools</div>
            </Link>
          </div>
          <div>
            <Label>Something soothing</Label>
            <div className="flex flex-wrap gap-2">
              {SOOTHE.map((s) => (
                <span key={s} className="rounded-full bg-surface-2 px-3 py-1.5 text-sm text-ink-2">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <Label>Someone safe to reach</Label>
            <SafePeople />
          </div>
          <Button full variant="soft" onClick={save} disabled={saved}>
            {saved ? (
              <>
                <Check size={15} /> Saved privately
              </>
            ) : (
              "Save this to my journal"
            )}
          </Button>
          <p className="text-center text-xs text-ink-3">If you feel unsafe, tap Help at the top. It works without internet.</p>
        </div>
      )}
    </div>
  );
}

/* ---------------- About to say something (argument) ---------------- */

const SCRIPTS = [
  "I'm getting really upset and I don't want to say something I'll regret. I need 20 minutes. I'm not leaving, I'll come back and we'll talk.",
  "Can we pause? I care about this, and I want to say it right.",
  "I hear you. I need a minute to calm down before I answer.",
];

function Argument() {
  const cn = useCompanionName();
  const [i, setI] = useState(0);
  const [need, setNeed] = useState("");
  return (
    <div className="page-in">
      <PageHeader back="/today" eyebrow="About to say something" title="Hold that thought, babe." subtitle="Words said in a fight are hard to take back. Pause first, then say what you actually mean." />
      <Steps i={i} total={3} />
      {i === 0 && (
        <Card>
          <Bubble>Don&apos;t say it yet. Three slow breaths with me. You&apos;re not losing, you&apos;re choosing.</Bubble>
          <Breathe count={3} onDone={() => setI(1)} />
        </Card>
      )}
      {i === 1 && (
        <div className="fade-in space-y-4">
          <Bubble>Say one of these instead. Taking a break isn&apos;t leaving, and you can tell them that.</Bubble>
          {SCRIPTS.map((s) => (
            <Card key={s} className="!p-4">
              <p className="font-serif text-lg leading-snug">“{s}”</p>
            </Card>
          ))}
          <Notice tone="forest">While you cool off: another room, cold water on your face, or a walk outside on foot. Not the car.</Notice>
          <Button full onClick={() => setI(2)}>
            I took a break
          </Button>
        </div>
      )}
      {i === 2 && (
        <div className="fade-in space-y-4">
          <Bubble>Okay, calmer you. What do you actually need them to understand?</Bubble>
          <TextArea voice rows={3} value={need} onChange={setNeed} placeholder="I felt hurt when… and I need…" />
          <div className="grid grid-cols-2 gap-2">
            <Link href="/clarity/send" className="card p-4 font-medium leading-tight">
              Help me say it kindly
            </Link>
            <Link href="/voice?topic=argument" className="card p-4 font-medium leading-tight">
              Talk it out with {cn}
            </Link>
          </div>
          <Button
            full
            variant="soft"
            onClick={() => {
              cheer("rodeOut");
              history.back();
            }}
          >
            <Heart size={15} /> I handled it
          </Button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Want to buy something ---------------- */

function Spending() {
  const { vault, update } = useStore();
  const [item, setItem] = useState("");
  const [price, setPrice] = useState("");
  const [upset, setUpset] = useState<string[]>([]);
  const [done, setDone] = useState<"" | "hold" | "save" | "buy">("");
  const cur = vault.profile.currency;
  const amount = Number(price) || 0;
  const fund = vault.funds.find((f) => f.deposits.reduce((a, d) => a + d.amount, 0) < f.target) ?? vault.funds[0];
  const daily = vault.profile.dailyDrinkSpend || 0;

  const hold = () => {
    update((v) => ({
      ...v,
      pauses: [...v.pauses, { id: uid(), action: `Buy ${item || "something"}${amount ? ` (${money(amount, cur)})` : ""}`, kind: "Expensive purchase", answers: { upset: upset.join(", ") }, coolUntil: new Date(Date.now() + 86400_000).toISOString(), createdAt: new Date().toISOString() }],
    }));
    setDone("hold");
    cheer("rodeOut");
  };

  const saveInstead = () => {
    if (!fund || !amount) return;
    update((v) => ({
      ...v,
      funds: v.funds.map((f) => (f.id === fund.id ? { ...f, deposits: [...f.deposits, { id: uid(), amount, date: new Date().toISOString().slice(0, 10), note: `Instead of ${item || "an impulse buy"}` }] } : f)),
    }));
    setDone("save");
    cheer("rodeOut");
  };

  return (
    <div className="page-in">
      <PageHeader back="/today" eyebrow="Want to buy something" title="Cute. But let's check in first." subtitle="No shame, just a quick cool-off so future you is happy too." />
      {done ? (
        <div className="fade-in space-y-4">
          <Bubble>
            {done === "hold"
              ? "On a 24-hour hold. If you still love it tomorrow, it's a calm yes."
              : done === "save"
                ? `${money(amount, cur)} straight to ${fund?.name}. Rich girl behavior.`
                : "Okay, a calm yes. Enjoy it, bestie."}
          </Bubble>
          <Button href="/today" full>
            Back to today
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <Label>What is it?</Label>
            <Input value={item} onChange={(e) => setItem(e.target.value)} placeholder="The boots, the bag, the trip…" />
          </div>
          <div>
            <Label>About how much?</Label>
            <Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))} placeholder="0" />
          </div>
          <div>
            <Label>Right now I&apos;m feeling…</Label>
            <Chips options={["Calm", "Upset", "Bored", "Lonely", "After a fight", "Celebrating"]} value={upset} onChange={setUpset} />
          </div>
          {amount > 0 && (
            <Card className="sunlit !p-4 text-[15px] leading-relaxed">
              {fund && fund.target > 0 && (
                <p>
                  That&apos;s <b>{Math.round((amount / fund.target) * 100)}%</b> of your <b>{fund.name}</b> goal.
                </p>
              )}
              {daily > 0 && <p>Or about {Math.max(1, Math.round(amount / daily))} days of not-spent money from sobriety.</p>}
              <p className="mt-2 text-ink-2">Would you still buy it tomorrow morning? Is it a need or a feeling?</p>
            </Card>
          )}
          {upset.some((x) => x !== "Calm") && <Bubble>Feelings shop fast. Let&apos;s give this one a day.</Bubble>}
          <div className="space-y-2">
            <Button full onClick={hold}>
              <Timer size={15} /> Put it on a 24-hour hold
            </Button>
            {fund && amount > 0 && (
              <Button full variant="soft" onClick={saveInstead}>
                <PiggyBank size={15} /> Move it to {fund.name} instead
              </Button>
            )}
            <Button full variant="ghost" onClick={() => setDone("buy")}>
              I&apos;ve thought it through. It&apos;s a calm yes.
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Upset and want to drive ---------------- */

function Driving() {
  const cn = useCompanionName();
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (left === null || left <= 0) return;
    const t = setTimeout(() => setLeft((x) => (x ?? 0) - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const mm = left !== null ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}` : "";

  return (
    <div className="page-in">
      <PageHeader back="/today" eyebrow="Upset and want to drive" title="Keys down for a sec." subtitle="Upset driving is how people get hurt, and you matter way too much." />
      <Notice tone="rose">
        <Car size={14} className="mr-1 inline" /> If you&apos;re driving right now, pull over somewhere safe first. Then come back here.
      </Notice>
      <div className="mt-5 space-y-4">
        <Bubble>Let&apos;s cool down for 10 minutes before you even think about the car. I&apos;ll keep time.</Bubble>
        <Card className="text-center">
          {left === null ? (
            <Button onClick={() => setLeft(600)}>
              <Timer size={15} /> Start 10-minute cool-down
            </Button>
          ) : left > 0 ? (
            <>
              <div className="font-serif text-6xl tabular-nums">{mm}</div>
              <p className="mt-2 text-sm text-ink-3">Cold water on your face, slow breaths, walk around on foot, blast a song.</p>
            </>
          ) : (
            <>
              <div className="font-serif text-2xl">Time&apos;s up. How do you feel?</div>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <Button size="sm" variant="soft" onClick={() => setLeft(600)}>
                  Still heated, 10 more
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    cheer("rodeOut");
                    history.back();
                  }}
                >
                  Calmer now
                </Button>
              </div>
            </>
          )}
        </Card>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/regulate" className="card p-4 font-medium leading-tight">
            Breathe with me
          </Link>
          <Link href="/voice?topic=driving" className="card p-4 font-medium leading-tight">
            Talk to {cn} instead
          </Link>
        </div>
        <div>
          <Label>Or let someone else drive</Label>
          <SafePeople />
        </div>
      </div>
    </div>
  );
}
