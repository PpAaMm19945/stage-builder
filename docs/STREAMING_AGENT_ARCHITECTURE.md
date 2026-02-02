# Seamless Transition to Streaming Agent Architecture

## Overview

This document outlines the architectural transition from the current "Router-Classifier" model to a "Streaming ReAct Agent" model (Reason + Action). This includes the "Observable Monologue" experience and a Hybrid Memory Strategy to ensure context persistence and scalability.

## Hybrid Memory Strategy

To solve the "amnesic chat" problem where context is lost on reload, we implement a hybrid approach:

| Layer | Storage Mechanism | Purpose | Retention |
| :--- | :--- | :--- | :--- |
| **Layer 1: Session Cache** | **IndexedDB** (Client-Side) | Stores full conversation history (messages, steps, cards). Survives page reloads. | ~24 hours (Client managed) |
| **Layer 2: Action Log** | **D1 Database** (Server-Side) | Stores *significant* AI actions (searches, confirmations). Used for "Interaction Logs" UI and parental audit. | Permanent |
| **Layer 3: Context Summary** | **Llama 3 Instruct** (Server-Side) | Summarizes long conversations to fit within context windows. Used when sending history to Llama. | Ephemeral (Generated on fly) |

## Model Escalation Strategy

We dynamicallly route requests based on complexity and context size to optimize for cost and intelligence.

| Model | Role | Trigger Condition |
| :--- | :--- | :--- |
| **Llama 3 8B** | **Router & General Chat** | Standard queries, short context (<6k tokens). Fast and cheap. |
| **Llama 3 8B (ReAct)** | **Agent Loop** | Multi-step reasoning tasks ("Check schedule THEN search books"). |
| **Gemini 2.0 Flash** | **Deep Brain** | Deep planning ("Create a schedule"), reasoning ("Why?"), or Long Context (>6k tokens). |

## The Protocol: "The Observable Monologue"

We use Server-Sent Events (SSE) to stream both thoughts (steps) and content.

### Event Types
1.  **`event: step`**: User-facing actions (e.g., `{"label": "Searching...", "status": "active"}`).
2.  **`event: thought`**: Internal reasoning (e.g., "I need to find the user's age first").
3.  **`event: message`**: Text content or data blocks.

## The Agent Loop (ReAct) implementation

For complex queries, `Cortex` enters a feedback loop:
1.  **Thought**: Analyzes history and determines next step.
2.  **Action**: Calls a tool (Search, Schedule, Time).
3.  **Observation**: Feeds tool result back into context.
4.  **Repeat**: Until a final answer is formulated.

### Flow Diagram

```mermaid
graph TD
    User[User Message] --> Router[AiRouter (Llama)]
    Router --> Intent{Intent?}
    
    Intent -- Tools (Adjust/Search) --> ToolExec[Execute Tool]
    Intent -- Complex Query --> AgentLoop[Agent Loop (ReAct)]
    
    Intent -- General Chat --> Selector{Context Size / Complexity}
    Selector -- Short/Simple --> Llama[Llama 3 8B]
    Selector -- Long/Deep --> GeminiFlash[Gemini 2.0 Flash]
    
    AgentLoop --> Step1[Thought -> Tool -> Result]
    Step1 --> Step2[Thought -> Final Answer]
    Step2 --> Stream[Stream Response]
```

## Implementation Details

### Server-Side (Cortex)
-   `runAgentLoop(message, history)`: Implements the iterative loop (max 5 steps).
-   `selectModel(message, history)`: Heuristic function to choose model.
-   `summarizer.compressIfNeeded(history)`: Reducer for Llama context window.
