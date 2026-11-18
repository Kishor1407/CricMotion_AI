const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  // 1. Login
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.type('input[type="email"]', 'qa_user@cricmotion.ai');
  await page.type('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');

  // Wait for login and navigation to dashboard
  await page.waitForFunction(() => !!localStorage.getItem('cricmotion_token'), { timeout: 10000 });
  await new Promise(r => setTimeout(r, 1500));
  console.log('Logged in successfully. Current URL:', page.url());

  // 2. Go to workspace
  await page.goto('http://localhost:5173/workspace', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  console.log('Navigated to workspace. Current URL:', page.url());

  // Inspect elements on workspace
  const workspaceData = await page.evaluate(() => {
    const pills = Array.from(document.querySelectorAll('button')).filter(b => /30s|45s|60s|90s/i.test(b.innerText || ''));
    const textarea = document.querySelector('textarea, input[placeholder*="Prompt"], input[placeholder*="Ask"]');
    const videos = Array.from(document.querySelectorAll('video'));
    const audios = Array.from(document.querySelectorAll('audio'));
    const remotionToggle = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('REMOTION') || b.innerText.includes('LAYERS'));
    const playerWrapper = document.querySelector('[style*="aspect-ratio"], .aspect-\\[9\\/16\\]');
    const scrubber = document.querySelector('input[type="range"]');

    return {
      pills: pills.map(p => p.innerText.trim()),
      hasTextarea: !!textarea,
      videoCount: videos.length,
      audioCount: audios.length,
      toggleButtons: remotionToggle.map(b => b.innerText.trim()),
      hasPlayerWrapper: !!playerWrapper,
      hasScrubber: !!scrubber,
      bodyTextSnippet: document.body.innerText.substring(0, 400)
    };
  });

  console.log('Workspace Inspection:\n', JSON.stringify(workspaceData, null, 2));
  await browser.close();
})();
