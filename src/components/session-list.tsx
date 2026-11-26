"use client";

import { LinkCard } from "./ui";
import type { Session } from "@/data/studio";

export function SessionList({ items }: { items: Session[] }) {
  return (
    <div className="grid gap-2">
      {items.map((s) => (
        <LinkCard key={s.id} href={`/clarity/studio/${s.id}`} className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">{s.title}</div>
              <div className="text-xs text-ink-3">{s.skill}</div>
            </div>
            <span className="shrink-0 text-sm text-ink-3">{s.minutes} min</span>
          </div>
        </LinkCard>
      ))}
    </div>
  );
}

