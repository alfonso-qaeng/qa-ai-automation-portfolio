# GitHub Copilot Instructions — QA AI Automation Portfolio

**Author:** Alfonso Hernández Ramírez — QA Engineer & AI Automation Specialist
**Stack:** Playwright · TypeScript · Node.js ≥18 · Allure · Claude AI

---

## Architecture at a Glance

- E2E tests target **saucedemo.com** using the **Page Object Model**.
- API tests target **reqres.in** using Playwright's built-in request context.
- Auth is handled **once** in `global.setup.ts` and reused via `.auth/user.json`.
- An AI agent in `src/agents/story-analyzer.ts` calls the Claude API to analyze user stories.

### Key Directories

| Path | Purpose |
|---|---|
| `src/tests/e2e/` | E2E specs — `auth/`, `checkout/`, `products/` |
| `src/tests/api/` | API specs — `users.spec.ts` |
| `src/pages/` | All Page Object Models; import via `src/pages/index.ts` |
| `src/agents/` | AI story analyzer agent |
| `.github/workflows/` | CI/CD pipelines |

---

## Completion Rules — Apply to Every Suggestion

### Page Object Model (non-negotiable)
- **Selectors belong in Page Objects, never in spec files.**
- When completing a test file, use methods from the relevant `*Page` class.
- When a selector is needed that no Page Object method covers, suggest adding the method to the Page Object first.
- All Page Objects are exported from `src/pages/index.ts` — import from there.

### Locators
```typescript
// Preferred
page.locator('[data-test="login-button"]')
page.getByRole('button', { name: 'Add to Cart' })
page.getByLabel('Username')

// Avoid
page.locator('.btn-primary')         // fragile class selector
page.locator('//button[@id="btn"]')  // XPath
```

### TypeScript
```typescript
// Required: explicit types, async/await
async addToCart(productName: string): Promise<void> {
  await this.page.locator(`[data-test="add-to-cart-${productName}"]`).click();
}

// Forbidden: any types, .then() chains
const data: any = ...          // no
element.click().then(() => {}) // no
```

### Waits
```typescript
// Correct: Playwright's auto-waiting and explicit waitFor
await expect(this.page.locator('[data-test="checkout-complete"]')).toBeVisible();
await this.page.waitForSelector('[data-test="inventory-list"]');

// Forbidden: arbitrary timeouts
await page.waitForTimeout(2000); // never
```

### Test Naming
```typescript
// Good — describes the expected behavior
test('should display error when password is incorrect', async ({ page }) => {

// Bad — describes an action, not a behavior
test('login test', async ({ page }) => {
```

### No Hardcoded Secrets
```typescript
// Correct
const apiKey = process.env.REQRES_API_KEY ?? '';

// Forbidden
const apiKey = 'abc123secretkey';
```

---

## Page Object Template

When creating a new Page Object, follow this pattern:

```typescript
import { Page, Locator } from '@playwright/test';

export class FeaturePage {
  private readonly submitButton: Locator;
  private readonly errorMessage: Locator;

  constructor(private readonly page: Page) {
    this.submitButton = page.locator('[data-test="submit-button"]');
    this.errorMessage = page.locator('[data-test="error-message"]');
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return this.errorMessage.innerText();
  }
}
```

Export it from `src/pages/index.ts`:
```typescript
export { FeaturePage } from './FeaturePage';
```

---

## Spec File Template

```typescript
import { test, expect } from '@playwright/test';
import { FeaturePage } from '../../pages';

test.describe('Feature Name', () => {
  let featurePage: FeaturePage;

  test.beforeEach(async ({ page }) => {
    featurePage = new FeaturePage(page);
    await page.goto('/feature-path');
  });

  test('should [expected behavior] when [condition]', async ({ page }) => {
    await featurePage.doAction();
    await expect(page.locator('[data-test="result"]')).toBeVisible();
  });
});
```

---

## API Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Users API', () => {
  test('should return user data with correct schema', async ({ request }) => {
    const response = await request.get('/api/users/1');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('data');
    expect(body.data).toMatchObject({
      id: expect.any(Number),
      email: expect.any(String),
      first_name: expect.any(String),
    });
  });
});
```

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

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `REQRES_API_KEY` | Required for API tests |
| `ANTHROPIC_API_KEY` | Optional — enables automatic AI agent |
| `BASE_URL` | Defaults to `https://www.saucedemo.com` |
| `API_BASE_URL` | Defaults to `https://reqres.in` |

---

## Commands Reference

```bash
npm run test:e2e          # E2E tests (Chromium)
npm run test:api          # API tests
npm run test:ui           # Playwright UI mode
npm run agent:story       # AI story analyzer (demo)
npm run agent:story -- --story "story text"
npm run typecheck         # TypeScript validation
npm run report            # Allure HTML report
```

---

## Do Not Suggest

- `page.waitForTimeout()` — use Playwright's built-in waiters
- `.then()` chains — use `async/await`
- Selectors inside `*.spec.ts` files — they belong in Page Objects
- `any` types — add proper TypeScript types
- Hardcoded credentials or API keys
- Installing additional HTTP libraries — use Playwright's `request` fixture
