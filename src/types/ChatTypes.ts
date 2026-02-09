
import { ExecutionStep } from '../components/chat/hooks/useChatState';
import { Formation, LiturgyItem } from './index';

export type ChatActionType =
    | 'SEARCH_BOOKS'
    | 'SEARCH_ACTIVITIES'
    | 'GET_TODAY_SCHEDULE'
    | 'ANCHOR_GENERATED'; // [NEW]

export interface AnchorPayload {
    id: string;
    date: string;
    dayOfSequence: number;
    totalDays: number;
    theme: string;
    liturgy: {
        hymn?: LiturgyItem;
        catechism?: LiturgyItem;
        scripture?: LiturgyItem;
    };
    activity: {
        title: string;
        description: string;
        materials: string[];
        roles: {
            childName: string;
            role: string; // "Observer", "Participant", "Leader"
        }[];
    };
    reasoning: string; // The "AI Insight"
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
