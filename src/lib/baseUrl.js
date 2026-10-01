// The one place the backend API URL lives. Change API_ORIGIN to move the API.
// In dev the Vite proxy forwards /api to localhost:3001, so no origin is needed.
const API_ORIGIN = 'https://tessera-api.isseylab.com';

export const API_BASE_URL = `${import.meta.env.DEV ? '' : API_ORIGIN}/api`;
