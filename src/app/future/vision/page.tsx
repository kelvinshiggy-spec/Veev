"use client";

import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, Chips, Input, Label, PageHeader, Progress, Sheet, TextArea, Segmented, Empty } from "@/components/ui";
import { MediaView, PhotoPicker, RemoveMediaButton } from "@/components/media";
import { VISION_CATEGORIES } from "@/data/options";
import { cx, fmtDate, uid } from "@/lib/util";
import { removeMedia } from "@/lib/media";
import type { VisionItem } from "@/lib/types";

const DAY = [
  ["wake", "Waking up", "Where are you? What does the light look like? How do you feel?"],
  ["morning", "Morning", "Coffee, movement, getting ready. What's your routine?"],
  ["day", "The day", "Work, purpose, the people you spend it with."],
  ["evening", "Evening", "Dinner, family, a beautiful home, how you unwind."],
  ["night", "Going to sleep", "What are you grateful for? How does your mind feel?"],
] as const;

const progressOf = (i: VisionItem) => (i.milestones.length ? Math.round((i.milestones.filter((m) => m.done).length / i.milestones.length) * 100) : i.progress);

export default function Vision() {
  const { vault, update } = useStore();
  const [tab, setTab] = useState<"board" | "day">("board");
  const [cat, setCat] = useState<string[]>([]);
  const [edit, setEdit] = useState<VisionItem | null>(null);
  const [ms, setMs] = useState("");
  const items = vault.vision.filter((v) => !cat.length || cat.includes(v.category));

  const blank = (): VisionItem => ({ id: uid(), category: cat[0] ?? "Dream home", title: "", note: "", affirmation: "", progress: 0, milestones: [], createdAt: new Date().toISOString() });
  const save = (i: VisionItem) => update((v) => ({ ...v, vision: [...v.vision.filter((x) => x.id !== i.id), i] }));

  return (
    <div>
      <PageHeader
        back="/future"
        eyebrow="My Future"
        title="The life you're building."
        subtitle="Motivation, not pressure. You're worth this whether or not every piece arrives on schedule."
      />
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: "board", label: "Vision board" },
          { value: "day", label: "A day in my future life" },
        ]}
      />

      {tab === "board" ? (
        <>
          <Chips options={VISION_CATEGORIES} value={cat} onChange={(v) => setCat(v.slice(-1))} className="mt-5" />
          <div className="mt-5">
            {items.length === 0 ? (
              <Empty title="Start your board" body="A home, a car, a ski chalet, a calm mind, a family table. Add a photo and a few milestones." action={<Button onClick={() => setEdit(blank())}>Add to my board</Button>} />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {items.map((i) => (
                  <button key={i.id} onClick={() => setEdit(i)} className="card overflow-hidden text-left">
                    {i.imageId ? (
                      <MediaView id={i.imageId} type="image" className="aspect-[4/5] w-full object-cover" />
                    ) : (
                      <div className="flex aspect-[4/5] w-full items-end bg-gradient-to-br from-gold-soft via-bg-2 to-forest-soft p-3">
                        <span className="font-serif text-2xl leading-tight text-ink">{i.title}</span>
                      </div>
                    )}
                    <div className="p-3">
                      <div className="eyebrow !text-[9.5px]">{i.category}</div>
                      <div className="mt-1 line-clamp-2 text-sm font-medium">{i.title}</div>
                      <Progress value={progressOf(i)} className="mt-2" />
                    </div>
                  </button>
                ))}
                <button onClick={() => setEdit(blank())} className="grid aspect-[4/5] place-items-center rounded-[22px] border border-dashed border-line text-ink-3">
                  <Plus size={22} />
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="mt-6 space-y-6">
          {DAY.map(([k, t, hint]) => (
            <div key={k}>
              <div className="font-serif text-2xl">{t}</div>
              <div className="mb-2 text-sm text-ink-3">{hint}</div>
              <TextArea voice rows={3} value={vault.futureDay[k] ?? ""} onChange={(val) => update((v) => ({ ...v, futureDay: { ...v.futureDay, [k]: val } }))} />
            </div>
          ))}
          <p className="text-center font-serif text-lg italic text-ink-2">Every clear day is a rehearsal for this one.</p>
        </div>
      )}

      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.title || "New vision"}>
        {edit && (
          <div className="space-y-4">
            {edit.imageId ? (
              <div className="space-y-2">
                <MediaView id={edit.imageId} type="image" className="max-h-72 w-full rounded-2xl object-cover" />
                <RemoveMediaButton
                  onClick={() => {
                    removeMedia(edit.imageId!);
                    setEdit({ ...edit, imageId: undefined });
                  }}
                />
              </div>
            ) : (
              <PhotoPicker label="Add an inspiring photo" onSaved={(id) => setEdit({ ...edit, imageId: id })} />
            )}
            <Chips options={VISION_CATEGORIES} value={[edit.category]} multi={false} onChange={(v) => v[0] && setEdit({ ...edit, category: v[0] })} />
            <div>
              <Label>What is it?</Label>
              <Input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} placeholder="A light-filled home near the mountains" />
            </div>
            <div>
              <Label>Affirmation</Label>
              <Input value={edit.affirmation} onChange={(e) => setEdit({ ...edit, affirmation: e.target.value })} placeholder="I am building a peaceful, beautiful home." />
            </div>
            <div>
              <Label>Notes</Label>
              <TextArea rows={3} value={edit.note} onChange={(v) => setEdit({ ...edit, note: v })} />
            </div>
            <div>
              <Label>Target date (optional)</Label>
              <Input type="date" value={edit.targetDate ?? ""} onChange={(e) => setEdit({ ...edit, targetDate: e.target.value || undefined })} />
            </div>
            <div>
              <Label>Milestones</Label>
              <div className="space-y-2">
                {edit.milestones.map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <button
                      onClick={() => setEdit({ ...edit, milestones: edit.milestones.map((x) => (x.id === m.id ? { ...x, done: !x.done } : x)) })}
                      className={cx("grid h-6 w-6 shrink-0 place-items-center rounded-full border", m.done ? "border-forest bg-forest text-on-forest" : "border-line")}
                      aria-label={m.done ? "Mark not done" : "Mark done"}
                    >
                      {m.done && <Check size={13} />}
                    </button>
                    <span className={cx("flex-1 text-[15px]", m.done && "text-ink-3 line-through")}>{m.text}</span>
                    <button onClick={() => setEdit({ ...edit, milestones: edit.milestones.filter((x) => x.id !== m.id) })} className="text-ink-3" aria-label="Remove milestone">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input value={ms} onChange={(e) => setMs(e.target.value)} placeholder="Add a milestone" onKeyDown={(e) => {
                    if (e.key === "Enter" && ms.trim()) {
                      setEdit({ ...edit, milestones: [...edit.milestones, { id: uid(), text: ms.trim(), done: false }] });
                      setMs("");
                    }
                  }} />
                  <Button
                    variant="soft"
                    onClick={() => {
                      if (!ms.trim()) return;
                      setEdit({ ...edit, milestones: [...edit.milestones, { id: uid(), text: ms.trim(), done: false }] });
                      setMs("");
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
            {!edit.milestones.length && (
              <div>
                <Label>Progress {edit.progress}%</Label>
                <input type="range" min={0} max={100} step={5} value={edit.progress} onChange={(e) => setEdit({ ...edit, progress: Number(e.target.value) })} className="w-full accent-[var(--gold)]" />
              </div>
            )}
            {edit.targetDate && <p className="text-sm text-ink-3">Aiming for {fmtDate(edit.targetDate, { month: "long", year: "numeric" })}. Gently.</p>}
            <Button
              full
              disabled={!edit.title.trim()}
              onClick={() => {
                save(edit);
                setEdit(null);
              }}
            >
              Save
            </Button>
            {vault.vision.some((x) => x.id === edit.id) && (
              <button
                onClick={() => {
                  if (edit.imageId) removeMedia(edit.imageId);
                  update((v) => ({ ...v, vision: v.vision.filter((x) => x.id !== edit.id) }));
                  setEdit(null);
                }}
                className="w-full py-2 text-sm text-ink-3 hover:text-rose"
              >
                Remove from board
              </button>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}
