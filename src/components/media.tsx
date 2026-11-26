"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Video, Square, ImagePlus, Trash2 } from "lucide-react";
import { getMedia, putMedia } from "@/lib/media";
import { uid } from "@/lib/util";
import { Button } from "./ui";

export function MediaView({ id, type, className }: { id: string; type: "audio" | "video" | "image"; className?: string }) {
  const [url, setUrl] = useState<string>();
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    let u: string | undefined;
    getMedia(id)
      .then((b) => {
        if (!b) return setMissing(true);
        u = URL.createObjectURL(b);
        setUrl(u);
      })
      .catch(() => setMissing(true));
    return () => {
      if (u) URL.revokeObjectURL(u);
    };
  }, [id]);
  if (missing) return <div className="text-xs text-ink-3">Media is stored on another device.</div>;
  if (!url) return null;
  if (type === "image") // eslint-disable-next-line @next/next/no-img-element -- local blob URLs, next/image cannot optimize them
  return <img src={url} alt="" className={className} />;
  if (type === "video") return <video src={url} controls playsInline className={className ?? "w-full rounded-2xl"} />;
  return <audio src={url} controls className={className ?? "w-full"} />;
}

/** Records audio or video into on-device storage. Returns the media id. */
export function Recorder({
  kind,
  onSaved,
}: {
  kind: "audio" | "video";
  onSaved: (id: string, type: "audio" | "video") => void;
}) {
  const [state, setState] = useState<"idle" | "rec" | "err">("idle");
  const [secs, setSecs] = useState(0);
  const rec = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const preview = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (state !== "rec") return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  useEffect(() => () => stream.current?.getTracks().forEach((t) => t.stop()), []);

  const start = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia(kind === "video" ? { video: { facingMode: "user" }, audio: true } : { audio: true });
      stream.current = s;
      if (preview.current && kind === "video") {
        preview.current.srcObject = s;
        preview.current.play().catch(() => {});
      }
      const chunks: Blob[] = [];
      const r = new MediaRecorder(s);
      r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      r.onstop = async () => {
        s.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: r.mimeType || (kind === "video" ? "video/webm" : "audio/webm") });
        const id = uid();
        await putMedia(id, blob);
        onSaved(id, kind);
        setState("idle");
        setSecs(0);
      };
      rec.current = r;
      r.start();
      setState("rec");
    } catch {
      setState("err");
    }
  };

  return (
    <div className="space-y-3">
      {kind === "video" && state === "rec" && <video ref={preview} muted playsInline className="aspect-[3/4] w-full rounded-2xl bg-black object-cover" />}
      {state === "rec" ? (
        <Button variant="danger" full onClick={() => rec.current?.stop()}>
          <Square size={14} /> Stop · {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}
        </Button>
      ) : (
        <Button variant="outline" full onClick={start}>
          {kind === "audio" ? <Mic size={16} /> : <Video size={16} />} Record {kind === "audio" ? "a voice note" : "a video"}
        </Button>
      )}
      {state === "err" && <p className="text-sm text-rose">Couldn't access the {kind === "audio" ? "microphone" : "camera"}. Check permissions for this site.</p>}
    </div>
  );
}

export function PhotoPicker({ onSaved, label = "Add a photo" }: { onSaved: (id: string) => void; label?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const blob = await downscale(f, 1600);
          const id = uid();
          await putMedia(id, blob);
          onSaved(id);
          e.target.value = "";
        }}
      />
      <Button variant="outline" full onClick={() => ref.current?.click()}>
        <ImagePlus size={16} /> {label}
      </Button>
    </>
  );
}

export function RemoveMediaButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1 text-xs text-ink-3 hover:text-rose">
      <Trash2 size={12} /> Remove
    </button>
  );
}

async function downscale(file: File, max: number): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    if (scale === 1) return file;
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext("2d")?.drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise((res) => c.toBlob((b) => res(b ?? file), "image/jpeg", 0.86));
  } catch {
    return file;
  }
}
