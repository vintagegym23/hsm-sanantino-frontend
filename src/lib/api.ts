import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

/** Unauthenticated instance — used by public pages */
export const api = axios.create({ baseURL: BASE_URL });

/** Authenticated instance — used by admin pages */
export const authApi = (token: string) =>
  axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${token}` },
  });
