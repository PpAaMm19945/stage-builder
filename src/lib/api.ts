// SchoolOS API Client for Cloudflare Worker

import { TodaysLearningResponse, FamilyTodayResponse, MaterialItem, Book, ReadingSession, ParentComment, LiturgyType, LiturgyTodayResponse, FamilyLiturgySettings } from '@/types';

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

  export: () => apiRequest<any[]>('/api/activities/export'),
};

// Family
export const family = {
  getToday: () => apiRequest<FamilyTodayResponse>('/api/family/today'),

  getMaterials: () => apiRequest<MaterialItem[]>('/api/family/materials'),

  updateMaterials: (materials: MaterialItem[]) =>
    apiRequest<{ success: boolean }>('/api/family/materials', {
      method: 'PUT',
      body: JSON.stringify({ materials }),
    }),
};

// Observations
export const observations = {
  create: (data: {
    studentId: string;
    activityId: string;
    masteryLevel: string;
    parentNotes?: string;
    tier?: string;
  }) =>
    apiRequest<any>('/api/observations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Books
export const books = {
  list: (params?: { stage?: string; ageMonths?: number }) => {
    const query = new URLSearchParams();
    if (params?.stage) query.set('stage', params.stage);
    if (params?.ageMonths) query.set('ageMonths', String(params.ageMonths));
    return apiRequest<Book[]>(`/api/books?${query}`);
  },

  get: (series: string, bookId: string) =>
    apiRequest<Book>(`/api/books/${encodeURIComponent(series)}/${encodeURIComponent(bookId)}`),

  getCoverUrl: (series: string, bookId: string) =>
    `${API_URL}/api/books/${encodeURIComponent(series)}/${encodeURIComponent(bookId)}/cover`,

  getPageUrl: (series: string, bookId: string, pageNum: number) =>
    `${API_URL}/api/books/${encodeURIComponent(series)}/${encodeURIComponent(bookId)}/pages/${String(pageNum).padStart(2, '0')}`,
};

// Reading Sessions
export const reading = {
  complete: (data: { series: string; bookId: string; childrenPresent?: string[]; notes?: string }) =>
    apiRequest<ReadingSession>('/api/reading/complete', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  history: (limit?: number) =>
    apiRequest<ReadingSession[]>(`/api/reading/history${limit ? `?limit=${limit}` : ''}`),
};

// Feedback
export const feedback = {
  // Upvotes
  toggleUpvote: (contentType: 'activity' | 'book', contentId: string) =>
    apiRequest<{ upvoted: boolean; newCount: number }>('/api/upvotes', {
      method: 'POST',
      body: JSON.stringify({ contentType, contentId }),
    }),

  checkUpvote: (contentType: 'activity' | 'book', contentId: string) =>
    apiRequest<{ upvoted: boolean }>(`/api/upvotes/check?contentType=${contentType}&contentId=${contentId}`),

  // Comments
  getComments: (contentType: 'activity' | 'book', contentId: string) =>
    apiRequest<{ comments: ParentComment[]; count: number }>(`/api/comments?contentType=${contentType}&contentId=${contentId}`),

  addComment: (contentType: 'activity' | 'book', contentId: string, text: string, isSuccessStory = false) =>
    apiRequest<{ comment: ParentComment }>('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ contentType, contentId, text, isSuccessStory }),
    }),

  deleteComment: (commentId: string) =>
    apiRequest<{ success: boolean }>(`/api/comments/${commentId}`, { method: 'DELETE' }),
};

// Liturgy
export const liturgy = {
  getToday: async (): Promise<LiturgyTodayResponse> => {
    const data = await apiRequest<any>('/api/liturgy/today');
    // Convert SQLite 1/0 to booleans for the frontend
    if (data.settings) {
      data.settings.catechism_enabled = !!data.settings.catechism_enabled;
      data.settings.hymnal_enabled = !!data.settings.hymnal_enabled;
      data.settings.scripture_enabled = !!data.settings.scripture_enabled;
    }
    return data;
  },

  complete: (itemId: string): Promise<{ success: boolean }> =>
    apiRequest('/api/liturgy/complete', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    }),

  uncomplete: (itemId: string): Promise<{ success: boolean }> =>
    apiRequest('/api/liturgy/uncomplete', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    }),

  advance: (type: LiturgyType): Promise<{ success: boolean }> =>
    apiRequest('/api/liturgy/advance', {
      method: 'POST',
      body: JSON.stringify({ type }),
    }),

  getSettings: async (): Promise<FamilyLiturgySettings> => {
    const settings = await apiRequest<any>('/api/liturgy/settings');
    // Convert SQLite 1/0 to booleans for the frontend
    if (settings) {
      settings.catechism_enabled = !!settings.catechism_enabled;
      settings.hymnal_enabled = !!settings.hymnal_enabled;
      settings.scripture_enabled = !!settings.scripture_enabled;
    }
    return settings;
  },

  updateSettings: (settings: Partial<FamilyLiturgySettings>): Promise<{ success: boolean }> => {
    // Convert booleans to 1/0 for SQLite
    const converted: any = { ...settings };
    if (typeof settings.catechism_enabled === 'boolean') {
      converted.catechism_enabled = settings.catechism_enabled ? 1 : 0;
    }
    if (typeof settings.hymnal_enabled === 'boolean') {
      converted.hymnal_enabled = settings.hymnal_enabled ? 1 : 0;
    }
    if (typeof settings.scripture_enabled === 'boolean') {
      converted.scripture_enabled = settings.scripture_enabled ? 1 : 0;
    }

    return apiRequest('/api/liturgy/settings', {
      method: 'PUT',
      body: JSON.stringify(converted),
    });
  },
};

export const api = { auth, students, activities, observations, family, books, reading, feedback, liturgy };
export default api;

