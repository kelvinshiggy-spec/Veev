"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mic, Sparkles, ChevronDown, Camera, Heart, Trash2, Wand2, Headphones } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, Card, PageHeader, Section, TextArea } from "@/components/ui";
import { useCompanionName } from "@/components/companion-name";
import { useAiReady, AiErrorNote } from "@/components/ai-gate";
import { MediaView, PhotoPicker } from "@/components/media";
import { cheer } from "@/components/cheer";
import { EDIT, editTab, type EditTab } from "@/data/edit";
import { buildContext, companionPayload, streamClarity, type AiError } from "@/lib/ai";
import { getMedia, removeMedia } from "@/lib/media";
import { addTodos } from "@/lib/todos";
import { cx, pickOfDay, uid } from "@/lib/util";

const STUDIO: Partial<Record<EditTab, { title: string; hint: string; modes: string[] }>> = {
  fashion: {
    title: "Fit check",
    hint: "Snap a mirror pic, a piece from your closet, or an outfit you're unsure about.",
    modes: ["Rate my fit", "Style this piece 3 ways", "What goes with this?", "Make it more classy", "Make it night-out ready"],
  },
  beauty: { title: "Glam check", hint: "A selfie or your makeup bag. Get looks to try.", modes: ["Makeup look for this outfit", "Hair ideas for this look", "Rate my glam", "Soft glam version"] },
  home: { title: "Room glow-up", hint: "A photo of a corner, your bed, your desk.", modes: ["Glow up my space", "Make it feel five-star", "Cozy version"] },
  cars: { title: "Car vibe check", hint: "Your car, inside or out, or a dream car pic.", modes: ["Make my car feel luxe", "Describe this car's vibe"] },
};

export default function EditPage() {
  return (
    <Suspense>
      <Edit />
    </Suspense>
  );
}

function Edit() {
  const params = useSearchParams();
  const router = useRouter();
  const tab = editTab(params.get("tab"));
  const cn = useCompanionName();
  const { vault, update } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  const [shift, setShift] = useState(0);
  const pickNow = tab.picks[((pickOfDay(tab.picks.map((_, i) => i), 41) ?? 0) + shift) % tab.picks.length];
  const studio = STUDIO[tab.id];

  return (
    <div className="page-in">
      <PageHeader back="/future" eyebrow="The Edit · The Hot List" title={tab.headline} subtitle="Your glam little magazine, starring you. Fun first, always." />

      <div className="no-scrollbar -mx-5 mb-5 flex gap-2 overflow-x-auto px-5">
        {EDIT.map((e) => (
          <button
            key={e.id}
            onClick={() => router.replace(`/edit?tab=${e.id}`, { scroll: false })}
            className={cx("shrink-0 rounded-full border px-4 py-2 text-sm transition active:scale-95", e.id === tab.id ? "border-forest bg-forest text-on-forest" : "border-line bg-surface text-ink-2")}
          >
            {e.emoji} {e.label}
          </button>
        ))}
        <Link href="/future/vibes" className="shrink-0 rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink-2">
          🎧 Watch & listen
        </Link>
      </div>

      {/* Vylie chimes in */}
      <div key={tab.id} className="bubble-in mb-5 flex items-start gap-3">
        <span className="float-slow mt-1 h-10 w-10 shrink-0 rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, #fff 0%, #f7f3e9 18%, #eac8ae 42%, #a9c5b4 72%, #2b5443 100%)" }} aria-hidden />
        <div className="rounded-2xl rounded-tl-md bg-surface-2 px-4 py-3">
          <div className="text-[11px] uppercase tracking-wider text-ink-3">{cn}</div>
          <div className="font-serif text-[19px] leading-snug">{pickOfDay(tab.vylie, 43)}</div>
        </div>
      </div>

      {/* Today's pick */}
      <Card className="sunlit">
        <div className="flex items-center justify-between">
          <div className="eyebrow">Today&apos;s pick</div>
          <button onClick={() => setShift((s) => s + 1)} className="text-xs text-ink-3 underline-offset-2 hover:underline">
            Another
          </button>
        </div>
        <p key={pickNow} className="bubble-in mt-2 font-serif text-[26px] leading-tight">{pickNow}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => {
              update((v) => addTodos(v, [pickNow]));
              cheer("newThing");
            }}
            className="rounded-full bg-surface px-3 py-1.5 text-sm"
          >
            + Add to today
          </button>
          <Link href={`/voice?topic=${tab.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3 py-1.5 text-sm text-on-forest">
            <Mic size={13} /> Chat {tab.label.toLowerCase()} with {cn}
          </Link>
        </div>
      </Card>

      {studio && <Studio tab={tab.id} {...studio} />}

      <Section title="Stories" className="mt-6">
        <div className="space-y-2">
          {tab.stories.map((st) => {
            const isOpen = open === st.title;
            return (
              <div key={st.title} className="card overflow-hidden">
                <button onClick={() => setOpen(isOpen ? null : st.title)} className="flex w-full items-center justify-between gap-3 p-4 text-left">
                  <span>
                    <span className="block font-serif text-[21px] leading-tight">{st.title}</span>
                    <span className="text-sm text-ink-3">{st.dek}</span>
                  </span>
                  <ChevronDown size={18} className={cx("shrink-0 text-ink-3 transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <ul className="fade-in space-y-1.5 px-4 pb-4 text-[15px] text-ink-2">
                    {st.points.map((p) => (
                      <li key={p}>· {p}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {tab.id === "fashion" && vault.lookbook.some((l) => l.saved) && <MoodBoard />}

      <Link href="/future/vibes" className="card mt-2 flex items-center gap-3 p-4">
        <Headphones size={18} className="text-gold" />
        <div>
          <div className="font-medium">Watch & listen</div>
          <div className="text-sm text-ink-3">Movies and music for your mood</div>
        </div>
      </Link>
    </div>
  );
}

async function toBase64(mediaId: string, max = 1024): Promise<string | null> {
  const blob = await getMedia(mediaId);
  if (!blob) return null;
  const bmp = await createImageBitmap(blob);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.82).split(",")[1] ?? null;
}

function Studio({ tab, title, hint, modes }: { tab: EditTab; title: string; hint: string; modes: string[] }) {
  const { vault, update } = useStore();
  const cn = useCompanionName();
  const ready = useAiReady();
  const items = vault.lookbook.filter((l) => l.tab === tab).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const [active, setActive] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState("");
  const [error, setError] = useState<AiError>();
  const cur = items.find((l) => l.id === active) ?? items[0];

  const ask = async (mode: string, ids: string[]) => {
    setBusy(true);
    setError(undefined);
    setLive("");
    const images = (await Promise.all(ids.map((id) => toBase64(id).catch(() => null)))).filter(Boolean) as string[];
    const r = await streamClarity({ task: "style", mode, text: note, images, context: buildContext(vault), companion: companionPayload(vault) }, setLive);
    setBusy(false);
    if (r.error) return setError(r.error);
    if (cur) update((v) => ({ ...v, lookbook: v.lookbook.map((l) => (l.id === cur.id ? { ...l, feedback: r.text.trim(), note } : l)) }));
  };

  const remove = async (id: string, mediaId: string) => {
    update((v) => ({ ...v, lookbook: v.lookbook.filter((l) => l.id !== id) }));
    await removeMedia(mediaId).catch(() => {});
    setActive(null);
  };

  return (
    <Section title={title} className="mt-6">
      <Card>
        <p className="text-sm text-ink-3">{hint}</p>
        {items.length > 0 && (
          <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
            {items.map((l) => (
              <button key={l.id} onClick={() => { setActive(l.id); setLive(""); }} className={cx("relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border-2", cur?.id === l.id ? "border-gold" : "border-transparent")}>
                <MediaView id={l.mediaId} type="image" className="h-full w-full object-cover" />
                {l.saved && <Heart size={12} className="absolute right-1 top-1 fill-rose text-rose" />}
              </button>
            ))}
          </div>
        )}
        <div className="mt-3">
          <PhotoPicker
            label={items.length ? "Add another photo" : "Upload a photo"}
            onSaved={(mediaId) => {
              const item = { id: uid(), mediaId, tab, createdAt: new Date().toISOString() };
              update((v) => ({ ...v, lookbook: [...v.lookbook, item] }));
              setActive(item.id);
              setLive("");
            }}
          />
        </div>

        {cur && (
          <div className="mt-4 space-y-3">
            <div className="overflow-hidden rounded-2xl">
              <MediaView id={cur.mediaId} type="image" className="max-h-[420px] w-full object-cover" />
            </div>
            <div className="flex items-center gap-3 text-sm">
              <button onClick={() => update((v) => ({ ...v, lookbook: v.lookbook.map((l) => (l.id === cur.id ? { ...l, saved: !l.saved } : l)) }))} className="inline-flex items-center gap-1.5 text-ink-2">
                <Heart size={14} className={cur.saved ? "fill-rose text-rose" : ""} /> {cur.saved ? "On my mood board" : "Save to mood board"}
              </button>
              <button onClick={() => remove(cur.id, cur.mediaId)} className="ml-auto inline-flex items-center gap-1 text-ink-3 hover:text-rose">
                <Trash2 size={13} /> Remove
              </button>
            </div>

            {ready ? (
              <>
                <TextArea rows={2} value={note} onChange={setNote} placeholder="Optional: where you're going, the vibe you want…" />
                <div className="flex flex-wrap gap-2">
                  {modes.map((m) => (
                    <button key={m} disabled={busy} onClick={() => ask(m, [cur.mediaId])} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-sm active:scale-95 disabled:opacity-50">
                      <Wand2 size={13} className="text-gold" /> {m}
                    </button>
                  ))}
                  {tab === "fashion" && items.length > 1 && (
                    <button
                      disabled={busy}
                      onClick={() => ask("Build me 2 outfits using pieces from these photos of my clothes", items.slice(0, 4).map((l) => l.mediaId))}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gold bg-gold-soft px-3 py-1.5 text-sm active:scale-95 disabled:opacity-50"
                    >
                      <Sparkles size={13} /> Build outfits from my closet
                    </button>
                  )}
                </div>
                <AiErrorNote error={error} />
                {(busy || live || cur.feedback) && (
                  <div className="bubble-in rounded-2xl bg-surface-2 p-4 text-[15px] leading-relaxed whitespace-pre-wrap">
                    <div className="mb-1 text-[11px] uppercase tracking-wider text-ink-3">{cn}</div>
                    {live || cur.feedback || "Okay, let me look…"}
                  </div>
                )}
                <p className="text-xs text-ink-3">Photos stay on your phone. When you ask {cn}, that photo is sent privately to the AI for feedback and isn&apos;t kept there.</p>
              </>
            ) : (
              <p className="text-sm text-ink-3">
                Turn on {cn}&apos;s AI in <Link href="/me/privacy" className="underline">Me → Privacy</Link> to get style feedback on your photos. Your mood board works either way.
              </p>
            )}
          </div>
        )}
      </Card>
      {!items.length && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-3">
          <Camera size={12} /> Tip: photos of single pieces on your bed work great for &ldquo;Build outfits from my closet&rdquo;.
        </p>
      )}
    </Section>
  );
}

function MoodBoard() {
  const { vault } = useStore();
  const saved = vault.lookbook.filter((l) => l.saved);
  return (
    <Section title="My mood board">
      <div className="grid grid-cols-3 gap-2">
        {saved.map((l) => (
          <div key={l.id} className="aspect-[3/4] overflow-hidden rounded-xl">
            <MediaView id={l.mediaId} type="image" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    </Section>
  );
}
