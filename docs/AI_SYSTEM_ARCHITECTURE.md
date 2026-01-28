# FamilyPath AI System Architecture

> **Status**: Implemented & Operational
> **Last Updated**: 2026-01-28

---

## 1. System Overview

FamilyPath uses a "Dual Brain" architecture to handle both simple queries (System 1) and complex planning (System 2), orchestrated by a central Cortex on Cloudflare Workers.

### 1.1 High-Level Data Flow

```mermaid
flowchart TD
    subgraph Client [Frontend (React)]
        UI[ChatPanel]
        Stream[useChatStream: SSE Reader]
        State[useChatState: UI State]
    end

    subgraph Server [Backend (Cloudflare Worker)]
        API["/api/chat (Hono)"]
        Router[AiRouter]
        Cortex[Cortex Orchestrator]
        Tools[Start/Stop Actions]
    end

    subgraph Data [Storage]
        DB[(D1 Database)]
        Logs[ai_logs Table]
    end

    subgraph Models [AI Models]
        Llama["System 1: Llama 3<br/>(Conversation, Search)"]
        Gemini["System 2: Gemini<br/>(Planning, Reasoning)"]
    end

    UI --> Stream --> API
    API --> Cortex --> Router
    Router -->|Intent| Cortex
    Cortex -->|Simple| Llama
    Cortex -->|Complex| Gemini
    Cortex -->|Log Action| Logs
    Cortex -->|Query| DB
```

---

## 2. Core Components

### 2.1 Cortex (The Orchestrator)
- **Role**: Determines which model to use and manages the tool execution pipeline.
- **Logic**:
  - `isComplexRequest()`: Checks for keywords (plan, schedule, why) or length > 200 chars.
    - **True** → System 2 (Gemini Planner)
    - **False** → System 1 (Llama 8B)

### 2.2 System 1: The Frontdesk Officer
- **Model**: `meta/llama-3-8b-instruct`
- **Capabilities**: Fast, conversational, tool-using.
- **Router**: Classifies user messages into intents (Chain-of-Thought reasoning).

**Supported Intents:**
| Intent | Trigger Example | Executed Action |
|--------|-----------------|-----------------|
| `SEARCH_BOOKS` | "Book about lions" | Queries `formations` table (type=reading) |
| `SEARCH_ACTIVITIES` | "Game for motor skills" | Queries `formations` table (type=habit/skill) |
| `GET_TODAY_SCHEDULE` | "What's my schedule?" | Fetches today's rhythm items |
| `ADJUST_SCHEDULE` | "Skip math today" | Returns `[ACTION_PENDING]` for user confirmation |
| `GENERAL_CHAT` | "Hello", "Philosophy?" | Context-aware chat response |

### 2.3 Persistence (Memory)
- **Mechanism**:
  - Every significant action (Search, Explain, Schedule) is logged to `ai_logs` table.
  - On Page Load: `ChatPanel` fetches `ai.getInteractionLog()` (last 50 items).
  - **Storage Format**:
    ```sql
    INSERT INTO ai_logs (id, interaction_type, question, answer, context_json)
    VALUES (..., 'search', 'lions', 'Found 3 books', '{"results": [...]}')
    ```
  - **Replay**: frontend hydration reconstructs the generic `Message` and specific `ActionCard` from the `context_json`.

---

## 3. Streaming Protocol

We use Server-Sent Events (SSE) to provide "Lovable-style" visibility into the AI's thought process.

### 3.1 Event Types

| Event | Format | Description |
|-------|--------|-------------|
| `event: step` | `{"id":1, "label":"Thinking...", "status":"active"}` | Displays a processing step in the UI. |
| `event: thought` | `"Checking constraints..."` | (Optional) Internal monologue. |
| `data: ...` | Text chunk | Standard text streaming. |
| `data: [DATA_BLOCK]` | JSON | Structured results (Search/Schedule). |

### 3.2 Example Stream Sequence (Get Schedule)
1. `event: step` -> `{"label": "Checking your schedule...", "status": "active"}`
2. **(Server queries DB)**
3. `event: step` -> `{"label": "Found 3 items", "status": "complete"}`
4. `data: [DATA_BLOCK]{"type":"GET_TODAY_SCHEDULE", "data":{...}}[DATA_BLOCK]`
5. **(Client renders ScheduleCardMessage)**

---

## 4. Debugging & Diagnostics

### 4.1 Backend Logging
- **Router Decisions**:
  - Look for `[Router] Decision:` in Cloudflare logs.
  - Shows `reasoning` (why it chose an intent) and `intent`.
- **Tool Execution**:
  - Look for `[Cortex] Tool execution failed` for DB errors.
  - Look for `[Cortex] Llama error` for model connectivity issues.

### 4.2 Frontend Diagnostics
- **Connection Issues**: Check Browser Network Tab -> `chat` request.
  - **Pending**: Stream is open.
  - **Failed**: Network/Worker error.
- **Missing History**:
  - Check `/api/ai/interactions` response.
  - If empty, check `ai_logs` table in D1.

### 4.3 Database Tables
- `ai_logs`: Stores chat history and action contexts.
- `ai_action_log`: Stores pending actions (ADJUST_SCHEDULE) waiting for confirmation.
- `formations`: Source of truth for books/activities.
- `family_preferences`: Source of truth for daily rhythm settings.

---

## 5. File Usage

| Function | File Path |
|----------|-----------|
| **Routing** | `cloudflare/src/ai/router.ts` |
| **Tools** | `cloudflare/src/ai/tools.ts` |
| **Logic** | `cloudflare/src/ai/cortex.ts` |
| **UI** | `src/components/chat/ChatPanel.tsx` |
| **Stream** | `src/components/chat/hooks/useChatStream.ts` |
