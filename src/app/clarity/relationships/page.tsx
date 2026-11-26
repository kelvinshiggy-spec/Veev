"use client";

import { SESSIONS } from "@/data/studio";
import { PageHeader, Section, Notice, LinkCard } from "@/components/ui";
import { SessionList } from "@/components/session-list";
import { CName } from "@/components/companion-name";

export default function Relationships() {
  return (
    <div>
      <PageHeader
        back="/clarity"
        eyebrow="Relationships"
        title="Love that feels steady."
        subtitle="Listening, boundaries, repair and trust. People can disagree with you without leaving you."
      />
      <Section title="Practice">
        <SessionList items={SESSIONS.filter((s) => s.category === "Relationships")} />
      </Section>
      <Section title="When it's heated">
        <div className="grid grid-cols-2 gap-2">
          <LinkCard href="/clarity/perspective" className="p-4">
            <div className="font-medium">Check the facts</div>
          </LinkCard>
          <LinkCard href="/clarity/send" className="p-4">
            <div className="font-medium">Pause before sending</div>
          </LinkCard>
        </div>
      </Section>
      <Notice>
        <CName /> won&apos;t act as judge in a disagreement. For a balanced view, your therapist and people you trust are the best sounding boards. If you ever feel unsafe, tap Help at the top.
      </Notice>
    </div>
  );
}
