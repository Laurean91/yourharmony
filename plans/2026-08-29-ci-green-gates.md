# Plan: green CI gates for yourharmony

Research: `thoughts/research/2026-08-29-ci-green-gates.md`
Branch: `feature/ci-green-gates`

## Goal

`npm run lint` and `npm test` exit 0, so `continue-on-error` can be removed from
`.github/workflows/deploy.yml` and a broken test stops a production deploy.

## Acceptance criteria

1. `npx tsc --noEmit` — 0 errors (already true, must stay true).
2. `npm run lint` — 0 errors.
3. `npm test` — 86/86 passing.
4. `deploy.yml` runs lint and jest as blocking steps.
5. No product behaviour changes beyond the `react-hooks` fixes, each justified individually.

## Non-goals

- Fixing the 15 remaining warnings (unused vars) — separate cleanup.
- Adding new test coverage.
- Touching the `api/` FastAPI service.
- The `api.yourharmony-english.ru` DNS/nginx gap.

## Phases

### Phase 1 — eslint scope
Add `.claude/**` to `globalIgnores` in `eslint.config.mjs`.
Gate: error count drops 102 → 45.

### Phase 2 — test harness (14 failures)
- framer-motion mock: add `useReducedMotion`.
- `@/app/actions` mock: add the exports the dashboard awaits (`getLessons`, …).
- `File.arrayBuffer` polyfill in `jest.setup.js`.
Gate: Navbar, bigbos dashboard and actions suites green.

### Phase 3 — obsolete assertions (7 failures)
- login page: match the current `Добро пожаловать` heading, disambiguate the 2FA button.
- TeacherSection: assert against the `next/image` rewritten `src`.
- landing page: find why `landing-contacts` is missing at render; fix test or code once known.
Gate: those three suites green.

### Phase 4 — rewrite `src/auth.test.ts` (7 failures)
Mock `@/lib/prisma` and `bcryptjs`; cover valid login, wrong password, unknown user, and the
magic-token provider. Delete the env-var assertions that no longer describe the system.
Gate: auth suite green, 86/86 overall.

### Phase 5 — 45 lint errors
- `no-explicit-any` (23): real types where known, `unknown` + narrowing otherwise.
- `react/display-name` (6): name the components.
- `no-require-imports` (3): ESM imports, or a scoped override for `jest.config.js`.
- `no-html-link-for-pages` (1): `next/link`.
- `react-hooks/set-state-in-effect` (6) and `react-hooks/refs` (6): treat each as a behaviour
  change — read the surrounding logic, fix the cause, and note why the change is safe.
Gate: lint 0 errors, tests still 86/86.

### Phase 6 — flip the gates
Remove `continue-on-error` from both steps in `deploy.yml`. Do not deploy without an explicit
request from the user.

## Challenge log

**Does this solve the problem?** Criteria 1-4 map onto phases 1-6 directly.

**Most efficient?** Phase 1 removes 57% of the lint work by configuration alone. Phases 2-4 are
ordered so that shared harness fixes land before per-assertion edits, which avoids re-debugging
the same mock three times.

**Code for code's sake?** The 15 unused-variable warnings and any drive-by refactor are excluded.
The only product-code edits are the 12 `react-hooks` findings, which are on the critical path to
criterion 2 and are justified one by one.

## Risk

The `react-hooks` fixes touch live UI (`WeekSchedule` drag-and-drop, `LandingClient`). Production
is currently healthy; every phase is committed separately so a single phase can be reverted.
