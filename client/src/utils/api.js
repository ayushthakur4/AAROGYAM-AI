export function getApiBaseUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '')
  }
  // In development and test mode, connect to the local development server
  if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
    return 'http://localhost:3000'
  }
  // In production, connect to the live Render backend
  return 'https://aarogyam-ai-ktrn.onrender.com'
}
