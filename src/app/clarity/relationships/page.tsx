"use client";

import { SESSIONS } from "@/data/studio";
import { PageHeader, Section, Notice, LinkCard, Card } from "@/components/ui";
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
      <Section title="Intensity or stability?">
        <Card className="space-y-3 text-[15px] leading-relaxed">
          <p>
            Some relationships feel like a rollercoaster: huge highs, painful lows, then a rush of relief when things are good again. That cycle can feel like deep love, and it&apos;s
            sometimes called a <b>trauma bond</b>. It&apos;s really common, and it&apos;s not your fault.
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="mb-1 font-medium">Intensity often looks like</div>
              <ul className="space-y-1 text-ink-2">
                <li>· Hot and cold, push and pull</li>
                <li>· Chasing reassurance</li>
                <li>· Making up feels like a high</li>
                <li>· Walking on eggshells</li>
                <li>· &ldquo;No one gets me like they do&rdquo;</li>
              </ul>
            </div>
            <div>
              <div className="mb-1 font-medium">Stability often looks like</div>
              <ul className="space-y-1 text-ink-2">
                <li>· Consistent, even when it&apos;s boring</li>
                <li>· Disagreements without disappearing</li>
                <li>· Calm feels safe, not empty</li>
                <li>· You can say no and stay loved</li>
                <li>· Your nervous system can rest</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-ink-3">Gentle questions: How do I feel when things are calm? Do I feel more like myself, or less? What would a steady version of this look like?</p>
          <p className="text-sm text-ink-3">
            This is for reflection, not a verdict on anyone. It&apos;s a great thing to explore with your therapist. If you ever feel afraid or unsafe, tap Help, or call the National Domestic Violence Hotline at{" "}
            <a href="tel:18007997233" className="underline">1-800-799-7233</a> (or text START to 88788).
          </p>
        </Card>
      </Section>

      <Section title="When it's heated">
        <div className="grid grid-cols-2 gap-2">
          <LinkCard href="/clarity/perspective" className="p-4">
            <div className="font-medium">Check the facts</div>
          </LinkCard>
          <LinkCard href="/clarity/send" className="p-4">
            <div className="font-medium">Pause before sending</div>
          </LinkCard>
          <LinkCard href="/steady/argument" className="p-4">
            <div className="font-medium">About to say something</div>
          </LinkCard>
          <LinkCard href="/steady/abandoned" className="p-4">
            <div className="font-medium">I feel abandoned</div>
          </LinkCard>
        </div>
      </Section>
      <Notice>
        <CName /> won&apos;t act as judge in a disagreement. For a balanced view, your therapist and people you trust are the best sounding boards. If you ever feel unsafe, tap Help at the top.
      </Notice>
    </div>
  );
}
