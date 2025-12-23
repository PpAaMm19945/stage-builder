import { createContext, useContext, useState, ReactNode } from 'react';
import { MasteryLevel, ActivityResult } from '../types';

interface ActivityProgressContextType {
  completedActivities: ActivityResult[];
  addObservation: (activityId: string, studentId: string, masteryLevel: MasteryLevel, notes?: string) => void;
  getActivityResult: (activityId: string, studentId: string) => ActivityResult | undefined;
  isActivityCompleted: (activityId: string, studentId: string) => boolean;
}

const ActivityProgressContext = createContext<ActivityProgressContextType | undefined>(undefined);

export function ActivityProgressProvider({ children }: { children: ReactNode }) {
  const [completedActivities, setCompletedActivities] = useState<ActivityResult[]>([]);

  const addObservation = (
    activityId: string, 
    studentId: string, 
    masteryLevel: MasteryLevel, 
    notes?: string
  ) => {
    const newResult: ActivityResult = {
      id: `result-${Date.now()}`,
      studentId,
      activityId,
      completedAt: new Date().toISOString(),
      masteryLevel,
      parentNotes: notes,
    };

    setCompletedActivities((prev) => [...prev, newResult]);
  };

  const getActivityResult = (activityId: string, studentId: string) => {
    return completedActivities.find(
      (result) => result.activityId === activityId && result.studentId === studentId
    );
  };

  const isActivityCompleted = (activityId: string, studentId: string) => {
    return completedActivities.some(
      (result) => result.activityId === activityId && result.studentId === studentId
    );
  };

  return (
    <ActivityProgressContext.Provider
      value={{
        completedActivities,
        addObservation,
        getActivityResult,
        isActivityCompleted,
      }}
    >
      {children}
    </ActivityProgressContext.Provider>
  );
}

export function useActivityProgress() {
  const context = useContext(ActivityProgressContext);
  if (context === undefined) {
    throw new Error('useActivityProgress must be used within an ActivityProgressProvider');
  }
  return context;
}
