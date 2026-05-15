# 🤖 QA AI Automation Portfolio

<div align="center">

![CI](https://github.com/alheram/qa-ai-automation-portfolio/actions/workflows/playwright.yml/badge.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-1.x-45ba4b?logo=playwright&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Tests](https://img.shields.io/badge/Tests-25%20passing-brightgreen)
![AI Powered](https://img.shields.io/badge/AI--Augmented-Claude%20%7C%20Codex-blueviolet?logo=anthropic)

**Production-grade test automation framework powered by AI agent orchestration.**  
Built by [Alfonso Hernández](https://linkedin.com/in/alheram) — QA Engineer & Test Automation Specialist.

[🌐 Portfolio Web](https://alheram.github.io) · [💼 LinkedIn](https://linkedin.com/in/alheram) · [📧 Contact](mailto:alheram1402@gmail.com)

</div>

---

## ✨ What Makes This Different

Most QA portfolios show you *can write tests*. This one shows you can **architect an intelligent quality system**.

| Capability | Standard QA Portfolio | This Project |
|---|---|---|
| E2E Test Automation | ✅ | ✅ |
| API Testing | ✅ | ✅ |
| CI/CD Integration | ✅ | ✅ |
| AI-Generated Test Cases | ❌ | ✅ |
| Pre-dev Story Analysis | ❌ | ✅ |
| Autonomous QA Agents | ❌ | ✅ |

---

## 🏗️ Project Structure

```
qa-ai-automation-portfolio/
│
├── 📁 tests/
│   ├── 📁 e2e/                    # End-to-end Playwright tests
│   │   ├── auth/                  # Login, logout, session flows
│   │   ├── checkout/              # E-commerce critical paths
│   │   └── ui/                    # Visual & UX validation
│   │
│   └── 📁 api/                    # API testing with Playwright
│       ├── users.spec.ts          # CRUD operations
│       ├── auth.spec.ts           # Token & auth endpoints
│       └── schema/                # JSON Schema validators
│
├── 📁 ai-agents/                  # 🤖 AI-powered QA automation
│   ├── story-analyzer.ts          # Analyzes user stories → generates test cases
│   ├── test-generator.ts          # Produces Gherkin scenarios from requirements
│   └── bug-reporter.ts            # AI-enhanced defect documentation
│
├── 📁 pages/                      # Page Object Model (POM)
│   ├── LoginPage.ts
│   ├── ProductsPage.ts
│   └── CheckoutPage.ts
│
├── 📁 reports/                    # Allure & HTML test reports
├── 📁 docs/                       # Architecture decisions & guides
│   └── AI_AGENTS.md               # How the AI agents work
│
├── playwright.config.ts           # Multi-browser, multi-env config
├── .github/workflows/playwright.yml  # CI/CD pipeline
└── package.json
```

---

## 🤖 AI Agent: Story Analyzer

The most unique part of this project. An autonomous agent that **reads a user story and generates test cases before development begins** — implementing true Shift-Left testing.

```bash
# Run the AI agent on any user story
npx ts-node ai-agents/story-analyzer.ts --story "User can add products to cart and checkout"
```

**Output example:**

```gherkin
Feature: Shopping Cart Checkout

  Scenario: Successful checkout with valid product
    Given the user is logged in as a standard user
    When they add "Sauce Labs Backpack" to the cart
    And they proceed to checkout
    And they fill in valid shipping information
    Then the order should be confirmed
    And the cart should be empty

  Scenario: Checkout blocked with empty cart
    Given the user is logged in
    When they navigate directly to checkout with an empty cart
    Then they should see an error message
    And the checkout should not proceed

  Scenario: Price totals are calculated correctly
    Given the user has 2 items in the cart
    When they view the checkout summary
    Then the subtotal should match the sum of individual prices
    And tax should be applied correctly
```

> 💡 This mirrors exactly how I work at my current company — AI agents analyze user stories and catch logical gaps *before a single line of code is written*, reducing late-stage bug costs significantly.

---

## 🧪 Test Suite Overview

### E2E Tests — [saucedemo.com](https://saucedemo.com)

| Test Suite | Cases | Coverage |
|---|---|---|
| Authentication | 5 | Login, logout, locked user, invalid credentials |
| Product Catalog | 4 | Listing, sorting, filtering, details |
| Shopping Cart | 4 | Add, remove, persist, quantity |
| Checkout Flow | 5 | Happy path, validation, price calc, confirmation |
| UI/UX | 3 | Responsive layout, error states, navigation |

### API Tests — [reqres.in](https://reqres.in)

| Endpoint | Method | Tests |
|---|---|---|
| `/api/users` | GET | Pagination, schema validation |
| `/api/users/:id` | GET | Existing user, 404 handling |
| `/api/users` | POST | Create user, required fields |
| `/api/users/:id` | PUT | Update validation |
| `/api/login` | POST | Auth success, invalid credentials |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/alheram/qa-ai-automation-portfolio.git
cd qa-ai-automation-portfolio

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run API tests only
npm run test:api

# Run with UI mode (interactive)
npm run test:ui

# Run specific suite
npx playwright test tests/e2e/checkout

# Generate Allure report
npm run report
```

### AI Agent Setup

```bash
# Add your API key to .env
echo "ANTHROPIC_API_KEY=your_key_here" > .env

# Run the story analyzer
npm run agent:analyze -- --story "your user story here"
```

---

## ⚙️ Tech Stack

| Tool | Purpose |
|---|---|
| [Playwright](https://playwright.dev) | E2E & API test automation |
| [TypeScript](https://typescriptlang.org) | Type-safe test code |
| [Allure Report](https://allurereport.org) | Beautiful test reporting |
| [GitHub Actions](https://github.com/features/actions) | CI/CD pipeline |
| [Claude API](https://anthropic.com) | AI test case generation |
| [Page Object Model](https://playwright.dev/docs/pom) | Maintainable test architecture |

---

## 📊 CI/CD Pipeline

Every push triggers:

```
Push → Lint → Type Check → E2E Tests (Chromium) → E2E Tests (Firefox) → API Tests → Allure Report
```

Tests run in parallel across browsers. Reports are published automatically to GitHub Pages on every main branch push.

---

## 🧠 Architecture Decisions

### Why Page Object Model?
Separates test logic from page interactions. When the UI changes, only the page object needs updating — not every test.

### Why AI-Augmented Testing?
Manual test case generation is slow and prone to missing edge cases. AI agents can analyze requirements and generate comprehensive coverage in seconds, allowing QA to focus on exploration and critical thinking.

### Why Playwright over Cypress?
- Native TypeScript support
- Multi-browser testing (Chromium, Firefox, WebKit)
- Built-in API testing capabilities
- Better performance for large suites
- No iFrame restrictions

---

## 👨‍💻 About the Author

**Alfonso Hernández Ramírez** — QA Engineer & Test Automation Specialist

- 4+ years of experience across SaaS, Fintech, Crypto, and E-Commerce
- Founded and scaled QA departments from zero
- Pioneer in AI-augmented testing workflows
- ISTQB Certified

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?logo=linkedin)](https://linkedin.com/in/alheram)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-000000?logo=github)](https://alheram.github.io)
[![Email](https://img.shields.io/badge/Email-Contact-EA4335?logo=gmail)](mailto:alheram1402@gmail.com)

---

<div align="center">
  <sub>Built with ☕ and an obsession for quality · Mexico City, MX · Open to remote opportunities</sub>
</div>
