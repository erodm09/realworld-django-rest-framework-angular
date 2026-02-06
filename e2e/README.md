#UI Automation Tests

UI automated tests for the RealWorld Django REST Framework Angular application using **Playwright** with **TypeScript**.

## Test Coverage

### Core User Journeys
1. **Sign-up & Login** (`01-signup-login.spec.ts`)
   - Register a new user
   - Log in successfully
   - Attempt login with wrong password → expect error
2. **Write Article** (`02-write-article.spec.ts`)
   - Logged-in user creates an article (title, body, tags)
   - Article appears in "My Articles" list
3. **Follow Feed** (`03-follow-feed.spec.ts`)
   - User A follows User B
   - User B publishes a new article
   - Article shows up in User A's "My Feed"

### Additional Coverage (picking 2 of 4)
4. **Edit / Delete Article** (`04-edit-delete-article.spec.ts`)
   - Author can update body & tags, changes are visible
   - Author can delete the article, it disappears from all lists
5. **Tag Filter** (`05-tag-filter.spec.ts`)
   - Click a tag in the sidebar
   - Only articles containing that tag are listed

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** v18 or higher — [download here](https://nodejs.org/). This also installs `npm` (Node Package Manager), which is used to install dependencies and run scripts.
- **Docker** and **Docker Compose** — [download here](https://www.docker.com/get-started). Used to run the target application locally.

## Step-by-Step Setup & Run

### Step 1: Start the target application

Clone the RealWorld app repository and start all services with Docker:

```bash
git clone https://github.com/NemTam/realworld-django-rest-framework-angular
cd realworld-django-rest-framework-angular
docker-compose up -d
```

Wait until all containers are running. You can check with:

```bash
docker-compose ps
```

Verify the app is accessible by opening `http://localhost:4200` in a browser. You should see the Conduit home page.

### Step 2: Install test dependencies

Open a new terminal and navigate to the test directory:

```bash
cd e2e
```

Install the Node.js packages (Playwright, TypeScript, YAML parser):

```bash
npm install
```

Install the Chromium browser that Playwright uses to run tests:

```bash
npx playwright install chromium
```

**On Linux only** — also install OS-level browser dependencies (fonts, libraries):

```bash
npx playwright install-deps chromium
```

### Step 3: Run the tests

```bash
npm test
```

This runs all 8 tests headlessly (no browser window). You should see output like:

```
Running 8 tests using 1 worker

  8 passed (34.2s)
```

If all 8 pass, you're done.

### Step 4: Configure (optional)

All test parameters are externalized in `config.yaml`. Edit this file if your environment differs from the defaults:

```yaml
application:
  frontendUrl: "http://localhost:4200"   # Angular UI address
  backendUrl: "http://localhost:8000"    # Django REST API address

accounts:
  userA:
    username: "testuser_a"
    email: "testuser_a@example.com"
    password: "TestPassword123!"
  userB:
    username: "testuser_b"
    email: "testuser_b@example.com"
    password: "TestPassword123!"
  wrongPassword: "WrongPassword999!"

testData:
  article:
    description: "Test description"
    body: "This is a test article body with some content."
    tags: ["test", "automation", "playwright"]
  updatedArticle:
    body: "This is an updated test article body."
    tags: ["updated"]
  filterTag: "test"

timeouts:
  navigation: 30000
  element: 10000
  api: 5000
```

> **Note:** Tests create unique users dynamically (timestamped), so you do **not** need to pre-create accounts. The `accounts` section defines passwords and naming templates used during test runs.

#### Environment variable overrides

Every key config value can be overridden via environment variables 

```bash
FRONTEND_URL=http://staging.example.com:4200 \
BACKEND_URL=http://staging.example.com:8000 \
USER_A_PASSWORD=CiSecretPass123! \
npm test
```

| Env variable | Overrides |
|---|---|
| `FRONTEND_URL` | `application.frontendUrl` |
| `BACKEND_URL` | `application.backendUrl` |
| `USER_A_USERNAME` | `accounts.userA.username` |
| `USER_A_EMAIL` | `accounts.userA.email` |
| `USER_A_PASSWORD` | `accounts.userA.password` |
| `USER_B_USERNAME` | `accounts.userB.username` |
| `USER_B_EMAIL` | `accounts.userB.email` |
| `USER_B_PASSWORD` | `accounts.userB.password` |
| `WRONG_PASSWORD` | `accounts.wrongPassword` |
| `TIMEOUT_NAVIGATION` | `timeouts.navigation` |
| `TIMEOUT_ELEMENT` | `timeouts.element` |
| `TIMEOUT_API` | `timeouts.api` |

If an env variable is not set, the value from `config.yaml` is used as the default.

## Other Ways to Run Tests

```bash
# Run with a visible browser window (useful for watching what the tests do)
npm run test:headed

# Run in Playwright's interactive UI mode
npm run test:ui

# Debug step-by-step with inspector
npm run test:debug

# Run a single test file
npx playwright test tests/01-signup-login.spec.ts

# Open the HTML test report after a run
npm run test:report
```

## Project Structure

```
e2e/
├── config.yaml              # Test configuration (URLs, credentials, test data)
├── playwright.config.ts     # Playwright settings
├── tsconfig.json            # TypeScript config
├── package.json             # Dependencies and scripts
├── Dockerfile               # Containerized test runner (Playwright on Linux)
├── docker-compose.test.yml  # Docker Compose for running tests in a container
├── tests/                   # Test specs
│   ├── 01-signup-login.spec.ts
│   ├── 02-write-article.spec.ts
│   ├── 03-follow-feed.spec.ts
│   ├── 04-edit-delete-article.spec.ts
│   └── 05-tag-filter.spec.ts
└── utils/                   # Shared helpers
    ├── config.ts            # YAML config loader with env var overrides
    ├── fixtures.ts          # Custom Playwright fixtures (authenticatedPage, userInfo)
    ├── api.ts               # Direct REST API calls (register, login, article CRUD, follow)
    ├── auth.ts              # UI-based register / login / logout
    └── helpers.ts           # UI-based article creation, navigation
```

## Architecture: API for Setup, UI for Testing

This test suite follows the principle: use the backend API for test setup and the browser UI only for the journey under test.

| Layer | Purpose | File |
|---|---|---|
| **Custom fixtures** | Provide `authenticatedPage` and `userInfo` — auto-creates a fresh user via API and injects the token | `utils/fixtures.ts` |
| **API setup** | Register users, create articles, follow users | `utils/api.ts` |
| **UI testing** | Only the specific user journey being validated | `utils/auth.ts`, `utils/helpers.ts` |

### Custom Fixtures

Tests that need an authenticated user import from `utils/fixtures.ts` instead of `@playwright/test`:

```typescript
import { test, expect } from '../utils/fixtures';

test('Create article', async ({ authenticatedPage, userInfo }) => {
  // authenticatedPage: browser already logged in as a fresh unique user
  // userInfo: { username, email, password, token } for API calls
});
```

Tests that test authentication itself (signup, login) use the standard `@playwright/test` import.

## Run via Docker (Linux headless)

To run the tests inside a Linux container (no local Node.js needed):

```bash
cd e2e
docker compose -f docker-compose.test.yml run --rm playwright
```

This uses the official Playwright Docker image (`mcr.microsoft.com/playwright:v1.58.1-noble`) with Chromium pre-installed. The container uses `network_mode: host` to access the app on `localhost`. Test results and HTML reports are mounted back to your local machine.

> **Note:** Requires Docker Desktop 4.29+ on macOS for `network_mode: host` support.

## Headless / Linux / CI

Tests run headless by default — no display server needed. Works on any CI runner:

```bash
npm test
```

The Playwright config sets `headless: true` and a fixed `1280×720` viewport for deterministic screenshots.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Cannot connect to Docker daemon` | Start Docker Desktop / daemon |
| Timeout on `playwright install` | Check DNS / firewall — allow `cdn.playwright.dev` |
| Tests timeout immediately | Verify app is running at the configured `frontendUrl` |
| API calls fail | Verify backend is running at the configured `backendUrl` |
| Browser crashes on Linux | Run `npx playwright install-deps chromium` |