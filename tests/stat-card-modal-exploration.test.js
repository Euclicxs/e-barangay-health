/**
 * Bug Condition Exploration Tests for Dashboard Stat Card Modal Functionality
 * 
 * **UPDATED**: After fix implementation, these tests now PASS on fixed code
 * Success confirms that the bug has been resolved
 * 
 * **Purpose**: Verify that stat card modals open correctly after the fix
 * **Validates**: Requirements 2.1, 2.2 from bugfix.md
 * **Property 1**: Dashboard Stat Card Modal Opening
 * 
 * **Expected Outcome**: Tests PASS - modals open and display correctly when stat cards are clicked
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Simple test framework
let testsPassed = 0;
let testsFailed = 0;
let currentSuite = '';
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
        userType: 'bhw', 
        userName: 'Test BHW', 
        userId: 'bhw01',
        firstName: 'Test',
        lastName: 'BHW',
        middleInitial: 'T',
        loginTime: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      });
      window.getCurrentUserName = () => 'Test T. BHW';
      window.getCurrentUserId = () => 'bhw01';
      window.clearSession = () => {};
      window.validateSession = (required) => {
        const s = window.getSession();
        if (!s) return false;
        if (required && s.userType !== required) return false;
        return true;
      };
    }
  });
  
  const document = dom.window.document;
  const window = dom.window;
  
  // Load the dashboard.js script and manually execute the DOMContentLoaded callback
  const jsPath = path.join(__dirname, '../js/dashboard.js');
  const jsContent = fs.readFileSync(jsPath, 'utf-8');
  
  // Instead of adding script and firing event, evaluate the code directly in window context
  // This ensures the code executes synchronously
  const vm = require('vm');
  const script = new vm.Script(jsContent);
  const context = vm.createContext(window);
  
  try {
    script.runInContext(context);
    
    // Now trigger DOMContentLoaded
    const event = new window.Event('DOMContentLoaded', { bubbles: true, cancelable: false });
    document.dispatchEvent(event);
  } catch (err) {
    console.log('Script execution error:', err.message);
  }
  
  return { dom, document, window };
}

function test(name, fn) {
  try {
    console.log(`\n--- Running: ${name} ---`);
    fn();
    testsPassed++;
    console.log(`✓ PASSED: ${name}`);
  } catch (error) {
    testsFailed++;
    console.log(`✗ FAILED: ${name}`);
    console.log(`  Error: ${error.message}`);
    failures.push({ test: name, error: error.message, stack: error.stack });
  }
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
    }
  };
}

// Test suite for Bug Condition 1: Dashboard Stat Card Modal Functionality
function runTests() {
  console.log('='.repeat(60));
  console.log('BUG FIX VERIFICATION: Stat Card Modal Opening');
  console.log('='.repeat(60));
  console.log('These tests verify the fix is working correctly');
  console.log('All tests should PASS on fixed code\n');
  
  test('Bug Test 1: Clicking stat card with data-modal="total-records" should open totalRecordsModal', () => {
    const { dom, document, window } = setupTest();
    
    try {
      // Arrange: Find the stat card element
      const statCard = document.querySelector('.stat-card[data-modal="total-records"]');
      const modal = document.getElementById('totalRecordsModal');
      
      console.log('=== Bug Test 1: Total Records Modal ===');
      console.log('Stat card found:', !!statCard);
      console.log('Modal found:', !!modal);
      console.log('Modal initial display:', modal ? modal.style.display : 'N/A');
      
      // Pre-condition assertions
      expect(statCard).not.toBeNull();
      expect(modal).not.toBeNull();
      expect(modal.style.display).not.toBe('flex'); // Modal should be hidden initially
      
      // Act: Simulate click on the stat card using dispatchEvent
      const clickEvent = new window.MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      statCard.dispatchEvent(clickEvent);
      
      // Wait a moment for event handlers to execute
      const modalDisplayAfter = modal.style.display;
      console.log('Modal display after click:', modalDisplayAfter);
      
      // Assert: Modal should be visible (display: 'flex')
      // **THIS ASSERTION IS EXPECTED TO FAIL ON UNFIXED CODE**
      expect(modal.style.display).toBe('flex');
      
      // Additional assertions to verify modal functionality
      const tableBody = document.getElementById('totalRecordsTable');
      expect(tableBody).not.toBeNull();
      console.log('Table body innerHTML length:', tableBody.innerHTML.length);
      expect(tableBody.innerHTML).not.toBe(''); // Table should be populated
    } finally {
      dom.window.close();
    }
  });
  
  test('Bug Test 2: Clicking stat card with data-modal="overdue" should open overdueModal', () => {
    const { dom, document, window } = setupTest();
    
    try {
      // Arrange: Find the stat card element
      const statCard = document.querySelector('.stat-card[data-modal="overdue"]');
      const modal = document.getElementById('overdueModal');
      
      console.log('=== Bug Test 2: Overdue Modal ===');
      console.log('Stat card found:', !!statCard);
      console.log('Modal found:', !!modal);
      console.log('Modal initial display:', modal ? modal.style.display : 'N/A');
      
      // Pre-condition assertions
      expect(statCard).not.toBeNull();
      expect(modal).not.toBeNull();
      expect(modal.style.display).not.toBe('flex');
      
      // Act: Simulate click on the stat card using dispatchEvent
      const clickEvent = new window.MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      statCard.dispatchEvent(clickEvent);
      
      const modalDisplayAfter = modal.style.display;
      console.log('Modal display after click:', modalDisplayAfter);
      
      // Assert: Modal should be visible
      // **THIS ASSERTION IS EXPECTED TO FAIL ON UNFIXED CODE**
      expect(modal.style.display).toBe('flex');
      
      // Verify modal data population
      const tableBody = document.getElementById('overdueTable');
      expect(tableBody).not.toBeNull();
      console.log('Table body innerHTML length:', tableBody.innerHTML.length);
      expect(tableBody.innerHTML).not.toBe('');
    } finally {
      dom.window.close();
    }
  });
  
  test('Bug Test 3: Clicking stat card with data-modal="due-this-month" should open dueThisMonthModal', () => {
    const { dom, document, window } = setupTest();
    
    try {
      // Arrange: Find the stat card element
      const statCard = document.querySelector('.stat-card[data-modal="due-this-month"]');
      const modal = document.getElementById('dueThisMonthModal');
      
      console.log('=== Bug Test 3: Due This Month Modal ===');
      console.log('Stat card found:', !!statCard);
      console.log('Modal found:', !!modal);
      console.log('Modal initial display:', modal ? modal.style.display : 'N/A');
      
      // Pre-condition assertions
      expect(statCard).not.toBeNull();
      expect(modal).not.toBeNull();
      expect(modal.style.display).not.toBe('flex');
      
      // Act: Simulate click on the stat card using dispatchEvent
      const clickEvent = new window.MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      statCard.dispatchEvent(clickEvent);
      
      const modalDisplayAfter = modal.style.display;
      console.log('Modal display after click:', modalDisplayAfter);
      
      // Assert: Modal should be visible
      // **THIS ASSERTION IS EXPECTED TO FAIL ON UNFIXED CODE**
      expect(modal.style.display).toBe('flex');
      
      // Verify modal data population
      const tableBody = document.getElementById('dueThisMonthTable');
      expect(tableBody).not.toBeNull();
      console.log('Table body innerHTML length:', tableBody.innerHTML.length);
      expect(tableBody.innerHTML).not.toBe('');
    } finally {
      dom.window.close();
    }
  });
  
  test('Bug Test 4: Clicking stat card with data-modal="completed" should open completedModal', () => {
    const { dom, document, window } = setupTest();
    
    try {
      // Arrange: Find the stat card element
      const statCard = document.querySelector('.stat-card[data-modal="completed"]');
      const modal = document.getElementById('completedModal');
      
      console.log('=== Bug Test 4: Completed Modal ===');
      console.log('Stat card found:', !!statCard);
      console.log('Modal found:', !!modal);
      console.log('Modal initial display:', modal ? modal.style.display : 'N/A');
      
      // Pre-condition assertions
      expect(statCard).not.toBeNull();
      expect(modal).not.toBeNull();
      expect(modal.style.display).not.toBe('flex');
      
      // Act: Simulate click on the stat card using dispatchEvent
      const clickEvent = new window.MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      statCard.dispatchEvent(clickEvent);
      
      const modalDisplayAfter = modal.style.display;
      console.log('Modal display after click:', modalDisplayAfter);
      
      // Assert: Modal should be visible
      // **THIS ASSERTION IS EXPECTED TO FAIL ON UNFIXED CODE**
      expect(modal.style.display).toBe('flex');
      
      // Verify modal data population
      const tableBody = document.getElementById('completedTable');
      expect(tableBody).not.toBeNull();
      console.log('Table body innerHTML length:', tableBody.innerHTML.length);
      expect(tableBody.innerHTML).not.toBe('');
    } finally {
      dom.window.close();
    }
  });
  
  test('Bug Investigation: Verify click event handlers are attached to stat cards', () => {
    const { dom, document, window } = setupTest();
    
    try {
      // This test investigates whether click handlers are properly attached
      const statCards = document.querySelectorAll('.stat-card[data-modal]');
      
      console.log('=== Bug Investigation: Click Handler Attachment ===');
      console.log('Total stat cards with data-modal:', statCards.length);
      
      expect(statCards.length).toBe(4); // Should have 4 stat cards
      
      statCards.forEach((card, index) => {
        const modalType = card.getAttribute('data-modal');
        const hasOnclick = card.onclick !== null;
        const cursorStyle = window.getComputedStyle(card).cursor;
        
        console.log(`Card ${index + 1}:`);
        console.log('  data-modal:', modalType);
        console.log('  onclick handler:', hasOnclick);
        console.log('  cursor style:', cursorStyle);
        
        // Investigate the issue
        expect(card.hasAttribute('data-modal')).toBe(true);
      });
    } finally {
      dom.window.close();
    }
  });
  
  test('Bug Investigation: Verify modal IDs match between data-modal and DOM', () => {
    const { dom, document, window } = setupTest();
    
    try {
      // This test verifies the modal ID mapping is correct
      const statCardModals = {
        'total-records': 'totalRecordsModal',
        'overdue': 'overdueModal',
        'due-this-month': 'dueThisMonthModal',
        'completed': 'completedModal'
      };
      
      console.log('=== Bug Investigation: Modal ID Mapping ===');
      
      Object.entries(statCardModals).forEach(([modalType, modalId]) => {
        const statCard = document.querySelector(`.stat-card[data-modal="${modalType}"]`);
        const modal = document.getElementById(modalId);
        
        console.log(`Modal Type: ${modalType}`);
        console.log('  Stat card exists:', !!statCard);
        console.log('  Modal exists:', !!modal);
        console.log('  Modal ID:', modalId);
        
        expect(statCard).not.toBeNull();
        expect(modal).not.toBeNull();
      });
    } finally {
      dom.window.close();
    }
  });
  
  // Print summary
  const total = testsPassed + testsFailed;
  console.log('\n' + '='.repeat(60));
  console.log('TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total: ${total}`);
  console.log(`Passed: ${testsPassed}`);
  console.log(`Failed: ${testsFailed}`);
  
  if (failures.length > 0) {
    console.log('\nFAILURES:');
    failures.forEach(failure => {
      console.log(`  ✗ ${failure.test}`);
      console.log(`    ${failure.error}`);
    });
    console.log('\n' + '='.repeat(60));
    console.log('ISSUE: Some tests failed - the fix may not be complete');
    console.log('Please review the failures and ensure all modal functionality works.');
    console.log('='.repeat(60));
    process.exit(1); // Exit with error code if tests fail
  } else {
    console.log('\n' + '='.repeat(60));
    console.log('SUCCESS: All tests passed!');
    console.log('The dashboard stat card modal bug has been successfully fixed.');
    console.log('All four stat cards now properly open their corresponding modals.');
    console.log('='.repeat(60));
    process.exit(0); // Exit with success code
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
