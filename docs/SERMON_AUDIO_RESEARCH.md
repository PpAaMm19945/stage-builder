# SermonAudio API & Hymn Embedding Research

## Executive Summary
The goal was to research the possibility of embedding hymns from SermonAudio into the SchoolOS Daily Liturgy section and determine the best UX/UI approach.

## SermonAudio API v2 Findings
*   **API Model:** SermonAudio's v2 API is primarily designed for **broadcasters** (churches/ministries) to manage their own content. Read/Write access typically requires a broadcaster API key.
*   **Public Access:** While there are public endpoints, they are often rate-limited or intended for specific integrations.
*   **Embed Strategy (Recommended):** SermonAudio provides a robust embedding system (oEmbed and iframe). This is the most reliable way to include content without a paid API key.
    *   **Direct MP3:** Some endpoints expose the direct MP3 URL (e.g., `https://media.sermonaudio.com/...`), which allows us to build a **custom UI**. This is the preferred "High Quality" UX approach.
    *   **Iframe:** If direct access is restricted, the fallback is their standard iframe player.

## UX/UI Recommendation: "Hybrid Hymn Player"
To provide the best "SchoolOS" experience while remaining flexible, we have designed a **Hybrid Hymn Player**.

### 1. The "Native" Experience (Preferred)
*   **Source:** Direct MP3/M4A URL (from SermonAudio or our own R2 storage).
*   **UI:** A custom-built player using our design system (Tailwind + Phosphor Icons).
*   **Features:**
    *   Play/Pause toggle.
    *   Scrubbable progress bar (Slider).
    *   Time remaining display.
    *   Consistent "Amber" theming to match the Liturgy card.
*   **Benefit:** Feels like part of the app, no external branding, fits perfectly above lyrics.

### 2. The "Embed" Experience (Fallback)
*   **Source:** YouTube URL, SermonAudio Embed URL, or other web players.
*   **UI:** A responsive `iframe` container.
*   **Benefit:** Guarantees content works even if we can't get the raw audio file.

## Implementation Plan
We have updated the `DailyLiturgy` component to support an `audio_url` field.
*   **Input:** The system checks `item.audio_url`.
*   **Detection:** It automatically detects if the URL is a file (`.mp3`, `.m4a`) or a web page.
*   **Render:** Displays the appropriate player (Native vs. Embed).

## Future "Planning" Integration
The user mentioned "so they can plan in my site".
*   **Current:** We display the hymn of the week based on the schedule.
*   **Future:** To allow *searching* SermonAudio during planning, we would need to build a server-side proxy (Cloudflare Worker) to scrape or query SermonAudio's public search pages (respecting `robots.txt`) or apply for a developer key if available for non-broadcasters.
*   **Immediate Solution:** Parents can manually paste a URL into the "Custom/Override" fields if they want to swap the hymn (Phase 2 feature).
