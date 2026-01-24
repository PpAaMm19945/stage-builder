# Handoff Prompt: Migrate All AI to Direct Gemini Integration

**Context**
We are pivoting our architecture to **Option 1: Direct Gemini Integration**. We are removing the dependency on "Lovable Gateway" (which is an internal, unavailable proxy) and connecting our Cloudflare Backend directly to Google's Gemini API. This affects both the **Report Generator** and the **Frontdesk Chatbot**.

**Objective**
Refactor the Cloudflare Worker to use a shared `GeminiService` for all AI operations. This service must handle Google's specific REST API format (which differs from the OpenAI-compatible format used previously).

**Implementation Plan**

1.  **Environment Config (`cloudflare/src/index.ts`)**
    -   Remove `LOVABLE_API_KEY` binding.
    -   Add `GOOGLE_API_KEY` binding.

2.  **Create Shared `GeminiService` (`cloudflare/src/ai/gemini.ts`)**
    -   Create a robust service class to handle Google Generative AI REST calls.
    -   **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}` (or `gemini-2.0-flash-exp` if preferred).
    -   **Server-Sent Events (SSE):** Implement `streamGenerateContent` to handle streaming responses. Note that Google's stream format sends JSON chunks (e.g., `{"candidates": [...]}`) which must be parsed differently than OpenAI's `data: [...]`.
    -   **Tool Calling:** Map our "Actions" (like `propose_schedule_change`) to Gemini's "Function Declarations" format.

3.  **Refactor Report Generator (`cloudflare/src/ai/report-generator.ts`)**
    -   Replace `LovableGateway` with `GeminiService`.
    -   Use `generateContent` (non-streaming) with `response_mime_type: "application/json"` to get structured JSON reports.

4.  **Refactor Chatbot (`cloudflare/src/ai/frontdesk.ts`)**
    -   **Critical:** Rewrite the `chat` method to use `GeminiService`.
    -   **Payload:** Convert the system prompt and message history into Gemini's `contents` format (`user` / `model` roles).
    -   **Streaming:** The current transformer expects OpenAI chunks (`choices[0].delta`). Rewrite it to parse Google chunks (`candidates[0].content.parts[0].text`).
    -   **Tools:** Re-implement tool definition using Gemini's schema.

5.  **Cleanup**
    -   Delete `cloudflare/src/ai/lovable-gateway.ts`.

**Technical Details for Google API**
*   **Message Format:**
    ```json
    { "role": "user", "parts": [{ "text": "Hello" }] }
    ```
*   **System Instruction:** Passed as a top-level `systemInstruction` field, not a message.
*   **Streaming:** The API returns a stream of JSON objects. You must parse the `text` field from `candidates[0].content.parts[0].text`.

**Next Step for Agent**
Execute this plan. Start by creating the `GeminiService` in `cloudflare/src/ai/gemini.ts` that can handle both standard generation and streaming chat with tools.
