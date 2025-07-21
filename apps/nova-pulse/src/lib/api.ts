import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Attach Clerk JWT from localStorage to every request
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('clerk-token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export async function apiRequest(endpoint: string, options: any = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('clerk-token') : null;
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const url = `${API_BASE_URL}${endpoint}`;
  if (process.env.NODE_ENV === 'development') {
    console.debug('[apiRequest] Fetching URL:', url);
  }
  const response = await fetch(url, {
    ...options,
    headers,
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}
