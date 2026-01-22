// Learning Paths Types

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  path_type: PathType;
  content_filter?: string; // JSON string
  pace: 'daily' | 'weekly' | 'self_paced';
  total_items?: number;
  min_age_months: number;
  max_age_months: number;
  cover_image_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export type PathType =
  | 'hymn_journey'
  | 'catechism'
  | 'liturgy'
  | 'history_young'
  | 'history_full'
  | 'pastor_curtis'
  | 'toddler_dev'
  | 'early_reading'
  | 'custom';

export interface PathSubscription {
  id: string;
  parent_id: string;
  path_id: string;
  started_at: string;
  current_position: number;
  is_paused: boolean;
  completed_at?: string;
  // Joined from learning_paths
  path?: LearningPath;
}

export interface PathWithProgress extends LearningPath {
  subscription?: PathSubscription;
  progress_percent?: number;
}

export interface TodayPathItem {
  path_id: string;
  path_title: string;
  path_type: PathType;
  item_type: 'hymn' | 'catechism' | 'activity' | 'book' | 'liturgy';
  item_id: string;
  item_title: string;
  item_data: any; // Formation, Book, Hymn, etc.
  position: number;
  total: number;
}

export interface PathsTodayResponse {
  items: TodayPathItem[];
  active_paths: PathWithProgress[];
}
