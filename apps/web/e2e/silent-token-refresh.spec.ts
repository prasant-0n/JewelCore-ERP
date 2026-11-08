import { test, expect } from "@playwright/test";

test.describe("Automatic Silent Token Refresh & Session Hardening (Step 2)", () => {
  test("intercepts 401 response, calls /auth/refresh silently, and transparently replays request", async ({
    page,
  }) => {
    // Navigate to login and authenticate
    await page.goto("/login");

    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    await emailInput.fill("rachel.r@jewelcore.internal");
    await passwordInput.fill("JewelCore@2026");

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    await page.waitForURL("**/", { timeout: 10000 });

    // Simulate an expired access token scenario
    const testResult = await page.evaluate(async () => {
      const api = (window as any).api;
      if (!api) return { error: "api not on window" };

      const oldToken = api.getToken();

      // Intercept fetch to mock a 401 on the first call to a test endpoint
      let firstCall = true;
      const originalFetch = window.fetch;
      let refreshCallCount = 0;

      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input.toString();

        if (url.includes("/inventory/items/test-item")) {
          if (firstCall) {
            firstCall = false;
            return new Response(
              JSON.stringify({
                title: "Unauthorized",
                status: 401,
                detail: "JWT Access Token Expired (15-min limit)",
              }),
              { status: 401, headers: { "Content-Type": "application/json" } },
            );
          }
          // On retry call:
          return new Response(
            JSON.stringify({
              data: { id: "test-item", name: "24K Diamond Ring", price: 150000 },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        if (url.includes("/auth/refresh")) {
          refreshCallCount++;
          return new Response(
            JSON.stringify({
              data: {
                accessToken: "renewed-access-token-9999",
                refreshToken: "renewed-refresh-token-8888",
              },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        return originalFetch(input, init);
      };

      try {
        // Execute request that gets initial 401
        const res = await api.get("/inventory/items/test-item");
        const newToken = api.getToken();

        return {
          success: true,
          data: res.data,
          refreshCallCount,
          oldToken,
          newToken,
        };
      } finally {
        window.fetch = originalFetch;
      }
    });

    expect(testResult.success).toBe(true);
    expect(testResult.data.name).toBe("24K Diamond Ring");
    expect(testResult.refreshCallCount).toBe(1);
    expect(testResult.newToken).toBe("renewed-access-token-9999");
  });

  test("coalesces concurrent 401 requests into a single refresh call via mutex queue", async ({
    page,
  }) => {
    await page.goto("/login");

    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    await emailInput.fill("rachel.r@jewelcore.internal");
    await passwordInput.fill("JewelCore@2026");

    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    await page.waitForURL("**/", { timeout: 10000 });

    const concurrentResult = await page.evaluate(async () => {
      const api = (window as any).api;
      if (!api) return { error: "api not on window" };

      let refreshCount = 0;
      let firstBatch = true;
      const originalFetch = window.fetch;

      window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input.toString();

        if (url.includes("/concurrent-test-")) {
          if (firstBatch) {
            return new Response(
              JSON.stringify({
                title: "Unauthorized",
                status: 401,
                detail: "Session Token Expired",
              }),
              { status: 401, headers: { "Content-Type": "application/json" } },
            );
          }
          return new Response(
            JSON.stringify({ data: { message: "Replayed successfully!" } }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        if (url.includes("/auth/refresh")) {
          refreshCount++;
          // Artificial network latency to test in-flight mutex queue
          await new Promise((resolve) => setTimeout(resolve, 50));
          firstBatch = false;
          return new Response(
            JSON.stringify({
              data: { accessToken: "coalesced-access-token-777" },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }

        return originalFetch(input, init);
      };

      try {
        // Fire 4 parallel requests concurrently while token is expired
        const [r1, r2, r3, r4] = await Promise.all([
          api.get("/concurrent-test-1"),
          api.get("/concurrent-test-2"),
          api.get("/concurrent-test-3"),
          api.get("/concurrent-test-4"),
        ]);

        return {
          allSucceeded:
            r1.data.message === "Replayed successfully!" &&
            r2.data.message === "Replayed successfully!" &&
            r3.data.message === "Replayed successfully!" &&
            r4.data.message === "Replayed successfully!",
          refreshCount,
          activeToken: api.getToken(),
        };
      } finally {
        window.fetch = originalFetch;
      }
    });

    expect(concurrentResult.allSucceeded).toBe(true);
    // Crucial: exactly 1 refresh call dispatched for all 4 parallel requests!
    expect(concurrentResult.refreshCount).toBe(1);
    expect(concurrentResult.activeToken).toBe("coalesced-access-token-777");
  });

  test("handles expired or revoked session gracefully with session_expired redirect", async ({
    page,
  }) => {
    await page.goto("/login?session_expired=true");

    // Verify error banner displays timeout notice
    await expect(
      page.locator(
        "text=Your workstation session timed out. Please authenticate with your corporate credentials to resume.",
      ),
    ).toBeVisible();
  });
});
