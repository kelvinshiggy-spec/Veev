"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { weekly, observations } from "@/lib/insights";
import { Button, Card, PageHeader, Section, Segmented, Pill } from "@/components/ui";
import { AiErrorNote, useAiReady } from "@/components/ai-gate";
import { streamClarity, type AiError } from "@/lib/ai";
import { fmtDate, money } from "@/lib/util";

const MOOD = ["", "heavy", "low", "okay", "good", "wonderful"];

export default function Report() {
  const { vault } = useStore();
  const ready = useAiReady();
  const [offset, setOffset] = useState<"0" | "1">("0");
  const w = weekly(vault, Number(offset));
  const obs = vault.settings.patternsConsent ? observations(vault).slice(0, 2) : [];
  const [ai, setAi] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AiError>();
  const name = vault.profile.name;

  const local = [
    w.soberThisWeek === 7
      ? `Seven clear days${name ? `, ${name}` : ""}. That's a whole week of mornings you got to keep.`
      : w.soberThisWeek > 0
        ? `${w.soberThisWeek} clear days this week, and ${w.s.total} in total. Every one of them counts.`
        : "This week was hard. You're still here, still looking honestly at it, and that matters.",
    w.managed ? `You rode out ${w.managed} craving${w.managed > 1 ? "s" : ""}. That's a skill, and you're building it.` : "",
    w.ahead.length ? `Next up: ${w.ahead[0].title}. Something to protect.` : "What's one thing you'd like to look forward to next week?",
  ]
    .filter(Boolean)
    .join(" ");

  const summary = () =>
    [
      `Week ${w.start} to ${w.end}.`,
      name && `Her name: ${name}.`,
      `Sober days this week: ${w.soberThisWeek}/7; total sober days ${w.s.total}; current stretch ${w.s.current}.`,
      `Check-ins: ${w.checkIns}; average mood ${w.avgMood?.toFixed(1) ?? "n/a"}/5; common feelings: ${w.topEmotions.map(([e]) => e).join(", ") || "n/a"}.`,
      `Craving moments recorded: ${w.cravings}; ridden out: ${w.managed}.`,
      `Habit check-offs: ${w.habitDays}; movement/gym days: ${w.gym}.`,
      `Helpful tools: ${w.tools.map(([t]) => t).join(", ") || "n/a"}.`,
      `Experiences: ${w.experiences.map((e) => e.title).join(", ") || "n/a"}. Memories captured: ${w.memories.map((m) => m.title).join(", ") || "none"}.`,
      `Coming up: ${w.ahead.map((a) => a.title).join(", ") || "nothing planned yet"}.`,
      vault.settings.faith ? "Faith matters to her." : "",
    ]
      .filter(Boolean)
      .join("\n");

  return (
    <div>
      <PageHeader back="/journey" eyebrow="Weekly report" title="Your week, beautifully." subtitle={`${fmtDate(w.start, { month: "long", day: "numeric" })} – ${fmtDate(w.end, { month: "long", day: "numeric" })}`} />
      <Segmented
        value={offset}
        onChange={(v) => {
          setOffset(v);
          setAi("");
        }}
        options={[
          { value: "0", label: "Last 7 days" },
          { value: "1", label: "The week before" },
        ]}
      />

      <div className="mt-6 grid grid-cols-2 gap-2">
        <Stat big={`${w.soberThisWeek}/7`} small="clear days" />
        <Stat big={String(w.s.total)} small="total sober days" />
        <Stat big={money(w.estSaved, vault.profile.currency)} small="est. not spent" />
        <Stat big={String(w.managed)} small={`of ${w.cravings} cravings ridden out`} />
        <Stat big={String(w.gym)} small="movement days" />
        <Stat big={w.avgMood ? MOOD[Math.round(w.avgMood)] : "–"} small="typical mood" />
      </div>

      {w.topEmotions.length > 0 && (
        <Section title="Emotional weather" className="mt-7">
          <div className="flex flex-wrap gap-2">
            {w.topEmotions.map(([e, n]) => (
              <Pill key={e}>
                {e} · {n}
              </Pill>
            ))}
          </div>
        </Section>
      )}

      {w.tools.length > 0 && (
        <Section title="What helped">
          <Card>
            <ul className="space-y-1 text-[15px]">
              {w.tools.map(([t]) => (
                <li key={t}>· {t}</li>
              ))}
            </ul>
          </Card>
        </Section>
      )}

      {(w.experiences.length > 0 || w.memories.length > 0) && (
        <Section title="Experiences & memories">
          <Card>
            <ul className="space-y-1 text-[15px]">
              {w.experiences.map((e) => (
                <li key={e.id}>· {e.title}</li>
              ))}
              {w.memories.map((m) => (
                <li key={m.id}>· {m.title || m.category}</li>
              ))}
            </ul>
          </Card>
        </Section>
      )}

      {obs.length > 0 && (
        <Section title="Possible patterns">
          <div className="space-y-2">
            {obs.map((o) => (
              <Card key={o.text} className="!p-4 text-[15px]">
                {o.text}
              </Card>
            ))}
          </div>
        </Section>
      )}

      {w.therapyTopics.length > 0 && (
        <Section title="For therapy">
          <Card>
            <ul className="space-y-1 text-[15px]">
              {w.therapyTopics.map((t) => (
                <li key={t.id} className="truncate">
                  · {t.title || t.fields.text?.slice(0, 70)}
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      )}

      <Section title="Looking forward to">
        {w.ahead.length ? (
          <Card>
            <ul className="space-y-1 text-[15px]">
              {w.ahead.map((a) => (
                <li key={a.id}>
                  · {a.title} <span className="text-ink-3">{a.date && fmtDate(a.date)}</span>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Button href="/future/sober-life" variant="outline" size="sm">
            Plan something
          </Button>
        )}
      </Section>

      <Card className="bg-forest text-on-forest">
        <div className="text-xs uppercase tracking-[0.16em] text-on-forest/70">A reflection for you</div>
        <p className="mt-3 whitespace-pre-wrap font-serif text-[22px] leading-snug">{ai || local}</p>
      </Card>
      {ready && !ai && (
        <Button
          variant="ghost"
          full
          className="mt-2"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError(undefined);
            const r = await streamClarity({ task: "weekly", text: summary() }, setAi);
            setBusy(false);
            if (r.error) setError(r.error);
          }}
        >
          {busy ? "Writing…" : "Ask for a personal reflection"}
        </Button>
      )}
      <AiErrorNote error={error} />
      <p className="mt-4 text-xs text-ink-3">No grades, no scores. Just your week.</p>
    </div>
  );
}

function Stat({ big, small }: { big: string; small: string }) {
  return (
    <div className="card p-4">
      <div className="font-serif text-3xl capitalize leading-none">{big}</div>
      <div className="mt-1 text-xs text-ink-3">{small}</div>
    </div>
  );
}
