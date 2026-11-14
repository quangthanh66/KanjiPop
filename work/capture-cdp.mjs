import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const PORT = 9222;

async function launchChromium() {
  const proc = spawn('/usr/bin/chromium', [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--hide-scrollbars'
  ], { stdio: 'ignore' });

  // Wait for port to be ready
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) return proc;
    } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error('Chromium failed to start');
}

async function capture(url, outPath, width, height, dpr = 1) {
  // Create target
  const newRes = await fetch(`http://127.0.0.1:${PORT}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
  const target = await newRes.json();
  const wsUrl = target.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);
  let id = 1;
  const pending = new Map();

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
  };

  await new Promise(resolve => ws.onopen = resolve);

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const curId = id++;
      pending.set(curId, { resolve, reject });
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: dpr,
    mobile: width < 600
  });

  // Wait for page load and assets
  await new Promise(r => setTimeout(r, 1200));

  // Evaluate metrics
  const evalRes = await send('Runtime.evaluate', {
    expression: `(() => {
      const f = document.querySelector('#map-screen .astro-constellation-field');
      const d = document.querySelector('#map-screen .astro-constellation-dial-ring');
      const nodes = Array.from(document.querySelectorAll('#map-screen .astro-chapter-section[data-ch="0"] .astro-node')).map(n => {
        const r = n.getBoundingClientRect();
        const gr = n.querySelector('.astro-gem-float')?.getBoundingClientRect();
        const pr = n.querySelector('.astro-pedestal-img')?.getBoundingClientRect();
        const title = n.querySelector('.astro-title')?.textContent;
        const num = n.querySelector('.astro-num')?.textContent;
        return {
          num,
          title,
          nodeTop: Math.round(r.top),
          nodeLeft: Math.round(r.left),
          gemTop: gr ? Math.round(gr.top) : null,
          gemLeft: gr ? Math.round(gr.left) : null,
          pedTop: pr ? Math.round(pr.top) : null,
          pedLeft: pr ? Math.round(pr.left) : null
        };
      });
      return {
        field: f ? { width: f.offsetWidth, height: f.offsetHeight, top: f.getBoundingClientRect().top, left: f.getBoundingClientRect().left } : null,
        dial: d ? { width: d.offsetWidth, height: d.offsetHeight, top: d.getBoundingClientRect().top, left: d.getBoundingClientRect().left } : null,
        nodes
      };
    })()`,
    returnByValue: true
  });

  // Capture screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const buf = Buffer.from(shot.data, 'base64');
  writeFileSync(outPath, buf);

  await send('Page.close');
  ws.close();

  // Close target
  await fetch(`http://127.0.0.1:${PORT}/json/close/${target.id}`);
  return evalRes.result?.value;
}

(async () => {
  const chrome = await launchChromium();
  try {
    console.log('Capturing Desktop...');
    const dMetrics = await capture('http://127.0.0.1:8765/', '/tmp/test_blackhole_desktop.png', 1280, 720, 1);
    console.log('Desktop nodes:', dMetrics?.nodes);

    console.log('Capturing Mobile...');
    const mMetrics = await capture('http://127.0.0.1:8765/', '/tmp/test_blackhole_mobile.png', 360, 740, 2);
    console.log('Mobile nodes:', mMetrics?.nodes);

    console.log('Done!');
  } finally {
    chrome.kill();
  }
})();
