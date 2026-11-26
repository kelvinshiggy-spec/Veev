"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, Chips, Empty, Input, Label, PageHeader, Sheet, TextArea, Segmented, Pill } from "@/components/ui";
import { MediaView, PhotoPicker, Recorder, RemoveMediaButton } from "@/components/media";
import { MEMORY_CATEGORIES, MEMORY_PROMPTS } from "@/data/options";
import { fmtDate, uid } from "@/lib/util";
import { removeMedia } from "@/lib/media";
import type { Memory } from "@/lib/types";

export default function MemoriesPage() {
  return (
    <Suspense>
      <Memories />
    </Suspense>
  );
}

function Memories() {
  const { vault, update } = useStore();
  const params = useSearchParams();
  const [draft, setDraft] = useState<Memory | null>(null);
  const [kind, setKind] = useState<"write" | "photo" | "audio" | "video">("write");
  const [filter, setFilter] = useState<string[]>([]);

  const fresh = (): Memory => ({ id: uid(), category: "Beautiful ordinary day", title: "", body: "", prompt: MEMORY_PROMPTS[0], createdAt: new Date().toISOString() });
  useEffect(() => {
    if (params.get("new")) setDraft(fresh());
  }, [params]);

  const list = [...vault.memories].filter((m) => !filter.length || filter.includes(m.category)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <PageHeader
        back="/future"
        eyebrow="Remember this feeling"
        title="Your sober life, in your own voice."
        subtitle="Capture the good moments. On hard nights, they'll remind you what you're protecting."
        action={
          <button onClick={() => setDraft(fresh())} aria-label="New memory" className="grid h-11 w-11 place-items-center rounded-full bg-forest text-on-forest">
            <Plus size={18} />
          </button>
        }
      />
      {vault.memories.length > 0 && <Chips options={MEMORY_CATEGORIES} value={filter} onChange={(v) => setFilter(v.slice(-1))} className="mb-6" />}

      {list.length === 0 ? (
        <Empty title="Your first memory" body="A peaceful morning, a great workout, a family dinner, a clear head on a Saturday. Capture it while you feel it." action={<Button onClick={() => setDraft(fresh())}>Capture this feeling</Button>} />
      ) : (
        <ol className="relative space-y-6 border-l border-line pl-6">
          {list.map((m) => (
            <li key={m.id} className="relative">
              <span className="absolute -left-[29px] top-2 h-2.5 w-2.5 rounded-full bg-gold" />
              <div className="text-xs text-ink-3">{fmtDate(m.createdAt, { weekday: "short", month: "long", day: "numeric", year: "numeric" })}</div>
              <div className="card mt-2 p-4">
                <Pill tone="gold">{m.category}</Pill>
                {m.title && <div className="mt-2 font-serif text-xl">{m.title}</div>}
                {m.mediaId && m.mediaType && <MediaView id={m.mediaId} type={m.mediaType} className={m.mediaType === "image" ? "mt-3 w-full rounded-2xl" : "mt-3 w-full"} />}
                {m.prompt && m.body && <div className="mt-3 text-xs italic text-ink-3">{m.prompt}</div>}
                {m.body && <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed">{m.body}</p>}
                <button
                  onClick={() => {
                    if (m.mediaId) removeMedia(m.mediaId);
                    update((v) => ({ ...v, memories: v.memories.filter((x) => x.id !== m.id) }));
                  }}
                  className="mt-3 inline-flex items-center gap-1 text-xs text-ink-3 hover:text-rose"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <Sheet open={!!draft} onClose={() => setDraft(null)} title="Capture this feeling">
        {draft && (
          <div className="space-y-4">
            <Chips options={MEMORY_CATEGORIES} value={[draft.category]} multi={false} onChange={(v) => v[0] && setDraft({ ...draft, category: v[0] })} />
            <div>
              <Label>Title</Label>
              <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Sunday on the mountain" />
            </div>
            <Segmented
              value={kind}
              onChange={setKind}
              options={[
                { value: "write", label: "Write" },
                { value: "photo", label: "Photo" },
                { value: "audio", label: "Voice" },
                { value: "video", label: "Video" },
              ]}
            />
            {kind !== "write" &&
              (draft.mediaId ? (
                <div className="space-y-2">
                  <MediaView id={draft.mediaId} type={draft.mediaType!} className="w-full rounded-2xl" />
                  <RemoveMediaButton
                    onClick={() => {
                      removeMedia(draft.mediaId!);
                      setDraft({ ...draft, mediaId: undefined, mediaType: undefined });
                    }}
                  />
                </div>
              ) : kind === "photo" ? (
                <PhotoPicker onSaved={(id) => setDraft({ ...draft, mediaId: id, mediaType: "image" })} />
              ) : (
                <Recorder kind={kind} onSaved={(id, t) => setDraft({ ...draft, mediaId: id, mediaType: t })} />
              ))}
            <div>
              <Label hint="Pick a question, or just write.">Prompt</Label>
              <Chips options={MEMORY_PROMPTS} value={draft.prompt ? [draft.prompt] : []} multi={false} onChange={(v) => setDraft({ ...draft, prompt: v[0] })} />
            </div>
            <TextArea voice rows={5} value={draft.body} onChange={(v) => setDraft({ ...draft, body: v })} />
            <Button
              full
              disabled={!draft.title.trim() && !draft.body.trim() && !draft.mediaId}
              onClick={() => {
                update((v) => ({ ...v, memories: [...v.memories.filter((m) => m.id !== draft.id), draft] }));
                setDraft(null);
              }}
            >
              Keep this memory
            </Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
