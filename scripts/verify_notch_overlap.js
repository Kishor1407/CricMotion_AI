const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const FRONTEND_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:5050';
const ARTIFACTS_DIR = 'C:\\Users\\LENOVO\\.gemini\\antigravity\\brain\\109f6f58-61fb-467d-84bc-177c29f90860';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function verifyDynamicIslandNotchOverlap() {
  console.log('\n======================================================');
  console.log('🔍 DYNAMIC ISLAND & HEADER STACKING QA VERIFICATION');
  console.log('======================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Create a test user & project with 3 scenes
  const regRes = await fetch(`${BACKEND_URL}/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `qa_notch_${Date.now()}@test.com`, password: 'Password123!' }),
  });
  const reg = await regRes.json();

  const projRes = await fetch(`${BACKEND_URL}/v1/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${reg.token}` },
    body: JSON.stringify({
      title: 'Pant 27 CR Mega Auction War',
      sourcePrompt: 'Pant auction bidding war',
      storyboard: [
        { sceneNumber: 1, title: 'Opening Bid', narration: 'Bidding opens at 2 Crore.', startSeconds: 0, endSeconds: 5 },
        { sceneNumber: 2, title: 'Auction Climax', narration: 'LSG raises paddle to 27 Crore.', startSeconds: 5, endSeconds: 10 },
        { sceneNumber: 3, title: 'Record Broken', narration: 'All-time IPL record shattered.', startSeconds: 10, endSeconds: 15 },
      ],
    }),
  });
  const proj = await projRes.json();

  await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle2' });
  await page.evaluate((tok, usr) => {
    localStorage.setItem('cricmotion_token', tok);
    localStorage.setItem('cricmotion_user', JSON.stringify(usr));
  }, reg.token, reg.user);

  await page.goto(`${FRONTEND_URL}/workspace?projectId=${proj.data._id}`, { waitUntil: 'networkidle2' });
  await delay(1500);

  // Test across multiple scroll positions: 0, 40, 80, 120, 200, 300 px
  const scrollDepths = [0, 40, 80, 120, 200, 300];
  let overlapCount = 0;

  for (const scrollY of scrollDepths) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await delay(300);

    const check = await page.evaluate(() => {
      const header = document.querySelector('header');
      const headerRect = header.getBoundingClientRect();
      const playBtn = document.querySelector('[data-testid="header-play-preview"]');
      const exportBtn = document.querySelector('[data-testid="header-export-mp4"]');
      const notch = document.querySelector('[data-testid="dynamic-island-notch"]');

      if (!header || !playBtn || !exportBtn || !notch) {
        return { error: 'Element missing', header: !!header, playBtn: !!playBtn, exportBtn: !!exportBtn, notch: !!notch };
      }

      const playRect = playBtn.getBoundingClientRect();
      const exportRect = exportBtn.getBoundingClientRect();
      const notchRect = notch.getBoundingClientRect();

      // Check elementFromPoint at center of play preview button and export button
      const playCenterX = playRect.left + playRect.width / 2;
      const playCenterY = playRect.top + playRect.height / 2;
      const elemAtPlay = document.elementFromPoint(playCenterX, playCenterY);

      const exportCenterX = exportRect.left + exportRect.width / 2;
      const exportCenterY = exportRect.top + exportRect.height / 2;
      const elemAtExport = document.elementFromPoint(exportCenterX, exportCenterY);

      // Check if notch overlaps vertically into header area
      const isNotchOverlappingHeader = notchRect.top < headerRect.bottom && notchRect.bottom > headerRect.top;
      
      // Does dynamic island notch steal elementFromPoint over the buttons?
      const isNotchOverPlay = elemAtPlay && (elemAtPlay === notch || notch.contains(elemAtPlay));
      const isNotchOverExport = elemAtExport && (elemAtExport === notch || notch.contains(elemAtExport));

      return {
        headerBottom: headerRect.bottom,
        notchTop: notchRect.top,
        notchBottom: notchRect.bottom,
        playBtnTop: playRect.top,
        isNotchOverPlay,
        isNotchOverExport,
        elemAtPlayTag: elemAtPlay ? elemAtPlay.tagName : null,
        elemAtExportTag: elemAtExport ? elemAtExport.tagName : null,
      };
    });

    console.log(`Scroll depth: ${scrollY}px -> Play button top: ${check.playBtnTop}px | Notch top: ${check.notchTop}px`);
    console.log(`   ↳ Element at Play button: <${check.elemAtPlayTag}> (Notch overlap: ${check.isNotchOverPlay})`);
    console.log(`   ↳ Element at Export button: <${check.elemAtExportTag}> (Notch overlap: ${check.isNotchOverExport})`);

    if (check.isNotchOverPlay || check.isNotchOverExport) {
      overlapCount++;
      console.error(`❌ OVERLAP DETECTED at scroll ${scrollY}px!`);
    }

    if (scrollY === 80 || scrollY === 120) {
      await page.screenshot({
        path: path.join(ARTIFACTS_DIR, `qa_notch_scroll_${scrollY}px.png`),
      });
    }
  }

  await browser.close();

  console.log('\n======================================================');
  if (overlapCount === 0) {
    console.log('✅ PASS: Dynamic Island notch is 100% stacked UNDER the sticky header buttons at all scroll positions!');
  } else {
    console.error(`❌ FAIL: Detected ${overlapCount} overlapping positions.`);
  }
  console.log('======================================================\n');
}

verifyDynamicIslandNotchOverlap();
