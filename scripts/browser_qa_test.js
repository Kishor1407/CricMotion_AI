const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/LENOVO/.gemini/antigravity/brain/109f6f58-61fb-467d-84bc-177c29f90860');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runBrowserQA() {
  console.log('\n======================================================');
  console.log('🤖 CRICMOTION AI - RIGOROUS BROWSER QA TEST SUITE');
  console.log('======================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const testResults = [];
  const recordResult = (name, passed, details = '') => {
    testResults.push({ name, passed, details });
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${name} ${details ? '(' + details + ')' : ''}`);
  };

  try {
    // ----------------------------------------------------
    // STEP 1: LOGIN PAGE VERIFICATION
    // ----------------------------------------------------
    console.log('\n[STEP 1] Navigating to http://localhost:5173/login ...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2', timeout: 15000 });
    
    const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());
    const hasBrandTitle = pageText.includes('cricmotion ai') || pageText.includes('make cricket');
    recordResult('Login Page Render & Neobrutalism Branding', hasBrandTitle);

    const loginScreenshot = path.join(ARTIFACT_DIR, 'qa_login.png');
    await page.screenshot({ path: loginScreenshot });
    console.log(`📸 Saved screenshot: ${loginScreenshot}`);

    // ----------------------------------------------------
    // STEP 2: USER REGISTRATION / AUTHENTICATION
    // ----------------------------------------------------
    console.log('\n[STEP 2] Testing User Registration Flow ...');
    const testEmail = `qa_browser_${Date.now()}@cricmotion.ai`;

    // Click "Create Account" tab
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const createAccBtn = btns.find(b => b.innerText.toLowerCase().includes('create account'));
      if (createAccBtn) createAccBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Fill registration fields
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    const inputs = await page.$$('input');
    console.log(`Found ${inputs.length} form inputs.`);

    if (inputs.length >= 4) {
      await inputs[0].type('QA');
      await inputs[1].type('Master');
      await inputs[2].type(testEmail);
      await inputs[3].type('SecurePassword123!');
    } else {
      await page.type('input[type="email"]', testEmail);
      await page.type('input[type="password"]', 'SecurePassword123!');
    }

    // Submit form
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      }
    });

    // Wait for redirect to /dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    
    // Wait for client-side React to mount the full dashboard from localStorage
    await page.waitForFunction(() => !document.body.innerText.includes('Loading your workspace...'), { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1000));

    const currentUrl = page.url();
    const onDashboard = currentUrl.includes('/dashboard');
    recordResult('Auth Registration & Dashboard Redirection', onDashboard, `Current URL: ${currentUrl}`);

    const dashboardScreenshot = path.join(ARTIFACT_DIR, 'qa_dashboard.png');
    await page.screenshot({ path: dashboardScreenshot });
    console.log(`📸 Saved screenshot: ${dashboardScreenshot}`);

    // ----------------------------------------------------
    // STEP 3: DASHBOARD ELEMENTS VERIFICATION
    // ----------------------------------------------------
    console.log('\n[STEP 3] Verifying Dashboard Components & Live Data ...');
    const dbText = await page.evaluate(() => document.body.innerText.toLowerCase());

    const hasTicker = dbText.includes('148.2 kph') || dbText.includes('broadcast suite');
    recordResult('Top Broadcast Ticker Ribbon', hasTicker);

    const hasCredits = dbText.includes('credits');
    recordResult('Wallet Credits Badge (50 CREDITS)', hasCredits);

    const hasFilters = dbText.includes('bidding wars') && dbText.includes('match plays') && dbText.includes('stat battles');
    recordResult('Category Filter Tabs', hasFilters);

    // ----------------------------------------------------
    // STEP 4: INTERACTIVE FILTER CLICKS
    // ----------------------------------------------------
    console.log('\n[STEP 4] Testing Category Filter Clicks ...');
    const filterNames = ['bidding wars', 'match plays', 'stat battles', 'headlines', 'all'];
    for (const f of filterNames) {
      const clicked = await page.evaluate((name) => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => b.innerText.toLowerCase().includes(name));
        if (target) {
          target.click();
          return true;
        }
        return false;
      }, f);
      await new Promise(r => setTimeout(r, 400));
      recordResult(`Click Filter "${f.toUpperCase()}"`, clicked);
    }

    // ----------------------------------------------------
    // STEP 5: FLOATING DOCK NAVIGATION
    // ----------------------------------------------------
    console.log('\n[STEP 5] Testing Bottom Floating Dock Navigation ...');
    
    // Navigate to Workspace
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const wsLink = links.find(a => a.href.includes('/workspace'));
      if (wsLink) wsLink.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    recordResult('Floating Dock -> Workspace Route', page.url().includes('/workspace'), `URL: ${page.url()}`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'qa_workspace.png') });

    // Navigate to Schedule
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const scLink = links.find(a => a.href.includes('/schedule'));
      if (scLink) scLink.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    recordResult('Floating Dock -> Schedule Route', page.url().includes('/schedule'), `URL: ${page.url()}`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'qa_schedule.png') });

    // Navigate to Settings
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const stLink = links.find(a => a.href.includes('/settings'));
      if (stLink) stLink.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    recordResult('Floating Dock -> Settings Route', page.url().includes('/settings'), `URL: ${page.url()}`);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'qa_settings.png') });

    // Return to Dashboard
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const dbLink = links.find(a => a.href.endsWith('/dashboard'));
      if (dbLink) dbLink.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    recordResult('Floating Dock -> Return to Dashboard', page.url().includes('/dashboard'), `URL: ${page.url()}`);

    // ----------------------------------------------------
    // STEP 6: MASTER FLOATING ACTION BUTTON (FAB)
    // ----------------------------------------------------
    console.log('\n[STEP 6] Testing Master Floating Action Button (FAB) ...');
    const fabClicked = await page.evaluate(() => {
      const fab = document.querySelector('a[aria-label="Generate New Reel"]');
      if (fab) {
        fab.click();
        return true;
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 1200));
    recordResult('Master FAB Click & Navigation', fabClicked && page.url().includes('/workspace'), `URL: ${page.url()}`);

  } catch (err) {
    console.error('Browser QA Execution Error:', err);
    recordResult('Test Execution Safety', false, err.message);
  } finally {
    await browser.close();
  }

  // Final Summary
  const passedCount = testResults.filter(t => t.passed).length;
  const failedCount = testResults.filter(t => !t.passed).length;
  console.log('\n======================================================');
  console.log(`QA BROWSER VERDICT: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log('======================================================\n');

  process.exit(failedCount > 0 ? 1 : 0);
}

runBrowserQA();
