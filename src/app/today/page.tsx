"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Wine, MessageCircle, Wind, ChevronRight, Calendar, Sparkles, Lightbulb, BookOpen, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { sobrietyStats, nextMilestone, milestoneLabel } from "@/lib/sobriety";
import { Card, LinkCard, Section, Progress, Sheet, Pill, Button, Input } from "@/components/ui";
import { CheckInForm } from "@/components/checkin";
import { Scene } from "@/components/scene";
import { MediaView } from "@/components/media";
import { dayKey, fmtDate, money, partOfDay, pickOfDay, daysBetween, uid, cx } from "@/lib/util";
import { verseFor } from "@/data/verses";
import { ENCOURAGEMENT, MORNING_OPENERS } from "@/data/messages";
import { recommendSkill } from "@/data/studio";

export default function Today() {
  const { vault, update } = useStore();
  const [checkOpen, setCheckOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const today = dayKey();
  const s = sobrietyStats(vault, today);
  const name = vault.profile.name || "you";
  const pod = now ? partOfDay(now) : "morning";
  const greet = { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening", night: "Still up" }[pod];
  const checkIn = vault.checkIns.filter((c) => c.date === today).sort((a, b) => b.at.localeCompare(a.at))[0];
  const gentle = !!checkIn && (checkIn.mood <= 2 || checkIn.craving >= 6);
  const good = !!checkIn && checkIn.mood >= 4 && checkIn.craving <= 2;
  const intention = vault.intentions[today] ?? "";
  const [intentDraft, setIntentDraft] = useState(intention);
  useEffect(() => setIntentDraft(intention), [intention]);

  const next = nextMilestone(s.current);
  const prevMs = [0, 1, 3, 7, 14, 21, 30, 45, 60, 90, 120, 180, 270, 365].filter((m) => m <= s.current).pop() ?? 0;
  const msPct = ((s.current - prevMs) / Math.max(1, next - prevMs)) * 100;

  const dayIndex = daysBetween("2024-01-01", today);
  const lapseRecent = s.streaks.some((x) => x.end && daysBetween(x.end, today) <= 3);
  const verse = verseFor(dayIndex, lapseRecent ? "lapse" : gentle ? "hard" : "default");
  const encouragement = pickOfDay(ENCOURAGEMENT[gentle ? "hard" : good ? "good" : "steady"], 3) ?? "";
  const opener = pickOfDay(MORNING_OPENERS, 7) ?? "";

  const memory = useMemo(() => pickOfDay(vault.memories, 11), [vault.memories]);
  const upcoming = vault.activities
    .filter((a) => a.status === "planned" && (!a.date || a.date >= today))
    .sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999"))[0];
  const appt = vault.therapy.appointments.filter((a) => a.at >= new Date().toISOString()).sort((a, b) => a.at.localeCompare(b.at))[0];
  const habitsToday = vault.habits.filter((h) => !h.archived && h.days.includes(new Date().getDay()));
  const doneCount = habitsToday.filter((h) => h.log[today]).length;
  const skill = recommendSkill(checkIn);
  const inbox = vault.ideas.filter((x) => x.status === "inbox").length;

  const saveIntention = () => update((v) => ({ ...v, intentions: { ...v.intentions, [today]: intentDraft.trim() } }));

  const actions = (
    <div className="grid grid-cols-3 gap-2">
      {[
        { href: "/protect", icon: Wine, label: "I want a drink" },
        { href: "/talk", icon: MessageCircle, label: "I need to talk" },
        { href: "/regulate", icon: Wind, label: "Help me regulate" },
      ].map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className="card flex flex-col items-start gap-3 p-4 transition active:scale-[0.98]"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-forest-soft text-forest">
            <a.icon size={17} strokeWidth={1.7} />
          </span>
          <span className="text-[13.5px] font-medium leading-tight text-ink">{a.label}</span>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="space-y-7">
      {/* Hero */}
      <div className="fade-in relative -mx-5 -mt-6 overflow-hidden">
        <Scene className="h-[220px] w-full" tone={gentle ? "calm" : undefined} />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-bg to-transparent" />
        <div className="absolute inset-x-5 bottom-3">
          <div className="eyebrow !text-ink-2">{now ? fmtDate(now, { weekday: "long", month: "long", day: "numeric" }) : " "}</div>
          <h1 className="mt-1 font-serif text-[40px] leading-none text-ink">
            {greet}, {name}.
          </h1>
        </div>
      </div>

      {pod === "morning" && !gentle && <p className="-mt-3 font-serif text-xl italic text-ink-2">{opener}</p>}

      {gentle && (
        <Card className="border-forest/30 bg-forest-soft">
          <div className="font-serif text-2xl">Let's keep today simple.</div>
          <p className="mt-1 text-[15px] leading-relaxed text-ink-2">
            You checked in feeling {checkIn.mood <= 2 ? "low" : "a strong pull"}. That's honest, and it's enough. Here's what's closest to hand.
          </p>
          <div className="mt-4">{actions}</div>
        </Card>
      )}

      {/* Streak */}
      <Card className="relative overflow-hidden">
        <div className="flex items-end justify-between">
          <div>
            <div className="eyebrow">Clear days</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-serif text-[76px] leading-none text-forest">{s.current}</span>
              <span className="text-ink-3">{s.current === 1 ? "day" : "days"}</span>
            </div>
            {s.current === 0 && <div className="text-sm text-ink-2">Today is day one. That takes courage.</div>}
          </div>
          <div className="text-right text-sm text-ink-3">
            <div>Next: {milestoneLabel(next)}</div>
            <div className="text-ink-2">{next - s.current} to go</div>
          </div>
        </div>
        <Progress value={msPct} className="mt-4" />
        <div className="mt-5 grid grid-cols-3 divide-x divide-line text-center">
          <div>
            <div className="font-serif text-2xl">{s.total}</div>
            <div className="text-xs text-ink-3">total sober days</div>
          </div>
          <div>
            <div className="font-serif text-2xl">{s.longest}</div>
            <div className="text-xs text-ink-3">longest stretch</div>
          </div>
          <Link href="/future/finances">
            <div className="font-serif text-2xl">{money(s.estSaved, vault.profile.currency)}</div>
            <div className="text-xs text-ink-3">est. not spent</div>
          </Link>
        </div>
      </Card>

      {!gentle && <Section title="Right now">{actions}</Section>}

      {/* Check-in */}
      <Section title="Check-in">
        {checkIn ? (
          <Card onClick={() => setCheckOpen(true)} className="flex items-center justify-between">
            <div>
              <div className="text-[15px] text-ink">
                Feeling {["heavy", "low", "okay", "good", "wonderful"][checkIn.mood - 1]}
                {checkIn.emotions.length > 0 && <span className="text-ink-3"> · {checkIn.emotions.slice(0, 3).join(", ")}</span>}
              </div>
              <div className="text-sm text-ink-3">Craving {checkIn.craving}/10 · tap to update</div>
            </div>
            <Check className="text-forest" size={18} />
          </Card>
        ) : (
          <Card onClick={() => setCheckOpen(true)} className="flex items-center justify-between">
            <div>
              <div className="font-serif text-xl">How are you this {pod === "night" ? "evening" : pod}?</div>
              <div className="text-sm text-ink-3">Thirty seconds. Helps {vault.profile.name ? "VEEV" : "the app"} meet you where you are.</div>
            </div>
            <ChevronRight className="text-ink-3" size={18} />
          </Card>
        )}
      </Section>

      {/* Intention */}
      <Section title="Today's intention">
        <div className="flex gap-2">
          <Input
            value={intentDraft}
            onChange={(e) => setIntentDraft(e.target.value)}
            onBlur={saveIntention}
            onKeyDown={(e) => e.key === "Enter" && (e.currentTarget.blur())}
            placeholder={gentle ? "Just get through today gently" : "Today I will…"}
            aria-label="Today's intention"
          />
        </div>
        {!intention && vault.profile.whySober && (
          <p className="mt-2 text-sm text-ink-3">Your why: “{vault.profile.whySober.slice(0, 120)}{vault.profile.whySober.length > 120 ? "…" : ""}”</p>
        )}
      </Section>

      {/* Verse */}
      {vault.settings.faith && (
        <Section title="Today's verse">
          <LinkCard href="/faith" className="bg-surface">
            <p className="font-serif text-[22px] leading-snug text-ink">“{verse.text}”</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gold">{verse.ref}</span>
              <BookOpen size={16} className="text-ink-3" />
            </div>
            <div className="hairline my-4" />
            <p className="text-[15px] leading-relaxed text-ink-2">{verse.reflection}</p>
          </LinkCard>
        </Section>
      )}

      {skill && (gentle || (checkIn && checkIn.emotions.length > 0)) && (
        <Section title="Might help today">
          <LinkCard href={`/clarity/studio/${skill.id}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-serif text-xl">{skill.title}</div>
                <div className="text-sm text-ink-3">
                  {skill.minutes} min · {skill.skill}
                </div>
              </div>
              <ChevronRight size={18} className="text-ink-3" />
            </div>
          </LinkCard>
        </Section>
      )}

      {/* Habits */}
      {habitsToday.length > 0 && (
        <Section
          title="Today's rhythm"
          action={
            <Link href="/journey/habits" className="text-sm text-ink-3">
              {doneCount}/{habitsToday.length}
            </Link>
          }
        >
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
            {habitsToday.map((h) => {
              const done = !!h.log[today];
              return (
                <button
                  key={h.id}
                  onClick={() =>
                    update((v) => ({
                      ...v,
                      habits: v.habits.map((x) => (x.id === h.id ? { ...x, log: { ...x.log, [today]: !done } } : x)),
                    }))
                  }
                  className={cx(
                    "shrink-0 rounded-full border px-4 py-2.5 text-sm transition",
                    done ? "border-forest bg-forest text-on-forest" : "border-line bg-surface text-ink-2",
                  )}
                >
                  {done && <Check size={13} className="mr-1 inline" />}
                  {h.name}
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {!gentle && (
        <>
          <Section title="Something to look forward to">
            {upcoming ? (
              <LinkCard href="/future/sober-life">
                <div className="flex items-center gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-soft text-ink">
                    <Calendar size={18} />
                  </span>
                  <div>
                    <div className="font-medium">{upcoming.title}</div>
                    <div className="text-sm text-ink-3">{upcoming.date ? fmtDate(upcoming.date, { weekday: "long", month: "short", day: "numeric" }) : "Planned"}</div>
                  </div>
                </div>
              </LinkCard>
            ) : (
              <LinkCard href="/future/sober-life">
                <div className="font-serif text-xl">Plan something lovely</div>
                <div className="text-sm text-ink-3">A dinner, a ski weekend, a slow Sunday. Give tonight or this weekend a shape.</div>
              </LinkCard>
            )}
          </Section>

          {memory && (
            <Section title="Remember this feeling">
              <LinkCard href="/future/memories">
                <Pill tone="gold">{memory.category}</Pill>
                <div className="mt-2 font-serif text-xl">{memory.title}</div>
                {memory.mediaId && memory.mediaType === "image" && <MediaView id={memory.mediaId} type="image" className="mt-3 max-h-56 w-full rounded-2xl object-cover" />}
                {memory.body && <p className="mt-1 line-clamp-3 text-[15px] text-ink-2">{memory.body}</p>}
                <div className="mt-2 text-xs text-ink-3">{fmtDate(memory.createdAt, { month: "long", day: "numeric", year: "numeric" })}</div>
              </LinkCard>
            </Section>
          )}

          {vault.profile.goals.length > 0 && (
            <Section title="What you're building" action={<Link href="/future" className="text-sm text-ink-3">My Future</Link>}>
              <Card>
                <ul className="space-y-2">
                  {vault.profile.goals.slice(0, 4).map((g) => (
                    <li key={g} className="flex items-center gap-3 text-[15px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {g}
                    </li>
                  ))}
                </ul>
              </Card>
            </Section>
          )}
        </>
      )}

      {appt && (
        <Section title="Therapy">
          <LinkCard href="/me/therapy">
            <div className="font-medium">
              {appt.with || "Session"} · {fmtDate(appt.at, { weekday: "short", month: "short", day: "numeric" })},{" "}
              {new Date(appt.at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
            </div>
            <div className="text-sm text-ink-3">Want to prepare a summary beforehand?</div>
          </LinkCard>
        </Section>
      )}

      <IdeaQuick count={inbox} />

      <Card className="bg-surface-2">
        <Sparkles size={16} className="mb-2 text-gold" />
        <p className="font-serif text-[21px] leading-snug">{encouragement}</p>
        {good && (
          <Button href="/future/memories?new=1" variant="outline" size="sm" className="mt-4">
            Capture this feeling
          </Button>
        )}
      </Card>

      <Sheet open={checkOpen} onClose={() => setCheckOpen(false)} title="Check in">
        <CheckInForm existing={checkIn} onDone={() => setCheckOpen(false)} />
      </Sheet>
    </div>
  );
}

function IdeaQuick({ count }: { count: number }) {
  const { update } = useStore();
  const [t, setT] = useState("");
  const [saved, setSaved] = useState(false);
  const add = () => {
    if (!t.trim()) return;
    update((v) => ({ ...v, ideas: [{ id: uid(), raw: t.trim(), createdAt: new Date().toISOString(), status: "inbox" }, ...v.ideas] }));
    setT("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  return (
    <Section title="Idea inbox" action={<Link href="/future/ideas" className="text-sm text-ink-3">{count ? `${count} waiting` : "Open"}</Link>}>
      <div className="flex gap-2">
        <Input value={t} onChange={(e) => setT(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Dump an idea. We'll help you build it." />
        <button onClick={add} aria-label="Save idea" className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold text-[#1b1a17]">
          <Lightbulb size={18} />
        </button>
      </div>
      {saved && (
        <p className="mt-2 text-sm text-forest">
          Saved. <Link href="/future/ideas" className="underline">Build it now</Link>
        </p>
      )}
    </Section>
  );
}
