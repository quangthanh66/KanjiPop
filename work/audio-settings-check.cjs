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

  // 1. Verify defaults on fresh state
  const initialBgm = await page.evaluate(() => window.KanjiAudio.getBgmStyle());
  const initialProfile = await page.evaluate(() => window.KanjiAudio.getSoundProfile());
  const initialVoice = await page.evaluate(() => window.KanjiAudio.isVoiceEnabled());

  console.log('Initial Audio State:', { initialBgm, initialProfile, initialVoice });
  assert.strictEqual(initialBgm, 'pop', 'Default BGM style should be pop');
  assert.strictEqual(initialProfile, 'gem', 'Default SFX profile should be gem');
  assert.strictEqual(initialVoice, true, 'Default Japanese voice should be enabled (true)');

  // 2. Open Journey Menu -> then Settings modal
  console.log('Opening Journey Menu...');
  await page.click('[data-journey-menu]');
  await page.waitForSelector('.journey-options');

  console.log('Opening Settings modal...');
  await page.click('[data-settings]');
  await page.waitForSelector('.experience-settings');

  // Verify modal elements exist
  const bgmSelect = await page.$('select[data-bgm-style]');
  const soundSelect = await page.$('select[data-sound-style]');
  const voiceSelect = await page.$('select[data-voice-toggle]');

  assert(bgmSelect, 'Settings modal must have select[data-bgm-style]');
  assert(soundSelect, 'Settings modal must have select[data-sound-style]');
  assert(voiceSelect, 'Settings modal must have select[data-voice-toggle]');

  // Check their selected values
  const bgmVal = await page.$eval('select[data-bgm-style]', el => el.value);
  const soundVal = await page.$eval('select[data-sound-style]', el => el.value);
  const voiceVal = await page.$eval('select[data-voice-toggle]', el => el.value);

  console.log('Modal Selected Values:', { bgmVal, soundVal, voiceVal });
  assert.strictEqual(bgmVal, 'pop');
  assert.strictEqual(soundVal, 'gem');
  assert.strictEqual(voiceVal, 'on');

  // 3. Test changing BGM to 'zen'
  console.log('Selecting zen BGM...');
  await page.selectOption('select[data-bgm-style]', 'zen');
  const changedBgm = await page.evaluate(() => window.KanjiAudio.getBgmStyle());
  const storedBgm = await page.evaluate(() => localStorage.getItem('kp-bgm-style'));
  assert.strictEqual(changedBgm, 'zen');
  assert.strictEqual(storedBgm, 'zen');

  // 4. Test changing SFX to 'tile'
  console.log('Selecting tile SFX...');
  await page.selectOption('select[data-sound-style]', 'tile');
  const changedProfile = await page.evaluate(() => window.KanjiAudio.getSoundProfile());
  const storedProfile = await page.evaluate(() => localStorage.getItem('kanji-pop-sound-profile'));
  assert.strictEqual(changedProfile, 'tile');
  assert.strictEqual(storedProfile, 'tile');

  // 5. Test switching back to 'pop' and 'gem'
  console.log('Switching back to pop BGM and gem SFX...');
  await page.selectOption('select[data-bgm-style]', 'pop');
  await page.selectOption('select[data-sound-style]', 'gem');
  assert.strictEqual(await page.evaluate(() => window.KanjiAudio.getBgmStyle()), 'pop');
  assert.strictEqual(await page.evaluate(() => window.KanjiAudio.getSoundProfile()), 'gem');

  // Take screenshot of settings modal for visual verification artifact
  await page.screenshot({ path: 'work/audio-settings-desktop.png' });

  // Close settings modal
  await page.click('[data-action="close"]');
  await page.waitForSelector('.experience-settings', { state: 'detached' });

  // 6. Test in-game play menu
  console.log('Launching level to test in-game menu...');
  await page.click('[data-main]');
  await page.waitForSelector('#play-screen:not([hidden])');

  // Dismiss level intro modal if shown
  const introBtn = await page.$('[data-action="begin-level"]');
  if (introBtn) {
    console.log('Dismissing level intro modal...');
    await introBtn.click();
    await page.waitForSelector('.level-intro', { state: 'detached' });
  }

  // Open in-game menu via #help
  console.log('Opening in-game play menu via #help...');
  await page.click('#help');
  await page.waitForSelector('.mobile-play-menu');

  const inGameBgmSelect = await page.$('.mobile-play-menu select[data-bgm-style]');
  const inGameSoundSelect = await page.$('.mobile-play-menu select[data-sound-style]');
  assert(inGameBgmSelect, 'In-game menu must have select[data-bgm-style]');
  assert(inGameSoundSelect, 'In-game menu must have select[data-sound-style]');

  const inGameBgmVal = await page.$eval('.mobile-play-menu select[data-bgm-style]', el => el.value);
  const inGameSoundVal = await page.$eval('.mobile-play-menu select[data-sound-style]', el => el.value);
  console.log('In-game menu values:', { inGameBgmVal, inGameSoundVal });
  assert.strictEqual(inGameBgmVal, 'pop');
  assert.strictEqual(inGameSoundVal, 'gem');

  // Test audio execution without error (slide, fusion, win)
  await page.evaluate(() => {
    window.KanjiAudio.setEnabled(true);
    window.KanjiAudio.setBgm(true);
    window.KanjiAudio.select();
    window.KanjiAudio.slide(true);
    window.KanjiAudio.fusion(0, 1);
    window.KanjiAudio.win();
    window.KanjiAudio.speak('休');
  });

  console.log('Audio functions executed cleanly without runtime error!');
  console.log('ALL AUDIO SETTINGS CHECKS PASSED 100%!');

  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
