"use client";

import { Mic, Settings2, Sparkles, Lock, Scale, Hand, Send, Leaf, HeartHandshake, ChevronRight } from "lucide-react";
import { LinkCard, PageHeader, Section } from "@/components/ui";
import { useStore } from "@/lib/store";
import { fmtDate } from "@/lib/util";
import Link from "next/link";
import { CName } from "@/components/companion-name";

const TOOLS = [
  { href: "/clarity/room", icon: Lock, title: "The Private Room", body: "Say everything. Choose whether anyone responds." },
  { href: "/clarity/perspective", icon: Scale, title: "Check the facts", body: "Separate what happened from the story about it." },
  { href: "/clarity/pause", icon: Hand, title: "Pause before acting", body: "For the urge to do something big, right now." },
  { href: "/clarity/send", icon: Send, title: "Pause before sending", body: "Rewrite a message so it protects you." },
  { href: "/clarity/studio", icon: Leaf, title: "Wellness Studio", body: "Guided DBT-informed sessions, 5 to 15 minutes." },
  { href: "/clarity/relationships", icon: HeartHandshake, title: "Relationships", body: "Listening, boundaries, repair, trust." },
];

export default function ClarityHub() {
  const { vault } = useStore();
  const recent = [...vault.chats].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);
  return (
    <div>
      <PageHeader eyebrow="Your companion" title="Talk it out. Figure it out." subtitle="Your companion and coach, and the tools you've learned, in one quiet place." />

      <div className="grid grid-cols-2 gap-2">
        <LinkCard href="/voice" className="relative col-span-2 overflow-hidden bg-forest !text-on-forest">
          <Mic size={20} className="mb-6 text-gold" />
          <div className="font-serif text-3xl text-on-forest">Talk to <CName /></div>
          <p className="mt-1 text-sm text-on-forest/80">Out loud, hands-free. Your bestie, guide and coach.</p>
        </LinkCard>
        <LinkCard href="/clarity/chat" className="!p-4">
          <Sparkles size={16} className="mb-2 text-gold" />
          <div className="font-medium">Text chat</div>
          <div className="text-xs text-ink-3">Support, challenge, coaching</div>
        </LinkCard>
        <LinkCard href="/me/companion" className="!p-4">
          <Settings2 size={16} className="mb-2 text-gold" />
          <div className="font-medium">Companion settings</div>
          <div className="text-xs text-ink-3">Voice, vibe, name</div>
        </LinkCard>
        <LinkCard href="/dbt" className="col-span-2 !p-4">
          <div className="eyebrow">DBT toolkit</div>
          <div className="mt-1 font-serif text-[22px] leading-tight">✨ Your glow-up toolkit</div>
          <div className="text-sm text-ink-3">Skill of the day, log what you learned, collect your wins</div>
        </LinkCard>
      </div>

      {recent.length > 0 && (
        <Section title="Recent conversations" className="mt-6">
          <div className="card divide-y divide-line">
            {recent.map((c) => (
              <Link key={c.id} href={`/clarity/chat?id=${c.id}`} className="flex items-center justify-between px-5 py-3.5">
                <span className="truncate pr-4 text-[15px]">{c.title}</span>
                <span className="flex shrink-0 items-center gap-1 text-xs text-ink-3">
                  {fmtDate(c.updatedAt)} <ChevronRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section title="Tools" className="mt-6">
        <div className="grid grid-cols-2 gap-2">
          {TOOLS.map((t) => (
            <LinkCard key={t.href} href={t.href} className="p-4">
              <t.icon size={18} className="mb-3 text-forest" strokeWidth={1.7} />
              <div className="font-medium leading-tight">{t.title}</div>
              <div className="mt-1 text-xs leading-snug text-ink-3">{t.body}</div>
            </LinkCard>
          ))}
        </div>
      </Section>
    </div>
  );
}
