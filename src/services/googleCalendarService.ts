// Google Calendar sync — deliberately self-contained. Nothing in the rest
// of the app imports internals from this file beyond the three functions
// below, and every one of them either resolves or throws a plain Error
// with a readable message. Callers are expected to try/catch and treat
// failure as "sync didn't happen this time," never as something that
// should block or roll back a Firestore write. See README for the
// architecture reasoning (no backend => per-worker personal calendar,
// session-scoped token, ~1hr expiry, manual reconnect).

const GIS_SRC = 'https://accounts.google.com/gsi/client'
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events'

let scriptLoadPromise: Promise<void> | null = null

function loadGisScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Not running in a browser.'))
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  if (scriptLoadPromise) return scriptLoadPromise

  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Google sign-in script.')))
      return
    }
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google sign-in script — check your connection.'))
    document.head.appendChild(script)
  })
  return scriptLoadPromise
}

/**
 * Opens Google's consent popup and resolves with a short-lived access
 * token (~1 hour). There is no refresh token in this flow — that's the
 * deliberate tradeoff for having no backend to store one securely. The
 * caller (GoogleCalendarContext) holds this token in memory only; it does
 * not survive a page reload.
 */
export async function connectGoogleCalendar(): Promise<string> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new Error(
      'Google Calendar isn\'t configured for this deployment (missing VITE_GOOGLE_CLIENT_ID). Add it in your Netlify environment variables.',
    )
  }

  await loadGisScript()

  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google sign-in script loaded but the API is unavailable. Try again.'))
      return
    }
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: CALENDAR_SCOPE,
        callback: (response) => {
          if (response.error || !response.access_token) {
            reject(new Error(response.error_description || 'Google sign-in was cancelled or denied.'))
            return
          }
          resolve(response.access_token)
        },
      })
      tokenClient.requestAccessToken()
    } catch (err) {
      reject(err instanceof Error ? err : new Error('Failed to start Google sign-in.'))
    }
  })
}

export interface CalendarEventInput {
  title: string
  description?: string
  date: string // ISO date, e.g. "2026-08-01"
  reminderMinutesBefore?: number
}

/**
 * Creates an all-day event on the connected user's PRIMARY calendar.
 * Throws a plain Error on any failure (expired token, network issue,
 * Google API error) — callers must catch this and treat it as
 * non-fatal to whatever core action (e.g. saving a follow-up) triggered it.
 */
export async function createCalendarEvent(accessToken: string, event: CalendarEventInput): Promise<void> {
  let res: Response
  try {
    res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary: event.title,
        description: event.description,
        start: { date: event.date },
        end: { date: event.date },
        reminders: {
          useDefault: false,
          overrides: [{ method: 'popup', minutes: event.reminderMinutesBefore ?? 60 }],
        },
      }),
    })
  } catch {
    throw new Error('Could not reach Google Calendar — check your connection and try again.')
  }

  if (res.status === 401) {
    throw new Error('Your Google Calendar connection expired. Reconnect it in Settings.')
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Google Calendar rejected the event (${res.status}).${body ? ` ${body.slice(0, 150)}` : ''}`)
  }
}
