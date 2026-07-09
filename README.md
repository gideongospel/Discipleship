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

## Deferred (per your instruction — not built)

- **Google Calendar sync** — needs an OAuth consent screen + server-side token
  storage/refresh. Not a client-only feature.
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
5. **Bundle size**: ~968 KB minified, mostly Firebase SDK. Works fine, but if load time
   on slow connections matters, this needs code-splitting (dynamic imports per route).
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
