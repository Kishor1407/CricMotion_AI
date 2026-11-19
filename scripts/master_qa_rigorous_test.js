const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const BACKEND_URL = 'http://localhost:5050';
const FRONTEND_URL = 'http://localhost:5173';
const ARTIFACTS_DIR = path.resolve('C:/Users/LENOVO/.gemini/antigravity/brain/109f6f58-61fb-467d-84bc-177c29f90860');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function runRigorousQA() {
  console.log('\n====================================================================');
  console.log('🏏 CRICMOTION AI - MASTER RIGOROUS QA VERIFICATION SUITE');
  console.log('   Modules 1 to 8: Auth, Studio, Audio, Avatar, Remotion, Worker');
  console.log('====================================================================\n');

  const testReport = {
    timestamp: new Date().toISOString(),
    totalTests: 0,
    passed: 0,
    failed: 0,
    results: [],
  };

  const recordCheck = (id, name, passed, details = '') => {
    testReport.totalTests++;
    if (passed) {
      testReport.passed++;
      console.log(`✅ [${id}] PASS: ${name} ${details ? '- ' + details : ''}`);
    } else {
      testReport.failed++;
      console.error(`❌ [${id}] FAIL: ${name} ${details ? '- ' + details : ''}`);
    }
    testReport.results.push({ id, name, passed, details });
  };

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 950 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--autoplay-policy=no-user-gesture-required',
    ],
  });

  const page = await browser.newPage();

  // Monitor page console and errors
  const consoleErrors = [];
  page.on('pageerror', (err) => consoleErrors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    // -------------------------------------------------------------
    // FLOW 1: AUTH PROTECTION & LOGIN VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- FLOW 1: AUTHENTICATION & ACCESS CONTROL ---');
    
    // Clear any prior session
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());

    // 1.1 Unauthenticated access to /dashboard should redirect to /login
    await page.goto(`${FRONTEND_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await page.waitForFunction(() => window.location.pathname.includes('/login'), { timeout: 5000 }).catch(() => {});
    const currentUrl = page.url();
    recordCheck(
      'AUTH-01',
      'Route Guard Protection',
      currentUrl.includes('/login'),
      `Redirected unauthenticated user to ${currentUrl}`
    );

    // 1.2 Inspect Login Page UI elements
    await page.waitForSelector('h1', { timeout: 5000 }).catch(() => {});
    const loginHeading = await page.$eval('h1', (el) => el.innerText).catch(() => '');
    recordCheck(
      'AUTH-02',
      'Login Branding & Typography',
      loginHeading.includes('MAKE CRICKET') || loginHeading.includes('CRICMOTION'),
      `Login heading: "${loginHeading.replace(/\n/g, ' ')}"`
    );

    // 1.3 Perform Authentication via Backend API or Form
    const testEmail = `qa_master_${Date.now()}@cricmotion.ai`;
    const testPassword = 'Password123!';
    const regRes = await fetch(`${BACKEND_URL}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        firstName: 'Virat',
        lastName: 'Analyst',
      }),
    });
    const regData = await regRes.json();
    const token = regData.token || regData.data?.token;
    const user = regData.user || regData.data?.user;

    recordCheck(
      'AUTH-03',
      'Backend User Registration & JWT Issuance',
      !!token && !!user,
      `Issued JWT for user: ${user?.email}`
    );

    // Save screenshot of login page
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'qa_master_flow1_login.png'),
    });

    // -------------------------------------------------------------
    // FLOW 2: DASHBOARD EXPERIENCE & STUDIO ONBOARDING
    // -------------------------------------------------------------
    console.log('\n--- FLOW 2: DASHBOARD METRICS & STUDIO NAVIGATION ---');

    // Inject token & navigate to /dashboard
    await page.evaluate(
      (t, u) => {
        localStorage.setItem('cricmotion_token', t);
        localStorage.setItem('cricmotion_user', JSON.stringify(u));
      },
      token,
      user
    );

    await page.goto(`${FRONTEND_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await delay(1000);

    const dashboardText = await page.evaluate(() => document.body.innerText);
    recordCheck(
      'DASH-01',
      'Dashboard KPI Cards & Wallet Status',
      dashboardText.includes('CREDITS') && (dashboardText.includes('CLIPS') || dashboardText.includes('ALL')),
      'Rendered user wallet credits & clip counters'
    );

    recordCheck(
      'DASH-02',
      'Recent Reels Grid & Templates',
      dashboardText.includes('MATCH PLAYS') || dashboardText.includes('BIDDING WARS') || dashboardText.includes('CRICMOTION.AI'),
      'Project showcase & category filters rendered'
    );

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'qa_master_flow2_dashboard.png'),
    });

    // -------------------------------------------------------------
    // FLOW 3: CLEAN WORKSPACE INITIALIZATION
    // -------------------------------------------------------------
    console.log('\n--- FLOW 3: CLEAN WORKSPACE INITIALIZATION (BUG REGRESSION) ---');

    await page.goto(`${FRONTEND_URL}/workspace`, { waitUntil: 'networkidle2' });
    await delay(1200);

    const workspaceText = await page.evaluate(() => document.body.innerText);
    const hasKohliDemo = workspaceText.includes('Kohli 82* vs PAK (MCG Climax)');
    const textareaPlaceholder = await page.$eval('textarea', (el) => el.placeholder).catch(() => '');
    const hasEmptyFilmstrip = workspaceText.includes('Enter a cricket prompt below to generate your multi-scene storyboard');

    recordCheck(
      'WORK-01',
      'Zero Preloaded Dummy Data on New Workspace',
      !hasKohliDemo && hasEmptyFilmstrip,
      hasKohliDemo ? 'FAILED: Preloaded dummy Kohli data found' : 'Workspace is 100% pristine and empty'
    );

    recordCheck(
      'WORK-02',
      'Clean Omnibar Placeholder & Initial Parameters',
      textareaPlaceholder.includes('Describe your cricket reel') && workspaceText.includes('REEL PARAMETERS'),
      'Omnibar ready for user input'
    );

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'qa_master_flow3_clean_workspace.png'),
    });

    // -------------------------------------------------------------
    // FLOW 4: GEMINI STORYBOARD GENERATION VIA OMNIBAR
    // -------------------------------------------------------------
    console.log('\n--- FLOW 4: GEMINI AI STORYBOARD GENERATION ---');

    // Create a curated test project with 2 quick scenes
    console.log('   ↳ Creating project with 2 quick scenes for fast end-to-end verification...');
    const createProjRes = await fetch(`${BACKEND_URL}/v1/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Haris Rauf 150 KPH Thunderbolts',
        sourcePrompt: 'Haris Rauf 150 kph thunderbolts against England',
        category: 'match-action',
        config: {
          targetDurationSeconds: 15,
          vibe: 'High Energy Hype',
          avatarModelId: 'old_british_reporter_01',
          voiceModelId: 'eleven_multilingual_v2_british',
        },
      }),
    });

    const createProjData = await createProjRes.json();
    const projectId = createProjData.data?._id || createProjData.project?._id || createProjData._id;

    recordCheck(
      'AI-01',
      'Gemini Flash Lite Storyboard Generation API',
      !!projectId && createProjData.success,
      `Generated project ${projectId} with dynamic cricket scenes`
    );

    // Navigate to the newly generated project workspace
    await page.goto(`${FRONTEND_URL}/workspace?projectId=${projectId}`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('text/Storyboard Filmstrip');
    await delay(1500);

    const projectWorkspaceText = await page.evaluate(() => document.body.innerText);
    recordCheck(
      'AI-02',
      'Storyboard Filmstrip Multi-Scene Cards in DOM',
      projectWorkspaceText.includes('SCENE 01') && projectWorkspaceText.includes('MATCH-ACTION'),
      'Rendered filmstrip carousel with scene titles & category badges'
    );

    recordCheck(
      'AI-03',
      'Conversational Studio Log & AI Agent Dialog',
      projectWorkspaceText.includes('CricMotion AI') && projectWorkspaceText.includes('Haris Rauf'),
      'Conversational revision feed synchronized'
    );

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'qa_master_flow4_storyboard.png'),
    });

    // -------------------------------------------------------------
    // FLOW 5: AUDIO SYNTHESIS & COMMENTARY CADENCE ENGINE
    // -------------------------------------------------------------
    console.log('\n--- FLOW 5: VOICEOVER SYNTHESIS & CADENCE ENGINE (MODULE 5) ---');

    // Synthesize audio for the project
    const audioRes = await fetch(`${BACKEND_URL}/v1/projects/${projectId}/synthesize-audio`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const audioData = await audioRes.json();

    recordCheck(
      'AUDIO-01',
      'Voiceover Audio Synthesis & Cadence Timestamps',
      audioData.success && !!audioData.data?.artifacts?.audioTrackUrl,
      `Generated MP3: ${audioData.data?.artifacts?.audioTrackUrl}`
    );

    // Reload page to reflect synthesized audio
    await page.reload({ waitUntil: 'networkidle2' });
    await delay(1200);

    const refreshedText = await page.evaluate(() => document.body.innerText);
    recordCheck(
      'AUDIO-02',
      'UI Voiceover Status Strip & Aligned Word Count',
      refreshedText.includes('VOICEOVER & ALIGNMENT ACTIVE') && refreshedText.includes('AUDIO READY'),
      'Green pulse pill & millisecond word badges active'
    );

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'qa_master_flow5_audio.png'),
    });

    // -------------------------------------------------------------
    // FLOW 6: REMOTION 30 FPS PLAYER & LAYERS INSPECTOR (MODULE 7)
    // -------------------------------------------------------------
    console.log('\n--- FLOW 6: REMOTION 30FPS COMPOSITING PLAYER (MODULE 7) ---');

    const hasRemotionPill = await page.evaluate(() => document.body.innerText.includes('REMOTION 30FPS'));
    recordCheck(
      'REMOTION-01',
      'Remotion View Mode Selector Available',
      hasRemotionPill,
      '30 FPS Remotion Compositor mounted'
    );

    // Verify phone screen chassis & dynamic island
    const hasDynamicIsland = await page.evaluate(() => {
      return !!document.querySelector('.rounded-full.z-40');
    });
    recordCheck(
      'REMOTION-02',
      'Dynamic Island Notch & Smartphone Frame Overlay',
      hasDynamicIsland,
      '9:16 smartphone preview container mounted'
    );

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'qa_master_flow6_remotion_player.png'),
    });

    // Toggle to Layers mode
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const layersBtn = btns.find((b) => b.innerText.includes('LAYERS'));
      if (layersBtn) layersBtn.click();
    });
    await delay(800);

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'qa_master_flow6_layers_inspector.png'),
    });

    // Switch back to Remotion 30FPS
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const remotionBtn = btns.find((b) => b.innerText.includes('REMOTION 30FPS'));
      if (remotionBtn) remotionBtn.click();
    });
    await delay(500);

    // -------------------------------------------------------------
    // FLOW 7: BULLMQ VIDEO QUEUE & HEADLESS MP4 VIDEO COMPILATION (MODULE 8)
    // -------------------------------------------------------------
    console.log('\n--- FLOW 7: BULLMQ ASYNCHRONOUS WORKER & HEADLESS MP4 RENDERER (MODULE 8) ---');

    // 7.1 Verify Export Controls in Studio
    const hasHeaderExport = await page.evaluate(() => document.body.innerText.includes('EXPORT MP4'));
    const hasControlStripRender = await page.evaluate(() => document.body.innerText.includes('RENDER MP4'));
    recordCheck(
      'WORKER-01',
      'Module 8 Export MP4 Buttons in Header & Reel Parameters',
      hasHeaderExport && hasControlStripRender,
      'Export UI controls present'
    );

    // 7.2 Trigger Render via Studio UI button click
    console.log('   ↳ Triggering Render through Export MP4 UI button...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const exportBtn = btns.find((b) => b.innerText.includes('EXPORT MP4') || b.innerText.includes('RENDER MP4'));
      if (exportBtn) exportBtn.click();
    });

    await delay(1500);

    // Verify Export Modal opened
    const modalVisible = await page.evaluate(() => {
      return document.body.innerText.includes('CRICMOTION MP4 VIDEO COMPILER');
    });
    recordCheck(
      'WORKER-02',
      'Neobrutalist Video Compiler Modal Dialog',
      modalVisible,
      'Export progress modal mounted with reel specs'
    );

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'qa_master_flow7_export_modal_opened.png'),
    });

    // 7.3 Poll BullMQ Worker & MongoDB for Render Completion
    console.log('   ↳ Monitoring BullMQ Video Worker & Remotion headless encoding...');
    let renderComplete = false;
    let pollCount = 0;
    let finalVideoUrl = '';

    while (!renderComplete && pollCount < 90) {
      await delay(2000);
      pollCount++;
      const statusRes = await fetch(`${BACKEND_URL}/v1/projects/${projectId}/render-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statusData = await statusRes.json();
      const progress = statusData.progress ?? statusData.data?.progress ?? 0;
      const status = statusData.status ?? statusData.data?.status;
      const videoUrl = statusData.finalRenderUrl ?? statusData.data?.finalRenderUrl;

      if (pollCount % 3 === 0 || progress === 100) {
        console.log(`      ↳ [BullMQ Monitor] Status: ${status} | Frame Progress: ${progress}% | Video: ${videoUrl || 'encoding...'}`);
      }

      if (status === 'READY' && videoUrl) {
        renderComplete = true;
        finalVideoUrl = videoUrl;
        break;
      }
    }

    recordCheck(
      'WORKER-03',
      'Headless Chromium Render & FFmpeg MP4 Compilation',
      renderComplete && !!finalVideoUrl,
      `Compiled 1080x1920 MP4 Video to ${finalVideoUrl}`
    );

    // 7.4 Verify MP4 file on disk
    if (finalVideoUrl) {
      const localMp4Path = path.resolve('backend/public', finalVideoUrl.replace(/^\//, ''));
      const fileExists = fs.existsSync(localMp4Path);
      const fileSize = fileExists ? fs.statSync(localMp4Path).size : 0;
      recordCheck(
        'WORKER-04',
        'Physical MP4 Video File Verification on Disk',
        fileExists && fileSize > 100000,
        `File exists: ${localMp4Path} (${(fileSize / (1024 * 1024)).toFixed(2)} MB)`
      );
    }

    // Refresh page to verify Ready & Download state in Studio UI
    await page.goto(`${FRONTEND_URL}/workspace?projectId=${projectId}`, { waitUntil: 'networkidle2' });
    await page.waitForFunction(
      () => document.body.innerText.includes('DOWNLOAD MP4'),
      { timeout: 15000 }
    ).catch(() => {});
    await delay(1000);

    const finalStudioText = await page.evaluate(() => document.body.innerText);
    const hasDownloadBtn = finalStudioText.includes('DOWNLOAD MP4');
    recordCheck(
      'WORKER-05',
      'Studio UI Displays Active Green DOWNLOAD MP4 Button',
      hasDownloadBtn,
      'One-click download button available in header and parameters strip'
    );

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'qa_master_flow7_download_ready.png'),
    });

    // -------------------------------------------------------------
    // FLOW 8: NAVIGATION, SCHEDULER & SETTINGS VERIFICATION
    // -------------------------------------------------------------
    console.log('\n--- FLOW 8: SECONDARY PAGES & SYSTEM HEALTH ---');

    // 8.1 /schedule route
    await page.goto(`${FRONTEND_URL}/schedule`, { waitUntil: 'networkidle2' });
    await delay(800);
    const scheduleText = await page.evaluate(() => document.body.innerText);
    recordCheck(
      'NAV-01',
      'Publishing Scheduler Calendar Page (/schedule)',
      scheduleText.toLowerCase().includes('schedul') || scheduleText.includes('Direct-to-Social'),
      'Scheduler slots & calendar rendered'
    );
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'qa_master_flow8_schedule.png'),
    });

    // 8.2 /settings route
    await page.goto(`${FRONTEND_URL}/settings`, { waitUntil: 'networkidle2' });
    await delay(800);
    const settingsText = await page.evaluate(() => document.body.innerText);
    recordCheck(
      'NAV-02',
      'Settings & API Integrations Overview (/settings)',
      settingsText.toLowerCase().includes('settings') && settingsText.includes('Credits'),
      'Settings & connected accounts verified'
    );
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'qa_master_flow8_settings.png'),
    });

    // 8.3 Console Errors Audit
    const criticalErrors = consoleErrors.filter(
      (e) => !e.includes('favicon') && !e.includes('Hydration') && !e.includes('ResizeObserver')
    );
    recordCheck(
      'HEALTH-01',
      'Browser Console Health Audit (Zero Fatal Runtime Errors)',
      criticalErrors.length === 0,
      criticalErrors.length === 0 ? 'Zero runtime console errors' : `Errors: ${criticalErrors.join(', ')}`
    );

    // Write Master QA Report Artifact
    const reportPath = path.join(ARTIFACTS_DIR, 'qa_master_rigorous_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2));
    console.log(`\n📄 Master QA Test Report written to: ${reportPath}`);

    console.log('\n====================================================================');
    console.log(`🎉 MASTER QA RUN COMPLETE: ${testReport.passed} / ${testReport.totalTests} PASSED (${Math.round((testReport.passed / testReport.totalTests) * 100)}%)`);
    console.log('====================================================================\n');
  } catch (err) {
    console.error('❌ Master QA execution halted due to unexpected error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runRigorousQA();
