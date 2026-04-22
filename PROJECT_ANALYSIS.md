# Project Analysis (April 22, 2026)

## Executive Summary

This repository is a **Vite + React + TypeScript** single-page application for automotive shop operations. The codebase appears to be in a transition state: a modernized `src/modules/*` structure exists, but orchestration and state management are still heavily centralized in a very large `src/App.tsx`.

## What is working well

- Clear domain segmentation under `src/modules/` (bookings, intake, quality control, release, parts, backjobs, users, roles, dashboard, history).
- Shared helper and type modules (`src/modules/shared/helpers.ts`, `src/modules/shared/types.ts`) reduce duplication for common logic.
- Production build works successfully and outputs a distributable bundle.

## Main architecture findings

### 1) Over-centralized app orchestration

- `src/App.tsx` is approximately **16,466 lines**, containing:
  - Core application state
  - localStorage persistence keys
  - authentication/session logic
  - role/permission logic
  - page rendering switch logic
  - cross-module callback wiring
- This creates a high coupling point and makes future changes risky.

### 2) Two competing app architectures exist

- `src/modules/*` pages are used directly by `App.tsx` via a switch on `currentView`.
- A separate context/provider architecture exists under `src/store/*` (`AppProviders`, `useWork`, `useNavigation`, etc.), but this appears only partially integrated.
- There is also a `src/components/*` tree with older-style pages/components, suggesting incomplete migration.

### 3) Persistence strategy is local-only

- State persistence is primarily localStorage-based (`STORAGE_KEYS` in `App.tsx` and helper storage functions in other modules).
- This is suitable for prototypes/demo environments but limits:
  - cross-device consistency
  - multi-user collaboration
  - auditability and rollback

### 4) Type model drift risk

- There are at least two major type domains (`src/types/index.ts` and `src/modules/shared/types.ts`).
- This can cause duplicated concepts, naming inconsistencies, and accidental divergence.

## Quality & tooling findings

### 1) Lint health is currently poor

- `npm run lint` currently reports a large volume of issues (primarily unused variables and react-refresh export constraints).
- This level of lint noise can mask real defects and slows down maintenance.

### 2) Build health is acceptable with notable warning

- `npm run build` passes.
- Vite warns about a large JS chunk (~786 kB minified), indicating limited code-splitting.

## Prioritized recommendations

### Priority 0: Stabilize CI signal

1. Reduce lint debt enough to make lint actionable (even if full cleanup is phased).
2. Introduce a short-term lint baseline strategy (or scoped suppressions with owner/date) to avoid perpetual red status.

### Priority 1: Break down `App.tsx`

1. Extract feature orchestration into a lightweight app shell + per-domain controllers/hooks.
2. Move localStorage and session persistence into dedicated service modules.
3. Isolate permission and navigation resolution into separate policy modules.

### Priority 2: Converge on one state architecture

1. Decide whether `src/store/*` contexts are the long-term approach.
2. If yes, route `App.tsx` through `AppProviders` and migrate page-by-page.
3. Remove or archive unused legacy paths to reduce confusion.

### Priority 3: Improve runtime scalability

1. Add route-level and/or feature-level code splitting.
2. Lazy-load heavy modules to improve startup and reduce initial bundle size.

### Priority 4: Consolidate type system

1. Define canonical source(s) of truth for domain entities.
2. Deprecate duplicate types with migration notes.

## Suggested next sprint plan (practical)

1. Extract navigation + permission logic from `App.tsx` into dedicated files.
2. Introduce `React.lazy`/dynamic imports for large module pages.
3. Resolve top 100 lint errors by class (unused imports/vars first).
4. Write a short `ARCHITECTURE.md` documenting target state and migration map.

## Commands used for this analysis

- `rg --files | head -n 200`
- `sed -n '1,220p' README.md`
- `cat package.json`
- `sed -n '1,240p' src/App.tsx`
- `wc -l src/App.tsx src/modules/shared/types.ts src/modules/shared/helpers.ts src/data/mockData.ts README.md`
- `sed -n '1,220p' src/main.tsx`
- `sed -n '1,220p' src/store/AppProviders.tsx`
- `sed -n '1,220p' src/store/navigation.tsx`
- `npm ci`
- `npm run lint`
- `npm run build`
- `sed -n '1,260p' src/store/workContext.tsx`
- `sed -n '1,220p' src/modules/shared/helpers.ts`
- `sed -n '1,220p' src/types/index.ts`
- `find src -maxdepth 2 -type d | sort`
- `rg "AppProviders|useWork\(|useNavigation\(" src -n`
- `rg "currentView|activeView|setCurrent|switch \(|case \"" src/App.tsx -n | head -n 80`
- `sed -n '760,860p' src/App.tsx`
- `sed -n '14700,14920p' src/App.tsx`
