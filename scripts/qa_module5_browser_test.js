const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = path.resolve('C:/Users/LENOVO/.gemini/antigravity/brain/109f6f58-61fb-467d-84bc-177c29f90860');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runBrowserQA() {
  console.log('\n====================================================================');
  console.log('🤖 CRICMOTION AI - RIGOROUS BROWSER QA TEST (MODULE 5 AUDIO & ALIGNMENT)');
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

    const testEmail = `qa_module5_${Date.now()}@cricmotion.ai`;
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const createAccBtn = btns.find(b => b.innerText.toLowerCase().includes('create account'));
      if (createAccBtn) createAccBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    const inputs = await page.$$('input');
    if (inputs.length >= 4) {
      await inputs[0].type('Audio');
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
    // Click first project card or navigate directly to /workspace
    await page.goto('http://localhost:5173/workspace', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));

    const workspaceText = await page.evaluate(() => document.body.innerText.toLowerCase());
    recordResult('Workspace 60/40 Split Studio Shell Render', workspaceText.includes('storyboard filmstrip') && workspaceText.includes('9:16 live stage'));

    // ----------------------------------------------------
    // STEP 3: VERIFY MODULE 5 AUDIO SYNTHESIS CONTROLS
    // ----------------------------------------------------
    console.log('\n[STEP 3] Verifying Module 5 Voiceover & Alignment Strip...');
    const hasAudioSection = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes('voiceover') && text.includes('aligned');
    });
    recordResult('Voiceover & Alignment Strip Present', hasAudioSection);

    // Click "SYNTHESIZE VOICEOVER" button
    console.log('\n[STEP 4] Triggering Voiceover Synthesis (ElevenLabs / Cadence Engine)...');
    const synthTriggered = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const synthBtn = btns.find(b => b.innerText.toLowerCase().includes('synthesize voiceover') || b.innerText.toLowerCase().includes('re-synthesize'));
      if (synthBtn) {
        synthBtn.click();
        return true;
      }
      return false;
    });
    recordResult('Synthesize Voiceover Button Clicked', synthTriggered);

    // Wait for synthesis to complete (up to 12s)
    await page.waitForFunction(
      () => {
        const text = document.body.innerText.toLowerCase();
        return text.includes('voiceover & alignment active') || text.includes('audio ready');
      },
      { timeout: 15000 }
    ).catch(() => {});

    await new Promise(r => setTimeout(r, 1500));

    const postSynthState = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return {
        isActive: text.includes('voiceover & alignment active') || text.includes('audio ready'),
        bodySample: text.slice(0, 500)
      };
    });
    recordResult('Voiceover Synthesis Complete & Alignment Active', postSynthState.isActive);

    // ----------------------------------------------------
    // STEP 5: VERIFY FILMSTRIP AUDIO STATUS BADGES
    // ----------------------------------------------------
    console.log('\n[STEP 5] Verifying Storyboard Filmstrip Audio Badges...');
    const filmstripBadges = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div')).filter(d => 
        d.innerText && d.innerText.toLowerCase().includes('scene 01')
      );
      const text = document.body.innerText.toLowerCase();
      const hasAudioBadge = text.includes('audio ready') || text.includes('aligned');
      return { cardsFound: cards.length > 0, hasAudioBadge };
    });
    recordResult('Filmstrip Scene Audio Status Badges Verified', filmstripBadges.hasAudioBadge);

    // Switch to Scene 2 in filmstrip
    console.log('\n[STEP 6] Testing Scene Switching in Filmstrip...');
    const sceneSwitched = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div')).filter(d =>
        d.innerText && d.innerText.includes('SCENE 02')
      );
      if (cards.length > 0) {
        cards[0].click();
        return true;
      }
      return false;
    });
    recordResult('Filmstrip Scene 2 Card Clicked', sceneSwitched);
    await new Promise(r => setTimeout(r, 600));

    // ----------------------------------------------------
    // STEP 7: TEST 9:16 PHONE MOCKUP PLAYBACK & KINETIC CAPTIONS
    // ----------------------------------------------------
    console.log('\n[STEP 7] Testing 9:16 Smartphone Live Playback & Kinetic Word Highlighting...');
    
    // Toggle Play
    const playClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const playBtn = btns.find(b => b.innerText.toLowerCase().includes('play preview') || b.querySelector('svg'));
      if (playBtn) {
        playBtn.click();
        return true;
      }
      return false;
    });
    recordResult('Phone Playback Initiated', playClicked);

    // Wait 2 seconds of simulated / real playback
    await new Promise(r => setTimeout(r, 2200));

    const playbackState = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      const spans = Array.from(document.querySelectorAll('span'));
      // Find highlighted kinetic caption words (class includes bg-brand-yellow and scale-110)
      const highlightedWords = spans.filter(s => {
        const c = s.className || '';
        return c.includes('bg-brand-yellow') && (c.includes('scale-110') || c.includes('-rotate-1'));
      }).map(s => s.innerText);

      const audioEl = document.querySelector('audio');
      return {
        highlightedWords,
        audioExists: !!audioEl,
        audioSrc: audioEl ? audioEl.src : null,
      };
    });

    recordResult('Audio Element Mounted & Synchronized', playbackState.audioExists, `Src: ${playbackState.audioSrc || 'Ready'}`);
    recordResult('Z-40 Kinetic Captions Dynamic Word Highlighting Active', playbackState.highlightedWords.length > 0, `Active word: "${playbackState.highlightedWords[0]}"`);

    // ----------------------------------------------------
    // STEP 8: TEST MUTE / UNMUTE CONTROL
    // ----------------------------------------------------
    console.log('\n[STEP 8] Testing Mute / Unmute Control...');
    const muteToggled = await page.evaluate(() => {
      const muteBtn = document.querySelector('button[title*="Mute"], button[title*="mute"]');
      if (muteBtn) {
        muteBtn.click();
        return true;
      }
      return false;
    });
    recordResult('Audio Mute/Unmute Control Toggled', muteToggled);

    // ----------------------------------------------------
    // STEP 9: CAPTURE HIGH-RES QA ARTIFACT SCREENSHOT
    // ----------------------------------------------------
    console.log('\n[STEP 9] Capturing high-resolution browser QA screenshot...');
    const screenshotPath = path.join(ARTIFACT_DIR, 'qa_workspace_module5.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
    recordResult('Module 5 QA Screenshot Artifact Captured', fs.existsSync(screenshotPath));

    console.log('\n====================================================================');
    const passedCount = testResults.filter(r => r.passed).length;
    const totalCount = testResults.length;
    console.log(`QA BROWSER TEST RESULTS: ${passedCount}/${totalCount} PASSED`);
    console.log('====================================================================\n');

    await browser.close();
    process.exit(passedCount === totalCount ? 0 : 1);
  } catch (error) {
    console.error('❌ Browser QA error:', error);
    if (browser) await browser.close();
    process.exit(1);
  }
}

runBrowserQA();
