const { chromium } = require('C:/Users/Windows/Downloads/Bomb/node_modules/playwright');
const assert = require('assert');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  console.log('Navigating to http://127.0.0.1:8765/ ...');
  await page.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle' });

  // 1. Open Journey Menu -> Click Audio Studio
  console.log('Opening Journey Menu...');
  await page.click('[data-journey-menu]');
  await page.waitForSelector('.journey-options');

  console.log('Clicking Audio Studio button...');
  await page.click('[data-audio-studio]');
  await page.waitForSelector('.audio-studio-modal');

  // 2. Verify all 9 function selectors are present
  const requiredFns = ['select', 'slide', 'contact', 'fusion', 'invalid', 'hint', 'win', 'bgm', 'voice'];
  for (const fn of requiredFns) {
    const sel = await page.$(`select[data-audio-fn="${fn}"]`);
    const prevBtn = await page.$(`button[data-audio-preview="${fn}"]`);
    assert(sel, `Selector for ${fn} must exist`);
    assert(prevBtn, `Preview button for ${fn} must exist`);
  }
  console.log('All 9 function selectors and preview buttons verified!');

  // 3. Test Preview Button Execution
  console.log('Testing Preview button for select...');
  await page.click('button[data-audio-preview="select"]');
  const btnText = await page.$eval('button[data-audio-preview="select"]', el => el.textContent);
  assert(btnText.includes('Đang nghe'), 'Preview button should indicate playback');
  await page.waitForTimeout(600);

  console.log('Testing Preview button for fusion...');
  await page.click('button[data-audio-preview="fusion"]');
  await page.waitForTimeout(600);

  console.log('Testing Preview button for bgm...');
  await page.click('button[data-audio-preview="bgm"]');
  await page.waitForTimeout(600);

  // 4. Test Preset Buttons
  console.log('Testing Zen Stone Preset button...');
  await page.click('button[data-preset-btn="zenStone"]');
  assert.strictEqual(await page.$eval('select[data-audio-fn="bgm"]', el => el.value), 'zen');
  assert.strictEqual(await page.$eval('select[data-audio-fn="fusion"]', el => el.value), 'zen');
  assert.strictEqual(await page.$eval('select[data-audio-fn="slide"]', el => el.value), 'tile');

  console.log('Testing Pop Gem Preset button...');
  await page.click('button[data-preset-btn="popGem"]');
  assert.strictEqual(await page.$eval('select[data-audio-fn="bgm"]', el => el.value), 'pop');
  assert.strictEqual(await page.$eval('select[data-audio-fn="fusion"]', el => el.value), 'pop');
  assert.strictEqual(await page.$eval('select[data-audio-fn="slide"]', el => el.value), 'gem');

  // 5. Test Custom Individual Choice
  console.log('Customizing fusion to taiko...');
  await page.selectOption('select[data-audio-fn="fusion"]', 'taiko');
  await page.waitForTimeout(300);

  // 6. Screenshot Audio Studio for artifact
  await page.screenshot({ path: 'work/audio-studio-screenshot.png' });
  console.log('Saved screenshot of Audio Studio modal!');

  // 7. Save & Apply
  console.log('Saving audio studio configuration...');
  await page.click('button[data-action="save-audio-studio"]');
  await page.waitForSelector('.audio-studio-modal', { state: 'detached' });

  // Verify saved in localStorage
  const savedMap = await page.evaluate(() => JSON.parse(localStorage.getItem('kp-custom-audio-map')));
  console.log('Saved Audio Map in localStorage:', savedMap);
  assert.strictEqual(savedMap.fusion, 'taiko', 'Saved map should have fusion = taiko');
  assert.strictEqual(savedMap.bgm, 'pop');

  // 8. Test opening from In-game Menu
  console.log('Launching level 1 to test in-game studio opening...');
  await page.click('[data-main]');
  await page.waitForSelector('#play-screen:not([hidden])');

  const introBtn = await page.$('[data-action="begin-level"]');
  if (introBtn) {
    await introBtn.click();
    await page.waitForSelector('.level-intro', { state: 'detached' });
  }

  console.log('Opening mobile play menu...');
  await page.click('#help');
  await page.waitForSelector('.mobile-play-menu');

  console.log('Opening Audio Studio from inside game play menu...');
  await page.click('.mobile-play-menu [data-audio-studio]');
  await page.waitForSelector('.audio-studio-modal');

  const inGameFusionVal = await page.$eval('select[data-audio-fn="fusion"]', el => el.value);
  assert.strictEqual(inGameFusionVal, 'taiko', 'In-game audio studio should reflect saved customization');

  await page.click('button[data-action="close"]');
  await page.waitForSelector('.audio-studio-modal', { state: 'detached' });

  console.log('ALL AUDIO STUDIO CHECKS PASSED 100%!');

  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
