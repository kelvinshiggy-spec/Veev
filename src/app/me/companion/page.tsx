"use client";

import { useEffect, useState } from "react";
import { Check, Volume2, Sparkles, Mic } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, Card, Input, Label, Notice, PageHeader, Section, Segmented, Toggle } from "@/components/ui";
import { PERSONAS, persona, ACCENTS } from "@/data/personas";
import { isApple, isEnhanced, loadVoices, rankVoices, speak, stopSpeaking, speechSupported } from "@/lib/voice";
import type { Companion, Directness } from "@/lib/types";
import { cx, dayKey } from "@/lib/util";

export default function CompanionPage() {
  const { vault, update } = useStore();
  const c = vault.companion;
  const p = persona(c.persona);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [accent, setAccent] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);
  const [apple, setApple] = useState(false);
  const set = <K extends keyof Companion>(k: K, v: Companion[K]) => update((x) => ({ ...x, companion: { ...x.companion, [k]: v } }));

  useEffect(() => {
    loadVoices().then(setVoices);
    setApple(isApple());
    return () => stopSpeaking();
  }, []);

  const ranked = rankVoices(voices, p, accent).slice(0, 8);
  const bestFor = (id: string) => rankVoices(voices, persona(id), "")[0];
  const hasEnhanced = voices.some((v) => v.lang.startsWith("en") && isEnhanced(v));

  const preview = (key: string, text: string, voice?: SpeechSynthesisVoice, rate = 1, pitch = 1) => {
    if (playing === key) {
      stopSpeaking();
      setPlaying(null);
      return;
    }
    setPlaying(key);
    speak(text, { voice, rate, pitch, onEnd: () => setPlaying((k) => (k === key ? null : k)) });
  };

  const choose = (id: string) => {
    const np = persona(id);
    const keepName = c.name && c.name !== p.name;
    update((x) => ({ ...x, companion: { ...x.companion, persona: np.id, name: keepName ? x.companion.name : np.name, voiceURI: "" } }));
  };

  const usage = vault.usage.month === dayKey().slice(0, 7) ? vault.usage : { aiCalls: 0, voiceMinutes: 0 };

  return (
    <div>
      <PageHeader back="/me" eyebrow="Your companion" title="Pick your person. (Well, AI.)" subtitle="Choose a personality and voice. Switch any time; safety rules always stay on." />

      <div className="grid grid-cols-2 gap-3">
        {PERSONAS.map((x) => {
          const on = x.id === c.persona;
          const v = bestFor(x.id);
          return (
            <div
              key={x.id}
              role="button"
              tabIndex={0}
              onClick={() => choose(x.id)}
              onKeyDown={(e) => e.key === "Enter" && choose(x.id)}
              className={cx("card relative cursor-pointer p-4 text-left transition", on ? "!border-forest ring-1 ring-forest" : "")}
            >
              {on && (
                <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-forest text-on-forest">
                  <Check size={13} />
                </span>
              )}
              <div className="font-serif text-2xl">{x.name}</div>
              <div className="text-xs font-medium text-gold">{x.tagline}</div>
              <p className="mt-2 text-[13px] leading-snug text-ink-2">{x.description}</p>
              {speechSupported() && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    preview(x.id, x.sample, v, x.rate, x.pitch);
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-xs"
                >
                  <Volume2 size={13} /> {playing === x.id ? "Stop" : "Preview"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <Section title="Name" className="mt-8">
        <Input value={c.name} onChange={(e) => set("name", e.target.value)} placeholder={p.name} aria-label="Companion name" />
        <p className="mt-2 text-xs text-ink-3">Rename them whatever you like. They&apos;ll always tell you they&apos;re an AI.</p>
      </Section>

      <Section title="Voice">
        {!speechSupported() ? (
          <Notice>This browser can&apos;t speak out loud. Text chat still works.</Notice>
        ) : (
          <Card className="space-y-4">
            <div>
              <Label>Accent</Label>
              <select value={accent} onChange={(e) => setAccent(e.target.value)} className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-ink">
                {ACCENTS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => set("voiceURI", "")}
                className={cx("flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm", !c.voiceURI ? "border-forest" : "border-line")}
              >
                <span>
                  <span className="font-medium">Best available</span>
                  <span className="block text-xs text-ink-3">Picks the most natural voice on this phone</span>
                </span>
                {!c.voiceURI && <Check size={16} className="text-forest" />}
              </button>
              {ranked.map((v) => (
                <div key={v.voiceURI} className={cx("flex items-center gap-2 rounded-2xl border px-4 py-2.5", c.voiceURI === v.voiceURI ? "border-forest" : "border-line")}>
                  <button onClick={() => set("voiceURI", v.voiceURI)} className="flex-1 text-left text-sm">
                    <span className="font-medium">{v.name.replace(/\s*\(.*?\)\s*/g, " ").trim()}</span>
                    {isEnhanced(v) && <span className="ml-2 rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">Natural</span>}
                    <span className="block text-xs text-ink-3">{v.lang}</span>
                  </button>
                  <button onClick={() => preview(v.voiceURI, p.sample, v, p.rate * c.rate, p.pitch)} aria-label={`Preview ${v.name}`} className="grid h-9 w-9 place-items-center rounded-full bg-surface-2">
                    <Volume2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Speaking speed</span>
                <span className="text-ink-3">{c.rate.toFixed(2)}×</span>
              </div>
              <input type="range" min={0.75} max={1.25} step={0.05} value={c.rate} onChange={(e) => set("rate", Number(e.target.value))} className="w-full accent-[var(--forest)]" aria-label="Speaking speed" />
            </div>
          </Card>
        )}
        {speechSupported() && !hasEnhanced && (
          <Notice>
            <div className="font-medium text-ink">Make the voice sound way more natural (free)</div>
            {apple ? (
              <p className="mt-1">
                On iPhone: Settings → Accessibility → Spoken Content → Voices → English. Download a voice marked <strong>Enhanced</strong> or <strong>Premium</strong> (Ava, Zoe or Samantha sound lovely). Then come back here and pick it.
              </p>
            ) : (
              <p className="mt-1">Your phone&apos;s settings may offer higher-quality &quot;natural&quot; or &quot;enhanced&quot; voices to download for free. Once installed, they show up here.</p>
            )}
          </Notice>
        )}
        {speechSupported() && hasEnhanced && apple && (
          <p className="mt-2 text-xs text-ink-3">Tip: more natural voices live in iPhone Settings → Accessibility → Spoken Content → Voices.</p>
        )}
      </Section>

      <Section title="Personality">
        <Card className="space-y-5">
          <Slider label="Warmth" value={c.warmth} onChange={(v) => set("warmth", v)} left="Cool" right="Super warm" />
          <Slider label="Enthusiasm" value={c.enthusiasm} onChange={(v) => set("enthusiasm", v)} left="Chill" right="Hype" />
          <div>
            <Label hint="Never harsh. Always gentler in a crisis or after a slip.">Directness</Label>
            <Segmented<Directness>
              value={vault.profile.directness}
              onChange={(v) => update((x) => ({ ...x, profile: { ...x.profile, directness: v } }))}
              options={[
                { value: "gentle", label: "Gentle" },
                { value: "firm", label: "Firm & warm" },
                { value: "straight", label: "Straight talk" },
              ]}
            />
          </div>
          <Toggle checked={c.affectionate} onChange={(v) => set("affectionate", v)} label="Affectionate nicknames" hint={`Like "babe" or "lovely" now and then.`} />
          <div>
            <Label hint="Leave blank for a fresh one each time.">Favorite greeting</Label>
            <Input value={c.greeting} onChange={(e) => set("greeting", e.target.value)} placeholder="Hey gorgeous, what's the tea?" />
          </div>
        </Card>
      </Section>

      <Section title="Conversation">
        <Card>
          <Toggle checked={c.handsFree} onChange={(v) => set("handsFree", v)} label="Hands-free" hint="After they finish talking, it's your turn automatically. Off = tap to talk." />
          <Toggle checked={c.subtitles} onChange={(v) => set("subtitles", v)} label="Subtitles" />
          <Toggle checked={c.saveTranscripts} onChange={(v) => set("saveTranscripts", v)} label="Save voice conversations to my journal" hint="Off by default. You can also save one at a time." />
        </Card>
      </Section>

      <Section title="This month">
        <Card className="grid grid-cols-2 divide-x divide-line text-center">
          <div>
            <div className="font-serif text-3xl">{usage.voiceMinutes}</div>
            <div className="text-xs text-ink-3">voice minutes</div>
          </div>
          <div>
            <div className="font-serif text-3xl">{usage.aiCalls}</div>
            <div className="text-xs text-ink-3">AI replies</div>
          </div>
        </Card>
        <p className="mt-2 text-xs text-ink-3">Voices are from your phone, so talking costs nothing extra. Crisis help never depends on the AI.</p>
      </Section>

      <Button href="/voice" full size="lg" className="mt-2">
        <Mic size={17} /> Talk to {c.name || p.name}
      </Button>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-ink-3">
        <Sparkles size={12} /> Companions are original AI characters, not real people.
      </p>
    </div>
  );
}

function Slider({ label, value, onChange, left, right }: { label: string; value: number; onChange: (v: number) => void; left: string; right: string }) {
  return (
    <div>
      <div className="mb-1 text-sm font-medium">{label}</div>
      <input type="range" min={1} max={5} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[var(--forest)]" aria-label={label} />
      <div className="flex justify-between text-xs text-ink-3">
        <span>{left}</span>
        <span>{right}</span>
      </div>
    </div>
  );
}
