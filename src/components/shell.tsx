"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Sun, Sparkles, Route, Mountain, CircleUser, LifeBuoy, Hand, Wine, MessageCircle, Wind, Lock } from "lucide-react";
import { useStore } from "@/lib/store";
import { SafetyProvider, useSafety } from "./safety";
import { Sheet, Button, Input } from "./ui";
import { BRAND } from "@/lib/brand";
import { cx, haptic } from "@/lib/util";
import { ReminderRunner } from "./reminders";
import { SyncRunner } from "./sync-runner";
import { CheerBubble } from "./cheer";
import { useCompanionName } from "./companion-name";

const TABS = [
  { href: "/today", label: "Today", icon: Sun },
  { href: "/clarity", label: "Clarity", icon: Sparkles },
  { href: "/journey", label: "Journey", icon: Route },
  { href: "/future", label: "My Future", icon: Mountain },
  { href: "/me", label: "Me", icon: CircleUser },
];

function ThemeApplier() {
  const { vault } = useStore();
  const { theme, reducedMotion } = vault.settings;
  useEffect(() => {
    const root = document.documentElement;
    try {
      localStorage.setItem("veev.theme", theme);
      localStorage.setItem("veev.themeV2", "1");
    } catch {}
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const h = new Date().getHours();
      const dark = theme === "dark" || (theme === "auto" && (h >= 19 || h < 6)) || (theme === "system" && mq.matches);
      root.classList.toggle("dark", dark);
      const meta = document.querySelector('meta[name="theme-color"]');
      meta?.setAttribute("content", dark ? "#0f1512" : "#f7f3e9");
    };
    apply();
    mq.addEventListener("change", apply);
    const t = setInterval(apply, 60_000);
    return () => {
      mq.removeEventListener("change", apply);
      clearInterval(t);
    };
  }, [theme]);
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
  }, [reducedMotion]);
  return null;
}

function ServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}

function Wordmark() {
  return (
    <Link href="/today" className="flex items-baseline gap-2">
      <span className="font-serif text-[22px] tracking-[0.18em] text-ink">{BRAND.name}</span>
    </Link>
  );
}

function QuickActions({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const safety = useSafety();
  const go = (href: string) => {
    onClose();
    router.push(href);
  };
  const items = [
    { icon: Wine, title: "I want a drink", body: "Pause, breathe, protect what you're building.", on: () => go("/protect") },
    { icon: MessageCircle, title: "I need to talk", body: "Your companion, or one tap to your people.", on: () => go("/voice") },
    { icon: Wind, title: "Help me regulate", body: "Breathing, grounding, urge surfing.", on: () => go("/regulate") },
    {
      icon: LifeBuoy,
      title: "I need help",
      body: "Crisis lines and emergency support. Works offline.",
      on: () => {
        onClose();
        safety.open("menu");
      },
    },
  ];
  return (
    <Sheet open={open} onClose={onClose} title="Take a moment">
      <div className="space-y-2">
        {items.map((i) => (
          <button key={i.title} onClick={i.on} className="flex w-full items-center gap-4 rounded-2xl border border-line bg-surface p-4 text-left hover:border-gold">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-forest-soft text-forest">
              <i.icon size={20} strokeWidth={1.6} />
            </span>
            <span>
              <span className="block font-medium text-ink">{i.title}</span>
              <span className="block text-sm text-ink-3">{i.body}</span>
            </span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

function TopBar({ minimal }: { minimal?: boolean }) {
  const safety = useSafety();
  const { vault, hasLock, lockNow } = useStore();
  const [quick, setQuick] = useState(false);
  return (
    <>
      <div className="sticky top-0 z-40 border-b border-line/60 bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-5">
          <Wordmark />
          <div className="flex items-center gap-2">
            {hasLock && !minimal && (
              <button onClick={lockNow} aria-label="Lock now" className="grid h-9 w-9 place-items-center rounded-full text-ink-3 hover:bg-surface-2">
                <Lock size={16} />
              </button>
            )}
            {!minimal && (
              <button
                onClick={() => {
                  haptic(vault.settings.haptics);
                  setQuick(true);
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gold-soft px-3.5 text-sm font-medium text-ink"
              >
                <Hand size={15} /> Pause
              </button>
            )}
            <button
              onClick={() => safety.open("menu")}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-rose/40 px-3.5 text-sm font-medium text-rose"
            >
              <LifeBuoy size={15} /> Help
            </button>
          </div>
        </div>
      </div>
      <QuickActions open={quick} onClose={() => setQuick(false)} />
    </>
  );
}

function BottomNav() {
  const path = usePathname();
  const companion = useCompanionName();
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line/60 bg-bg/90 backdrop-blur-xl" aria-label="Main">
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {TABS.map((t) => {
          const on = path === t.href || path.startsWith(t.href + "/");
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={on ? "page" : undefined}
              className={cx("flex flex-col items-center justify-center gap-1 text-[10.5px] tracking-wide", on ? "text-forest" : "text-ink-3")}
            >
              <t.icon size={20} strokeWidth={on ? 1.9 : 1.5} />
              {t.href === "/clarity" ? companion : t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function LockScreen() {
  const { unlock } = useStore();
  const safety = useSafety();
  const [code, setCode] = useState("");
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    const ok = await unlock(code);
    setBusy(false);
    setErr(!ok);
    if (!ok) setCode("");
  };
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="w-full max-w-xs text-center">
        <div className="font-serif text-4xl tracking-[0.2em]">{BRAND.name}</div>
        <p className="mt-2 text-sm text-ink-3">Private. Only you can open this.</p>
        <form
          className="mt-8 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Input
            type="password"
            inputMode="text"
            autoComplete="current-password"
            autoFocus
            placeholder="Passcode"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="text-center"
            aria-label="Passcode"
          />
          {err && <div className="text-sm text-rose">That passcode didn't work.</div>}
          <Button full disabled={!code || busy} type="submit">
            {busy ? "Opening…" : "Open"}
          </Button>
        </form>
        <button onClick={() => safety.open("menu")} className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-rose">
          <LifeBuoy size={16} /> I need help now
        </button>
      </div>
    </div>
  );
}

function Gate({ children }: { children: ReactNode }) {
  const { status, vault } = useStore();
  const path = usePathname();
  const router = useRouter();
  const open = ["/welcome", "/help"].includes(path);
  const needsOnboarding = status === "ready" && !vault.profile.onboarded && !open;

  useEffect(() => {
    if (needsOnboarding) router.replace("/welcome");
  }, [needsOnboarding, router]);

  if (status === "loading")
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="font-serif text-3xl tracking-[0.2em] text-ink-3">{BRAND.name}</div>
      </div>
    );
  if (status === "locked" && path !== "/help") return <LockScreen />;
  if (needsOnboarding) return null;

  const bare = path === "/welcome";
  if (path === "/voice") return <>{children}</>; // full-screen; the page has its own Help and close buttons
  return (
    <>
      <TopBar minimal={bare} />
      <main className={cx("mx-auto max-w-lg px-5 pt-6", bare ? "pb-16" : "pb-28")}>{children}</main>
      {!bare && <BottomNav />}
      {!bare && <ReminderRunner />}
      <SyncRunner />
      {!bare && <CheerBubble />}
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SafetyProvider>
      <ThemeApplier />
      <ServiceWorker />
      <Gate>{children}</Gate>
    </SafetyProvider>
  );
}
