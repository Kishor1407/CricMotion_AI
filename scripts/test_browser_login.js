const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('requestfailed', req => console.log('REQ FAILED:', req.url(), req.failure().errorText));
  page.on('response', res => {
    if (res.url().includes('/auth') || res.url().includes('5050')) {
      console.log('NETWORK RES:', res.url(), res.status());
    }
  });

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.type('input[type="email"]', 'qa_user@cricmotion.ai');
  await page.type('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');

  await new Promise(r => setTimeout(r, 2500));

  const state = await page.evaluate(() => {
    return {
      url: window.location.href,
      token: localStorage.getItem('cricmotion_token'),
      user: localStorage.getItem('cricmotion_user'),
      bodyText: document.body.innerText.substring(0, 300)
    };
  });

  console.log('Final state:', JSON.stringify(state, null, 2));
  await browser.close();
})();
