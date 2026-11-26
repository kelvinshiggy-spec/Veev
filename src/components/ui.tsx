"use client";

import { createPortal } from "react-dom";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, Mic, MicOff, X, Plus } from "lucide-react";
import { cx, haptic } from "@/lib/util";
import { useStore } from "@/lib/store";

type BtnVariant = "primary" | "gold" | "ghost" | "outline" | "soft" | "danger";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";
const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-forest text-on-forest hover:opacity-95",
  gold: "bg-gold text-[#1b1a17] hover:opacity-95",
  ghost: "text-ink-2 hover:bg-surface-2",
  outline: "border border-line text-ink hover:bg-surface-2",
  soft: "bg-surface-2 text-ink hover:bg-bg-2",
  danger: "bg-rose text-white hover:opacity-95",
};
const btnSizes = { sm: "h-9 px-4 text-sm", md: "h-11 px-5 text-[15px]", lg: "h-14 px-7 text-base" };

export function Button({
  variant = "primary",
  size = "md",
  className,
  href,
  onClick,
  children,
  full,
  ...rest
}: {
  variant?: BtnVariant;
  size?: keyof typeof btnSizes;
  className?: string;
  href?: string;
  full?: boolean;
  onClick?: () => void;
  children: ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">) {
  const { vault } = useStore();
  const cls = cx(btnBase, btnVariants[variant], btnSizes[size], full && "w-full", className);
  if (href)
    return (
      <Link
        href={href}
        className={cls}
        onClick={() => {
          haptic(vault.settings.haptics);
          onClick?.();
        }}
      >
        {children}
      </Link>
    );
  return (
    <button
      type="button"
      className={cls}
      onClick={() => {
        haptic(vault.settings.haptics);
        onClick?.();
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Card({ className, children, onClick }: { className?: string; children: ReactNode; onClick?: () => void }) {
  return (
    <div className={cx("card p-5", onClick && "cursor-pointer", className)} onClick={onClick}>
      {children}
    </div>
  );
}

export function LinkCard({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={cx("card block p-5 transition hover:-translate-y-0.5 active:scale-[0.99]", className)}>
      {children}
    </Link>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  back,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  back?: string | boolean;
  action?: ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="mb-6 fade-in">
      {back && (
        <button
          onClick={() => (typeof back === "string" ? router.push(back) : router.back())}
          className="-ml-2 mb-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm text-ink-3 hover:text-ink"
        >
          <ChevronLeft size={16} /> Back
        </button>
      )}
      <div className="flex items-end justify-between gap-4">
        <div>
          {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
          <h1 className="font-serif text-[34px] leading-[1.05] text-ink sm:text-[40px]">{title}</h1>
          {subtitle && <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-ink-2">{subtitle}</p>}
        </div>
        {action}
      </div>
    </header>
  );
}

export function Section({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx("mb-7", className)}>
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between">
          {title && <h2 className="eyebrow">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Label({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-2">
      <div className="text-[15px] font-medium text-ink">{children}</div>
      {hint && <div className="mt-0.5 text-sm text-ink-3">{hint}</div>}
    </div>
  );
}

const inputCls =
  "w-full rounded-2xl border border-line bg-surface px-4 py-3 text-ink placeholder:text-ink-3 outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(inputCls, props.className)} />;
}

export function TextArea({
  voice,
  value,
  onChange,
  rows = 4,
  className,
  ...rest
}: { voice?: boolean; value: string; onChange: (v: string) => void } & Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
>) {
  return (
    <div className="relative">
      <textarea
        {...rest}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx(inputCls, "resize-y leading-relaxed", voice && "pr-12", className)}
      />
      {voice && (
        <div className="absolute right-2 top-2">
          <VoiceButton onText={(t) => onChange((value ? value.trimEnd() + " " : "") + t)} />
        </div>
      )}
    </div>
  );
}

export function Chips({
  options,
  value,
  onChange,
  multi = true,
  className,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  multi?: boolean;
  className?: string;
}) {
  const { vault } = useStore();
  return (
    <div className={cx("flex flex-wrap gap-2", className)}>
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            type="button"
            key={o}
            aria-pressed={on}
            onClick={() => {
              haptic(vault.settings.haptics, 5);
              onChange(multi ? (on ? value.filter((x) => x !== o) : [...value, o]) : on ? [] : [o]);
            }}
            className={cx(
              "rounded-full border px-3.5 py-2 text-sm transition",
              on ? "border-forest bg-forest text-on-forest" : "border-line bg-surface text-ink-2 hover:border-gold",
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

/** Chips plus the ability to add custom items */
export function ListEditor({
  value,
  onChange,
  suggestions = [],
  placeholder = "Add your own",
}: {
  value: string[];
  onChange: (v: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const all = [...new Set([...suggestions, ...value])];
  const add = () => {
    const t = draft.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setDraft("");
  };
  return (
    <div>
      <Chips options={all} value={value} onChange={onChange} />
      <div className="mt-3 flex gap-2">
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
        />
        <button onClick={add} type="button" aria-label="Add" className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-line bg-surface text-ink-2 hover:border-gold">
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-full border border-line bg-surface-2 p-1">
      {options.map((o) => (
        <button
          type="button"
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cx(
            "flex-1 rounded-full px-3 py-2 text-sm transition",
            value === o.value ? "bg-surface text-ink shadow-sm" : "text-ink-3 hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; hint?: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
      <div>
        <div className="text-[15px] text-ink">{label}</div>
        {hint && <div className="mt-0.5 text-sm text-ink-3">{hint}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx("relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition", checked ? "bg-forest" : "bg-line")}
      >
        <span className={cx("absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "left-6" : "left-1")} />
      </button>
    </label>
  );
}

export function Progress({ value, className, tone = "gold" }: { value: number; className?: string; tone?: "gold" | "forest" }) {
  return (
    <div className={cx("h-1.5 w-full overflow-hidden rounded-full bg-surface-2", className)}>
      <div
        className={cx("h-full rounded-full transition-all duration-700", tone === "gold" ? "bg-gold" : "bg-forest")}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function Empty({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-line px-6 py-10 text-center">
      <div className="font-serif text-2xl text-ink">{title}</div>
      {body && <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-3">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open || typeof document === "undefined") return null;
  // Portal to <body> so a transformed/animated page can't trap or clip the sheet.
  return createPortal(
    <div className="fixed inset-0 z-[55] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fade-in relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-[28px] bg-bg p-6 pb-10 sm:rounded-[28px]">
        <div className="mb-4 flex items-center justify-between">
          <div className="font-serif text-2xl">{title}</div>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-ink-2">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

// ---- Voice to text (Web Speech API, where the browser supports it) ----
type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

export function useSpeechSupported() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    setOk(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);
  return ok;
}

export function VoiceButton({ onText }: { onText: (t: string) => void }) {
  const supported = useSpeechSupported();
  const [on, setOn] = useState(false);
  const rec = useRef<SpeechRec | null>(null);
  if (!supported) return null;
  const toggle = () => {
    if (on) {
      rec.current?.stop();
      return;
    }
    const w = window as unknown as Record<string, new () => SpeechRec>;
    const R = w.SpeechRecognition || w.webkitSpeechRecognition;
    const r = new R();
    r.lang = navigator.language || "en-US";
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (e) => {
      let t = "";
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) t += e.results[i][0].transcript;
      if (t.trim()) onText(t.trim());
    };
    r.onend = () => setOn(false);
    r.onerror = () => setOn(false);
    rec.current = r;
    r.start();
    setOn(true);
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={on ? "Stop dictation" : "Dictate"}
      title={on ? "Stop dictation" : "Speak instead of typing"}
      className={cx(
        "grid h-9 w-9 place-items-center rounded-full transition",
        on ? "animate-pulse bg-rose text-white" : "bg-surface-2 text-ink-2 hover:text-ink",
      )}
    >
      {on ? <MicOff size={16} /> : <Mic size={16} />}
    </button>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "gold" | "forest" | "rose" }) {
  const t = {
    neutral: "bg-surface-2 text-ink-2",
    gold: "bg-gold-soft text-ink",
    forest: "bg-forest-soft text-forest",
    rose: "bg-rose-soft text-rose",
  }[tone];
  return <span className={cx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", t)}>{children}</span>;
}

export function Notice({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "rose" | "forest" }) {
  const t = { gold: "border-gold/40 bg-gold-soft/50", rose: "border-rose/40 bg-rose-soft", forest: "border-forest/30 bg-forest-soft" }[tone];
  return <div className={cx("rounded-2xl border px-4 py-3 text-sm leading-relaxed text-ink-2", t)}>{children}</div>;
}
