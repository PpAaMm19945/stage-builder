import type { Env } from './types';
import { searchBooks, searchActivities } from './ai/tools';

export interface LegacyChatContext {
    studentId?: string;
    currentSubject?: string;
    [key: string]: unknown;
}

export interface PlanSlot {
    activityTitle: string;
    [key: string]: unknown;
}

export interface ChildProfile {
    name: string;
    age_in_months: number;
    [key: string]: unknown;
}

/**
 * AiCoach: Legacy support class
 * Main chat now handled by Cortex; this is for auxiliary functions.
 */
export class AiCoach {
    constructor(private env: Env) { }

    // Helper to create stream-compatible response from plain text
    private createTextStream(text: string): ReadableStream {
        const encoder = new TextEncoder();
        return new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ response: text })}\n\n`));
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
            }
        });
    }

    /**
     * Legacy chat method - simplified
     * Main chat is now handled by Cortex
     */
    async chat(message: string, context: LegacyChatContext, mode: 'parent' | 'student' = 'parent') {
        if (mode === 'student') {
            return this.studentChat(message, context);
        }

        // Simple search + LLM for parent mode
        let searchContextString = "";
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('book') || lowerMessage.includes('read')) {
            const results = await searchBooks(this.env.DB, message);
            searchContextString = `FOUND BOOKS:\n${JSON.stringify(results.slice(0, 5))}`;
        } else if (lowerMessage.includes('activity')) {
            const results = await searchActivities(this.env.DB, message);
            searchContextString = `FOUND ACTIVITIES:\n${JSON.stringify(results.slice(0, 5))}`;
        }

        const systemPrompt = `You are FamilyPath Assistant. Help parents homeschool.
${searchContextString}
Be warm, brief, and helpful.`;

        try {
            return await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                stream: true
            });
        } catch (error) {
            console.error('AI Error:', error);
            return this.createTextStream("I'm having trouble right now. Please try again.");
        }
    }

    /**
     * Student Chat: Socratic approach
     */
    private async studentChat(message: string, context: LegacyChatContext): Promise<ReadableStream> {
        const socraticPrompt = `You are a wise tutor. NEVER give direct answers. Ask guiding questions. Keep replies to 3 sentences max.`;

        try {
            const response = await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
                messages: [
                    { role: 'system', content: socraticPrompt },
                    { role: 'user', content: message }
                ],
                stream: true
            });

            // Log for parent visibility
            if (context.studentId) {
                this.logStudentInteraction(context.studentId, message, context.currentSubject || 'general').catch(console.error);
            }

            return response;
        } catch (error) {
            console.error('Student AI Error:', error);
            return this.createTextStream("I'm having trouble thinking right now.");
        }
    }

    private async logStudentInteraction(studentId: string, question: string, subject: string): Promise<void> {
        try {
            const student = await this.env.DB.prepare(
                'SELECT household_id FROM students WHERE id = ?'
            ).bind(studentId).first<{ household_id: string }>();

            const parent = student ? await this.env.DB.prepare(
                'SELECT id FROM users WHERE household_id = ? AND role = ? LIMIT 1'
            ).bind(student.household_id, 'parent').first<{ id: string }>() : null;

            await this.env.DB.prepare(`
                INSERT INTO ai_interaction_logs (id, parent_id, student_id, interaction_type, question, answer, context_json, created_at)
                VALUES (?, ?, ?, 'socratic', ?, ?, ?, datetime('now'))
            `).bind(
                `slog-${Date.now()}-${crypto.randomUUID().substring(24)}`,
                parent ? parent.id : 'unknown',
                studentId,
                question,
                '(Socratic response)',
                JSON.stringify({ subject })
            ).run();
        } catch (e) {
            console.error('Log student interaction error:', e);
        }
    }

    async explainPlan(slot: PlanSlot, child: ChildProfile) {
        const prompt = `Explain why "${slot.activityTitle}" is appropriate for ${child.name} (${child.age_in_months} months). Keep it to 2 sentences.`;
        return await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [
                { role: 'system', content: "You are an early childhood educator." },
                { role: 'user', content: prompt }
            ]
        });
    }
}
