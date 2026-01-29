
const { chromium } = require('playwright');
const TARGET_URL = 'http://localhost:3001'\; // Explicitly using the new port

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Testing Unauthenticated Access on ' + TARGET_URL);
  await page.goto(TARGET_URL + '/app');
  await page.waitForURL('**/login?next=%2Fapp');
  console.log('✅ Redirected to login:', await page.url());

  console.log('Testing Authenticated Access...');
  await context.addCookies([{
    name: 'auth_token',
    value: 'mock-token',
    domain: 'localhost',
    path: '/'
  }]);
  
  await page.goto(TARGET_URL + '/app');
  await page.waitForTimeout(1000); 
  const title = await page.textContent('h1');
  if (title === 'Dashboard') {
      console.log('✅ Access granted to Dashboard');
  } else {
      console.error('❌ Failed to access dashboard');
  }

  await browser.close();
})();
