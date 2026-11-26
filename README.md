# VEEV

A private, personal companion app for Veev: protecting her sobriety, steadying big emotions,
and building the life she wants. It's an installable, mobile-first PWA built with Next.js.

> VEEV supports therapy; it doesn't replace it. It is not a medical device and makes no clinical
> or HIPAA claims. In an emergency, call **911**. For a mental health crisis, call or text **988**.
> SAMHSA's National Helpline is **1-800-662-4357**. These numbers are hard-coded and work offline.

---

## Run it locally

Requirements: Node 20.9 or newer.

```bash
npm install
cp .env.example .env.local   # optional: fill in what you have
npm run dev                  # http://localhost:3000
```

Everything except Clarity (the AI companion) and cloud backup works with **no configuration at
all**. Data lives on the device.

Production build:

```bash
npm run build && npm start
```

The service worker (offline mode) only registers in a production build.

## Deploy (Vercel, recommended)

1. Push this repo to GitHub (private).
2. In Vercel, choose **Add New → Project**, import the repo, and keep the defaults (Next.js).
3. Add the environment variables below under **Settings → Environment Variables**.
4. Deploy. Open the URL on Veev's phone and choose **Share → Add to Home Screen** (iPhone) or
   **Install app** (Android/Chrome). It then opens full-screen to the Today page like a native app.

Any Node host that runs `next start` also works.

## What you need to provide

| What | Required? | Where it goes | Why |
|---|---|---|---|
| Anthropic API key | For Clarity | `ANTHROPIC_API_KEY` | Powers the AI companion, rewrites, idea builder, therapy prep, weekly reflection. Server-side only. |
| Access code **or** Supabase sign-in | Yes, if the API key is set | `VEEV_ACCESS_CODE`, or the Supabase vars (+ optional `VEEV_ALLOWED_EMAILS`) | Stops strangers from using the AI route and spending your credits. In production Clarity refuses to run without one. |
| Supabase project | Optional | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sign-in and an **encrypted** cloud backup so she can restore on a new phone. |

If you use Supabase: open the project's SQL editor and run [`supabase/schema.sql`](supabase/schema.sql).
It creates one `vaults` table with Row Level Security (each person can only read and write their
own row) and a `delete_my_account` function for in-app account deletion.

The simplest setup is an API key plus a long random `VEEV_ACCESS_CODE`, which Veev enters once in
**Me → Privacy & data**.

## Privacy model

- **Veev owns everything.** All data lives in one "vault" on her device (localStorage; photos,
  voice notes and videos in IndexedDB). She can view, edit, export and delete all of it from
  **Me → Privacy & data**.
- **Passcode lock.** When she sets a passcode, the vault is encrypted on the device with AES-GCM
  using a key derived from the passcode (PBKDF2-SHA-256, 310,000 iterations). The app auto-locks
  after a period in the background. The Help button stays reachable on the lock screen.
- **Cloud backup holds ciphertext only.** Sync requires a passcode, and only the encrypted vault is
  uploaded. The database owner, including whoever runs the Supabase project, cannot read her
  journals, letters or conversations. Media files stay on the device and are not synced.
- **Nobody else has access.** There is no admin view, partner view or sharing feature that runs
  without her. Nothing is ever sent automatically to anyone. Messages and summaries are only
  shared when she taps Share or Copy herself.
- **AI is opt-in.** Clarity asks for explicit consent first. She chooses which parts of her
  profile Clarity may remember (Me → What Clarity remembers). Requests go from her device to this
  app's server route, then to the Claude API. The route never logs message content, and there is
  no analytics in the app.
- **Safety first.** An on-device check watches for crisis language in Clarity and the Private
  Room and opens a full-screen support page with 911 / 988 / SAMHSA and her own contacts. The AI
  softens its tone automatically in those moments and after a lapse.

## Honest limitations

- **Notifications** only fire while VEEV is open or was recently used. Push notifications for a
  closed app would need a push service (e.g. Web Push with VAPID keys), which isn't included yet.
- **Media isn't synced** to the cloud (by design, for privacy and size). The data export can
  include it if she turns that option on.
- **Activity and place ideas are generic.** There are no real venue, map or booking integrations.
- **Clinical review.** The DBT-informed exercises, safety copy and crisis wording were written
  carefully but have not been reviewed by a clinician. Please have her therapist look them over.
- **Crisis detection is keyword-based** and will miss things. It is a safety net, not a monitor.
- **Forgotten passcode = lost data.** There is no recovery by design. Encourage a cloud backup or
  an exported file.
- UI primitives (buttons, sheets, toggles) are hand-written in `src/components/ui.tsx` in the
  shadcn/ui style rather than generated by the shadcn CLI.
- The name, tagline and AI companion name live in one place: `src/lib/brand.ts`.

## Project map

```
src/app/            pages (today, protect, help, clarity/*, journey/*, future/*, me/*, welcome)
src/app/api/        clarity (AI route), status (what's configured)
src/components/     shell, safety screen, UI primitives, media, charts, runners
src/lib/            vault store + encryption, sobriety math, safety screen, AI client, sync
src/server/         system prompts, auth + rate limit for the AI route
src/data/           verses (KJV, public domain), DBT studio sessions, copy and options
public/sw.js        offline cache; public/offline.html is the offline fallback with crisis numbers
supabase/schema.sql database setup for optional encrypted backup
```
