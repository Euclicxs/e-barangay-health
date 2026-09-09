/**
 * Fix Verification Test for Dashboard Stat Card Modal Functionality
 * 
 * This test verifies that the FIX works correctly
 * Tests should PASS if click handlers are properly attached and modals open
 * 
 * **Validates**: Requirements 2.1, 2.2 from bugfix.md
 * **Property 1**: Dashboard Stat Card Modal Opening (FIXED)
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Simple test framework
let testsPassed = 0;
let testsFailed = 0;
const failures = [];

function setupTest() {
  // Load the actual dashboard.html file
  const htmlPath = path.join(__dirname, '../html/dashboard.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  
  // Create a JSDOM instance with the dashboard HTML
  const dom = new JSDOM(htmlContent, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    resources: 'usable',
    beforeParse(window) {
      // Mock localStorage for session management
      const localStorage = {
        data: {},
        getItem(key) {
          return this.data[key] || null;
        },
        setItem(key, value) {
          this.data[key] = value;
        },
        removeItem(key) {
          delete this.data[key];
        }
      };
      window.localStorage = localStorage;
      
      // Mock session functions to prevent redirect
      window.getSession = () => ({ 
        userType: 'admin', 
        userName: 'Test Admin', 
        userId: 'admin01',
        loginTime: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      });
      window.getCurrentUserName = () => 'Test Admin';
      window.getCurrentUserId = () => 'admin01';
      window.clearSession = () => {};
    }
  });
  
  const document = dom.window.document;
  const window = dom.window;
  
  // Load the dashboard.js script
  const jsPath = path.join(__dirname, '../js/dashboard.js');
  const jsContent = fs.readFileSync(jsPath, 'utf-8');
  
  // Create a script element and add it to the document
  const scriptElement = document.createElement('script');
  scriptElement.textContent = jsContent;
  document.body.appendChild(scriptElement);
  
  // Trigger DOMContentLoaded event manually
  const event = new window.Event('DOMContentLoaded');
  document.dispatchEvent(event);
  
  // Give time for event listeners to attach
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ dom, document, window });
    }, 100);
  });
}

function test(name, fn) {
  return Promise.resolve(fn())
    .then(() => {
      testsPassed++;
      console.log(`✓ PASSED: ${name}`);
    })
    .catch((error) => {
      testsFailed++;
      console.log(`✗ FAILED: ${name}`);
      console.log(`  Error: ${error.message}`);
      failures.push({ test: name, error: error.message });
    });
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected "${expected}" but got "${actual}"`);
      }
    },
    not: {
      toBe(expected) {
        if (actual === expected) {
          throw new Error(`Expected not to be "${expected}"`);
        }
      },
      toBeNull() {
        if (actual === null) {
          throw new Error('Expected not to be null');
        }
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected null but got "${actual}"`);
      }
    },
    toBeGreaterThan(expected) {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    }
  };
}

// Test suite for FIXED Bug Condition 1
async function runTests() {
  console.log('='.repeat(60));
  console.log('FIX VERIFICATION: Stat Card Modal Opening');
  console.log('='.repeat(60));
  console.log('These tests verify the FIX works correctly\n');
  
  await test('Fix Verification 1: Total Records Modal Opens on Click', async () => {
    const { dom, document, window } = await setupTest();
    
    try {
      const statCard = document.querySelector('.stat-card[data-modal="total-records"]');
      const modal = document.getElementById('totalRecordsModal');
      
      console.log('\n=== Fix Test 1: Total Records Modal ===');
      console.log('Stat card found:', !!statCard);
      console.log('Modal found:', !!modal);
      console.log('Modal initial display:', modal ? modal.style.display : 'N/A');
      
      // Pre-conditions
      expect(statCard).not.toBeNull();
      expect(modal).not.toBeNull();
      
      // Simulate click
      statCard.click();
      
      // Small delay for handlers to execute
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const modalDisplayAfter = modal.style.display;
      console.log('Modal display after click:', modalDisplayAfter);
      
      // Assert: Modal should be visible
      expect(modal.style.display).toBe('flex');
      
      // Verify table populated
      const tableBody = document.getElementById('totalRecordsTable');
      expect(tableBody).not.toBeNull();
      const hasContent = tableBody.innerHTML.length > 0;
      console.log('Table populated:', hasContent);
      expect(tableBody.innerHTML.length).toBeGreaterThan(0);
      
    } finally {
      dom.window.close();
    }
  });
  
  await test('Fix Verification 2: Overdue Modal Opens on Click', async () => {
    const { dom, document, window } = await setupTest();
    
    try {
      const statCard = document.querySelector('.stat-card[data-modal="overdue"]');
      const modal = document.getElementById('overdueModal');
      
      console.log('\n=== Fix Test 2: Overdue Modal ===');
      
      expect(statCard).not.toBeNull();
      expect(modal).not.toBeNull();
      
      statCard.click();
      await new Promise(resolve => setTimeout(resolve, 50));
      
      console.log('Modal display after click:', modal.style.display);
      expect(modal.style.display).toBe('flex');
      
      const tableBody = document.getElementById('overdueTable');
      expect(tableBody.innerHTML.length).toBeGreaterThan(0);
      
    } finally {
      dom.window.close();
    }
  });
  
  await test('Fix Verification 3: Due This Month Modal Opens on Click', async () => {
    const { dom, document, window } = await setupTest();
    
    try {
      const statCard = document.querySelector('.stat-card[data-modal="due-this-month"]');
      const modal = document.getElementById('dueThisMonthModal');
      
      console.log('\n=== Fix Test 3: Due This Month Modal ===');
      
      expect(statCard).not.toBeNull();
      expect(modal).not.toBeNull();
      
      statCard.click();
      await new Promise(resolve => setTimeout(resolve, 50));
      
      console.log('Modal display after click:', modal.style.display);
      expect(modal.style.display).toBe('flex');
      
      const tableBody = document.getElementById('dueThisMonthTable');
      expect(tableBody.innerHTML.length).toBeGreaterThan(0);
      
    } finally {
      dom.window.close();
    }
  });
  
  await test('Fix Verification 4: Completed Modal Opens on Click', async () => {
    const { dom, document, window } = await setupTest();
    
    try {
      const statCard = document.querySelector('.stat-card[data-modal="completed"]');
      const modal = document.getElementById('completedModal');
      
      console.log('\n=== Fix Test 4: Completed Visits Modal ===');
      
      expect(statCard).not.toBeNull();
      expect(modal).not.toBeNull();
      
      statCard.click();
      await new Promise(resolve => setTimeout(resolve, 50));
      
      console.log('Modal display after click:', modal.style.display);
      expect(modal.style.display).toBe('flex');
      
      const tableBody = document.getElementById('completedTable');
      expect(tableBody.innerHTML.length).toBeGreaterThan(0);
      
    } finally {
      dom.window.close();
    }
  });
  
  await test('Fix Verification 5: Modal Close Functionality Preserved', async () => {
    const { dom, document, window } = await setupTest();
    
    try {
      const statCard = document.querySelector('.stat-card[data-modal="total-records"]');
      const modal = document.getElementById('totalRecordsModal');
      const closeBtn = document.querySelector('[data-close="totalRecordsModal"]');
      
      console.log('\n=== Fix Test 5: Modal Close Preservation ===');
      
      // Open modal
      statCard.click();
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(modal.style.display).toBe('flex');
      
      // Close modal via close button
      closeBtn.click();
      await new Promise(resolve => setTimeout(resolve, 50));
      
      console.log('Modal display after close click:', modal.style.display);
      expect(modal.style.display).toBe('none');
      
    } finally {
      dom.window.close();
    }
  });
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total: ${testsPassed + testsFailed}`);
  console.log(`Passed: ${testsPassed}`);
  console.log(`Failed: ${testsFailed}`);
  
  if (testsFailed > 0) {
    console.log('\nFAILURES:');
    failures.forEach(f => {
      console.log(`  ✗ ${f.test}`);
      console.log(`    ${f.error}`);
    });
    console.log('='.repeat(60));
    console.log('FIX VERIFICATION FAILED - Click handlers not working properly');
    console.log('='.repeat(60));
  } else {
    console.log('='.repeat(60));
    console.log('✓ ALL TESTS PASSED - Fix verified successfully!');
    console.log('='.repeat(60));
  }
}

runTests().catch(console.error);
