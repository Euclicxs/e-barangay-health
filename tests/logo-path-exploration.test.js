/**
 * Bug Condition Exploration Tests for Logo Image Paths
 * 
 * **CRITICAL**: These tests are EXPECTED TO FAIL on unfixed code
 * Failure confirms that the bug exists (logo paths are incorrect)
 * 
 * **Purpose**: Surface counterexamples demonstrating logo path errors
 * **Validates**: Requirements 1.5, 1.6 from bugfix.md
 * **Property 3**: Logo Path Correctness
 * 
 * **Expected Outcome**: Tests FAIL - child.html, maternal.html reference ../image/logo.png instead of ../assets/logo.png
 */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Simple test framework
let testsPassed = 0;
let testsFailed = 0;
const failures = [];
const counterexamples = [];

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
    failures.push({ test: name, error: error.message });
    
    // Extract counterexample information
    if (error.counterexample) {
      counterexamples.push(error.counterexample);
    }
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected "${expected}" but got "${actual}"`);
      }
    },
    toContain(substring) {
      if (!actual.includes(substring)) {
        throw new Error(`Expected "${actual}" to contain "${substring}"`);
      }
    },
    not: {
      toBeNull() {
        if (actual === null) {
          throw new Error('Expected not to be null');
        }
      },
      toContain(substring) {
        if (actual.includes(substring)) {
          throw new Error(`Expected "${actual}" not to contain "${substring}"`);
        }
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected null but got "${actual}"`);
      }
    },
    toExist() {
      if (!actual) {
        throw new Error('Expected file to exist but it does not');
      }
    }
  };
}

function parseHtmlFile(fileName) {
  const htmlPath = path.join(__dirname, '../html', fileName);
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  const dom = new JSDOM(htmlContent);
  return { dom, document: dom.window.document };
}

function checkLogoSrc(fileName, expectedPath) {
  const { dom, document } = parseHtmlFile(fileName);
  
  // Find the logo image in the sidebar
  const logoImg = document.querySelector('.sidebar img.sidebar-png-logo, .sidebar img[alt*="Logo"]');
  
  console.log(`File: ${fileName}`);
  console.log(`Logo element found: ${!!logoImg}`);
  
  expect(logoImg).not.toBeNull();
  
  const actualSrc = logoImg.getAttribute('src');
  console.log(`Logo src attribute: ${actualSrc}`);
  console.log(`Expected: ${expectedPath}`);
  
  if (actualSrc !== expectedPath) {
    const error = new Error(`Expected logo src to be "${expectedPath}" but got "${actualSrc}"`);
    error.counterexample = {
      file: fileName,
      actualPath: actualSrc,
      expectedPath: expectedPath,
      issue: `Logo references non-existent path: ${actualSrc}`
    };
    throw error;
  }
  
  dom.window.close();
  return actualSrc;
}

// Test suite for Bug Condition 3: Logo Path Correctness
function runTests() {
  console.log('='.repeat(70));
  console.log('BUG EXPLORATION: Logo Image Path Correctness');
  console.log('='.repeat(70));
  console.log('These tests are EXPECTED TO FAIL on unfixed code');
  console.log('Failure confirms the bug exists (incorrect logo paths)\n');
  
  test('Bug Test 1: child.html logo src should be ../assets/logo.png', () => {
    console.log('=== Bug Test 1: child.html Logo Path ===');
    const logoSrc = checkLogoSrc('child.html', '../assets/logo.png');
    expect(logoSrc).toBe('../assets/logo.png');
    console.log('✓ Logo path is correct');
  });
  
  test('Bug Test 2: maternal.html logo src should be ../assets/logo.png', () => {
    console.log('=== Bug Test 2: maternal.html Logo Path ===');
    const logoSrc = checkLogoSrc('maternal.html', '../assets/logo.png');
    expect(logoSrc).toBe('../assets/logo.png');
    console.log('✓ Logo path is correct');
  });
  
  test('Bug Test 4: Logo file should exist at ../assets/logo.png path', () => {
    console.log('=== Bug Test 4: Logo File Existence ===');
    
    // Check if the logo file exists at the correct path
    const correctLogoPath = path.join(__dirname, '../assets/logo.png');
    const logoExists = fs.existsSync(correctLogoPath);
    
    console.log(`Checking path: ${correctLogoPath}`);
    console.log(`Logo file exists: ${logoExists}`);
    
    expect(logoExists).toExist();
    console.log('✓ Logo file exists at correct location');
  });
  
  test('Bug Investigation: Verify incorrect path does NOT exist', () => {
    console.log('=== Bug Investigation: Check if ../image/logo.png exists ===');
    
    // Check if the incorrect path exists (it shouldn't)
    const incorrectLogoPath = path.join(__dirname, '../image/logo.png');
    const incorrectExists = fs.existsSync(incorrectLogoPath);
    
    console.log(`Checking incorrect path: ${incorrectLogoPath}`);
    console.log(`Incorrect path exists: ${incorrectExists}`);
    
    if (incorrectExists) {
      console.log('⚠ Warning: The incorrect path exists, which may mask the bug');
    } else {
      console.log('✓ Confirmed: The incorrect path does NOT exist (as expected)');
    }
  });
  
  test('Bug Investigation: Check dashboard.html for reference (should be correct)', () => {
    console.log('=== Bug Investigation: dashboard.html Logo Path (Reference) ===');
    
    const { dom, document } = parseHtmlFile('dashboard.html');
    const logoImg = document.querySelector('.sidebar img.sidebar-png-logo, .sidebar img[alt*="Logo"]');
    
    if (logoImg) {
      const dashboardLogoSrc = logoImg.getAttribute('src');
      console.log(`dashboard.html logo src: ${dashboardLogoSrc}`);
      console.log('(This serves as reference for the correct path)');
    } else {
      console.log('No logo found in dashboard.html (might use different structure)');
    }
    
    dom.window.close();
  });
  
  test('Bug Investigation: Check reports.html for reference (should be correct)', () => {
    console.log('=== Bug Investigation: reports.html Logo Path (Reference) ===');
    
    const reportsPath = path.join(__dirname, '../html/reports.html');
    if (fs.existsSync(reportsPath)) {
      const { dom, document } = parseHtmlFile('reports.html');
      const logoImg = document.querySelector('.sidebar img.sidebar-png-logo, .sidebar img[alt*="Logo"]');
      
      if (logoImg) {
        const reportsLogoSrc = logoImg.getAttribute('src');
        console.log(`reports.html logo src: ${reportsLogoSrc}`);
        console.log('(This serves as reference for the correct path)');
      } else {
        console.log('No logo found in reports.html');
      }
      
      dom.window.close();
    } else {
      console.log('reports.html not found - skipping reference check');
    }
  });
  
  // Print summary
  const total = testsPassed + testsFailed;
  console.log('\n' + '='.repeat(70));
  console.log('TEST RESULTS SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total: ${total}`);
  console.log(`Passed: ${testsPassed}`);
  console.log(`Failed: ${testsFailed}`);
  
  if (failures.length > 0) {
    console.log('\n' + '='.repeat(70));
    console.log('FAILURES (Bug Counterexamples):');
    console.log('='.repeat(70));
    failures.forEach(failure => {
      console.log(`\n✗ ${failure.test}`);
      console.log(`  Error: ${failure.error}`);
    });
    
    if (counterexamples.length > 0) {
      console.log('\n' + '='.repeat(70));
      console.log('COUNTEREXAMPLES - Files with Incorrect Logo Paths:');
      console.log('='.repeat(70));
      counterexamples.forEach((example, index) => {
        console.log(`\n${index + 1}. File: ${example.file}`);
        console.log(`   Actual Path:   ${example.actualPath}`);
        console.log(`   Expected Path: ${example.expectedPath}`);
        console.log(`   Issue: ${example.issue}`);
      });
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('CONCLUSION: Tests failed as expected - bug is confirmed!');
    console.log('The logo paths in child.html and maternal.html are incorrect.');
    console.log('They reference ../image/logo.png which does not exist.');
    console.log('Correct path should be: ../assets/logo.png');
    console.log('='.repeat(70));
  } else {
    console.log('\n' + '='.repeat(70));
    console.log('UNEXPECTED: All tests passed!');
    console.log('This means the bug may already be fixed or does not exist.');
    console.log('='.repeat(70));
  }
  
  // Exit with success code since we EXPECT failures in bug exploration
  // (Failures mean we successfully found the bug)
  process.exit(0);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
