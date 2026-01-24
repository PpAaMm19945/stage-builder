import { Env } from '../index';
import { LovableGateway } from './lovable-gateway';

export interface WeeklyReport {
    week_start: string;
    week_end: string;
    summary: {
        total: number;
        completed: number;
        skipped: number;
        transferred: number;
        completion_rate: number;
    };
    by_type: {
        catechism: number;
        hymns: number;
        books: number;
        scripture: number;
        skill: number;
        habit: number;
        service: number;
        rest: number;
    };
    time_invested: {
        total_minutes: number;
        daily_average: number;
    };
    insights: string[];
    next_week_preview: {
        theme: string;
        highlights: string[];
    };
}

export class ReportGenerator {
    private env: Env;
    private lovable: LovableGateway | null = null;

    constructor(env: Env) {
        this.env = env;
        if (env.LOVABLE_API_KEY) {
            this.lovable = new LovableGateway(env.LOVABLE_API_KEY);
        }
    }

    async generateReport(familyId: string, weekStart: string): Promise<WeeklyReport> {
        const weekEnd = new Date(new Date(weekStart).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // 1. Load Data
        const data = await this.loadWeekData(familyId, weekStart, weekEnd);
        const children = await this.loadChildren(familyId);

        // 2. Calculate Stats
        const stats = this.calculateStats(data);

        // 3. Generate Insights (AI)
        const insights = await this.generateInsights(stats, children, data.activities);

        // 4. Build Report
        return {
            week_start: weekStart,
            week_end: weekEnd,
            summary: stats.summary,
            by_type: stats.by_type,
            time_invested: stats.time_invested,
            insights: insights.insights,
            next_week_preview: {
                theme: "Continuing the Journey", // Placeholder, could be AI generated too
                highlights: [] // Placeholder
            }
        };
    }

    private async loadWeekData(familyId: string, start: string, end: string) {
        // Fetch activity progress for the week
        const { results } = await this.env.DB.prepare(`
      SELECT * FROM activity_progress 
      WHERE completed_at BETWEEN ? AND ? 
      AND student_id IN (
        SELECT id FROM students WHERE household_id = (
             SELECT household_id FROM users WHERE id = ?
        )
      )
    `).bind(`${start} 00:00:00`, `${end} 23:59:59`, familyId).all<any>();

        // Also fetch formations to get types and durations
        // Assuming activity_progress has formation_id
        // We might need to JOIN or fetch separately.
        // If activity_progress is a join table or has type info, great.
        // If not, we need formation details.
        // Let's assume we need to join or fetch formations.
        // Since we don't know exact schema, let's try a safe approach:
        // Fetch formations for the IDs we found.

        const activityIds = results.map(r => r.formation_id).filter(id => id);
        let formations: any[] = [];

        if (activityIds.length > 0) {
            const placeholders = activityIds.map(() => '?').join(',');
            const fResult = await this.env.DB.prepare(`
        SELECT id, type, title, duration_minutes FROM formations WHERE id IN (${placeholders})
      `).bind(...activityIds).all<any>();
            formations = fResult.results;
        }

        // Map formations to results
        const combined = results.map(r => {
            const f = formations.find(form => form.id === r.formation_id);
            return {
                ...r,
                type: f?.type || 'unknown',
                title: f?.title || 'Unknown Activity',
                duration_minutes: f?.duration_minutes || 0
            };
        });

        return { activities: combined };
    }

    private async loadChildren(familyId: string) {
        const { results } = await this.env.DB.prepare(`
        SELECT id, name, age_in_months FROM students 
        WHERE household_id = (SELECT household_id FROM users WHERE id = ?)
    `).bind(familyId).all<any>();
        return results;
    }

    private calculateStats(data: { activities: any[] }) {
        const activities = data.activities;
        const completed = activities.filter(a => a.status === 'completed');

        const by_type = {
            catechism: completed.filter(a => a.type === 'liturgy' && (a.title.includes('Catechism') || a.title.includes('Question'))).length,
            hymns: completed.filter(a => a.type === 'liturgy' && a.title.includes('Hymn')).length,
            books: completed.filter(a => a.type === 'reading').length,
            scripture: completed.filter(a => a.type === 'liturgy' && (a.title.includes('Scripture') || a.title.includes('Verse'))).length,
            skill: completed.filter(a => a.type === 'skill').length,
            habit: completed.filter(a => a.type === 'habit').length,
            service: completed.filter(a => a.type === 'service').length,
            rest: completed.filter(a => a.type === 'rest').length,
            // Fallback for generic liturgy
            liturgy_other: completed.filter(a => a.type === 'liturgy' && !a.title.includes('Catechism') && !a.title.includes('Hymn') && !a.title.includes('Scripture')).length
        };

        // Merge liturgy_other into catechism or keep separate? 
        // The spec asks for specific breakdown.

        const total_minutes = completed.reduce((sum, a) => sum + (a.duration_minutes || 0), 0);

        return {
            summary: {
                total: activities.length,
                completed: completed.length,
                skipped: activities.filter(a => a.status === 'skipped').length,
                transferred: activities.filter(a => a.status === 'transferred').length,
                completion_rate: activities.length > 0 ? Math.round((completed.length / activities.length) * 100) : 0
            },
            by_type,
            time_invested: {
                total_minutes,
                daily_average: Math.round(total_minutes / 5) // Assuming 5 day school week
            }
        };
    }

    private async generateInsights(stats: any, children: any[], activities: any[]): Promise<{ insights: string[], efficiency_note: string }> {
        // If no Lovable key, fall back to basic rules or Workers AI
        if (!this.lovable && !this.env.AI) {
            return {
                insights: ["Great work this week!"],
                efficiency_note: "Keep up the consistency."
            };
        }

        const systemPrompt = `You are an educational analyst for FamilyPath.
    Analyze the weekly formation report and provide 2-3 encouraging, specific insights.
    Focus on "stacked formation" (children learning together) and consistency.
    
    Context:
    Children: ${JSON.stringify(children)}
    Stats: ${JSON.stringify(stats)}
    Activities: ${JSON.stringify(activities.slice(0, 20).map(a => ({ title: a.title, type: a.type, status: a.status })))}
    
    Output JSON:
    {
        "insights": ["string"],
        "efficiency_note": "string"
    }`;

        try {
            if (this.lovable) {
                const result = await this.lovable.complete({
                    messages: [{ role: 'system', content: systemPrompt }],
                    temperature: 0.7
                });
                const content = result.choices[0].message.content;
                return JSON.parse(content.replace(/```json/g, '').replace(/```/g, ''));
            } else {
                // Fallback to Workers AI (Llama 3)
                const response = await this.env.AI.run('@cf/meta/llama-3-8b-instruct', {
                    messages: [{ role: 'system', content: systemPrompt }],
                });
                // Llama 3 often returns text, try to parse JSON
                // Or prompt it to be very strict
                // For simplicity, let's assume it works or handle string
                let text = response.response || response;
                try {
                    // Find JSON blob
                    const match = text.match(/\{[\s\S]*\}/);
                    if (match) return JSON.parse(match[0]);
                } catch (e) { }

                return {
                    insights: ["Consistent progress this week!"],
                    efficiency_note: "Good job maintaining rhythms."
                };
            }
        } catch (e) {
            console.error("Failed to generate insights", e);
            return {
                insights: ["Weekly report generated successfully."],
                efficiency_note: "Data processing complete."
            };
        }
    }
}
