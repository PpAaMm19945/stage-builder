
import { ExecutionStep } from '../components/chat/hooks/useChatState';
import { Formation, LiturgyItem } from './index';

export type ChatActionType =
    | 'SEARCH_BOOKS'
    | 'SEARCH_ACTIVITIES'
    | 'GET_TODAY_SCHEDULE'
    | 'ANCHOR_GENERATED'; // [NEW]

/**
 * Daily Anchor Payload (matches backend DailyAnchor from cloudflare/src/ai/anchor-generator.ts)
 */
export interface AnchorPayload {
    id: string;
    date: string;
    arc_id: string;
    day_in_arc: number;
    theme: string;
    liturgy: {
        hymn: string;
        hymn_id?: string;
        hymn_audio_url?: string;
        catechism_q: number;
        catechism_question: string;
        catechism_a: string;
        scripture: string;
    };
    family_activity: {
        id: string;
        title: string;
        description: string;
        skill_domain: string;
        targets_covered: string[];
        formation_lens: string;
        materials: string[];
        duration_minutes: number;
        location: 'indoor' | 'outdoor' | 'either';
        levels: Array<{
            child_id: string;
            child_name: string;
            age_months?: number;
            stage: string;
            role: string;
            instruction: string;
        }>;
    };
    book_nook?: {
        id: string;
        series?: string;
        title: string;
        author?: string;
        cover_image?: string;
        render_format?: string;
        discussion_prompt: string;
    };
    reasoning: string; // The "AI Insight"
    confidence?: 'high' | 'medium' | 'experimental';
}

export interface ActionCard {
    type: ChatActionType | string;
    data: ActionCardData;
}

export interface BookSearchResult {
    id: string;
    title: string;
    description?: string;
    metadata?: {
        coverUrl?: string;
        ageRange?: string;
        domain?: string;
        series?: string;
        pageCount?: number;
        renderFormat?: 'image' | 'pdf';
        minAgeMonths?: number;
        maxAgeMonths?: number;
    };
}

export interface ActivitySearchResult {
    id: string;
    title: string;
    description?: string;
    metadata?: {
        domain?: string;
        materials?: string;
    };
}

export interface ScheduleItemResult {
    id: string;
    title: string;
    description?: string;
    metadata?: {
        period?: 'morning' | 'evening';
        duration?: number;
        status?: string;
        contentType?: string;
    };
}

export type ActionCardData =
    | Formation
    | LiturgyItem
    | { results: BookSearchResult[] }
    | { results: ActivitySearchResult[] }
    | { results: ScheduleItemResult[] }
    | Record<string, unknown>;

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    actionCard?: ActionCard;
    steps?: ExecutionStep[];

    // Specific payloads for rich messages
    anchorPayload?: AnchorPayload;
}
