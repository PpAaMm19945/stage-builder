
import { Ai } from '@cloudflare/ai';

interface Env {
    AI: any;
    DB: D1Database;
}

export const onRequestPost = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);

    if (url.pathname.endsWith('/explain-plan')) {
        return handleExplainPlan(request, env);
    }
    if (url.pathname.endsWith('/child-explain')) {
        return handleChildExplain(request, env);
    }
    if (url.pathname.endsWith('/weekly-summary')) {
        return handleWeeklySummary(request, env);
    }
    if (url.pathname.endsWith('/feedback-draft')) {
        return handleFeedbackDraft(request, env);
    }

    return new Response('Not Found', { status: 404 });
};

export const onRequestGet = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);

    if (url.pathname.endsWith('/interactions')) {
        return handleGetInteractions(request, env);
    }

    return new Response('Not Found', { status: 404 });
}

// --- HANDLERS ---

async function handleExplainPlan(request: Request, env: Env) {
    const { slot, childId } = await request.json() as any;
    const ai = new Ai(env.AI);

    const prompt = `Explain why the following activity is scheduled for this child.
    Activity: ${JSON.stringify(slot)}
    Child ID: ${childId}
    
    Give 3 bullet points explaining the pedagogical or formation reason.`;

    const response = await ai.run('@cf/google/gemini-2.0-flash-exp', {
        messages: [{ role: 'user', content: prompt }]
    });

    return new Response(JSON.stringify(response), { headers: { 'Content-Type': 'application/json' } });
}

async function handleChildExplain(request: Request, env: Env) {
    const { studentId, question, context } = await request.json() as any;
    const ai = new Ai(env.AI);

    const prompt = `You are a helpful teacher. Answer this question for a child.
    Question: "${question}"
    Context: ${JSON.stringify(context)}
    
    Keep it simple, encouraging, and accurate. Max 3 sentences.`;

    const response = await ai.run('@cf/google/gemini-2.0-flash-exp', {
        messages: [{ role: 'user', content: prompt }]
    });

    // Log this interaction to DB (mocked for now)
    // await env.DB.prepare("INSERT INTO ai_interactions ...").run();

    return new Response(JSON.stringify({ answer: response.response }), { headers: { 'Content-Type': 'application/json' } });
}

async function handleGetInteractions(request: Request, env: Env) {
    // Mock data for the log viewer until DB is connected
    const mockLogs = [
        {
            id: '1',
            studentName: 'Azie',
            question: 'Why did Augustine run away?',
            answer: 'Augustine ran away because he wanted to find truth but was looking in the wrong places. He went to Carthage to study, but eventually, God led him to the truth in the Bible.',
            interactionType: 'child_explain',
            context: { activityTitle: 'Augustine: The Boy Who Ran' },
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            studentName: 'Family',
            question: 'Schedule Adjustment',
            answer: 'Moved Friday activities to Thursday to lighten the load.',
            interactionType: 'action_plan',
            createdAt: new Date(Date.now() - 86400000).toISOString()
        }
    ];

    return new Response(JSON.stringify(mockLogs), { headers: { 'Content-Type': 'application/json' } });
}

async function handleWeeklySummary(request: Request, env: Env) {
    const { weekStart } = await request.json() as any;
    // Mock
    return new Response(JSON.stringify({ summary: "Great week!" }), { headers: { 'Content-Type': 'application/json' } });
}

async function handleFeedbackDraft(request: Request, env: Env) {
    // Mock
    return new Response(JSON.stringify({ draft: "Good job." }), { headers: { 'Content-Type': 'application/json' } });
}
