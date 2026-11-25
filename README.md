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
  type, and a 12-session attendance trend — drawn with lightweight custom SVG (no chart library)
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

## Visual identity (The Supernatural Arena) — v2

A deliberately non-generic, editorial system. The principles, so future changes stay on-brand:

- **Flat and quiet.** Surfaces are separated by hairlines, not shadows or glows. One gold accent
  (the light through the doors) used sparingly. The Tailwind `slate` scale is re-tinted warm in
  `src/index.css`, so any new screen inherits the palette.
- **Type.** Newsreader (serif) for headings and numerals; Figtree for UI text; Montserrat only for the
  logo's lettering and small-cap labels. All bundled locally via `@fontsource-variable` (works offline).
- **Icons.** A custom angular set in `src/components/ui/icons.tsx` (square caps, mitered joins — the geometry
  of the logo) with church metaphors: lantern = outreach, calendar-with-cross = follow-ups, pew = attendance,
  key = admin, sprout = new converts. No icon library is installed.
- **Status** is shown as text with a small diamond (`.tag`), never a coloured pill.
- **Motion** is one easing curve, short distances, entrances play once: doors slide open on the login screen,
  the discipleship path draws itself, bars draw in, numbers count up, loading is the doors parting.
  `prefers-reduced-motion` turns it all off. **Rule:** entrance animations use `backwards` fill-mode, never
  `both` — a lingering transform traps `position: fixed` modals inside the page.
- **Charts** are custom (`BarList`, `TrendLine`); the charting library was removed (~350 KB lighter).
- **Dark by default** on first visit; the toggle persists.
- **Command palette**: Ctrl/Cmd + K. **Notifications bell**: follow-ups overdue or due within 3 days.
- The login tagline lives in `src/components/brand/AuthShell.tsx`.


## Incremental church operations upgrade

The `feature/church-events-calendar` branch adds the following without replacing the existing data model:

- **Announcements & Events** at `/events`: administrator-managed regular meeting templates and special programmes, draft/published/archived states, and published events on the dashboard.
- **Calendar export**: user-initiated Google Calendar links and downloadable ICS files. These do not write to a user's calendar automatically. When an event changes, users must update or remove their saved calendar copy.
- **General Evangelism Activities** at `/outreach-activities`: separate team activity records with dates, times, workers, people reached and outcomes. These are not attendance records or individual disciple conversations.
- **Follow-up improvements**: purpose, time, method, notes, edit-in-place, and pending/postponed/missed/completed outcomes. Existing follow-up documents remain readable.
- **Attendance records**: new `attendanceRecords` documents record the attendee, meeting, recorder and recording method. Existing `attendanceSessions` and their `presentDiscipleIds` remain the source for legacy attendance summaries; no backfill is required. New session IDs are deterministic to reduce duplicate meeting creation.
- **Dashboard and reports**: upcoming published events, calendar actions, general outreach totals and the expanded follow-up lifecycle.
- **In-app reminders**: one-time-per-user pop-ups for overdue/due-today follow-ups and events today/tomorrow. Dismissed alerts are remembered in that browser.

### Deploying the Firestore additions

After the code change is reviewed and merged, deploy the updated Firestore rules and indexes to the existing Firebase project:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

The new collections are `churchEvents`, `outreachActivities`, and `attendanceRecords`. They are created automatically when the first corresponding record is saved. Existing collections and documents are not migrated or deleted.


### Reporting, shepherding and church resources

- **Monthly and annual reports** at `/reports`: date-scoped summaries, worker/member filters, recorded attendance calculations, CSV export and print. Member attendance is measured from the first-contact date; worker attendance uses explicit self-attendance records. These are activity summaries, not spiritual assessments.
- **Shepherding reminders**: the dashboard surfaces follow-ups due today, overdue follow-ups and disciples with no follow-up recorded in the last 30 days. The 30-day value is currently a code-level default, not an administrator-configurable setting.
- **Encouragement**: the dashboard rotates through Scripture-grounded reminders using 1 Corinthians 15:58, Hebrews 6:10, Galatians 6:9, Colossians 3:23–24 and 1 Thessalonians 1:3.
- **Meeting Excerpts & Prayer Points** at `/meeting-library`: authorised administrators can draft, publish, edit and archive Sunday Service / Wednesday Bible Study teaching highlights and categorised church prayer focuses. Members can read and share published resources and mark a prayer focus as prayed about. This is not treated as evidence of an answered prayer.
- **Disciple contact actions**: profiles expose device-initiated call, WhatsApp and email links using saved contact details. The app does not send messages automatically.
- **Notifications**: in-app alerts cover due/overdue follow-ups, events today/tomorrow and recent teaching or prayer resources. Seen alert IDs are stored locally per user; these are not remote push notifications.

The new `churchResources` collection is created when the first excerpt or prayer point is saved. The `attendanceRecords` collection stores explicit attendance metadata; older session records continue to be supported through `attendanceSessions`.

### Remaining security decision before delegated administrators

The existing application has a single `administrator` role and the first-run system document currently stores only `adminCreated`, not a verified main-administrator UID. A safe delegated-admin implementation must first designate the existing account that will own the platform. Do not simply let any current administrator claim the main role or weaken the current rules. Once the main administrator account is explicitly identified, the role/permission changes can be enforced in Firestore rules and the Admin Panel.
