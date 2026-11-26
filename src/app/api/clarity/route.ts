import Anthropic from "@anthropic-ai/sdk";
import { authorize, aiConfigured, rateLimit } from "@/server/guard";
import { CLARITY_CORE, DIRECTNESS, STANCE, ROOM_MODES, REWRITE_SYSTEM, IDEA_SYSTEM, THERAPY_SYSTEM, WEEKLY_SYSTEM, VOICE_MODE, MANIFESTO_SYSTEM, companionBlock, type CompanionSettings } from "@/server/prompts";

// Privacy: this route never logs message content. Only error types are logged.

const MODEL = "claude-opus-5-5";
const MAX_CHARS = 60_000;

type Msg = { role: "user" | "assistant"; content: string };
interface Body {
  task: "chat" | "room" | "rewrite" | "idea" | "therapy" | "weekly" | "voice" | "manifesto" | "evening";
  messages?: Msg[];
  text?: string;
  stance?: string;
  mode?: string;
  directness?: string;
  context?: string;
  safety?: string[];
  styles?: string[];
  companion?: CompanionSettings;
}

const EVENING_SYSTEM = `Turn one woman's answers to an evening reflection into a short private journal entry in her own first-person voice (4 to 7 sentences). Use only what she wrote; don't invent. Keep her honesty, note one thing she handled well, and end with something to look forward to tomorrow. No headings, no emojis. If she mentions a lapse, be kind and practical, never shaming.`;

const FALLBACK = { betas: ["server-side-fallback-2026-07-01"] as Anthropic.Beta.AnthropicBeta[], fallbacks: "default" as const };

function client() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 2 });
}

function aboutHer(context?: string) {
  return context?.trim() ? `<about_her>\n${context.slice(0, 6000)}\n</about_her>` : "<about_her>She hasn't shared personal details with Clarity.</about_her>";
}

function safetyBlock(flags?: string[]) {
  if (!flags?.length) return "";
  return `\n\nIMPORTANT: The app's on-device safety screen flagged possible: ${flags.join(", ")}. Treat this as a safety moment. Follow your safety rules now: short, calm sentences; no challenge or toughness; encourage a sober trusted person and the right resource (911 / 988 / SAMHSA / DV hotline). Don't debate unusual beliefs.`;
}

function clip(messages: Msg[]) {
  const out: Msg[] = [];
  let total = 0;
  for (const m of [...messages].reverse()) {
    if (m.role !== "user" && m.role !== "assistant") continue;
    const c = String(m.content ?? "").slice(0, 20_000);
    if (!c.trim()) continue;
    total += c.length;
    if (total > MAX_CHARS) break;
    out.unshift({ role: m.role, content: c });
  }
  while (out.length && out[0].role !== "user") out.shift();
  return out;
}

function err(status: number, error: string) {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  if (!aiConfigured()) return err(503, "not_configured");
  const auth = await authorize(req);
  if (!auth.ok) return err(auth.status, auth.error);
  if (!rateLimit(auth.who)) return err(429, "Let's slow down for a minute. Try again shortly.");

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return err(400, "Bad request");
  }

  try {
    switch (body.task) {
      case "chat":
      case "room":
      case "voice":
        return streamReply(body);
      case "manifesto":
        return streamText(MANIFESTO_SYSTEM, String(body.text ?? "").slice(0, MAX_CHARS));
      case "evening":
        return streamText(EVENING_SYSTEM, String(body.text ?? "").slice(0, MAX_CHARS));
      case "rewrite":
        return Response.json(await rewrite(body));
      case "idea":
        return Response.json(await idea(body));
      case "therapy":
      case "weekly":
        return streamText(body.task === "therapy" ? THERAPY_SYSTEM : WEEKLY_SYSTEM, String(body.text ?? "").slice(0, MAX_CHARS));
      default:
        return err(400, "Unknown task");
    }
  } catch (e) {
    console.error("clarity route error:", e instanceof Anthropic.APIError ? `${e.status} ${e.name}` : e instanceof Error ? e.name : "unknown");
    if (e instanceof Anthropic.RateLimitError) return err(429, "Clarity is busy right now. Try again in a minute.");
    if (e instanceof Anthropic.AuthenticationError) return err(503, "Clarity's AI key isn't valid. Check ANTHROPIC_API_KEY.");
    return err(502, "Clarity couldn't respond just now.");
  }
}

function streamReply(body: Body) {
  const flagged = !!body.safety?.length;
  const directness = flagged ? DIRECTNESS.gentle : (DIRECTNESS[body.directness ?? "firm"] ?? DIRECTNESS.firm);
  const extra = body.task === "room" ? (ROOM_MODES[body.mode ?? ""] ?? "") : (STANCE[body.stance ?? ""] ?? "");
  const voice = body.task === "voice" ? VOICE_MODE : "";
  const system =
    [CLARITY_CORE, companionBlock(body.companion), directness, extra, voice, aboutHer(body.context)].filter(Boolean).join("\n\n") + safetyBlock(body.safety);
  const messages = body.task === "room" ? clip([{ role: "user", content: body.text ?? "" }]) : clip(body.messages ?? []);
  if (!messages.length) return err(400, "Nothing to respond to");
  // Voice favours speed: low effort keeps spoken replies quick.
  return streamMessages(system, messages, flagged || body.task === "voice" ? "low" : "medium", body.task === "voice" ? 1200 : 4000);
}

function streamText(system: string, text: string) {
  if (!text.trim()) return err(400, "Nothing to summarize");
  return streamMessages(system, [{ role: "user", content: text }], "medium");
}

function streamMessages(system: string, messages: Msg[], effort: "low" | "medium", maxTokens = 4000) {
  const stream = client().beta.messages.stream({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages,
    output_config: { effort },
    ...FALLBACK,
  });
  const enc = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") controller.enqueue(enc.encode(event.delta.text));
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal")
          controller.enqueue(enc.encode("\n\nI can't help with that one here. If you're in danger or thinking about hurting yourself, please call 911 or 988."));
      } catch (e) {
        console.error("clarity stream error:", e instanceof Error ? e.name : "unknown");
        controller.enqueue(enc.encode("\n\n[Clarity lost connection. Your words are saved.]"));
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}

async function json<T>(system: string, user: string, schema: Record<string, unknown>): Promise<T> {
  const res = await client().beta.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system,
    messages: [{ role: "user", content: user }],
    output_config: { effort: "low", format: { type: "json_schema", schema } },
    ...FALLBACK,
  });
  if (res.stop_reason === "refusal") throw new Error("refusal");
  const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  return JSON.parse(text) as T;
}

async function rewrite(body: Body) {
  const styles = (body.styles?.length ? body.styles : ["Calm and direct", "Emotionally honest", "Respectful but firm", "Boundary-setting", "Accountability-focused", "Apologetic", "Requesting space"]).slice(0, 8);
  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["flags", "versions", "notes"],
    properties: {
      flags: {
        type: "array",
        items: { type: "object", additionalProperties: false, required: ["phrase", "why"], properties: { phrase: { type: "string" }, why: { type: "string" } } },
      },
      versions: {
        type: "array",
        items: { type: "object", additionalProperties: false, required: ["style", "text"], properties: { style: { type: "string" }, text: { type: "string" } } },
      },
      notes: { type: "string" },
    },
  };
  const user = `Context about the recipient or situation (may be empty): ${String(body.context ?? "").slice(0, 2000)}\n\nHer draft message:\n"""${String(body.text ?? "").slice(0, 8000)}"""\n\nIdentify potentially escalating phrases (quote them exactly as "phrase"). Then write one version for each of these styles: ${styles.join("; ")}. Only include "Apologetic" if an apology seems appropriate; otherwise skip it. "notes" is one or two sentences of perspective (e.g. whether this might be better waiting until tomorrow).`;
  return json(REWRITE_SYSTEM, user, schema);
}

async function idea(body: Body) {
  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["kind", "title", "summary", "category", "milestones", "affirmation", "firstStep", "when", "withWho"],
    properties: {
      kind: { type: "string", enum: ["goal", "vision", "plan", "bucket", "habit", "note"] },
      title: { type: "string" },
      summary: { type: "string" },
      category: { type: "string" },
      milestones: { type: "array", items: { type: "string" } },
      affirmation: { type: "string" },
      firstStep: { type: "string" },
      when: { type: "string", description: "Suggested timing in words, e.g. 'this Saturday morning' or 'by next winter'" },
      withWho: { type: "string", enum: ["alone", "family", "partner", "friends"] },
    },
  };
  const user = `${aboutHer(body.context)}\n\nHer raw idea:\n"""${String(body.text ?? "").slice(0, 4000)}"""`;
  return json(IDEA_SYSTEM, user, schema);
}
