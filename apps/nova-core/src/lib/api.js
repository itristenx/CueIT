import axios from 'axios';
import { getSession } from 'next-auth/react';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
});
// Attach NextAuth JWT from session to every request
apiClient.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('nextauth-token');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});
export async function apiRequest(endpoint, options = {}) {
    let token = null;
    if (typeof window !== 'undefined') {
        const session = await getSession();
        token = session === null || session === void 0 ? void 0 : session.accessToken;
    }
    const headers = Object.assign(Object.assign({}, (options.headers || {})), (token ? { Authorization: `Bearer ${token}` } : {}));
    const response = await fetch(`${API_BASE_URL}${endpoint}`, Object.assign(Object.assign({}, options), { headers }));
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    return response.json();
}
