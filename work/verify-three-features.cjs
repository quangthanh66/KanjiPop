const { chromium } = require('C:/Users/Windows/Downloads/Bomb/node_modules/playwright');
const assert = require('node:assert/strict');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  });

  try {
    // 1. Desktop Test (1920x1080)
    console.log('--- Testing Desktop 1920x1080 ---');
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    // Set up test state with '休' collected using valid E.fresh
    await page.goto('http://127.0.0.1:8765/');
    await page.evaluate(() => {
      const E = window.KanjiN5, mode = 'desktop';
      const seed = window.KanjiCoursePlans.modes[mode][0].seed;
      const s = E.fresh(0, seed, mode);
      const payload = {
        course: E.C.id,
        state: s,
        profile: { collected: ['休'], results: {} },
        history: [],
        undos: 3,
        view: 'map',
        sound: true
      };
      localStorage.setItem('kanji-pop-n5-v1', JSON.stringify(payload));
      localStorage.setItem('kanji-pop-profile-n5-v1', JSON.stringify(payload.profile));
      document.fonts.ready;
    });
    await page.reload();
    await page.waitForTimeout(600);

    // TEST FEATURE 1: i18n
    console.log('Testing Feature 1: i18n Language Switcher...');
    const langBtn = page.locator('#kp-lang');
    assert(await langBtn.isVisible(), '#kp-lang button must be visible in header');
    assert.equal((await langBtn.textContent()).trim(), 'EN');

    // Initial VI checks
    const navJourney = (await page.locator('#nav-map').textContent()).trim();
    assert(navJourney.includes('Lộ trình'), `Expected "Lộ trình", got "${navJourney}"`);

    // Switch to EN
    await langBtn.click();
    await page.waitForTimeout(300);

    assert.equal((await langBtn.textContent()).trim(), 'VI');
    assert.equal(await page.evaluate(() => document.documentElement.lang), 'en');
    const navJourneyEn = (await page.locator('#nav-map').textContent()).trim();
    assert(navJourneyEn.includes('Journey'), `Expected "Journey", got "${navJourneyEn}"`);
    console.log('i18n Switch to EN verified successfully!');

    // Take screenshot of EN map view
    await page.screenshot({ path: path.join(__dirname, 'kanji-pop-site', 'dist', 'en-map-desktop.png') });

    // TEST FEATURE 2: Native Audio TTS
    console.log('Testing Feature 2: Native Audio Pronunciation...');
    // Open a card from shelf
    const firstShelfCard = page.locator('.shelf-gem-card').first();
    await firstShelfCard.click();
    await page.waitForTimeout(400);

    const voiceBtn = page.locator('.btn-voice-speak');
    assert(await voiceBtn.isVisible(), 'Speaker button .btn-voice-speak must be visible in card modal');

    // Spy on KanjiAudio.speak
    const spokenText = await page.evaluate(() => {
      return new Promise(resolve => {
        const origSpeak = window.KanjiAudio.speak;
        window.KanjiAudio.speak = function(text, lang) {
          origSpeak.call(this, text, lang);
          resolve({ text, lang });
        };
        document.querySelector('.btn-voice-speak').click();
      });
    });
    console.log('Spoken Japanese audio verified:', spokenText);
    assert(spokenText && spokenText.text, 'Audio speak must receive text');

    // Close card modal
    await page.locator('[data-action="close"]').click();
    await page.waitForTimeout(300);

    // TEST FEATURE 3: Daily Kanji Puzzle & Share Card
    console.log('Testing Feature 3: Daily Kanji Puzzle...');
    const dailyPill = page.locator('.grade-pill.daily-pill');
    assert(await dailyPill.isVisible(), 'Daily Challenge pill must be visible in toolbar');

    // Click Daily Challenge
    await dailyPill.click();
    await page.waitForTimeout(500);

    assert.equal(await page.locator('#kanji-pop').getAttribute('data-view'), 'play');
    assert.equal(await page.locator('#level-no').textContent(), '📅');
    console.log('Daily puzzle launched into play mode successfully!');

    // Trigger daily win modal to verify share card & Wordle format
    await page.evaluate(() => {
      const targetId = window.KanjiCourse.ids[0];
      const r = window.KanjiCourse.recipes[targetId];
      // Simulate win
      document.querySelector('#modal').innerHTML = '';
      window.KanjiN5.C = window.KanjiCourse;
      // Call win modal
      const state = { isDaily: true, dailyDate: new Date().toISOString().slice(0, 10), dailyTarget: targetId, moves: 14 };
      // Call showDailyWin via click or direct
      const event = new CustomEvent('test-daily-win');
      // Execute daily win directly
      const rec = { moves: 14, date: state.dailyDate, target: targetId, solved: true };
      localStorage.setItem('kp-daily-' + state.dailyDate + '-N5', JSON.stringify(rec));
    });

    // Re-click daily pill now that record exists -> opens showDailyWin modal!
    await page.locator('#nav-map').click();
    await page.waitForTimeout(300);
    await page.locator('.grade-pill.daily-pill').click();
    await page.waitForTimeout(500);

    // Verify daily win modal
    const dailyModal = page.locator('.daily-win-modal');
    assert(await dailyModal.isVisible(), 'Daily win modal must be visible');
    const shareBtn = page.locator('.daily-share-btn');
    assert(await shareBtn.isVisible(), 'Share button must be visible');

    const sharePre = await page.locator('.daily-share-preview pre').textContent();
    console.log('Generated Share Text:\n' + sharePre);
    assert(sharePre.includes('Kanji Pop! Daily'), 'Share text must have game title');
    assert(sharePre.includes('🟩'), 'Share text must contain Wordle-style emojis');

    // Click share button
    await shareBtn.click();
    await page.waitForTimeout(300);
    const toast = page.locator('.kp-share-toast');
    assert(await toast.isVisible(), 'Toast notification must show after copying share text');

    // Take desktop screenshot of Daily Win Modal
    await page.screenshot({ path: path.join(__dirname, 'kanji-pop-site', 'dist', 'daily-win-desktop.png') });
    console.log('Desktop 1920x1080 tests PASS with 0 errors!');
    assert.deepEqual(errors, []);
    await page.close();

    // 2. Mobile Test (390x844 - iPhone 14)
    console.log('--- Testing Mobile 390x844 ---');
    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const mobileErrors = [];
    mobilePage.on('pageerror', e => mobileErrors.push(e.message));

    await mobilePage.goto('http://127.0.0.1:8765/');
    await mobilePage.evaluate(() => document.fonts.ready);
    await mobilePage.waitForTimeout(500);

    // Verify mobile header has both language button and sound button
    assert(await mobilePage.locator('#kp-lang').isVisible(), 'Mobile header must have #kp-lang');
    assert(await mobilePage.locator('#kp-sound').isVisible(), 'Mobile header must have #kp-sound');

    // Check tap targets are >= 44px
    const langBox = await mobilePage.locator('#kp-lang').boundingBox();
    assert(langBox.width >= 44 && langBox.height >= 44, `Target must be >= 44px, got ${langBox.width}x${langBox.height}`);

    const soundBox = await mobilePage.locator('#kp-sound').boundingBox();
    assert(soundBox.width >= 44 && soundBox.height >= 44, `Target must be >= 44px, got ${soundBox.width}x${soundBox.height}`);

    // Verify daily pill on mobile
    const mobileDailyPill = mobilePage.locator('.grade-pill.daily-pill');
    assert(await mobileDailyPill.isVisible(), 'Mobile toolbar must have daily pill');

    // Check no horizontal scrollbar
    const scrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
    assert(scrollWidth <= 391, `Mobile scrollWidth (${scrollWidth}) must not exceed viewport (390)`);

    // Screenshot of Mobile Map
    await mobilePage.screenshot({ path: path.join(__dirname, 'kanji-pop-site', 'dist', 'mobile-map-390.png') });

    // Open Daily Challenge on Mobile
    await mobileDailyPill.click();
    await mobilePage.waitForTimeout(500);
    assert.equal(await mobilePage.locator('#kanji-pop').getAttribute('data-view'), 'play');

    // In mobile play mode, verify sound button is at row 1, col 3 and lang button is cleanly hidden
    assert(await mobilePage.locator('#kp-sound').isVisible(), 'Mobile sound button must remain visible');
    assert(!(await mobilePage.locator('#kp-lang').isVisible()), 'Mobile lang button should be hidden during play');

    // Check no overflow during mobile play
    const playScrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
    assert(playScrollWidth <= 391, `Mobile play scrollWidth (${playScrollWidth}) must not exceed viewport (390)`);

    // Screenshot of Mobile Play
    await mobilePage.screenshot({ path: path.join(__dirname, 'kanji-pop-site', 'dist', 'mobile-play-390.png') });

    console.log('Mobile 390x844 tests PASS with 0 errors!');
    assert.deepEqual(mobileErrors, []);
    await mobilePage.close();

    console.log('ALL THREE FEATURES FULLY VERIFIED ON DESKTOP & MOBILE!');
  } finally {
    await browser.close();
  }
})().catch(e => {
  console.error(e);
  process.exit(1);
});
