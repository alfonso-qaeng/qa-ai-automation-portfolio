<div align="center">

# QA AI Automation Portfolio

[![CI](https://github.com/alfonso-qaeng/qa-ai-automation-portfolio/actions/workflows/playwright.yml/badge.svg)](https://github.com/alfonso-qaeng/qa-ai-automation-portfolio/actions/workflows/playwright.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.48-45ba4b?logo=playwright&logoColor=white)](https://playwright.dev)
[![AI Powered](https://img.shields.io/badge/AI--Augmented-Claude%20Sonnet-blueviolet?logo=anthropic)](https://anthropic.com)
[![Tests](https://img.shields.io/badge/Tests-23%20passing-brightgreen)](#-test-suite)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Production-grade test automation with AI-driven Shift-Left quality analysis.**

Built by [Alfonso Hernández Ramírez](https://linkedin.com/in/alheram) — QA Engineer & AI Test Automation Specialist

[Live Allure Report](https://alfonso-qaeng.github.io/qa-ai-automation-portfolio) · [LinkedIn](https://linkedin.com/in/alheram) · [alheram1402@gmail.com](mailto:alheram1402@gmail.com)

</div>

---

## What makes this different

Most QA portfolios demonstrate that you *can write tests*. This one shows how to **build an intelligent quality system** — one that catches defects before the first line of application code is written.

| Capability | Standard QA Portfolio | This Project |
|---|:---:|:---:|
| E2E test automation | ✅ | ✅ |
| API testing with schema validation | ✅ | ✅ |
| CI/CD with parallel matrix | Sometimes | ✅ |
| Page Object Model (strict TypeScript) | Sometimes | ✅ |
| Auth state reuse across test suite | ❌ | ✅ |
| Pre-dev story analysis (Shift-Left) | ❌ | ✅ |
| AI-generated Gherkin + risk register | ❌ | ✅ |
| Allure report deployed to GitHub Pages | ❌ | ✅ |
| Typed response schema assertions | ❌ | ✅ |

---

## Project structure

```
qa-ai-automation-portfolio/
│
├── .github/
│   └── workflows/
│       └── playwright.yml          # Matrix CI: chromium / firefox / api in parallel
│
├── src/
│   ├── agents/
│   │   ├── story-analyzer.ts       # AI agent: user story → Gherkin + risks (pre-dev)
│   │   └── analyze.ts              # AI agent: post-run failure triage
│   │
│   ├── data/
│   │   ├── users.ts                # SauceDemo user fixtures (typed const)
│   │   └── reqres.ts               # TypeScript interfaces for reqres.in responses
│   │
│   ├── fixtures/
│   │   └── index.ts                # test.extend — injects POMs into test signatures
│   │
│   ├── pages/                      # Page Object Model layer
│   │   ├── LoginPage.ts            # Login form, error assertions
│   │   ├── ProductsPage.ts         # Inventory list, sort, cart badge
│   │   ├── CartPage.ts             # Cart items, remove, proceed
│   │   └── CheckoutPage.ts         # Shipping form, order overview, confirmation
│   │
│   ├── tests/
│   │   ├── global.setup.ts         # Logs in once → saves .auth/user.json
│   │   ├── e2e/
│   │   │   ├── auth/
│   │   │   │   └── login.spec.ts   # 5 auth tests
│   │   │   ├── products/
│   │   │   │   └── products.spec.ts # 4 inventory tests
│   │   │   └── checkout/
│   │   │       └── checkout.spec.ts # 5 checkout tests
│   │   └── api/
│   │       └── users.spec.ts       # 9 API tests (reqres.in)
│   │
│   └── utils/
│       ├── api.ts                  # Typed GET/POST helpers for APIRequestContext
│       └── schema.ts               # assertSchema / assertUserSchema / assertIsoDate
│
├── .env.example                    # Required env vars with descriptions
├── playwright.config.ts            # Multi-project config (e2e / api / ai-agents)
└── tsconfig.json                   # Strict mode + @pages @fixtures @utils @data aliases
```

---

## AI Agent: Story Analyzer

The standout piece. An autonomous agent that reads a user story and produces a **complete test specification before development begins** — implementing Shift-Left quality at its most practical.

The agent calls `claude-sonnet-4-20250514` with a system prompt tuned for senior QA thinking: exhaustive scenario generation, security-first risk analysis, and ruthless AC gap detection.

The agent runs in two modes depending on whether `ANTHROPIC_API_KEY` is configured.

### Claude Code mode — free, no API key needed

Run without an API key and the agent prints a ready-to-paste prompt for Claude Code:

```bash
npm run agent:story
# or with your own story:
npm run agent:story -- --story "As a user, I want to reset my password via email"
```

Output:

```
🤖  AI Agent Mode: Claude Code
──────────────────────────────────────────────────────────────
No ANTHROPIC_API_KEY detected. To analyze this story, open
Claude Code and run the following prompt:

──────────────────────────────────────────────────────────────
Analyze this user story and generate Playwright test cases
following the existing POM structure in /pages and /tests:

As a registered user, I want to reset my password via email…
──────────────────────────────────────────────────────────────

Alternatively, add ANTHROPIC_API_KEY to your .env to run
the agent automatically with npm run agent:story
```

### Automatic mode — requires Anthropic API key

Set `ANTHROPIC_API_KEY` in `.env` and the agent calls Claude directly,
displays the full formatted analysis in the terminal, and saves a JSON
report to `reports/ai-analysis/`.

```bash
# Built-in demo story (password reset) — works out of the box
npm run agent:story

# Analyze an inline story
npm run agent:story -- --story "As a registered user, I want to reset my password via email"

# Load from a file
npm run agent:story -- --file stories/payment-flow.txt
```

### Sample terminal output

```
════════════════════════════════════════════════════════════════
  🤖  QA AI Story Analyzer — Shift-Left Analysis
════════════════════════════════════════════════════════════════
Story:  As a registered user, I want to reset my password via email…
Model:  claude-sonnet-4-20250514   ·   Duration: 3241ms

✅  Happy Path  (2 scenarios)
────────────────────────────────────────────────────────────────

  Scenario 1: Successfully resets password with a valid email address
    Given  a registered user who has forgotten their password
    When   they submit their registered email address on the reset page
    Then   a password reset email is sent within 60 seconds
    And    the email contains a single-use reset link
    And    the user can set a new password using that link
    And    the new password meets the system's complexity requirements

  Scenario 2: Logs in with the new password after a successful reset
    Given  a user who has completed the password reset flow
    When   they attempt to log in with their new password
    Then   they are authenticated and redirected to the dashboard
    And    the old password is no longer accepted

⚠️   Edge Cases  (4 scenarios)
────────────────────────────────────────────────────────────────

  Scenario 1: Reset link expires after the defined TTL
    Given  a user who requested a password reset 25 hours ago
    When   they click the reset link from the email
    Then   they see a clear "link expired" message
    And    they are offered the option to request a new link

  Scenario 2: Submitting the same reset link a second time
    Given  a user who has already used their reset link once
    When   they attempt to use the same link again
    Then   the link is rejected as already consumed
    And    no password change occurs

❌  Error States  (3 scenarios)
────────────────────────────────────────────────────────────────

  Scenario 1: Submitting an email address not in the system
    Given  an anonymous visitor on the reset page
    When   they submit an email address that has no account
    Then   the system returns a generic success message
    And    no email is sent (prevents user enumeration)

🔥  Identified Risks  (5 total)
────────────────────────────────────────────────────────────────

  [CRITICAL]  Security
    Reset link must be single-use and cryptographically random. Predictable
    tokens allow account takeover via brute-force or link guessing.

  [HIGH]  Security
    Generic response for unknown emails prevents user enumeration. Confirming
    "email not found" leaks registered user data.

  [HIGH]  Data
    No TTL defined in the story. Indefinitely valid reset links are a
    standing account-takeover vulnerability.

  [MEDIUM]  UX
    No mention of rate limiting on reset requests. Absence allows spam abuse
    and could expose the email-sending infrastructure to cost attacks.

📋  Missing Acceptance Criteria  (4 items)
────────────────────────────────────────────────────────────────

  1. Reset link TTL: how long is the link valid? (common: 1 hour, 24 hours)
  2. Password complexity rules for the new password
  3. Should the user be automatically logged in after reset, or redirected to login?
  4. Behaviour when the user is already logged in and visits the reset URL

❓  Ambiguities to Clarify with PO/BA  (3 questions)
────────────────────────────────────────────────────────────────

  1. Is there a maximum number of reset emails that can be sent per account per hour?
  2. Should active sessions be invalidated when the password changes?
  3. Is the reset flow the same for SSO / social login users?

════════════════════════════════════════════════════════════════

💾  Report saved → reports/ai-analysis/story-analysis-2026-05-15T07-30-00.json
```

The full analysis is saved as structured JSON in `reports/ai-analysis/` — ready to be imported into Jira, Confluence, or any test management tool.

### Real output example from a fintech user story:

```gherkin
Scenario: Successful transfer between accounts
  Given the user is logged in to the financial platform
  And the user has an account balance of $5,000.00
  When the user enters a valid destination account number "1234567890"
  And the user enters an amount of "$500.00"
  And the user clicks "Confirm Transfer"
  Then the transfer executes successfully
  And the user sees a confirmation receipt with a unique transaction ID
  And the user's balance is updated to "$4,500.00" immediately

Scenario: Transfer with exact minimum amount
  Given the user navigates to the Transfer Money page
  When the user enters a valid destination account number
  And the user enters an amount of "$1.00"
  And the user clicks "Confirm Transfer"
  Then the transfer executes successfully
  And the user receives a confirmation receipt

Scenario: Transfer amount below minimum
  When the user enters an amount of "$0.99"
  Then the form displays an error "Minimum transfer amount is $1.00"
  And the Confirm button is disabled

Scenario: Transfer blocked due to insufficient funds
  Given the user's balance is $200.00
  When the user attempts to transfer "$300.00"
  Then the transfer is blocked
  And the user sees "Insufficient funds. Available balance: $200.00"

Scenario: Network failure during transfer execution
  Given the user confirms a valid transfer
  When a network error occurs during processing
  Then the user sees "Transfer could not be completed. Please try again."
  And no partial deduction occurs (atomicity guaranteed)
```

→ [See full analysis (21 scenarios, 15 risks)](docs/examples/money-transfer-analysis.md)

> This analysis was generated in seconds before any code was written.
> It identified 3 critical security risks the original story missed,
> including a race condition vulnerability and missing AML compliance requirements.

---

## Test suite

### E2E — [saucedemo.com](https://www.saucedemo.com)

Auth state is saved once by `global.setup.ts` and reused by all E2E tests via Playwright's `storageState`. Login overhead: **one request per CI run**, not one per test.

| Suite | Tests | Scenarios |
|---|:---:|---|
| **Authentication** | 5 | Valid login → inventory redirect · locked_out_user error · wrong password error · empty credentials · empty password |
| **Products** | 4 | 6 items displayed · sort A→Z correct order · sort price low→high · add 3 items updates badge to 3 |
| **Checkout** | 5 | Full happy path to confirmation · empty cart navigation · missing shipping fields validation · item removal empties cart · `itemTotal + tax = total` price assertion |
| **Total** | **14** | |

### API — [reqres.in](https://reqres.in)

Every test validates the HTTP status code **and** the response schema. Schema helpers (`assertSchema`, `assertUserSchema`, `assertIsoDate`) are reusable across specs.

| Endpoint | Method | Tests | Key Assertions |
|---|---|:---:|---|
| `/api/users` | GET | 1 | 200 · pagination envelope · schema on every user in list |
| `/api/users/:id` | GET | 2 | 200 + correct id · 404 + empty body for id 9999 |
| `/api/users` | POST | 1 | 201 · `id` (string) · `createdAt` is a valid ISO date |
| `/api/users/:id` | PUT | 1 | 200 · `updatedAt` is a valid ISO date |
| `/api/users/:id` | DELETE | 1 | 204 · response body is empty string |
| `/api/login` | POST | 2 | 200 + non-empty `token` · 400 + `error` when password missing |
| `/api/register` | POST | 1 | 400 + `error` when fields missing |
| **Total** | | **9** | |

---

## Getting started

### Prerequisites

- **Node.js 20+** — `node --version`
- **ANTHROPIC_API_KEY** — only required for AI agent scripts

### Installation

```bash
git clone https://github.com/alfonso-qaeng/qa-ai-automation-portfolio.git
cd qa-ai-automation-portfolio

npm ci
npx playwright install chromium firefox
```

### Running tests

```bash
npm test                  # all Playwright projects
npm run test:e2e          # E2E on Chromium (uses saved auth state)
npm run test:api          # API tests — no browser required
npm run test:ui           # Interactive Playwright UI mode
npm run test:debug        # Step-through debug mode
npm run typecheck         # tsc --noEmit — zero errors expected
npm run report            # Generate + open Allure HTML report
```

### AI agent setup

```bash
# 1. Configure your environment
cp .env.example .env
#    Set ANTHROPIC_API_KEY in .env

# 2. Run the story analyzer (demo story — no args needed)
npm run agent:story

# 3. Analyze your own story
npm run agent:story -- --story "As a customer, I want to save items to a wishlist"

# 4. Or load from a file
npm run agent:story -- --file path/to/story.txt

# 5. Triage failed test runs with AI
npm run agent:analyze
```

---

## Tech stack

| Tool | Version | Role |
|---|---|---|
| [Playwright](https://playwright.dev) | 1.48 | E2E browser automation + API testing |
| [TypeScript](https://typescriptlang.org) | 5.6 | Strict-mode type safety across all test code |
| [@anthropic-ai/sdk](https://github.com/anthropic-ai/anthropic-sdk-typescript) | 0.30 | Claude API client for AI agents |
| [allure-playwright](https://allurereport.org) | 3.x | Rich test reporting with steps and attachments |
| [ts-node](https://typestrong.org/ts-node) | 10.9 | Direct TypeScript execution for agent scripts |
| [tsconfig-paths](https://github.com/dividab/tsconfig-paths) | 4.2 | Resolves `@pages`, `@utils`, `@data` aliases at runtime |
| [GitHub Actions](https://github.com/features/actions) | — | CI/CD: matrix execution + Pages deployment |

---

## CI/CD pipeline

Every push to `main` or `develop`, every pull request to `main`, and a daily scheduled run at **08:00 UTC** trigger the following:

```
┌─────────────────────────────────────────────────────────────────┐
│                          test (matrix)                          │
│                                                                 │
│  ┌──────────────────┐  ┌───────────────────┐  ┌─────────────┐  │
│  │  e2e / chromium  │  │  e2e / firefox    │  │     api     │  │
│  │  global.setup    │  │  global.setup     │  │  (no auth)  │  │
│  │  14 E2E tests    │  │  14 E2E tests     │  │  9 API tests│  │
│  └────────┬─────────┘  └─────────┬─────────┘  └──────┬──────┘  │
│           │  fail-fast: false — all legs complete      │         │
└───────────┼───────────────────────────────────────────┼─────────┘
            │          (on failure only)                 │
            └──► upload: screenshots + videos + HTML ◄──┘
                          (allure-results always)

┌─────────────────────────────────────────────────────────────────┐
│           allure-report  (main branch only, after test)         │
│                                                                 │
│  merge allure-results-* → generate HTML → deploy → gh-pages    │
└─────────────────────────────────────────────────────────────────┘
```

- **`fail-fast: false`** — all three legs run to completion even if one fails, giving a full picture of suite health
- **Browser-scoped installs** — each leg installs only the binary it needs; the API leg skips browser installation entirely
- **Artifact retention** — Allure results: 30 days · failure artifacts: 7 days
- **Concurrency control** — in-progress runs are cancelled on feature branches to save CI minutes; main always runs to completion to preserve Allure history

---

## Architecture decisions

### Page Object Model with strict TypeScript

Every locator is declared as a typed `readonly Locator` on the class, resolved in the constructor, and never re-queried inside methods. Methods express *intent* — `cartPage.proceedToCheckout()` — not DOM structure. When selectors change, a single file changes, not every test that touches the page.

All POMs use `[data-test="..."]` attributes exclusively. These are semantically meaningful, resistant to styling and layout refactors, and follow the Playwright team's own recommendation.

Fixtures inject POMs directly into test function signatures:

```ts
test('adds item to cart', async ({ productsPage, cartPage }) => { ... })
```

No setup boilerplate in tests. No `new LoginPage(page)` scattered across files.

### AI at the requirements stage, not just after failures

Running AI on failed test results is useful. Running AI *before a single line of code is written* is transformative.

The story analyzer generates a full Gherkin specification, a severity-ranked risk register, and a list of missing acceptance criteria from a plain-English user story in under 5 seconds. A story that takes a QA Engineer 45 minutes to break down manually is covered exhaustively in one command. More importantly, it surfaces the questions nobody thought to ask — before the sprint starts and the decisions are locked in.

This is Shift-Left testing at its most practical: defect prevention, not defect detection.

### Playwright over Cypress

| Concern | Playwright | Cypress |
|---|---|---|
| TypeScript | First-class, no config | Community plugin |
| Multi-browser CI | Chromium, Firefox, WebKit native | Paid plan or workarounds |
| API testing | Built-in `APIRequestContext` | Separate tool required |
| Parallel execution | Worker-based, built-in | Requires Cypress Cloud |
| iFrame support | Full | Restricted |
| Auth state reuse | `storageState` built-in | Manual cookie handling |
| Performance at scale | Faster (out-of-process) | Slower (in-browser runner) |

The decisive factor for this project: a single Playwright config handles E2E browser tests, API tests, and AI agent tests in a unified matrix — no second tool, no second CI job config, no context switching.

---

<div align="center">

## Alfonso Hernández Ramírez

**QA Engineer & AI Test Automation Specialist**

4+ years building quality systems across SaaS, Fintech, Crypto, and E-Commerce · Mexico City, MX

[![LinkedIn](https://img.shields.io/badge/LinkedIn-alheram-0A66C2?logo=linkedin&logoColor=white)](https://linkedin.com/in/alheram)
[![GitHub](https://img.shields.io/badge/GitHub-alheram-181717?logo=github&logoColor=white)](https://github.com/alheram)
[![Email](https://img.shields.io/badge/Email-alheram1402@gmail.com-EA4335?logo=gmail&logoColor=white)](mailto:alheram1402@gmail.com)

---

*Open to remote opportunities · Built with TypeScript, Playwright, and Claude*

</div>
