/**
 * Bug Condition Exploration Tests - Sidebar HTML Structure
 * 
 * **CRITICAL**: These tests MUST FAIL on unfixed code to confirm bugs exist
 * 
 * Purpose: Surface counterexamples demonstrating sidebar structure inconsistencies
 * 
 * Bug Condition 2: child.html, maternal.html, and purok.html use `.brand` class
 * instead of the standard `.sidebar-header` class used in dashboard.html
 * 
 * Expected Outcome: Tests FAIL on unfixed code
 * - child.html has `.brand` instead of `.sidebar-header` → FAIL
 * - maternal.html has `.brand` instead of `.sidebar-header` → FAIL  
 * - purok.html has `.brand` instead of `.sidebar-header` → FAIL
 * 
 * After fix: Tests PASS confirming consistent structure
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// ANSI color codes for output
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

// Path to HTML files
const HTML_DIR = path.join(__dirname, '..', 'html');

/**
 * Load and parse HTML file
 * @param {string} filename - HTML filename
 * @returns {Document} Parsed DOM document
 */
function loadHTML(filename) {
  const filePath = path.join(HTML_DIR, filename);
  const html = fs.readFileSync(filePath, 'utf8');
  const dom = new JSDOM(html);
  return dom.window.document;
}

/**
 * Test: child.html sidebar uses .sidebar-header class (not .brand)
 * 
 * **Bug Condition**: On unfixed code, child.html uses `.brand` class
 * **Expected**: Test FAILS on unfixed code, PASSES after fix
 */
function testChildSidebarStructure() {
  console.log(`\n${BOLD}Test 1: child.html sidebar structure${RESET}`);
  
  const doc = loadHTML('child.html');
  const sidebar = doc.querySelector('.sidebar');
  
  if (!sidebar) {
    console.log(`${RED}✗ FAIL${RESET}: No .sidebar element found`);
    return false;
  }
  
  const sidebarHeader = sidebar.querySelector('.sidebar-header');
  const brandDiv = sidebar.querySelector('.brand');
  
  if (sidebarHeader) {
    console.log(`${GREEN}✓ PASS${RESET}: child.html uses .sidebar-header class`);
    return true;
  } else {
    console.log(`${RED}✗ FAIL${RESET}: child.html does NOT have .sidebar-header class`);
    if (brandDiv) {
      console.log(`${YELLOW}  → Counterexample: Uses .brand class instead${RESET}`);
      console.log(`${YELLOW}  → Location: html/child.html, line ~16${RESET}`);
    }
    return false;
  }
}

/**
 * Test: maternal.html sidebar uses .sidebar-header class (not .brand)
 * 
 * **Bug Condition**: On unfixed code, maternal.html uses `.brand` class
 * **Expected**: Test FAILS on unfixed code, PASSES after fix
 */
function testMaternalSidebarStructure() {
  console.log(`\n${BOLD}Test 2: maternal.html sidebar structure${RESET}`);
  
  const doc = loadHTML('maternal.html');
  const sidebar = doc.querySelector('.sidebar');
  
  if (!sidebar) {
    console.log(`${RED}✗ FAIL${RESET}: No .sidebar element found`);
    return false;
  }
  
  const sidebarHeader = sidebar.querySelector('.sidebar-header');
  const brandDiv = sidebar.querySelector('.brand');
  
  if (sidebarHeader) {
    console.log(`${GREEN}✓ PASS${RESET}: maternal.html uses .sidebar-header class`);
    return true;
  } else {
    console.log(`${RED}✗ FAIL${RESET}: maternal.html does NOT have .sidebar-header class`);
    if (brandDiv) {
      console.log(`${YELLOW}  → Counterexample: Uses .brand class instead${RESET}`);
      console.log(`${YELLOW}  → Location: html/maternal.html, line ~17${RESET}`);
    }
    return false;
  }
}

/**
 * Test: purok.html sidebar uses .sidebar-header class (not .brand)
 * 
 * **Bug Condition**: On unfixed code, purok.html uses `.brand` class
 * **Expected**: Test FAILS on unfixed code, PASSES after fix
 */
function testPurokSidebarStructure() {
  console.log(`\n${BOLD}Test 3: purok.html sidebar structure${RESET}`);
  
  const doc = loadHTML('purok.html');
  const sidebar = doc.querySelector('.sidebar');
  
  if (!sidebar) {
    console.log(`${RED}✗ FAIL${RESET}: No .sidebar element found`);
    return false;
  }
  
  const sidebarHeader = sidebar.querySelector('.sidebar-header');
  const brandDiv = sidebar.querySelector('.brand');
  
  if (sidebarHeader) {
    console.log(`${GREEN}✓ PASS${RESET}: purok.html uses .sidebar-header class`);
    return true;
  } else {
    console.log(`${RED}✗ FAIL${RESET}: purok.html does NOT have .sidebar-header class`);
    if (brandDiv) {
      console.log(`${YELLOW}  → Counterexample: Uses .brand class instead${RESET}`);
      console.log(`${YELLOW}  → Location: html/purok.html, line ~14${RESET}`);
    }
    return false;
  }
}

/**
 * Test: All pages have matching sidebar structure elements
 * 
 * Verifies that the sidebar logo container uses consistent class naming
 * 
 * **Bug Condition**: On unfixed code, child/maternal/purok use `.brand-logo` 
 * while dashboard uses `.sidebar-logo`
 * **Expected**: Test FAILS on unfixed code showing inconsistency
 */
function testConsistentSidebarLogoClass() {
  console.log(`\n${BOLD}Test 4: Consistent sidebar logo class across all pages${RESET}`);
  
  const pages = ['child.html', 'maternal.html', 'purok.html'];
  const results = [];
  
  for (const page of pages) {
    const doc = loadHTML(page);
    const sidebar = doc.querySelector('.sidebar');
    
    if (!sidebar) {
      results.push({ page, hasCorrectClass: false, actualClass: 'none' });
      continue;
    }
    
    const sidebarLogo = sidebar.querySelector('.sidebar-logo');
    const brandLogo = sidebar.querySelector('.brand-logo');
    
    if (sidebarLogo) {
      results.push({ page, hasCorrectClass: true, actualClass: '.sidebar-logo' });
    } else if (brandLogo) {
      results.push({ page, hasCorrectClass: false, actualClass: '.brand-logo' });
    } else {
      results.push({ page, hasCorrectClass: false, actualClass: 'none' });
    }
  }
  
  const allCorrect = results.every(r => r.hasCorrectClass);
  
  if (allCorrect) {
    console.log(`${GREEN}✓ PASS${RESET}: All pages use .sidebar-logo class consistently`);
    return true;
  } else {
    console.log(`${RED}✗ FAIL${RESET}: Inconsistent logo container class names`);
    results.forEach(r => {
      if (!r.hasCorrectClass) {
        console.log(`${YELLOW}  → ${r.page}: Uses ${r.actualClass} instead of .sidebar-logo${RESET}`);
      }
    });
    return false;
  }
}

/**
 * Test: Verify sidebar text structure consistency
 * 
 * Checks that the text container uses `.brand-text` consistently
 * (This class may be acceptable even if parent changes to .sidebar-header)
 */
function testSidebarTextStructure() {
  console.log(`\n${BOLD}Test 5: Sidebar text container structure${RESET}`);
  
  const pages = ['child.html', 'maternal.html', 'purok.html'];
  const results = [];
  
  for (const page of pages) {
    const doc = loadHTML(page);
    const brandText = doc.querySelector('.sidebar .brand-text');
    results.push({ page, hasBrandText: !!brandText });
  }
  
  const allHaveText = results.every(r => r.hasBrandText);
  
  if (allHaveText) {
    console.log(`${GREEN}✓ PASS${RESET}: All pages have .brand-text container`);
    return true;
  } else {
    console.log(`${RED}✗ FAIL${RESET}: Some pages missing .brand-text container`);
    results.forEach(r => {
      if (!r.hasBrandText) {
        console.log(`${YELLOW}  → ${r.page}: Missing .brand-text${RESET}`);
      }
    });
    return false;
  }
}

// Run all tests
console.log(`${BOLD}${'='.repeat(70)}${RESET}`);
console.log(`${BOLD}Bug Condition Exploration: Sidebar HTML Structure${RESET}`);
console.log(`${BOLD}${'='.repeat(70)}${RESET}`);
console.log(`\n${YELLOW}⚠ IMPORTANT: These tests MUST FAIL on unfixed code${RESET}`);
console.log(`${YELLOW}⚠ Failures confirm the bugs exist and provide counterexamples${RESET}`);

const results = [
  testChildSidebarStructure(),
  testMaternalSidebarStructure(),
  testPurokSidebarStructure(),
  testConsistentSidebarLogoClass(),
  testSidebarTextStructure()
];

const passCount = results.filter(r => r).length;
const failCount = results.filter(r => !r).length;

console.log(`\n${BOLD}${'='.repeat(70)}${RESET}`);
console.log(`${BOLD}Summary${RESET}`);
console.log(`${BOLD}${'='.repeat(70)}${RESET}`);
console.log(`Total Tests: ${results.length}`);
console.log(`${GREEN}Passed: ${passCount}${RESET}`);
console.log(`${RED}Failed: ${failCount}${RESET}`);

if (failCount > 0) {
  console.log(`\n${YELLOW}${BOLD}Counterexamples Documented:${RESET}`);
  console.log(`${YELLOW}• child.html uses .brand instead of .sidebar-header${RESET}`);
  console.log(`${YELLOW}• maternal.html uses .brand instead of .sidebar-header${RESET}`);
  console.log(`${YELLOW}• purok.html uses .brand instead of .sidebar-header${RESET}`);
  console.log(`${YELLOW}• Logo containers use .brand-logo instead of .sidebar-logo${RESET}`);
  console.log(`\n${YELLOW}✓ Bug confirmed: Sidebar structure is inconsistent across pages${RESET}`);
}

console.log(`\n${BOLD}${'='.repeat(70)}${RESET}\n`);

// Exit with appropriate code
process.exit(failCount > 0 ? 1 : 0);
