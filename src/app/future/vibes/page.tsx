"use client";

import { useState } from "react";
import { Film, Music, Sparkles, Mic } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, Card, Chips, PageHeader, Section } from "@/components/ui";
import { useCompanionName } from "@/components/companion-name";
import { season } from "@/lib/seasons";

// A small, hand-picked starter list of well-known titles and artists. No claims about where
// anything is streaming or what's new this week: she can check her own apps.

type Mood = "Cozy" | "Hype" | "In my feels" | "Anxious" | "Celebrating" | "Can't sleep" | "Gym mode" | "Holiday";

const WATCH: Record<Mood, string[]> = {
  Cozy: ["Gilmore Girls", "The Holiday", "Emily in Paris", "Paddington 2"],
  Hype: ["Legally Blonde", "The Devil Wears Prada", "Crazy Rich Asians", "Clueless"],
  "In my feels": ["Inside Out", "Little Women (2019)", "Queer Eye", "About Time"],
  Anxious: ["The Great British Baking Show", "Planet Earth", "Ted Lasso", "Abbott Elementary"],
  Celebrating: ["Selling Sunset", "Mamma Mia!", "Pitch Perfect", "The Princess Diaries"],
  "Can't sleep": ["Our Planet", "Bob Ross: The Joy of Painting", "Chef's Table", "Before Sunrise"],
  "Gym mode": ["Creed", "Bend It Like Beckham", "Rocky", "Stutz"],
  Holiday: ["Elf", "The Holiday", "Home Alone", "Klaus"],
};

const LISTEN: Record<Mood, { name: string; why: string }[]> = {
  Cozy: [
    { name: "Tems", why: "smooth, warm Afro-R&B" },
    { name: "ODESZA", why: "dreamy, soft electronic" },
    { name: "Kygo", why: "easy tropical house" },
  ],
  Hype: [
    { name: "Burna Boy", why: "Afrobeats energy" },
    { name: "Calvin Harris", why: "feel-good dance anthems" },
    { name: "Rema", why: "bouncy Afrobeats" },
  ],
  "In my feels": [
    { name: "Ayra Starr", why: "honest and uplifting" },
    { name: "Fred again..", why: "emotional, euphoric electronic" },
    { name: "Tems", why: "soft and soulful" },
  ],
  Anxious: [
    { name: "ODESZA", why: "slow, spacious, calming" },
    { name: "Bonobo", why: "gentle downtempo" },
    { name: "Lofi beats", why: "zero lyrics, all calm" },
  ],
  Celebrating: [
    { name: "Wizkid", why: "golden-hour Afrobeats" },
    { name: "Swedish House Mafia", why: "main-stage euphoria" },
    { name: "Tyla", why: "amapiano-pop glow" },
  ],
  "Can't sleep": [
    { name: "Ambient piano", why: "nothing to follow, just rest" },
    { name: "ODESZA (slow songs)", why: "soft synth pads" },
    { name: "Rain sounds", why: "classic for a reason" },
  ],
  "Gym mode": [
    { name: "Swedish House Mafia", why: "big builds for big sets" },
    { name: "Davido", why: "high-energy Afrobeats" },
    { name: "Calvin Harris", why: "cardio-friendly bangers" },
  ],
  Holiday: [
    { name: "Afrobeats holiday playlists", why: "festive but make it fun" },
    { name: "Classic Christmas pop", why: "cozy and nostalgic" },
    { name: "Disclosure", why: "house for getting ready" },
  ],
};

export default function Vibes() {
  const { vault } = useStore();
  const cn = useCompanionName();
  const isHoliday = new Date().getMonth() === 11 || (new Date().getMonth() === 10 && new Date().getDate() >= 20);
  const [mood, setMood] = useState<Mood[]>([isHoliday ? "Holiday" : season() === "winter" ? "Cozy" : "Hype"]);
  const m = mood[0] ?? "Cozy";
  const music = vault.profile.favMusic;

  return (
    <div>
      <PageHeader back="/future" eyebrow="Watch & listen" title="What's the vibe tonight?" subtitle="Pick a mood. Get a few picks. Romanticize your evening." />
      <Chips multi={false} options={Object.keys(WATCH)} value={mood} onChange={(v) => setMood(v as Mood[])} />

      <Section title="Watch" className="mt-6">
        <div className="grid grid-cols-2 gap-2">
          {WATCH[m].map((t) => (
            <Card key={t} className="!p-4">
              <Film size={16} className="mb-2 text-gold" />
              <div className="font-serif text-lg leading-tight">{t}</div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Listen">
        <div className="space-y-2">
          {LISTEN[m].map((x) => (
            <div key={x.name} className="card flex items-center gap-3 p-4">
              <Music size={16} className="shrink-0 text-gold" />
              <div>
                <div className="font-medium">{x.name}</div>
                <div className="text-sm text-ink-3">{x.why}</div>
              </div>
            </div>
          ))}
        </div>
        {music && <p className="mt-2 text-xs text-ink-3">Leaning into what you love: {music}. Change it in About me.</p>}
      </Section>

      <Card className="glow mt-6">
        <Sparkles size={16} className="mb-2 text-gold" />
        <div className="font-serif text-xl">Want picks made just for you?</div>
        <p className="mt-1 text-sm text-ink-2">
          Tell {cn} your mood and what you&apos;ve already watched. Availability changes, so check your apps for where it&apos;s streaming.
        </p>
        <Button href="/voice?topic=vibes" size="sm" className="mt-3">
          <Mic size={14} /> Ask {cn}
        </Button>
      </Card>
    </div>
  );
}
