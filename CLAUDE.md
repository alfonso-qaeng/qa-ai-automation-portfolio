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

## AI Story Analyzer Agent

`src/agents/story-analyzer.ts` is a shift-left QA tool that calls the Claude API to analyze user stories before development starts.

**Output format (JSON):**
```
gherkin.happy_path[]    — positive flow scenarios
gherkin.edge_cases[]    — boundary and corner cases  
gherkin.error_states[]  — failure and error scenarios
risks[]                 — security, UX, data, compliance risks with severity
missing_acceptance_criteria[]
ambiguities[]           — questions to raise with PO/BA
```

**Behavior without API key:** Prints a prompt for manual use in Claude Code and exits cleanly (code 0). Does not throw.

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
