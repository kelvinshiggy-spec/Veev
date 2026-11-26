"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { useStore } from "@/lib/store";
import { useSafety } from "@/components/safety";
import { Button, Card, Chips, Label, PageHeader, Section, Segmented, TextArea, Input, Notice } from "@/components/ui";
import { CRISIS } from "@/lib/safety";
import { recordLapse, sobrietyStats } from "@/lib/sobriety";
import { addDays, dayKey, daysBetween, uid } from "@/lib/util";
import { verseFor } from "@/data/verses";

const RED_FLAGS = [
  "Seizure or shaking I can't control",
  "Trouble breathing",
  "Chest pain or racing heart",
  "Seeing or hearing things",
  "Very confused",
  "Hard to stay awake",
  "Vomiting a lot, or blood",
  "I'm injured",
  "I don't feel safe right now",
];

export default function FindYourWayBack() {
  const { vault, update } = useStore();
  const safety = useSafety();
  const [tab, setTab] = useState<"now" | "later">("now");
  const [flags, setFlags] = useState<string[]>([]);
  const s = sobrietyStats(vault);
  const contacts = vault.contacts.filter((c) => c.phone);

  return (
    <div>
      <PageHeader eyebrow="Find your way back" title="Your previous progress still matters." subtitle="Right now, your safety matters most." />
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: "now", label: "Right now" },
          { value: "later", label: "When I'm sober" },
        ]}
      />

      {tab === "now" ? (
        <div className="mt-6 space-y-6">
          <Section title="Is any of this happening?">
            <Chips options={RED_FLAGS} value={flags} onChange={setFlags} />
            {flags.length > 0 && (
              <div className="mt-4">
                <Notice tone="rose">
                  {flags.includes("I don't feel safe right now")
                    ? "Please reach someone now. 988 is open 24/7, by call or text. If you might act on it, call 911."
                    : "This needs medical help. Please call 911 now, or ask someone with you to call."}
                </Notice>
                <Button
                  full
                  size="lg"
                  className="mt-3"
                  variant="danger"
                  onClick={() => safety.open(flags.includes("I don't feel safe right now") && flags.length === 1 ? "suicide" : "medical")}
                >
                  Get help now
                </Button>
              </div>
            )}
          </Section>

          <Card>
            <ul className="space-y-3 text-[17px] leading-relaxed">
              <li><strong className="font-medium">Please don&apos;t drive.</strong> Not even a short way.</li>
              <li>Get somewhere safe and stay there.</li>
              <li>Water, and something to eat if you can.</li>
              <li>No big conversations, arguments or messages tonight. They can wait.</li>
              <li>If you can, let someone sober know where you are.</li>
            </ul>
          </Card>

          {contacts.length > 0 && (
            <Section title="Someone sober">
              <div className="space-y-2">
                {contacts.slice(0, 3).map((c) => (
                  <a key={c.id} href={`tel:${c.phone}`} className="card flex items-center justify-between p-4">
                    <span>
                      <span className="block font-medium">{c.name}</span>
                      <span className="text-sm text-ink-3">{c.role}</span>
                    </span>
                    <Phone size={18} className="text-forest" />
                  </a>
                ))}
              </div>
            </Section>
          )}

          <Notice>
            If you&apos;ve been drinking heavily or every day, stopping suddenly can cause withdrawal, which can be dangerous. It isn&apos;t a willpower test. Please talk to a doctor, or call SAMHSA at{" "}
            <a href={CRISIS.samhsa.tel} className="font-medium underline">
              {CRISIS.samhsa.number}
            </a>{" "}
            for help finding care. Don&apos;t try to detox alone.
          </Notice>

          <p className="text-center text-[15px] text-ink-2">
            Tomorrow, when you&apos;re sober, come back. We&apos;ll look at this together, kindly.
          </p>
        </div>
      ) : (
        <Later
          current={s.current}
          total={s.total}
          onSave={(lapse, restart, fields) => {
            update((v) => {
              const next = recordLapse(v, lapse, restart);
              return {
                ...next,
                journal: [...next.journal, { id: uid(), kind: "reflection", createdAt: new Date().toISOString(), title: "Finding my way back", fields }],
              };
            });
          }}
        />
      )}
    </div>
  );
}

function Later({
  current,
  total,
  onSave,
}: {
  current: number;
  total: number;
  onSave: (lapse: string, restart: string, fields: Record<string, string>) => void;
}) {
  const { vault } = useStore();
  const today = dayKey();
  const [lapse, setLapse] = useState(addDays(today, -1));
  const [restart, setRestart] = useState(today);
  const [f, setF] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const set = (k: string, v: string) => setF((x) => ({ ...x, [k]: v }));
  const verse = verseFor(daysBetween("2024-01-01", today), "lapse");

  if (saved)
    return (
      <div className="mt-6 space-y-5">
        <Card className="border-forest/30 bg-forest-soft">
          <div className="font-serif text-3xl">Welcome back.</div>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
            Your {total} sober days are still yours. Nothing erased them. Today you start the next stretch.
          </p>
        </Card>
        {vault.settings.faith && (
          <Card className="bg-surface-2">
            <p className="font-serif text-lg leading-snug">“{verse.text}”</p>
            <div className="mt-2 text-sm text-gold">{verse.ref}</div>
          </Card>
        )}
        <div className="grid gap-2">
          <Button href="/me/therapy">Add this to talk about in therapy</Button>
          <Button href="/me/support" variant="outline">
            Reach out to my support
          </Button>
          <Button href="/today" variant="ghost">
            Back to today
          </Button>
        </div>
      </div>
    );

  return (
    <div className="mt-6 space-y-6">
      <p className="text-[15px] leading-relaxed text-ink-2">
        This is for when you&apos;re sober and safe. A lapse is information, not a verdict on who you are. You&apos;ve had {current > 0 ? `${current} days in this stretch and ` : ""}
        {total} sober days in total, and those all still count.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Day I drank</Label>
          <Input type="date" max={today} value={lapse} onChange={(e) => setLapse(e.target.value)} />
        </div>
        <div>
          <Label>Fresh start</Label>
          <Input type="date" min={lapse} value={restart} onChange={(e) => setRestart(e.target.value)} />
        </div>
      </div>
      {[
        ["happened", "What happened, briefly?"],
        ["before", "What was going on before? (sleep, stress, conflict, celebration…)"],
        ["thought", "What thought gave you permission?"],
        ["learned", "What do you want to remember next time?"],
        ["next", "What's one step today to reconnect with your plan?"],
      ].map(([k, q]) => (
        <div key={k}>
          <Label>{q}</Label>
          <TextArea voice rows={2} value={f[k] ?? ""} onChange={(v) => set(k, v)} />
        </div>
      ))}
      <Notice tone="forest">
        Consider letting your therapist or treatment provider know. They can help adjust your plan. You choose what to share.
      </Notice>
      <Button
        full
        size="lg"
        onClick={() => {
          onSave(lapse, restart, f);
          setSaved(true);
        }}
      >
        Start again, with everything I&apos;ve learned
      </Button>
    </div>
  );
}
