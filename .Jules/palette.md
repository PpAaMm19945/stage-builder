## 2024-05-22 - Global Feedback Patterns
**Learning:** The app relied on `window.alert()` for error handling and lacked a unified toast notification system. This disrupted the user flow and provided poor visual feedback.
**Action:** Implemented `sonner` for global toasts. Future components should strictly use `toast.success/error` instead of native alerts, and all async actions (like completion) must have visual loading states to prevent user confusion.
