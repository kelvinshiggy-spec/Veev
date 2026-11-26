"use client";

import { useMemo, useState } from "react";
import { Sunrise, Moon, ListChecks, Scale, Telescope, FileText, Award } from "lucide-react";
import { useStore } from "@/lib/store";
import { sobrietyStats } from "@/lib/sobriety";
import { series, achievements } from "@/lib/insights";
import { Card, Chips, LinkCard, PageHeader, Section, Pill } from "@/components/ui";
import { MoodChart, CravingChart } from "@/components/charts";
import { fmtDate, fmtTime } from "@/lib/util";
import type { EntryKind } from "@/lib/types";

const KIND_LABEL: Record<EntryKind, string> = {
  room: "Private Room",
  morning: "Morning",
  evening: "Evening",
  accountability: "Accountability",
  perspective: "Check the facts",
  pause: "Pause",
  studio: "Skill practice",
  reflection: "Reflection",
};

export default function Journey() {
  const { vault } = useStore();
  const s = sobrietyStats(vault);
  const data = useMemo(() => series(vault, 30), [vault]);
  const ach = achievements(vault);
  const [filter, setFilter] = useState<string[]>([]);
  const entries = [...vault.journal]
    .filter((j) => !filter.length || filter.includes(KIND_LABEL[j.kind]))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 40);
  const hasData = data.some((d) => d.mood !== null);

  return (
    <div>
      <PageHeader eyebrow="Journey" title="Look how far you've come." />

      <div className="grid grid-cols-2 gap-2">
        <LinkCard href="/journey/rituals" className="p-4">
          <Sunrise size={18} className="mb-3 text-gold" />
          <div className="font-medium">Morning ritual</div>
        </LinkCard>
        <LinkCard href="/journey/rituals?evening=1" className="p-4">
          <Moon size={18} className="mb-3 text-forest" />
          <div className="font-medium">Evening ritual</div>
        </LinkCard>
        <LinkCard href="/journey/habits" className="p-4">
          <ListChecks size={18} className="mb-3 text-forest" />
          <div className="font-medium">Habits</div>
        </LinkCard>
        <LinkCard href="/journey/accountability" className="p-4">
          <Scale size={18} className="mb-3 text-forest" />
          <div className="font-medium">Honest check-in</div>
        </LinkCard>
        <LinkCard href="/journey/patterns" className="p-4">
          <Telescope size={18} className="mb-3 text-forest" />
          <div className="font-medium">Patterns</div>
        </LinkCard>
        <LinkCard href="/journey/report" className="p-4">
          <FileText size={18} className="mb-3 text-gold" />
          <div className="font-medium">Weekly report</div>
        </LinkCard>
      </div>

      <Section title="Mood · last 30 days" className="mt-8">
        <Card className="!px-3 !pb-2">{hasData ? <MoodChart data={data} /> : <p className="px-2 pb-3 text-sm text-ink-3">Check in on Today to see your trends here.</p>}</Card>
      </Section>
      {hasData && (
        <Section title="Craving strength · last 30 days">
          <Card className="!px-3 !pb-2">
            <CravingChart data={data} />
          </Card>
        </Section>
      )}

      <Section title="Sobriety history">
        <Card>
          <div className="grid grid-cols-3 text-center">
            <div>
              <div className="font-serif text-3xl">{s.current}</div>
              <div className="text-xs text-ink-3">current</div>
            </div>
            <div>
              <div className="font-serif text-3xl">{s.total}</div>
              <div className="text-xs text-ink-3">total</div>
            </div>
            <div>
              <div className="font-serif text-3xl">{s.longest}</div>
              <div className="text-xs text-ink-3">longest</div>
            </div>
          </div>
          <div className="hairline my-4" />
          <ul className="space-y-2 text-sm">
            {[...s.streaks].reverse().map((st, i) => (
              <li key={i} className="flex justify-between text-ink-2">
                <span>
                  {fmtDate(st.start, { month: "short", day: "numeric", year: "numeric" })} → {st.end ? fmtDate(st.end, { month: "short", day: "numeric", year: "numeric" }) : "today"}
                </span>
                {!st.end && <Pill tone="forest">Now</Pill>}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-3">Every stretch counts. Total sober days are never reset.</p>
        </Card>
      </Section>

      {ach.length > 0 && (
        <Section title="Achievements">
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
            {ach.map((a) => (
              <div key={a.title} className="card w-36 shrink-0 p-4">
                <Award size={16} className="mb-2 text-gold" />
                <div className="font-serif text-xl leading-tight">{a.title}</div>
                <div className="text-xs text-ink-3">{a.sub}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Journal">
        <Chips options={Object.values(KIND_LABEL)} value={filter} onChange={(v) => setFilter(v.slice(-1))} className="mb-3" />
        {entries.length === 0 ? (
          <p className="text-sm text-ink-3">Your rituals, reflections and Private Room entries will gather here.</p>
        ) : (
          <div className="space-y-2">
            {entries.map((j) => (
              <details key={j.id} className="card p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <span className="truncate text-[15px]">{j.title || Object.values(j.fields).find(Boolean)?.slice(0, 60) || KIND_LABEL[j.kind]}</span>
                  <span className="shrink-0 text-xs text-ink-3">
                    {KIND_LABEL[j.kind]} · {fmtDate(j.createdAt)} {fmtTime(j.createdAt)}
                  </span>
                </summary>
                <div className="mt-3 space-y-2">
                  {Object.entries(j.fields)
                    .filter(([, val]) => val)
                    .map(([k, val]) => (
                      <div key={k}>
                        <div className="text-xs text-ink-3">{k}</div>
                        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{val}</p>
                      </div>
                    ))}
                  {j.aiResponse && <p className="whitespace-pre-wrap rounded-2xl bg-surface-2 p-3 text-sm">{j.aiResponse}</p>}
                </div>
              </details>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
