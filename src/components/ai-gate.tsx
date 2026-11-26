"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { useAiStatus, type AiError } from "@/lib/ai";
import { Button, Notice } from "./ui";
import { CName } from "@/components/companion-name";

/** Shows an honest state when AI isn't available or Veev hasn't agreed to AI processing. */
export function AiNotice({ compact }: { compact?: boolean }) {
  const { vault, update } = useStore();
  const st = useAiStatus();
  if (!vault.settings.aiConsent)
    return (
      <Notice>
        <div className="font-medium text-ink"><CName possessive /> AI is off.</div>
        {!compact && (
          <p className="mt-1">
            If you turn it on, the words you send to <CName />, plus the parts of your profile you allow in{" "}
            <Link href="/me/memory" className="underline">
              <CName possessive /> memory
            </Link>
            , are sent securely to Anthropic&apos;s AI to write a reply. Nothing is used for ads, and nothing is shared with anyone else. Everything else in the app works without it.
          </p>
        )}
        <Button size="sm" className="mt-3" onClick={() => update((v) => ({ ...v, settings: { ...v.settings, aiConsent: true } }))}>
          Turn on <CName />
        </Button>
      </Notice>
    );
  if (st.loaded && !st.offline && !st.ai)
    return (
      <Notice>
        <div className="font-medium text-ink"><CName /> isn&apos;t connected yet.</div>
        <p className="mt-1">
          This copy of the app doesn&apos;t have an AI key set up, so <CName /> can&apos;t reply. Everything you write is still saved privately, and all the guided tools work.
        </p>
      </Notice>
    );
  return null;
}

export function useAiReady() {
  const { vault } = useStore();
  const st = useAiStatus();
  return vault.settings.aiConsent && st.ai && !st.offline;
}

export function AiErrorNote({ error }: { error?: AiError }) {
  if (!error) return null;
  return (
    <Notice tone="rose">
      {error.message} Everything else in VEEV, including your tools, letters and Help, still works.
      {error.kind === "auth" && (
        <>
          {" "}
          <Link href="/me/privacy" className="underline">
            Open settings
          </Link>
        </>
      )}
    </Notice>
  );
}

export function NotTherapy({ children }: { children?: ReactNode }) {
  return <p className="text-xs leading-relaxed text-ink-3">{children ?? <><CName /> is an AI companion for guided self-help. It isn&apos;t therapy and doesn&apos;t replace your therapist or medical care.</>}</p>;
}
