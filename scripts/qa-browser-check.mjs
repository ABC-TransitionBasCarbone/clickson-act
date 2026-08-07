import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];
  const ok = (name, pass, detail = "") => {
    results.push({ name, pass, detail });
    console.log(`${pass ? "PASS" : "FAIL"}: ${name}${detail ? " — " + detail : ""}`);
  };

  try {
    await page.goto("http://localhost:3000/en?auth=login", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForSelector("input[name='email']", { timeout: 15000 });
    await page.waitForTimeout(800);
    await page.locator("input[name='email']").first().fill("admin@test.com");
    await page.locator("input[name='password']").first().fill("1234512345");
    await page.locator("dialog[open] form button[type='submit']").click({ force: true });

    await page.waitForFunction(
      () => !!sessionStorage.getItem("auth_token"),
      null,
      { timeout: 20000 },
    );
    ok("Login stores auth token", true);

    await page.waitForURL(/dashboard/, { timeout: 15000 }).catch(() => {});
    if (!page.url().includes("dashboard")) {
      await page.goto("http://localhost:3000/en/dashboard", {
        waitUntil: "domcontentloaded",
      });
    }
    await page.waitForTimeout(2500);
    ok("Dashboard loads", page.url().includes("dashboard"), page.url());

    // Find project link
    await page.waitForSelector('a[href*="/dashboard/projects/"]', { timeout: 20000 });
    const href = await page.locator('a[href*="/dashboard/projects/"]').first().getAttribute("href");
    ok("Project link found", !!href, href || "");
    await page.goto(`http://localhost:3000${href}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3500);
    ok("Project page opens", page.url().includes("/dashboard/projects/"), page.url());

    const body = await page.locator("body").innerText();
    ok("Current Actions visible", /current actions/i.test(body), body.slice(0, 200));

    // Add action
    const addBtn = page.locator(".card").filter({ hasText: /current actions/i }).locator("button").first();
    if (await addBtn.count()) {
      await addBtn.click();
      await page.waitForTimeout(1000);
      const open = await page.locator("#custom_action").evaluate((el) => /** @type {HTMLDialogElement} */ (el).open).catch(() => false);
      ok("Add Action modal opens", open);

      if (open) {
        ok("Status help visible", (await page.getByText("Add to the bank of actions").count()) > 0);
        ok("Type label", (await page.locator("label").filter({ hasText: /^Type$/ }).count()) > 0);
        ok("Monitoring Indicators", (await page.getByText(/Monitoring Indicators/i).count()) > 0);
        ok("Performance Indicators", (await page.getByText(/Performance Indicators/i).count()) > 0);

        const cat = page.locator("#category");
        if ((await cat.locator("option").count()) > 1) await cat.selectOption({ index: 1 });
        await page.locator("#title").fill("QA Action " + Date.now());
        await page.locator("#description").fill("QA description");
        const effort = page.locator("#effort");
        if ((await effort.locator("option").count()) > 1) await effort.selectOption({ index: 1 });
        await page.locator("#reduction").fill("12");
        await page.waitForTimeout(300);
        ok(
          "Required hint gone when filled",
          (await page.getByText(/Please complete:/i).count()) === 0 ||
            !(await page.getByText(/Please complete:/i).isVisible()),
        );

        await page.locator("#custom_action").getByRole("button", { name: /^Add Action$/i }).click();
        await page.waitForTimeout(3000);
        const closed = !(await page.locator("#custom_action").evaluate((el) => /** @type {HTMLDialogElement} */ (el).open).catch(() => false));
        ok("Create action succeeds", closed);

        // reopen
        await addBtn.click();
        await page.waitForTimeout(800);
        ok(
          "Add modal reopens",
          await page.locator("#custom_action").evaluate((el) => /** @type {HTMLDialogElement} */ (el).open).catch(() => false),
        );
        await page.locator("#custom_action").getByRole("button", { name: /cancel/i }).click();
        await page.waitForTimeout(500);
      }
    } else {
      ok("Add Action button", false);
    }

    const row = page.locator(".card").filter({ hasText: /current actions/i }).locator(".cursor-pointer").first();
    if (await row.count()) {
      await row.click();
      await page.waitForTimeout(1000);
      const o1 = await page.locator("#custom_action").evaluate((el) => /** @type {HTMLDialogElement} */ (el).open).catch(() => false);
      ok("Edit opens", o1);
      await page.locator("#custom_action").getByRole("button", { name: /cancel/i }).click();
      await page.waitForTimeout(500);
      await row.click();
      await page.waitForTimeout(1000);
      const o2 = await page.locator("#custom_action").evaluate((el) => /** @type {HTMLDialogElement} */ (el).open).catch(() => false);
      ok("Edit reopens", o2);
    } else {
      ok("Edit opens", false, "no rows");
    }

    ok("Trajectory chart", (await page.locator(".recharts-surface").count()) > 0);
  } catch (e) {
    ok("Script error", false, String(e));
  }

  await page.screenshot({ path: "qa-screenshot.png", fullPage: true }).catch(() => {});
  const failed = results.filter((r) => !r.pass);
  console.log("\n=== SUMMARY ===");
  console.log(`Passed: ${results.filter((r) => r.pass).length}/${results.length}`);
  failed.forEach((f) => console.log(` - ${f.name}: ${f.detail}`));
  await browser.close();
  process.exit(failed.length ? 1 : 0);
}

main();
