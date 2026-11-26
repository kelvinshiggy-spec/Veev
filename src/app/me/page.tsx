"use client";

import { UserRound, Stethoscope, Users, Brain, Bell, ShieldCheck, ChevronRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, PageHeader, Section, Segmented, Toggle } from "@/components/ui";
import { BRAND } from "@/lib/brand";
import type { Settings } from "@/lib/types";

const LINKS = [
  { href: "/me/profile", icon: UserRound, title: "About me", body: "Your answers, goals, triggers and tools" },
  { href: "/me/therapy", icon: Stethoscope, title: "My actual therapy", body: "Appointments, homework, questions, prep" },
  { href: "/me/support", icon: Users, title: "My people", body: "Who to call, and for what" },
  { href: "/me/memory", icon: Brain, title: "Clarity's memory", body: "What Clarity may know about you" },
  { href: "/me/reminders", icon: Bell, title: "Reminders", body: "Gentle notes, on your terms" },
  { href: "/me/privacy", icon: ShieldCheck, title: "Privacy & data", body: "Lock, sync, export, delete" },
  { href: "/faith", icon: BookOpen, title: "Faith", body: "Daily verse and reflections" },
];

export default function Me() {
  const { vault, update } = useStore();
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => update((x) => ({ ...x, settings: { ...x.settings, [k]: v } }));
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
                { value: "system", label: "Auto" },
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ]}
            />
          </div>
          <Toggle checked={vault.settings.reducedMotion} onChange={(v) => set("reducedMotion", v)} label="Reduce motion" />
          <Toggle checked={vault.settings.haptics} onChange={(v) => set("haptics", v)} label="Haptic feedback" hint="Where your phone supports it." />
          <Toggle checked={vault.settings.faith} onChange={(v) => set("faith", v)} label="Faith content" />
        </Card>
      </Section>

      <p className="text-center text-xs leading-relaxed text-ink-3">
        {BRAND.name} · {BRAND.tagline}
        <br />A self-help companion. Not therapy or medical care.
      </p>
    </div>
  );
}
