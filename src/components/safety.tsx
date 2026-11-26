"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import Link from "next/link";
import { Phone, MessageSquare, X } from "lucide-react";
import { CRISIS, SAFETY_COPY, type SafetyKind } from "@/lib/safety";
import { useStore } from "@/lib/store";

interface SafetyCtx {
  open: (kind?: SafetyKind | "menu") => void;
  close: () => void;
}
const Ctx = createContext<SafetyCtx>({ open: () => {}, close: () => {} });
export const useSafety = () => useContext(Ctx);

export function SafetyProvider({ children }: { children: ReactNode }) {
  const [kind, setKind] = useState<SafetyKind | "menu" | null>(null);
  const open = useCallback((k: SafetyKind | "menu" = "menu") => setKind(k), []);
  const close = useCallback(() => setKind(null), []);
  return (
    <Ctx.Provider value={{ open, close }}>
      {children}
      {kind && <SafetyScreen kind={kind} onClose={close} onPick={setKind} />}
    </Ctx.Provider>
  );
}

function CallRow({ label, number, href, note, sms }: { label: string; number: string; href: string; note?: string; sms?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-surface p-4">
      <div className="min-w-[60%] flex-1">
        <div className="font-medium text-ink">{label}</div>
        <div className="text-sm text-ink-3">{note ?? number}</div>
      </div>
      {sms && (
        <a href={sms} className="grid h-12 w-12 place-items-center rounded-full bg-surface-2 text-ink" aria-label={`Text ${label}`}>
          <MessageSquare size={18} />
        </a>
      )}
      <a href={href} className="inline-flex h-12 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-forest px-5 font-medium text-on-forest" aria-label={`Call ${label}`}>
        <Phone size={16} /> {number}
      </a>
    </div>
  );
}

const MENU: { kind: SafetyKind; label: string }[] = [
  { kind: "medical", label: "I feel physically unwell or unsafe" },
  { kind: "psychosis", label: "I'm seeing or hearing things, or I'm not sure what's real" },
  { kind: "withdrawal", label: "I might be in withdrawal" },
  { kind: "intoxicated", label: "I've been drinking" },
];

export function SafetyScreen({ kind, onClose, onPick }: { kind: SafetyKind | "menu"; onClose: () => void; onPick: (k: SafetyKind) => void }) {
  const { vault, locked } = useStore();
  const contacts = locked ? [] : vault.contacts.filter((c) => c.phone);
  const copy = kind === "menu" ? null : SAFETY_COPY[kind];
  const primary = copy ? CRISIS[copy.primary] : null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-bg" role="dialog" aria-modal="true" aria-label="Safety support">
      <div className="mx-auto max-w-lg px-5 pb-16 pt-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="eyebrow">I&apos;ve got you</div>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-surface-2" aria-label="Close safety screen">
            <X size={18} />
          </button>
        </div>

        {copy ? (
          <>
            <h1 className="font-serif text-[32px] leading-tight">{copy.title}</h1>
            <ul className="mt-5 space-y-3 text-lg leading-relaxed text-ink-2">
              {copy.lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            {primary && (
              <a
                href={primary.tel}
                className="mt-7 flex h-16 w-full items-center justify-center gap-3 rounded-full bg-forest text-lg font-medium text-on-forest"
              >
                <Phone size={20} /> Call {primary.number}
              </a>
            )}
          </>
        ) : (
          <>
            <h1 className="font-serif text-[32px] leading-tight">Okay girl, let&apos;s get you some help.</h1>
            <p className="mt-2 text-ink-2">What&apos;s going on? How are you feeling right now? Pick one and we&apos;ll go from there.</p>
            <div className="mt-5 space-y-2">
              {MENU.map((m) => (
                <button
                  key={m.kind}
                  onClick={() => onPick(m.kind)}
                  className="w-full rounded-2xl border border-line bg-surface px-4 py-4 text-left text-[15px] text-ink hover:border-gold"
                >
                  {m.label}
                </button>
              ))}
            </div>
          </>
        )}

        {contacts.length > 0 && (
          <div className="mt-8">
            <div className="eyebrow mb-3">Your people</div>
            <div className="space-y-2">
              {contacts.slice(0, 4).map((c) => (
                <CallRow key={c.id} label={c.name} number="Call" href={`tel:${c.phone}`} note={c.role} sms={`sms:${c.phone}`} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <div className="eyebrow mb-3">Real people, 24/7 (US)</div>
          <div className="space-y-2">
            <CallRow {...CRISIS.emergency} href={CRISIS.emergency.tel} />
            <CallRow {...CRISIS.lifeline} href={CRISIS.lifeline.tel} sms={CRISIS.lifeline.sms} />
            <CallRow {...CRISIS.samhsa} href={CRISIS.samhsa.tel} />
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-surface-2 p-4 text-sm leading-relaxed text-ink-3">
          VEEV is your bestie in an app, not a doctor, so it can't replace real-life care. These numbers work anytime, even offline.
          {!locked && (
            <>
              {" "}
              <Link href="/help" onClick={onClose} className="underline">
                Open the full safety page
              </Link>
              .
            </>
          )}
        </div>
      </div>
    </div>
  );
}
