// 用法: NODE_PATH=$(npm root -g) node verify/check.cjs <url>
// 上傳實照 fixture → 去背結果透明比例合理、主體保留;白底模式無透明像素;手機無橫捲
const { chromium, devices } = require('playwright');
const path = require('path');

const FIXTURE = path.join(__dirname, 'fixtures', 'animal.jpg');

(async () => {
  const url = process.argv[2] || 'http://localhost:8005/';
  const opts = process.env.PW_CHANNEL === 'none' ? {} : { channel: 'chrome' };
  const browser = await chromium.launch(opts);

  const page = await (await browser.newContext({ viewport: { width: 1280, height: 1000 } })).newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.setInputFiles('#file', FIXTURE);
  await page.waitForFunction(
    () => document.getElementById('status').classList.contains('ok')
      && document.getElementById('status').textContent.includes('AI 模式'), // 照片必須走 ML 路徑
    null, { timeout: 180000 } // 首次含模型下載+推論
  );
  const stats = await page.evaluate(() => {
    const cv = document.getElementById('result');
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    let transparent = 0, opaque = 0;
    const n = cv.width * cv.height;
    for (let i = 0; i < n; i++) {
      const a = d[i * 4 + 3];
      if (a < 16) transparent++;
      else if (a > 240) opaque++;
    }
    return { n, tRatio: transparent / n, oRatio: opaque / n };
  });
  const maskOk = stats.tRatio > 0.05 && stats.tRatio < 0.95 && stats.oRatio > 0.05;

  // 白底模式:不應再有透明像素
  await page.check('input[name=bgmode][value=white]');
  await page.waitForTimeout(800);
  const whiteOk = await page.evaluate(() => {
    const cv = document.getElementById('result');
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    for (let i = 3; i < d.length; i += 4) if (d[i] < 250) return false;
    return true;
  });

  // 色鍵模式:合成單色背景圖(綠底紅圓),自動判斷應走色鍵且切割乾淨
  await page.check('input[name=bgmode][value=transparent]');
  await page.check('input[name=method][value=auto]');
  const pngB64 = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 400; c.height = 300;
    const x = c.getContext('2d');
    x.fillStyle = '#22c55e'; x.fillRect(0, 0, 400, 300);
    x.fillStyle = '#7c2d12'; x.beginPath(); x.arc(200, 150, 80, 0, Math.PI * 2); x.fill();
    return c.toDataURL('image/png').split(',')[1];
  });
  await page.setInputFiles('#file', { name: 'solid.png', mimeType: 'image/png', buffer: Buffer.from(pngB64, 'base64') });
  await page.waitForFunction(
    () => document.getElementById('status').classList.contains('ok')
      && document.getElementById('status').textContent.includes('色鍵'),
    null, { timeout: 30000 }
  );
  const chroma = await page.evaluate(() => {
    const cv = document.getElementById('result');
    const cx = cv.getContext('2d');
    const a = (x, y) => cx.getImageData(x, y, 1, 1).data[3];
    const d = cx.getImageData(0, 0, cv.width, cv.height).data;
    let transparent = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] < 16) transparent++;
    return {
      corners: [a(2, 2), a(cv.width - 3, 2), a(2, cv.height - 3), a(cv.width - 3, cv.height - 3)],
      center: a(200, 150),
      tRatio: transparent / (cv.width * cv.height),
    };
  });
  const chromaOk = chroma.corners.every((v) => v === 0) && chroma.center === 255 && chroma.tRatio > 0.5;

  // 手機
  const m = await (await browser.newContext({ ...devices['iPhone 13'] })).newPage();
  await m.goto(url, { waitUntil: 'domcontentloaded' });
  const hscroll = await m.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);

  console.log(JSON.stringify({ ...stats, maskOk, whiteOk, chroma, chromaOk, hscroll }));
  await browser.close();
  if (!maskOk || !whiteOk || !chromaOk || hscroll) process.exit(1);
})().catch((e) => { console.error(e.message); process.exit(1); });
