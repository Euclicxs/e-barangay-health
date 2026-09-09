# Bugfix Requirements Document

## Introduction

The header structure on child.html, maternal.html, and purok.html pages is inconsistent with the dashboard.html and reports.html pages. Currently, these three pages have a single-level header with the top header missing the `header-right` div with `margin-left: auto` styling, and use a `module-header` div instead of a dedicated section for the page title and subtitle. This inconsistency affects the visual hierarchy and user experience across the application.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN viewing child.html, maternal.html, or purok.html THEN the header structure uses a `module-header` div instead of a dedicated section (like `dashboard-header`)

1.2 WHEN viewing child.html, maternal.html, or purok.html THEN the top header lacks the `header-right` div with proper `margin-left: auto` styling

1.3 WHEN viewing child.html, maternal.html, or purok.html THEN the page title and subtitle are wrapped in `module-header` div which has different styling and layout than dashboard pages

### Expected Behavior (Correct)

2.1 WHEN viewing child.html, maternal.html, or purok.html THEN the system SHALL display a two-part header structure matching dashboard.html with a top header containing a `header-right` div styled with `margin-left: auto`

2.2 WHEN viewing child.html, maternal.html, or purok.html THEN the system SHALL display page title and subtitle in a dedicated section (e.g., `page-header` or similar) positioned below the top header

2.3 WHEN viewing child.html, maternal.html, or purok.html THEN the system SHALL maintain the same visual hierarchy as dashboard.html with consistent spacing and layout between the top header and page title section

### Unchanged Behavior (Regression Prevention)

3.1 WHEN viewing dashboard.html or reports.html THEN the system SHALL CONTINUE TO display the existing two-part header structure without any changes

3.2 WHEN viewing child.html, maternal.html, or purok.html THEN the system SHALL CONTINUE TO display all existing header content (location tag, bell icon, time display, page title, subtitle, and action buttons)

3.3 WHEN viewing any page THEN the system SHALL CONTINUE TO display the sidebar navigation and main content layout without changes

3.4 WHEN interacting with header elements (bell icon, time display) THEN the system SHALL CONTINUE TO function as currently implemented
