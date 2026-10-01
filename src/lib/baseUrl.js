// The one place the backend API URL lives. Flip USE_LIVE_API by hand:
//   true  → the live API at LIVE_API_ORIGIN
//   false → the local server, through the Vite proxy (localhost:3001)
const USE_LIVE_API = true;
const LIVE_API_ORIGIN = 'https://tessera-api.isseylab.com';

export const API_BASE_URL = `${USE_LIVE_API ? LIVE_API_ORIGIN : ''}/api`;
