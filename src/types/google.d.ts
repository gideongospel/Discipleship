// Minimal shape of the `google` global injected by the Google Identity
// Services script (https://accounts.google.com/gsi/client). Only the
// pieces this app actually uses are typed — not the full GIS API surface.
interface Window {
  google?: {
    accounts: {
      oauth2: {
        initTokenClient(config: {
          client_id: string
          scope: string
          callback: (response: { access_token?: string; error?: string; error_description?: string }) => void
        }): { requestAccessToken: (opts?: { prompt?: string }) => void }
      }
    }
  }
}
