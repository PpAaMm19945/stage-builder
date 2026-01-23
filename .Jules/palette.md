## 2026-01-09 - UpNextCard Accessibility
**Learning:** Icon-only buttons with notification badges are a common accessibility trap. Users with screen readers often miss the notification count if it's not explicitly part of the accessible name or description.
**Action:** When adding badges to buttons, always ensure the count is included in the `aria-label` or provided via a screen-reader-only span that describes the count (e.g., "5 pending items"). Also, use Tooltips for mouse users instead of `title` attributes for better consistency and accessibility.

## 2026-01-20 - Error Handling Patterns
**Learning:** Using `alert()` interrupts the user flow and provides a poor experience, especially for recoverable errors like network failures.
**Action:** Replace `alert()` with inline error states or non-blocking toast notifications. This keeps the user in context and allows them to retry without dismissing a system modal.

## 2026-01-21 - Keyboard Visibility for Hover Controls
**Learning:** Components that rely on `group-hover` for visibility (like carousel arrows) are invisible to keyboard users. This creates a "tab into the void" experience.
**Action:** Always pair `group-hover:opacity-100` with `focus:opacity-100` (or `focus-visible`) to ensure keyboard users can track their focus location.

## 2026-01-21 - Ghost Buttons vs. Touch Targets
**Learning:** Large invisible `div`s used as touch targets can duplicate screen reader announcements if accessible buttons also exist for the same action.
**Action:** Use `aria-hidden="true"` on purely "convenience" tap zones if there are standard, accessible buttons already present in the DOM.
