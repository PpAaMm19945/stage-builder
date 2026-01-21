# FamilyPath Governance Rules

> This document defines the code organization rules for this project. All agents and contributors must follow these rules.

## Folder Structure

```
src/
├── domains/                    # Feature domains (isolated by learning stage)
│   ├── early-years/           # Early Years (Ages 2-5) - ACTIVE
│   │   ├── components/        # Domain-specific components
│   │   ├── pages/             # Domain pages
│   │   ├── hooks/             # Domain hooks
│   │   ├── data/              # Domain seed data
│   │   └── types.ts           # Domain-specific types
│   │
│   ├── lower-primary/         # Lower Primary (Grades 1-5) - LOCKED
│   ├── middle-school/         # Middle School (Grades 6-8) - LOCKED
│   └── upper-school/          # Upper School (Grades 9-12) - LOCKED
│
├── shared/                     # Cross-domain shared code
│   ├── components/            # Reusable UI components (shadcn, etc.)
│   ├── layouts/               # App layouts (MainLayout, PublicLayout)
│   ├── contexts/              # Global contexts (AuthContext)
│   ├── hooks/                 # Shared hooks
│   ├── types/                 # Shared type definitions
│   └── utils/                 # Utility functions
│
├── config/                     # App configuration
├── pages/                      # Top-level pages (Login, Settings, NotFound)
└── App.tsx                     # Main app entry
```

## Domain Boundaries

### Import Rules

| From | Can Import From |
|------|-----------------|
| `domains/early-years/*` | `@shared/*`, `@config/*` |
| `domains/lower-primary/*` | `@shared/*`, `@config/*` |
| `domains/middle-school/*` | `@shared/*`, `@config/*` |
| `domains/upper-school/*` | `@shared/*`, `@config/*` |
| `shared/*` | `@shared/*`, `@config/*` |
| `pages/*` | `@shared/*`, `@config/*`, `@domains/*` |
| `App.tsx` | Any |

### Forbidden Imports

- ❌ **No cross-domain imports**: `domains/early-years` cannot import from `domains/lower-primary`
- ❌ **No upward imports**: `shared/` cannot import from `domains/`
- ❌ **No deep imports**: Always use path aliases, never `../../..`

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Pages | PascalCase | `ActivityViewer.tsx` |
| Components | PascalCase | `ObservationModal.tsx` |
| Hooks | camelCase with `use` prefix | `useActivityProgress.ts` |
| Contexts | PascalCase with `Context` suffix | `AuthContext.tsx` |
| Types | PascalCase | `EarlyYearsDomain` |
| Utils | camelCase | `formatDate.ts` |
| Data files | camelCase | `activities.ts` |

## File Placement Rules

### When to use `domains/<domain>/`
- Component is specific to one learning stage
- Page is only accessible within that domain
- Hook manages domain-specific state
- Types are only used within that domain

### When to use `shared/`
- Component is used by multiple domains
- Hook is used by multiple domains
- Type is used across the app (User, Student)
- Utility function is generic

### When to use `pages/`
- Top-level pages not specific to any domain
- Login, Settings, NotFound, etc.

## Path Aliases

Use these TypeScript path aliases for clean imports:

```typescript
// ✅ Correct - use aliases
import { Button } from "@shared/components/ui/button";
import { useAuth } from "@shared/contexts/AuthContext";
import { Activity } from "@domains/early-years/types";

// ❌ Wrong - relative imports
import { Button } from "../../../shared/components/ui/button";
```

## Agent Workflow

1. **Before making changes**: Check this governance file
2. **Create files in correct location**: Follow folder structure
3. **Use correct imports**: Follow import rules
4. **Log changes**: Update PATCH_LOG.md with your changes

## Validation

The TypeScript compiler and ESLint will enforce:
- Path alias usage
- Import boundaries (with eslint-plugin-boundaries)
- Naming conventions

---

*Last updated: 2024-12-23 by Lovable*
