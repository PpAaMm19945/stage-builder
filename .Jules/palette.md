## 2026-01-09 - UpNextCard Accessibility
**Learning:** Icon-only buttons with notification badges are a common accessibility trap. Users with screen readers often miss the notification count if it's not explicitly part of the accessible name or description.
**Action:** When adding badges to buttons, always ensure the count is included in the `aria-label` or provided via a screen-reader-only span that describes the count (e.g., "5 pending items"). Also, use Tooltips for mouse users instead of `title` attributes for better consistency and accessibility.

## 2026-01-20 - Calendar Strip Accessibility
**Learning:** Visual day pickers often split information (day name, number, status dots) across multiple elements, making them unintelligible to screen readers which read them disjointedly.
**Action:** For complex interactive lists like calendar strips, construct a single, comprehensive `aria-label` for the container button that aggregates all state (e.g., "Monday, Jan 1st. Today. 3 activities") and use `aria-current="date"` to indicate the active selection.
