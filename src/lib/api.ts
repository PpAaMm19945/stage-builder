// SchoolOS API Client for Cloudflare Worker

import { TodaysLearningResponse } from '@/types';

// Production Worker URL - works for both Cloudflare Pages and Lovable preview
const API_URL = import.meta.env.VITE_API_URL || 'https://stage-builder.antmwes104-1.workers.dev';

function getAuthToken(): string | null {
  return localStorage.getItem('schoolos_token');
}

function setAuthToken(token: string): void {
  localStorage.setItem('schoolos_token', token);
}

function clearAuthToken(): void {
  localStorage.removeItem('schoolos_token');
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    // Handle 401 specifically
    if (response.status === 401) {
      clearAuthToken();
      const error = new Error('Session expired');
      (error as any).isAuthError = true;
      throw error;
    }

    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth
export const auth = {
  getLoginUrl: () => `${API_URL}/auth/google`,

  handleCallback: (token: string) => {
    setAuthToken(token);
  },

  getMe: () => apiRequest<{ user: any; children: any[] }>('/api/auth/me'),

  logout: () => {
    clearAuthToken();
    // Don't await the API call, just clear locally
  },

  isAuthenticated: () => !!getAuthToken(),
};

// Students
export const students = {
  list: () => apiRequest<any[]>('/api/students'),

  create: (data: { name: string; dateOfBirth: string }) =>
    apiRequest<any>('/api/students', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { name?: string; dateOfBirth?: string; avatarUrl?: string }) =>
    apiRequest<any>(`/api/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getToday: (studentId: string) =>
    apiRequest<TodaysLearningResponse>(`/api/students/${studentId}/today`),

  getProgress: (studentId: string) =>
    apiRequest<any>(`/api/students/${studentId}/progress`),

  getObservations: (studentId: string, domain?: string) =>
    apiRequest<any[]>(`/api/students/${studentId}/observations${domain ? `?domain=${domain}` : ''}`),

  delete: (id: string) => apiRequest<{ success: boolean }>(`/api/students/${id}`, {
    method: 'DELETE',
  }),

  getFamilyToday: () => apiRequest<import('@/types').FamilyTodayResponse>('/api/family/today'),
};

// Activities
export const activities = {
  list: (params?: { domain?: string; ageMonths?: number }) => {
    const query = new URLSearchParams();
    if (params?.domain) query.set('domain', params.domain);
    if (params?.ageMonths) query.set('ageMonths', String(params.ageMonths));
    return apiRequest<any[]>(`/api/activities?${query}`);
  },

  get: (id: string) => apiRequest<any>(`/api/activities/${id}`),
};

// Observations
export const observations = {
  create: (data: {
    studentId: string;
    activityId: string;
    masteryLevel: string;
    parentNotes?: string;
  }) =>
    apiRequest<any>('/api/observations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const api = { auth, students, activities, observations };
export default api;
