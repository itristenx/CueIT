import { NextResponse } from 'next/server';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config: any) => {
    // Get token from localStorage or cookies
    const token = localStorage.getItem('clerk-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

export async function apiRequest(
  endpoint: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
    token?: string;
  } = {}
) {
  const { method = 'GET', body, headers = {}, token } = options;
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export const ticketAPI = {
  create: (data: any, token: string) => 
    apiRequest('/api/v2/tickets', { method: 'POST', body: data, token }),
  
  getAll: (params: any = {}, token: string) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/api/v2/tickets?${queryParams}`, { token });
  },
  
  getById: (id: string, token: string) => 
    apiRequest(`/api/v2/tickets/${id}`, { token }),
  
  update: (id: string, data: any, token: string) => 
    apiRequest(`/api/v2/tickets/${id}`, { method: 'PATCH', body: data, token }),
  
  addComment: (id: string, data: any, token: string) => 
    apiRequest(`/api/v2/tickets/${id}/comments`, { method: 'POST', body: data, token }),
  
  getStats: (token: string) => 
    apiRequest('/api/v2/tickets/stats', { token }),
};

export const knowledgeBaseAPI = {
  search: (query: string, token: string) => 
    apiRequest(`/api/v2/knowledge-base/search?q=${encodeURIComponent(query)}`, { token }),
  
  getAll: (params: any = {}, token: string) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/api/v2/knowledge-base?${queryParams}`, { token });
  },
  
  getById: (id: string, token: string) => 
    apiRequest(`/api/v2/knowledge-base/${id}`, { token }),
};

export const userAPI = {
  getProfile: (token: string) => 
    apiRequest('/api/v2/users/profile', { token }),
  
  updateProfile: (data: any, token: string) => 
    apiRequest('/api/v2/users/profile', { method: 'PATCH', body: data, token }),
};
