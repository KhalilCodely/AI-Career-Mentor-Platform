# Project Architecture & Runtime Audit

Date: 2026-04-26 (UTC)

## Scope
- Reviewed repository structure, UI route modules, API route modules, data/auth layers, and build/lint runtime checks.
- Executed local commands to validate current project health.

## High-level Architecture

### Framework & Runtime
- Next.js App Router project (`next@16.2.3`) with React 19 and TypeScript.
- API surface implemented as Route Handlers under `src/app/api/**/route.ts`.
- Prisma used for persistence (`prisma/schema.prisma`, migrations, and `src/lib/prisma.ts`).
- JWT-based authentication/authorization helpers in `src/lib/auth.ts` and token utilities in `src/lib/auth-client.ts`.

### App Surface
- Public pages: `/`, `/login`, `/signup`, `/ai-chat`.
- Role dashboards:
  - Admin dashboard cluster under `/dashboard/*`.
  - User dashboard cluster under `/userboard/*`.
- Shared UI components under `src/app/components`.

### API Surface (Current)
- Auth: `/api/login`, `/api/signup`.
- Skills CRUD: `/api/skills`, `/api/skills/:id`.
- Career Path CRUD/enrollment/progress: `/api/career_path/*`.
- Protected test endpoints: `/api/protected/test/*`.
- AI chat endpoints: `/api/AI_chat`, `/api/AI_chat/:id`, `/api/AI_chat/history`.

## Updates Applied During Audit

To improve code health and remove blocking lint errors:
1. `src/app/api/protected/test/admin/route.ts`
   - Replaced `catch (error: any)` with `catch (error: unknown)` and safe error message normalization.
2. `src/app/userboard/layout.tsx`
   - Removed a synchronous state update inside `useEffect` that triggered `react-hooks/set-state-in-effect`.
3. `src/app/ai-chat/page.tsx`
   - Removed unused `MessageCircle` import.
4. `src/app/api/signup/route.ts`
   - Removed unused catch variable.

## Runtime Verification

### Lint
- `npm run lint`
- Result: **passes with warnings only** after fixes.
- Remaining warnings are non-blocking (`img` optimization/a11y).

### Build
- `npm run build`
- Result: **fails in this environment** because `next/font` cannot fetch Google Fonts (`Geist`, `Geist Mono`) from `fonts.googleapis.com`.
- This is an environment/network fetch issue, not a TypeScript/route compilation regression from audit changes.

## Recommended Next Steps
1. Make font loading resilient for restricted/offline builds (self-host fonts or add fallback/local strategy).
2. Replace raw `<img>` usage with `next/image` and add `alt` text where missing.
3. Add automated checks in CI for:
   - `npm run lint`
   - `npm run build`
4. Add integration tests for critical APIs (`/api/login`, `/api/signup`, `/api/career_path`, `/api/skills`).

