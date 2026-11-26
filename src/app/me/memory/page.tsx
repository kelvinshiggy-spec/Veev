"use client";

import { useStore } from "@/lib/store";
import { AI_MEMORY_KEYS } from "@/lib/defaults";
import { buildContext } from "@/lib/ai";
import { Button, Card, Notice, PageHeader, Section, Toggle } from "@/components/ui";

export default function ClarityMemory() {
  const { vault, update } = useStore();
  const ctx = buildContext(vault);
  return (
    <div>
      <PageHeader back="/me" eyebrow="Clarity's memory" title="You decide what Clarity knows." subtitle="Clarity doesn't secretly remember anything. Each time you talk, only what's switched on below is included." />
      <Card>
        <Toggle
          checked={vault.settings.aiConsent}
          onChange={(v) => update((x) => ({ ...x, settings: { ...x.settings, aiConsent: v } }))}
          label="Clarity's AI is on"
          hint="Off means nothing is ever sent to the AI service."
        />
      </Card>
      <Section title="Clarity may use" className="mt-6">
        <Card className="divide-y divide-line !py-1">
          {AI_MEMORY_KEYS.map((k) => (
            <Toggle
              key={k.key}
              label={k.label}
              checked={!!vault.settings.aiMemory[k.key]}
              onChange={(v) => update((x) => ({ ...x, settings: { ...x.settings, aiMemory: { ...x.settings.aiMemory, [k.key]: v } } }))}
            />
          ))}
        </Card>
      </Section>
      <Section title="Exactly what Clarity would see">
        <Card className="bg-surface-2">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-2">{ctx || "Nothing personal. Clarity will only see what you type."}</pre>
        </Card>
        <p className="mt-2 text-xs text-ink-3">Edit any of this in About me. Your conversation history stays on your device and is only sent along with the conversation you&apos;re in.</p>
      </Section>
      <Section title="Stored conversations">
        <Notice>
          {vault.chats.length} Clarity conversations are saved on this device.
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            disabled={!vault.chats.length}
            onClick={() => update((v) => ({ ...v, chats: [] }))}
          >
            Delete all conversations
          </Button>
        </Notice>
      </Section>
    </div>
  );
}
