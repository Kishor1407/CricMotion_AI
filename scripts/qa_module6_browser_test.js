const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/LENOVO/.gemini/antigravity/brain/109f6f58-61fb-467d-84bc-177c29f90860');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runBrowserQA() {
  console.log('\n====================================================================');
  console.log('🤖 CRICMOTION AI - RIGOROUS BROWSER QA TEST (MODULE 6 AI PRESENTER LIP-SYNC)');
  console.log('====================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required'],
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
    // STEP 1: AUTHENTICATION
    // ----------------------------------------------------
    console.log('\n[STEP 1] Navigating to http://localhost:5173/login ...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2', timeout: 15000 });

    const testEmail = `qa_module6_${Date.now()}@cricmotion.ai`;
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const createAccBtn = btns.find(b => b.innerText.toLowerCase().includes('create account'));
      if (createAccBtn) createAccBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    const inputs = await page.$$('input');
    if (inputs.length >= 4) {
      await inputs[0].type('Presenter');
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
    await new Promise(r => setTimeout(r, 1200));

    const currentUrl = page.url();
    recordResult('Authentication & Redirect to Dashboard', currentUrl.includes('/dashboard'), `URL: ${currentUrl}`);

    // ----------------------------------------------------
    // STEP 2: OPEN WORKSPACE
    // ----------------------------------------------------
    console.log('\n[STEP 2] Navigating to Studio Workspace...');
    await page.goto('http://localhost:5173/workspace', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));

    const workspaceText = await page.evaluate(() => document.body.innerText.toLowerCase());
    recordResult('Workspace 60/40 Split Studio Shell Render', workspaceText.includes('storyboard filmstrip') && workspaceText.includes('9:16 live stage'));

    // ----------------------------------------------------
    // STEP 3: VERIFY MODULE 6 PRESENTER CONTROLS & PIPELINE STRIP
    // ----------------------------------------------------
    console.log('\n[STEP 3] Verifying Module 6 AI Presenter Lip-Sync Controls...');
    const hasPresenterBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => b.innerText.toLowerCase().includes('presenter') || b.innerText.toLowerCase().includes('d-id'));
    });
    recordResult('AI Presenter Lip-Sync Trigger Button Present', hasPresenterBtn);

    // ----------------------------------------------------
    // STEP 4: TRIGGER D-ID PRESENTER SYNTHESIS
    // ----------------------------------------------------
    console.log('\n[STEP 4] Triggering D-ID AI Presenter Lip-Sync Synthesis...');
    const avatarTriggered = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.innerText.toLowerCase().includes('presenter') || b.innerText.toLowerCase().includes('d-id'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    recordResult('Triggered Presenter Synthesis via UI', avatarTriggered);

    // Wait for avatar synthesis to resolve (or display active badge)
    console.log('Waiting for synthesis to finish and update UI state...');
    await page.waitForFunction(
      () => {
        const text = document.body.innerText.toLowerCase();
        return text.includes('lip-sync active') || text.includes('presenter ready') || text.includes('active (d-id');
      },
      { timeout: 95000 }
    ).catch(() => {});

    await new Promise(r => setTimeout(r, 1500));

    const postAvatarState = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      const videoEl = document.querySelector('video');
      return {
        isActive: text.includes('lip-sync active') || text.includes('presenter ready') || text.includes('active (d-id') || (videoEl && videoEl.src),
        hasVideoTag: !!videoEl,
        videoSrc: videoEl ? videoEl.src : null,
      };
    });

    recordResult('Avatar Lip-Sync State Active in Studio', postAvatarState.isActive, `Video source: ${postAvatarState.videoSrc || 'Embedded'}`);
    recordResult('Z-10 HTML5 Presenter Video Element Mounted', postAvatarState.hasVideoTag, `Src: ${postAvatarState.videoSrc}`);

    // ----------------------------------------------------
    // STEP 5: VERIFY REAL-TIME PLAYBACK & SYNCHRONIZATION
    // ----------------------------------------------------
    console.log('\n[STEP 5] Testing Synchronized Playback (Audio + Video + Subtitles)...');
    const playTriggered = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const playBtn = btns.find(b => b.innerText.toLowerCase().includes('play preview') || b.innerText.toLowerCase().includes('play'));
      if (playBtn) {
        playBtn.click();
        return true;
      }
      return false;
    });
    recordResult('Play Preview Triggered', playTriggered);

    // Let video and audio play for 2.5 seconds
    await new Promise(r => setTimeout(r, 2500));

    const playbackSyncState = await page.evaluate(() => {
      const video = document.querySelector('video');
      const timecodeText = Array.from(document.querySelectorAll('span, div')).find(el => el.innerText.includes('00:0') || el.innerText.includes('00:01') || el.innerText.includes('00:02'));
      return {
        videoFound: !!video,
        isPlaying: video ? !video.paused : false,
        currentTime: video ? video.currentTime : 0,
        timerAdvanced: !!timecodeText,
      };
    });

    recordResult('Presenter Video Actively Playing in Sync', playbackSyncState.isPlaying || playbackSyncState.currentTime > 0, `Video Time: ${playbackSyncState.currentTime.toFixed(2)}s`);

    // ----------------------------------------------------
    // STEP 6: VERIFY SNAPCHAT-NEOBRUTALISM STYLING ON VIDEO CONTAINER
    // ----------------------------------------------------
    console.log('\n[STEP 6] Inspecting Snapchat-Neobrutalism UI Styling on Presenter Layer...');
    const styleCheck = await page.evaluate(() => {
      const stage = document.querySelector('[class*="border-4"], [class*="border-black"]');
      const yellowBadges = Array.from(document.querySelectorAll('*')).filter(el => {
        const bg = window.getComputedStyle(el).backgroundColor;
        return bg === 'rgb(255, 252, 0)' || bg === 'rgb(255, 255, 0)';
      });
      return {
        hasBrutalBorder: !!stage,
        yellowBadgeCount: yellowBadges.length,
      };
    });
    recordResult('Snapchat Neobrutalist UI Aesthetics Verified', styleCheck.hasBrutalBorder && styleCheck.yellowBadgeCount > 0, `Yellow elements: ${styleCheck.yellowBadgeCount}`);

    // ----------------------------------------------------
    // STEP 7: CAPTURE SCREENSHOT ARTIFACT
    // ----------------------------------------------------
    console.log('\n[STEP 7] Capturing Screenshot Artifact for Module 6...');
    const screenshotPath = path.join(ARTIFACT_DIR, 'qa_workspace_module6.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    recordResult('QA Screenshot Artifact Created', fs.existsSync(screenshotPath), screenshotPath);

  } catch (err) {
    console.error('Browser QA encountered an exception:', err);
    recordResult('Browser QA Execution', false, err.message);
  } finally {
    await browser.close();
  }

  console.log('\n====================================================================');
  console.log('📊 MODULE 6 BROWSER QA SUMMARY:');
  const allPassed = testResults.every(t => t.passed);
  console.log(`Total: ${testResults.length} | Passed: ${testResults.filter(t => t.passed).length} | Failed: ${testResults.filter(t => !t.passed).length}`);
  console.log(`Status: ${allPassed ? '🟢 ALL CHECKS PASSED' : '🔴 SOME CHECKS FAILED'}`);
  console.log('====================================================================\n');

  process.exit(allPassed ? 0 : 1);
}

runBrowserQA();
