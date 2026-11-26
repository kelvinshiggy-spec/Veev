"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { X, Mic, MicOff, Pause, Play, Captions, CaptionsOff, Keyboard, LifeBuoy, Square, Settings2, Send } from "lucide-react";
import { useStore } from "@/lib/store";
import { useSafety } from "@/components/safety";
import { useAiReady } from "@/components/ai-gate";
import { useCompanionName } from "@/components/companion-name";
import { buildContext, companionPayload, streamClarity } from "@/lib/ai";
import { cheer } from "@/components/cheer";
import { addTodos, findTodo, splitTasks } from "@/lib/todos";
import { screen, INTERRUPTING } from "@/lib/safety";
import { listenOnce, recognitionSupported, speakAsCompanion, stopSpeaking, speechSupported, type Listener } from "@/lib/voice";
import { persona } from "@/data/personas";
import { Sheet } from "@/components/ui";
import { cx, dayKey, partOfDay, uid } from "@/lib/util";
import type { ChatThread } from "@/lib/types";

type Phase = "idle" | "listening" | "thinking" | "speaking" | "paused";
type Turn = { role: "user" | "assistant"; content: string; at: string };

const IDLE_TIMEOUT = 2 * 60_000;
const minutesSince = (t: number) => (t ? Math.max(1, Math.round((Date.now() - t) / 60_000)) : 0);

// Used when the AI isn't available (offline, switched off, or not set up). Short and useful.
const BASIC_REPLIES: { test: RegExp; reply: string; href?: string }[] = [
  { test: /drink|wine|alcohol|vodka|beer|tipsy|crav/i, reply: "Okay, let's protect tonight together. Let's open your craving plan: one small step at a time.", href: "/protect" },
  { test: /anxious|panic|overwhelm|stress|can't breathe|freaking/i, reply: "Let's slow your body down first. Breathe with me on the regulate screen.", href: "/regulate" },
  { test: /angry|mad|text|message|send/i, reply: "Let's not hit send yet. Put it in Pause Before Sending and we'll look at it together.", href: "/clarity/send" },
];

function basicReply(text: string, name: string) {
  const hit = BASIC_REPLIES.find((r) => r.test.test(text));
  if (hit) return hit;
  return { reply: `I'm in basic mode right now, ${name === "Vylie" ? "bestie" : "love"}, so I can't chat freely. But I'm still here. Want to breathe, open your manifesto, or plan something fun?`, href: undefined as string | undefined };
}

export default function VoicePage() {
  return (
    <Suspense>
      <Voice />
    </Suspense>
  );
}

function Voice() {
  const { vault, update } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const safety = useSafety();
  const ready = useAiReady();
  const name = useCompanionName();
  const c = vault.companion;
  const p = persona(c.persona);

  const [phase, setPhase] = useState<Phase>("idle");
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(!c.handsFree);
  const [subtitles, setSubtitles] = useState(c.subtitles);
  const [showText, setShowText] = useState(false);
  const [settings, setSettings] = useState(false);
  const [partial, setPartial] = useState("");
  const [caption, setCaption] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [typed, setTyped] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [rate, setRate] = useState(c.rate || 1);

  const listener = useRef<Listener | null>(null);
  const abort = useRef<AbortController | null>(null);
  const turnsRef = useRef<Turn[]>([]);
  const phaseRef = useRef<Phase>("idle");
  const mutedRef = useRef(muted);
  const lastActivity = useRef(0);
  const startedAt = useRef(0);
  const flagsRef = useRef<string[]>([]);
  const respondRef = useRef<(t: string) => Promise<void>>(async () => {});
  const listenRef = useRef<() => void>(() => {});

  useEffect(() => {
    turnsRef.current = turns;
  }, [turns]);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const evening = partOfDay() === "evening" || partOfDay() === "night";
  const topic = params.get("topic");

  const companionNow = { ...c, rate };

  const stopAll = useCallback(() => {
    listener.current?.abort();
    listener.current = null;
    abort.current?.abort();
    stopSpeaking();
  }, []);

  // End everything when leaving the screen. The microphone is never left on.
  useEffect(() => () => stopAll(), [stopAll]);

  const listen = useCallback(() => {
    if (!recognitionSupported()) {
      setNote("Voice input isn't available in this browser. You can type instead.");
      setShowText(true);
      setPhase("idle");
      return;
    }
    stopSpeaking();
    setPartial("");
    setPhase("listening");
    lastActivity.current = Date.now();
    listener.current = listenOnce({
      lang: "en-US",
      onPartial: (t) => {
        lastActivity.current = Date.now();
        setPartial(t);
      },
      onFinal: (t) => {
        listener.current = null;
        setPartial("");
        void respondRef.current(t);
      },
      onError: (kind) => {
        listener.current = null;
        if (kind === "denied") {
          setNote("Microphone access is off for VEEV. Turn it on in your phone's settings, or type instead.");
          setShowText(true);
          setPhase("idle");
        } else if (kind === "no-speech") {
          if (Date.now() - lastActivity.current > IDLE_TIMEOUT) {
            setNote("It got quiet, so I'm just waiting here. Tap the orb whenever you're ready, no rush.");
            setPhase("paused");
          } else if (!mutedRef.current && phaseRef.current === "listening") {
            // Keep the turn open a little longer while she gathers her thoughts.
            setTimeout(() => phaseRef.current === "listening" && listenRef.current(), 250);
          } else setPhase("idle");
        } else {
          setPhase("idle");
        }
      },
    });
    // listen is intentionally recreated with respond below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.persona]);

  const say = useCallback(
    (text: string, after?: () => void) => {
      if (!speechSupported()) {
        setCaption(text);
        after?.();
        return;
      }
      setPhase("speaking");
      speakAsCompanion(text, companionNow, {
        onSentence: (s) => setCaption(s),
        onEnd: (completed) => {
          setCaption("");
          if (!completed) return;
          if (phaseRef.current === "speaking") setPhase("idle");
          after?.();
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [c.persona, c.voiceURI, rate],
  );

  const afterReply = useCallback(() => {
    if (!mutedRef.current && phaseRef.current !== "paused") listen();
  }, [listen]);

  const respond = useCallback(
    async (text: string) => {
      lastActivity.current = Date.now();
      const now = new Date().toISOString();
      const nextTurns = [...turnsRef.current, { role: "user" as const, content: text, at: now }];
      setTurns(nextTurns);

      const flags = screen(text);
      flagsRef.current = [...new Set([...flagsRef.current, ...flags])];
      const interrupting = flags.filter((f) => INTERRUPTING.includes(f));
      if (interrupting.length) {
        // Safety first, no AI needed: calm words and the support screen.
        safety.open(interrupting[0]);
        const line = "I'm really glad you told me. Your safety matters most right now. The support screen is open. Please call or text one of those numbers, or someone you trust.";
        setTurns((t) => [...t, { role: "assistant", content: line, at: new Date().toISOString() }]);
        say(line);
        return;
      }

      if (!ready && topic === "today") {
        const items = splitTasks(text);
        if (items.length) {
          update((v) => addTodos(v, items));
          const line = `Love it. I added ${items.length === 1 ? "that" : `${items.length} things`} to your list. Anything else?`;
          setTurns((t) => [...t, { role: "assistant", content: line, at: new Date().toISOString() }]);
          say(line, afterReply);
          return;
        }
      }

      if (!ready) {
        const b = basicReply(text, name);
        setTurns((t) => [...t, { role: "assistant", content: b.reply, at: new Date().toISOString() }]);
        say(b.reply, () => {
          if (b.href) router.push(b.href);
        });
        return;
      }

      setPhase("thinking");
      abort.current = new AbortController();
      const res = await streamClarity(
        {
          task: "voice",
          stance: topic === "craving" ? "practical" : "support",
          directness: vault.profile.directness,
          context: buildContext(vault),
          companion: companionPayload(vault),
          safety: flagsRef.current,
          messages: nextTurns.slice(-16).map((m) => ({ role: m.role, content: m.content })),
        },
        () => {},
        abort.current.signal,
      ).catch(() => ({ text: "", error: { kind: "error" as const, message: "" } }));
      if (phaseRef.current !== "thinking") return; // interrupted or ended
      // Pull out list changes she asked for, then speak only the words.
      const tags = [...res.text.matchAll(/\[\[(todo|done):\s*([^\]]+)\]\]/gi)].map((m) => ({ kind: m[1].toLowerCase(), text: m[2].trim() }));
      const reply = res.text.replace(/\[\[(todo|done):[^\]]*\]\]/gi, "").replace(/\[\[[^\]]*$/, "").trim();
      if (tags.length)
        update((v) => {
          let nv = addTodos(v, tags.filter((t) => t.kind === "todo").map((t) => t.text), "companion");
          for (const t of tags.filter((x) => x.kind === "done")) {
            const hit = findTodo(nv.todos.filter((x) => x.date === dayKey() && !x.done), t.text);
            if (hit) nv = { ...nv, todos: nv.todos.map((x) => (x.id === hit.id ? { ...x, done: true, doneAt: new Date().toISOString() } : x)) };
          }
          return nv;
        });
      if (!reply) {
        const msg = res.error?.kind === "offline" ? "Our connection dropped, but you're not on your own. Your guided tools, your letters and the Help button all work offline." : "Sorry, I lost my train of thought for a sec. I'm still here. Say that again?";
        say(msg, afterReply);
        return;
      }
      update((v) => {
        const month = dayKey().slice(0, 7);
        const u = v.usage.month === month ? v.usage : { month, aiCalls: 0, voiceMinutes: 0 };
        return { ...v, usage: { ...u, aiCalls: u.aiCalls + 1 } };
      });
      setTurns((t) => [...t, { role: "assistant", content: reply, at: new Date().toISOString() }]);
      say(reply, afterReply);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready, vault, say, afterReply, name, topic],
  );

  useEffect(() => {
    respondRef.current = respond;
    listenRef.current = listen;
  }, [respond, listen]);

  const start = () => {
    setStarted(true);
    startedAt.current = Date.now();
    lastActivity.current = Date.now();
    const greet =
      c.greeting?.trim() ||
      (topic === "craving"
        ? `Hey, I'm right here. Before anything else, talk to me. What's going on?`
        : topic === "abandoned"
          ? `Hey, I'm right here. That feeling of being left is so heavy. Tell me what happened, and we'll look at it together.`
          : topic === "argument"
            ? `Okay, deep breath, babe. Before you say anything to them, say it to me first. What's going on?`
            : topic === "driving"
              ? `Hey, first thing: if you're driving, pull over somewhere safe before we talk. Okay. What's got you this upset?`
              : topic && ["fashion", "beauty", "cars", "travel", "home", "fitness"].includes(topic)
                ? `Ooh, ${topic} talk, my favorite. What are we thinking?`
                : topic === "dbt"
                  ? `Okay, skills practice! Want to role-play a tough conversation, check the facts on something, or tell me what you learned?`
                  : topic === "goals"
                  ? `Okay goal-getter, let's make a plan you'll actually do. Which goal are we working on?`
                  : topic === "school"
                    ? `Study buddy reporting for duty! Want me to quiz you, plan your week, or talk through exam nerves?`
                    : topic === "today"
          ? `Hey ${vault.profile.name || "Veev"}! So what's going on today? Tell me everything and I'll put it on your list.`
          : topic === "holiday"
          ? `Okay, holiday planning! What's the vibe you want, and who's going to be there?`
          : topic === "vibes"
            ? `Movie night or music mood? Tell me how you're feeling and I'll pick something.`
            : evening
              ? `Hey ${vault.profile.name || "Veev"}. How was your day, really?`
              : `Hey ${vault.profile.name || "Veev"}. What's on your mind?`);
    setTurns([{ role: "assistant", content: greet, at: new Date().toISOString() }]);
    say(greet, afterReply);
  };

  const onOrb = () => {
    if (!started) return start();
    if (phase === "speaking" || phase === "thinking") {
      // Interrupt her companion and hand the floor back to her.
      abort.current?.abort();
      stopSpeaking();
      setCaption("");
      listen();
      return;
    }
    if (phase === "listening") {
      listener.current?.stop();
      return;
    }
    listen();
  };

  const pause = () => {
    if (phase === "paused") {
      setPhase("idle");
      setNote("");
      return;
    }
    stopAll();
    setPhase("paused");
  };

  const endSession = () => {
    stopAll();
    const mins = minutesSince(startedAt.current);
    if (mins)
      update((v) => {
        const month = dayKey().slice(0, 7);
        const u = v.usage.month === month ? v.usage : { month, aiCalls: 0, voiceMinutes: 0 };
        return { ...v, usage: { ...u, voiceMinutes: u.voiceMinutes + mins } };
      });
    if (c.saveTranscripts && turns.some((t) => t.role === "user")) saveTranscript();
    router.push("/today");
    // A warm goodbye instead of a cold cut-off.
    setTimeout(() => cheer("bye"), 700);
  };

  const saveTranscript = () => {
    const text = turns.map((t) => `${t.role === "user" ? "Me" : name}: ${t.content}`).join("\n\n");
    update((v) => ({
      ...v,
      journal: [...v.journal, { id: uid(), kind: "voice", createdAt: new Date().toISOString(), title: `Conversation with ${name}`, fields: { text } }],
    }));
    setSaved(true);
  };

  const continueInText = () => {
    stopAll();
    const now = new Date().toISOString();
    const t: ChatThread = {
      id: uid(),
      title: turns.find((x) => x.role === "user")?.content.slice(0, 60) || `Talk with ${name}`,
      stance: "support",
      messages: turns,
      createdAt: now,
      updatedAt: now,
    };
    update((v) => ({ ...v, chats: [...v.chats, t] }));
    router.push(`/clarity/chat?id=${t.id}`);
  };

  const sendTyped = () => {
    const t = typed.trim();
    if (!t) return;
    setTyped("");
    stopAll();
    void respond(t);
  };

  const status =
    !started
      ? `Tap to talk with ${name}`
      : phase === "listening"
        ? "Listening…"
        : phase === "thinking"
          ? "Thinking…"
          : phase === "speaking"
            ? "Tap to interrupt"
            : phase === "paused"
              ? "Paused"
              : muted
                ? "Tap the orb when you want to talk"
                : "Tap to talk";

  const last = turns[turns.length - 1];

  return (
    <div className={cx("fixed inset-0 z-50 flex flex-col overflow-hidden", evening ? "dusk" : "bg-bg")}>
      {!evening && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 60% at 50% 38%, color-mix(in srgb, var(--sage) 45%, transparent) 0%, transparent 70%), radial-gradient(70% 50% at 15% 0%, var(--peach-soft) 0%, transparent 70%), radial-gradient(70% 50% at 100% 100%, var(--alpine-soft) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Top */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),16px)]">
        <div>
          <div className={cx("font-serif text-2xl", evening ? "text-[#f3ede2]" : "text-ink")}>{name}</div>
          <div className={cx("text-[11px] uppercase tracking-[0.16em]", evening ? "text-[#cbbf9f]" : "text-ink-3")}>AI companion · {p.tagline}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => safety.open("menu")} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-rose/40 bg-surface/60 px-3 text-sm font-medium text-rose">
            <LifeBuoy size={15} /> Help
          </button>
          <button onClick={endSession} aria-label="End conversation" className={cx("grid h-9 w-9 place-items-center rounded-full", evening ? "bg-white/10 text-[#f3ede2]" : "bg-surface-2 text-ink")}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Orb */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
        <button onClick={onOrb} aria-label={status} className="relative grid h-64 w-64 place-items-center outline-none">
          <Orb phase={started ? phase : "idle"} evening={evening} />
        </button>
        <div className={cx("mt-2 h-5 text-sm", evening ? "text-[#cbbf9f]" : "text-ink-3")} aria-live="polite">
          {status}
        </div>
        <Wave phase={started ? phase : "idle"} evening={evening} />
        <div className="mt-4 min-h-[84px] w-full max-w-sm text-center">
          {subtitles && phase === "listening" && partial && <p className={cx("text-[17px] leading-snug", evening ? "text-[#efe9dd]" : "text-ink-2")}>{partial}</p>}
          {subtitles && phase === "speaking" && caption && <p className={cx("font-serif text-[22px] leading-snug", evening ? "text-[#f7f3e9]" : "text-ink")}>{caption}</p>}
          {subtitles && phase !== "speaking" && phase !== "listening" && last?.role === "assistant" && started && (
            <p className={cx("font-serif text-[20px] leading-snug opacity-80", evening ? "text-[#f7f3e9]" : "text-ink")}>{last.content}</p>
          )}
          {note && <p className="mt-2 text-sm text-rose">{note}</p>}
          {!started && (
            <p className={cx("text-sm leading-relaxed", evening ? "text-[#cbbf9f]" : "text-ink-3")}>
              The microphone only turns on while you talk with {name}. {ready ? "" : "Basic mode: guided tools by voice, no free chat."}
            </p>
          )}
        </div>
      </div>

      {/* Transcript / typing */}
      {showText && (
        <div className={cx("relative z-10 mx-4 mb-3 max-h-[34vh] overflow-y-auto rounded-3xl p-4", evening ? "bg-white/8" : "bg-surface/90 shadow-[var(--shadow)]")}>
          <div className="space-y-2">
            {turns.map((t, i) => (
              <div key={i} className={cx("text-[15px] leading-relaxed", t.role === "user" ? "text-right" : "")}>
                <span className={cx("inline-block rounded-2xl px-3 py-2", t.role === "user" ? "bg-forest text-on-forest" : evening ? "bg-white/10" : "bg-surface-2")}>{t.content}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendTyped()}
              placeholder="Type instead…"
              className="min-w-0 flex-1 rounded-full border border-line bg-surface px-4 py-2.5 text-ink"
            />
            <button onClick={sendTyped} aria-label="Send" className="grid h-11 w-11 place-items-center rounded-full bg-forest text-on-forest">
              <Send size={16} />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <button onClick={continueInText} className="underline">
              Continue in text chat
            </button>
            {turns.some((t) => t.role === "user") && (
              <button onClick={saveTranscript} disabled={saved} className="underline">
                {saved ? "Saved to journal" : "Save this conversation"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="relative z-10 pb-[max(env(safe-area-inset-bottom),20px)]">
        <div className="mx-auto flex max-w-sm items-center justify-between px-6">
          <Ctrl label={muted ? "Hands-free off" : "Hands-free on"} evening={evening} onClick={() => setMuted(!muted)}>
            {muted ? <MicOff size={20} /> : <Mic size={20} />}
          </Ctrl>
          <Ctrl label={phase === "paused" ? "Resume" : "Pause"} evening={evening} onClick={pause} disabled={!started}>
            {phase === "paused" ? <Play size={20} /> : <Pause size={20} />}
          </Ctrl>
          <button onClick={endSession} aria-label="End" className="grid h-16 w-16 place-items-center rounded-full bg-rose text-white shadow-lg">
            <Square size={20} fill="currentColor" />
          </button>
          <Ctrl label={subtitles ? "Subtitles on" : "Subtitles off"} evening={evening} onClick={() => setSubtitles(!subtitles)}>
            {subtitles ? <Captions size={20} /> : <CaptionsOff size={20} />}
          </Ctrl>
          <Ctrl label="Transcript and typing" evening={evening} onClick={() => setShowText(!showText)}>
            <Keyboard size={20} />
          </Ctrl>
        </div>
        <div className="mt-3 flex justify-center">
          <button onClick={() => setSettings(true)} className={cx("inline-flex items-center gap-1.5 text-xs", evening ? "text-[#cbbf9f]" : "text-ink-3")}>
            <Settings2 size={13} /> Voice & speed
          </button>
        </div>
      </div>

      <Sheet open={settings} onClose={() => setSettings(false)} title="Voice & speed">
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>Speaking speed</span>
              <span className="text-ink-3">{rate.toFixed(2)}×</span>
            </div>
            <input
              type="range"
              min={0.75}
              max={1.25}
              step={0.05}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              onPointerUp={() => update((v) => ({ ...v, companion: { ...v.companion, rate } }))}
              className="w-full accent-[var(--forest)]"
              aria-label="Speaking speed"
            />
          </div>
          <Link href="/me/companion" className="block rounded-2xl border border-line p-4 text-[15px]">
            Change companion, voice or personality →
          </Link>
          <p className="text-xs leading-relaxed text-ink-3">
            {name} is an AI. Voices come from your phone, so there&apos;s no extra cost. Conversations aren&apos;t saved unless you choose to save them.
          </p>
        </div>
      </Sheet>
    </div>
  );
}

function Ctrl({ children, label, onClick, evening, disabled }: { children: React.ReactNode; label: string; onClick: () => void; evening: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cx("grid h-12 w-12 place-items-center rounded-full transition disabled:opacity-40", evening ? "bg-white/10 text-[#f3ede2]" : "bg-surface text-ink shadow-[var(--shadow)]")}
    >
      {children}
    </button>
  );
}

/** The animated orb: breathes when idle, swells while listening, shimmers while speaking. */
function Orb({ phase, evening }: { phase: Phase; evening: boolean }) {
  const scale = phase === "listening" ? "scale-105" : phase === "speaking" ? "scale-100" : phase === "thinking" ? "scale-95" : "scale-90";
  return (
    <>
      <span
        className={cx("absolute inset-0 rounded-full blur-2xl transition-all duration-700", phase === "listening" || phase === "speaking" ? "opacity-90" : "opacity-50")}
        style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--champagne) 55%, transparent) 0%, transparent 65%)" }}
      />
      <span
        className={cx("relative block h-48 w-48 rounded-full transition-transform duration-700", scale, phase === "speaking" ? "orb-speak" : phase === "thinking" ? "orb-think" : "orb-idle")}
        style={{
          background: evening
            ? "radial-gradient(circle at 35% 30%, #f7f3e9 0%, #d6b77a 28%, #6f8f7d 62%, #19382c 100%)"
            : "radial-gradient(circle at 35% 30%, #ffffff 0%, #f7f3e9 18%, #eac8ae 40%, #a9c5b4 70%, #2b5443 100%)",
          boxShadow: "inset -18px -24px 50px rgba(25,56,44,0.35), 0 30px 60px -20px rgba(25,56,44,0.45)",
        }}
      />
      {phase === "listening" && <span className="orb-ring absolute h-56 w-56 rounded-full border border-[color:var(--champagne)]" />}
    </>
  );
}

function Wave({ phase, evening }: { phase: Phase; evening: boolean }) {
  const active = phase === "listening" || phase === "speaking";
  return (
    <div className="mt-5 flex h-8 items-center gap-[5px]" aria-hidden>
      {Array.from({ length: 17 }).map((_, i) => (
        <span
          key={i}
          className={cx("w-[3px] rounded-full", active ? "wave-bar" : "", evening ? "bg-[#d6b77a]" : "bg-forest/70")}
          style={{
            height: active ? undefined : 4,
            animationDelay: `${(i * 83) % 700}ms`,
            animationDuration: phase === "speaking" ? "900ms" : "1300ms",
          }}
        />
      ))}
    </div>
  );
}
