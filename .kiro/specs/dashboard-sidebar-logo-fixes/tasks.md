# Implementation Plan

## Bug 1: Dashboard Stat Card Modals Not Opening

- [x] 1. Write bug condition exploration tests for stat card click handling
  - **Property 1: Bug Condition** - Dashboard Stat Card Modal Opening
  - **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior - they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bugs exist
  - **Test Approach**: Write automated tests that simulate clicks and check modal visibility
  - Test that clicking stat card with `data-modal="total-records"` opens `totalRecordsModal`
  - Test that clicking stat card with `data-modal="overdue"` opens `overdueModal`
  - Test that clicking stat card with `data-modal="due-this-month"` opens `dueThisMonthModal`
  - Test that clicking stat card with `data-modal="completed"` opens `completedModal`
  - Run tests on UNFIXED code (dashboard.html + dashboard.js)
  - **EXPECTED OUTCOME**: Tests FAIL (modals remain hidden despite clicks)
  - Document counterexamples: which stat cards fail to open modals and why
  - Investigate: Check if click events fire, if modal IDs are correct, if CSS blocks interactions
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2_

## Bug 2: Sidebar Structure Inconsistency

- [x] 2. Write bug condition exploration tests for sidebar HTML structure
  - **Property 1: Bug Condition** - Sidebar Structure Consistency
  - **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the HTML when they fail**
  - **NOTE**: These tests encode the expected behavior - they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate sidebar inconsistencies
  - **Test Approach**: Parse HTML files and assert correct class names exist
  - Test that child.html sidebar contains `.sidebar-header` class (not `.brand`)
  - Test that maternal.html sidebar contains `.sidebar-header` class (not `.brand`)
  - Test that purok.html sidebar contains `.sidebar-header` class (not `.brand`)
  - Test that all pages have matching sidebar structure
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (child, maternal, purok use `.brand` instead of `.sidebar-header`)
  - Document counterexamples: list which files have wrong class names
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.3, 1.4_

## Bug 3: Logo Path Inconsistency

- [x] 3. Write bug condition exploration tests for logo image paths
  - **Property 1: Bug Condition** - Logo Path Correctness
  - **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the HTML when they fail**
  - **NOTE**: These tests encode the expected behavior - they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate logo path errors
  - **Test Approach**: Parse HTML and check logo src attributes
  - Test that child.html logo src is `../assets/logo.png` (not `../image/logo.png`)
  - Test that maternal.html logo src is `../assets/logo.png` (not `../image/logo.png`)
  - Test that purok.html logo src is `../assets/logo.png` (not `../image/logo.png`)
  - Test that logo file exists at `../assets/logo.png` path
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (child, maternal, purok reference `../image/logo.png` which doesn't exist)
  - Document counterexamples: list which files have incorrect paths
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.5, 1.6_

- [x] 4. Write preservation property tests (BEFORE implementing fixes)
  - **Property 2: Preservation** - Non-Bug-Condition Functionality
  - **IMPORTANT**: Follow observation-first methodology
  - **Test Plan**: Observe and document existing behavior that must be preserved
  - Observe: Modal close buttons (X, Cancel, Back to Dashboard) close modals on unfixed code
  - Observe: Clicking modal background overlay closes modal on unfixed code
  - Observe: Sidebar navigation links navigate to correct pages on unfixed code
  - Observe: navigation.js highlights active menu item on unfixed code
  - Observe: Session validation redirects unauthorized users on unfixed code
  - Observe: User profile displays correctly in sidebar footer on unfixed code
  - Observe: Notification bell, logout button, clock function correctly on unfixed code
  - Observe: Logo styling applies correctly where logo loads (dashboard, reports) on unfixed code
  - Write property-based tests capturing all observed behaviors
  - Verify tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 5. Implement fixes for all three bugs

  - [x] 5.1 Fix dashboard stat card click handlers (Bug 1)
    - Investigate root cause from exploration test failures
    - Review dashboard.js lines 169-202 (stat card click handler setup)
    - Verify that querySelectorAll properly finds all 4 stat cards
    - Check that data-modal attribute values in HTML match statCardModals keys
    - Ensure click handlers attach properly after DOM is loaded
    - Verify modal ID derivation logic works correctly
    - Test that populateModal function executes before modal display
    - Ensure modal.style.display = 'flex' sets correctly
    - Consider alternative: use addEventListener instead of onclick if needed
    - **Possible Fix**: Ensure stat cards have proper cursor styling and click event propagation
    - _Bug_Condition: isBugCondition1(click_event) where click_event.target is stat card with data-modal attribute_
    - _Expected_Behavior: Modal opens, populates with data, displays with style.display='flex'_
    - _Preservation: All modal close methods, other button clicks, navigation unchanged_
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3_

  - [x] 5.2 Fix sidebar HTML structure in child.html (Bug 2)
    - Open child.html
    - Find sidebar section (approximately lines 14-63)
    - Change `<div class="brand">` to `<div class="sidebar-header">` (line ~16)
    - Change `<div class="brand-logo">` to `<div class="sidebar-logo">` (line ~17)
    - Ensure structure matches dashboard.html sidebar exactly
    - Verify all child elements have consistent class names
    - Save file
    - _Bug_Condition: isBugCondition2(page) where page is child.html with .brand class_
    - _Expected_Behavior: Sidebar uses .sidebar-header and matches dashboard structure_
    - _Preservation: Navigation links, menu highlighting, user profile display unchanged_
    - _Requirements: 2.3, 2.4, 3.4, 3.5, 3.6_

  - [x] 5.3 Fix logo path in child.html (Bug 3)
    - In child.html sidebar section
    - Find logo img element (line ~18)
    - Change `src="../image/logo.png"` to `src="../assets/logo.png"`
    - Verify path is correct relative to html directory
    - Save file
    - _Bug_Condition: isBugCondition3(page) where page is child.html with ../image/ path_
    - _Expected_Behavior: Logo loads from ../assets/logo.png successfully_
    - _Preservation: Logo styling with .sidebar-png-logo class unchanged_
    - _Requirements: 2.5, 2.6, 3.7, 3.8_

  - [x] 5.4 Fix sidebar HTML structure in maternal.html (Bug 2)
    - Open maternal.html
    - Find sidebar section (approximately lines 15-78)
    - Change `<div class="brand">` to `<div class="sidebar-header">` (line ~17)
    - Change `<div class="brand-logo">` to `<div class="sidebar-logo">` (line ~18)
    - Ensure structure matches dashboard.html sidebar exactly
    - Verify all child elements have consistent class names
    - Save file
    - _Bug_Condition: isBugCondition2(page) where page is maternal.html with .brand class_
    - _Expected_Behavior: Sidebar uses .sidebar-header and matches dashboard structure_
    - _Preservation: Navigation links, menu highlighting, user profile display unchanged_
    - _Requirements: 2.3, 2.4, 3.4, 3.5, 3.6_

  - [x] 5.5 Fix logo path in maternal.html (Bug 3)
    - In maternal.html sidebar section
    - Find logo img element (line ~19)
    - Change `src="../image/logo.png"` to `src="../assets/logo.png"`
    - Verify path is correct relative to html directory
    - Save file
    - _Bug_Condition: isBugCondition3(page) where page is maternal.html with ../image/ path_
    - _Expected_Behavior: Logo loads from ../assets/logo.png successfully_
    - _Preservation: Logo styling with .sidebar-png-logo class unchanged_
    - _Requirements: 2.5, 2.6, 3.7, 3.8_

  - [x] 5.6 Fix sidebar HTML structure in purok.html (Bug 2)
    - Open purok.html
    - Find sidebar section (approximately lines 12-66)
    - Change `<div class="brand">` to `<div class="sidebar-header">` (line ~14)
    - Change `<div class="brand-logo">` to `<div class="sidebar-logo">` (line ~15)
    - Ensure structure matches dashboard.html sidebar exactly
    - Verify all child elements have consistent class names
    - Save file
    - _Bug_Condition: isBugCondition2(page) where page is purok.html with .brand class_
    - _Expected_Behavior: Sidebar uses .sidebar-header and matches dashboard structure_
    - _Preservation: Navigation links, menu highlighting, user profile display unchanged_
    - _Requirements: 2.3, 2.4, 3.4, 3.5, 3.6_

  - [x] 5.7 Fix logo path in purok.html (Bug 3)
    - In purok.html sidebar section
    - Find logo img element (line ~16)
    - Change `src="../image/logo.png"` to `src="../assets/logo.png"`
    - Verify path is correct relative to html directory
    - Save file
    - _Bug_Condition: isBugCondition3(page) where page is purok.html with ../image/ path_
    - _Expected_Behavior: Logo loads from ../assets/logo.png successfully_
    - _Preservation: Logo styling with .sidebar-png-logo class unchanged_
    - _Requirements: 2.5, 2.6, 3.7, 3.8_

  - [x] 5.8 Verify bug condition exploration tests now pass (Bug 1)
    - **Property 1: Expected Behavior** - Dashboard Stat Card Modal Opening
    - **IMPORTANT**: Re-run the SAME tests from task 1 - do NOT write new tests
    - Run stat card click tests on FIXED code
    - Verify clicking each stat card opens its corresponding modal
    - Verify modals display correctly with populated data
    - **EXPECTED OUTCOME**: All tests PASS (confirms stat cards work)
    - _Requirements: 2.1, 2.2_

  - [x] 5.9 Verify bug condition exploration tests now pass (Bug 2)
    - **Property 1: Expected Behavior** - Sidebar Structure Consistency
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run sidebar structure tests on FIXED HTML files
    - Verify child.html, maternal.html, purok.html all use `.sidebar-header`
    - Verify all sidebars have matching structure
    - **EXPECTED OUTCOME**: All tests PASS (confirms sidebar consistency)
    - _Requirements: 2.3, 2.4_

  - [x] 5.10 Verify bug condition exploration tests now pass (Bug 3)
    - **Property 1: Expected Behavior** - Logo Path Correctness
    - **IMPORTANT**: Re-run the SAME tests from task 3 - do NOT write new tests
    - Run logo path tests on FIXED HTML files
    - Verify child.html, maternal.html, purok.html all reference `../assets/logo.png`
    - Manually load each page in browser to confirm logos display
    - **EXPECTED OUTCOME**: All tests PASS (confirms logo loads correctly)
    - _Requirements: 2.5, 2.6_

  - [x] 5.11 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Bug-Condition Functionality
    - **IMPORTANT**: Re-run the SAME tests from task 4 - do NOT write new tests
    - Run preservation property tests on FIXED code
    - Verify modal close buttons still work correctly
    - Verify sidebar navigation still works correctly
    - Verify session validation still works correctly
    - Verify all other dashboard features work correctly
    - Verify logo styling unchanged where applicable
    - **EXPECTED OUTCOME**: All tests PASS (confirms no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 6. Checkpoint - Manual testing and verification
  - Load dashboard.html in browser, test all four stat cards click to open modals
  - Verify each modal displays correct data and closes properly
  - Navigate to child.html, verify sidebar displays correctly and logo loads
  - Navigate to maternal.html, verify sidebar displays correctly and logo loads
  - Navigate to purok.html, verify sidebar displays correctly and logo loads
  - Navigate to reports.html, verify no regressions in sidebar or logo
  - Test all sidebar navigation links across all pages
  - Test logout functionality across all pages
  - Verify session management still works correctly
  - Confirm all visual styling is consistent across pages
  - Ensure all tests pass, ask the user if questions arise
