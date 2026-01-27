## 2026-01-09 - UpNextCard Accessibility
**Learning:** Icon-only buttons with notification badges are a common accessibility trap. Users with screen readers often miss the notification count if it's not explicitly part of the accessible name or description.
**Action:** When adding badges to buttons, always ensure the count is included in the `aria-label` or provided via a screen-reader-only span that describes the count (e.g., "5 pending items"). Also, use Tooltips for mouse users instead of `title` attributes for better consistency and accessibility.

## 2026-01-20 - Error Handling Patterns
**Learning:** Using `alert()` interrupts the user flow and provides a poor experience, especially for recoverable errors like network failures.
**Action:** Replace `alert()` with inline error states or non-blocking toast notifications. This keeps the user in context and allows them to retry without dismissing a system modal.

## 2026-05-21 - List Action Loading States
**Learning:** In list views with inline actions (like Approve/Reject), failing to disable *all* related actions while one is processing can lead to race conditions or confused user state.
**Action:** When implementing async actions in a list, track the specific `processingId` but disable *all* action buttons in the list during the operation to ensure data integrity and clear feedback.

## 2026-05-24 - Responsive Tabs Accessibility
**Learning:** `TabsTrigger` components often use `hidden sm:inline` to show icons only on mobile. This removes the accessible name for screen readers if `aria-label` is not manually added.
**Action:** When hiding text labels responsively in Tabs or Buttons, always ensure `aria-label` is present to provide context for screen reader users on small screens.

## 2026-05-25 - External Redirect Loading States
**Learning:** Even when redirecting to an external URL (like Google OAuth), a loading state is critical. Without it, the delay between click and browser navigation makes the app feel unresponsive or broken.
**Action:** Always wrap external redirects (window.location.href) with a loading state, disabling the button to prevent double-clicks and reassure the user.

## 2026-06-03 - Custom Checkbox Card Accessibility
**Learning:** Wrapping a custom "card-like" checkbox in a `div` with an `onClick` handler creates an accessibility gap where screen readers see "clickable text" but don't understand it controls a checkbox.
**Action:** Use a `<label>` element as the card wrapper. Associate it with the checkbox input using `htmlFor` and a unique `id`. This gives the semantic "click label to toggle input" behavior natively, removing the need for manual `onClick` handlers and ensuring compatibility with assistive tech.

## 2026-06-15 - Tooltips in Modals
**Learning:** Tooltips inside Radix Dialogs (z-50) often get obscured if they don't have a higher z-index, even if using Portals, depending on stacking contexts.
**Action:** When adding Tooltips to elements inside a Dialog/Sheet, explicitly add `z-[60]` (or higher than the modal) to `TooltipContent` to ensure visibility.
