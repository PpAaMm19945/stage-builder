# Seamless Transition to Streaming Agent Architecture

## Overview

This document outlines the architectural transition from the current "Router-Classifier" model to a "Streaming ReAct Agent" model (Reason + Action). This shift enables the "Observable Monologue" experience where the user sees the agent's real-time thinking and actions (e.g., "Checking profile...", "Found 3 books"), increasing trust and transparency.

## Current State vs. Desired State

| Feature | Current Architecture (Router-Classifier) | Desired Architecture (Agent Loop) |
| :--- | :--- | :--- |
| **Decision Making** | **Upfront Classification**: `AiRouter` decides the intent *once* at the start. | **Iterative Loop**: The Agent decides step-by-step what to do next. |
| **Execution** | **Linear**: Route -> Handler -> Response. | **Cyclic**: Thought -> Tool Call -> Observation -> Thought -> Response. |
| **Streaming** | Partial `event: step` implementation in specific handlers. | Standardized "Thought Stream" for all actions. |
| **Flexibility** | Rigid. Hard to handle multi-step tasks (e.g., "Check X then do Y"). | Flexible. Agent handles dynamic flows naturally. |

## The Protocol: "The Observable Monologue"

To achieve the "Glass Box" effect, we standardize the Server-Sent Events (SSE) protocol. The frontend (`ChatPanel` / `useChatStream`) is already partially equipped to handle this.

### Event Types

1.  **`event: step`**
    *   **Purpose**: User-facing logs of *actions*.
    *   **Format**: JSON `{ "id": 1, "label": "Checking settings...", "status": "active" | "complete" | "error" }`
    *   **UI**: Renders in `BotActivityLog` (the small checklist below the message).

2.  **`event: thought`**
    *   **Purpose**: Internal reasoning (optional transparency).
    *   **Format**: Plain text or JSON string.
    *   **UI**: Can be shown as a "Thinking..." bubble or hidden debug log.

3.  **`event: message`** (Default)
    *   **Purpose**: The actual text response or data blocks.
    *   **Format**: Text chunks or `[DATA_BLOCK]...` / `[ACTION_PENDING]...`.

### Example Stream

```
event: log
data: "Analyzing user request..."

event: step
data: {"id": 1, "label": "Checking your profile...", "status": "active"}

event: step
data: {"id": 1, "label": "Checking your profile", "status": "complete"}

event: step
data: {"id": 2, "label": "Comparing preferences...", "status": "active"}

data: "I noticed you prefer..."
```

## Implementation Strategy: The Agent Loop

The core change is moving from `router.routeRequest()` to a `runAgentLoop()` in `Cortex.ts`.

### 1. Is Llama 3B Capable?
**Yes.** In fact, the "Loop" architecture is *better* for smaller models like Llama 3.2 3B than the "One-Shot" approach.
*   **Why**: Small models struggle with complex, multi-step plans in one go. By breaking it down (One tool at a time), we reduce the cognitive load.
*   **Technique**: We must use **Structured Outputs** (JSON mode) to force the model to output strict tool calls.

### 2. The `runAgentLoop` Logic (Pseudo-code)

This function replaces the specific intent handlers for complex queries.

```typescript
async function runAgentLoop(userMessage, context, history) {
  let iterations = 0;
  const maxIterations = 5; // Safety limit

  while (iterations < maxIterations) {
    // 1. Prepare Messages (System + History + Tool Results)
    const messages = buildMessages(systemPrompt, history, toolResults);

    // 2. Stream "Thinking" status
    streamStep({ label: "Thinking...", status: "active" });

    // 3. Call AI (Force JSON output for tool decision)
    const response = await ai.run('@cf/meta/llama-3.2-3b-instruct', {
      messages,
      response_format: { type: "json_object" }
    });

    // 4. Parse Decision
    const decision = JSON.parse(response); // e.g., { "tool": "check_settings", "arg": "..." } OR { "response": "Hi..." }

    // CASE A: Agent wants to run a tool
    if (decision.tool) {
      // 1. Notify User
      streamStep({ label: `Running ${decision.tool}...`, status: "active" });

      // 2. Execute Tool
      const result = await executeTool(decision.tool, decision.arg);

      // 3. Complete Step
      streamStep({ label: `Finished ${decision.tool}`, status: "complete" });

      // 4. Add result to history for next loop
      toolResults.push({ role: "tool", content: JSON.stringify(result) });

      iterations++;
    }

    // CASE B: Agent has a final answer
    else {
      // Stream the final text response
      streamText(decision.response);
      break;
    }
  }
}
```

## Transition Plan

We can transition seamlessly without breaking the current app.

### Phase 1: Protocol Standardization (Immediate)
*   **Audit Tools**: Ensure `searchBooks`, `searchActivities`, etc., in `Cortex.ts` all use the standard `event: step` format. (Currently some use custom logic).
*   **Frontend Check**: Verify `ChatPanel.tsx` correctly renders `steps`. (Confirmed: `BotActivityLog` is present).

### Phase 2: The "Hybrid" Router
*   Modify `AiRouter` (or `Cortex`) to add a new Intent: `AGENT_LOOP`.
*   Update the System Prompt to classify ambiguous or multi-step queries as `AGENT_LOOP` instead of defaulting to `GENERAL_CHAT`.
*   Keep specific optimized paths (like `SEARCH_BOOKS` when the user just says "find books") for speed, but route complex queries ("Why is my schedule empty?") to the Loop.

### Phase 3: Granular Debugging
*   Since the frontend receives these events, we can add a "Debug Mode" toggle for developers.
*   When enabled, `event: thought` and raw tool inputs/outputs can be displayed in a collapsible panel.
*   This fulfills the "Granular Debugging" requirement: You will see exactly *why* the agent failed (e.g., Tool returned empty list vs. AI hallucination).

## Summary
The transition leverages your existing `Cortex` class and Frontend `ChatPanel`. The "Loop" is simply a smarter way of invoking the AI, treating it as a reasoning engine that drives the existing tools. Llama 3B is perfectly suited for this when constrained to one step at a time via the Loop.
