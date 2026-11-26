"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Mic, Plus, Volume2, VolumeX, X, Sparkles, ArrowDownToLine } from "lucide-react";
import { useStore } from "@/lib/store";
import { useCompanionName } from "@/components/companion-name";
import { VoiceButton, Button } from "@/components/ui";
import { addDays, cx, dayKey, haptic, pickOfDay } from "@/lib/util";
import { addTodos, splitTasks, pick, ASK_LINES, ADDED_LINES, DONE_LINES, ALL_DONE_LINES, UNDO_LINES, SUGGESTIONS } from "@/lib/todos";
import { speakAsCompanion, stopSpeaking, speechSupported } from "@/lib/voice";

const TALK_KEY = "veev.companionTalks";

/** The companion runs her day with her: asks what's going on, keeps the list, cheers her on. */
export function VylieDay({ name }: { name: string }) {
  const { vault, update } = useStore();
  const cn = useCompanionName();
  const today = dayKey();
  const yesterday = addDays(today, -1);
  const list = vault.todos.filter((t) => t.date === today);
  const leftover = vault.todos.filter((t) => t.date === yesterday && !t.done && !list.some((x) => x.text.toLowerCase() === t.text.toLowerCase()));
  const done = list.filter((t) => t.done).length;

  const opening = () =>
    !list.length
      ? (pickOfDay(ASK_LINES, 31) ?? ASK_LINES[0]).replace("{name}", name)
      : done === list.length
        ? "Whole list done today. Honestly? Iconic."
        : `${list.length - done} thing${list.length - done === 1 ? "" : "s"} left today. You've got this, ${name}.`;

  const [line, setLine] = useState<string | null>(null);
  const [bump, setBump] = useState(0);
  const [burst, setBurst] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [talks, setTalks] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      setTalks(localStorage.getItem(TALK_KEY) === "1");
    } catch {}
    return () => stopSpeaking();
  }, []);

  const react = (text: string) => {
    setLine(text);
    setBump((b) => b + 1);
    if (talks && speechSupported()) speakAsCompanion(text, vault.companion);
  };

  const add = (raw: string) => {
    const items = splitTasks(raw);
    if (!items.length) return;
    update((v) => addTodos(v, items));
    setDraft("");
    react(items.length > 1 ? `${items.length} things, love it. All on the list.` : pick(ADDED_LINES));
  };

  const toggle = (id: string) => {
    const t = list.find((x) => x.id === id);
    if (!t) return;
    const nowDone = !t.done;
    update((v) => ({ ...v, todos: v.todos.map((x) => (x.id === id ? { ...x, done: nowDone, doneAt: nowDone ? new Date().toISOString() : undefined } : x)) }));
    if (nowDone) {
      setBurst(id);
      setTimeout(() => setBurst((b) => (b === id ? null : b)), 900);
      haptic(vault.settings.haptics, [10, 40, 18]);
      react(done + 1 === list.length ? pick(ALL_DONE_LINES) : pick(DONE_LINES));
    } else react(pick(UNDO_LINES));
  };

  const remove = (id: string) => update((v) => ({ ...v, todos: v.todos.filter((x) => x.id !== id) }));

  const carry = () => {
    update((v) => addTodos(v, leftover.map((t) => t.text)));
    react("Brought those over. Fresh day, same goals.");
  };

  const toggleTalk = () => {
    const next = !talks;
    setTalks(next);
    try {
      localStorage.setItem(TALK_KEY, next ? "1" : "0");
    } catch {}
    if (!next) stopSpeaking();
    else if (speechSupported()) speakAsCompanion(line ?? opening(), vault.companion);
  };

  const shown = line ?? opening();
  const left = SUGGESTIONS.filter((s) => !list.some((t) => t.text.toLowerCase() === s.toLowerCase())).slice(0, 5);

  return (
    <div className="card overflow-hidden p-5">
      {/* Companion bubble */}
      <div className="flex items-start gap-3">
        <span
          key={bump}
          className={cx("mt-0.5 h-11 w-11 shrink-0 rounded-full", bump ? "orb-pop" : "float-slow")}
          style={{ background: "radial-gradient(circle at 35% 30%, #fff 0%, #f7f3e9 18%, #eac8ae 42%, #a9c5b4 72%, #2b5443 100%)" }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="eyebrow">{cn}</span>
            {speechSupported() && (
              <button onClick={toggleTalk} aria-label={talks ? `Mute ${cn}` : `Let ${cn} talk out loud`} className="grid h-8 w-8 place-items-center rounded-full text-ink-3 hover:text-ink">
                {talks ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
            )}
          </div>
          <p key={shown} className="bubble-in mt-1 rounded-2xl rounded-tl-md bg-surface-2 px-3.5 py-2.5 font-serif text-[19px] leading-snug text-ink" aria-live="polite">
            {shown}
          </p>
        </div>
      </div>

      {/* Progress */}
      {list.length > 0 && (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-ink-3">
            <span>Today&apos;s list</span>
            <span>
              {done}/{list.length}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-forest transition-all duration-500" style={{ width: `${(done / list.length) * 100}%` }} />
          </div>
        </div>
      )}

      {/* List */}
      {list.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {list.map((t) => (
            <li key={t.id} className="group relative flex items-center gap-3 rounded-2xl px-1 py-1.5">
              <button
                onClick={() => toggle(t.id)}
                aria-label={t.done ? `Mark ${t.text} not done` : `Check off ${t.text}`}
                className={cx(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-all duration-200 active:scale-90",
                  t.done ? "check-pop border-forest bg-forest text-on-forest" : "border-line bg-surface",
                )}
              >
                {t.done && <Check size={14} strokeWidth={3} />}
              </button>
              <button onClick={() => toggle(t.id)} className={cx("flex-1 text-left text-[15.5px] transition", t.done && "text-ink-3 line-through")}>
                {t.text}
              </button>
              {burst === t.id && (
                <span className="sparkle-burst pointer-events-none absolute left-3 top-0 text-lg" aria-hidden>
                  ✨
                </span>
              )}
              <button onClick={() => remove(t.id)} aria-label={`Remove ${t.text}`} className="grid h-7 w-7 place-items-center rounded-full text-ink-3 opacity-60 hover:opacity-100">
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add */}
      <form
        className="mt-3 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          add(draft);
        }}
      >
        <input
          ref={input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={list.length ? "Add something…" : "Gym, nails, call mom…"}
          aria-label="Add to today's list"
          className="min-w-0 flex-1 rounded-full border border-line bg-surface px-4 py-2.5 text-[15px] outline-none focus:border-forest"
        />
        <VoiceButton onText={(t) => add(t)} />
        <button type="submit" aria-label="Add" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest text-on-forest active:scale-90">
          <Plus size={18} />
        </button>
      </form>

      {list.length < 4 && left.length > 0 && (
        <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
          {left.map((s) => (
            <button key={s} onClick={() => add(s)} className="shrink-0 rounded-full border border-dashed border-line px-3 py-1.5 text-[13px] text-ink-2 active:scale-95">
              + {s}
            </button>
          ))}
        </div>
      )}

      {leftover.length > 0 && (
        <button onClick={carry} className="mt-3 flex items-center gap-1.5 text-sm text-ink-2">
          <ArrowDownToLine size={14} /> Bring over {leftover.length} from yesterday
        </button>
      )}

      <Button href="/voice?topic=today" variant="soft" size="sm" className="mt-4">
        <Mic size={14} /> Plan my day out loud with {cn}
      </Button>
      {done > 0 && done === list.length && (
        <div className="mt-3 flex items-center gap-1.5 text-sm text-forest">
          <Sparkles size={14} /> Everything checked. Treat yourself to something soft tonight.
        </div>
      )}
    </div>
  );
}
