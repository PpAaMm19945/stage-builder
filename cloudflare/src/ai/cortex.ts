/**
 * Cortex: Anchor Companion
 * 
 * Simplified AI chat focused ONLY on:
 * 1. Explaining today's anchor
 * 2. Accepting parent feedback
 * 3. Handling adjustment requests
 * 
 * No general chat, no complex routing - just anchor support.
 */

import { Env } from '../types';
import { GeminiService } from './gemini';
import { AnchorGenerator, DailyAnchor, AnchorContext } from './anchor-generator';
import { ArcGenerator } from './arc-generator';
import { CATECHISM_DATA } from './data';

// Feedback patterns to detect in messages
const FEEDBACK_PATTERNS = {
    COMPLETE: /\[COMPLETE\]|we did it|done|finished|completed|✓/i,
    SKIP: /\[SKIP\]|skip today|skip this|not today|can't do|too busy/i,
    ADJUST: /\[ADJUST\]|adjust the plan|can we|instead|different|change|modify|something else/i,
    FEEDBACK: /\[FEEDBACK:([^\]]+)\]|loved it|didn't work|too hard|too easy/i,
    REGENERATE: /\[REGENERATE\]|give me a new plan|new activity|try again|regenerate/i
};

interface ChatResponse {
    message: string;
    action?: {
        type: 'complete' | 'skip' | 'regenerate' | 'feedback';
        payload?: any;
    };
    anchor?: DailyAnchor;
}

export class Cortex {
    private gemini: GeminiService;
    private anchorGenerator: AnchorGenerator;
    private arcGenerator: ArcGenerator;

    constructor(private env: Env) {
        this.gemini = new GeminiService(env.GOOGLE_API_KEY, 'gemini-3-flash-preview');
        this.anchorGenerator = new AnchorGenerator(env);
        this.arcGenerator = new ArcGenerator(env);
    }

    /**
     * Main chat entry point - streams response
     */
    async chat(message: string, history: any[], context: any): Promise<ReadableStream> {
        const encoder = new TextEncoder();
        const householdId = context.householdId || context.user?.household_id || context.userState?.household_id;

        console.log('[Cortex] 🧠 Chat called:', {
            messagePreview: message.slice(0, 50),
            historyLength: history.length,
            householdId,
            contextKeys: Object.keys(context)
        });

        if (!householdId) {
            console.warn('[Cortex] ⚠️ No household ID found in context');
            return this.streamError(encoder, 'No household found. Please complete your profile.');
        }

        // Get today's anchor for context
        console.log('[Cortex] 📅 Fetching today\'s anchor...');
        const anchor = await this.anchorGenerator.getTodayAnchor(householdId);
        console.log('[Cortex] 📅 Anchor:', anchor ? `Found: "${anchor.theme}"` : 'None');

        // Detect intent from message
        const intent = this.detectIntent(message);
        console.log('[Cortex] 🎯 Intent detected:', intent.type);

        // Handle special intents
        if (intent.type !== 'chat') {
            console.log('[Cortex] 🚀 Routing to intent handler:', intent.type);
            return this.handleIntent(intent, householdId, anchor, encoder, message);
        }

        // Regular chat with anchor context
        console.log('[Cortex] 💬 Routing to anchor chat');
        return this.anchorChat(message, history, anchor, context, encoder);
    }

    /**
     * Detect intent from message
     */
    private detectIntent(message: string): { type: string; payload?: any } {
        if (FEEDBACK_PATTERNS.COMPLETE.test(message)) {
            return { type: 'complete' };
        }
        if (FEEDBACK_PATTERNS.SKIP.test(message)) {
            return { type: 'skip' };
        }
        if (FEEDBACK_PATTERNS.REGENERATE.test(message)) {
            return { type: 'regenerate' };
        }

        const feedbackMatch = message.match(FEEDBACK_PATTERNS.FEEDBACK);
        if (feedbackMatch) {
            return { type: 'feedback', payload: feedbackMatch[1] || message };
        }

        if (FEEDBACK_PATTERNS.ADJUST.test(message)) {
            return { type: 'adjust', payload: message };
        }

        return { type: 'chat' };
    }

    /**
     * Handle special intents (complete, skip, regenerate, etc.)
     */
    private async handleIntent(
        intent: { type: string; payload?: any },
        householdId: string,
        anchor: DailyAnchor | null,
        encoder: TextEncoder,
        originalMessage: string
    ): Promise<ReadableStream> {
        const self = this;

        return new ReadableStream({
            async start(controller) {
                try {
                    let response = '';

                    switch (intent.type) {
                        case 'complete':
                            if (anchor) {
                                await self.anchorGenerator.completeAnchor(householdId, anchor.id, {
                                    notes: originalMessage
                                });
                                response = `🎉 Wonderful! I've marked today's anchor as complete.\n\nGreat job working on "${anchor.theme}" together! Your children practiced: ${anchor.family_activity.targets_covered?.join(', ') || 'valuable skills'}.\n\nSee you tomorrow for a new adventure!`;
                            } else {
                                response = "I don't see an active anchor for today. Would you like me to generate one?";
                            }
                            break;

                        case 'skip':
                            response = "No problem! Rest is important too. I'll save today's activity for another time. 💛\n\nWould you like a simpler alternative, or shall we pick up tomorrow?";
                            break;

                        case 'regenerate':
                            const newAnchor = await self.anchorGenerator.generateAnchor(
                                householdId,
                                new Date().toISOString().split('T')[0],
                                { adjustments: 'Generate a completely different activity' }
                            );
                            response = `Here's a fresh activity for today:\n\n**${newAnchor.theme}**\n\n${newAnchor.family_activity.description}\n\nMaterials: ${newAnchor.family_activity.materials?.join(', ') || 'None needed'}`;
                            break;

                        case 'adjust':
                            const adjustedAnchor = await self.anchorGenerator.generateAnchor(
                                householdId,
                                new Date().toISOString().split('T')[0],
                                { adjustments: intent.payload }
                            );
                            response = `I've adjusted today's anchor based on your request:\n\n**${adjustedAnchor.theme}**\n\n${adjustedAnchor.family_activity.description}`;
                            break;

                        case 'feedback':
                            if (anchor) {
                                await self.anchorGenerator.completeAnchor(householdId, anchor.id, {
                                    notes: intent.payload
                                });
                            }
                            response = `Thank you for the feedback! I'll use this to make tomorrow's activities even better. 📝`;
                            break;

                        default:
                            response = "I'm here to help with today's anchor!";
                    }

                    // Stream the response
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: response })}\n\n`));
                    controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                    controller.close();
                } catch (error) {
                    console.error('[Cortex] Intent handling error:', error);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: 'Sorry, something went wrong. Please try again.' })}\n\n`));
                    controller.close();
                }
            }
        });
    }

    /**
     * Chat with anchor context
     */
    private async anchorChat(
        message: string,
        history: any[],
        anchor: DailyAnchor | null,
        context: any,
        encoder: TextEncoder
    ): Promise<ReadableStream> {
        const systemPrompt = this.buildAnchorSystemPrompt(anchor, context);

        // Build messages for Gemini
        const geminiHistory: any[] = history.slice(-10).map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        geminiHistory.push({
            role: 'user',
            parts: [{ text: message }]
        });

        // Stream Gemini response
        return this.gemini.streamContent(geminiHistory, systemPrompt);
    }

    /**
     * Build system prompt with today's anchor
     */
    private buildAnchorSystemPrompt(anchor: DailyAnchor | null, context: any): string {
        const childrenInfo = context.children?.length
            ? context.children.map((c: any) => `${c.name} (${Math.floor(c.age_months / 12)} years)`).join(', ')
            : 'your children';

        let prompt = `You are the Anchor Companion, a warm and encouraging Christian homeschool assistant.

YOUR ROLE:
- Help parents understand and implement today's Daily Anchor
- Answer questions about the activity, book, or liturgy
- Suggest adaptations based on parent needs
- Celebrate progress and encourage

COMMUNICATION STYLE:
- Warm, supportive, and brief (2-3 sentences typical)
- Use encouraging language
- Offer practical tips when asked
- Reference Christian formation naturally

FAMILY CONTEXT:
Children: ${childrenInfo}
`;

        if (anchor) {
            prompt += `
TODAY'S ANCHOR (${anchor.date}):
Theme: "${anchor.theme}"

LITURGY:
- Hymn: ${anchor.liturgy.hymn}
- Catechism Q${anchor.liturgy.catechism_q}: "${anchor.liturgy.catechism_question}"
- Answer: "${anchor.liturgy.catechism_a}"
- Scripture: ${anchor.liturgy.scripture}

ACTIVITY: ${anchor.family_activity.title}
${anchor.family_activity.description}
Materials: ${anchor.family_activity.materials?.join(', ') || 'None needed'}
Skills: ${anchor.family_activity.targets_covered?.join(', ') || 'Formation'}
Theological lens: ${anchor.family_activity.formation_lens}

${anchor.book_nook ? `BOOK: "${anchor.book_nook.title}"
Discussion: ${anchor.book_nook.discussion_prompt}` : ''}

CHILD ROLES:
${anchor.family_activity.levels?.map(l => `- ${l.child_name}: ${l.role} - ${l.instruction}`).join('\n') || 'All participate together'}
`;
        } else {
            prompt += `
No anchor generated yet for today. Help the parent get started or generate one if asked.
`;
        }

        prompt += `
SPECIAL COMMANDS (detect and help with):
- [COMPLETE] - Mark today's anchor as done
- [SKIP] - Skip today gracefully  
- [ADJUST] - Modify the activity
- [REGENERATE] - Get a completely new activity

Remember: You are here to support, not lecture. Keep responses brief and actionable.`;

        return prompt;
    }

    /**
     * Stream an error message
     */
    private streamError(encoder: TextEncoder, message: string): ReadableStream {
        return new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: message })}\n\n`));
                controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                controller.close();
            }
        });
    }

    /**
     * Get today's anchor (for API endpoints)
     */
    async getTodayAnchor(householdId: string): Promise<DailyAnchor | null> {
        return this.anchorGenerator.getTodayAnchor(householdId);
    }

    /**
     * Generate a new arc (for API endpoints)
     */
    async generateArc(householdId: string, feedback?: string) {
        return this.arcGenerator.generateArc(householdId, feedback);
    }
}

export default Cortex;
