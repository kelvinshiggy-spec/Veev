"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { sobrietyStats } from "@/lib/sobriety";
import { Button, Card, Chips, Input, Label, Notice, PageHeader, Progress, Section, Sheet } from "@/components/ui";
import { dayKey, fmtDate, money, uid } from "@/lib/util";
import type { Fund } from "@/lib/types";

const SUGGESTED = ["Vacation fund", "Ski trip", "Dream car", "Home", "Emergency savings", "Wardrobe", "Family"];

export default function Finances() {
  const { vault, update } = useStore();
  const s = sobrietyStats(vault);
  const cur = vault.profile.currency;
  const [newFund, setNewFund] = useState<{ name: string; target: string } | null>(null);
  const [deposit, setDeposit] = useState<{ fund: Fund; amount: string; note: string } | null>(null);

  const allocated = vault.funds.reduce((a, f) => a + f.deposits.reduce((b, d) => b + d.amount, 0), 0);

  return (
    <div>
      <PageHeader back="/future" eyebrow="Financial freedom" title="Money you're keeping for your life." />

      <Card className="bg-forest text-on-forest">
        <div className="text-xs uppercase tracking-[0.16em] text-on-forest/70">Estimated not spent on alcohol</div>
        <div className="mt-2 font-serif text-[56px] leading-none">{money(s.estSaved, cur)}</div>
        <div className="mt-2 text-sm text-on-forest/80">
          {s.total} sober days × {money(vault.profile.dailyDrinkSpend, cur)} a day, your estimate
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-on-forest/20 pt-4 text-sm">
          <div>
            <div className="text-on-forest/70">Actually set aside</div>
            <div className="font-serif text-2xl">{money(allocated, cur)}</div>
          </div>
          <div>
            <div className="text-on-forest/70">Estimate not yet set aside</div>
            <div className="font-serif text-2xl">{money(Math.max(0, s.estSaved - allocated), cur)}</div>
          </div>
        </div>
      </Card>
      <p className="mt-3 text-xs leading-relaxed text-ink-3">
        Estimates are based on your own numbers. &quot;Actually set aside&quot; only counts money you record moving yourself. VEEV doesn&apos;t connect to any bank.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <Label>My daily estimate</Label>
        <Input
          type="number"
          inputMode="decimal"
          className="!w-32"
          value={vault.profile.dailyDrinkSpend}
          onChange={(e) => update((v) => ({ ...v, profile: { ...v.profile, dailyDrinkSpend: Number(e.target.value) || 0 } }))}
        />
      </div>

      <Section title="My funds" className="mt-8" action={<Button size="sm" variant="ghost" onClick={() => setNewFund({ name: "", target: "" })}><Plus size={14} /> New</Button>}>
        {vault.funds.length === 0 ? (
          <Card>
            <p className="text-[15px] text-ink-2">Give the money a purpose. Pick a fund to start.</p>
            <Chips className="mt-3" options={SUGGESTED} value={[]} onChange={(v) => v[0] && setNewFund({ name: v[0], target: "" })} />
          </Card>
        ) : (
          <div className="space-y-3">
            {vault.funds.map((f) => {
              const saved = f.deposits.reduce((a, d) => a + d.amount, 0);
              return (
                <Card key={f.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-serif text-2xl">{f.name}</div>
                      <div className="text-sm text-ink-3">
                        {money(saved, cur)} of {money(f.target, cur)}
                      </div>
                    </div>
                    <Button size="sm" variant="soft" onClick={() => setDeposit({ fund: f, amount: String(vault.profile.dailyDrinkSpend * 7 || ""), note: "" })}>
                      Add money
                    </Button>
                  </div>
                  <Progress value={f.target ? (saved / f.target) * 100 : 0} className="mt-4" />
                  {f.deposits.length > 0 && (
                    <details className="mt-3 text-sm">
                      <summary className="cursor-pointer text-ink-3">History</summary>
                      <ul className="mt-2 space-y-1">
                        {[...f.deposits].reverse().map((d) => (
                          <li key={d.id} className="flex justify-between text-ink-2">
                            <span>
                              {fmtDate(d.date)} {d.note && `· ${d.note}`}
                            </span>
                            <span>{money(d.amount, cur)}</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                  <button onClick={() => update((v) => ({ ...v, funds: v.funds.filter((x) => x.id !== f.id) }))} className="mt-3 inline-flex items-center gap-1 text-xs text-ink-3 hover:text-rose">
                    <Trash2 size={12} /> Remove fund
                  </button>
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      <Notice>Your worth isn&apos;t measured in savings. This is just one more way to see the life you&apos;re choosing.</Notice>

      <Sheet open={!!newFund} onClose={() => setNewFund(null)} title="New fund">
        {newFund && (
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={newFund.name} onChange={(e) => setNewFund({ ...newFund, name: e.target.value })} />
            </div>
            <div>
              <Label>Target</Label>
              <Input type="number" inputMode="decimal" value={newFund.target} onChange={(e) => setNewFund({ ...newFund, target: e.target.value })} />
            </div>
            <Button
              full
              disabled={!newFund.name.trim()}
              onClick={() => {
                update((v) => ({ ...v, funds: [...v.funds, { id: uid(), name: newFund.name.trim(), target: Number(newFund.target) || 0, deposits: [] }] }));
                setNewFund(null);
              }}
            >
              Create fund
            </Button>
          </div>
        )}
      </Sheet>

      <Sheet open={!!deposit} onClose={() => setDeposit(null)} title={`Add to ${deposit?.fund.name ?? ""}`}>
        {deposit && (
          <div className="space-y-4">
            <p className="text-sm text-ink-3">Record money you actually moved into savings.</p>
            <div>
              <Label>Amount</Label>
              <Input type="number" inputMode="decimal" value={deposit.amount} onChange={(e) => setDeposit({ ...deposit, amount: e.target.value })} />
            </div>
            <div>
              <Label>Note (optional)</Label>
              <Input value={deposit.note} onChange={(e) => setDeposit({ ...deposit, note: e.target.value })} placeholder="A sober week's worth" />
            </div>
            <Button
              full
              disabled={!(Number(deposit.amount) > 0)}
              onClick={() => {
                update((v) => ({
                  ...v,
                  funds: v.funds.map((f) =>
                    f.id === deposit.fund.id ? { ...f, deposits: [...f.deposits, { id: uid(), amount: Number(deposit.amount), date: dayKey(), note: deposit.note || undefined }] } : f,
                  ),
                }));
                setDeposit(null);
              }}
            >
              Save
            </Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
