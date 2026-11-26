"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let sb: SupabaseClient | null | undefined;

export function supabase(): SupabaseClient | null {
  if (sb !== undefined) return sb;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  sb = url && key ? createClient(url, key, { auth: { persistSession: true, storageKey: "elevate.auth" } }) : null;
  return sb;
}

export async function accessToken(): Promise<string | null> {
  const c = supabase();
  if (!c) return null;
  const { data } = await c.auth.getSession();
  return data.session?.access_token ?? null;
}
