# AGENTS.md — QA AI Automation Portfolio

## Project Identity

| Field | Value |
|---|---|
| Name | QA AI Automation Portfolio |
| Author | Alfonso Hernández Ramírez — QA Engineer & AI Automation Specialist |
| Purpose | Professional portfolio demonstrating AI-augmented test automation |
| Stack | Playwright · TypeScript · Node.js ≥18 · Allure · Claude AI |
| Targets | saucedemo.com (E2E) · reqres.in (API) |

---

## Repository Layout

```
/
├── src/
│   ├── tests/
│   │   ├── global.setup.ts          # One-time auth setup; saves state to .auth/user.json
│   │   ├── e2e/
│   │   │   ├── auth/login.spec.ts
│   │   │   ├── checkout/checkout.spec.ts
│   │   │   └── products/products.spec.ts
│   │   └── api/
│   │       └── users.spec.ts
│   ├── pages/                        # All Page Object Models
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   ├── ProductsPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutPage.ts
│   │   └── index.ts                  # Barrel export — import from here
│   └── agents/
│       ├── story-analyzer.ts         # AI agent — calls Claude API
│       └── analyze.ts                # CLI entry point
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── .github/
    └── workflows/                    # GitHub Actions CI/CD
```

---

## Mandatory Coding Conventions

### Architecture
- **Page Object Model is required.** Selectors must never appear inside test (`*.spec.ts`) files.
- Each page under test must have a corresponding `*Page.ts` in `src/pages/`.
- All Page Objects must be exported through `src/pages/index.ts`.

### Locator Priority (highest to lowest)
1. `data-test` attribute: `page.locator('[data-test="checkout-button"]')`
2. ARIA role / label: `page.getByRole('button', { name: 'Checkout' })`
3. ARIA label: `page.getByLabel('Username')`
4. *(Avoid)* CSS class or tag selectors

### TypeScript Rules
- `strict: true` is set in `tsconfig.json` — no implicit `any`
- Use `async/await`; `.then()` chains are forbidden
- Every function parameter and return value must be typed

### Test Design Rules
- Test names must describe the expected behavior: `'should block login with incorrect password'`
- Related tests must be grouped in `describe()` blocks
- Shared navigation must be in `beforeEach()`
- `page.waitForTimeout()` is **forbidden** — use Playwright's built-in auto-waiting or explicit `waitFor` methods
- No hardcoded credentials — use environment variables or `src/data/` fixtures

### API Test Rules
- Validate response body schema, not only HTTP status code
- Use Playwright's built-in `request` context — no third-party HTTP libraries
- Every API test must assert at minimum: status code, response body structure, and at least one field value

---

## Environment Variables

```
REQRES_API_KEY       Required for API tests. Obtain free at reqres.in.
ANTHROPIC_API_KEY    Optional. Enables automatic Claude AI agent mode.
BASE_URL             Optional. Defaults to https://www.saucedemo.com
API_BASE_URL         Optional. Defaults to https://reqres.in
```

Load from `.env` (dotenv is configured in `playwright.config.ts` and the agent scripts).

---

## Available Commands

```bash
# Test execution
npm run test:e2e              # E2E suite — Chromium, reuses saved auth state
npm run test:api              # API suite — no browser
npm run test:ui               # Playwright interactive UI
npm run test:debug            # Debug mode with step-through inspector

# AI agent
npm run agent:story                             # Demo story analysis
npm run agent:story -- --story "story text"     # Analyze inline story
npm run agent:story -- --file path/to/file.txt  # Analyze from file

# Quality
npm run typecheck             # TypeScript type check (no emit)
npm run lint                  # ESLint

# Reports
npm run report                # Generate + open Allure HTML report
npm run clean                 # Remove all build/test artifacts
```

---

## Playwright Configuration Summary

Defined in `playwright.config.ts`:

| Project name | Test glob | Browser | Auth state |
|---|---|---|---|
| `setup` | `**/global.setup.ts` | n/a | Creates `.auth/user.json` |
| `e2e` | `**/e2e/**/*.spec.ts` | Chromium | Loads `.auth/user.json` |
| `e2e:firefox` | `**/e2e/**/*.spec.ts` | Firefox | Loads `.auth/user.json` |
| `api` | `**/api/**/*.spec.ts` | n/a (request only) | None |
| `ai-agents` | `**/agents/**/*.spec.ts` | Chromium | None |

Global settings: `timeout: 30s`, `expect.timeout: 5s`, `retries: 2` on CI.

---

## AI Story Analyzer

**Entry point:** `src/agents/story-analyzer.ts`
**Run via:** `npm run agent:story`

The agent sends a user story to the Claude API and returns a structured JSON analysis:

```typescript
{
  gherkin: {
    happy_path:   GherkinScenario[],   // successful flows
    edge_cases:   GherkinScenario[],   // boundaries, concurrent actions
    error_states: GherkinScenario[],   // failures, invalid inputs
  },
  risks: Risk[],                        // severity: low | medium | high | critical
  missing_acceptance_criteria: string[],
  ambiguities: string[],
}
```

**Fallback behavior:** When `ANTHROPIC_API_KEY` is absent, the agent prints manual instructions and exits with code 0 — it does not crash.

**When converting story analysis output into Playwright tests:** create or update the relevant Page Object in `src/pages/` before writing the spec.

---

## Workflow for New Tests

```
1. Identify the page under test
2. Check src/pages/ for an existing Page Object
   └─ If absent → create FeaturePage.ts, export from index.ts
3. Create src/tests/e2e/<feature>/<feature>.spec.ts
4. Import Page Objects from 'src/pages'
5. Add describe > beforeEach > test structure
6. Run npm run typecheck before committing
```

## Workflow for Fixing Failing Tests

```
1. Identify the failing selector
2. Verify it in browser DevTools or via MCP Playwright tools
3. If the DOM changed → update the Page Object ONLY
4. Never update selectors in the spec file directly
5. Run npm run typecheck after the fix
```

---

## MCP Playwright Integration

If a Playwright MCP server is available in the agent's tool environment:

- Use MCP browser tools to inspect live `data-test` attributes on saucedemo.com before writing any locator.
- Use MCP screenshots to confirm UI state during debugging.
- Use MCP navigation to validate that Page Objects reflect the current DOM.

If MCP is unavailable, fall back to existing Page Objects as the selector reference, or instruct the user to run `npx playwright codegen https://www.saucedemo.com`.

**Do not assume MCP is available.** Probe with a lightweight call first; proceed without it if it fails.
