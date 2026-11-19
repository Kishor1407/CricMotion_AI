const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  // Login first
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.type('input[type="email"]', 'qa_user@cricmotion.ai');
  await page.type('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => !!localStorage.getItem('cricmotion_token'));
  await new Promise(r => setTimeout(r, 1200));

  // Navigate to clean /workspace
  await page.goto('http://localhost:5173/workspace', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  const state = await page.evaluate(() => {
    return {
      title: document.querySelector('header span')?.innerText,
      status: document.querySelector('header span:nth-of-type(2)')?.innerText,
      filmstripEmpty: document.body.innerText.includes('Enter a cricket prompt below to generate your multi-scene storyboard'),
      chatEmpty: document.body.innerText.includes('Studio dialogue is empty'),
      readyToCreate: document.body.innerText.includes('Ready to Create'),
    };
  });

  console.log('Clean Workspace State:', JSON.stringify(state, null, 2));

  await page.screenshot({ path: 'C:/Users/LENOVO/.gemini/antigravity/brain/109f6f58-61fb-467d-84bc-177c29f90860/qa_clean_workspace.png' });
  await browser.close();
})();
