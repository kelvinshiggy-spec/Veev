"use client";

import { useEffect, useState } from "react";
import { Feather, Volume2, Square, Mic, Video, Image as ImageIcon, Download, Sparkles, Pencil, Check, RotateCcw } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, Card, Notice, PageHeader, Section, TextArea, Toggle } from "@/components/ui";
import { MediaView, PhotoPicker, Recorder, RemoveMediaButton } from "@/components/media";
import { useAiReady, AiErrorNote } from "@/components/ai-gate";
import { useCompanionName } from "@/components/companion-name";
import { draftManifesto, manifestoAnswers } from "@/lib/manifesto";
import { streamClarity, type AiError } from "@/lib/ai";
import { speakAsCompanion, stopSpeaking, speechSupported } from "@/lib/voice";
import { getMedia, removeMedia } from "@/lib/media";
import type { Manifesto } from "@/lib/types";
import { fmtDate } from "@/lib/util";
import { BRAND } from "@/lib/brand";

export default function ManifestoPage() {
  const { vault, update } = useStore();
  const m = vault.manifesto;
  const ready = useAiReady();
  const name = useCompanionName();
  const [editing, setEditing] = useState(!m.text);
  const [draft, setDraft] = useState(m.text || draftManifesto(vault.profile));
  const [title, setTitle] = useState(m.title);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AiError>();
  const [playing, setPlaying] = useState(false);
  const [rec, setRec] = useState<"audio" | "video" | null>(null);
  const [cardBusy, setCardBusy] = useState(false);

  useEffect(() => () => stopSpeaking(), []);

  const set = (patch: Partial<Manifesto>) => update((v) => ({ ...v, manifesto: { ...v.manifesto, ...patch, updatedAt: new Date().toISOString() } }));
  const save = (approve: boolean) => {
    set({ text: draft.trim(), title: title.trim() || "The Life I'm Building", approved: approve });
    setEditing(false);
  };

  const polish = async () => {
    setBusy(true);
    setError(undefined);
    const before = draft;
    const r = await streamClarity({ task: "manifesto", text: manifestoAnswers(vault.profile) + (before ? `\n\nMy current draft, to improve:\n${before}` : "") }, setDraft);
    setBusy(false);
    if (r.error) {
      setError(r.error);
      setDraft(before);
    }
  };

  const listen = () => {
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    speakAsCompanion(`${m.title}. ${m.text}`, vault.companion, { onEnd: () => setPlaying(false) });
  };

  const makeCard = async () => {
    setCardBusy(true);
    try {
      const blob = await renderCard(m, vault.profile.name, m.photoIds[0]);
      const file = new File([blob], "my-life-manifesto.png", { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
      if (nav.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: m.title });
      else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = file.name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      }
    } catch {}
    setCardBusy(false);
  };

  if (editing)
    return (
      <div>
        <PageHeader back="/future" eyebrow="My Life Manifesto" title="Write the life you're building." subtitle="Built from your own answers. Make every line sound like you, then approve it." />
        <Card className="space-y-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-transparent font-serif text-3xl outline-none" aria-label="Title" />
          <TextArea voice rows={16} value={draft} onChange={setDraft} />
        </Card>
        <div className="mt-4 space-y-2">
          {ready && (
            <Button variant="soft" full disabled={busy} onClick={polish}>
              <Sparkles size={15} /> {busy ? `${name} is writing…` : `Have ${name} write it beautifully`}
            </Button>
          )}
          <AiErrorNote error={error} />
          <Button variant="ghost" full onClick={() => setDraft(draftManifesto(vault.profile))}>
            <RotateCcw size={15} /> Start again from my answers
          </Button>
          <Notice>Nothing here is invented. If a line doesn&apos;t feel true, change it or delete it. It&apos;s yours.</Notice>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button variant="outline" onClick={() => save(false)} disabled={!draft.trim()}>
              Save draft
            </Button>
            <Button onClick={() => save(true)} disabled={!draft.trim()}>
              <Check size={15} /> Approve
            </Button>
          </div>
        </div>
      </div>
    );

  const lines = m.text.split("\n").filter((l) => l.trim());

  return (
    <div className="page-in">
      <PageHeader back="/future" eyebrow="My Life Manifesto" title=" " />
      {/* Editorial spread */}
      <article className="sunlit -mx-5 overflow-hidden px-6 pb-10 pt-8 sm:rounded-3xl">
        {m.photoIds.length > 0 && (
          <div className="-mx-6 -mt-8 mb-8 grid grid-cols-3 gap-1">
            {m.photoIds.slice(0, 3).map((id, i) => (
              <MediaView key={id} id={id} type="image" className={i === 0 ? "col-span-2 row-span-2 h-72 w-full object-cover" : "h-[142px] w-full object-cover"} />
            ))}
          </div>
        )}
        <div className="eyebrow">{BRAND.name} · The Manifesto Issue</div>
        <h1 className="mt-3 font-serif text-[46px] leading-[0.98] text-ink">{m.title}</h1>
        <div className="champagne-rule my-6 w-24" />
        <div className="space-y-4">
          {lines.map((l, i) => (
            <p key={i} className={i === 0 ? "drop-cap font-serif text-[23px] leading-snug text-ink" : i === lines.length - 1 ? "font-serif text-[23px] italic leading-snug text-forest" : "text-[17px] leading-relaxed text-ink-2"}>
              {l}
            </p>
          ))}
        </div>
        <div className="mt-8 text-xs uppercase tracking-[0.16em] text-ink-3">
          {vault.profile.name || "Me"} · {m.updatedAt ? fmtDate(m.updatedAt, { month: "long", year: "numeric" }) : ""}
          {!m.approved && " · Draft"}
        </div>
      </article>

      <div className="mt-6 grid grid-cols-2 gap-2">
        {speechSupported() && (
          <Button variant="soft" onClick={listen}>
            {playing ? <Square size={15} /> : <Volume2 size={15} />} {playing ? "Stop" : `${name} reads it`}
          </Button>
        )}
        <Button variant="soft" onClick={makeCard} disabled={cardBusy}>
          <Download size={15} /> {cardBusy ? "Making…" : "Make a card"}
        </Button>
        <Button variant="outline" onClick={() => { setDraft(m.text); setTitle(m.title); setEditing(true); }}>
          <Pencil size={15} /> Edit
        </Button>
        {!m.approved ? (
          <Button onClick={() => set({ approved: true })}>
            <Check size={15} /> Approve
          </Button>
        ) : (
          <Button variant="outline" href="/protect">
            <Feather size={15} /> Use in a craving
          </Button>
        )}
      </div>

      <Section title="In your own voice" className="mt-8">
        {m.recordingId ? (
          <Card>
            <p className="mb-2 text-sm text-ink-3">Your recording (the real you, not AI)</p>
            <MediaView id={m.recordingId} type={m.recordingType ?? "audio"} />
            <div className="mt-2">
              <RemoveMediaButton
                onClick={async () => {
                  await removeMedia(m.recordingId!);
                  set({ recordingId: undefined, recordingType: undefined });
                }}
              />
            </div>
          </Card>
        ) : rec ? (
          <Recorder
            kind={rec}
            onSaved={(id, type) => {
              set({ recordingId: id, recordingType: type });
              setRec(null);
            }}
          />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setRec("audio")}>
              <Mic size={15} /> Record audio
            </Button>
            <Button variant="outline" onClick={() => setRec("video")}>
              <Video size={15} /> Record video
            </Button>
          </div>
        )}
        <p className="mt-2 text-xs text-ink-3">Hearing your own sober voice on a hard night hits different.</p>
      </Section>

      <Section title="Photos">
        {m.photoIds.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2">
            {m.photoIds.map((id) => (
              <div key={id} className="relative">
                <MediaView id={id} type="image" className="h-24 w-full rounded-xl object-cover" />
                <button
                  onClick={async () => {
                    await removeMedia(id);
                    set({ photoIds: m.photoIds.filter((x) => x !== id) });
                  }}
                  className="absolute right-1 top-1 rounded-full bg-black/50 px-2 text-xs text-white"
                  aria-label="Remove photo"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {m.photoIds.length < 6 && <PhotoPicker label="Add a photo of your life" onSaved={(id) => set({ photoIds: [...m.photoIds, id] })} />}
        <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-3">
          <ImageIcon size={12} /> Stays on this device.
        </p>
      </Section>

      <Section title="Where it shows up">
        <Card>
          <Toggle checked={m.inMorning} onChange={(v) => set({ inMorning: v })} label="In my Morning Edition" />
          <p className="text-sm text-ink-3">It&apos;s also one tap away in &quot;I want a drink&quot;, and saved on this phone so it works offline.</p>
        </Card>
      </Section>
    </div>
  );
}

/** Draws a shareable editorial card on the device. Nothing is uploaded. */
async function renderCard(m: Manifesto, name: string, photoId?: string): Promise<Blob> {
  const W = 1080;
  const H = 1920;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#f8ebe0");
  bg.addColorStop(0.5, "#fffdf8");
  bg.addColorStop(1, "#edf3f8");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  let y = 150;
  if (photoId) {
    const blob = await getMedia(photoId).catch(() => undefined);
    if (blob) {
      const bmp = await createImageBitmap(blob);
      const h = 640;
      const s = Math.max(W / bmp.width, h / bmp.height);
      const sw = W / s;
      const sh = h / s;
      g.drawImage(bmp, (bmp.width - sw) / 2, (bmp.height - sh) / 2, sw, sh, 0, 0, W, h);
      y = h + 110;
    }
  }
  await document.fonts?.ready;
  const serif = getComputedStyle(document.body).getPropertyValue("--font-cormorant").trim() || "Georgia";
  g.fillStyle = "#a8854a";
  g.font = `500 30px ${getComputedStyle(document.body).fontFamily}`;
  g.fillText("VEEV · MY LIFE MANIFESTO", 90, y);
  y += 100;
  g.fillStyle = "#24251f";
  g.font = `400 92px ${serif}, Georgia, serif`;
  y = wrap(g, m.title, 90, y, W - 180, 96) + 40;
  g.fillStyle = "#d6b77a";
  g.fillRect(90, y, 160, 3);
  y += 80;
  g.fillStyle = "#3d3d35";
  const lines = m.text.split("\n").filter((l) => l.trim());
  let size = 44;
  const fits = () => {
    let yy = y;
    g.font = `400 ${size}px ${serif}, Georgia, serif`;
    for (const l of lines) yy = measureWrap(g, l, W - 180, size * 1.3, yy) + size * 0.55;
    return yy < H - 160;
  };
  while (!fits() && size > 24) size -= 2;
  g.font = `400 ${size}px ${serif}, Georgia, serif`;
  for (const l of lines) y = wrap(g, l, 90, y, W - 180, size * 1.3) + size * 0.55;
  g.fillStyle = "#736d60";
  g.font = `500 26px ${getComputedStyle(document.body).fontFamily}`;
  g.fillText((name || "").toUpperCase(), 90, H - 90);
  return new Promise((res) => c.toBlob((b) => res(b!), "image/png"));
}

function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
  const words = text.split(" ");
  let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (g.measureText(t).width > max && line) {
      g.fillText(line, x, y);
      y += lh;
      line = w;
    } else line = t;
  }
  if (line) g.fillText(line, x, y);
  return y + lh;
}

function measureWrap(g: CanvasRenderingContext2D, text: string, max: number, lh: number, y: number) {
  const words = text.split(" ");
  let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (g.measureText(t).width > max && line) {
      y += lh;
      line = w;
    } else line = t;
  }
  return y + lh;
}
