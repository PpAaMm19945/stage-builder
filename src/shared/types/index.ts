// ============================================
// Shared Types (Cross-Domain)
// ============================================

// Learning Stages
export type LearningStage = 
  | 'early-years'      // Ages 2-5
  | 'lower-primary'    // Grades 1-5
  | 'middle-school'    // Grades 6-8
  | 'upper-school';    // Grades 9-12

// User & Authentication
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'google';
  createdAt: string;
  updatedAt: string;
}

// Student Profile
export interface Student {
  id: string;
  parentId: string;
  name: string;
  dateOfBirth: string;
  ageInMonths: number;
  avatarUrl?: string;
  currentStage: LearningStage;
  createdAt: string;
  updatedAt: string;
}
