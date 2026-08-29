# Research: making the CI gates blocking

**Date:** 2026-08-29
**Task:** eliminate the eslint errors and jest failures that force `continue-on-error` on the deploy workflow.

## Starting numbers

`npm run lint` reported 102 errors / 36 warnings, `npm test` reported 28 failures out of 86.

## Finding 1 — half the lint errors are phantom

`eslint.config.mjs` ignores only `.next`, `out`, `build`, `next-env.d.ts`. It therefore lints
`.claude/worktrees/zen-hoover/**` and `.claude/worktrees/interesting-mclaren/**`, which are
scratch copies of the repository. Excluding `.claude/**` drops the real count to **45 errors /
15 warnings** without touching a line of product code.

Real errors by rule:

| Count | Rule |
|---|---|
| 23 | `@typescript-eslint/no-explicit-any` |
| 6 | `react/display-name` |
| 6 | `react-hooks/set-state-in-effect` |
| 6 | `react-hooks/refs` |
| 3 | `@typescript-eslint/no-require-imports` |
| 1 | `@next/next/no-html-link-for-pages` |

`react-hooks/set-state-in-effect` and `react-hooks/refs` are the only categories that describe
runtime behaviour rather than typing hygiene, so they carry the real regression risk.

## Finding 2 — the test failures have five distinct causes, not 28

| Suite | Failures | Root cause | Who is wrong |
|---|---|---|---|
| `src/auth.test.ts` | 7 | Suite tests an `ADMIN_USER`/`ADMIN_PASSWORD` env-var login. `src/auth.ts` now resolves users through Prisma with `bcrypt.compare`, magic-token login and `logAuthEvent` auditing. | test (obsolete by design change) |
| `src/components/Navbar.test.tsx` | 7 | `TypeError: (0, _framermotion.useReducedMotion) is not a function` — the framer-motion mock predates the component's use of that hook. | test harness |
| `src/app/bigbos/login/page.test.tsx` | 5 | Queries `Вход в панель`; the page's `h1` now reads `Добро пожаловать`, and a 2FA step added a second button, so bare `getByRole('button')` is ambiguous. | test (obsolete assertions) |
| `src/app/bigbos/page.test.tsx` | 5 | `TypeError: (0, _actions.getLessons) is not a function` — the `@/app/actions` mock lacks exports the dashboard now awaits. | test harness |
| `src/app/actions.test.ts` | 2 | `TypeError: file.arrayBuffer is not a function` — jsdom's `File` has no `arrayBuffer` in this environment. | test harness |
| `src/components/TeacherSection.test.tsx` | 1 | Asserts a raw `src`; the component renders `next/image`, which rewrites `src` to `/_next/image?url=…`. | test (obsolete assertion) |
| `src/app/page.test.tsx` | 1 | `landing-contacts` test id is absent at render time even though it exists in the source — needs inspection during the fix. | unknown |

No product bug is visible in any of these: production is serving traffic and `tsc --noEmit` is
clean. The failures are drift between tests and shipped code.

## Conclusion / recommendation

Fix in this order, cheapest and safest first:

1. Scope eslint away from `.claude/**` — removes 57 phantom errors, zero risk.
2. Repair the test harness (framer-motion mock, actions mock, `File.arrayBuffer` polyfill) —
   fixes 14 failures without touching assertions.
3. Update assertions that describe UI which has legitimately changed (login page, TeacherSection).
4. Rewrite `src/auth.test.ts` against the Prisma + bcrypt design it is supposed to guard.
5. Clear the 45 lint errors, treating the `react-hooks/*` ones as behaviour changes that need
   individual reasoning rather than a blanket edit.
6. Only then remove `continue-on-error` from `.github/workflows/deploy.yml`.

Alternatives considered: deleting the stale suites (fast, but drops real auth coverage — rejected)
and downgrading the offending rules to warnings (hides `react-hooks` findings that describe actual
cascading renders — rejected).
