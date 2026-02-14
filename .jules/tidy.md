# Tidy's Journal

## 2024-05-22 - [Project Initialization] **Constraint:** [No Journal] **Solution:** [Created Journal]
Initialized Tidy's journal to track critical learnings.

## 2024-05-22 - [React Query Mutation Deps] **Constraint:** [exhaustive-deps warning on mutation object] **Solution:** [Destructure mutate and pass variables as arguments]
When `useMutation` relies on component state in its closure, it triggers `exhaustive-deps` warnings in `useEffect`.
**Solution:**
1. Destructure `mutate` (e.g., `const { mutate: save } = useMutation(...)`).
2. Update `mutationFn` to accept arguments (e.g., `({ current, total })`) instead of using closure variables.
3. Pass current state when calling `save({ current, total })`.
4. Add `save` to the dependency array (it is stable).
