"use client";

import { Phone, MessageSquare, Sparkles, Lock } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card, LinkCard, PageHeader, Section, Button } from "@/components/ui";
import { SUPPORT_TEMPLATES } from "@/data/messages";
import { useState } from "react";
import { cx } from "@/lib/util";

export default function Talk() {
  const { vault } = useStore();
  const [tpl, setTpl] = useState(0);
  const contacts = vault.contacts.filter((c) => c.phone);
  return (
    <div>
      <PageHeader back eyebrow="I need to talk" title="Who do you want to talk to?" />
      <div className="grid gap-2">
        <LinkCard href="/clarity/chat">
          <div className="flex items-center gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-soft">
              <Sparkles size={18} />
            </span>
            <div>
              <div className="font-medium">Clarity</div>
              <div className="text-sm text-ink-3">Think it through, vent, or get a straight answer.</div>
            </div>
          </div>
        </LinkCard>
        <LinkCard href="/clarity/room">
          <div className="flex items-center gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-forest-soft text-forest">
              <Lock size={18} />
            </span>
            <div>
              <div className="font-medium">The Private Room</div>
              <div className="text-sm text-ink-3">Just get it all out. No one reads it but you.</div>
            </div>
          </div>
        </LinkCard>
      </div>

      <Section title="A real person" className="mt-8">
        {contacts.length === 0 ? (
          <Card>
            <p className="text-[15px] text-ink-2">Add the people you trust, and they&apos;ll be one tap away here.</p>
            <Button href="/me/support" size="sm" variant="outline" className="mt-3">
              Add my people
            </Button>
          </Card>
        ) : (
          <>
            <div className="mb-3 space-y-2">
              {SUPPORT_TEMPLATES.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setTpl(i)}
                  className={cx("w-full rounded-2xl border p-3 text-left text-sm", tpl === i ? "border-gold bg-gold-soft/40" : "border-line bg-surface text-ink-2")}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {contacts.map((c) => (
                <div key={c.id} className="card flex items-center gap-3 p-3 pl-4">
                  <div className="flex-1">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-ink-3">{[c.role, ...c.supports.slice(0, 2)].join(" · ")}</div>
                  </div>
                  <a href={`sms:${c.phone}?&body=${encodeURIComponent(SUPPORT_TEMPLATES[tpl])}`} className="grid h-10 w-10 place-items-center rounded-full bg-surface-2" aria-label={`Text ${c.name}`}>
                    <MessageSquare size={16} />
                  </a>
                  <a href={`tel:${c.phone}`} className="grid h-10 w-10 place-items-center rounded-full bg-forest text-on-forest" aria-label={`Call ${c.name}`}>
                    <Phone size={16} />
                  </a>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-3">The message opens in your messages app. Nothing sends unless you press send.</p>
          </>
        )}
      </Section>
    </div>
  );
}
