# QA AI Automation Portfolio — Claude Code Context

**Author:** Alfonso Hernández Ramírez — QA Engineer & AI Automation Specialist
**Purpose:** Professional portfolio demonstrating AI-augmented test automation with Playwright, TypeScript, and Claude AI.

---

## What This Project Is

This is a production-grade QA automation portfolio targeting two live applications:

- **saucedemo.com** — E2E tests using the Page Object Model
- **reqres.in** — REST API tests with schema validation

An AI-powered story analyzer (`src/agents/story-analyzer.ts`) uses the Claude API to perform shift-left QA analysis on user stories and generate Gherkin scenarios before development begins.

---

## Project Structure

```
src/
├── tests/
│   ├── global.setup.ts          # Runs once — saves auth state to .auth/user.json
│   ├── e2e/
│   │   ├── auth/login.spec.ts
│   │   ├── checkout/checkout.spec.ts
│   │   └── products/products.spec.ts
│   └── api/
│       └── users.spec.ts
├── pages/                       # Page Object Models — all selectors live here
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── ProductsPage.ts
│   ├── CartPage.ts
│   ├── CheckoutPage.ts
│   └── index.ts                 # Barrel export
└── agents/
    ├── story-analyzer.ts        # Main AI agent — calls Claude API
    └── analyze.ts               # CLI entry point wrapper
```

---

## Coding Rules — Enforce Strictly

### Page Object Model
- **Never put selectors inside test files.** If a selector is needed in a test, it belongs in a Page Object first.
- If no Page Object exists for a page, create one before writing the test.
- Page Objects live in `src/pages/` and follow the `FeaturePage.ts` naming convention.
- Export all Page Objects through `src/pages/index.ts`.

### Locators
- Prefer `data-test` attributes: `page.locator('[data-test="login-button"]')`
- Fall back to ARIA roles (`getByRole`, `getByLabel`) before CSS classes.
- Never use XPath or fragile CSS class selectors unless absolutely unavoidable.

### TypeScript
- Strict mode is enabled — **no `any` types** without an explicit justification comment.
- Use `async/await` throughout — never `.then()` chains.
- All new files must have proper type annotations.

### Tests
- Every test must have a descriptive name that states what it validates, not just what it does.
  - Good: `'should display error message when password is incorrect'`
  - Bad: `'login test'`
- Group related tests with `describe` blocks.
- Use `beforeEach` for navigation and shared setup.
- **Never use `page.waitForTimeout()`** — use `page.waitForSelector()`, `expect(locator).toBeVisible()`, or other Playwright-native waiters.

### Credentials & Secrets
- No hardcoded credentials anywhere. Use environment variables or `src/data/` files.
- E2E credentials (`standard_user` / `secret_sauce`) are handled in `global.setup.ts` only.

### API Tests
- Always validate response schema, not just status code.
- Use Playwright's `request` fixture — no extra HTTP libraries.

---

## Environment Variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `REQRES_API_KEY` | Yes (API tests) | — | Free key from reqres.in |
| `ANTHROPIC_API_KEY` | No | — | Enables automatic AI agent mode |
| `BASE_URL` | No | `https://www.saucedemo.com` | E2E target |
| `API_BASE_URL` | No | `https://reqres.in` | API test target |

---

## Commands

```bash
npm run test:e2e          # Run all E2E tests (Chromium, with saved auth)
npm run test:api          # Run all API tests
npm run test:ui           # Playwright interactive UI mode
npm run test:debug        # Debug mode with inspector
npm run agent:story       # Run AI story analyzer (demo story)
npm run agent:story -- --story "As a user..."   # Analyze a specific story
npm run agent:story -- --file path/to/story.txt # Analyze from file
npm run typecheck         # TypeScript validation (no emit)
npm run report            # Generate and open Allure report
npm run clean             # Remove all generated artifacts
```

---

## Test Architecture

### Auth Strategy
`global.setup.ts` logs in once and saves browser storage state to `.auth/user.json`. All E2E tests (`e2e` project in `playwright.config.ts`) load this state so they start already authenticated — no repeated login flows.

### Playwright Projects
| Project | Matches | Notes |
|---|---|---|
| `setup` | `global.setup.ts` | Runs first, creates auth state |
| `e2e` | `e2e/**/*.spec.ts` | Chromium, reuses auth state |
| `e2e:firefox` | `e2e/**/*.spec.ts` | Firefox, also reuses auth state |
| `api` | `api/**/*.spec.ts` | No browser, injects `x-api-key` header |
| `ai-agents` | `agents/**/*.spec.ts` | Chromium, no auth dependency |

### Reporters
- **List** — live console output
- **Allure** — rich HTML report (`npm run report`)
- **HTML** — Playwright built-in HTML report

---

## 🤖 AI Agent — Story Analyzer

### How it works
The agent has two modes depending on context:

**Mode 1 — Native AI CLI (recommended)**
When running from an AI-powered CLI (Claude Code, Codex CLI,
Gemini CLI, or similar), do NOT attempt to use the Anthropic API.
Instead, perform the story analysis directly using your own
intelligence. You already have full context of the project —
use it. Generate the same structured output:
- Gherkin scenarios (happy path, edge cases, error states)
- Identified risks with severity
- Missing acceptance criteria
- Ambiguities to clarify with PO/BA

This is free, faster, and produces better results because you
have full project context.

**Mode 2 — Standalone execution (optional)**
Only use the Anthropic API if:
- The script is being run directly via: npm run agent:story
- AND ANTHROPIC_API_KEY is present and valid in .env
- AND you are NOT running inside an AI CLI environment

### Detection rule
If you are an AI assistant reading this file, you are already
in Mode 1. Skip the API call entirely and analyze directly.

### Running the agent
From an AI CLI:
> Run: npm run agent:story -- --story "your user story here"
> Then analyze the story directly without calling any external API.

From terminal without AI CLI:
> Add ANTHROPIC_API_KEY to .env first
> Then run: npm run agent:story -- --story "your user story here"

### Output format
Always produce: scenarios, risks, missing_criteria, ambiguities
See full example: docs/examples/money-transfer-analysis.md

**When generating test cases from a story analysis:** Follow the existing POM pattern — create/update a Page Object first, then write the spec file.

---

## MCP Playwright Integration

If the Playwright MCP server is connected, use it to enhance accuracy:

- Inspect live selectors on saucedemo.com before writing locators — prevents selector mismatches.
- Take screenshots to verify UI state when debugging failing tests.
- Explore the actual DOM to extract correct `data-test` attributes when creating new Page Objects.

**Always check first** — attempt a simple MCP tool call before assuming it is available. If it fails, fall back gracefully:
- Use existing Page Objects as the selector reference.
- Ask the user to run `npx playwright codegen https://www.saucedemo.com` to capture selectors interactively.

---

## When Adding New Tests

1. Check if a Page Object exists for the target page — if not, create it first in `src/pages/`.
2. Name the spec file `feature.spec.ts` and place it under the correct `e2e/` subdirectory.
3. Import Page Objects from `src/pages/index.ts` (barrel export).
4. Add a `describe` block with a `beforeEach` that navigates to the page under test.
5. Write assertions using `expect()` from `@playwright/test`.

## When Fixing Failing Tests

1. Check whether the selector still exists using browser DevTools or MCP before editing code.
2. If saucedemo.com changed its DOM, update **only the Page Object** — never the test file.
3. Prefer `data-test` attributes. If unavailable, use ARIA roles.
4. Never duplicate selectors across multiple files.
5. Run `npm run typecheck` after every change.
