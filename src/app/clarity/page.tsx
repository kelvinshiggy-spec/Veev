"use client";

import { Sparkles, Lock, Scale, Hand, Send, Leaf, HeartHandshake, ChevronRight } from "lucide-react";
import { LinkCard, PageHeader, Section } from "@/components/ui";
import { useStore } from "@/lib/store";
import { fmtDate } from "@/lib/util";
import Link from "next/link";

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
      <PageHeader eyebrow="Clarity" title="Think clearly. Feel fully." subtitle="Your companion and coach, and the tools you've learned, in one quiet place." />

      <LinkCard href="/clarity/chat" className="relative overflow-hidden bg-forest !text-on-forest">
        <Sparkles size={20} className="mb-6 text-gold" />
        <div className="font-serif text-3xl text-on-forest">Talk to Clarity</div>
        <p className="mt-1 text-sm text-on-forest/80">Support, reflection, honest challenge, coaching. You choose.</p>
      </LinkCard>

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
