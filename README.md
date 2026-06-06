# Journal

A personal daily journal — Next.js 16 (App Router), Supabase, Tailwind v4, Tiptap, Recharts, and Google Gemini.

## Features

- **Auth** — email/password via Supabase, all routes protected (account created from the Supabase dashboard).
- **Entries** — Tiptap rich-text editor (bold, italic, H1/H2, bullet lists), optional title (auto-generated from the first line), 5-emoji mood selector, comma-separated tags, date picker, 30-second `localStorage` draft autosave, and save/update/delete.
- **Home** — reverse-chronological cards (date, title, mood, tags, 100-char excerpt), full-text search, clickable tag filters, and an "On this day" widget for the entry from exactly one year ago.
- **Calendar** — monthly grid with a mood/dot marker on days that have an entry; click a day to open or create one.
- **Insights** — current writing streak, total entries, average words per entry, a 30-day mood bar chart (Recharts), and an AI weekly reflection.
- **Settings** — light/dark theme and a UI-only daily reminder (Notifications API + `setTimeout`).
- **Insights extras** — a GitHub-style **year mood heatmap** alongside the 30-day chart.
- **Image attachments** — drag, drop, or paste images into entries; stored in Supabase Storage under a per-user folder.
- **Export & backup** — download all entries as a single Markdown file, or print to PDF (`/export`).
- **Keyboard shortcuts** — `⌘/Ctrl+K` command palette (search + jump), `⌘/Ctrl+N` new entry, `⌘/Ctrl+S` save.
- **Mobile polish** — swipe-left to delete entries, a floating write button, and a denser calendar.
- **AI (Google Gemini, `gemini-2.0-flash`)** — journaling prompts, auto titles, weekly reflections, and monthly recaps (themes, mood shifts, favorite moments, gentle questions). All calls run server-side in `app/api/ai/*`; the API key is never exposed to the browser.

## Setup

1. **Install**

   ```bash
   npm install
   ```

2. **Database & storage** — open the Supabase SQL editor and run [`supabase/schema.sql`](supabase/schema.sql). It creates the `entries`, `weekly_reflections`, and `monthly_recaps` tables (with Row Level Security), plus the public **`journal-images`** storage bucket and its per-user upload policies. Re-run it any time you pull new features — it's idempotent.

3. **Account** — create your user in the Supabase dashboard (Authentication → Users). There is no signup page by design.

4. **Environment** — copy `.env.example` to `.env.local` and fill in:

   ```
   NEXT_PUBLIC_SUPABASE_URL=…
   NEXT_PUBLIC_SUPABASE_ANON_KEY=…
   GEMINI_API_KEY=…            # server-only
   ```

5. **Run**

   ```bash
   npm run dev
   ```

## Architecture notes (Next.js 16)

- **Auth/session** is refreshed in `proxy.ts` (Next 16 renamed Middleware → Proxy) and enforced again in the `(app)` layout and the data-access layer (`lib/dal.ts`).
- `cookies()`, `params`, and `searchParams` are async and awaited everywhere.
- Supabase clients are split into browser (`lib/supabase/client.ts`) and server (`lib/supabase/server.ts`) factories using `@supabase/ssr`.
- Mutations run through Server Actions in `app/actions/*`; reads go through `lib/entries.ts` / `lib/insights.ts`.
- Tailwind v4 uses CSS-based config in `app/globals.css`; dark mode is the `.dark` class strategy with a no-flash inline script.

## Project structure

```
app/
  layout.tsx            root layout + theme provider
  login/                public login page
  (app)/                protected shell (sidebar + bottom nav)
    page.tsx            home / entry list
    entry/new/          new entry
    entry/[id]/         view / edit entry
    calendar/           calendar view
    insights/           dashboard
    settings/           settings
  actions/              auth + entry server actions
  api/ai/               prompt · title · reflection (Gemini)
components/             editor, nav, home, calendar, insights, settings
lib/                    supabase clients, dal, entries, insights, gemini, text, types
proxy.ts               session refresh + route protection
supabase/schema.sql    tables + RLS
```
