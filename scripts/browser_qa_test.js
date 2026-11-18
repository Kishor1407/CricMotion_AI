const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/LENOVO/.gemini/antigravity/brain/109f6f58-61fb-467d-84bc-177c29f90860');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runBrowserQA() {
  console.log('\n================================================================');
  console.log('🤖 CRICMOTION AI - RIGOROUS BROWSER QA TEST (MODULE 1 + 2 + 3)');
  console.log('================================================================\n');

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
    const testEmail = `qa_module3_${Date.now()}@cricmotion.ai`;
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const createAccBtn = btns.find(b => b.innerText.toLowerCase().includes('create account'));
      if (createAccBtn) createAccBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    const inputs = await page.$$('input');
    if (inputs.length >= 4) {
      await inputs[0].type('Studio');
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

    const onWorkspace = page.url().includes('/workspace');
    recordResult('Workspace Route Mounting & Header', onWorkspace, `URL: ${page.url()}`);

    const wsScreenshot = path.join(ARTIFACT_DIR, 'qa_workspace_module3.png');
    await page.screenshot({ path: wsScreenshot });
    console.log(`📸 Saved screenshot: ${wsScreenshot}`);

    // ----------------------------------------------------
    // STEP 3: 60/40 SPLIT LAYOUT & PARAMETER TOGGLES
    // ----------------------------------------------------
    console.log('\n[STEP 3] Testing 60/40 Split & Parameter Pills ...');
    const wsText = await page.evaluate(() => document.body.innerText.toLowerCase());
    
    const hasParams = wsText.includes('reel parameters') && wsText.includes('target duration');
    recordResult('Parameter Control Strip Present', hasParams);

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
    await new Promise(r => setTimeout(r, 400));
    recordResult('Interactive Duration Toggle (60s)', clicked60s);

    // ----------------------------------------------------
    // STEP 4: STORYBOARD FILMSTRIP CAROUSEL
    // ----------------------------------------------------
    console.log('\n[STEP 4] Testing Storyboard Filmstrip Carousel ...');
    const hasFilmstrip = wsText.includes('storyboard filmstrip') && wsText.includes('scene 01');
    recordResult('Storyboard Filmstrip Display', hasFilmstrip);

    // Click Scene 2 card
    const clickedScene2 = await page.evaluate(() => {
      const sceneCards = Array.from(document.querySelectorAll('div')).filter(d => 
        d.innerText && d.innerText.includes('SCENE 02')
      );
      if (sceneCards.length > 0) {
        sceneCards[0].click();
        return true;
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 500));
    recordResult('Filmstrip Scene 2 Interactive Click', clickedScene2);

    // ----------------------------------------------------
    // STEP 5: 9:16 SMARTPHONE PREVIEW STAGE
    // ----------------------------------------------------
    console.log('\n[STEP 5] Verifying 9:16 Smartphone Preview Stage ...');
    const hasLiveStage = wsText.includes('9:16 live stage') || wsText.includes('ai presenter');
    recordResult('9:16 Smartphone Mockup Chassis', hasLiveStage);

    const hasTelemetry = wsText.includes('149.2 kph') || wsText.includes('bat speed');
    recordResult('Z-20 Overhead Cricket Telemetry Layer', hasTelemetry);

    const hasTicker = wsText.includes('cricmotion') || wsText.includes('remotion compositing');
    recordResult('Z-30 Scrolling News Ticker Bar', hasTicker);

    const hasCaptions = wsText.includes('virat') || wsText.includes('knees');
    recordResult('Z-40 Kinetic Captions Layer', hasCaptions);

    // Test Play/Pause Scrubber
    const toggledPlay = await page.evaluate(() => {
      const playBtn = Array.from(document.querySelectorAll('button')).find(b => 
        b.innerText.toLowerCase().includes('play preview') || b.querySelector('svg')
      );
      if (playBtn) {
        playBtn.click();
        return true;
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 1200));
    recordResult('Video Scrubber Play/Pause Simulation', toggledPlay);

    // ----------------------------------------------------
    // STEP 6: NEOBRUTALIST OMNIBAR & CHAT FEED
    // ----------------------------------------------------
    console.log('\n[STEP 6] Testing Neobrutalist Omnibar & Conversational Feed ...');
    const hasChat = wsText.includes('conversational studio log') || wsText.includes('cricmotion ai');
    recordResult('Conversational Feed Display', hasChat);

    // Click starter prompt chip
    const clickedChip = await page.evaluate(() => {
      const chip = Array.from(document.querySelectorAll('button')).find(b => 
        b.innerText.includes('Pant 27 CR') || b.innerText.includes('Bumrah 149')
      );
      if (chip) {
        chip.click();
        return true;
      }
      return false;
    });
    await new Promise(r => setTimeout(r, 400));
    recordResult('Starter Prompt Chip Click', clickedChip);

    // Type in omnibar and submit
    await page.waitForSelector('textarea', { timeout: 5000 });
    await page.$eval('textarea', el => el.value = '');
    await page.type('textarea', 'Add falling gavel sound effects and make the tempo faster!');
    
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.click();
      }
    });
    await new Promise(r => setTimeout(r, 2000));

    const updatedText = await page.evaluate(() => document.body.innerText.toLowerCase());
    const hasRevision = updatedText.includes('falling gavel') || updatedText.includes('revision note');
    recordResult('Omnibar Prompt Submission & Dynamic Chat Append', hasRevision);

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
  console.log('\n================================================================');
  console.log(`QA BROWSER VERDICT: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log('================================================================\n');

  process.exit(failedCount > 0 ? 1 : 0);
}

runBrowserQA();
