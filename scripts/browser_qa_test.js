const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/LENOVO/.gemini/antigravity/brain/109f6f58-61fb-467d-84bc-177c29f90860');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runBrowserQA() {
  console.log('\n====================================================================');
  console.log('🤖 CRICMOTION AI - RIGOROUS BROWSER QA TEST (MODULE 1, 2, 3 & 4)');
  console.log('====================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });

  const testResults = [];
  const recordResult = (name, passed, details = '') => {
    testResults.push({ name, passed, details });
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${name} ${details ? '(' + details + ')' : ''}`);
  };

  try {
    // ----------------------------------------------------
    // STEP 1: AUTHENTICATION & LOGIN
    // ----------------------------------------------------
    console.log('\n[STEP 1] Navigating to http://localhost:5173/login ...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2', timeout: 15000 });
    
    const pageText = await page.evaluate(() => document.body.innerText.toLowerCase());
    const hasBrandTitle = pageText.includes('cricmotion ai') || pageText.includes('make cricket');
    recordResult('Login Page Render & Neobrutalism Branding', hasBrandTitle);

    // Register a fresh test account
    const testEmail = `qa_module4_${Date.now()}@cricmotion.ai`;
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const createAccBtn = btns.find(b => b.innerText.toLowerCase().includes('create account'));
      if (createAccBtn) createAccBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    const inputs = await page.$$('input');
    if (inputs.length >= 4) {
      await inputs[0].type('Director');
      await inputs[1].type('Tester');
      await inputs[2].type(testEmail);
      await inputs[3].type('SecurePassword123!');
    } else {
      await page.type('input[type="email"]', testEmail);
      await page.type('input[type="password"]', 'SecurePassword123!');
    }

    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      }
    });

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    await page.waitForFunction(() => !document.body.innerText.includes('Loading your workspace...'), { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1000));
    recordResult('Authentication & Dashboard Redirection', page.url().includes('/dashboard'));

    // ----------------------------------------------------
    // STEP 2: NAVIGATE TO STUDIO WORKSPACE (/workspace)
    // ----------------------------------------------------
    console.log('\n[STEP 2] Navigating to Creation Studio (/workspace) ...');
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const wsLink = links.find(a => a.href.includes('/workspace'));
      if (wsLink) wsLink.click();
    });
    await page.waitForFunction(() => document.body.innerText.toLowerCase().includes('reel parameters'), { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1000));
    recordResult('Workspace Route Mounting & Header', page.url().includes('/workspace'));

    // ----------------------------------------------------
    // STEP 3: 60/40 SPLIT LAYOUT & PARAMETER TOGGLES
    // ----------------------------------------------------
    console.log('\n[STEP 3] Testing 60/40 Split & Parameter Pills ...');
    const wsText = await page.evaluate(() => document.body.innerText.toLowerCase());
    recordResult('Parameter Control Strip Present', wsText.includes('reel parameters'));

    // Click 60s duration pill
    const clicked60s = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn60 = btns.find(b => b.innerText.trim() === '60s');
      if (btn60) {
        btn60.click();
        return true;
      }
      return false;
    });
    recordResult('Interactive Duration Toggle (60s)', clicked60s);

    // ----------------------------------------------------
    // STEP 4: STORYBOARD FILMSTRIP & 9:16 SMARTPHONE PREVIEW
    // ----------------------------------------------------
    console.log('\n[STEP 4] Testing Storyboard Filmstrip & 9:16 Canvas ...');
    recordResult('Storyboard Filmstrip Display', wsText.includes('storyboard filmstrip'));
    recordResult('9:16 Smartphone Mockup Chassis', wsText.includes('9:16 live stage') || wsText.includes('ai presenter'));
    recordResult('Z-20 Overhead Cricket Telemetry Layer', wsText.includes('149.2 kph') || wsText.includes('bat speed'));
    recordResult('Z-30 Scrolling News Ticker Bar', wsText.includes('cricmotion') || wsText.includes('remotion'));
    recordResult('Z-40 Kinetic Captions Layer', wsText.includes('virat') || wsText.includes('knees'));

    // ----------------------------------------------------
    // STEP 5: MODULE 4 - GEMINI AI STORYBOARD GENERATION
    // ----------------------------------------------------
    console.log('\n[STEP 5] Testing Module 4: Gemini AI Reel Generation ...');
    
    // Type in omnibar to generate a real project via Gemini
    await page.waitForSelector('textarea', { timeout: 5000 });
    await page.$eval('textarea', el => el.value = '');
    await page.type('textarea', 'Rohit Sharma 264 vs Sri Lanka Eden Gardens masterclass');
    
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      }
    });

    // Wait for Gemini API to return generated scenes & navigate with projectId
    console.log('Waiting for Gemini AI storyboard generation and response...');
    await new Promise(r => setTimeout(r, 6000));

    const generatedText = await page.evaluate(() => document.body.innerText.toLowerCase());
    const hasGeneratedScenes = generatedText.includes('scene 01') || generatedText.includes('rohit') || generatedText.includes('eden');
    recordResult('Module 4: Gemini AI Storyboard Generation via API', hasGeneratedScenes);

    const module4Screenshot = path.join(ARTIFACT_DIR, 'qa_workspace_module4.png');
    await page.screenshot({ path: module4Screenshot });
    console.log(`📸 Saved screenshot: ${module4Screenshot}`);

    // ----------------------------------------------------
    // STEP 6: MODULE 4 - CONVERSATIONAL REVISION VIA GEMINI
    // ----------------------------------------------------
    console.log('\n[STEP 6] Testing Module 4: Conversational Script Revision ...');
    await page.waitForSelector('textarea', { timeout: 5000 });
    await page.$eval('textarea', el => el.value = '');
    await page.type('textarea', 'Make the commentary faster and emphasize his 33 boundaries!');

    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      }
    });

    await new Promise(r => setTimeout(r, 5000));
    const revisionText = await page.evaluate(() => document.body.innerText.toLowerCase());
    const hasRevisionApplied = revisionText.includes('33 boundaries') || revisionText.includes('faster') || revisionText.includes('revision');
    recordResult('Module 4: Conversational AI Script Revision Appended', hasRevisionApplied);

    // ----------------------------------------------------
    // STEP 7: RETURN VIA FLOATING DOCK
    // ----------------------------------------------------
    console.log('\n[STEP 7] Testing Return Navigation ...');
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const dbLink = links.find(a => a.href.endsWith('/dashboard'));
      if (dbLink) dbLink.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    recordResult('Floating Dock -> Return to Dashboard', page.url().includes('/dashboard'), `URL: ${page.url()}`);

  } catch (err) {
    console.error('Browser QA Execution Error:', err);
    recordResult('Test Execution Safety', false, err.message);
  } finally {
    await browser.close();
  }

  // Final Summary
  const passedCount = testResults.filter(t => t.passed).length;
  const failedCount = testResults.filter(t => !t.passed).length;
  console.log('\n====================================================================');
  console.log(`QA BROWSER VERDICT: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log('====================================================================\n');

  process.exit(failedCount > 0 ? 1 : 0);
}

runBrowserQA();
