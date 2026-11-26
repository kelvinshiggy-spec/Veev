"use client";

import { supabase } from "./supabase";
import type { Sealed } from "./crypto";

// Cloud sync stores ONLY the encrypted vault (ciphertext). The passcode-derived key never
// leaves the device, so the database owner cannot read journals, letters or conversations.
// Photos, voice notes and videos stay on the device and are not synced.

const FLAG = "veev.sync";
export const syncEnabled = () => {
  try {
    return localStorage.getItem(FLAG) === "1";
  } catch {
    return false;
  }
};
export const setSyncEnabled = (on: boolean) => {
  try {
    if (on) localStorage.setItem(FLAG, "1");
    else localStorage.removeItem(FLAG);
  } catch {}
};

export async function pushSealed(sealed: Sealed) {
  const sb = supabase();
  if (!sb) return { error: "Cloud sync isn't configured." };
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return { error: "Sign in first." };
  const { error } = await sb.from("vaults").upsert({ user_id: u.user.id, sealed, updated_at: new Date().toISOString() });
  return { error: error?.message };
}

export async function pullSealed(): Promise<{ sealed?: Sealed; updatedAt?: string; error?: string }> {
  const sb = supabase();
  if (!sb) return { error: "Cloud sync isn't configured." };
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return { error: "Sign in first." };
  const { data, error } = await sb.from("vaults").select("sealed, updated_at").eq("user_id", u.user.id).maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: "No saved copy in the cloud yet." };
  return { sealed: data.sealed as Sealed, updatedAt: data.updated_at as string };
}

export async function deleteAccount() {
  const sb = supabase();
  if (!sb) return { error: "Not configured" };
  const { error } = await sb.rpc("delete_my_account");
  if (!error) await sb.auth.signOut();
  return { error: error?.message };
}
