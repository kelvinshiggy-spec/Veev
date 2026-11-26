"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Button, Card, Input, Label, Notice, PageHeader, Section, Segmented, Toggle } from "@/components/ui";
import { REMINDER_LINES } from "@/data/messages";
import { showNotice } from "@/components/reminders";
import type { Reminders } from "@/lib/types";
import { BRAND } from "@/lib/brand";

export default function RemindersPage() {
  const { vault, update } = useStore();
  const r = vault.reminders;
  const set = <K extends keyof Reminders>(k: K, v: Reminders[K]) => update((x) => ({ ...x, reminders: { ...x.reminders, [k]: v } }));
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">("default");
  useEffect(() => setPerm(typeof Notification === "undefined" ? "unsupported" : Notification.permission), []);

  const enable = async (on: boolean) => {
    if (on && typeof Notification !== "undefined" && Notification.permission !== "granted") {
      const p = await Notification.requestPermission();
      setPerm(p);
      if (p !== "granted") return;
    }
    set("enabled", on);
  };

  return (
    <div>
      <PageHeader back="/me" eyebrow="Reminders" title="Supportive, never nagging." />
      <Card>
        <Toggle checked={r.enabled} onChange={enable} label="Gentle reminders" hint="A morning and evening note in the tone you choose." />
        {perm === "denied" && <p className="pb-2 text-sm text-rose">Notifications are blocked for this site in your browser settings.</p>}
        {perm === "unsupported" && <p className="pb-2 text-sm text-ink-3">This browser doesn&apos;t support notifications. On iPhone, add VEEV to your Home Screen first.</p>}
      </Card>

      <Section title="When" className="mt-6">
        <Card className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Morning</Label>
              <Input type="time" value={r.morning} onChange={(e) => set("morning", e.target.value)} />
            </div>
            <div>
              <Label>Evening</Label>
              <Input type="time" value={r.evening} onChange={(e) => set("evening", e.target.value)} />
            </div>
          </div>
          <Toggle checked={r.friday} onChange={(v) => set("friday", v)} label="Friday evening nudge" hint="Around 5pm, a reminder to make a plan." />
        </Card>
      </Section>

      <Section title="Tone">
        <Segmented
          value={r.tone}
          onChange={(v) => set("tone", v)}
          options={[
            { value: "warm", label: "Warm" },
            { value: "direct", label: "Direct" },
            { value: "minimal", label: "Minimal" },
          ]}
        />
        <Card className="mt-3 bg-surface-2">
          <ul className="space-y-1.5 text-[15px] text-ink-2">
            {REMINDER_LINES[r.tone].slice(0, 4).map((l) => (
              <li key={l}>“{l}”</li>
            ))}
          </ul>
        </Card>
      </Section>

      <Section title="Privacy">
        <Card>
          <Toggle checked={r.privateText} onChange={(v) => set("privateText", v)} label="Discreet notifications" hint={`Shows only “${BRAND.name} · A moment for you.” on your lock screen.`} />
        </Card>
      </Section>

      <Button variant="outline" full onClick={() => showNotice(BRAND.name, r.privateText ? "A moment for you." : REMINDER_LINES[r.tone][0])} disabled={perm !== "granted"}>
        Send a test
      </Button>
      <div className="mt-4">
        <Notice>
          Reminders arrive while {BRAND.name} is open or was recently used. Fully closed-app push notifications need a push service, which this version doesn&apos;t include yet.
        </Notice>
      </div>
    </div>
  );
}
