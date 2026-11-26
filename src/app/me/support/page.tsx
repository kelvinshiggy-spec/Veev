"use client";

import { useState } from "react";
import { Phone, MessageSquare, Plus, Pencil } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, Chips, Empty, Input, Label, Notice, PageHeader, Sheet, Section, Card } from "@/components/ui";
import { SUPPORT_ROLES, SUPPORT_TYPES } from "@/data/options";
import { SUPPORT_TEMPLATES } from "@/data/messages";
import { uid } from "@/lib/util";
import type { Contact } from "@/lib/types";

export default function Support() {
  const { vault, update } = useStore();
  const [edit, setEdit] = useState<Contact | null>(null);
  const blank = (): Contact => ({ id: uid(), name: "", role: "Family", phone: "", supports: [] });

  return (
    <div>
      <PageHeader
        back="/me"
        eyebrow="My people"
        title="Real people, one tap away."
        action={
          <button onClick={() => setEdit(blank())} className="grid h-11 w-11 place-items-center rounded-full bg-forest text-on-forest" aria-label="Add person">
            <Plus size={18} />
          </button>
        }
      />
      <Notice>VEEV never contacts anyone automatically or shares anything. Calls and texts only happen when you tap and send them yourself.</Notice>

      <div className="mt-6 space-y-2">
        {vault.contacts.length === 0 ? (
          <Empty title="Who's in your corner?" body="Your therapist, a sponsor, family, a friend who gets it. Add what each person is good for." action={<Button onClick={() => setEdit(blank())}>Add someone</Button>} />
        ) : (
          vault.contacts.map((c) => (
            <div key={c.id} className="card p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-ink-3">{c.role}</div>
                </div>
                <button onClick={() => setEdit(c)} className="grid h-10 w-10 place-items-center rounded-full text-ink-3" aria-label={`Edit ${c.name}`}>
                  <Pencil size={15} />
                </button>
                {c.phone && (
                  <>
                    <a href={`sms:${c.phone}`} className="grid h-10 w-10 place-items-center rounded-full bg-surface-2" aria-label={`Text ${c.name}`}>
                      <MessageSquare size={16} />
                    </a>
                    <a href={`tel:${c.phone}`} className="grid h-10 w-10 place-items-center rounded-full bg-forest text-on-forest" aria-label={`Call ${c.name}`}>
                      <Phone size={16} />
                    </a>
                  </>
                )}
              </div>
              {c.supports.length > 0 && <div className="mt-2 text-xs text-ink-2">Good for: {c.supports.join(", ")}</div>}
            </div>
          ))
        )}
      </div>

      <Section title="Message templates" className="mt-8">
        <Card>
          <ul className="space-y-2 text-[15px] text-ink-2">
            {SUPPORT_TEMPLATES.map((t) => (
              <li key={t}>“{t}”</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-3">Use these from “I need to talk”. They open in your messages app for you to edit and send.</p>
        </Card>
      </Section>

      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.name || "Add someone"}>
        {edit && (
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input type="tel" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} />
            </div>
            <div>
              <Label>Role</Label>
              <Chips options={SUPPORT_ROLES} value={[edit.role]} multi={false} onChange={(v) => v[0] && setEdit({ ...edit, role: v[0] })} />
            </div>
            <div>
              <Label>Good for</Label>
              <Chips options={SUPPORT_TYPES} value={edit.supports} onChange={(v) => setEdit({ ...edit, supports: v })} />
            </div>
            <Button
              full
              disabled={!edit.name.trim()}
              onClick={() => {
                update((v) => ({ ...v, contacts: [...v.contacts.filter((c) => c.id !== edit.id), edit] }));
                setEdit(null);
              }}
            >
              Save
            </Button>
            {vault.contacts.some((c) => c.id === edit.id) && (
              <button
                onClick={() => {
                  update((v) => ({ ...v, contacts: v.contacts.filter((c) => c.id !== edit.id) }));
                  setEdit(null);
                }}
                className="w-full py-2 text-sm text-ink-3 hover:text-rose"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}
