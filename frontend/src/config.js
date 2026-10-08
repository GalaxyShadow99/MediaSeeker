// Centralized API configuration for localhost, LAN and Docker networks
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined'
    ? `http://${window.location.hostname}:3000`
    : 'http://localhost:3000')
