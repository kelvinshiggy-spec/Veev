"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Send, Mic, X, MessageCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { useCompanionName } from "./companion-name";
import { useSafety } from "./safety";
import { useAiReady, AiErrorNote } from "./ai-gate";
import { VoiceButton } from "./ui";
import { buildContext, companionPayload, streamClarity, type AiError } from "@/lib/ai";
import { screen, INTERRUPTING } from "@/lib/safety";
import { cx, uid } from "@/lib/util";
import type { ChatMessage, ChatThread } from "@/lib/types";

const HIDE = ["/voice", "/welcome", "/help", "/clarity/chat", "/back"];

/** A little floating companion bubble: one tap to ask anything, from any screen. */
export function QuickChat() {
  const path = usePathname();
  const router = useRouter();
  const { vault, update } = useStore();
  const cn = useCompanionName();
  const safety = useSafety();
  const ready = useAiReady();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AiError>();
  const end = useRef<HTMLDivElement>(null);

  if (HIDE.some((h) => path.startsWith(h))) return null;

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    setDraft("");
    const now = new Date().toISOString();
    const next = [...msgs, { role: "user" as const, content: text, at: now }];
    setMsgs(next);
    const flags = screen(text);
    const urgent = flags.filter((f) => INTERRUPTING.includes(f));
    if (urgent.length) {
      safety.open(urgent[0]);
      return;
    }
    if (!ready) {
      setMsgs([...next, { role: "assistant", content: `I can chat once my AI is turned on in Me → Privacy. Until then, your tools, letters and Help all work.`, at: now }]);
      return;
    }
    setBusy(true);
    setError(undefined);
    const r = await streamClarity(
      {
        task: "chat",
        stance: "support",
        directness: vault.profile.directness,
        context: buildContext(vault),
        companion: companionPayload(vault),
        safety: flags,
        messages: next.slice(-12).map((m) => ({ role: m.role, content: m.content })),
      },
      (t) => {
        setPending(t);
        end.current?.scrollIntoView({ block: "end" });
      },
    );
    setBusy(false);
    setPending("");
    if (r.error) return setError(r.error);
    setMsgs([...next, { role: "assistant", content: r.text.trim(), at: new Date().toISOString() }]);
    setTimeout(() => end.current?.scrollIntoView({ block: "end" }), 50);
  };

  const openFull = () => {
    if (msgs.some((m) => m.role === "user")) {
      const now = new Date().toISOString();
      const t: ChatThread = { id: uid(), title: msgs.find((m) => m.role === "user")!.content.slice(0, 60), stance: "support", messages: msgs, createdAt: now, updatedAt: now };
      update((v) => ({ ...v, chats: [...v.chats, t] }));
      setOpen(false);
      setMsgs([]);
      router.push(`/clarity/chat?id=${t.id}`);
    } else {
      setOpen(false);
      router.push("/clarity/chat");
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={`Chat with ${cn}`}
          className="float-slow fixed bottom-24 right-3 z-30 h-12 w-12 rounded-full shadow-[var(--shadow)] ring-2 ring-surface active:scale-90"
          style={{ background: "radial-gradient(circle at 35% 30%, #fff 0%, #f7f3e9 18%, #eac8ae 42%, #a9c5b4 72%, #2b5443 100%)" }}
        >
          <MessageCircle size={18} className="mx-auto text-forest" />
        </button>
      )}
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[75dvh] max-w-lg flex-col rounded-t-3xl border border-line bg-surface shadow-[var(--shadow)] bubble-in">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <span className="h-8 w-8 rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, #fff 0%, #f7f3e9 18%, #eac8ae 42%, #a9c5b4 72%, #2b5443 100%)" }} aria-hidden />
            <div className="flex-1">
              <div className="font-medium leading-tight">{cn}</div>
              <button onClick={openFull} className="text-xs text-ink-3 underline-offset-2 hover:underline">
                Open full chat
              </button>
            </div>
            <button onClick={() => router.push("/voice")} aria-label="Talk out loud" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2">
              <Mic size={16} />
            </button>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2">
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
            <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-surface-2 px-3.5 py-2.5 text-[15px]">
              Hiii {vault.profile.name || "Veev"} 💕 What&apos;s up? Ask me anything.
            </div>
            {msgs.map((m, i) => (
              <div key={i} className={cx("max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[15px]", m.role === "user" ? "ml-auto rounded-tr-md bg-forest text-on-forest" : "rounded-tl-md bg-surface-2")}>
                {m.content}
              </div>
            ))}
            {(busy || pending) && <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-md bg-surface-2 px-3.5 py-2.5 text-[15px]">{pending || "…"}</div>}
            <AiErrorNote error={error} />
            <div ref={end} />
          </div>
          <form
            className="flex items-center gap-2 border-t border-line p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Ask ${cn}…`}
              aria-label={`Message ${cn}`}
              className="min-w-0 flex-1 rounded-full border border-line bg-bg px-4 py-2.5 text-[15px] outline-none focus:border-forest"
            />
            <VoiceButton onText={(t) => setDraft((d) => (d ? `${d} ${t}` : t))} />
            <button type="submit" disabled={busy || !draft.trim()} aria-label="Send" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-forest text-on-forest disabled:opacity-50">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
