import { initializeApp } from 'firebase/app'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getFunctions } from 'firebase/functions'

// All values come from environment variables — never hardcode Firebase
// config in source. Copy .env.example to .env and fill in your project's
// values (Firebase Console > Project Settings > General > Your apps).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)

// persistentLocalCache + multi-tab manager gives us:
//  - reads/writes served from IndexedDB when offline
//  - automatic re-sync to Firestore once connectivity returns
//  - consistent cache across multiple open tabs
// NOTE: this does NOT solve concurrent-edit conflicts (last-write-wins is
// still Firestore's default). If two workers edit the same disciple while
// both are offline, the later sync silently overwrites the earlier one.
// For a production rollout with multiple workers per disciple, add
// updatedAt version checks or move to a transaction-based merge strategy.
export const db = initializeFirestore(app, {
  // Optional fields left blank (e.g. createdBy on the very first admin, or an
  // empty next-follow-up date) arrive as `undefined`. Without this flag the
  // SDK throws and the whole save fails; with it, they are simply omitted.
  ignoreUndefinedProperties: true,
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
})

export const auth = getAuth(app)
export const functions = getFunctions(app)

// ---- Secondary app for admin-side account provisioning ----
// Firebase's client SDK signs you in as whichever user you just created
// with createUserWithEmailAndPassword. That's a problem when an ADMIN is
// creating a WORKER's account — it would hijack the admin's own session.
// Running a second, independent app instance lets us create/sign-in as a
// new worker account there without touching the primary app's session
// (where the admin stays signed in). We sign out of this instance
// immediately after each provisioning operation.
import { initializeApp as initializeSecondaryApp, getApps, deleteApp } from 'firebase/app'
import { getAuth as getSecondaryAuth } from 'firebase/auth'

export function getProvisioningAuth() {
  const name = 'provisioning'
  const existing = getApps().find((a) => a.name === name)
  const secondaryApp = existing ?? initializeSecondaryApp(firebaseConfig, name)
  return getSecondaryAuth(secondaryApp)
}

export async function teardownProvisioningApp() {
  const existing = getApps().find((a) => a.name === 'provisioning')
  if (existing) await deleteApp(existing)
}
