// ============================================
// Feature Flags Configuration
// ============================================

import { LearningStage } from '@/types';

export interface FeatureFlags {
  stages: Record<LearningStage, boolean>;
  features: {
    googleAuth: boolean;
    recommendations: boolean;
    progressTracking: boolean;
    parentNotes: boolean;
    activityVariations: boolean;
  };
}

export const FEATURE_FLAGS: FeatureFlags = {
  stages: {
    'early-years': true,      // ✅ Active
    'lower-primary': false,   // 🔒 Coming Soon
    'middle-school': false,   // 🔒 Coming Soon
    'upper-school': false,    // 🔒 Coming Soon
  },
  features: {
    googleAuth: true,
    recommendations: true,
    progressTracking: true,
    parentNotes: true,
    activityVariations: true,
  },
};

// Helper functions
export function isStageEnabled(stage: LearningStage): boolean {
  return FEATURE_FLAGS.stages[stage];
}

export function isFeatureEnabled(feature: keyof FeatureFlags['features']): boolean {
  return FEATURE_FLAGS.features[feature];
}

// Stage metadata for UI
export interface StageInfo {
  id: LearningStage;
  label: string;
  shortLabel: string;
  description: string;
  ageRange: string;
  gradeRange?: string;
  enabled: boolean;
  comingSoon: boolean;
}

export const STAGE_INFO: StageInfo[] = [
  {
    id: 'early-years',
    label: 'Early Years',
    shortLabel: 'Early',
    description: 'Foundation learning through play and exploration',
    ageRange: 'Ages 2-5',
    enabled: true,
    comingSoon: false,
  },
  {
    id: 'lower-primary',
    label: 'Lower Primary',
    shortLabel: 'Lower',
    description: 'Building core academic skills',
    ageRange: 'Ages 6-10',
    gradeRange: 'Grades 1-5',
    enabled: false,
    comingSoon: true,
  },
  {
    id: 'middle-school',
    label: 'Middle School',
    shortLabel: 'Middle',
    description: 'Developing critical thinking and independence',
    ageRange: 'Ages 11-13',
    gradeRange: 'Grades 6-8',
    enabled: false,
    comingSoon: true,
  },
  {
    id: 'upper-school',
    label: 'Upper School',
    shortLabel: 'Upper',
    description: 'Preparing for higher education and career',
    ageRange: 'Ages 14-18',
    gradeRange: 'Grades 9-12',
    enabled: false,
    comingSoon: true,
  },
];

export function getStageInfo(stage: LearningStage): StageInfo {
  return STAGE_INFO.find(s => s.id === stage) || STAGE_INFO[0];
}
