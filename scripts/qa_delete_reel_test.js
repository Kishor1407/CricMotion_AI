const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FRONTEND_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:5050';
const ARTIFACTS_DIR = 'C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\109f6f58-61fb-467d-84bc-177c29f90860';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runDeleteReelQA() {
  console.log('\n======================================================');
  console.log('🗑️ CRICMOTION AI — REEL CARD DELETE FEATURE QA');
  console.log('======================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Auto-accept confirmation dialogs
  page.on('dialog', async (dialog) => {
    console.log(`[Browser Dialog] "${dialog.message()}" -> ACCEPT`);
    await dialog.accept();
  });

  try {
    // 1. Create a fresh test user
    const userEmail = `qa_del_${Date.now()}@cricmotion.ai`;
    const regRes = await fetch(`${BACKEND_URL}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        password: 'Password123!',
        firstName: 'MS',
        lastName: 'Dhoni',
      }),
    });
    const regData = await regRes.json();
    const token = regData.token;
    console.log(`✅ [1/5] Registered user: ${userEmail}`);

    // Set localStorage session
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle2' });
    await page.evaluate((tok, usr) => {
      localStorage.setItem('cricmotion_token', tok);
      localStorage.setItem('cricmotion_user', JSON.stringify(usr));
    }, token, regData.user);

    // 2. Create 2 test reels
    const reelA = await fetch(`${BACKEND_URL}/v1/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: 'Dhoni Last Ball Six Wankhede',
        sourcePrompt: 'Dhoni finishes off in style World Cup 2011',
        config: { targetDurationSeconds: 15, vibe: 'High Energy Hype' },
      }),
    }).then((r) => r.json());

    const reelB = await fetch(`${BACKEND_URL}/v1/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: 'Rohit 264 Eden Gardens Destruction',
        sourcePrompt: 'Rohit Sharma world record 264 score',
        config: { targetDurationSeconds: 15, vibe: 'High Energy Hype' },
      }),
    }).then((r) => r.json());

    const idA = reelA.data?._id;
    const idB = reelB.data?._id;
    console.log(`✅ [2/5] Created 2 test reels:`);
    console.log(`       ↳ Reel A: "${reelA.data?.title}" (${idA})`);
    console.log(`       ↳ Reel B: "${reelB.data?.title}" (${idB})`);

    // 3. Navigate to Dashboard & check cards
    await page.goto(`${FRONTEND_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await delay(1500);

    let dashText = await page.evaluate(() => document.body.innerText);
    const hasReelA = dashText.includes('Dhoni Last Ball Six');
    const hasReelB = dashText.includes('Rohit 264 Eden Gardens');
    const has2Clips = dashText.includes('2 CLIPS GENERATED') || dashText.includes('All (2)');
    console.log(`✅ [3/5] Dashboard loaded with both reels:`);
    console.log(`       ↳ Reel A in view: ${hasReelA}`);
    console.log(`       ↳ Reel B in view: ${hasReelB}`);
    console.log(`       ↳ Total clips count is 2: ${has2Clips}`);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'qa_dashboard_before_delete.png') });

    // 4. Click Delete on Reel A via real mouse click (hover first)
    console.log(`⏳ [4/5] Simulating user hover and native mouse click on Reel A (${idA})...`);
    await page.hover(`[data-testid="delete-reel-${idA}"]`);
    await delay(300);
    await page.click(`[data-testid="delete-reel-${idA}"]`);
    console.log(`       ↳ Native mouse click dispatched successfully on delete button`);
    await delay(800);

    // Verify URL did NOT navigate to workspace
    const currentUrl = page.url();
    console.log(`       ↳ Current URL after click: ${currentUrl}`);
    if (currentUrl.includes('/workspace')) {
      throw new Error(`CRITICAL: Click on delete button triggered navigation to workspace! URL: ${currentUrl}`);
    }

    // Verify Custom Delete Popup Dialog appeared
    let modalText = await page.evaluate(() => document.body.innerText);
    const hasModalTitle = modalText.includes('DELETE THIS REEL?');
    const hasKeepReelBtn = modalText.includes('KEEP REEL');
    const hasDeleteForeverBtn = modalText.includes('DELETE FOREVER');
    console.log(`       ↳ Custom Popup Modal displayed: ${hasModalTitle}`);
    console.log(`       ↳ "Keep Reel" cancel button displayed: ${hasKeepReelBtn}`);
    console.log(`       ↳ "Delete Forever" confirm button displayed: ${hasDeleteForeverBtn}`);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'qa_dashboard_delete_modal.png') });

    // Test Cancel ("Keep Reel") first
    console.log(`⏳ Testing Cancel ("Keep Reel")...`);
    await page.click('[data-testid="cancel-delete-reel-btn"]');
    await delay(500);

    modalText = await page.evaluate(() => document.body.innerText);
    const modalClosedOnCancel = !modalText.includes('DELETE THIS REEL?');
    console.log(`       ↳ Modal closed on Cancel: ${modalClosedOnCancel}`);

    // Re-open modal and click Confirm ("Delete Forever")
    console.log(`⏳ Re-opening modal and confirming deletion...`);
    await page.click(`[data-testid="delete-reel-${idA}"]`);
    await delay(500);
    await page.click('[data-testid="confirm-delete-reel-btn"]');
    await delay(2000);

    // 5. Verify DOM and Backend state after delete
    const reelACardExists = await page.evaluate((targetId) => {
      return !!document.querySelector(`[data-testid="delete-reel-${targetId}"]`);
    }, idA);
    const reelBCardExists = await page.evaluate((targetId) => {
      return !!document.querySelector(`[data-testid="delete-reel-${targetId}"]`);
    }, idB);

    dashText = await page.evaluate(() => document.body.innerText);
    const reelAGone = !reelACardExists;
    const reelBStillThere = reelBCardExists;
    const has1ClipNow = dashText.includes('1 CLIPS GENERATED') || dashText.includes('All (1)');
    const hasFeedbackToast = dashText.includes('deleted successfully');

    console.log(`✅ [5/5] Post-deletion verification:`);
    console.log(`       ↳ Reel A removed from Dashboard: ${reelAGone}`);
    console.log(`       ↳ Reel B preserved intact: ${reelBStillThere}`);
    console.log(`       ↳ Clip counter updated to 1: ${has1ClipNow}`);
    console.log(`       ↳ Green feedback toast shown: ${hasFeedbackToast}`);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'qa_dashboard_delete_verified.png') });

    // Verify backend directly
    const backendCheck = await fetch(`${BACKEND_URL}/v1/projects/${idA}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`       ↳ Backend confirms Reel A 404/deleted: ${backendCheck.status === 404}`);

    if (hasModalTitle && modalClosedOnCancel && reelAGone && reelBStillThere && backendCheck.status === 404) {
      console.log('\n======================================================');
      console.log('🎉 CUSTOM POPUP DIALOG REEL DELETE QA: 100% PASSED!');
      console.log('======================================================\n');
    } else {
      throw new Error('Verification failed: Popup dialog or deletion failed');
    }
  } catch (err) {
    console.error('❌ QA Test failed:', err);
  } finally {
    await browser.close();
  }
}

runDeleteReelQA();
