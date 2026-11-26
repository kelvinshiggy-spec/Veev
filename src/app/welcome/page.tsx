"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { Profile, Directness } from "@/lib/types";
import { Button, Input, Label, ListEditor, Segmented, TextArea, Toggle, Notice } from "@/components/ui";
import { APPEALING, COPING_TOOLS, GROUNDING, LOVES, WARNING_SIGNS, SUPPORT_ROLES } from "@/data/options";
import { BRAND } from "@/lib/brand";
import { dayKey, uid } from "@/lib/util";
import { DEFAULT_HABITS, makeHabit } from "@/lib/defaults";

type Step = { key: string; eyebrow: string; title: string; body?: string };

const STEPS: Step[] = [
  { key: "hello", eyebrow: "Welcome", title: "This is yours." },
  { key: "becoming", eyebrow: "Who you are becoming", title: "Who do you want to become?" },
  { key: "joy", eyebrow: "What lights you up", title: "What makes you genuinely happy?" },
  { key: "goals", eyebrow: "Your why", title: "What are you building?" },
  { key: "date", eyebrow: "Your journey", title: "When did this chapter start?" },
  { key: "patterns", eyebrow: "Knowing yourself", title: "What usually happens?" },
  { key: "tools", eyebrow: "Your toolkit", title: "What helps you?" },
  { key: "people", eyebrow: "Your people", title: "Who can you safely turn to?" },
  { key: "voice", eyebrow: "How we talk", title: "How should Clarity talk to you?" },
  { key: "future", eyebrow: "A note forward", title: "What would you want your future self to remember?" },
  { key: "privacy", eyebrow: "Your privacy", title: "Private by design." },
];

export default function Welcome() {
  const { vault, update } = useStore();
  const router = useRouter();
  const [i, setI] = useState(0);
  const [p, setP] = useState<Profile>(vault.profile);
  const [contact, setContact] = useState({ name: "", phone: "", role: "Family" });
  const [faith, setFaith] = useState(vault.settings.faith);
  const [ai, setAi] = useState(vault.settings.aiConsent);
  const step = STEPS[i];
  const set = <K extends keyof Profile>(k: K, val: Profile[K]) => setP((x) => ({ ...x, [k]: val }));

  const finish = () => {
    update((v) => {
      const contacts =
        contact.name && contact.phone
          ? [...v.contacts, { id: uid(), name: contact.name, phone: contact.phone, role: contact.role, supports: ["Cravings", "Just company"] }]
          : v.contacts;
      return {
        ...v,
        profile: { ...p, onboarded: true },
        streaks: v.streaks.length ? v.streaks : [{ start: p.sobrietyStart }],
        contacts,
        habits: v.habits.length ? v.habits : DEFAULT_HABITS.slice(0, 6).map(makeHabit),
        settings: { ...v.settings, faith, aiConsent: ai },
      };
    });
    router.replace("/today");
  };

  const next = () => (i < STEPS.length - 1 ? setI(i + 1) : finish());
  const back = () => setI(Math.max(0, i - 1));

  return (
    <div className="fade-in" key={step.key}>
      <div className="mb-8 flex gap-1">
        {STEPS.map((s, n) => (
          <div key={s.key} className={`h-[3px] flex-1 rounded-full ${n <= i ? "bg-gold" : "bg-line"}`} />
        ))}
      </div>
      <div className="eyebrow mb-3">{step.eyebrow}</div>
      <h1 className="font-serif text-[40px] leading-[1.05]">{step.title}</h1>

      <div className="mt-8 space-y-7">
        {step.key === "hello" && (
          <>
            <p className="text-[17px] leading-relaxed text-ink-2">
              {BRAND.name} is a private place for your mornings, your goals, your hard moments and your good ones. {BRAND.tagline}
            </p>
            <p className="text-[15px] leading-relaxed text-ink-3">
              A few questions help make it feel like yours. Skip anything you like, and change it all later.
            </p>
            <div>
              <Label>What should we call you?</Label>
              <Input value={p.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" autoFocus />
            </div>
          </>
        )}

        {step.key === "becoming" && (
          <>
            <div>
              <Label hint="In your own words. A sentence is plenty.">Who do you want to become?</Label>
              <TextArea voice value={p.becoming} onChange={(v) => set("becoming", v)} placeholder="Calm, confident, someone my family can count on…" />
            </div>
            <div>
              <Label hint="Ordinary moments count: mornings, dinners, weekends.">What does your ideal life look like?</Label>
              <TextArea voice value={p.idealLife} onChange={(v) => set("idealLife", v)} placeholder="A beautiful home, family dinners, ski trips every winter…" />
            </div>
          </>
        )}

        {step.key === "joy" && (
          <>
            <div>
              <Label hint="Pick any, add your own.">What do you love?</Label>
              <ListEditor value={p.hobbies} onChange={(v) => set("hobbies", v)} suggestions={LOVES} />
            </div>
            <div>
              <Label>What makes you genuinely happy?</Label>
              <TextArea voice value={p.happiness} onChange={(v) => set("happiness", v)} rows={3} />
            </div>
          </>
        )}

        {step.key === "goals" && (
          <>
            <div>
              <Label hint="Big or small.">Your biggest personal goals</Label>
              <ListEditor
                value={p.goals}
                onChange={(v) => set("goals", v)}
                suggestions={["Stay sober this year", "Get strong at the gym", "Save for a ski trip", "Buy my dream home", "Build my own family"]}
                placeholder="Add a goal"
              />
            </div>
            <div>
              <Label hint="This is the one we'll come back to on hard nights.">Why do you want to stay sober?</Label>
              <TextArea voice value={p.whySober} onChange={(v) => set("whySober", v)} />
            </div>
          </>
        )}

        {step.key === "date" && (
          <>
            <div>
              <Label hint="Your first sober day in this stretch. Today is fine.">Sober since</Label>
              <Input type="date" max={dayKey()} value={p.sobrietyStart} onChange={(e) => set("sobrietyStart", e.target.value)} />
            </div>
            <div>
              <Label hint="An honest guess. Used only to estimate what you're saving.">On a typical drinking day, roughly how much did you spend?</Label>
              <Input type="number" inputMode="decimal" min={0} value={p.dailyDrinkSpend} onChange={(e) => set("dailyDrinkSpend", Number(e.target.value) || 0)} />
            </div>
          </>
        )}

        {step.key === "patterns" && (
          <>
            <div>
              <Label hint="Your own experience, in your words. We'll gently remind you of it when 'just one' sounds tempting.">What usually happens after your first drink?</Label>
              <TextArea voice value={p.afterFirstDrink} onChange={(v) => set("afterFirstDrink", v)} />
            </div>
            <div>
              <Label>When does drinking sound appealing?</Label>
              <ListEditor value={p.appealingSituations} onChange={(v) => set("appealingSituations", v)} suggestions={APPEALING} />
            </div>
            <div>
              <Label>Your early warning signs</Label>
              <ListEditor value={p.warningSigns} onChange={(v) => set("warningSigns", v)} suggestions={WARNING_SIGNS} />
            </div>
          </>
        )}

        {step.key === "tools" && (
          <>
            <div>
              <Label hint="Skills from therapy you already know.">Your coping tools</Label>
              <ListEditor value={p.copingTools} onChange={(v) => set("copingTools", v)} suggestions={COPING_TOOLS} />
            </div>
            <div>
              <Label>What helps you feel grounded?</Label>
              <ListEditor value={p.grounding} onChange={(v) => set("grounding", v)} suggestions={GROUNDING} />
            </div>
          </>
        )}

        {step.key === "people" && (
          <>
            <p className="text-[15px] leading-relaxed text-ink-2">
              Add one person now if you'd like. They'll appear for one-tap calling. Nobody is ever contacted automatically.
            </p>
            <div className="space-y-3">
              <Input placeholder="Name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
              <Input placeholder="Phone" type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
              <select
                value={contact.role}
                onChange={(e) => setContact({ ...contact, role: e.target.value })}
                className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-ink"
              >
                {SUPPORT_ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <Label hint="Anyone else, in a few words.">Others you can turn to</Label>
              <Input value={p.safePeople} onChange={(e) => set("safePeople", e.target.value)} placeholder="Mom, my therapist, my sister…" />
            </div>
          </>
        )}

        {step.key === "voice" && (
          <>
            <div>
              <Label hint="You can change this any time, even mid-conversation.">How direct should Clarity be?</Label>
              <Segmented<Directness>
                value={p.directness}
                onChange={(v) => set("directness", v)}
                options={[
                  { value: "gentle", label: "Gentle" },
                  { value: "firm", label: "Firm & warm" },
                  { value: "straight", label: "Straight talk" },
                ]}
              />
              <p className="mt-3 text-sm leading-relaxed text-ink-3">
                {p.directness === "gentle" && "Soft and patient. Still honest, just slower to challenge."}
                {p.directness === "firm" && "Warm, but won't just agree with you. Calls out 'just one drink' thinking."}
                {p.directness === "straight" && "Tough love. Names rationalizations plainly, holds you to your word. Never cruel, and always gentler in a crisis."}
              </p>
            </div>
            <div>
              <Label hint="Anything else about how you like to be spoken to.">Communication style</Label>
              <TextArea value={p.communicationStyle} onChange={(v) => set("communicationStyle", v)} rows={2} placeholder="Short messages when I'm upset. Don't lecture me. Remind me of my goals." />
            </div>
            <Toggle
              checked={faith}
              onChange={setFaith}
              label="Include faith"
              hint="A daily Bible verse and short reflections on strength, peace and grace."
            />
          </>
        )}

        {step.key === "future" && (
          <div>
            <Label hint="We'll show this to you on the days you need it.">A note to your future self</Label>
            <TextArea voice rows={6} value={p.futureSelfNote} onChange={(v) => set("futureSelfNote", v)} placeholder="Remember how clear your mornings feel…" />
          </div>
        )}

        {step.key === "privacy" && (
          <>
            <ul className="space-y-3 text-[15px] leading-relaxed text-ink-2">
              <li>Everything you write stays on this device unless you choose to sync it.</li>
              <li>Synced data is encrypted with your passcode before it leaves your phone. Nobody else, including whoever set up the app, can read it.</li>
              <li>Nobody gets notified, sent anything, or shown anything without you choosing to.</li>
              <li>There are no analytics or tracking in this app.</li>
            </ul>
            <Toggle
              checked={ai}
              onChange={setAi}
              label="Let Clarity use AI"
              hint="When you talk to Clarity, your message and the parts of your profile you allow are sent securely to Anthropic's AI to write a reply. Not used for advertising. You can turn this off any time."
            />
            <Notice>
              {BRAND.name} is a self-help companion, not therapy or medical care. The Help button is always at the top of the screen.
            </Notice>
          </>
        )}
      </div>

      <div className="mt-10 flex items-center gap-3">
        {i > 0 && (
          <Button variant="ghost" onClick={back}>
            Back
          </Button>
        )}
        <div className="flex-1" />
        {step.key !== "hello" && step.key !== "privacy" && (
          <Button variant="ghost" onClick={next}>
            Skip
          </Button>
        )}
        <Button onClick={next} size="lg">
          {i === STEPS.length - 1 ? "Begin" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
