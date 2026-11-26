"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { REMINDER_LINES } from "@/data/messages";
import { dayKey, pickOfDay } from "@/lib/util";
import { BRAND } from "@/lib/brand";

export async function showNotice(title: string, body: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return false;
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) await reg.showNotification(title, { body, icon: "/icon-192.png", badge: "/icon-192.png", tag: "veev" });
    else new Notification(title, { body, icon: "/icon-192.png" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Reminders fire while VEEV is open or recently backgrounded (browsers limit this).
 * Background push while fully closed would need a push service, which isn't configured.
 */
export function ReminderRunner() {
  const { vault, update } = useStore();
  const r = vault.reminders;

  useEffect(() => {
    if (!r.enabled) return;
    const tick = () => {
      const now = new Date();
      const today = dayKey(now);
      const hm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const lines = REMINDER_LINES[r.tone];
      const mins = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
      const inWindow = (t: string) => mins(hm) >= mins(t) && mins(hm) - mins(t) < 180;
      const due: { slot: string; title: string; body: string }[] = [];
      if (inWindow(r.morning) && r.lastShown.morning !== today)
        due.push({ slot: "morning", title: r.privateText ? BRAND.name : "Good morning", body: r.privateText ? "A moment for you." : pickOfDay(lines, 1) ?? "" });
      if (inWindow(r.evening) && r.lastShown.evening !== today)
        due.push({ slot: "evening", title: r.privateText ? BRAND.name : "This evening", body: r.privateText ? "A moment for you." : pickOfDay(lines, 2) ?? "" });
      if (r.friday && now.getDay() === 5 && inWindow("17:00") && r.lastShown.friday !== today)
        due.push({
          slot: "friday",
          title: r.privateText ? BRAND.name : "Friday evening",
          body: r.privateText ? "A moment for you." : "Friday plans? Make tonight something your future self will appreciate.",
        });
      if (!due.length) return;
      due.forEach((d) => showNotice(d.title, d.body));
      update((v) => ({
        ...v,
        reminders: { ...v.reminders, lastShown: { ...v.reminders.lastShown, ...Object.fromEntries(due.map((d) => [d.slot, today])) } },
      }));
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [r, update]);

  return null;
}
