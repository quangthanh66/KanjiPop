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

async function capture(url, outPath, width, height, dpr = 1, chIndex = 0) {
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

  // Wait for initial render
  await new Promise(r => setTimeout(r, 1200));

  if (chIndex > 0) {
    await send('Runtime.evaluate', {
      expression: `(() => {
        const sections = document.querySelectorAll('.astro-chapter-section');
        if (sections[${chIndex}]) {
          sections[${chIndex}].scrollIntoView({ behavior: 'instant' });
        }
      })()`
    });
    await new Promise(r => setTimeout(r, 600));
  }

  // Capture screenshot
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const buf = Buffer.from(shot.data, 'base64');
  writeFileSync(outPath, buf);

  await send('Page.close');
  ws.close();

  // Close target
  await fetch(`http://127.0.0.1:${PORT}/json/close/${target.id}`);
}

(async () => {
  const chrome = await launchChromium();
  try {
    console.log('Capturing Desktop Ch1...');
    await capture('http://127.0.0.1:8765/', '/tmp/test_blackhole_desktop.png', 1280, 720, 1, 0);

    console.log('Capturing Desktop Ch2...');
    await capture('http://127.0.0.1:8765/', '/tmp/test_blackhole_ch2.png', 1280, 720, 1, 1);

    console.log('Capturing Desktop Ch3...');
    await capture('http://127.0.0.1:8765/', '/tmp/test_blackhole_ch3.png', 1280, 720, 1, 2);

    console.log('Capturing Mobile Ch1...');
    await capture('http://127.0.0.1:8765/', '/tmp/test_blackhole_mobile.png', 360, 740, 2, 0);

    console.log('All captures done!');
  } finally {
    chrome.kill();
  }
})();
