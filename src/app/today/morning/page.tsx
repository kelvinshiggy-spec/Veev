"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Volume2, Square, Mic, Calendar, Feather, Target } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, Card, Input, PageHeader, Section } from "@/components/ui";
import { Scene } from "@/components/scene";
import { useCompanionName } from "@/components/companion-name";
import { sobrietyStats } from "@/lib/sobriety";
import { dayKey, fmtDate, pickOfDay, money } from "@/lib/util";
import { MORNING_OPENERS, AFFIRMATIONS } from "@/data/messages";
import { holidayNear } from "@/lib/seasons";
import { useWeather, weatherLine } from "@/lib/weather";
import { speakAsCompanion, stopSpeaking, speechSupported } from "@/lib/voice";

const DAY_TYPES = ["Productive", "Peaceful", "Social", "Adventurous", "Soft & slow", "Glow-up"];

export default function MorningEdition() {
  const { vault, update } = useStore();
  const cn = useCompanionName();
  const weather = useWeather();
  const today = dayKey();
  const s = sobrietyStats(vault, today);
  const [intent, setIntent] = useState(vault.intentions[today] ?? "");
  const [playing, setPlaying] = useState(false);
  useEffect(() => () => stopSpeaking(), []);

  const name = vault.profile.name || "gorgeous";
  const opener = pickOfDay(MORNING_OPENERS, 7) ?? "";
  const affirmation = pickOfDay(AFFIRMATIONS, 5) ?? "";
  const upcoming = vault.activities.filter((a) => a.status === "planned" && (!a.date || a.date >= today)).sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999"))[0];
  const goal = vault.vision.find((v) => v.progress < 100) ?? null;
  const reason = vault.profile.whySober || pickOfDay(vault.profile.goals, 3) || "Because clear mornings like this one are the whole point.";
  const manifestoLine = vault.manifesto.inMorning ? pickOfDay(vault.manifesto.text.split("\n").filter((l) => l.trim()), 17) : undefined;
  const holiday = holidayNear(today, 2);

  const briefing = [
    `Good morning, ${name}.`,
    opener,
    s.current > 0 ? `You're on day ${s.current}. That's ${s.current === 1 ? "a real start" : "real progress"}.` : "Today is day one, and that takes guts.",
    weather ? weatherLine(weather) : "",
    holiday ? `${holiday.inDays === 0 ? "It's" : "Coming up:"} ${holiday.name}. ${holiday.heads}` : "",
    upcoming ? `Something to look forward to: ${upcoming.title}.` : "",
    goal ? `One goal to nudge forward: ${goal.title}.` : "",
    `One reason to protect today: ${reason}`,
    "What kind of day would you like to have?",
  ]
    .filter(Boolean)
    .join(" ");

  const play = () => {
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    speakAsCompanion(briefing, vault.companion, { onEnd: () => setPlaying(false) });
  };

  const saveIntent = (t: string) => {
    setIntent(t);
    update((v) => ({ ...v, intentions: { ...v.intentions, [today]: t.trim() } }));
  };

  return (
    <div className="page-in">
      <div className="relative -mx-5 -mt-6 overflow-hidden">
        <Scene className="h-[200px] w-full" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent" />
      </div>
      <PageHeader back="/today" eyebrow={`The Morning Edition · ${fmtDate(today, { weekday: "long", month: "long", day: "numeric" })}`} title={`Good morning, ${name}.`} subtitle="Another beautiful day to build your life." />

      <Card className="sunlit">
        <p className="font-serif text-[22px] leading-snug">{opener}</p>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
          {s.current > 0 ? `Day ${s.current}. ` : ""}You&apos;ve been making meaningful progress. Today could be a great day for a workout, something to look forward to, and the people and things you love.
        </p>
        {weather && <p className="mt-3 text-sm text-ink-3">{weatherLine(weather)}</p>}
        {speechSupported() && (
          <Button variant="soft" size="sm" className="mt-4" onClick={play}>
            {playing ? <Square size={14} /> : <Volume2 size={14} />} {playing ? "Stop" : `Hear it from ${cn}`}
          </Button>
        )}
      </Card>

      <Section title="What kind of day do you want?" className="mt-6">
        <div className="flex flex-wrap gap-2">
          {DAY_TYPES.map((d) => (
            <button key={d} onClick={() => saveIntent(`A ${d.toLowerCase()} day`)} className="rounded-full border border-line bg-surface px-3.5 py-2 text-sm">
              {d}
            </button>
          ))}
        </div>
        <Input className="mt-3" value={intent} onChange={(e) => saveIntent(e.target.value)} placeholder="Today I will…" aria-label="Morning intention" />
      </Section>

      <div className="grid grid-cols-2 gap-3">
        <Card className="!p-4">
          <div className="eyebrow">Clear days</div>
          <div className="mt-1 font-serif text-4xl text-forest">{s.current}</div>
          <div className="text-xs text-ink-3">{money(s.estSaved, vault.profile.currency)} not spent</div>
        </Card>
        <Card className="!p-4">
          <div className="eyebrow">Affirmation</div>
          <p className="mt-1 text-sm leading-snug">{affirmation}</p>
        </Card>
      </div>

      <div className="mt-6 space-y-3">
        {upcoming && (
          <Link href="/future/sober-life" className="card flex items-center gap-3 p-4">
            <Calendar size={18} className="text-gold" />
            <div>
              <div className="text-xs text-ink-3">Looking forward to</div>
              <div className="font-medium">{upcoming.title}</div>
            </div>
          </Link>
        )}
        {goal && (
          <Link href="/future/vision" className="card flex items-center gap-3 p-4">
            <Target size={18} className="text-gold" />
            <div>
              <div className="text-xs text-ink-3">One meaningful goal</div>
              <div className="font-medium">{goal.title}</div>
            </div>
          </Link>
        )}
        <Card className="!p-4">
          <div className="text-xs text-ink-3">One reason to protect today</div>
          <p className="mt-1 font-serif text-xl leading-snug">{reason}</p>
        </Card>
        {manifestoLine && (
          <Link href="/future/manifesto" className="card flex gap-3 p-4">
            <Feather size={18} className="mt-1 shrink-0 text-gold" />
            <p className="font-serif text-lg italic leading-snug">{manifestoLine}</p>
          </Link>
        )}
      </div>

      <Button href="/voice" full size="lg" className="mt-6">
        <Mic size={16} /> Talk through my day with {cn}
      </Button>
    </div>
  );
}
