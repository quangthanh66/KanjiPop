const { chromium } = (() => {
  for (const p of ['playwright', 'C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright', 'C:/Users/Windows/Downloads/Bomb/node_modules/playwright']) {
    try { return require(p); } catch {}
  }
  throw new Error('Playwright not found');
})();
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

  // 2. Verify exactly the 4 main categories with 10 options each, + voice
  const categories = ['tileTap', 'fusion', 'win', 'bgm'];
  for (const cat of categories) {
    const sel = await page.$(`select[data-audio-fn="${cat}"]`);
    assert(sel, `Selector for ${cat} must exist`);
    const optCount = await page.$$eval(`select[data-audio-fn="${cat}"] option`, opts => opts.length);
    console.log(`Category ${cat} has ${optCount} options`);
    assert.strictEqual(optCount, 10, `Category ${cat} must have exactly 10 options!`);
  }

  // Verify voice selector has 2 options
  const voiceOpts = await page.$$eval('select[data-audio-fn="voice"] option', opts => opts.length);
  assert.strictEqual(voiceOpts, 2, 'Voice selector must have 2 options (on/off)');

  // Verify invalid and hint are NOT in the studio list
  assert(!(await page.$('select[data-audio-fn="invalid"]')), 'invalid should be removed');
  assert(!(await page.$('select[data-audio-fn="hint"]')), 'hint should be removed');
  console.log('Verified removal of invalid and hint selectors!');

  // 3. Test Preview for tileTap
  console.log('Testing Preview button for tileTap...');
  await page.click('button[data-audio-preview="tileTap"]');
  const btnText = await page.$eval('button[data-audio-preview="tileTap"]', el => el.textContent);
  assert(btnText.includes('Đang nghe'), 'Preview button should show playing text');
  await page.waitForTimeout(500);

  // 4. Test Preview for fusion
  console.log('Testing Preview button for fusion...');
  await page.click('button[data-audio-preview="fusion"]');
  await page.waitForTimeout(600);

  // 5. Test Preview for win
  console.log('Testing Preview button for win...');
  await page.click('button[data-audio-preview="win"]');
  await page.waitForTimeout(600);

  // 6. Test Preview for bgm
  console.log('Testing Preview button for bgm...');
  await page.click('button[data-audio-preview="bgm"]');
  await page.waitForTimeout(800);

  // 7. Test Presets
  console.log('Testing Sakura Koto Preset button...');
  await page.click('button[data-preset-btn="sakuraKoto"]');
  assert.strictEqual(await page.$eval('select[data-audio-fn="bgm"]', el => el.value), 'koto');
  assert.strictEqual(await page.$eval('select[data-audio-fn="fusion"]', el => el.value), 'koto');
  assert.strictEqual(await page.$eval('select[data-audio-fn="tileTap"]', el => el.value), 'wood');
  assert.strictEqual(await page.$eval('select[data-audio-fn="win"]', el => el.value), 'sakura');

  console.log('Testing Pop Gem Preset button...');
  await page.click('button[data-preset-btn="popGem"]');
  assert.strictEqual(await page.$eval('select[data-audio-fn="bgm"]', el => el.value), 'pop');
  assert.strictEqual(await page.$eval('select[data-audio-fn="fusion"]', el => el.value), 'pop');
  assert.strictEqual(await page.$eval('select[data-audio-fn="tileTap"]', el => el.value), 'gem');

  // 8. Custom choice: set tileTap to 'porcelain', fusion to 'thunder', win to 'brass', bgm to 'citypop'
  console.log('Configuring custom audio choices...');
  await page.selectOption('select[data-audio-fn="tileTap"]', 'porcelain');
  await page.selectOption('select[data-audio-fn="fusion"]', 'thunder');
  await page.selectOption('select[data-audio-fn="win"]', 'brass');
  await page.selectOption('select[data-audio-fn="bgm"]', 'citypop');

  // Screenshot of the 40-option Audio Studio modal
  await page.screenshot({ path: 'work/audio-studio-40-options.png' });
  console.log('Saved screenshot of 40-option Audio Studio modal!');

  // Save & Apply
  console.log('Saving audio studio configuration...');
  await page.click('button[data-action="save-audio-studio"]');
  await page.waitForSelector('.audio-studio-modal', { state: 'detached' });

  // Verify saved in localStorage
  const savedMap = await page.evaluate(() => JSON.parse(localStorage.getItem('kp-custom-audio-map')));
  console.log('Saved Audio Map in localStorage:', savedMap);
  assert.strictEqual(savedMap.tileTap, 'porcelain');
  assert.strictEqual(savedMap.fusion, 'thunder');
  assert.strictEqual(savedMap.win, 'brass');
  assert.strictEqual(savedMap.bgm, 'citypop');

  // 9. Launch level 1 and test tileTap, fusion, win during gameplay
  console.log('Launching level to test in-game audio execution...');
  await page.click('[data-main]');
  await page.waitForSelector('#play-screen:not([hidden])');

  const introBtn = await page.$('[data-action="begin-level"]');
  if (introBtn) {
    await introBtn.click();
    await page.waitForSelector('.level-intro', { state: 'detached' });
  }

  // Execute gameplay audio methods with custom choices
  await page.evaluate(() => {
    window.KanjiAudio.setEnabled(true);
    window.KanjiAudio.setBgm(true);
    window.KanjiAudio.select();
    window.KanjiAudio.slide(true);
    window.KanjiAudio.contact(0);
    window.KanjiAudio.fusion(0, 1);
    window.KanjiAudio.invalid(); // should be safe & silent
    window.KanjiAudio.hint(); // should be safe & silent
    window.KanjiAudio.win();
  });

  console.log('All gameplay audio functions ran cleanly without errors!');
  console.log('ALL AUDIO STUDIO 40-OPTIONS TESTS PASSED 100%!');

  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
