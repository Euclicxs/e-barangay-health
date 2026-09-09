# Bugfix Requirements Document

## Introduction

This document addresses three critical bugs in the e-Barangay Health System that affect the dashboard, sidebar, and logo display functionality. These issues prevent users from accessing detailed records through stat cards, create inconsistent navigation experiences across pages, and result in broken logo displays. The bugs impact all users (administrators and BHWs) and affect the professional appearance and usability of the system.

## Bug Analysis

### Current Behavior (Defect)

**Issue 1: Dashboard Stat Card Modal Functionality**

1.1 WHEN a user clicks on any stat card (Total Child Records, Overdue Immunizations, Due This Month, or Completed Visits) on the dashboard page THEN the system does not respond and no modal opens

1.2 WHEN a user clicks on the stat card's clickable area THEN the expected modal with detailed records remains hidden and the page shows no visual feedback

**Issue 2: Sidebar Inconsistency Across Pages**

1.3 WHEN navigating from dashboard.html to purok.html or child.html or maternal.html THEN the system displays different sidebar structures with inconsistent class names (`sidebar-header` vs `brand`) and layout

1.4 WHEN viewing the sidebar across different pages THEN the system shows inconsistent element structures where some pages use `<div class="sidebar-header">` and others use `<div class="brand">`

**Issue 3: Logo Not Loading Consistently**

1.5 WHEN the page loads on dashboard.html or reports.html THEN the system attempts to load the logo from `../assets/logo.png` which displays correctly

1.6 WHEN the page loads on purok.html or child.html or maternal.html THEN the system attempts to load the logo from `../image/logo.png` which fails because the directory does not exist

### Expected Behavior (Correct)

**Issue 1: Dashboard Stat Card Modal Functionality**

2.1 WHEN a user clicks on any stat card with a data-modal attribute THEN the system SHALL open the corresponding modal, populate it with the appropriate data, and display it with proper visibility

2.2 WHEN a user clicks on a stat card THEN the system SHALL execute the click handler, identify the correct modal ID, populate the modal table, and set the modal display style to 'flex'

**Issue 2: Sidebar Inconsistency Across Pages**

2.3 WHEN navigating between all pages (dashboard, child, maternal, purok, reports, admin) THEN the system SHALL display an identical sidebar structure with consistent class names and layout

2.4 WHEN viewing the sidebar HTML structure THEN the system SHALL use the same class name `sidebar-header` (not `brand`) consistently across all pages for the logo/brand container

**Issue 3: Logo Not Loading Consistently**

2.5 WHEN any page loads and displays the sidebar logo THEN the system SHALL reference the logo from the correct path `../assets/logo.png` which exists in the assets directory

2.6 WHEN the logo image element renders THEN the system SHALL successfully load and display the logo.png file without broken image indicators

### Unchanged Behavior (Regression Prevention)

**Issue 1: Dashboard Stat Card Modal Functionality**

3.1 WHEN the modal close buttons are clicked THEN the system SHALL CONTINUE TO close modals and hide them properly

3.2 WHEN clicking outside a modal (on the modal background overlay) THEN the system SHALL CONTINUE TO close the modal as currently implemented

3.3 WHEN the page loads and session validation runs THEN the system SHALL CONTINUE TO validate user sessions and redirect unauthorized users

**Issue 2: Sidebar Inconsistency Across Pages**

3.4 WHEN viewing the sidebar menu items and their links THEN the system SHALL CONTINUE TO navigate to the correct pages when clicked

3.5 WHEN the navigation.js script runs THEN the system SHALL CONTINUE TO highlight the active menu item based on the current page

3.6 WHEN viewing the sidebar footer with user profile THEN the system SHALL CONTINUE TO display user information and the logout button

**Issue 3: Logo Not Loading Consistently**

3.7 WHEN other asset files (like CSS, JavaScript) are loaded THEN the system SHALL CONTINUE TO load them from their current correct paths

3.8 WHEN the logo CSS styling is applied THEN the system SHALL CONTINUE TO use the existing `.sidebar-png-logo` class styles
