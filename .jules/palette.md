## 2026-01-09 - Semantic Clickable Cards
**Learning:** React Router's `Link` component is a powerful replacement for `div` with `onClick` for navigation cards. It provides automatic accessibility (anchor tag semantics), keyboard support, and handles route transitions correctly. However, care must be taken to ensure inner elements are not interactive to avoid nesting interactive controls.
**Action:** When seeing `onClick={() => navigate(...)}` on a container, always refactor to `<Link>` or wrap in a button if it's an action, not a navigation.
