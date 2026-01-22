// SchoolOS API Client for Cloudflare Worker

import { TodaysLearningResponse, FamilyTodayResponse, MaterialItem, Book, ReadingSession, ParentComment, LiturgyType, LiturgyTodayResponse, FamilyLiturgySettings, WeeklyPlanResponse, IndependenceSettings, AIInteractionLog, StudentViewData } from '@/types';

// Production Worker URL - works for both Cloudflare Pages and Lovable preview
export const API_URL = import.meta.env.VITE_API_URL || 'https://stage-builder.antmwes104-1.workers.dev';

function getAuthToken(): string | null {
  const token = localStorage.getItem('schoolos_token');
  console.log('[API] getAuthToken called. Token exists:', !!token);
  return token;
}

function setAuthToken(token: string): void {
  console.log('[API] setAuthToken called.');
  localStorage.setItem('schoolos_token', token);
}

function clearAuthToken(): void {
  console.log('[API] clearAuthToken called.');
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
      console.warn('[API] 401 Unauthorized encountered.');
      // Do NOT clear token here. Let AuthContext decide how to handle it (e.g. logout).
      // clearAuthToken();
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

  isAuthenticated: () => {
    const isAuth = !!getAuthToken();
    console.log('[API] isAuthenticated called. Result:', isAuth);
    return isAuth;
  },
};

// Students
export const students = {
  list: () => apiRequest<any[]>('/api/students'),

  create: (data: { name: string; dateOfBirth: string }) =>
    apiRequest<any>('/api/students', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: {
    name?: string;
    dateOfBirth?: string;
    avatarUrl?: string;
    independence_settings?: {
      canMarkComplete?: boolean;
      canAskAi?: boolean;
      canViewPortfolio?: boolean;
    };
    pace_overrides?: Record<string, string>;
    is_graduated?: boolean;
    graduation_date?: string;
  }) =>
    apiRequest<any>(`/api/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getToday: async (studentId: string) => {
    const data = await apiRequest<TodaysLearningResponse>(`/api/students/${studentId}/today`);
    // Normalize response for legacy compatibility
    return {
      ...data,
      activities: data.formations || data.activities || [],
      familyActivities: data.familyFormations || data.familyActivities || []
    };
  },

  getProgress: (studentId: string) =>
    apiRequest<any>(`/api/students/${studentId}/progress`),

  getObservations: (studentId: string, domain?: string) =>
    apiRequest<any[]>(`/api/students/${studentId}/observations${domain ? `?domain=${domain}` : ''}`),

  delete: (id: string) => apiRequest<{ success: boolean }>(`/api/students/${id}`, {
    method: 'DELETE',
  }),
};

// Activities
// Formations (Replaces Activities)
export const formations = {
  list: (params?: {
    virtue?: string; // mapped from domain
    ageMonths?: number;
    formationType?: string; // mapped from activityType
    context?: string; // mapped from context
  }) => {
    const query = new URLSearchParams();
    if (params?.virtue) query.set('virtue', params.virtue);
    if (params?.ageMonths) query.set('ageMonths', String(params.ageMonths));
    if (params?.formationType) query.set('formationType', params.formationType);
    if (params?.context) query.set('context', params.context);
    return apiRequest<any[]>('/api/formations?' + query.toString());
  },

  get: (id: string) => apiRequest<any>(`/api/formations/${id}`),

  export: () => apiRequest<any[]>('/api/formations/export'),
};

export const activities = formations; // Alias for backward compatibility during refactor


// Family
export const family = {
  getToday: () => apiRequest<FamilyTodayResponse>('/api/family/today'),

  getMaterials: () => apiRequest<MaterialItem[]>('/api/family/materials'),

  updateMaterials: (materials: MaterialItem[]) =>
    apiRequest<{ success: boolean }>('/api/family/materials', {
      method: 'PUT',
      body: JSON.stringify({ materials }),
    }),

  swapActivity: (data: { activityId: string }) =>
    apiRequest<{ session: any }>('/api/family/swap', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  swapAndPersist: (data: { oldActivityId: string | null; newActivityId: string; day: string; weekStart: string }) =>
    apiRequest<{ success: boolean; newActivity: any }>('/api/family/swap-persist', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getDay: (date: string) =>
    apiRequest<FamilyTodayResponse>(`/api/family/day/${date}`),

  getWeekSummary: (weekStart: string) =>
    apiRequest<{ days: Record<string, { completed: number; total: number; domains: string[] }> }>(`/api/family/week-summary?weekStart=${weekStart}`),

  getTomorrowPreview: () => apiRequest<any>('/api/family/tomorrow-preview'),

  sendPassionSignal: (data: { studentId: string; activityId: string; domain: string; loved?: boolean; notes?: string }) =>
    apiRequest<{ success: boolean; id?: string }>('/api/passion-signals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPaceSettings: (studentId: string) =>
    apiRequest<{ studentId: string; pace: string; lastUpdated: string }>(`/api/family/pace/${studentId}`),

  updatePaceSetting: (data: { studentId: string; pace: 'gentle' | 'standard' | 'accelerated' }) =>
    apiRequest<{ success: boolean }>('/api/family/pace', {
      method: 'POST', // or PUT, usually POST for updates/creates
      body: JSON.stringify(data),
    }),
};

// Evidences (Replaces Observations)
export const evidences = {
  create: (data: {
    studentId: string;
    formationId: string; // was activityId
    stage: string;       // was masteryLevel ('seeding', 'rooting', 'fruiting')
    note?: string;       // was parentNotes
    tier?: string;
    duration_minutes?: number;
    loved_it?: boolean;
  }) =>
    apiRequest<any>('/api/evidences', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const observations = {
  // Adapter for legacy calls
  create: (data: {
    studentId: string;
    activityId: string;
    masteryLevel: string;
    parentNotes?: string;
    tier?: string;
  }) => {
    // Map legacy mastery to new stages
    const stageMap: Record<string, string> = {
      'emerging': 'seeding',
      'developing': 'rooting',
      'secure': 'fruiting'
    };

    return evidences.create({
      studentId: data.studentId,
      formationId: data.activityId,
      stage: stageMap[data.masteryLevel] || 'rooting',
      note: data.parentNotes,
      tier: data.tier
    });
  }
};


// Activity Completions (Simple)
export const activityCompletions = {
  create: (data: { activityId: string; notes?: string; durationMinutes?: number; lovedIt?: boolean }) => {
    // Forward to new evidences API
    return evidences.create({
      studentId: 'current-view-context', // Ideally we get this, but legacy calls might expect backend to infer or use parent context
      // Actually, legacy `activity-completions` endpoint was simple. The unified migration delegates this.
      // If we are still using `activityCompletions.create` in Dashboard, we should probably switch it to use `evidences.create` explicitly or update this shim.
      // The backend /api/activity-completions returns 410 Deprecated.
      // So valid code MUST use `evidences.create` or `activityCompletions` wrapper must use `evidences.create`.
      // Let's assume generic wrapper for now if possible, or leave as is regarding the shim if the backend handles it?
      // Wait, backend returns 410. So `activityCompletions.create` calling `/api/activity-completions` will FAIL.
      // We MUST refactor the frontend to use `evidences.create` in `Dashboard.tsx` and `ActivityDetails.tsx`.
      formationId: data.activityId,
      stage: 'rooting', // Default
      note: data.notes,
      duration_minutes: data.durationMinutes,
      loved_it: data.lovedIt
    });
  }
};
// Use evidences directly in components instead.
export const activityCompletions_deprecated = {
  create: (data: any) => console.warn('Deprecated activityCompletions used', data)
};

// Books - All assets served via /api/books/* routes for consistent CORS handling
export const books = {
  list: (params?: { stage?: string; ageMonths?: number }) => {
    const query = new URLSearchParams();
    if (params?.stage) query.set('stage', params.stage);
    if (params?.ageMonths) query.set('ageMonths', String(params.ageMonths));
    return apiRequest<Book[]>(`/api/books?${query}`);
  },

  get: (series: string, bookId: string) =>
    apiRequest<Book>(`/api/books/${encodeURIComponent(series)}/${encodeURIComponent(bookId)}`),

  // Cover image URL - uses API route with CORS headers
  getCoverUrl: (series: string, bookId: string) =>
    `${API_URL}/api/books/${encodeURIComponent(series)}/${encodeURIComponent(bookId)}/cover`,

  // Page image URL - uses API route with CORS headers
  getPageUrl: (series: string, bookId: string, pageNum: number) =>
    `${API_URL}/api/books/${encodeURIComponent(series)}/${encodeURIComponent(bookId)}/pages/${String(pageNum).padStart(2, '0')}`,

  // PDF URL - for larger books with many pages
  getPdfUrl: (series: string, bookId: string) =>
    `${API_URL}/api/books/${encodeURIComponent(series)}/${encodeURIComponent(bookId)}/pdf`,

  // Generic asset URL - for markdown, manifests, etc.
  getAssetUrl: (series: string, bookId: string, assetPath: string) =>
    `${API_URL}/api/books/${encodeURIComponent(series)}/${encodeURIComponent(bookId)}/asset/${assetPath}`,
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

// Hymns
export const hymns = {
  list: () => apiRequest<any[]>('/api/hymns'),
};

// Catechism
export const catechism = {
  list: () => apiRequest<any[]>('/api/catechism'),
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
    apiRequest<WeeklyPlanResponse>(`/api/family/weekly-plan${weekStart ? `?weekStart=${weekStart}` : ''}`),
  regenerate: (params?: { balancePreference?: 'baby_focused' | 'mixed' | 'older_focused'; weekStart?: string }) =>
    apiRequest<WeeklyPlanResponse>('/api/family/weekly-plan/regenerate', { method: 'POST', body: JSON.stringify(params || {}) }),

  getStrategicInsights: (plan: any, children: any[]) =>
    apiRequest<any>('/api/family/weekly-plan/strategic-insight', { method: 'POST', body: JSON.stringify({ plan, children }) }),
};

// AI
export const ai = {
  chat: async (message: string, context: any, mode?: 'parent' | 'student') => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, context, mode }),
    });
    if (!response.ok) throw new Error('Chat failed');
    return response.body;
  },

  explainPlan: (slot: any, childId: string) =>
    apiRequest<any>('/api/ai/explain-plan', {
      method: 'POST',
      body: JSON.stringify({ slot, childId }),
    }),

  explain: (question: string, context?: { activityId?: string; domain?: string; childAge?: number }) =>
    apiRequest<any>('/api/explain', { method: 'POST', body: JSON.stringify({ question, context }) }),
  // narrate removed as it was unused and WeeklySummary component was deleted

  // Phase 2: Weekly summaries
  generateWeeklySummary: (weekStart: string) =>
    apiRequest<{
      weekStart: string;
      weekEnd: string;
      completionCount: number;
      observationCount: number;
      summary: string;
      patterns: string[];
      suggestedQuestions: string[];
    }>('/api/ai/weekly-summary', { method: 'POST', body: JSON.stringify({ weekStart }) }),

  // Phase 2: Feedback draft
  generateFeedbackDraft: (studentId: string, options?: { weekStart?: string; context?: string }) =>
    apiRequest<{
      draft: string;
      studentName: string;
      isEditable: boolean;
      note: string;
    }>('/api/ai/feedback-draft', { method: 'POST', body: JSON.stringify({ studentId, ...options }) }),

  // Phase 3: Child-facing explain (logged for parent visibility)
  childExplain: (studentId: string, question: string, context?: { activityId?: string; activityTitle?: string; domain?: string }) =>
    apiRequest<{ answer: string; sources?: string[] }>('/api/ai/child-explain', {
      method: 'POST',
      body: JSON.stringify({ studentId, question, context }),
    }),

  // Phase 3: Get AI interaction logs (parent visibility)
  getInteractionLog: (studentId?: string) =>
    apiRequest<AIInteractionLog[]>(`/api/ai/interactions${studentId ? `?studentId=${studentId}` : ''}`),
};

// Phase 3: Independence Settings
export const independence = {
  // Get all settings for a student
  get: (studentId: string) =>
    apiRequest<IndependenceSettings[]>(`/api/independence-settings/${studentId}`),

  // Update or create a setting for a student/subject pair
  update: (studentId: string, data: {
    subject: string;
    level: 'parent_led' | 'guided' | 'independent';
    canMarkComplete?: boolean;
    canAskAi?: boolean;
    canViewPortfolio?: boolean;
  }) =>
    apiRequest<IndependenceSettings>(`/api/independence-settings/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Phase 3: Student View
export const studentView = {
  // Get student view data (tasks, portfolio, permissions based on independence settings)
  get: (studentId: string) =>
    apiRequest<StudentViewData>(`/api/student-view/${studentId}`),

  // Mark a task complete (only if permitted)
  markComplete: (studentId: string, activityId: string, notes?: string) =>
    apiRequest<{ success: boolean }>(`/api/student-view/${studentId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ activityId, notes }),
    }),
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
    milestoneTag?: string;
  }) => {
    return apiRequest<any>('/api/portfolio/items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // List items for a student with filtering
  listItems: async (studentId: string, filters?: {
    domain?: string;
    itemType?: 'image' | 'audio' | 'document' | 'text';
    timePeriod?: 'week' | 'month' | 'year' | 'all';
    milestoneOnly?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (filters?.domain) query.set('domain', filters.domain);
    if (filters?.itemType) query.set('itemType', filters.itemType);
    if (filters?.timePeriod) query.set('timePeriod', filters.timePeriod);
    if (filters?.milestoneOnly) query.set('milestoneOnly', 'true');
    return apiRequest<any[]>(`/api/portfolio/${studentId}?${query}`);
  },

  // Delete item
  deleteItem: async (itemId: string) => {
    return apiRequest<{ success: boolean }>(`/api/portfolio/${itemId}`, {
      method: 'DELETE',
    });
  }
};

export const rhythm = {
  readjust: (instruction: string, weekStart?: string) => {
    // Calculate Monday of current week if not provided
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    const defaultWeekStart = monday.toISOString().split('T')[0];

    return apiRequest<{ success: boolean; plan: any }>('/api/rhythm/readjust', {
      method: 'POST',
      body: JSON.stringify({
        prompt: instruction,
        weekStart: weekStart || defaultWeekStart
      }),
    });
  },
};

export const notifications = {
  list: () => apiRequest<any[]>('/api/notifications'),
};

// Formation System (Unified Rhythm & Progress)
export const formation = {
  getPreferences: () =>
    apiRequest<{ activitiesEnabled: boolean; readingEnabled: boolean; liturgyEnabled: boolean; learningFocus?: string }>('/api/family/preferences'),

  updatePreferences: (prefs: { activitiesEnabled?: boolean; readingEnabled?: boolean; liturgyEnabled?: boolean; learningFocus?: string }) =>
    apiRequest<{ success: boolean }>('/api/family/preferences', {
      method: 'POST',
      body: JSON.stringify(prefs),
    }),

  getDailyRhythm: () =>
    apiRequest<{
      date: string;
      items: any[];
      completions: Record<string, boolean>;
      preferences: { activitiesEnabled: boolean; readingEnabled: boolean; liturgyEnabled: boolean };
    }>('/api/family/daily-rhythm'),
};

export const work = {
  // Log work
  log: (data: { apprenticeshipId: string; date: string; hours: number; description: string; photoUrl?: string; skillsApplied?: string[] }) =>
    apiRequest<{ success: boolean; id: string }>('/api/work/log', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get pending logs (parent)
  getPending: () =>
    apiRequest<any[]>('/api/work/pending'),

  // Approve/Reject
  approve: (id: string, status: 'approved' | 'rejected', supervisorNote?: string) =>
    apiRequest<{ success: boolean }>(`/api/work/approve/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status, supervisorNote }),
    }),

  // Get Active Apprenticeships
  getActiveApprenticeships: () =>
    apiRequest<any[]>('/api/apprenticeships'),
};

// Learning Paths
import type { LearningPath, PathSubscription, PathsTodayResponse } from '@/types/paths';

export const paths = {
  list: () => apiRequest<LearningPath[]>('/api/paths'),

  getSubscriptions: () => apiRequest<PathSubscription[]>('/api/paths/subscriptions'),

  subscribe: (pathId: string) =>
    apiRequest<{ success: boolean; subscription: PathSubscription }>(`/api/paths/${pathId}/subscribe`, {
      method: 'POST',
    }),

  pause: (pathId: string) =>
    apiRequest<{ success: boolean }>(`/api/paths/${pathId}/pause`, {
      method: 'POST',
    }),

  resume: (pathId: string) =>
    apiRequest<{ success: boolean }>(`/api/paths/${pathId}/resume`, {
      method: 'POST',
    }),

  unsubscribe: (pathId: string) =>
    apiRequest<{ success: boolean }>(`/api/paths/${pathId}/unsubscribe`, {
      method: 'DELETE',
    }),

  getToday: () => apiRequest<PathsTodayResponse>('/api/paths/today'),

  advance: (pathId: string) =>
    apiRequest<{ success: boolean; new_position: number; total_items: number; is_completed: boolean }>(
      `/api/paths/${pathId}/advance`,
      { method: 'POST' }
    ),
};

export const api = { auth, students, activities, observations, activityCompletions, family, books, reading, feedback, liturgy, hymns, catechism, overrides, timeModel, weeklyPlan, ai, portfolio, independence, studentView, rhythm, notifications, formation, work, paths };
export default api;
