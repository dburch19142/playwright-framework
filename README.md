# Playwright QA framework

TypeScript test framework built on `@playwright/test`: page objects, fixtures, a
one-time login with saved session, UI and API tests, and a GitHub Actions workflow.

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env
```

On Windows PowerShell, use `npm.cmd` / `npx.cmd` if script execution is blocked.

## Run

| Command | What it does |
| --- | --- |
| `npm test` | Run everything headless |
| `npm run test:ui` | Interactive UI mode with time-travel debugging |
| `npm run test:smoke` | Only tests tagged `@smoke` |
| `npm run test:headed` | Run with a visible browser |
| `npm run report` | Open the last HTML report |
| `npm run codegen -- http://localhost:3100` | Record locators by clicking |
| `npm run typecheck` | Type-check without running tests |

## Layout

```
playwright.config.ts   runner config, projects, demo-app web server
tests/auth.setup.ts    logs in once and saves the session to .auth/
tests/e2e/             UI specs
tests/api/             API specs
pages/                 page objects (locators + actions, no assertions)
fixtures/index.ts      custom `test` that injects page objects and test data
utils/                 env access, API client, data helpers
demo-app/              tiny sample app the example tests run against
```

## Pointing it at your own app

1. Set `BASE_URL`, `TEST_USER` and `TEST_PASS` in `.env`.
2. Replace the page objects in `pages/` and the specs in `tests/` with your own.
3. Delete `demo-app/` and the `webServer` block in `playwright.config.ts`.

## Adding a test

1. Add or extend a page object in `pages/`.
2. Register it in `fixtures/index.ts`.
3. Write the spec, importing `test` and `expect` from `fixtures`, not from
   `@playwright/test`.
