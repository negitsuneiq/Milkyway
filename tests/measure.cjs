/* Development benchmark: JavaScript rAF callback time, not whole-device CPU/FPS. */
const fs = require('node:fs');
const path = require('node:path');
const {chromium, webkit, devices} = require('playwright');
(async () => {
  const url = process.argv[2] || 'http://127.0.0.1:8000';
  const engine = process.argv[3] || 'webkit';
  const outputFile = process.argv[4] || `reports/current-${engine}.json`;
  const browser = await (engine === 'webkit' ? webkit : chromium).launch({
    ...(engine === 'webkit' && process.env.WEBKIT_EXECUTABLE ? {executablePath:process.env.WEBKIT_EXECUTABLE} : {}),
    ...(engine === 'chromium' && process.env.CHROMIUM_EXECUTABLE ? {executablePath:process.env.CHROMIUM_EXECUTABLE} : {}),
    args:engine === 'chromium' ? ['--no-sandbox'] : [],
  });
  try {
    const context = await browser.newContext({...devices['iPhone 13'], reducedMotion:'no-preference'});
    const page = await context.newPage();
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
      window.__frames = [];
      const native = requestAnimationFrame.bind(window);
      window.requestAnimationFrame = callback => native(time => {
        const start = performance.now(); callback(time);
        window.__frames.push({time, ms:performance.now() - start});
      });
    });
    await page.goto(url, {waitUntil:'networkidle'});
    await page.waitForTimeout(2500);
    const output = {url, engine, browserVersion:browser.version(), device:'iPhone 13 emulation / Linux', viewport:page.viewportSize(), samples:{}, errors};
    for (const [name, selector] of [['model','#orr'], ['globe','#gl'], ['offscreen','#gorev']]) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      await page.evaluate(() => {window.__frames = []; window.__sampleStart = performance.now();});
      await page.waitForTimeout(3000);
      output.samples[name] = await page.evaluate(() => {
        const frames = window.__frames, seconds = (performance.now() - window.__sampleStart) / 1000;
        const times = frames.map(frame => frame.ms).sort((a,b) => a-b);
        return {sampleSeconds:Math.round(seconds*100)/100, callbacks:frames.length, callbackMsPerSecond:Math.round(times.reduce((sum, ms) => sum+ms, 0)/seconds*100)/100, p95CallbackMs:Math.round((times[Math.floor(times.length*.95)] || 0)*100)/100, over16ms:times.filter(ms => ms > 16.7).length};
      });
    }
    output.horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    fs.mkdirSync(path.dirname(outputFile), {recursive:true});
    fs.writeFileSync(outputFile, JSON.stringify(output,null,2)+'\n');
    console.log(outputFile, JSON.stringify(output.samples));
  } finally {await browser.close();}
})().catch(error => {console.error(error);process.exitCode=1;});
