
import { Ai } from '@cloudflare/ai';

interface Env {
    AI: any;
    DB: D1Database;
}

export const onRequestPost = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);

    // Router for /api/chat/*
    if (url.pathname.endsWith('/actions')) {
        return handleGetActions(request, env);
    }
    if (url.pathname.endsWith('/confirm')) {
        return handleConfirmAction(request, env);
    }
    if (url.pathname.endsWith('/reject')) {
        return handleRejectAction(request, env);
    }

    // Default: Chat
    return handleChat(request, env);
};

// --- CHAT HANDLER ---

async function handleChat(request: Request, env: Env) {
    try {
        const { messages, context: clientContext } = await request.json() as any;

        // System Prompt
        const systemPrompt = `You are the FamilyPath Frontdesk Officer.
    
    YOUR ROLE:
    - First point of contact for families
    - Greet, help, and get things done
    - You have many capabilities but always ask before acting
    
    YOUR RULES:
    1. NEVER act without confirmation. You can PROPOSE actions, but must wait for the user to confirm.
    2. ALWAYS explain your reasoning briefly.
    3. KEEP IT SIMPLE — most parents have 5 minutes.
    4. LOG EVERYTHING — every action is recorded.
    5. STAY IN YOUR LANE — you suggest, parents decide.
    
    TOOLS:
    - adjust_schedule: Modify the family's weekly schedule.
    - skip_activity: Skip a specific activity.
    - log_observation: Record a parent's observation about a child.
    
    When you want to perform an action, output a JSON block like this:
    [ACTION_PENDING]
    {
      "id": "uuid",
      "type": "adjust_schedule",
      "data": { ... },
      "reason": "..."
    }
    
    Do NOT execute the action yourself. The frontend will show a confirmation card.
    `;

        const fullMessages = [
            { role: 'system', content: systemPrompt },
            ...messages
        ];

        // Using Gemini Flash via Cloudflare AI
        // If unavailable, we might fail, but let's assume binding exists.
        const ai = new Ai(env.AI);

        // Call AI
        const response = await ai.run('@cf/google/gemini-2.0-flash-exp', {
            messages: fullMessages,
            stream: true
        });

        return new Response(response, {
            headers: { 'content-type': 'text/event-stream' }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

// --- ACTION HANDLERS ---

async function handleGetActions(request: Request, env: Env) {
    // TODO: Fetch pending actions from DB
    // For now return empty or mock
    return new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } });
}

async function handleConfirmAction(request: Request, env: Env) {
    const { actionId } = await request.json() as any;

    // Logic to execute the action would go here.
    // E.g. update 'weekly_plan' table if action is 'adjust_schedule'
    // Insert into 'ai_action_log' with status 'confirmed'

    // Mock success
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
}

async function handleRejectAction(request: Request, env: Env) {
    const { actionId } = await request.json() as any;

    // Update 'ai_action_log' with status 'rejected'

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
}
