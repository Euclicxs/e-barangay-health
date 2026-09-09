# Bugfix Requirements Document

## Introduction

The Purok Masterlists page (purok.html) displays incomplete statistics and lacks proper population breakdown. Currently, only 3 stat cards are shown, and the page doesn't properly reflect the total population, children, and mothers assigned to each purok. This prevents Barangay Health Workers (BHWs) from getting a complete view of their assigned purok demographics and those due for visits.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN viewing the Purok Masterlists page THEN the system displays only 3 stat cards (Total Households, Due for Visit, Assigned BHWs) without showing Total Population breakdown

1.2 WHEN viewing the "Due for Visit" stat card THEN the system does not show the breakdown of "X overdue · Y due this month"

1.3 WHEN viewing the table entries count THEN the system does not show the breakdown format "X entries (Y children, Z mothers)"

1.4 WHEN viewing purok statistics THEN the system does not calculate population dynamically from the actual records data for children and mothers in each purok

### Expected Behavior (Correct)

2.1 WHEN viewing the Purok Masterlists page THEN the system SHALL display 4 stat cards: Total Households, Total Population (showing "X children · Y mothers"), Due for Visit (showing "X overdue · Y due this month"), and Assigned BHWs

2.2 WHEN viewing the Total Population stat card THEN the system SHALL dynamically calculate and display the count of children and mothers from the records data with format "X children · Y mothers"

2.3 WHEN viewing the Due for Visit stat card THEN the system SHALL dynamically calculate and display "X overdue · Y due this month" based on visit schedules for both children and mothers

2.4 WHEN viewing the table entries count THEN the system SHALL display "X entries (Y children, Z mothers)" where X is the total count, Y is the number of child records, and Z is the number of maternal records

2.5 WHEN filtering by specific purok THEN the system SHALL recalculate all statistics to reflect only the records for that purok

### Unchanged Behavior (Regression Prevention)

3.1 WHEN viewing the existing Total Households stat card THEN the system SHALL CONTINUE TO display and calculate household counts as currently implemented

3.2 WHEN viewing the existing Assigned BHWs stat card THEN the system SHALL CONTINUE TO display BHW assignments as currently implemented

3.3 WHEN interacting with the purok filter dropdown THEN the system SHALL CONTINUE TO filter the table records as currently implemented

3.4 WHEN viewing other pages (child.html, maternal.html, dashboard.html) THEN the system SHALL CONTINUE TO function without any impact from this enhancement

3.5 WHEN the table displays records THEN the system SHALL CONTINUE TO show all existing columns and data without modification
