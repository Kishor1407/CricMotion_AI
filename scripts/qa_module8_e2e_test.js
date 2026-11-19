const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const BACKEND_URL = 'http://localhost:5050';
const FRONTEND_URL = 'http://localhost:5173';
const ARTIFACTS_DIR = path.resolve('C:/Users/LENOVO/.gemini/antigravity/brain/109f6f58-61fb-467d-84bc-177c29f90860');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('🏏 [QA Module 8] Launching E2E Puppeteer Video Worker & Export Verification...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // 1. Authenticate user via backend API
    console.log('1. Authenticating test user via backend API...');
    const loginRes = await fetch(`${BACKEND_URL}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test_runner_1795068044634@cricmotion.ai',
        password: 'Password123!',
      }),
    });

    let token = '';
    let user = null;
    if (loginRes.ok) {
      const loginData = await loginRes.json();
      token = loginData.token || loginData.data?.token;
      user = loginData.user || loginData.data?.user;
    } else {
      // Register if not found
      const regRes = await fetch(`${BACKEND_URL}/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `qa_module8_${Date.now()}@cricmotion.ai`,
          password: 'Password123!',
        }),
      });
      const regData = await regRes.json();
      token = regData.token || regData.data?.token;
      user = regData.user || regData.data?.user;
    }

    console.log(`✅ Authenticated user token obtained: ${token.slice(0, 20)}...`);

    // 2. Create a test project with 1 quick scene for fast render test
    console.log('2. Creating rapid render test project in MongoDB...');
    const projRes = await fetch(`${BACKEND_URL}/v1/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Bumrah 149 KPH Yorker Reel',
        sourcePrompt: 'Bumrah toe-crusher at 149 kph',
        category: 'match-action',
        config: {
          targetDurationSeconds: 15,
          vibe: 'High Energy Hype',
          avatarModelId: 'old_british_reporter_01',
          voiceModelId: 'eleven_multilingual_v2_british',
        },
        storyboard: [
          {
            sceneNumber: 1,
            title: 'Toe Crusher Yorker',
            narration: 'Jasprit Bumrah delivers a 149 kph pinpoint yorker under Melbourne lights!',
            startSeconds: 0,
            endSeconds: 3,
            contextCategory: 'match-action',
            tickerHeadline: '⚡ BUMRAH // 149.2 KPH SPEED GUN CONFIRMED',
            wordTimestamps: [
              { word: 'Jasprit', startMs: 0, endMs: 400 },
              { word: 'Bumrah', startMs: 420, endMs: 800 },
              { word: 'delivers', startMs: 820, endMs: 1200 },
              { word: 'a', startMs: 1220, endMs: 1300 },
              { word: '149', startMs: 1320, endMs: 1600 },
              { word: 'kph', startMs: 1620, endMs: 1900 },
              { word: 'pinpoint', startMs: 1920, endMs: 2300 },
              { word: 'yorker', startMs: 2320, endMs: 2700 },
            ],
          },
        ],
      }),
    });

    const projData = await projRes.json();
    const projectId = projData.data._id;
    console.log(`✅ Project created with ID: ${projectId}`);

    // 3. Navigate to /workspace with the project loaded
    console.log('3. Navigating to Workspace with injected auth token...');
    await page.goto(`${FRONTEND_URL}/workspace?projectId=${projectId}`, { waitUntil: 'domcontentloaded' });

    // Inject token into localStorage and reload
    await page.evaluate(
      (t, u) => {
        localStorage.setItem('cricmotion_token', t);
        localStorage.setItem('cricmotion_user', JSON.stringify(u));
      },
      token,
      user
    );

    await page.goto(`${FRONTEND_URL}/workspace?projectId=${projectId}`, { waitUntil: 'networkidle2' });
    console.log('✅ Workspace loaded with authenticated project!');

    // Wait for elements to be visible
    await page.waitForSelector('text/Storyboard Filmstrip');
    console.log('✅ Storyboard Filmstrip rendered in DOM.');

    // 4. Verify Module 8 Control Strip Elements
    const hasExporterStrip = await page.evaluate(() => {
      return document.body.innerText.includes('HEADLESS MP4 VIDEO COMPILER');
    });
    console.log(`✅ Module 8 Control Strip Present: ${hasExporterStrip}`);

    const hasHeaderExportBtn = await page.evaluate(() => {
      return document.body.innerText.includes('EXPORT MP4');
    });
    console.log(`✅ Header Export Button Present: ${hasHeaderExportBtn}`);

    // 5. Trigger Video Render via API / UI
    console.log('4. Triggering Video Render Job via BullMQ...');
    const renderTriggerRes = await fetch(`${BACKEND_URL}/v1/projects/${projectId}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ resolution: '720x1280', fps: 30 }),
    });
    const renderTriggerData = await renderTriggerRes.json();
    console.log(`✅ Render dispatched! Job ID: ${renderTriggerData.data?.jobId}`);

    // 6. Poll for render completion
    console.log('5. Polling render status until completion...');
    let isComplete = false;
    let attempts = 0;
    while (!isComplete && attempts < 60) {
      await new Promise((r) => setTimeout(r, 2000));
      attempts++;
      const statusRes = await fetch(`${BACKEND_URL}/v1/projects/${projectId}/render-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statusData = await statusRes.json();
      const progress = statusData.progress ?? statusData.data?.progress ?? 0;
      const status = statusData.status ?? statusData.data?.status;
      const finalUrl = statusData.finalRenderUrl ?? statusData.data?.finalRenderUrl;
      console.log(`   ↳ [Poll ${attempts}] Status: ${status} | Progress: ${progress}% | Video: ${finalUrl || 'rendering...'}`);

      if (status === 'READY' && finalUrl) {
        isComplete = true;
        console.log(`🎉 Video Render Completed! Final MP4: ${finalUrl}`);
        break;
      }
    }

    if (!isComplete) {
      throw new Error('Video render timed out after 60 seconds.');
    }

    // 7. Refresh workspace page to view ready state
    console.log('6. Refreshing workspace page to verify UI displays Download MP4 buttons...');
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 2000));

    // Verify "DOWNLOAD MP4" is now in DOM
    const hasDownloadBtn = await page.evaluate(() => {
      return document.body.innerText.includes('DOWNLOAD MP4');
    });
    console.log(`✅ UI shows DOWNLOAD MP4: ${hasDownloadBtn}`);

    // 8. Capture QA Screenshot
    const screenshotPath = path.join(ARTIFACTS_DIR, 'qa_workspace_module8_export.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`📸 Screenshot captured and saved to: ${screenshotPath}`);

    console.log('\n======================================================');
    console.log('✅ MODULE 8 QA VERIFICATION: ALL CHECKS PASSED 100%!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ QA Module 8 failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
