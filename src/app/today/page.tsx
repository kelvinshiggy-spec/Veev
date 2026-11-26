"use client";

import { cheer } from "@/components/cheer";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Wine, Mic, LifeBuoy, Wind, ChevronRight, Calendar, Sparkles, Lightbulb, BookOpen, Check, Sun, Moon, Feather, Music, CloudSun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudFog } from "lucide-react";
import { useStore } from "@/lib/store";
import { sobrietyStats, nextMilestone, milestoneLabel } from "@/lib/sobriety";
import { Card, LinkCard, Section, Progress, Sheet, Pill, Button, Input } from "@/components/ui";
import { CheckInForm } from "@/components/checkin";
import { Scene } from "@/components/scene";
import { MediaView } from "@/components/media";
import { dayKey, fmtDate, money, partOfDay, pickOfDay, daysBetween, uid, cx } from "@/lib/util";
import { verseFor } from "@/data/verses";
import { VylieDay } from "@/components/vylie-day";
import { HardMoments, SomethingNew, momentFor } from "@/components/day-extras";
import { ENCOURAGEMENT, MORNING_OPENERS, AFFIRMATIONS, HELLOS, HELLO_LINES, DAY_LINES } from "@/data/messages";
import { holidayNear, season, SEASON_COPY } from "@/lib/seasons";
import { useWeather, weatherLine, describe } from "@/lib/weather";
import { useSafety } from "@/components/safety";
import { CName } from "@/components/companion-name";
import { recommendSkill } from "@/data/studio";

export default function Today() {
  const { vault, update } = useStore();
  const safety = useSafety();
  const weather = useWeather();
  const [checkOpen, setCheckOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const today = dayKey();
  const s = sobrietyStats(vault, today);
  const name = vault.profile.name || "Veev";
  const pod = now ? partOfDay(now) : "morning";
  const weekday = (now ?? new Date()).getDay();
  const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][weekday];
  const helloTpl = pickOfDay(HELLOS[pod], 21) ?? "Hey {name}";
  const greet = helloTpl.replace("{name}", name).replace("{day}", dayName);
  const helloLine = (helloTpl.includes("{day}") ? pickOfDay(DAY_LINES[weekday], 25) : pickOfDay(HELLO_LINES, 23)) ?? "";
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
  const holiday = holidayNear(today, 5);
  const seasonNow = SEASON_COPY[season(now ?? undefined)];
  const affirmation = pickOfDay(AFFIRMATIONS, 5) ?? "";
  const manifestoLines = vault.manifesto.text.split("\n").filter((l) => l.trim());
  const manifestoLine = pickOfDay(manifestoLines, 13);
  const cover = pickOfDay(vault.settings.coverPhotoIds, 2);
  const eveningTime = pod === "evening" || pod === "night";
  const nextGoal = vault.vision.filter((x) => x.progress < 100).sort((a, b) => (a.targetDate ?? "9999").localeCompare(b.targetDate ?? "9999"))[0];
  const WIcon = weather ? { sun: CloudSun, cloud: Cloud, rain: CloudRain, snow: CloudSnow, storm: CloudLightning, fog: CloudFog }[describe(weather.code).kind] : null;

  const saveIntention = () => {
    if (intentDraft.trim() === intention) return;
    update((v) => ({ ...v, intentions: { ...v.intentions, [today]: intentDraft.trim() } }));
    if (intentDraft.trim()) cheer("intention");
  };

  const actions = (
    <div className="space-y-2">
      <Link href="/voice" className="relative flex items-center gap-4 overflow-hidden rounded-[22px] bg-forest p-5 text-on-forest shadow-[var(--shadow)] active:scale-[0.99]">
        <span
          className="float-slow h-14 w-14 shrink-0 rounded-full"
          style={{ background: "radial-gradient(circle at 35% 30%, #fff 0%, #f7f3e9 18%, #eac8ae 42%, #a9c5b4 72%, #2b5443 100%)" }}
          aria-hidden
        />
        <span className="flex-1">
          <span className="block font-serif text-[26px] leading-none">
            Talk to <CName />
          </span>
          <span className="mt-1 block text-sm opacity-80">Voice or text. Fun, honest, always in your corner.</span>
        </span>
        <Mic size={20} className="opacity-80" />
      </Link>
      <div className="grid grid-cols-2 gap-2">
        <Link href="/protect" className="card flex items-center gap-3 p-4 active:scale-[0.98]">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-soft text-ink">
            <Wine size={18} strokeWidth={1.7} />
          </span>
          <span className="text-[14.5px] font-medium leading-tight">I want a drink</span>
        </Link>
        <button onClick={() => safety.open("menu")} className="card flex items-center gap-3 p-4 text-left active:scale-[0.98]">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-rose-soft text-rose">
            <LifeBuoy size={18} strokeWidth={1.7} />
          </span>
          <span className="text-[14.5px] font-medium leading-tight">Okay girl, let&apos;s get help</span>
        </button>
      </div>
      <Link href="/regulate" className="flex items-center justify-center gap-2 pt-1 text-sm text-ink-3">
        <Wind size={14} /> Help me regulate
      </Link>
    </div>
  );

  return (
    <div className="space-y-7">
      {/* Hero */}
      <div className="fade-in relative -mx-5 -mt-6 overflow-hidden">
        {cover && !gentle ? (
          <MediaView id={cover} type="image" className="h-[260px] w-full object-cover" />
        ) : (
          <Scene className="h-[240px] w-full" tone={gentle ? "calm" : undefined} />
        )}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-bg to-transparent" />
        <div className="absolute inset-x-5 bottom-3">
          <div className="eyebrow !text-ink-2">{now ? fmtDate(now, { weekday: "long", month: "long", day: "numeric" }) : " "}</div>
          <h1 className="mt-1 font-serif text-[40px] leading-none text-ink">
            {greet}
            {/[?.!]$/.test(greet) ? "" : "."}
          </h1>
          {!gentle && <p className="mt-1.5 text-[15px] text-ink-2">{helloLine}</p>}
          {weather && WIcon && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-3 py-1 text-xs text-ink-2 backdrop-blur">
              <WIcon size={13} /> {Math.round(weather.temp)}° · {describe(weather.code).label}
            </div>
          )}
        </div>
      </div>

      {pod === "morning" && !gentle && <p className="-mt-3 font-serif text-xl italic text-ink-2">{opener}</p>}
      {weather && !gentle && <p className="-mt-4 text-sm text-ink-3">{weatherLine(weather)}</p>}

      <VylieDay name={name} />

      {!gentle && actions}

      <HardMoments highlight={momentFor(checkIn?.emotions)} />

      {holiday && (
        <Card className="glow overflow-hidden" >
          <div className="eyebrow">{holiday.inDays === 0 ? "Today" : holiday.inDays === 1 ? "Tomorrow" : `In ${holiday.inDays} days`} · {holiday.name}</div>
          <div className="mt-2 font-serif text-[26px] leading-tight">
            {holiday.emoji} {holiday.greeting}
          </div>
          {holiday.risky && <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{holiday.heads}</p>}
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="mb-1 font-medium">Sober plans</div>
              <ul className="space-y-1 text-ink-2">
                {holiday.plans.slice(0, 3).map((x) => (
                  <li key={x}>· {x}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-1 font-medium">Mocktail menu</div>
              <ul className="space-y-1 text-ink-2">
                {holiday.mocktails.slice(0, 3).map((x) => (
                  <li key={x}>· {x}</li>
                ))}
              </ul>
            </div>
          </div>
          <Button href={`/voice?topic=holiday`} size="sm" variant="outline" className="mt-4">
            Plan it with <CName />
          </Button>
        </Card>
      )}

      {!gentle && vault.settings.editions[eveningTime ? "evening" : "morning"] && (
        <Link href={eveningTime ? "/today/evening" : "/today/morning"} className={cx("block rounded-[22px] p-5 shadow-[var(--shadow)] active:scale-[0.99]", eveningTime ? "dusk" : "sunlit border border-line")}>
          <div className="flex items-center justify-between">
            <div>
              <div className="eyebrow">{eveningTime ? "The Evening Edition" : "The Morning Edition"}</div>
              <div className="mt-1 font-serif text-2xl">{eveningTime ? "Wind down, love." : "Your day, beautifully planned."}</div>
              <div className={cx("text-sm", eveningTime ? "opacity-80" : "text-ink-3")}>{eveningTime ? "A two-minute reflection. Spoken or written." : "Intention, plans, and one reason to protect today."}</div>
            </div>
            {eveningTime ? <Moon size={22} className="opacity-80" /> : <Sun size={22} className="text-gold" />}
          </div>
        </Link>
      )}

      {!vault.profile.personalized && !gentle && (
        <LinkCard href="/welcome?more=1" className="border-dashed">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Finish making VEEV yours</div>
              <div className="text-sm text-ink-3">A few more questions, about 5 minutes. Unlocks a better manifesto.</div>
            </div>
            <ChevronRight size={18} className="text-ink-3" />
          </div>
        </LinkCard>
      )}

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

      {!gentle && (
        <div className="relative overflow-hidden rounded-[22px] border border-line bg-gradient-to-br from-peach-soft via-surface to-sage-soft p-6 text-center">
          <div className="eyebrow">Today&apos;s affirmation</div>
          <p className="mt-3 font-serif text-[25px] leading-snug text-ink">{affirmation}</p>
          {vault.profile.qualities.length > 0 && <p className="mt-3 text-xs uppercase tracking-[0.14em] text-ink-3">{vault.profile.qualities.slice(0, 3).join(" · ")}</p>}
        </div>
      )}

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

      {!gentle && <SomethingNew />}

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
                  onClick={() => {
                    update((v) => ({
                      ...v,
                      habits: v.habits.map((x) => (x.id === h.id ? { ...x, log: { ...x.log, [today]: !done } } : x)),
                    }));
                    if (!done) cheer("habit");
                  }}
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

      {!gentle && manifestoLine && (
        <Section title="From your manifesto" action={<Link href="/future/manifesto" className="text-sm text-ink-3">Read</Link>}>
          <LinkCard href="/future/manifesto" className="sunlit">
            <Feather size={16} className="mb-2 text-gold" />
            <p className="font-serif text-[22px] leading-snug">{manifestoLine}</p>
          </LinkCard>
        </Section>
      )}

      {!gentle && nextGoal && (
        <Section title="One goal, one step" action={<Link href="/future/vision" className="text-sm text-ink-3">Vision</Link>}>
          <LinkCard href="/future/vision">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{nextGoal.title}</div>
                <div className="text-sm text-ink-3">{nextGoal.milestones.find((m) => !m.done)?.text ?? "Add your next milestone"}</div>
              </div>
              <span className="font-serif text-2xl text-forest">{nextGoal.progress}%</span>
            </div>
            <Progress value={nextGoal.progress} className="mt-3" tone="forest" />
          </LinkCard>
        </Section>
      )}

      {!gentle && (
        <Section title={`${seasonNow.name} vibes`}>
          <div className="grid grid-cols-2 gap-2">
            <LinkCard href="/future/vibes" className="!p-4">
              <Music size={16} className="mb-2 text-gold" />
              <div className="text-[15px] font-medium">Watch & listen</div>
              <div className="text-xs text-ink-3">Picks for your mood</div>
            </LinkCard>
            <LinkCard href="/future/sober-life" className="!p-4">
              <Sparkles size={16} className="mb-2 text-gold" />
              <div className="text-[15px] font-medium">{seasonNow.ideas[0]}</div>
              <div className="text-xs text-ink-3">{seasonNow.vibe}</div>
            </LinkCard>
          </div>
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
