"use client";

import { useEffect, useState } from "react";
import { Download, Lock, Cloud, Trash2, KeyRound } from "lucide-react";
import { useStore } from "@/lib/store";
import { useAiStatus, getAccessCode, setAccessCode } from "@/lib/ai";
import { supabase } from "@/lib/supabase";
import { pullSealed, pushSealed, setSyncEnabled, syncEnabled, deleteAccount } from "@/lib/sync";
import { Button, Card, Input, Label, Notice, PageHeader, Section, Toggle, Segmented } from "@/components/ui";
import { getMedia } from "@/lib/media";
import { b64 } from "@/lib/crypto";
import { BRAND } from "@/lib/brand";

export default function Privacy() {
  const { vault, update, hasLock, setPasscode, removePasscode } = useStore();
  const st = useAiStatus();
  return (
    <div>
      <PageHeader back="/me" eyebrow="Privacy & data" title="Yours, and only yours." />

      <Section title="Where your information lives">
        <Card className="space-y-3 text-[15px] leading-relaxed text-ink-2">
          <p>
            <strong className="font-medium text-ink">On this device.</strong> Everything you write, record and track is stored in this browser on this phone. Photos, voice notes and videos never leave it.
          </p>
          <p>
            <strong className="font-medium text-ink">Optional encrypted backup.</strong> If you turn on sync, an encrypted copy is stored in the cloud. It&apos;s locked with your passcode before it leaves your phone, so the person who set up {BRAND.name}, and the database provider, can&apos;t read it.
          </p>
          <p>
            <strong className="font-medium text-ink">Clarity&apos;s AI.</strong> When you talk to Clarity (and only then), your message, the conversation, and the profile details you allow are sent over an encrypted connection to the app&apos;s server and on to Anthropic to write a reply. The server doesn&apos;t log what you write. Anthropic&apos;s API terms apply to that processing.
          </p>
          <p>
            <strong className="font-medium text-ink">No tracking.</strong> No analytics, ads or trackers. Nothing is shared with anyone, ever, unless you choose to share it yourself.
          </p>
          <p className="text-sm text-ink-3">{BRAND.name} is a personal wellness tool and does not claim HIPAA compliance.</p>
        </Card>
      </Section>

      <LockSection hasLock={hasLock} setPasscode={setPasscode} removePasscode={removePasscode} minutes={vault.settings.lockMinutes} setMinutes={(m) => update((v) => ({ ...v, settings: { ...v.settings, lockMinutes: m } }))} />

      <Section title="Clarity's AI">
        <Card>
          <Toggle
            checked={vault.settings.aiConsent}
            onChange={(v) => update((x) => ({ ...x, settings: { ...x.settings, aiConsent: v } }))}
            label="Allow AI processing"
            hint="Off means nothing is ever sent to the AI service. Everything else keeps working."
          />
          <p className="pb-2 text-sm text-ink-3">
            Status: {!st.loaded ? "checking…" : st.offline ? "offline" : st.ai ? "connected" : "not set up on this deployment"}
          </p>
          {st.accessCode && <AccessCode />}
        </Card>
      </Section>

      {st.supabase ? <SyncSection hasLock={hasLock} /> : (
        <Section title="Backup & sync">
          <Notice>Cloud backup isn&apos;t set up on this deployment, so everything stays on this device only. Export a copy below if you&apos;d like a backup.</Notice>
        </Section>
      )}

      <ExportSection />
      <DeleteSection />
    </div>
  );
}

function LockSection({
  hasLock,
  setPasscode,
  removePasscode,
  minutes,
  setMinutes,
}: {
  hasLock: boolean;
  setPasscode: (p: string) => Promise<void>;
  removePasscode: () => Promise<void>;
  minutes: number;
  setMinutes: (m: number) => void;
}) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [msg, setMsg] = useState("");
  const [editing, setEditing] = useState(false);
  return (
    <Section title="Privacy lock">
      <Card>
        <div className="flex items-center gap-3">
          <Lock size={18} className={hasLock ? "text-forest" : "text-ink-3"} />
          <div className="flex-1 text-[15px]">{hasLock ? "On. Your data is encrypted on this device." : "Off"}</div>
        </div>
        {(editing || !hasLock) && (
          <div className="mt-4 space-y-3">
            <Input type="password" placeholder="New passcode (6+ characters)" value={a} onChange={(e) => setA(e.target.value)} autoComplete="new-password" />
            <Input type="password" placeholder="Confirm passcode" value={b} onChange={(e) => setB(e.target.value)} autoComplete="new-password" />
            <p className="text-xs text-ink-3">If you forget it, nobody can recover your data, including us. Choose something you&apos;ll remember.</p>
            <Button
              full
              disabled={a.length < 6 || a !== b}
              onClick={async () => {
                await setPasscode(a);
                setA("");
                setB("");
                setEditing(false);
                setMsg("Passcode set. Your data is now encrypted.");
              }}
            >
              {hasLock ? "Change passcode" : "Turn on lock"}
            </Button>
          </div>
        )}
        {hasLock && !editing && (
          <div className="mt-4 space-y-3">
            <div>
              <Label>Lock after being away for</Label>
              <Segmented
                value={String(minutes)}
                onChange={(v) => setMinutes(Number(v))}
                options={[
                  { value: "1", label: "1 min" },
                  { value: "5", label: "5 min" },
                  { value: "30", label: "30 min" },
                ]}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="soft" onClick={() => setEditing(true)}>
                Change passcode
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await removePasscode();
                  setMsg("Lock turned off.");
                }}
              >
                Turn off
              </Button>
            </div>
          </div>
        )}
        {msg && <p className="mt-3 text-sm text-forest">{msg}</p>}
        <p className="mt-3 text-xs text-ink-3">The Help button and crisis numbers stay available on the lock screen.</p>
      </Card>
    </Section>
  );
}

function AccessCode() {
  const [code, setCode] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => setCode(getAccessCode()), []);
  return (
    <div className="space-y-2 pb-3">
      <Label hint="This deployment asks for a private access code before Clarity will reply.">
        <span className="inline-flex items-center gap-2">
          <KeyRound size={14} /> Access code
        </span>
      </Label>
      <div className="flex gap-2">
        <Input type="password" value={code} onChange={(e) => setCode(e.target.value)} />
        <Button
          variant="soft"
          onClick={() => {
            setAccessCode(code.trim());
            setSaved(true);
          }}
        >
          Save
        </Button>
      </div>
      {saved && <p className="text-sm text-forest">Saved on this device.</p>}
    </div>
  );
}

function SyncSection({ hasLock }: { hasLock: boolean }) {
  const { sealForSync, importSealed } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<string | null>(null);
  const [on, setOn] = useState(false);
  const [msg, setMsg] = useState("");
  const [restoreCode, setRestoreCode] = useState("");
  const [last, setLast] = useState("");

  useEffect(() => {
    setOn(syncEnabled());
    try {
      setLast(localStorage.getItem("elevate.lastSync") ?? "");
    } catch {}
    supabase()?.auth.getUser().then(({ data }) => setUser(data.user?.email ?? null));
  }, []);

  const sb = supabase()!;
  return (
    <Section title="Encrypted backup & sync">
      <Card className="space-y-4">
        {!user ? (
          <>
            <p className="text-[15px] text-ink-2">Sign in to back up an encrypted copy and use {BRAND.name} on another device.</p>
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <Input type="password" placeholder="Account password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            <div className="grid grid-cols-2 gap-2">
              <Button
                disabled={!email || password.length < 8}
                onClick={async () => {
                  const { data, error } = await sb.auth.signInWithPassword({ email, password });
                  setMsg(error ? error.message : "");
                  setUser(data.user?.email ?? null);
                }}
              >
                Sign in
              </Button>
              <Button
                variant="outline"
                disabled={!email || password.length < 8}
                onClick={async () => {
                  const { data, error } = await sb.auth.signUp({ email, password });
                  setMsg(error ? error.message : data.session ? "Account created." : "Check your email to confirm, then sign in.");
                  if (data.session) setUser(data.user?.email ?? null);
                }}
              >
                Create account
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Cloud size={18} className="text-forest" />
              <div className="flex-1 text-sm">Signed in as {user}</div>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await sb.auth.signOut();
                  setUser(null);
                }}
              >
                Sign out
              </Button>
            </div>
            {!hasLock ? (
              <Notice>Turn on the privacy lock above first. Your passcode is what encrypts the backup.</Notice>
            ) : (
              <>
                <Toggle
                  checked={on}
                  onChange={(v) => {
                    setSyncEnabled(v);
                    setOn(v);
                  }}
                  label="Back up automatically"
                  hint="Encrypted on this device before upload. Media stays on the device."
                />
                <Button
                  variant="soft"
                  onClick={async () => {
                    const s = await sealForSync();
                    if (!s) return setMsg("Unlock first.");
                    const r = await pushSealed(s);
                    setMsg(r.error ?? "Backed up.");
                    if (!r.error) {
                      const t = new Date().toISOString();
                      setLast(t);
                      try {
                        localStorage.setItem("elevate.lastSync", t);
                      } catch {}
                    }
                  }}
                >
                  Back up now
                </Button>
              </>
            )}
            <div className="border-t border-line pt-4">
              <Label hint="Replaces what's on this device with your cloud backup.">Restore from backup</Label>
              <div className="flex gap-2">
                <Input type="password" placeholder="Passcode used for the backup" value={restoreCode} onChange={(e) => setRestoreCode(e.target.value)} />
                <Button
                  variant="outline"
                  disabled={!restoreCode}
                  onClick={async () => {
                    const r = await pullSealed();
                    if (r.error || !r.sealed) return setMsg(r.error ?? "Nothing found.");
                    const ok = await importSealed(r.sealed, restoreCode);
                    setMsg(ok ? "Restored." : "That passcode didn't unlock the backup.");
                  }}
                >
                  Restore
                </Button>
              </div>
            </div>
          </>
        )}
        {last && <p className="text-xs text-ink-3">{last.startsWith("error:") ? `Last backup failed: ${last.slice(6)}` : `Last backup ${new Date(last).toLocaleString()}`}</p>}
        {msg && <p className="text-sm text-forest">{msg}</p>}
      </Card>
    </Section>
  );
}

function ExportSection() {
  const { vault } = useStore();
  const [withMedia, setWithMedia] = useState(false);
  const [busy, setBusy] = useState(false);
  const exportAll = async () => {
    setBusy(true);
    const media: Record<string, { type: string; data: string }> = {};
    if (withMedia) {
      const ids = [
        ...vault.memories.map((m) => m.mediaId),
        ...vault.letters.map((l) => l.mediaId),
        ...vault.vision.map((v) => v.imageId),
      ].filter(Boolean) as string[];
      for (const id of ids) {
        const b = await getMedia(id).catch(() => undefined);
        if (b) media[id] = { type: b.type, data: b64(new Uint8Array(await b.arrayBuffer())) };
      }
    }
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), app: BRAND.name, vault, media }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${BRAND.name.toLowerCase()}-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    setBusy(false);
  };
  return (
    <Section title="Export">
      <Card>
        <p className="text-[15px] text-ink-2">Download everything as a file you keep. It isn&apos;t encrypted, so store it somewhere private.</p>
        <Toggle checked={withMedia} onChange={setWithMedia} label="Include photos, voice notes and videos" />
        <Button variant="outline" full onClick={exportAll} disabled={busy}>
          <Download size={16} /> {busy ? "Preparing…" : "Export my data"}
        </Button>
      </Card>
    </Section>
  );
}

function DeleteSection() {
  const { wipeEverything } = useStore();
  const st = useAiStatus();
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  return (
    <Section title="Delete">
      <Card className="space-y-4 border-rose/30">
        <p className="text-[15px] text-ink-2">Permanently erase everything on this device{st.supabase ? ", and optionally your account and cloud backup" : ""}. This can&apos;t be undone.</p>
        <Input placeholder='Type "DELETE" to confirm' value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <Button
          variant="danger"
          full
          disabled={confirm !== "DELETE"}
          onClick={async () => {
            await wipeEverything();
            window.location.replace("/welcome");
          }}
        >
          <Trash2 size={16} /> Erase this device
        </Button>
        {st.supabase && (
          <Button
            variant="outline"
            full
            disabled={confirm !== "DELETE"}
            onClick={async () => {
              const r = await deleteAccount();
              if (r.error) return setMsg(r.error);
              await wipeEverything();
              window.location.replace("/welcome");
            }}
          >
            Delete my account, cloud backup and this device
          </Button>
        )}
        {msg && <p className="text-sm text-rose">{msg}</p>}
      </Card>
    </Section>
  );
}
