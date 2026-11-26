"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { observations } from "@/lib/insights";
import { Card, Notice, PageHeader, Toggle, Empty } from "@/components/ui";

export default function Patterns() {
  const { vault, update } = useStore();
  const on = vault.settings.patternsConsent;
  const obs = on ? observations(vault) : [];

  return (
    <div>
      <PageHeader back="/journey" eyebrow="Patterns" title="Noticing, not predicting." subtitle="Gentle observations from what you've chosen to record. They can't predict anything, and you're the expert on your life." />
      <Card>
        <Toggle
          checked={on}
          onChange={(v) => update((x) => ({ ...x, settings: { ...x.settings, patternsConsent: v } }))}
          label="Look for patterns in my entries"
          hint="Runs on this device only. Uses your check-ins, cravings and habits. Nothing is sent anywhere."
        />
      </Card>

      {on && (
        <div className="mt-6 space-y-3">
          {obs.length === 0 ? (
            <Empty title="Nothing to point out yet" body="Patterns appear after a couple of weeks of check-ins. Keep it light; there's no requirement." />
          ) : (
            obs.map((o) => (
              <Card key={o.text}>
                <p className="font-serif text-xl leading-snug">{o.text}</p>
                <p className="mt-3 text-xs text-ink-3">
                  <span className="font-medium">What this is based on:</span> {o.why}
                </p>
                {o.action && (
                  <Link href={o.action.href} className="mt-3 inline-block text-sm font-medium text-forest underline-offset-2 hover:underline">
                    {o.action.label} →
                  </Link>
                )}
              </Card>
            ))
          )}
          <Notice>These are observations of your own entries, not interpretations of you. Your therapist is a great person to explore them with.</Notice>
        </div>
      )}
    </div>
  );
}
