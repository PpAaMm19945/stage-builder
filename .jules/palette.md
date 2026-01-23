## 2026-01-09 - UpNextCard Accessibility
**Learning:** Icon-only buttons with notification badges are a common accessibility trap. Users with screen readers often miss the notification count if it's not explicitly part of the accessible name or description.
**Action:** When adding badges to buttons, always ensure the count is included in the `aria-label` or provided via a screen-reader-only span that describes the count (e.g., "5 pending items"). Also, use Tooltips for mouse users instead of `title` attributes for better consistency and accessibility.

## 2026-01-20 - Error Handling Patterns
**Learning:** Using `alert()` interrupts the user flow and provides a poor experience, especially for recoverable errors like network failures.
**Action:** Replace `alert()` with inline error states or non-blocking toast notifications. This keeps the user in context and allows them to retry without dismissing a system modal.

## 2026-05-21 - List Action Loading States
**Learning:** In list views with inline actions (like Approve/Reject), failing to disable *all* related actions while one is processing can lead to race conditions or confused user state.
**Action:** When implementing async actions in a list, track the specific `processingId` but disable *all* action buttons in the list during the operation to ensure data integrity and clear feedback.
