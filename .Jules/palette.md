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

## 2026-06-25 - Sidebar Focus Consistency
**Learning:** Custom interactive elements within the `Sidebar` (like logos or user profile buttons) often lack the specific `focus-visible` styles provided by `SidebarMenuButton`, leading to inconsistent keyboard navigation feedback.
**Action:** When adding custom buttons to the sidebar, explicitly apply `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring` to match the design system's sidebar tokens.

## 2026-07-10 - List Item Keyboard Accessibility
**Learning:** `div` elements with `onClick` handlers are invisible to keyboard users, breaking the experience for anyone tabbing through a list of actions.
**Action:** Add `role="button"`, `tabIndex={0}`, and `onKeyDown` (for Enter/Space) to interactive list rows. Also ensure `focus-visible` styles are applied so users know where they are.

## 2026-08-15 - Chat Accessibility & Live Regions
**Learning:** Dynamic content updates (like AI thinking states) need `role="status"` and `aria-live="polite"` to be announced by screen readers. Without this, users are left waiting in silence.
**Action:** Always wrap loading/thinking indicators in a live region to ensure status changes are communicated.

## 2026-01-22 - Shadcn Card Interactivity
**Learning:** The `Card` component is semantically a `div`. When used as a clickable list item (like in ActivityBrowser), it requires manual addition of `role="button"`, `tabIndex={0}`, and `onKeyDown` to be accessible.
**Action:** Always treat clickable Cards as custom buttons and apply the "List Item Keyboard Accessibility" pattern (2026-07-10).

## 2026-09-12 - External Link Indicators
**Learning:** Emojis are often read inconsistently by screen readers and look unprofessional. External links (like PDF exports) need explicit visual and programmatic indicators to prevent user surprise when a new tab opens.
**Action:** Replace emoji icons with semantic SVG icons (like `lucide-react`) and always include an `ExternalLink` icon + `sr-only` text "(opens in a new tab)" for buttons that trigger `window.open` or `_blank` links.

## 2026-10-01 - Interactive Error States
**Learning:** Using generic `div` elements with `onClick` for retry actions (like "Tap to retry" on failed images) isolates keyboard and screen reader users, as these elements are not focusable or announced as interactive.
**Action:** Replace interactive error containers with semantic `<button type="button">` elements. Ensure they have clear `aria-label`s (e.g., "Retry loading page X") and visual focus indicators (`focus-visible`) to support all navigation methods.

## 2026-05-18 - Audio Player Accessibility
**Learning:** Media players often have multiple icon-only controls (play, pause, skip) that are critical for usage but often lack accessible names.
**Action:** Ensure every control in a custom media player has a clear `aria-label`, especially state-dependent ones like Play/Pause (switching labels) and Mute/Unmute.

## 2026-06-28 - Design System consistency
**Learning:** Found raw HTML inputs used in modals despite a robust accessible component library being available. This creates inconsistent keyboard behavior and visual styles.
**Action:** When auditing forms, search for `<input` tags to find deviations from the design system, especially for checkboxes and radio buttons which have complex accessibility requirements handled by the library.

## 2026-10-25 - Keyboard Shortcut Discoverability
**Learning:** Keyboard shortcuts (like arrow keys for navigation or Esc for closing) are often implemented but remain invisible to users, leading to underutilization.
**Action:** Explicitly expose keyboard shortcuts in Tooltips (e.g., "Next Page (→)") and ARIA labels. This reinforces the shortcuts naturally as users interact with the UI.
