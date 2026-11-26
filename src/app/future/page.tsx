"use client";

import { Lightbulb, Mountain, Wallet, Compass, Camera, Mail, ChevronRight, Feather, Music } from "lucide-react";
import { useStore } from "@/lib/store";
import { LinkCard, PageHeader, Section, Progress } from "@/components/ui";
import { MediaView } from "@/components/media";
import { sobrietyStats } from "@/lib/sobriety";
import { money } from "@/lib/util";

export default function Future() {
  const { vault } = useStore();
  const s = sobrietyStats(vault);
  const inbox = vault.ideas.filter((i) => i.status === "inbox").length;
  const covers = vault.vision.filter((v) => v.imageId).slice(0, 3);
  const allocated = vault.funds.reduce((a, f) => a + f.deposits.reduce((b, d) => b + d.amount, 0), 0);
  const target = vault.funds.reduce((a, f) => a + f.target, 0);
  const plans = vault.activities.filter((a) => a.status === "planned").length;

  return (
    <div>
      <PageHeader eyebrow="My Future" title="Your dream life, loading…" subtitle={vault.profile.becoming ? `“${vault.profile.becoming}”` : undefined} />

      <LinkCard href="/future/manifesto" className="sunlit mb-3">
        <div className="eyebrow">Signature</div>
        <div className="mt-1 flex items-center justify-between">
          <div>
            <div className="font-serif text-[28px] leading-tight">{vault.manifesto.title || "My Life Manifesto"}</div>
            <div className="text-sm text-ink-3">
              {vault.manifesto.text ? (vault.manifesto.approved ? "Approved. Yours." : "Draft ready for you to make yours") : "Write the life you're building"}
            </div>
          </div>
          <Feather size={22} className="text-gold" />
        </div>
      </LinkCard>

      <LinkCard href="/future/vision" className="overflow-hidden !p-0">
        {covers.length > 0 ? (
          <div className="grid h-44 grid-cols-3 gap-0.5">
            {covers.map((c) => (
              <MediaView key={c.id} id={c.imageId!} type="image" className="h-44 w-full object-cover" />
            ))}
          </div>
        ) : (
          <div className="h-36 bg-gradient-to-br from-gold-soft via-bg-2 to-forest-soft" />
        )}
        <div className="flex items-center justify-between p-5">
          <div>
            <div className="font-serif text-2xl">Vision board</div>
            <div className="text-sm text-ink-3">{vault.vision.length ? `${vault.vision.length} things you're building` : "Your dream home, car, mountains, family"}</div>
          </div>
          <Mountain size={20} className="text-gold" />
        </div>
      </LinkCard>

      <LinkCard href="/future/ideas" className="mt-3">
        <div className="flex items-center gap-4">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-gold text-[#1b1a17]">
            <Lightbulb size={18} />
          </span>
          <div className="flex-1">
            <div className="font-medium">Idea inbox</div>
            <div className="text-sm text-ink-3">{inbox ? `${inbox} ideas waiting to be built` : "Dump an idea. Turn it into something real."}</div>
          </div>
          <ChevronRight size={18} className="text-ink-3" />
        </div>
      </LinkCard>

      <Section title="Living it" className="mt-7">
        <div className="grid grid-cols-2 gap-2">
          <LinkCard href="/future/sober-life" className="p-4">
            <Compass size={18} className="mb-3 text-forest" />
            <div className="font-medium">Something to look forward to</div>
            <div className="text-xs text-ink-3">{plans ? `${plans} plans ahead` : "Weekends, dates, adventures"}</div>
          </LinkCard>
          <LinkCard href="/future/finances" className="p-4">
            <Wallet size={18} className="mb-3 text-forest" />
            <div className="font-medium">Financial freedom</div>
            <div className="text-xs text-ink-3">{money(s.estSaved, vault.profile.currency)} est. not spent</div>
            {target > 0 && <Progress value={(allocated / target) * 100} className="mt-2" />}
          </LinkCard>
          <LinkCard href="/future/memories" className="p-4">
            <Camera size={18} className="mb-3 text-forest" />
            <div className="font-medium">Remember this feeling</div>
            <div className="text-xs text-ink-3">{vault.memories.length} sober memories</div>
          </LinkCard>
          <LinkCard href="/future/letters" className="p-4">
            <Mail size={18} className="mb-3 text-forest" />
            <div className="font-medium">Letters from my sober self</div>
            <div className="text-xs text-ink-3">{vault.letters.length} written</div>
          </LinkCard>
          <LinkCard href="/future/vibes" className="col-span-2 p-4">
            <Music size={18} className="mb-3 text-forest" />
            <div className="font-medium">Watch & listen</div>
            <div className="text-xs text-ink-3">Movies, shows and music for your mood</div>
          </LinkCard>
        </div>
      </Section>

      {vault.profile.idealLife && (
        <Section title="My ideal life">
          <p className="font-serif text-xl leading-snug text-ink-2">{vault.profile.idealLife}</p>
        </Section>
      )}
    </div>
  );
}
