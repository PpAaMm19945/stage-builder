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
  list: (params?: { 
    domain?: string; 
    ageMonths?: number;
    activityType?: 'family_session' | 'individual' | 'daily_practice';
    context?: 'feeding' | 'diapering' | 'holding' | 'sleep' | 'outdoor';
  }) => {
    const query = new URLSearchParams();
    if (params?.domain) query.set('domain', params.domain);
    if (params?.ageMonths) query.set('ageMonths', String(params.ageMonths));
    if (params?.activityType) query.set('activityType', params.activityType);
    if (params?.context) query.set('context', params.context);
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

  swapActivity: (activityId: string) =>
    apiRequest<{ session: any }>('/api/family/swap', {
      method: 'POST',
      body: JSON.stringify({ activityId }),
    }),

  getTomorrowPreview: () => apiRequest<any>('/api/family/tomorrow-preview'),
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

// Activity Completions (Simple)
export const activityCompletions = {
    create: (data: { activityId: string; notes?: string }) =>
        apiRequest<{ success: boolean; id: string }>('/api/activity-completions', {
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
  getToday: (): Promise<LiturgyTodayResponse> =>
    apiRequest('/api/liturgy/today'),

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

  getSettings: (): Promise<FamilyLiturgySettings> =>
    apiRequest('/api/liturgy/settings'),

  updateSettings: (settings: Partial<FamilyLiturgySettings>): Promise<{ success: boolean }> =>
    apiRequest('/api/liturgy/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
};

// Overrides
export const overrides = {
  list: () => apiRequest<any[]>('/api/overrides'),
  create: (data: { studentId?: string; overrideType: any; description: string; constraints: any }) =>
    apiRequest<any>('/api/overrides', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { isActive?: boolean; constraints?: any }) =>
    apiRequest<any>(`/api/overrides/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/api/overrides/${id}`, { method: 'DELETE' }),
  parse: (freeText: string, studentId?: string) =>
    apiRequest<any>('/api/overrides/parse', { method: 'POST', body: JSON.stringify({ freeText, studentId }) }),
};

// Time Model
export const timeModel = {
  get: () => apiRequest<any>('/api/time-model'),
  update: (data: Partial<any>) =>
    apiRequest<any>('/api/time-model', { method: 'PUT', body: JSON.stringify(data) }),
};

// Weekly Plan
export const weeklyPlan = {
  get: (weekStart?: string) =>
    apiRequest<{ id: string; weekStart: string; plan: any; cached: boolean }>(`/api/family/weekly-plan${weekStart ? `?weekStart=${weekStart}` : ''}`),
  regenerate: (params?: { balancePreference?: 'baby_focused' | 'mixed' | 'older_focused'; weekStart?: string }) =>
    apiRequest<{ id: string; plan: any }>('/api/family/weekly-plan/regenerate', { method: 'POST', body: JSON.stringify(params || {}) }),
};

// AI
export const ai = {
  explain: (question: string, context?: { activityId?: string; domain?: string; childAge?: number }) =>
    apiRequest<any>('/api/explain', { method: 'POST', body: JSON.stringify({ question, context }) }),
  narrate: (plan: any, tone?: 'encouraging' | 'calm' | 'concise') =>
    apiRequest<{ narrative: string; originalPlan: any }>('/api/plan/narrate', { method: 'POST', body: JSON.stringify({ plan, tone }) }),
};

// Portfolio
export const portfolio = {
  // Get upload URL for a new item
  getUploadUrl: async (filename: string, contentType: string) => {
    return apiRequest<{ uploadUrl: string; key: string; publicUrl: string }>('/api/portfolio/upload', {
      method: 'POST',
      body: JSON.stringify({ filename, contentType }),
    });
  },

  // Create portfolio item record
  createItem: async (data: {
    studentId: string;
    title: string;
    description?: string;
    itemType: 'image' | 'audio' | 'document' | 'text';
    r2Key?: string;
    domain?: string;
    relatedActivityId?: string;
  }) => {
    return apiRequest<any>('/api/portfolio/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // List items for a student
  listItems: async (studentId: string, domain?: string) => {
    const query = new URLSearchParams();
    if (domain) query.set('domain', domain);
    return apiRequest<any[]>(`/api/portfolio/${studentId}?${query}`);
  },

  // Delete item
  deleteItem: async (itemId: string) => {
    return apiRequest<{ success: boolean }>(`/api/portfolio/${itemId}`, {
      method: 'DELETE',
    });
  }
};

export const api = { auth, students, activities, observations, activityCompletions, family, books, reading, feedback, liturgy, overrides, timeModel, weeklyPlan, ai, portfolio };
export default api;
