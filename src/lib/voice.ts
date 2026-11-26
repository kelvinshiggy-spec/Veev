"use client";

import { persona as getPersona, type Persona } from "@/data/personas";
import type { Companion } from "./types";

// Free, on-device voice. Speech synthesis and recognition come from the phone or browser.
// Nothing here records in the background: the microphone only opens when she taps to talk.

const NOVELTY =
  /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy|grandma|grandpa|rocko|shelley|flo|eddy|reed|sandy|eloquence/i;

export function speechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function recognitionSupported() {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!speechSupported()) return Promise.resolve([]);
  const now = speechSynthesis.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => resolve(speechSynthesis.getVoices());
    speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    setTimeout(done, 1500);
  });
}

/** Higher is better. Prefers the phone's Premium / Enhanced / neural voices, which sound far more natural. */
export function voiceQuality(v: SpeechSynthesisVoice) {
  const n = v.name;
  let q = 0;
  if (/premium/i.test(n)) q += 60;
  if (/enhanced/i.test(n)) q += 45;
  if (/natural|neural/i.test(n)) q += 50;
  if (/online/i.test(n)) q += 8;
  if (/google/i.test(n)) q += 20;
  if (/siri/i.test(n)) q += 30;
  if (v.localService) q += 2;
  if (NOVELTY.test(n)) q -= 200;
  return q;
}

export const isEnhanced = (v: SpeechSynthesisVoice) => voiceQuality(v) >= 40;

export function rankVoices(voices: SpeechSynthesisVoice[], p: Persona, accent?: string) {
  const lang = (accent || p.accent).toLowerCase();
  const english = voices.filter((v) => v.lang.toLowerCase().startsWith("en") && !NOVELTY.test(v.name));
  return english
    .map((v) => {
      let score = voiceQuality(v);
      const idx = p.voices.findIndex((name) => v.name.toLowerCase().includes(name.toLowerCase()));
      if (idx >= 0) score += 40 - idx * 3;
      if (v.lang.toLowerCase().replace("_", "-") === lang) score += 25;
      else if (accent) score -= 15;
      const male = /daniel|evan|nathan|tom|aaron|guy|arthur|fred|alex|oliver|rishi|male/i.test(v.name);
      if (p.gender === "female" && male) score -= 60;
      if (p.gender === "male" && !male) score -= 60;
      return { v, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.v);
}

export async function pickVoice(c: Pick<Companion, "persona" | "voiceURI">, accent?: string) {
  const voices = await loadVoices();
  if (c.voiceURI) {
    const chosen = voices.find((v) => v.voiceURI === c.voiceURI);
    if (chosen) return chosen;
  }
  return rankVoices(voices, getPersona(c.persona), accent)[0];
}

/** Text written for the screen, made pleasant to hear. */
export function forSpeech(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[*_#>`~]/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\b911\b/g, "9 1 1")
    .replace(/\b988\b/g, "9 8 8")
    .replace(/1-800-662-4357/g, "1 800, 6 6 2, 4 3 5 7")
    .replace(/\s+/g, " ")
    .trim();
}

/** Split into sentences so phones speak with natural pauses (and don't cut off long text). */
export function sentences(text: string) {
  const parts = forSpeech(text).match(/[^.!?…]+[.!?…]+["”’)]*\s*|[^.!?…]+$/g) ?? [];
  const out: string[] = [];
  for (const raw of parts) {
    const s = raw.trim();
    if (!s) continue;
    if (s.length > 220) out.push(...s.split(/(?<=[,;:])\s+/));
    else out.push(s);
  }
  return out;
}

export interface SpeakOptions {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onSentence?: (s: string, i: number) => void;
  onEnd?: (completed: boolean) => void;
}

let speakToken = 0;

/** Speaks sentence by sentence. Calling it again, or stopSpeaking(), interrupts. */
export function speak(text: string, o: SpeakOptions = {}) {
  if (!speechSupported()) {
    o.onEnd?.(false);
    return;
  }
  const token = ++speakToken;
  speechSynthesis.cancel();
  const list = sentences(text);
  if (!list.length) {
    o.onEnd?.(true);
    return;
  }
  let i = 0;
  const next = () => {
    if (token !== speakToken) return;
    if (i >= list.length) {
      o.onEnd?.(true);
      return;
    }
    const s = list[i];
    const u = new SpeechSynthesisUtterance(s);
    if (o.voice) {
      u.voice = o.voice;
      u.lang = o.voice.lang;
    }
    u.rate = o.rate ?? 1;
    u.pitch = o.pitch ?? 1;
    const idx = i;
    u.onstart = () => {
      if (token !== speakToken) return;
      if (idx === 0) o.onStart?.();
      o.onSentence?.(s, idx);
    };
    u.onend = () => {
      i++;
      // A short breath between sentences sounds more human than back-to-back speech.
      setTimeout(next, /[?!]$/.test(s) ? 140 : 90);
    };
    u.onerror = () => {
      if (token !== speakToken) return;
      i++;
      next();
    };
    speechSynthesis.speak(u);
  };
  next();
}

export function stopSpeaking() {
  speakToken++;
  if (speechSupported()) speechSynthesis.cancel();
}

export const isSpeaking = () => speechSupported() && (speechSynthesis.speaking || speechSynthesis.pending);

/** Speak with the companion's chosen voice and pace. */
export async function speakAsCompanion(text: string, c: Companion, o: Omit<SpeakOptions, "voice" | "rate" | "pitch"> = {}) {
  const p = getPersona(c.persona);
  const voice = await pickVoice(c);
  speak(text, { ...o, voice, rate: (p.rate * (c.rate || 1)), pitch: p.pitch });
}

// ── Listening ───────────────────────────────────────────

type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onspeechstart: (() => void) | null;
};

export interface Listener {
  stop: () => void;
  abort: () => void;
}

/**
 * One listening turn. Ends by itself when she pauses (the phone's own voice activity detection),
 * then calls onFinal with what she said.
 */
export function listenOnce(o: {
  lang?: string;
  onPartial?: (t: string) => void;
  onSpeechStart?: () => void;
  onFinal: (t: string) => void;
  onError?: (kind: "denied" | "no-speech" | "unsupported" | "error") => void;
}): Listener | null {
  const w = window as unknown as { SpeechRecognition?: new () => RecognitionLike; webkitSpeechRecognition?: new () => RecognitionLike };
  const R = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!R) {
    o.onError?.("unsupported");
    return null;
  }
  const r = new R();
  r.lang = o.lang || "en-US";
  r.continuous = false;
  r.interimResults = true;
  let finalText = "";
  let latest = "";
  let done = false;
  r.onspeechstart = () => o.onSpeechStart?.();
  r.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const res = e.results[i];
      if (res.isFinal) finalText += res[0].transcript;
      else interim += res[0].transcript;
    }
    latest = (finalText + " " + interim).trim();
    o.onPartial?.(latest);
  };
  r.onerror = (e) => {
    if (done) return;
    if (e.error === "not-allowed" || e.error === "service-not-allowed") {
      done = true;
      o.onError?.("denied");
    } else if (e.error === "no-speech") {
      done = true;
      o.onError?.("no-speech");
    } else if (e.error !== "aborted") {
      done = true;
      o.onError?.("error");
    }
  };
  r.onend = () => {
    if (done) return;
    done = true;
    const text = (finalText || latest).trim();
    if (text) o.onFinal(text);
    else o.onError?.("no-speech");
  };
  try {
    r.start();
  } catch {
    o.onError?.("error");
    return null;
  }
  return {
    stop: () => r.stop(),
    abort: () => {
      done = true;
      r.abort();
    },
  };
}

/** Is this an iPhone or iPad? Used only to show the right tip for better voices. */
export const isApple = () => typeof navigator !== "undefined" && /iphone|ipad|ipod|macintosh/i.test(navigator.userAgent);
