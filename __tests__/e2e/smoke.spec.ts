import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/eCollabs/);
  });

  test("navigation to sign-in page works", async ({ page }) => {
    await page.goto("/");
    const signInLink = page.getByRole("link", { name: /sign in/i });
    if (await signInLink.isVisible().catch(() => false)) {
      await signInLink.click();
      await expect(page).toHaveURL(/sign-in/);
    }
  });
});
