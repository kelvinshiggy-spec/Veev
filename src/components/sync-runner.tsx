"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { pushSealed, syncEnabled } from "@/lib/sync";
import { supabase } from "@/lib/supabase";

/** Pushes the encrypted vault to the cloud a few seconds after changes, if Veev turned sync on. */
export function SyncRunner() {
  const { sealForSync, hasLock } = useStore();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!supabase() || !hasLock) return;
    const onSaved = () => {
      if (!syncEnabled()) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        if (!navigator.onLine) return;
        const sealed = await sealForSync();
        if (sealed) {
          const r = await pushSealed(sealed);
          try {
            localStorage.setItem("veev.lastSync", r.error ? `error:${r.error}` : new Date().toISOString());
          } catch {}
        }
      }, 4000);
    };
    window.addEventListener("veev:saved", onSaved);
    return () => window.removeEventListener("veev:saved", onSaved);
  }, [sealForSync, hasLock]);
  return null;
}
