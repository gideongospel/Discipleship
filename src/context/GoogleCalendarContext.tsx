import { createContext, useContext, useState, type ReactNode } from 'react'
import { connectGoogleCalendar } from '../services/googleCalendarService'

interface GoogleCalendarContextValue {
  accessToken: string | null
  connectedAt: number | null
  connecting: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => void
  isLikelyExpired: () => boolean
}

const GoogleCalendarContext = createContext<GoogleCalendarContextValue | undefined>(undefined)

// Google access tokens from this flow last ~1 hour. We don't get an exact
// expiry back from the token client callback, so this is a conservative
// estimate used only to show a "you may need to reconnect" hint — the
// real source of truth is whatever Google's API returns (401) when a
// sync actually happens.
const ASSUMED_TOKEN_LIFETIME_MS = 55 * 60 * 1000

export function GoogleCalendarProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [connectedAt, setConnectedAt] = useState<number | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connect = async () => {
    setConnecting(true)
    setError(null)
    try {
      const token = await connectGoogleCalendar()
      setAccessToken(token)
      setConnectedAt(Date.now())
    } catch (err) {
      // Isolated on purpose: a failure here only updates this context's
      // own error state. It cannot throw into whatever screen the user
      // was on, and it never touches Firestore or auth state.
      setError(err instanceof Error ? err.message : 'Failed to connect Google Calendar.')
      setAccessToken(null)
      setConnectedAt(null)
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = () => {
    setAccessToken(null)
    setConnectedAt(null)
    setError(null)
  }

  const isLikelyExpired = () => {
    if (!connectedAt) return true
    return Date.now() - connectedAt > ASSUMED_TOKEN_LIFETIME_MS
  }

  return (
    <GoogleCalendarContext.Provider
      value={{ accessToken, connectedAt, connecting, error, connect, disconnect, isLikelyExpired }}
    >
      {children}
    </GoogleCalendarContext.Provider>
  )
}

export function useGoogleCalendar() {
  const ctx = useContext(GoogleCalendarContext)
  if (!ctx) throw new Error('useGoogleCalendar must be used within GoogleCalendarProvider')
  return ctx
}
