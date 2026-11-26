"use client";

import { useStore } from "@/lib/store";
import { persona } from "@/data/personas";

/** The companion's name as Veev set it (Vylie by default). */
export function useCompanionName() {
  const { vault } = useStore();
  return vault.companion.name?.trim() || persona(vault.companion.persona).name;
}

export function CName({ possessive }: { possessive?: boolean }) {
  const n = useCompanionName();
  return <>{possessive ? `${n}'s` : n}</>;
}
