"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Vault } from "./types";
import { emptyVault, migrate } from "./defaults";
import { deriveKey, newSalt, seal, unseal, unb64, type Sealed } from "./crypto";
import { clearAllMedia } from "./media";

const KEY = "elevate.vault.v1";

type Saved = { enc: false; data: Vault } | { enc: true; sealed: Sealed };

type Status = "loading" | "locked" | "ready";

interface Ctx {
  status: Status;
  vault: Vault;
  locked: boolean;
  hasLock: boolean;
  update: (fn: (v: Vault) => Vault) => void;
  unlock: (passcode: string) => Promise<boolean>;
  lockNow: () => void;
  setPasscode: (passcode: string) => Promise<void>;
  removePasscode: () => Promise<void>;
  sealForSync: () => Promise<Sealed | null>;
  importSealed: (s: Sealed, passcode?: string) => Promise<boolean>;
  replaceVault: (v: Vault) => void;
  wipeEverything: () => Promise<void>;
}

const StoreCtx = createContext<Ctx | null>(null);

function readSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [vault, setVault] = useState<Vault>(emptyVault);
  const [hasLock, setHasLock] = useState(false);
  const keyRef = useRef<{ key: CryptoKey; salt: Uint8Array } | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(vault);
  useEffect(() => {
    latest.current = vault;
  }, [vault]);

  useEffect(() => {
    const saved = readSaved();
    if (!saved) {
      setStatus("ready");
    } else if (saved.enc) {
      setHasLock(true);
      setStatus("locked");
    } else {
      setVault(migrate(saved.data));
      setStatus("ready");
    }
  }, []);

  const persist = useCallback(async (v: Vault) => {
    try {
      if (keyRef.current) {
        const sealed = await seal(keyRef.current.key, keyRef.current.salt, JSON.stringify(v));
        localStorage.setItem(KEY, JSON.stringify({ enc: true, sealed } satisfies Saved));
      } else {
        localStorage.setItem(KEY, JSON.stringify({ enc: false, data: v } satisfies Saved));
      }
      window.dispatchEvent(new CustomEvent("elevate:saved"));
    } catch (e) {
      console.warn("ELEVATE: could not save locally", e instanceof Error ? e.name : "error");
    }
  }, []);

  const update = useCallback(
    (fn: (v: Vault) => Vault) => {
      setVault((prev) => {
        const next = { ...fn(prev), updatedAt: new Date().toISOString() };
        latest.current = next;
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => persist(next), 250);
        return next;
      });
    },
    [persist],
  );

  // flush on hide
  useEffect(() => {
    const flush = () => {
      if (document.visibilityState === "hidden" && status === "ready") persist(latest.current);
    };
    document.addEventListener("visibilitychange", flush);
    return () => document.removeEventListener("visibilitychange", flush);
  }, [persist, status]);

  const unlock = useCallback(async (passcode: string) => {
    const saved = readSaved();
    if (!saved || !saved.enc) return true;
    try {
      const salt = unb64(saved.sealed.salt);
      const key = await deriveKey(passcode, salt);
      const data = JSON.parse(await unseal(key, saved.sealed)) as Vault;
      keyRef.current = { key, salt };
      setVault(migrate(data));
      setStatus("ready");
      return true;
    } catch {
      return false;
    }
  }, []);

  const lockNow = useCallback(() => {
    if (!keyRef.current) return;
    persist(latest.current).then(() => {
      keyRef.current = null;
      setVault(emptyVault());
      setStatus("locked");
    });
  }, [persist]);

  // auto-lock after being away
  useEffect(() => {
    if (!hasLock || status !== "ready") return;
    let hiddenAt = 0;
    const onVis = () => {
      if (document.visibilityState === "hidden") hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt > latest.current.settings.lockMinutes * 60_000) lockNow();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [hasLock, status, lockNow]);

  const setPasscode = useCallback(
    async (passcode: string) => {
      const salt = newSalt();
      keyRef.current = { key: await deriveKey(passcode, salt), salt };
      setHasLock(true);
      await persist(latest.current);
    },
    [persist],
  );

  const removePasscode = useCallback(async () => {
    keyRef.current = null;
    setHasLock(false);
    await persist(latest.current);
  }, [persist]);

  const sealForSync = useCallback(async () => {
    if (!keyRef.current) return null;
    return seal(keyRef.current.key, keyRef.current.salt, JSON.stringify(latest.current));
  }, []);

  const importSealed = useCallback(
    async (s: Sealed, passcode?: string) => {
      try {
        let key = keyRef.current?.key;
        const salt = unb64(s.salt);
        if (passcode) key = await deriveKey(passcode, salt);
        if (!key) return false;
        const data = migrate(JSON.parse(await unseal(key, s)));
        keyRef.current = { key, salt };
        setHasLock(true);
        setVault(data);
        setStatus("ready");
        await persist(data);
        return true;
      } catch {
        return false;
      }
    },
    [persist],
  );

  const replaceVault = useCallback(
    (v: Vault) => {
      const m = migrate(v);
      setVault(m);
      persist(m);
    },
    [persist],
  );

  const wipeEverything = useCallback(async () => {
    keyRef.current = null;
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("elevate."))
        .forEach((k) => localStorage.removeItem(k));
    } catch {}
    await clearAllMedia();
    setHasLock(false);
    setVault(emptyVault());
    setStatus("ready");
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      status,
      vault,
      locked: status === "locked",
      hasLock,
      update,
      unlock,
      lockNow,
      setPasscode,
      removePasscode,
      sealForSync,
      importSealed,
      replaceVault,
      wipeEverything,
    }),
    [status, vault, hasLock, update, unlock, lockNow, setPasscode, removePasscode, sealForSync, importSealed, replaceVault, wipeEverything],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside StoreProvider");
  return c;
}

export const useVault = () => useStore().vault;
