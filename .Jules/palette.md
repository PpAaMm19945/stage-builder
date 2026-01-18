## 2026-01-09 - UpNextCard Accessibility
**Learning:** Icon-only buttons with notification badges are a common accessibility trap. Users with screen readers often miss the notification count if it's not explicitly part of the accessible name or description.
**Action:** When adding badges to buttons, always ensure the count is included in the `aria-label` or provided via a screen-reader-only span that describes the count (e.g., "5 pending items"). Also, use Tooltips for mouse users instead of `title` attributes for better consistency and accessibility.

## 2026-05-21 - Complex Button State Summaries
**Learning:** Complex interactive elements like calendar day buttons often contain scattered visual cues (status icons, color bars, badges) that are hard for screen readers to synthesize.
**Action:** Construct a single, comprehensive `aria-label` that summarizes all state information in natural language (e.g., "Monday, Oct 25. 5 activities. Status: Completed"), rather than relying on the screen reader to announce individual children elements.
