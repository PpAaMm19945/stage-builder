import { Message } from '../components/chat/hooks';

const DB_NAME = 'familypath-chat';
const STORE_NAME = 'sessions';
const MAX_SESSIONS = 5;
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface ChatSession {
    id: string;        // userId + date
    userId: string;
    sessionId: string; // ISO date or UUID
    messages: Message[];
    createdAt: number;
    updatedAt: number;
    expiresAt: number;
}

/**
 * Open (or create) the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('userId', 'userId', { unique: false });
                store.createIndex('updatedAt', 'updatedAt', { unique: false });
            }
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onerror = (event) => {
            reject((event.target as IDBOpenDBRequest).error);
        };
    });
}

/**
 * Clean up expired sessions and enforce max session limit
 */
async function cleanupSessions(db: IDBDatabase, userId: string) {
    return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('userId');
        const now = Date.now();

        const request = index.getAll(userId);

        request.onsuccess = () => {
            const sessions: ChatSession[] = request.result;
            const validSessions = sessions
                .filter(s => s.expiresAt > now)
                .sort((a, b) => b.updatedAt - a.updatedAt); // Newest first

            const sessionsToDelete = [
                ...sessions.filter(s => s.expiresAt <= now), // Expired
                ...validSessions.slice(MAX_SESSIONS)         // Overflow
            ];

            if (sessionsToDelete.length > 0) {
                sessionsToDelete.forEach(s => store.delete(s.id));
            }
            resolve();
        };

        request.onerror = () => reject(request.error);
    });
}

export const chatStorage = {
    /**
     * Save a chat session
     */
    async saveSession(userId: string, messages: Message[]): Promise<void> {
        if (!userId || messages.length === 0) return;

        try {
            const db = await openDB();

            // Use current day as session ID for simple persistence
            const today = new Date().toISOString().split('T')[0];
            const sessionId = today;
            const id = `${userId}_${sessionId}`;
            const time = Date.now();

            const session: ChatSession = {
                id,
                userId,
                sessionId,
                messages,
                createdAt: time, // Logic to keep original creation time could be added if needed
                updatedAt: time,
                expiresAt: time + SESSION_EXPIRY_MS
            };

            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            // We use put to overwrite
            store.put(session);

            // Trigger cleanup asynchronously
            cleanupSessions(db, userId).catch(console.error);

        } catch (error) {
            console.error('Failed to save chat session', error);
        }
    },

    /**
     * Load the most recent valid session for a user
     */
    async loadSession(userId: string): Promise<Message[] | null> {
        if (!userId) return null;

        try {
            const db = await openDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const index = store.index('userId');
                const now = Date.now();

                const request = index.getAll(userId);

                request.onsuccess = () => {
                    const sessions: ChatSession[] = request.result;

                    // Find most recent valid session
                    const latest = sessions
                        .filter(s => s.expiresAt > now)
                        .sort((a, b) => b.updatedAt - a.updatedAt)[0];

                    resolve(latest ? latest.messages : null);
                };

                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Failed to load chat session', error);
            return null;
        }
    },

    /**
     * Clear a specific user's session (e.g., "New Chat")
     */
    async clearSession(userId: string): Promise<void> {
        if (!userId) return;

        try {
            const db = await openDB();
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('userId');

            const request = index.getAll(userId);

            request.onsuccess = () => {
                const sessions: ChatSession[] = request.result;
                sessions.forEach(s => store.delete(s.id));
            };
        } catch (error) {
            console.error('Failed to clear chat session', error);
        }
    }
};
