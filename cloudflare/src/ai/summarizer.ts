import { Env } from '../types';

export class Summarizer {
    constructor(private env: Env) { }

    /**
     * Summarize the conversation history if it exceeds a certain length.
     * Returns a new history array with the summary and the most recent messages.
     */
    async compressIfNeeded(history: any[], maxMessages = 15, keepRecent = 10): Promise<any[]> {
        if (history.length <= maxMessages) {
            return history;
        }

        // Identify messages to summarize (everything before the last 'keepRecent')
        const toSummarize = history.slice(0, history.length - keepRecent);
        const recentMessages = history.slice(history.length - keepRecent);

        // If 'toSummarize' is empty or too short, just return original
        if (toSummarize.length < 2) return history;

        console.log(`[Summarizer] Compressing ${toSummarize.length} messages...`);

        try {
            const summary = await this.generateSummary(toSummarize);

            return [
                {
                    role: 'system',
                    content: `Previous conversation summary: ${summary}`
                },
                ...recentMessages
            ];
        } catch (e) {
            console.warn('[Summarizer] Failed to summarize, returning truncated history', e);
            // Fallback: just return recent messages to avoid erroring out
            return recentMessages;
        }
    }

    private async generateSummary(messages: any[]): Promise<string> {
        // Format messages for the summarizer
        const conversationText = messages
            .map(m => `${m.role.toUpperCase()}: ${m.content}`)
            .join('\n');

        const prompt = `Summarize the following conversation in 3-4 sentences. Focus on the user's goals, key decisions made, and any personal details mentioned (names, ages, preferences). Do not include system-level details.\n\nCONVERSATION:\n${conversationText}\n\nSUMMARY:`;

        const response = await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [{ role: 'user', content: prompt }],
            stream: false
        });

        // @ts-ignore - CF AI types might be imperfect
        return response.response || "User asked some questions.";
    }
}
