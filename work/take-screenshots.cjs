const { chromium } = (() => {
  for (const p of ['playwright', 'C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright', 'C:/Users/Windows/Downloads/Bomb/node_modules/playwright']) {
    try { return require(p); } catch {}
  }
  throw new Error('Playwright not found');
})();

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  
  // 1. Desktop Main Screen
  const pageDesk = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pageDesk.goto('http://127.0.0.1:8765/');
  await pageDesk.waitForTimeout(1000);
  await pageDesk.screenshot({ path: 'work/current-main-desktop.png' });

  // 2. Desktop Game Field
  const playBtnDesk = await pageDesk.$('[data-main="0"]') || await pageDesk.$('[data-journey-level="0"]');
  if (playBtnDesk) {
    await playBtnDesk.click();
    await pageDesk.waitForTimeout(600);
    const beginBtn = await pageDesk.$('[data-action="begin-level"]');
    if (beginBtn) await beginBtn.click();
    await pageDesk.waitForTimeout(600);
    await pageDesk.screenshot({ path: 'work/gamefield-active-desktop.png' });
  }

  // 3. Mobile Main Screen
  const pageMob = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await pageMob.goto('http://127.0.0.1:8765/');
  await pageMob.waitForTimeout(1000);
  await pageMob.screenshot({ path: 'work/current-main-mobile.png' });

  // 4. Mobile Game Field
  const playBtnMob = await pageMob.$('[data-main="0"]') || await pageMob.$('[data-journey-level="0"]');
  if (playBtnMob) {
    await playBtnMob.click();
    await pageMob.waitForTimeout(600);
    const beginBtnMob = await pageMob.$('[data-action="begin-level"]');
    if (beginBtnMob) await beginBtnMob.click();
    await pageMob.waitForTimeout(600);
    await pageMob.screenshot({ path: 'work/gamefield-active-mobile.png' });
  }

  await browser.close();
  console.log('Screenshots captured successfully!');
})();
