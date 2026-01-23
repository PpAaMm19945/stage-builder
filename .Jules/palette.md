## 2026-01-09 - UpNextCard Accessibility
**Learning:** Icon-only buttons with notification badges are a common accessibility trap. Users with screen readers often miss the notification count if it's not explicitly part of the accessible name or description.
**Action:** When adding badges to buttons, always ensure the count is included in the `aria-label` or provided via a screen-reader-only span that describes the count (e.g., "5 pending items"). Also, use Tooltips for mouse users instead of `title` attributes for better consistency and accessibility.

## 2026-01-20 - Error Handling Patterns
**Learning:** Using `alert()` interrupts the user flow and provides a poor experience, especially for recoverable errors like network failures.
**Action:** Replace `alert()` with inline error states or non-blocking toast notifications. This keeps the user in context and allows them to retry without dismissing a system modal.

## 2026-01-20 - Carousel Navigation Visibility
**Learning:** "Show on hover" controls (using `opacity-0 group-hover:opacity-100`) create "invisible focus traps" for keyboard users, who navigate to buttons they cannot see.
**Action:** Always add `focus:opacity-100` (or `focus-visible:opacity-100`) alongside hover states for absolute-positioned navigation controls to ensure they become visible when receiving keyboard focus.

## 2026-01-20 - Redundant Touch Targets
**Learning:** Invisible overlays used for convenient touch navigation (e.g., left/right screen taps) often duplicate explicit navigation buttons, causing screen readers to announce "Next Page" twice—once for the button and once for the overlay.
**Action:** Mark purely functional touch/click overlays with `aria-hidden="true"` and remove semantic roles/labels if accessible buttons already exist in the DOM for the same action.
