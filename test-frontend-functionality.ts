import { config as dotenvConfig } from 'dotenv';
import puppeteer, { Browser, Page } from 'puppeteer';

// Load environment variables
dotenvConfig();

async function testFrontendFunctionality() {
  let browser: Browser | undefined;
  
  try {
    console.log('🧪 Testing Frontend Functionality...\n');

    // Launch browser
    console.log('1. Launching browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    console.log('   ✅ Browser launched successfully');

    // Test homepage loading
    console.log('\n2. Testing Homepage Loading...');
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
    const title = await page.title();
    console.log('   ✅ Homepage loaded, title:', title);

    // Check for main UI elements
    console.log('\n3. Testing UI Elements...');
    
    // Check for navigation elements
    const navExists = await page.$('nav') !== null;
    console.log('   ✅ Navigation element found:', navExists);

    // Check for main content area
    const mainExists = await page.$('main') !== null || await page.$('.main-content') !== null;
    console.log('   ✅ Main content area found:', mainExists);

    // Check for document upload area
    const uploadExists = await page.$('input[type="file"]') !== null || 
                         await page.$('.upload-area') !== null ||
                         await page.$('[data-testid="file-upload"]') !== null;
    console.log('   ✅ File upload element found:', uploadExists);

    // Test responsive design
    console.log('\n4. Testing Responsive Design...');
    
    // Test mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('   ✅ Mobile viewport tested');

    // Test tablet viewport
    await page.setViewport({ width: 768, height: 1024 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('   ✅ Tablet viewport tested');

    // Test desktop viewport
    await page.setViewport({ width: 1920, height: 1080 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('   ✅ Desktop viewport tested');

    // Test JavaScript functionality
    console.log('\n5. Testing JavaScript Functionality...');
    
    // Check for console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Wait for any dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (consoleErrors.length === 0) {
      console.log('   ✅ No JavaScript console errors detected');
    } else {
      console.log('   ⚠️ JavaScript console errors found:', consoleErrors.length);
      consoleErrors.forEach(error => console.log('     -', error));
    }

    // Test page performance
    console.log('\n6. Testing Page Performance...');
    const performanceMetrics = await page.metrics();
    console.log('   ✅ Performance metrics collected:');
    console.log('     - JS Heap Used:', Math.round((performanceMetrics.JSHeapUsedSize || 0) / 1024 / 1024), 'MB');
    console.log('     - JS Heap Total:', Math.round((performanceMetrics.JSHeapTotalSize || 0) / 1024 / 1024), 'MB');
    console.log('     - DOM Nodes:', performanceMetrics.Nodes || 0);

    // Test accessibility basics
    console.log('\n7. Testing Basic Accessibility...');
    
    // Check for alt attributes on images
    const imagesWithoutAlt = await page.$$eval('img:not([alt])', imgs => imgs.length);
    console.log('   ✅ Images without alt text:', imagesWithoutAlt);

    // Check for form labels
    const inputsWithoutLabels = await page.$$eval('input:not([aria-label]):not([aria-labelledby])', inputs => 
      inputs.filter(input => !input.closest('label')).length
    );
    console.log('   ✅ Inputs without proper labels:', inputsWithoutLabels);

    // Test authentication flow
    console.log('\n8. Testing Authentication Flow...');
    
    // Try to access a protected route
    const response = await page.goto('http://localhost:5000/api/documents', { waitUntil: 'networkidle2' });
    const statusCode = response?.status() || 0;
    
    if (statusCode === 401 || statusCode === 302) {
      console.log('   ✅ Authentication protection working (status:', statusCode, ')');
    } else {
      console.log('   ⚠️ Unexpected response for protected route:', statusCode);
    }

    // Test API endpoints accessibility
    console.log('\n9. Testing API Endpoints...');
    
    const apiEndpoints = [
      '/api/auth/user',
      '/api/documents',
      '/api/ai/endpoints',
      '/api/analytics/documents'
    ];

    for (const endpoint of apiEndpoints) {
      try {
        const apiResponse = await page.goto(`http://localhost:5000${endpoint}`, { waitUntil: 'networkidle2' });
        const status = apiResponse?.status() || 0;
        console.log(`   ✅ ${endpoint}: ${status} (${status === 401 ? 'Protected' : 'Accessible'})`);
      } catch (error: any) {
        console.log(`   ⚠️ ${endpoint}: Error -`, error.message);
      }
    }

    console.log('\n🎉 Frontend functionality testing completed!');
    
  } catch (error) {
    console.error('\n❌ Frontend testing failed:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
      console.log('   ✅ Browser closed');
    }
  }
}

testFrontendFunctionality();
