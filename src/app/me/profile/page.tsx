"use client";

import { useStore } from "@/lib/store";
import type { Profile } from "@/lib/types";
import { Card, Input, Label, ListEditor, PageHeader, Section, TextArea, Segmented, Button, Chips } from "@/components/ui";
import { APPEALING, COPING_TOOLS, GROUNDING, LOVES, WARNING_SIGNS, QUALITIES, VALUES } from "@/data/options";
import { dayKey } from "@/lib/util";

export default function ProfilePage() {
  const { vault, update } = useStore();
  const p = vault.profile;
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => update((x) => ({ ...x, profile: { ...x.profile, [k]: v } }));
  const text = (k: keyof Profile, label: string, rows = 3) => (
    <div>
      <Label>{label}</Label>
      <TextArea voice rows={rows} value={(p[k] as string) ?? ""} onChange={(v) => set(k, v as never)} />
    </div>
  );

  return (
    <div>
      <PageHeader back="/me" eyebrow="About me" title="Everything here is yours to change." subtitle="Changes save automatically." />
      <div className="space-y-8">
        <Section title="Me">
          <div className="space-y-5">
            <div>
              <Label>Name</Label>
              <Input value={p.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            {text("becoming", "Who I want to become")}
            {text("idealLife", "My ideal life")}
            {text("happiness", "What makes me genuinely happy")}
            <div>
              <Label>What I love</Label>
              <ListEditor value={p.hobbies} onChange={(v) => set("hobbies", v)} suggestions={LOVES} />
            </div>
            <div>
              <Label>My goals</Label>
              <ListEditor value={p.goals} onChange={(v) => set("goals", v)} />
            </div>
          </div>
        </Section>

        <Section title="Who I'm becoming">
          <div className="space-y-5">
            <div>
              <Label hint="Used to personalize reminders and conversations. Never a score.">Qualities I&apos;m growing into</Label>
              <Chips options={QUALITIES} value={p.qualities} onChange={(v) => set("qualities", v)} />
            </div>
            <div>
              <Label>My values</Label>
              <Chips options={VALUES} value={p.values} onChange={(v) => set("values", v)} />
            </div>
            {text("familyHopes", "Family dreams", 2)}
            {text("moneyHopes", "Money and freedom", 2)}
            {text("fitnessGoals", "Fitness and wellness", 2)}
            {text("soberJoys", "What I love about sober life", 2)}
          </div>
        </Section>

        <Section title="My world">
          <div className="space-y-5">
            <div>
              <Label hint="Pets, people, little things my companion can ask about.">My world</Label>
              <ListEditor value={p.myWorld} onChange={(v) => set("myWorld", v)} placeholder="Add someone or something" />
            </div>
            {text("family", "My parents and family", 3)}
            <div>
              <Label>Music I love</Label>
              <Input value={p.favMusic} onChange={(e) => set("favMusic", e.target.value)} />
            </div>
            <div>
              <Label>Movies and shows I love</Label>
              <Input value={p.favMovies} onChange={(e) => set("favMovies", e.target.value)} />
            </div>
          </div>
        </Section>

        <Section title="What I'm working on">
          <div className="space-y-5">
            <div>
              <Label hint="What tends to set off big feelings. Only you and your companion see this.">My triggers</Label>
              <ListEditor value={p.bpdTriggers} onChange={(v) => set("bpdTriggers", v)} placeholder="Add a trigger" />
            </div>
            <div>
              <Label hint="So your companion can catch these moments with you, kindly.">When I'm upset I sometimes…</Label>
              <ListEditor value={p.impulses} onChange={(v) => set("impulses", v)} placeholder="Add one" />
            </div>
          </div>
        </Section>

        <Section title="Sobriety">
          <div className="space-y-5">
            {text("whySober", "Why I want to stay sober")}
            {text("afterFirstDrink", "What usually happens after my first drink")}
            <div>
              <Label>When drinking sounds appealing</Label>
              <ListEditor value={p.appealingSituations} onChange={(v) => set("appealingSituations", v)} suggestions={APPEALING} />
            </div>
            <div>
              <Label>My early warning signs</Label>
              <ListEditor value={p.warningSigns} onChange={(v) => set("warningSigns", v)} suggestions={WARNING_SIGNS} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Current stretch began</Label>
                <Input
                  type="date"
                  max={dayKey()}
                  value={vault.streaks.find((s) => !s.end)?.start ?? p.sobrietyStart}
                  onChange={(e) =>
                    update((x) => ({
                      ...x,
                      profile: { ...x.profile, sobrietyStart: e.target.value },
                      streaks: x.streaks.length ? x.streaks.map((s) => (s.end ? s : { ...s, start: e.target.value })) : [{ start: e.target.value }],
                    }))
                  }
                />
              </div>
              <div>
                <Label>Daily spend estimate</Label>
                <Input type="number" value={p.dailyDrinkSpend} onChange={(e) => set("dailyDrinkSpend", Number(e.target.value) || 0)} />
              </div>
            </div>
            <Button href="/back" variant="ghost" size="sm">
              Record a lapse (keeps all past sober days)
            </Button>
          </div>
        </Section>

        <Section title="Tools">
          <div className="space-y-5">
            <div>
              <Label>Coping tools I&apos;ve learned</Label>
              <ListEditor value={p.copingTools} onChange={(v) => set("copingTools", v)} suggestions={COPING_TOOLS} />
            </div>
            <div>
              <Label>What grounds me</Label>
              <ListEditor value={p.grounding} onChange={(v) => set("grounding", v)} suggestions={GROUNDING} />
            </div>
            <div>
              <Label>People I can turn to</Label>
              <Input value={p.safePeople} onChange={(e) => set("safePeople", e.target.value)} />
            </div>
          </div>
        </Section>

        <Section title="How my companion talks to me">
          <Card className="space-y-4">
            <Segmented
              value={p.directness}
              onChange={(v) => set("directness", v)}
              options={[
                { value: "gentle", label: "Gentle" },
                { value: "firm", label: "Firm & warm" },
                { value: "straight", label: "Straight talk" },
              ]}
            />
            {text("communicationStyle", "Communication style", 2)}
          </Card>
        </Section>

        <Section title="For future me">{text("futureSelfNote", "What I want my future self to remember", 5)}</Section>
      </div>
    </div>
  );
}
