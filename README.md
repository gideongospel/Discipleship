# Discipleship Tracker

A PWA for churches to manage evangelism, follow-up, discipleship, attendance, and reporting.

## What's actually built in this pass

- **PIN-based login**: workers sign in with a Worker ID (4-digit, not secret) + PIN
  (6-digit, secret). Under the hood this still runs through Firebase Auth
  (email/password with a synthetic, never-shown email) — that's what gives the login
  a real brute-force lockout instead of being a bare Firestore lookup. See
  "Why not PIN-only" below before changing this.
- **No self-registration.** Every account is created by an administrator from the
  Admin Panel, active immediately — no approval workflow needed anymore.
- **First-run setup**: the very first person to open the app gets a one-time
  "create administrator" screen instead of a login form. After that, every other
  account (worker or additional admin) is created from inside the Admin Panel.
- Role-based access (administrator / worker), shared disciple assignment (a disciple
  can have multiple assigned workers), audit log writes, idle-timeout auto-logout
- Admin panel: add worker (auto-generates Worker ID + PIN, shown once), reset PIN,
  promote/demote roles, suspend/reactivate, and a disciple-assignment grid to
  add/remove workers from any disciple without leaving the panel
- Disciple CRUD, evangelism log, follow-up tracker, attendance tracking — unchanged
  from before, still shared across assigned workers
- CSV export, light/dark mode, responsive layout, PWA offline persistence — unchanged
- **Reports & Analytics page** (`/reports`): spiritual status distribution, evangelism
  receptivity and outcomes, follow-up status breakdown, average attendance by service
  type, and a 12-session attendance trend — all via `recharts`
- **Top-level error boundary**: catches unexpected render crashes anywhere in the app
  and shows a "Reload" screen instead of a blank white page. Doesn't catch async
  errors (network failures, etc.) — those are handled locally where they happen.

### Why not PIN-only (no Worker ID)?

If the PIN were the *only* credential, it would also have to be the lookup key —
meaning the app would need a way to publicly check "does this PIN exist" before
signing in. That turns login into something anyone can script: try all 1,000,000
six-digit combinations against a public Firestore lookup, no rate limiting, find
which ones are real, done. The Worker ID + PIN split keeps the actual secret (the
PIN) behind Firebase Auth's real sign-in endpoint, which throttles repeated failures
server-side. The Worker ID by itself isn't secret and doesn't need to be — it's a
lookup key, not a credential.

### PIN reset — a real limitation, not a design choice

Firebase's client SDK cannot change another user's password without a paid backend
function (Cloud Functions + Admin SDK). "Reset PIN" in the Admin Panel works around
this by **provisioning a brand-new account under the same Worker ID** and re-pointing
every disciple/follow-up record that referenced the old account to the new one. This
keeps the worker's history intact and the Worker ID unchanged from their point of
view, but:

- The old Firebase Auth account is left behind, orphaned. It's harmless — its
  synthetic email is never displayed anywhere and the Worker ID mapping no longer
  points to it, so there's no way to reach it through the app — but it does mean your
  Firebase Auth user list slowly accumulates dead entries over time.
- The re-pointing is done in a single Firestore batch (500 write limit). Fine for
  normal use; if one worker is ever assigned to more than ~500 disciples/follow-ups,
  this needs to be chunked — not done here.

## Google Calendar sync (built, but read this before enabling it)

Each worker can connect their **own personal** Google Calendar from Settings. When
scheduling a follow-up, they can check "Add to my Google Calendar" and it creates an
all-day event with a 1-hour-before reminder on their primary calendar.

**Why it works this way — no shared church calendar, no backend:**
Firebase's client SDK (and this app's Netlify-only, no-backend hosting) can't securely
store a long-lived Google refresh token or act as a shared church-wide calendar
service — that requires a server holding credentials, which costs money and adds
infrastructure. Instead, each worker authorizes their own Google account directly in
the browser (Google Identity Services), gets a short-lived access token (~1 hour, no
refresh token), and events go to *their own* calendar. Trade-offs that come with this:

- **No shared/admin calendar.** There's no single church calendar every follow-up
  lands on — it's each worker's personal Google Calendar, one at a time.
- **Reconnect roughly hourly, and on every fresh page load.** The access token lives
  in memory only (`GoogleCalendarContext`) and is lost on refresh — there's nowhere
  safe to persist it without a backend. This is not a bug; it's the actual limit of a
  no-backend OAuth flow.
- **"Testing" mode caps you at 100 connected Google accounts**, and each one has to be
  added by email in Google Cloud Console → OAuth consent screen → Test users. Fine for
  a church team; if you outgrow it, Google's app-verification review is a separate
  process, not something turned on with a setting.

**Isolation — how a Calendar glitch can't break the rest of the app:**
- The follow-up is always saved to Firestore *first*. Calendar sync is a separate,
  best-effort step that runs after — if it fails, the follow-up you scheduled is
  already safely saved, and you just see a small warning message.
- `googleCalendarService.ts` never throws into app-level code uncaught — every
  function either resolves or throws a plain `Error`, and both call sites
  (`GoogleCalendarContext` and `FollowUpTracker`) catch it locally.
- A top-level `ErrorBoundary` (`src/components/ErrorBoundary.tsx`) wraps the whole app
  as a last-resort net — if any component crashes unexpectedly (from this feature or
  otherwise), you get a "Reload" screen instead of a blank white page, and your data
  isn't affected since it already lives in Firestore, not component state.

### Google Calendar setup steps

1. Go to [console.cloud.google.com](https://console.cloud.google.com), create a
   project (or reuse one).
2. **APIs & Services → Library** → search "Google Calendar API" → Enable.
3. **APIs & Services → OAuth consent screen**:
   - User type: External
   - Publishing status: leave as **Testing** (free, no review, 100-user cap)
   - Add the Calendar scope: `.../auth/calendar.events`
   - Under **Test users**, add the email of every worker who'll use this feature
     (their personal Gmail/Google account — not their Discipleship Tracker Worker ID)
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - Authorized JavaScript origins: add your Netlify URL (e.g.
     `https://your-site.netlify.app`) and `http://localhost:5173` for local dev
   - No redirect URI needed for this flow
   - Copy the generated **Client ID**
5. Add it to Netlify: **Site settings → Environment variables** →
   `VITE_GOOGLE_CLIENT_ID` = the client ID from step 4. Redeploy.
6. If you never set this variable, the feature simply doesn't appear as broken — the
   Connect button shows a clear "not configured" message instead of failing silently.

## Deferred (per your instruction — not built)

- **Bulk / scheduled email** — needs Cloud Functions on the Blaze (paid) plan plus a
  scheduler. EmailJS (client-side) only works for single transactional sends.

## Known gaps / cut corners (be aware before calling this "done")

1. **Excel/PDF export**: only CSV is implemented. Excel/PDF need a library
   (e.g. `exceljs`, `pdf-lib`) wired into the export button — not done.
2. **Analytics/charts**: dashboard shows counts, not charts. No charting library wired in.
3. **Audit log viewer**: logs are written but there's no admin screen to read them yet.
4. **Concurrent-edit conflicts are now a real risk, not an edge case.** Since disciples
   can be shared by multiple workers, two workers editing the same disciple while both
   are offline is an expected scenario, not a rare one. Firestore's offline cache is
   last-write-wins — the second sync silently overwrites the first with no merge and no
   warning at the time it happens. What's implemented: a `lastEditedBy` / `lastEditedAt`
   field shown on the disciple profile, so you can see *after the fact* who made the
   last change that survived. What's NOT implemented: any warning at edit time, any
   merge of conflicting fields, or any record of what the overwritten edit contained.
   If two workers routinely edit the same disciples, budget for building real conflict
   handling (field-level version checks, or a "pending changes" queue) before relying on
   this in production.
5. **Bundle size**: ~1.37 MB minified (grew from ~968 KB after adding `recharts` for
   the analytics charts). Works fine, but if load time on slow connections matters,
   this needs code-splitting (dynamic imports per route) — not done.
6. **Approval email**: no longer applicable — accounts are created directly by the
   admin with no approval step, so there's nothing to email. If you want the admin to
   be notified when a worker's PIN is reset, that's a new feature, not something
   half-built here.
7. **Firestore composite indexes**: `firestore.indexes.json` lists the ones the queries
   need. If you skip deploying them, list queries that combine a `where` + `orderBy`
   will throw at runtime with a console link to auto-create the index — that's normal,
   just click the link once per query in dev, or `firebase deploy --only firestore:indexes`.

## Setup

```bash
npm install
cp .env.example .env   # fill in Firebase config from Firebase Console
npm run dev
```

### Firebase project setup
1. Create a Firebase project → enable **Authentication (Email/Password)** and **Firestore**.
   (Email/Password is still the underlying mechanism — the UI just never shows an
   email field to the user.)
2. Copy your web app config into `.env`.
3. Deploy rules and indexes:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore   # point at existing firestore.rules / firestore.indexes.json
   firebase deploy --only firestore:rules,firestore:indexes
   ```
4. Open the app. Since no administrator exists yet, you'll land on a one-time setup
   screen — enter your name and choose a 6-digit PIN. You'll get a Worker ID
   automatically. **Write both down — the PIN is never shown again.**
5. From the Admin Panel, add workers by name — each gets an auto-generated Worker ID
   and PIN shown once in a popup. Share those with the worker directly (in person, by
   phone) since there's no email delivery step.

### Deploy
- **Netlify**: connect the repo, `netlify.toml` is already configured. Add the `VITE_*`
  env vars in Netlify's dashboard.
- **Vercel**: connect the repo, `vercel.json` is already configured. Add the same env vars.

## Architecture notes

- `src/services/*` — all Firestore reads/writes live here, never called directly from
  components. If you add a new collection, add a service file, don't inline `getDocs` in
  a page.
- `src/firebase/config.ts` — Firestore is initialized with `persistentLocalCache` +
  multi-tab manager. This is what makes offline mode work; don't swap it back to
  `getFirestore()` or you'll lose offline support.
- `firestore.rules` is the actual security boundary. The `role === 'worker'` filters in
  the service files are for UX (so a worker's queries don't need to fetch-then-filter
  everything) — never rely on them for security.
- Role and status live on `users/{uid}` in Firestore, not in Firebase Auth custom claims.
  That means role changes take effect immediately (no token refresh needed) but every
  rule check does a `get()` on the user doc — fine at hundreds of users, worth revisiting
  with custom claims if you scale to tens of thousands of concurrent rule evaluations.

## Visual identity (The Supernatural Arena)

- **Palette**: warm ink-black and bone-white taken from the logo, with one gold accent
  (the light through the doors). The Tailwind `slate` scale is deliberately re-tinted warm
  in `src/index.css` (`@theme`), so any new screen inherits the brand automatically.
- **Type**: Montserrat (headings, echoing the logo's geometric wordmark) + Figtree (body),
  both bundled locally via `@fontsource-variable` so they work offline in the PWA.
- **Dark by default** (first visit); the toggle persists the choice.
- **Brand components**: `src/components/brand/` — `DoorsMark` (the doors slide open on the
  login screen), `Wordmark` (live-text logo lockup), `AuthShell` (login/setup stage).
- **Command palette**: Ctrl/Cmd + K searches disciples (name, phone, location) and jumps to any screen.
- **Notifications bell**: live list of follow-ups that are overdue or due within 3 days.
- The login tagline ("Every disciple known. Every follow-up kept.") lives in `AuthShell.tsx` — edit freely.
