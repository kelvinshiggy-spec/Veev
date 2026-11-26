"use client";

import { Sparkles, Feather, UserRound, Stethoscope, Users, Brain, Bell, ShieldCheck, ChevronRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, PageHeader, Section, Segmented, Toggle } from "@/components/ui";
import { BRAND } from "@/lib/brand";
import { requestWeatherLocation } from "@/lib/weather";
import { MediaView, PhotoPicker } from "@/components/media";
import { removeMedia } from "@/lib/media";
import { useState } from "react";
import type { Settings } from "@/lib/types";

const LINKS = [
  { href: "/me/companion", icon: Sparkles, title: "My companion", body: "Personality, name, voice and vibe" },
  { href: "/future/manifesto", icon: Feather, title: "My Life Manifesto", body: "The life you're building, in your words" },
  { href: "/me/profile", icon: UserRound, title: "About me", body: "Your answers, goals, triggers and tools" },
  { href: "/me/therapy", icon: Stethoscope, title: "My actual therapy", body: "Appointments, homework, questions, prep" },
  { href: "/me/support", icon: Users, title: "My people", body: "Who to call, and for what" },
  { href: "/me/memory", icon: Brain, title: "What my companion knows", body: "You decide what the AI may use" },
  { href: "/me/reminders", icon: Bell, title: "Reminders", body: "Gentle notes, on your terms" },
  { href: "/me/privacy", icon: ShieldCheck, title: "Privacy & data", body: "Lock, sync, export, delete" },
  { href: "/faith", icon: BookOpen, title: "Faith", body: "Daily verse and reflections" },
];

export default function Me() {
  const { vault, update } = useStore();
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => update((x) => ({ ...x, settings: { ...x.settings, [k]: v } }));
  const [wxNote, setWxNote] = useState("");
  return (
    <div>
      <PageHeader eyebrow="Me" title={vault.profile.name || "You"} subtitle={vault.profile.becoming || undefined} />
      <div className="card divide-y divide-line">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="flex items-center gap-4 px-5 py-4">
            <l.icon size={19} className="text-forest" strokeWidth={1.6} />
            <div className="flex-1">
              <div className="text-[15px] font-medium">{l.title}</div>
              <div className="text-xs text-ink-3">{l.body}</div>
            </div>
            <ChevronRight size={16} className="text-ink-3" />
          </Link>
        ))}
      </div>

      <Section title="Appearance & feel" className="mt-8">
        <Card>
          <div className="mb-3">
            <Segmented<Settings["theme"]>
              value={vault.settings.theme}
              onChange={(v) => set("theme", v)}
              options={[
                { value: "auto", label: "Day & night" },
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "system", label: "Phone" },
              ]}
            />
            <p className="mt-2 text-xs text-ink-3">
              {vault.settings.theme === "auto" && "Bright and sunlit by day, deeper and calmer from 7pm."}
              {vault.settings.theme === "system" && "Follows your phone's light or dark setting."}
            </p>
          </div>
          <Toggle
            checked={vault.settings.editions.morning}
            onChange={(v) => set("editions", { ...vault.settings.editions, morning: v })}
            label="The Morning Edition"
            hint="A bright start-of-day page on Today."
          />
          <Toggle
            checked={vault.settings.editions.evening}
            onChange={(v) => set("editions", { ...vault.settings.editions, evening: v })}
            label="The Evening Edition"
            hint="A short, calm reflection in the evening."
          />
          <Toggle
            checked={!!vault.settings.weather}
            onChange={async (on) => {
              setWxNote("");
              if (!on) return set("weather", undefined);
              const loc = await requestWeatherLocation();
              if (!loc) return setWxNote("Location wasn't shared, so weather stays off.");
              set("weather", { ...loc, unit: Intl.DateTimeFormat().resolvedOptions().locale.endsWith("US") ? "f" : "c" });
            }}
            label="Local weather"
            hint="Uses your rough location (about 1 km) with the free Open-Meteo service. Nothing else is shared."
          />
          {wxNote && <p className="pb-2 text-sm text-rose">{wxNote}</p>}
          <Toggle checked={vault.settings.reducedMotion} onChange={(v) => set("reducedMotion", v)} label="Reduce motion" />
          <Toggle checked={vault.settings.haptics} onChange={(v) => set("haptics", v)} label="Haptic feedback" hint="Where your phone supports it." />
          <Toggle checked={vault.settings.faith} onChange={(v) => set("faith", v)} label="Faith content" />
        </Card>
      </Section>

      <Section title="Cover photos" className="mt-2">
        <Card>
          <p className="mb-3 text-sm text-ink-3">Your own photos for the top of Today (mountains, your home, the cats, your fave places). A different one each day. They stay on this phone.</p>
          {vault.settings.coverPhotoIds.length > 0 && (
            <div className="mb-3 grid grid-cols-3 gap-2">
              {vault.settings.coverPhotoIds.map((id) => (
                <div key={id} className="relative">
                  <MediaView id={id} type="image" className="h-20 w-full rounded-xl object-cover" />
                  <button
                    onClick={async () => {
                      await removeMedia(id);
                      set("coverPhotoIds", vault.settings.coverPhotoIds.filter((x) => x !== id));
                    }}
                    className="absolute right-1 top-1 rounded-full bg-black/50 px-2 text-xs text-white"
                    aria-label="Remove cover photo"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <PhotoPicker label="Add a cover photo" onSaved={(id) => set("coverPhotoIds", [...vault.settings.coverPhotoIds, id])} />
        </Card>
      </Section>

      <p className="text-center text-xs leading-relaxed text-ink-3">
        {BRAND.name} · {BRAND.tagline}
        <br />A self-help companion. Not therapy or medical care.
      </p>
    </div>
  );
}
