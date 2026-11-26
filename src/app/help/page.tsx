"use client";

import { Phone, MessageSquare } from "lucide-react";
import { CRISIS } from "@/lib/safety";
import { useSafety } from "@/components/safety";
import { Card, PageHeader, Section } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function Help() {
  const safety = useSafety();
  const { vault, locked } = useStore();
  const contacts = locked ? [] : vault.contacts.filter((c) => c.phone);
  return (
    <div>
      <PageHeader eyebrow="Help" title="You don't have to handle this alone." subtitle="Everything on this page works without internet or AI." />

      <div className="space-y-2">
        {[CRISIS.emergency, CRISIS.lifeline, CRISIS.samhsa, CRISIS.dv].map((c) => (
          <div key={c.number} className="card flex items-center gap-3 p-4">
            <div className="flex-1">
              <div className="font-medium">{c.label}</div>
              <div className="text-sm leading-snug text-ink-3">{c.note}</div>
            </div>
            {"sms" in c && typeof c.sms === "string" && (
              <a href={c.sms} aria-label={`Text ${c.label}`} className="grid h-11 w-11 place-items-center rounded-full bg-surface-2">
                <MessageSquare size={17} />
              </a>
            )}
            <a href={c.tel} className="inline-flex h-11 items-center gap-2 rounded-full bg-forest px-4 font-medium text-on-forest">
              <Phone size={15} /> {c.number}
            </a>
          </div>
        ))}
      </div>

      {contacts.length > 0 && (
        <Section title="Your people" className="mt-8">
          <div className="space-y-2">
            {contacts.map((c) => (
              <a key={c.id} href={`tel:${c.phone}`} className="card flex items-center justify-between p-4">
                <span>
                  <span className="block font-medium">{c.name}</span>
                  <span className="text-sm text-ink-3">{c.role}</span>
                </span>
                <Phone size={18} className="text-forest" />
              </a>
            ))}
          </div>
        </Section>
      )}

      <Section title="Call 911 for" className="mt-8">
        <Card>
          <ul className="space-y-1.5 text-[15px] leading-relaxed text-ink-2">
            <li>· Seizures, or shaking with confusion</li>
            <li>· Trouble breathing, chest pain</li>
            <li>· Seeing or hearing things that aren&apos;t there, or severe confusion</li>
            <li>· Someone who can&apos;t be woken up</li>
            <li>· Being about to hurt yourself, or being in immediate danger</li>
          </ul>
        </Card>
      </Section>

      <Section title="Talk me through it">
        <div className="grid gap-2">
          {(
            [
              ["suicide", "I don't feel safe right now"],
              ["psychosis", "I'm not sure what's real"],
              ["withdrawal", "I might be in withdrawal"],
              ["intoxicated", "I've been drinking"],
              ["abuse", "Someone is hurting me"],
            ] as const
          ).map(([k, l]) => (
            <button key={k} onClick={() => safety.open(k)} className="card p-4 text-left text-[15px]">
              {l}
            </button>
          ))}
        </div>
      </Section>

      <p className="mt-6 text-sm leading-relaxed text-ink-3">
        VEEV is a self-help companion. It can&apos;t guarantee safety, monitor you, or replace professional care. Numbers shown are for the United States.
      </p>
    </div>
  );
}
