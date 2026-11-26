import "server-only";
import { createClient } from "@supabase/supabase-js";

export const aiConfigured = () => !!process.env.ANTHROPIC_API_KEY;
export const supabaseConfigured = () => !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/**
 * Who may call the AI route. The API key costs money and must not be usable by strangers.
 * - With Supabase: a valid signed-in session is required.
 * - Otherwise: the request must carry VEEV_ACCESS_CODE (entered once in the app's settings).
 * - Local development with neither configured is allowed.
 */
export async function authorize(req: Request): Promise<{ ok: true; who: string } | { ok: false; status: number; error: string }> {
  if (supabaseConfigured()) {
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return { ok: false, status: 401, error: "Please sign in to use Clarity." };
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false },
    });
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data.user) return { ok: false, status: 401, error: "Your session expired. Please sign in again." };
    const allowed = process.env.VEEV_ALLOWED_EMAILS?.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (allowed?.length && !allowed.includes((data.user.email ?? "").toLowerCase()))
      return { ok: false, status: 403, error: "This account isn't allowed to use Clarity on this deployment." };
    return { ok: true, who: data.user.id };
  }
  const code = process.env.VEEV_ACCESS_CODE;
  if (code) {
    if (req.headers.get("x-veev-access") !== code) return { ok: false, status: 401, error: "Enter your access code in Me → Privacy to use Clarity." };
    return { ok: true, who: "access-code" };
  }
  if (process.env.NODE_ENV !== "production") return { ok: true, who: "dev" };
  return { ok: false, status: 503, error: "Clarity isn't locked down yet. Set VEEV_ACCESS_CODE or Supabase on the server." };
}

// Simple in-memory rate limit (per server instance). Good enough for a personal app.
const hits = new Map<string, number[]>();
export function rateLimit(key: string, max = 40, windowMs = 60_000) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length <= max;
}
