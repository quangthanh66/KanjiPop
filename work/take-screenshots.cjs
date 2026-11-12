const { chromium } = (() => {
  for (const p of ['playwright', 'C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright', 'C:/Users/Windows/Downloads/Bomb/node_modules/playwright']) {
    try { return require(p); } catch {}
  }
  throw new Error('Playwright not found');
})();

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  
  const viewports = [
    { name: 'desktop-1920x1080', width: 1920, height: 1080 },
    { name: 'desktop-1440x900', width: 1440, height: 900 },
    { name: 'desktop-1366x768', width: 1366, height: 768 },
    { name: 'desktop-1280x720', width: 1280, height: 720 },
    { name: 'mobile-390x844', width: 390, height: 844 },
    { name: 'mobile-360x740', width: 360, height: 740 },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://127.0.0.1:8765/');
    await page.waitForTimeout(600);
    
    const metrics = await page.evaluate(() => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const hasVerticalScroll = scrollHeight > clientHeight + 1;
      const node01 = document.querySelector('[data-main="0"]');
      const nodeRect = node01 ? JSON.parse(JSON.stringify(node01.getBoundingClientRect())) : null;
      const heroBtn = document.querySelector('[data-hero-play]');
      const heroRect = heroBtn ? JSON.parse(JSON.stringify(heroBtn.getBoundingClientRect())) : null;
      const nav = document.querySelector('.course-nav');
      const navRect = nav ? JSON.parse(JSON.stringify(nav.getBoundingClientRect())) : null;
      
      let overlapsNav = false;
      if (nodeRect && navRect) {
        overlapsNav = !(nodeRect.bottom < navRect.top || nodeRect.top > navRect.bottom || nodeRect.right < navRect.left || nodeRect.left > navRect.right);
      }

      return {
        scrollHeight,
        clientHeight,
        hasVerticalScroll,
        nodeRect,
        heroRect,
        navRect,
        overlapsNav
      };
    });
    
    console.log(`[${vp.name}] clientH=${metrics.clientHeight}, scrollH=${metrics.scrollHeight}, hasScroll=${metrics.hasVerticalScroll}, overlapsNav=${metrics.overlapsNav}`);
    if (metrics.nodeRect && metrics.navRect) {
      console.log(`  node01: top=${Math.round(metrics.nodeRect.top)}, bottom=${Math.round(metrics.nodeRect.bottom)} | nav: top=${Math.round(metrics.navRect.top)}`);
    }

    await page.screenshot({ path: `work/screen-${vp.name}.png` });
    await page.close();
  }

  await browser.close();
  console.log('Metrics done');
})();
