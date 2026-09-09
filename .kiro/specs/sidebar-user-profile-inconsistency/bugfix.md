# Bugfix Requirements Document

## Introduction

The sidebar user profile displays inconsistent user information across different BHW dashboard pages. Some pages (child.html, maternal.html, purok.html) show hardcoded user information ("Maria Santos, BHW · Purok Calachuchi") while other pages (dashboard.html, reports.html) use dynamic session-based data with JavaScript-populated elements (userNameDisplay, userRoleDisplay). This inconsistency confuses users as the displayed identity does not match the logged-in user across all pages, violating the expected behavior that a single authenticated session should display the same user information system-wide.

**Impact:** Users see different names and profiles when navigating between pages, creating confusion about who is currently logged in and reducing trust in the application's authentication system.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a BHW user navigates to child.html, maternal.html, or purok.html THEN the system displays hardcoded user information ("Maria Santos" with avatar "M" and "BHW · Purok Calachuchi") in the sidebar footer regardless of which user is actually logged in

1.2 WHEN a BHW user navigates to dashboard.html or reports.html THEN the system displays dynamic user information populated from session.js using getCurrentUserName() and getCurrentUserId() with empty avatar elements that are filled via JavaScript

1.3 WHEN a BHW user navigates between different pages within the same session THEN the system shows different user names in the sidebar (e.g., "Maria Santos" on child.html but "System Administrator" or actual logged-in BHW name on dashboard.html)

### Expected Behavior (Correct)

2.1 WHEN a BHW user navigates to child.html, maternal.html, or purok.html THEN the system SHALL display the logged-in user's information from session.js using dynamic element IDs (userNameDisplay, userRoleDisplay) with the avatar populated from the first letter of getCurrentUserName()

2.2 WHEN a BHW user navigates to dashboard.html or reports.html THEN the system SHALL continue to display dynamic user information populated from session.js as it currently does

2.3 WHEN a BHW user navigates between different pages within the same session THEN the system SHALL display consistent user information across all pages, showing the same name, role, and avatar derived from getCurrentUserName() and getCurrentUserId()

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a logged-in user views the sidebar on dashboard.html or reports.html THEN the system SHALL CONTINUE TO display their user information dynamically using the existing JavaScript implementation in dashboard.js

3.2 WHEN session.js functions getCurrentUserName() and getCurrentUserId() are called THEN the system SHALL CONTINUE TO return the correct user information from the session storage

3.3 WHEN a user logs out using the logout button in the sidebar footer THEN the system SHALL CONTINUE TO clear the session and redirect to login.html

3.4 WHEN the sidebar displays menu items, badges, and navigation links THEN the system SHALL CONTINUE TO show the correct active page indicator and functional navigation

3.5 WHEN JavaScript is disabled in the browser THEN the system SHALL CONTINUE TO fail gracefully by showing empty user profile fields rather than crashing

## Bug Condition Analysis

### Bug Condition Function

The bug condition identifies pages that have hardcoded user information in their HTML:

```pascal
FUNCTION isBugCondition(page)
  INPUT: page of type HTMLPage
  OUTPUT: boolean
  
  // Returns true when the page has hardcoded user profile in sidebar-footer
  RETURN (
    page.fileName IN ["child.html", "maternal.html", "purok.html"] 
    AND page.contains('<div class="user-info"><h4>Maria Santos</h4>')
    AND NOT page.contains('id="userNameDisplay"')
  )
END FUNCTION
```

### Property Specification

**Property: Fix Checking - Dynamic User Profile Display**

```pascal
FOR ALL page WHERE isBugCondition(page) DO
  sidebar ← page.querySelector('.sidebar-footer .user-profile')
  
  ASSERT sidebar.contains('<h4 id="userNameDisplay"></h4>')
  ASSERT sidebar.contains('<p id="userRoleDisplay"></p>')
  ASSERT sidebar.contains('<div class="avatar"></div>')
  ASSERT page.hasJavaScriptCall('getCurrentUserName()')
  ASSERT page.hasJavaScriptCall('getCurrentUserId()')
END FOR
```

**Property: Preservation Checking - Non-Buggy Pages**

```pascal
FOR ALL page WHERE NOT isBugCondition(page) DO
  ASSERT page.sidebarUserProfile = page'.sidebarUserProfile
  // Where page' is the fixed version - ensures unchanged pages remain identical
END FOR
```

This ensures:
- **Fix Checking**: All buggy pages (child.html, maternal.html, purok.html) will use dynamic session-based user profiles
- **Preservation Checking**: Pages already working correctly (dashboard.html, reports.html) will remain unchanged
