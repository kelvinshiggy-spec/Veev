"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowUp, Plus, Trash2, Square } from "lucide-react";
import { useStore } from "@/lib/store";
import type { ChatThread, ClarityStance, Directness } from "@/lib/types";
import { buildContext, companionPayload, streamClarity, type AiError } from "@/lib/ai";
import { screen, INTERRUPTING } from "@/lib/safety";
import { useSafety } from "@/components/safety";
import { AiErrorNote, AiNotice, NotTherapy, useAiReady } from "@/components/ai-gate";
import { Chips, Segmented, VoiceButton, PageHeader, Button } from "@/components/ui";
import { cx, dayKey, uid } from "@/lib/util";
import { CName, useCompanionName } from "@/components/companion-name";

const STANCES: { v: ClarityStance; label: string }[] = [
  { v: "support", label: "Just support me" },
  { v: "reflect", label: "Help me reflect" },
  { v: "challenge", label: "Challenge me" },
  { v: "practical", label: "Practical advice" },
  { v: "coach", label: "Coach me" },
];

const OPENERS: Record<string, string> = {
  craving: "I'm here. Before anything else: you reached out instead of reaching for a drink, and that matters. What's pulling at you tonight?",
  default: "I'm here. What's on your mind?",
};

export default function ChatPage() {
  return (
    <Suspense>
      <Chat />
    </Suspense>
  );
}

function Chat() {
  const companionName = useCompanionName();
  const { vault, update } = useStore();
  const safety = useSafety();
  const router = useRouter();
  const params = useSearchParams();
  const ready = useAiReady();
  const topic = params.get("topic") ?? "default";
  const [threadId, setThreadId] = useState<string>(() => params.get("id") ?? uid());
  const existing = vault.chats.find((c) => c.id === threadId);
  const [stance, setStance] = useState<ClarityStance>(existing?.stance ?? (topic === "craving" ? "practical" : "support"));
  const [input, setInput] = useState("");
  const [pending, setPending] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AiError>();
  const abort = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement>(null);

  const messages = useMemo(
    () => existing?.messages ?? [{ role: "assistant" as const, content: OPENERS[topic] ?? OPENERS.default, at: new Date().toISOString() }],
    [existing, topic],
  );

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, pending]);

  const todayCount = vault.chats.reduce((n, c) => n + c.messages.filter((m) => m.role === "user" && m.at.startsWith(dayKey())).length, 0);

  const save = (t: ChatThread) => update((v) => ({ ...v, chats: [...v.chats.filter((c) => c.id !== t.id), t] }));

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setError(undefined);
    const flags = screen(text);
    const interrupting = flags.filter((f) => INTERRUPTING.includes(f));
    if (interrupting.length) safety.open(interrupting[0]);

    const now = new Date().toISOString();
    const thread: ChatThread = existing ?? {
      id: threadId,
      title: text.slice(0, 60),
      stance,
      messages: messages,
      createdAt: now,
      updatedAt: now,
    };
    const withUser: ChatThread = { ...thread, stance, messages: [...thread.messages, { role: "user", content: text, at: now }], updatedAt: now };
    save(withUser);
    setInput("");
    if (!ready) return;

    setBusy(true);
    setPending("");
    abort.current = new AbortController();
    const res = await streamClarity(
      {
        task: "chat",
        stance,
        directness: vault.profile.directness,
        context: buildContext(vault), companion: companionPayload(vault),
        safety: flags,
        messages: withUser.messages.map((m) => ({ role: m.role, content: m.content })),
      },
      setPending,
      abort.current.signal,
    ).catch(() => ({ text: "", error: undefined }));
    setBusy(false);
    setPending("");
    if (res.error) setError(res.error);
    if (res.text.trim()) save({ ...withUser, messages: [...withUser.messages, { role: "assistant", content: res.text.trim(), at: new Date().toISOString() }], updatedAt: new Date().toISOString() });
  };

  const setDirectness = (d: Directness) => update((v) => ({ ...v, profile: { ...v.profile, directness: d } }));

  return (
    <div className="flex min-h-[calc(100dvh-10rem)] flex-col">
      <PageHeader
        back="/clarity"
        eyebrow={companionName}
        title="Talk it through"
        action={
          <div className="flex gap-1">
            <button
              aria-label="New conversation"
              onClick={() => {
                const id = uid();
                setThreadId(id);
                router.replace(`/clarity/chat?id=${id}`);
              }}
              className="grid h-10 w-10 place-items-center rounded-full bg-surface-2"
            >
              <Plus size={17} />
            </button>
            {existing && (
              <button
                aria-label="Delete conversation"
                onClick={() => {
                  update((v) => ({ ...v, chats: v.chats.filter((c) => c.id !== threadId) }));
                  router.replace("/clarity");
                }}
                className="grid h-10 w-10 place-items-center rounded-full bg-surface-2 text-ink-3"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        }
      />

      <div className="mb-4 space-y-3">
        <Chips options={STANCES.map((s) => s.label)} value={[STANCES.find((s) => s.v === stance)!.label]} multi={false} onChange={(v) => v[0] && setStance(STANCES.find((s) => s.label === v[0])!.v)} />
        <Segmented<Directness>
          value={vault.profile.directness}
          onChange={setDirectness}
          options={[
            { value: "gentle", label: "Gentle" },
            { value: "firm", label: "Firm & warm" },
            { value: "straight", label: "Straight talk" },
          ]}
        />
      </div>

      <AiNotice compact />

      <div className="flex-1 space-y-4 py-4" aria-live="polite">
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} text={m.content} />
        ))}
        {busy && <Bubble role="assistant" text={pending || "…"} />}
        {!ready && existing && existing.messages[existing.messages.length - 1]?.role === "user" && (
          <p className="text-center text-xs text-ink-3">Saved privately. <CName /> will be able to reply once AI is connected and on.</p>
        )}
        <AiErrorNote error={error} />
        {todayCount > 40 && (
          <p className="rounded-2xl bg-surface-2 p-3 text-sm text-ink-2">
            We&apos;ve talked a lot today. That&apos;s okay. Is there someone in your life you could share some of this with too?
          </p>
        )}
        <div ref={end} />
      </div>

      <div className="sticky bottom-20 mt-2">
        <div className="card flex items-end gap-2 p-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(pointer: fine)").matches) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Say anything…"
            className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 outline-none"
            aria-label="Message"
          />
          <VoiceButton onText={(t) => setInput((v) => (v ? v + " " : "") + t)} />
          {busy ? (
            <button onClick={() => abort.current?.abort()} aria-label="Stop" className="grid h-10 w-10 place-items-center rounded-full bg-surface-2">
              <Square size={14} />
            </button>
          ) : (
            <button onClick={send} disabled={!input.trim()} aria-label="Send" className="grid h-10 w-10 place-items-center rounded-full bg-forest text-on-forest disabled:opacity-30">
              <ArrowUp size={18} />
            </button>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <NotTherapy />
          {!ready && (
            <Button href="/clarity/room" size="sm" variant="ghost">
              Private Room
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Bubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  return (
    <div className={cx("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cx(
          "max-w-[85%] whitespace-pre-wrap rounded-3xl px-4 py-3 text-[15.5px] leading-relaxed",
          role === "user" ? "rounded-br-lg bg-forest text-on-forest" : "rounded-bl-lg border border-line bg-surface text-ink",
        )}
      >
        {text}
      </div>
    </div>
  );
}
