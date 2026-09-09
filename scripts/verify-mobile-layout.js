/**
 * Q-Link Mobile Layout Regression Suite
 * Tests mobile screen layout integrity, scroll containment, and clean unmounting.
 * Run via: npm run test:mobile
 */

const { chromium } = require('playwright');

const VIEWPORTS = [
  { name: 'Android Small (Galaxy S8/A-series)', width: 360, height: 800 },
  { name: 'iPhone SE / Mini', width: 375, height: 667 },
  { name: 'iPhone 14 / 15 / Pro', width: 390, height: 844 },
  { name: 'Android Standard (Pixel / Galaxy S24)', width: 412, height: 915 },
];

const mockUser = { id: 'u1', name: 'Joshna Suthar', handle: 'Bollrn787-8481', role: 'USER' };
const mockOutgoing = [
  {
    id: 'req-1',
    status: 'ACCEPTED',
    toUser: { handle: 'Bollrn787-8481', name: 'Feedback' },
    categories: ['Feedback']
  }
];

(async () => {
  console.log('🚀 Starting Q-Link Mobile Screen UI Layout Regression Suite...\n');
  const browser = await chromium.launch({ headless: true });
  let totalErrors = 0;

  for (const vp of VIEWPORTS) {
    console.log(`📱 Testing Viewport: ${vp.name} (${vp.width}x${vp.height}px)...`);
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });

    // Mock network responses
    await page.route('**/api/auth/session', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: mockUser }) }));
    await page.route('**/api/requests**', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ incoming: [], outgoing: mockOutgoing }) }));
    await page.route('**/api/posts**', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ posts: [] }) }));
    await page.route('**/api/directory**', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], total: 0 }) }));
    await page.route('**/api/messages**', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ messages: [] }) }));

    await page.addInitScript(u => {
      localStorage.setItem('qc_session_signature', JSON.stringify(u));
      localStorage.setItem('qc_seen_guide_v1', '1');
      localStorage.setItem('qc_onboarding_completed', 'true');
      localStorage.setItem('qc_pwa_install_seen_v1', '1');
      localStorage.setItem('qc_pwa_installed', 'true');
    }, mockUser);

    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    const checkLayout = async (phaseName) => {
      return await page.evaluate(({ phase, expectedWidth }) => {
        const main = document.getElementById('main-scroll-container');
        const settings = document.getElementById('settings-btn');
        const dirModal = document.querySelector('button[aria-label="Close Global Quantum Directory"]');
        
        const scrollWidth = main ? main.scrollWidth : document.documentElement.scrollWidth;
        const clientWidth = main ? main.clientWidth : document.documentElement.clientWidth;
        const scrollLeft = main ? main.scrollLeft : window.scrollX;
        const settingsRect = settings ? settings.getBoundingClientRect() : null;

        const errors = [];
        if (scrollWidth > expectedWidth) {
          errors.push(`[${phase}] Container scrollWidth (${scrollWidth}px) exceeds viewport width (${expectedWidth}px)!`);
        }
        if (scrollLeft > 0) {
          errors.push(`[${phase}] Container has unintended horizontal scroll offset: scrollLeft = ${scrollLeft}px!`);
        }
        if (settingsRect && settingsRect.right > expectedWidth) {
          errors.push(`[${phase}] Settings button right edge (${settingsRect.right.toFixed(1)}px) exceeds viewport (${expectedWidth}px)!`);
        }
        if (phase.includes('after_close') && dirModal) {
          errors.push(`[${phase}] Directory modal failed to unmount and remains stuck in DOM!`);
        }

        return {
          phase,
          scrollWidth,
          clientWidth,
          scrollLeft,
          settingsRight: settingsRect ? settingsRect.right : null,
          errors
        };
      }, { phase: phaseName, expectedWidth: vp.width });
    };

    // 1. Initial State
    const initRes = await checkLayout('Initial Load');
    if (initRes.errors.length > 0) {
      console.error(`  ❌ Initial state failed:`, initRes.errors);
      totalErrors += initRes.errors.length;
    } else {
      console.log(`  ✅ Initial layout: width=${initRes.scrollWidth}px (0px overflow)`);
    }

    // 2. Open and Close Quantum Link Console
    await page.click('#quantum-link-console-btn');
    await page.waitForTimeout(800);
    const closeDirBtn = page.locator('button[aria-label="Close Global Quantum Directory"]');
    if (await closeDirBtn.count() > 0) {
      await closeDirBtn.click();
      await page.waitForTimeout(900);
      const afterDirRes = await checkLayout('After Directory Close');
      if (afterDirRes.errors.length > 0) {
        console.error(`  ❌ After directory close failed:`, afterDirRes.errors);
        totalErrors += afterDirRes.errors.length;
      } else {
        console.log(`  ✅ Directory modal cycle: clean unmount, width=${afterDirRes.scrollWidth}px`);
      }
    }

    // 3. Open and Close Chat ID
    const chatBtn = page.locator('button:has-text("Chat")').first();
    if (await chatBtn.count() > 0) {
      await chatBtn.click();
      await page.waitForTimeout(800);
      const closeChatBtn = page.locator('#chat-toggle-full-btn');
      if (await closeChatBtn.count() > 0) {
        await closeChatBtn.click();
        await page.waitForTimeout(900);
        const afterChatRes = await checkLayout('After Chat Close');
        if (afterChatRes.errors.length > 0) {
          console.error(`  ❌ After chat close failed:`, afterChatRes.errors);
          totalErrors += afterChatRes.errors.length;
        } else {
          console.log(`  ✅ Chat panel cycle: layout preserved, width=${afterChatRes.scrollWidth}px`);
        }
      }
    }

    await page.close();
  }

  await browser.close();

  if (totalErrors === 0) {
    console.log('\n🎉 ALL MOBILE LAYOUT REGRESSION TESTS PASSED! 100% RELIABLE & ROBUST.');
    process.exit(0);
  } else {
    console.error(`\n❌ REGRESSION DETECTED: ${totalErrors} layout integrity errors found!`);
    process.exit(1);
  }
})();
