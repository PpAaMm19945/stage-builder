
import { ExecutionStep } from '../components/chat/hooks/useChatState';
import { Formation, LiturgyItem } from './index';

export type ChatActionType =
    | 'SEARCH_BOOKS'
    | 'SEARCH_ACTIVITIES'
    | 'GET_TODAY_SCHEDULE'
    | 'ANCHOR_GENERATED'; // [NEW]

export interface AnchorPayload {
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
    data: any;
}

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    actionCard?: ActionCard;
    steps?: ExecutionStep[];

    // Specific payloads for rich messages
    anchorPayload?: AnchorPayload;
}
