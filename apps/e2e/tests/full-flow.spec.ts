import { test, expect } from "@playwright/test";
import { db } from "../lib/db";

const TEST_USER = {
  name: "E2E Tester",
  email: `e2e_${Date.now()}@steadystack.dev`,
  password: "Password123!",
};

const MONITOR = {
  name: "E2E Critical Monitor",
  url: "https://example.com",
};

/**
 * Critical lifecycle: signup → dashboard → create monitor → verify listing →
 * delete via the row dropdown + confirmation dialog.
 *
 * Selectors are pinned to the real UI:
 *  - Signup form (components/sign-up-form.tsx): labels "Name", "Email",
 *    "Password"; submit button "Sign Up"; success toast + redirect to /dashboard.
 *  - Monitor form (components/monitors/monitor-form.tsx): inputs named
 *    "name" and "url" (labels "Friendly Name" / "Target URL / Domain");
 *    submit "Create Monitor".
 *  - Monitor list (components/monitors/monitor-list.tsx): row dropdown
 *    (MoreHorizontal icon) → "Delete" menu item → dialog "Decommission
 *    Target" → confirm button "Confirm Destruction".
 */
test.describe("E2E Critical Flow", () => {
  test.afterAll(async () => {
    try {
      const user = await db.user.findUnique({
        where: { email: TEST_USER.email },
      });
      if (user) {
        await db.user.delete({ where: { id: user.id } });
      }
    } catch (e) {
      console.log("Cleanup failed (non-critical):", e);
    }
  });

  test("Complete Lifecycle: SignUp -> Create -> Verify -> Delete", async ({ page }) => {
    await test.step("Sign Up", async () => {
      await page.goto("/signup");

      // Labels are wired via htmlFor → id (field.name), so getByLabel works.
      await page.getByLabel("Name", { exact: true }).fill(TEST_USER.name);
      await page.getByLabel("Email", { exact: true }).fill(TEST_USER.email);
      await page.getByLabel("Password", { exact: true }).fill(TEST_USER.password);

      await page.getByRole("button", { name: "Sign Up" }).click();

      // Success: redirect to /dashboard (see sign-up-form onSuccess).
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
      // Dashboard stats render client-side ("Active Monitors" stat card).
      await expect(page.getByText("Active Monitors")).toBeVisible({ timeout: 20_000 });
    });

    await test.step("Create Monitor", async () => {
      await page.goto("/dashboard/monitors/new");

      // The monitor type defaults to HTTP — no interaction needed.
      // Form fields are plain inputs with name attributes; the labels are
      // not wired with htmlFor, so target the inputs by name.
      await page
        .locator('input[name="name"]')
        .fill(MONITOR.name);
      await page.locator('input[name="url"]').fill(MONITOR.url);

      await page.getByRole("button", { name: "Create Monitor" }).click();

      // Success returns to the monitors list.
      await expect(page).toHaveURL(/\/dashboard\/monitors(\/|$)/, { timeout: 20_000 });
    });

    await test.step("Verify Listing", async () => {
      await page.goto("/dashboard/monitors");
      await expect(page.getByText(MONITOR.name).first()).toBeVisible({ timeout: 15_000 });
    });

    await test.step("Delete Monitor", async () => {
      // Open the row's dropdown menu (trigger is the MoreHorizontal icon
      // button inside the monitor's row). Scope by the row containing the
      // monitor's name to avoid matching other rows.
      const row = page.locator("tr", { hasText: MONITOR.name });
      await row.locator("button").last().click();

      await page.getByRole("menuitem", { name: "Delete" }).click();

      // Confirmation dialog: "Decommission Target" with "Confirm Destruction".
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText(MONITOR.name)).toBeVisible();
      await dialog.getByRole("button", { name: "Confirm Destruction" }).click();

      // Row disappears from the list.
      await expect(
        page.locator("tr", { hasText: MONITOR.name }),
      ).toHaveCount(0, { timeout: 15_000 });
    });
  });
});
