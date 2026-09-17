import { defineConfig, devices } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from apps/web/.env
dotenv.config({ path: path.resolve(__dirname, "../../apps/web/.env") });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  ...(process.env.CI ? { workers: 1 } : {}),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://127.0.0.1:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  expect: {
    /* Generous default for server-rendered pages behind a cold Next.js dev/prod server. */
    timeout: 15_000,
  },

  /* CI: start the production web server (built by the workflow) with a local
     Postgres instance. `production` mode runs `next start` after `next build`. */
  ...(process.env.CI
    ? {
        webServer: {
          command: "bun run dev",
          cwd: path.resolve(__dirname, "../../apps/web"),
          url: "http://127.0.0.1:3000",
          reuseExistingServer: false,
          timeout: 180_000,
        },
      }
    : {}),

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
