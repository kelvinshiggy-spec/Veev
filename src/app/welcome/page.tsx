"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Sparkles, Check, Volume2, Feather, Mic } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Profile, Directness, PersonaId } from "@/lib/types";
import { Button, Input, Label, ListEditor, Segmented, TextArea, Toggle, Notice, Chips } from "@/components/ui";
import { APPEALING, COPING_TOOLS, GROUNDING, LOVES, WARNING_SIGNS, SUPPORT_ROLES, QUALITIES, VALUES } from "@/data/options";
import { PERSONAS, persona } from "@/data/personas";
import { BRAND } from "@/lib/brand";
import { dayKey, uid, cx } from "@/lib/util";
import { DEFAULT_HABITS, makeHabit } from "@/lib/defaults";
import { draftManifesto } from "@/lib/manifesto";
import { loadVoices, rankVoices, speak, stopSpeaking, speechSupported } from "@/lib/voice";

type Step = { key: string; eyebrow: string; title: string; quick?: boolean };

const STEPS: Step[] = [
  { key: "hello", eyebrow: "Welcome", title: "Okay, this is yours.", quick: true },
  { key: "becoming", eyebrow: "Main character era", title: "Who are you becoming?" },
  { key: "life", eyebrow: "The dream", title: "Describe your ideal life." },
  { key: "joy", eyebrow: "What lights you up", title: "What makes you genuinely happy?" },
  { key: "dreams", eyebrow: "Big plans", title: "Family, money, body." },
  { key: "world", eyebrow: "Your world", title: "Tell us about your people." },
  { key: "date", eyebrow: "Your journey", title: "When did this chapter start?", quick: true },
  { key: "why", eyebrow: "Your why", title: "Why does sober life matter to you?", quick: true },
  { key: "patterns", eyebrow: "Knowing yourself", title: "What usually happens?" },
  { key: "tools", eyebrow: "Your toolkit", title: "What helps you?" },
  { key: "people", eyebrow: "Your safe people", title: "Who can you call?", quick: true },
  { key: "companion", eyebrow: "Your companion", title: "Pick your bestie.", quick: true },
  { key: "voice", eyebrow: "How we talk", title: "How real should we keep it?" },
  { key: "privacy", eyebrow: "Your privacy", title: "Private by design.", quick: true },
];

const STEP_KEY = "veev.onboardStep";

export default function Welcome() {
  const { vault, update } = useStore();
  const router = useRouter();
  const [editName, setEditName] = useState(false);
  const [mode, setMode] = useState<"quick" | "full">(vault.profile.onboarded ? "full" : "quick");
  const steps = STEPS.filter((s) => mode === "full" || s.quick);
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [contact, setContact] = useState({ name: "", phone: "", role: "Family" });
  const step = steps[Math.min(i, steps.length - 1)];
  const p = vault.profile;

  // Resume where she left off.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STEP_KEY) || "null") as { mode: "quick" | "full"; key: string } | null;
      if (saved && !vault.profile.onboarded) {
        setMode(saved.mode);
        const idx = STEPS.filter((s) => saved.mode === "full" || s.quick).findIndex((s) => s.key === saved.key);
        if (idx > 0) setI(idx);
      }
      if (new URLSearchParams(location.search).get("more") === "1") {
        setMode("full");
        setI(1);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STEP_KEY, JSON.stringify({ mode, key: step.key }));
    } catch {}
  }, [mode, step.key]);

  // Every answer saves as she types. Nothing to lose if she closes the app.
  const set = <K extends keyof Profile>(k: K, val: Profile[K]) => update((v) => ({ ...v, profile: { ...v.profile, [k]: val } }));

  const finish = () => {
    update((v) => {
      const contacts =
        contact.name && contact.phone
          ? [...v.contacts, { id: uid(), name: contact.name, phone: contact.phone, role: contact.role, supports: ["Cravings", "Just company"] }]
          : v.contacts;
      const full = mode === "full";
      return {
        ...v,
        profile: { ...v.profile, onboarded: true, personalized: v.profile.personalized || full },
        streaks: v.streaks.length ? v.streaks : [{ start: v.profile.sobrietyStart }],
        contacts,
        habits: v.habits.length ? v.habits : DEFAULT_HABITS.slice(0, 6).map(makeHabit),
        manifesto: v.manifesto.text ? v.manifesto : { ...v.manifesto, text: draftManifesto(v.profile), approved: false, updatedAt: new Date().toISOString() },
      };
    });
    try {
      localStorage.removeItem(STEP_KEY);
    } catch {}
    setDone(true);
  };

  const next = () => (i < steps.length - 1 ? setI(i + 1) : finish());
  const back = () => setI(Math.max(0, i - 1));

  if (done) return <Welcomed onGo={(href) => router.replace(href)} />;

  return (
    <div className="fade-in" key={step.key}>
      <div className="mb-8 flex items-center gap-3">
        <div className="flex flex-1 gap-1">
          {steps.map((s, n) => (
            <div key={s.key} className={`h-[3px] flex-1 rounded-full ${n <= i ? "bg-champagne" : "bg-line"}`} />
          ))}
        </div>
        <span className="text-xs text-ink-3">
          {i + 1}/{steps.length}
        </span>
      </div>
      <div className="eyebrow mb-3">{step.eyebrow}</div>
      <h1 className="font-serif text-[40px] leading-[1.05]">{step.key === "hello" ? `Hey ${p.name || "Veev"}, okay, this is yours.` : step.title}</h1>

      <div className="mt-8 space-y-7">
        {step.key === "hello" && (
          <>
            <p className="text-[17px] leading-relaxed text-ink-2">
              {BRAND.name} is your private little world for mornings, goals, hard moments and really good ones. {BRAND.tagline}
            </p>
            {editName ? (
              <div>
                <Label>Your name</Label>
                <Input value={p.name} onChange={(e) => set("name", e.target.value)} placeholder="Veev" autoFocus />
              </div>
            ) : (
              <button onClick={() => setEditName(true)} className="text-sm text-ink-3 underline-offset-2 hover:underline">
                Not {p.name || "Veev"}? Change name
              </button>
            )}
            {!vault.profile.onboarded && (
              <div>
                <Label hint="Answers save as you go. You can always finish later.">How do you want to start?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { m: "quick" as const, icon: Zap, title: "Quick start", body: "2 minutes. The essentials." },
                    { m: "full" as const, icon: Sparkles, title: "Make it mine", body: "8 minutes. The full glow-up." },
                  ].map((o) => (
                    <button
                      key={o.m}
                      onClick={() => setMode(o.m)}
                      className={cx("card p-4 text-left", mode === o.m && "!border-forest ring-1 ring-forest")}
                    >
                      <o.icon size={18} className="text-gold" />
                      <div className="mt-2 font-medium">{o.title}</div>
                      <div className="text-xs text-ink-3">{o.body}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {step.key === "becoming" && (
          <>
            <div>
              <Label hint="Pick a few. These shape your reminders and how your companion talks to you. Never a score.">Qualities you&apos;re growing into</Label>
              <Chips options={QUALITIES} value={p.qualities} onChange={(v) => set("qualities", v)} />
            </div>
            <div>
              <Label hint="In your own words. A sentence is plenty.">Who do you want to become?</Label>
              <TextArea voice value={p.becoming} onChange={(v) => set("becoming", v)} placeholder="Calm, confident, someone my family can count on…" rows={3} />
            </div>
          </>
        )}

        {step.key === "life" && (
          <>
            <div>
              <Label hint="Ordinary days count: mornings, dinners, weekends.">Your ideal life</Label>
              <TextArea voice value={p.idealLife} onChange={(v) => set("idealLife", v)} placeholder="Peaceful mornings, family dinners, ski trips every winter, a beautiful home…" />
            </div>
            <div>
              <Label>Values you live by</Label>
              <Chips options={VALUES} value={p.values} onChange={(v) => set("values", v)} />
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
              <TextArea voice value={p.happiness} onChange={(v) => set("happiness", v)} rows={2} />
            </div>
            <div>
              <Label hint="Clear mornings? Gym PRs? Remembering every conversation?">What do you love about sober life?</Label>
              <TextArea voice value={p.soberJoys} onChange={(v) => set("soberJoys", v)} rows={2} />
            </div>
          </>
        )}

        {step.key === "dreams" && (
          <>
            <div>
              <Label>Family dreams</Label>
              <TextArea voice value={p.familyHopes} onChange={(v) => set("familyHopes", v)} rows={2} placeholder="A loving home, kids one day, Sunday dinners…" />
            </div>
            <div>
              <Label>Money and freedom</Label>
              <TextArea voice value={p.moneyHopes} onChange={(v) => set("moneyHopes", v)} rows={2} placeholder="An emergency fund, my dream car, my own business…" />
            </div>
            <div>
              <Label>Fitness and wellness</Label>
              <TextArea voice value={p.fitnessGoals} onChange={(v) => set("fitnessGoals", v)} rows={2} placeholder="Gym 4x a week, feel strong, sleep 8 hours…" />
            </div>
            <div>
              <Label hint="Big or small.">Goals on your list</Label>
              <ListEditor
                value={p.goals}
                onChange={(v) => set("goals", v)}
                suggestions={["Stay sober this year", "Get strong at the gym", "Save for a ski trip", "Buy my dream home", "Build my own family", "Start my own brand"]}
                placeholder="Add a goal"
              />
            </div>
          </>
        )}

        {step.key === "world" && (
          <>
            <div>
              <Label hint="Pets, people, little things your companion can ask about.">My world</Label>
              <ListEditor value={p.myWorld} onChange={(v) => set("myWorld", v)} suggestions={[]} placeholder="e.g. My sister Maya, Sunday pilates" />
            </div>
            <div>
              <Label hint="Who they are to you, what they're like. Helps your companion give balanced perspective on family stuff.">My parents and family</Label>
              <TextArea voice value={p.family} onChange={(v) => set("family", v)} rows={3} />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Music you love</Label>
                <Input value={p.favMusic} onChange={(e) => set("favMusic", e.target.value)} placeholder="EDM, Afrobeats…" />
              </div>
              <div>
                <Label>Movies and shows you love</Label>
                <Input value={p.favMovies} onChange={(e) => set("favMovies", e.target.value)} placeholder="Rom-coms, reality TV, thrillers…" />
              </div>
            </div>
          </>
        )}

        {step.key === "date" && (
          <>
            <div>
              <Label hint="Your first sober day in this stretch. Today totally counts.">Sober since</Label>
              <Input type="date" max={dayKey()} value={p.sobrietyStart} onChange={(e) => set("sobrietyStart", e.target.value)} />
            </div>
            <div>
              <Label hint="An honest guess. Only used to show what you're saving.">On a typical drinking day, roughly how much did you spend?</Label>
              <Input type="number" inputMode="decimal" min={0} value={p.dailyDrinkSpend} onChange={(e) => set("dailyDrinkSpend", Number(e.target.value) || 0)} />
            </div>
          </>
        )}

        {step.key === "why" && (
          <div>
            <Label hint="This is the one we come back to on hard nights.">Why do you want to stay sober?</Label>
            <TextArea voice value={p.whySober} onChange={(v) => set("whySober", v)} rows={5} placeholder="Because I love who I am when I'm clear…" />
          </div>
        )}

        {step.key === "patterns" && (
          <>
            <div>
              <Label hint="Your own experience, in your words. We'll remind you of it when 'just one' sounds cute.">What usually happens after the first drink?</Label>
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
            <p className="text-[15px] leading-relaxed text-ink-2">Add one person for one-tap calling. Nobody is ever contacted automatically.</p>
            <div className="space-y-3">
              <Input placeholder="Name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
              <Input placeholder="Phone" type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
              <select value={contact.role} onChange={(e) => setContact({ ...contact, role: e.target.value })} className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-ink">
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

        {step.key === "companion" && <PickCompanion />}

        {step.key === "voice" && (
          <>
            <div>
              <Label hint="Change it any time, even mid-conversation.">How direct should your companion be?</Label>
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
                {p.directness === "straight" && "Tough love. Names excuses plainly and holds you to your word. Never cruel, always gentler in a crisis."}
              </p>
            </div>
            <div>
              <Label hint="Anything about how you like to be spoken to.">Communication style</Label>
              <TextArea value={p.communicationStyle} onChange={(v) => set("communicationStyle", v)} rows={2} placeholder="Short messages when I'm upset. Don't lecture me. Make me laugh." />
            </div>
            <Toggle
              checked={vault.settings.faith}
              onChange={(v) => update((x) => ({ ...x, settings: { ...x.settings, faith: v } }))}
              label="Include faith"
              hint="A daily Bible verse and short reflections on strength, peace and grace."
            />
          </>
        )}

        {step.key === "privacy" && (
          <>
            <ul className="space-y-3 text-[15px] leading-relaxed text-ink-2">
              <li>Everything you write stays on this phone unless you choose to back it up.</li>
              <li>Backups are encrypted with your passcode first. Nobody else, including whoever set up the app, can read them.</li>
              <li>Nobody gets notified, sent anything, or shown anything unless you choose to.</li>
              <li>No ads, no analytics, no tracking.</li>
            </ul>
            <Toggle
              checked={vault.settings.aiConsent}
              onChange={(v) => update((x) => ({ ...x, settings: { ...x.settings, aiConsent: v } }))}
              label={`Let ${vault.companion.name || "your companion"} use AI`}
              hint="When you talk to your companion, your message and the profile details you allow are sent securely to Anthropic's AI to write a reply. Not used for ads. Turn it off any time."
            />
            <Notice>{BRAND.name} is a self-help companion, not therapy or medical care. The Help button is always at the top of the screen.</Notice>
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
          {i === steps.length - 1 ? "Let's go" : "Continue"}
        </Button>
      </div>
      {mode === "full" && i > 1 && i < steps.length - 1 && (
        <button onClick={() => setI(steps.length - 1)} className="mt-6 w-full text-center text-sm text-ink-3 underline">
          Finish the rest later
        </button>
      )}
    </div>
  );
}

function PickCompanion() {
  const { vault, update } = useStore();
  const c = vault.companion;
  const [playing, setPlaying] = useState<string | null>(null);
  useEffect(() => () => stopSpeaking(), []);
  const preview = async (id: string) => {
    if (playing === id) {
      stopSpeaking();
      setPlaying(null);
      return;
    }
    const x = persona(id);
    const v = rankVoices(await loadVoices(), x)[0];
    setPlaying(id);
    speak(x.sample, { voice: v, rate: x.rate, pitch: x.pitch, onEnd: () => setPlaying(null) });
  };
  return (
    <div className="space-y-2">
      <p className="text-[15px] text-ink-2">An AI companion to talk, plan, laugh and stay on track with. You can switch any time.</p>
      {PERSONAS.map((x) => {
        const on = c.persona === x.id;
        return (
          <div key={x.id} className={cx("card flex items-center gap-3 p-4", on && "!border-forest ring-1 ring-forest")}>
            <button className="flex-1 text-left" onClick={() => update((v) => ({ ...v, companion: { ...v.companion, persona: x.id as PersonaId, name: x.name, voiceURI: "" } }))}>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl">{x.name}</span>
                {x.id === "vylie" && <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">Recommended</span>}
              </div>
              <div className="text-sm text-ink-3">{x.tagline}</div>
            </button>
            {speechSupported() && (
              <button onClick={() => preview(x.id)} aria-label={`Preview ${x.name}`} className="grid h-9 w-9 place-items-center rounded-full bg-surface-2">
                <Volume2 size={15} />
              </button>
            )}
            {on && <Check size={18} className="text-forest" />}
          </div>
        );
      })}
    </div>
  );
}

function Welcomed({ onGo }: { onGo: (href: string) => void }) {
  const { vault } = useStore();
  const name = vault.profile.name || "Veev";
  const cn = vault.companion.name || "Vylie";
  return (
    <div className="page-in -mx-5 -mt-6 min-h-[80dvh] px-6 pt-12 sunlit">
      <div className="eyebrow">{BRAND.name} · Issue No. 1</div>
      <h1 className="mt-4 font-serif text-[52px] leading-[0.98]">Welcome to your era, {name}.</h1>
      <div className="champagne-rule my-6 w-24" />
      <p className="text-[17px] leading-relaxed text-ink-2">
        You&apos;re not giving up a good life to stay sober. You&apos;re staying sober to live the good life you&apos;re building. Everything here is yours, and it&apos;s all set up.
      </p>
      {vault.profile.qualities.length > 0 && (
        <p className="mt-4 font-serif text-xl italic text-forest">Becoming: {vault.profile.qualities.slice(0, 4).join(" · ")}</p>
      )}
      <div className="mt-8 space-y-2">
        <Button full size="lg" onClick={() => onGo("/future/manifesto")}>
          <Feather size={16} /> Read my Life Manifesto draft
        </Button>
        <Button full variant="soft" onClick={() => onGo("/voice")}>
          <Mic size={16} /> Say hi to {cn}
        </Button>
        <Button full variant="ghost" onClick={() => onGo("/today")}>
          Take me to Today
        </Button>
      </div>
    </div>
  );
}
