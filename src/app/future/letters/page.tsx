"use client";

import { useState } from "react";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, Card, Label, Notice, PageHeader, Sheet, TextArea, Input, Segmented } from "@/components/ui";
import { MediaView, Recorder, RemoveMediaButton } from "@/components/media";
import { LETTER_SITUATIONS } from "@/data/options";
import { fmtDate, uid } from "@/lib/util";
import { removeMedia } from "@/lib/media";
import type { Letter } from "@/lib/types";

export default function Letters() {
  const { vault, update } = useStore();
  const [editing, setEditing] = useState<Letter | null>(null);
  const [reading, setReading] = useState<Letter | null>(null);
  const [format, setFormat] = useState<"write" | "audio" | "video">("write");

  const blank = (situation: string): Letter => ({ id: uid(), situation, title: "", body: "", createdAt: new Date().toISOString(), openedCount: 0 });
  const save = (l: Letter) => {
    update((v) => ({ ...v, letters: [...v.letters.filter((x) => x.id !== l.id), l] }));
    setEditing(null);
  };
  const open = (l: Letter) => {
    setReading(l);
    update((v) => ({ ...v, letters: v.letters.map((x) => (x.id === l.id ? { ...x, openedCount: x.openedCount + 1 } : x)) }));
  };
  const custom = [...new Set(vault.letters.map((l) => l.situation))].filter((s) => !LETTER_SITUATIONS.includes(s));

  return (
    <div>
      <PageHeader back="/future" eyebrow="Letters from my sober self" title="Words for the moments you'll need them." />
      <Notice>
        Write these on calm, clear days. When a hard moment comes, they&apos;ll be waiting in your own voice. VEEV never writes these for you.
      </Notice>

      <div className="mt-6 space-y-2">
        {[...LETTER_SITUATIONS, ...custom].map((sit) => {
          const mine = vault.letters.filter((l) => l.situation === sit);
          return (
            <Card key={sit} className="!p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {mine.length ? <MailOpen size={18} className="text-gold" /> : <Mail size={18} className="text-ink-3" />}
                  <span className="text-[15px]">{sit}</span>
                </div>
                <Button size="sm" variant={mine.length ? "ghost" : "soft"} onClick={() => setEditing(blank(sit))}>
                  {mine.length ? "Add" : "Write"}
                </Button>
              </div>
              {mine.length > 0 && (
                <div className="mt-3 space-y-1 pl-8">
                  {mine.map((l) => (
                    <button key={l.id} onClick={() => open(l)} className="block w-full truncate text-left text-sm text-forest underline-offset-2 hover:underline">
                      {l.title || (l.mediaType ? `${l.mediaType === "audio" ? "Voice" : "Video"} letter` : l.body.slice(0, 50))} · {fmtDate(l.createdAt)}
                    </button>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
      <Button variant="ghost" full className="mt-3" onClick={() => setEditing(blank("Open when "))}>
        Write for another moment
      </Button>

      <Sheet open={!!editing} onClose={() => setEditing(null)} title="A letter to future you">
        {editing && (
          <div className="space-y-4">
            <div>
              <Label>Open when…</Label>
              <Input value={editing.situation} onChange={(e) => setEditing({ ...editing, situation: e.target.value })} />
            </div>
            <div>
              <Label>Title (optional)</Label>
              <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <Segmented
              value={format}
              onChange={setFormat}
              options={[
                { value: "write", label: "Write" },
                { value: "audio", label: "Voice" },
                { value: "video", label: "Video" },
              ]}
            />
            {format === "write" ? (
              <TextArea voice rows={9} value={editing.body} onChange={(v) => setEditing({ ...editing, body: v })} placeholder="Dear me…" />
            ) : editing.mediaId ? (
              <div className="space-y-2">
                <MediaView id={editing.mediaId} type={editing.mediaType!} />
                <RemoveMediaButton
                  onClick={() => {
                    removeMedia(editing.mediaId!);
                    setEditing({ ...editing, mediaId: undefined, mediaType: undefined });
                  }}
                />
              </div>
            ) : (
              <Recorder kind={format} onSaved={(id, type) => setEditing({ ...editing, mediaId: id, mediaType: type })} />
            )}
            <Button full disabled={!editing.body.trim() && !editing.mediaId} onClick={() => save(editing)}>
              Seal this letter
            </Button>
          </div>
        )}
      </Sheet>

      <Sheet open={!!reading} onClose={() => setReading(null)} title={reading?.situation}>
        {reading && (
          <div className="space-y-4">
            {reading.title && <div className="font-serif text-2xl">{reading.title}</div>}
            {reading.body && <p className="whitespace-pre-wrap font-serif text-xl leading-relaxed">{reading.body}</p>}
            {reading.mediaId && reading.mediaType && <MediaView id={reading.mediaId} type={reading.mediaType} />}
            <div className="text-xs text-ink-3">Written {fmtDate(reading.createdAt, { month: "long", day: "numeric", year: "numeric" })}</div>
            <div className="flex gap-2">
              <Button size="sm" variant="soft" onClick={() => (setEditing(reading), setReading(null))}>
                Edit
              </Button>
              <button
                onClick={() => {
                  if (reading.mediaId) removeMedia(reading.mediaId);
                  update((v) => ({ ...v, letters: v.letters.filter((l) => l.id !== reading.id) }));
                  setReading(null);
                }}
                className="ml-auto inline-flex items-center gap-1 text-xs text-ink-3 hover:text-rose"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
