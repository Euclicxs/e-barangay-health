# Bugfix Requirements Document

## Introduction

The "Encode Visit" button on pages with data entry functionality (child.html, maternal.html) is positioned on the left side of the dashboard-header section, appearing in the normal document flow after the title div. According to the user's requirements and reference screenshot, this button should be positioned on the right side of the header, aligned with other right-side header elements (location tag, notification bell, time display) to create a consistent and professional layout matching the dashboard overview design.

**Impact:** The button positioning creates visual inconsistency with the expected UI layout and makes the interface appear less polished. Users may have difficulty locating the button quickly due to unexpected placement.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user views child.html or maternal.html THEN the system displays the "Encode Visit" button immediately after the title div within the dashboard-header section without explicit flexbox layout, causing it to appear in the left column of the visual layout

1.2 WHEN the dashboard-header section renders THEN the system does not apply flexbox display properties with justify-content: space-between, resulting in the button and title stacking vertically or appearing in document flow order rather than positioned on opposite sides

1.3 WHEN the page layout is viewed THEN the system shows the "Encode Visit" button visually disconnected from the right-side header controls (location tag, notification bell, time display) that appear in the top-header section above

### Expected Behavior (Correct)

2.1 WHEN a user views child.html or maternal.html THEN the system SHALL display the "Encode Visit" button on the right side of the dashboard-header section, aligned with the visual position of right-side elements like the location tag and time display

2.2 WHEN the dashboard-header section renders THEN the system SHALL apply CSS flexbox layout with display: flex and justify-content: space-between to position the title div on the left and the button on the right

2.3 WHEN the page layout is viewed THEN the system SHALL show the "Encode Visit" button in the same horizontal alignment as other right-side header elements, creating visual consistency across the header area

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the "Encode Visit" button is clicked THEN the system SHALL CONTINUE TO open the appropriate modal dialog (Encode Child Immunization Visit modal for child.html, Encode Maternal Prenatal Visit modal for maternal.html)

3.2 WHEN the button is displayed THEN the system SHALL CONTINUE TO use the existing .btn-primary CSS class with cyan background, dark text, and hover effects

3.3 WHEN the dashboard-header title and subtitle are displayed THEN the system SHALL CONTINUE TO show the correct page title, icon, and descriptive text on the left side

3.4 WHEN pages without "Encode Visit" buttons (dashboard.html, purok.html, reports.html) are viewed THEN the system SHALL CONTINUE TO display their headers with their existing layout unchanged

3.5 WHEN the button text and icon render THEN the system SHALL CONTINUE TO display "<i class="fa-solid fa-plus"></i> Encode Visit" with the plus icon

## Bug Condition Analysis

### Bug Condition Function

The bug condition identifies dashboard-header sections that contain an "Encode Visit" button but lack proper flexbox positioning:

```pascal
FUNCTION isBugCondition(section)
  INPUT: section of type HTMLElement
  OUTPUT: boolean
  
  // Returns true when dashboard-header has button but no flexbox layout
  RETURN (
    section.className = "dashboard-header"
    AND section.containsButton("Encode Visit" OR "Encode")
    AND NOT section.hasFlexboxLayout()
  )
END FUNCTION
```

### Property Specification

**Property: Fix Checking - Button Right Alignment**

```pascal
FOR ALL section WHERE isBugCondition(section) DO
  cssRules ← getComputedStyle(section)
  buttonElement ← section.querySelector('button.btn-primary')
  
  ASSERT cssRules.display = "flex"
  ASSERT cssRules.justifyContent = "space-between"
  ASSERT cssRules.alignItems = "center"
  ASSERT buttonElement.position_in_parent = "right-side"
END FOR
```

**Property: Preservation Checking - Non-Buggy Pages**

```pascal
FOR ALL page WHERE NOT isBugCondition(page.dashboardHeader) DO
  ASSERT page.layout = page'.layout
  ASSERT page.buttonFunctionality = page'.buttonFunctionality
  // Where page' is the fixed version - ensures unchanged pages remain identical
END FOR
```

This ensures:
- **Fix Checking**: All pages with "Encode Visit" buttons will have them positioned on the right side using flexbox
- **Preservation Checking**: Pages without the issue and button functionality will remain unchanged
