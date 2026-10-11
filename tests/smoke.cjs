/* Optional development-only checks. See README.md for the standalone setup. */
const assert = require("node:assert/strict");
const { chromium, webkit, devices } = require("playwright");
const AxeBuilder = require("@axe-core/playwright").default;
const base = process.env.TEST_URL || "http://127.0.0.1:8000";
const engines = process.env.TEST_ENGINE
  ? [process.env.TEST_ENGINE]
  : ["chromium", "webkit"];
(async () => {
  for (const engine of engines) {
    const browser = await (engine === "webkit" ? webkit : chromium).launch({
      ...(engine === "webkit" && process.env.WEBKIT_EXECUTABLE
        ? { executablePath: process.env.WEBKIT_EXECUTABLE }
        : {}),
      ...(engine === "chromium" && process.env.CHROMIUM_EXECUTABLE
        ? { executablePath: process.env.CHROMIUM_EXECUTABLE }
        : {}),
      args: engine === "chromium" ? ["--no-sandbox"] : [],
    });
    try {
      const context = await browser.newContext({ ...devices["iPhone 13"] });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.addInitScript(() => {
        window.__callbackCount = 0;
        const original = requestAnimationFrame.bind(window);
        window.requestAnimationFrame = (callback) =>
          original((time) => {
            window.__callbackCount++;
            callback(time);
          });
      });
      await page.goto(base, { waitUntil: "networkidle" });
      const counts = await page.evaluate(() =>
        window.SOLAR_BODIES.reduce((result, body) => {
          result[body.kind] = (result[body.kind] || 0) + 1;
          return result;
        }, {}),
      );
      assert.deepEqual(counts, { star: 1, planet: 8, dwarf: 5, moon: 12 });
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 844 });
        await page.waitForTimeout(200);
        assert.equal(
          await page.evaluate(
            () =>
              document.documentElement.scrollWidth <=
              document.documentElement.clientWidth,
          ),
          true,
          `${engine}: overflow at ${width}px`,
        );
      }
      await page.setViewportSize({ width: 390, height: 664 });
      const model = page.locator("#orr");
      await model.scrollIntoViewIfNeeded();
      await page.locator("#pp").click();
      assert.equal(
        await page.locator("#pp").getAttribute("aria-pressed"),
        "true",
      );
      await model.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      const frozenOrbit = await model.evaluate((canvas) => canvas.toDataURL());
      await page.waitForTimeout(400);
      assert.equal(
        await model.evaluate((canvas) => canvas.toDataURL()),
        frozenOrbit,
        "Pause freezes orbit",
      );
      await page.locator("#gl").scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      const frozenGlobe = await page
        .locator("#gl")
        .evaluate((canvas) => canvas.toDataURL());
      await page.waitForTimeout(400);
      assert.equal(
        await page.locator("#gl").evaluate((canvas) => canvas.toDataURL()),
        frozenGlobe,
        "Pause freezes globe",
      );
      for (const kind of ["planet", "dwarf", "moon"]) {
        const bodies = await page.evaluate(
          (kind) =>
            window.SOLAR_BODIES.filter((body) => body.kind === kind).map(
              (body) => ({ id: body.id, name: body.name, parent: body.parent }),
            ),
          kind,
        );
        for (const body of bodies) {
          await page.locator(`[data-filter="${kind}"]`).click();
          await page.locator(`[data-body="${body.id}"]`).tap();
          assert.equal(await page.locator("#pname").innerText(), body.name);
          assert.equal(
            await page
              .locator(`[data-body="${body.id}"]`)
              .getAttribute("aria-pressed"),
            "true",
          );
          if (body.parent)
            assert.equal(
              await page.locator("#host-select").inputValue(),
              body.parent,
            );
        }
      }
      await page.locator("#host-select").selectOption("jupiter");
      assert.match(
        await page.locator("#orbit-count").innerText(),
        /4 seçili uydu/,
      );
      await page.locator("#solar-view").click();
      assert.equal(
        await page.locator("#solar-view").getAttribute("aria-pressed"),
        "true",
      );
      await model.focus();
      await page.keyboard.press("ArrowRight");
      assert.equal(await page.locator("#pname").innerText(), "Satürn");
      const swipe = async (dx, dy, cancel = false) => {
        await model.dispatchEvent("pointerdown", {
          pointerId: 1,
          isPrimary: true,
          clientX: 200,
          clientY: 200,
        });
        await model.dispatchEvent(cancel ? "pointercancel" : "pointerup", {
          pointerId: 1,
          isPrimary: true,
          clientX: 200 + dx,
          clientY: 200 + dy,
        });
      };
      await swipe(-80, 2);
      assert.equal(await page.locator("#pname").innerText(), "Uranüs");
      await swipe(5, 100);
      assert.equal(
        await page.locator("#pname").innerText(),
        "Uranüs",
        "Vertical drag does not select",
      );
      await swipe(80, 0, true);
      assert.equal(
        await page.locator("#pname").innerText(),
        "Uranüs",
        "Cancelled gesture does not select",
      );
      assert.equal(
        await model.evaluate((el) => getComputedStyle(el).touchAction),
        "pan-y",
      );
      assert.equal(
        await page
          .locator("#gl")
          .evaluate((el) => getComputedStyle(el).touchAction),
        "pan-y",
      );
      await page.locator('[data-select="europa"]').click();
      assert.equal(await page.locator("#pname").innerText(), "Europa");
      assert.equal(await page.locator("#host-select").inputValue(), "jupiter");
      const imageButton = page.locator(".zb").first();
      await imageButton.click();
      assert.equal(await page.locator("#lb").evaluate((el) => el.open), true);
      await page.keyboard.press("Tab");
      assert.equal(
        await page.evaluate(() => !!document.activeElement.closest("#lb")),
        true,
        "Dialog traps focus",
      );
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#lb").evaluate((el) => el.open), false);
      assert.equal(
        await imageButton.evaluate((el) => el === document.activeElement),
        true,
        "Dialog restores opener focus",
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForTimeout(200);
      assert.equal(
        await page.locator("#motion-toggle").getAttribute("aria-pressed"),
        "true",
      );
      await model.scrollIntoViewIfNeeded();
      await page.waitForTimeout(250);
      await page.evaluate(() => (window.__callbackCount = 0));
      await page.waitForTimeout(600);
      assert.equal(
        await page.evaluate(() => window.__callbackCount),
        0,
        "Reduced motion has no ongoing rAF",
      );
      await page.locator("#go").click();
      assert.match(
        await page.locator("#race-status").innerText(),
        /Neptün’e ulaştı/,
      );
      assert.equal(await page.locator("#go").isEnabled(), true);
      await page.emulateMedia({ reducedMotion: "no-preference" });
      // Resume the paused simulation, then verify it actually stops offscreen.
      await page.locator("#pp").click();
      await model.scrollIntoViewIfNeeded();
      const initialClock = await page.locator("#clock").innerText();
      await page.waitForTimeout(700);
      assert.notEqual(
        await page.locator("#clock").innerText(),
        initialClock,
        "Resumed model advances time",
      );
      await page.locator("#gorev").scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await page.evaluate(() => (window.__callbackCount = 0));
      await page.waitForTimeout(600);
      assert.equal(
        await page.evaluate(() => window.__callbackCount),
        0,
        "No rAF while all animated surfaces are offscreen",
      );
      const a11y = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      assert.deepEqual(
        a11y.violations.map((v) => ({
          id: v.id,
          targets: v.nodes.map((n) => n.target),
        })),
        [],
        `${engine}: accessibility violations`,
      );
      assert.deepEqual(errors, [], `${engine}: JavaScript errors`);
      // Initial OS preference must work even before any user interaction.
      const reduced = await browser.newPage({
        ...devices["iPhone 13"],
        reducedMotion: "reduce",
      });
      await reduced.goto(base, { waitUntil: "networkidle" });
      assert.equal(
        await reduced.locator("#motion-toggle").getAttribute("aria-pressed"),
        "true",
      );
      const noJS = await browser.newPage({
        javaScriptEnabled: false,
        viewport: { width: 390, height: 664 },
      });
      await noJS.goto(base);
      assert.equal(
        await noJS.locator("h1").innerText(),
        "Bir yıldızın\netrafında,\nher şey.",
      );
      assert.equal(await noJS.locator("noscript").isVisible(), true);
      console.log(
        `${engine}: PASS — 25 selections, 5 widths, pause, keyboard, pointer gestures, dialog, reduced motion, offscreen idle, WCAG AA, no-JS content`,
      );
    } finally {
      await browser.close();
    }
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
