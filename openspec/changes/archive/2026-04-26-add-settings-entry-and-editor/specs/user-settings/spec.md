## ADDED Requirements

### Requirement: Settings page displays current values

When the user navigates to the settings page, the system SHALL read the current `name` and `maxCourseCount` from the IndexedDB `settings` store and pre-fill the corresponding input fields before rendering the page.

#### Scenario: Settings page pre-fills name

- **WHEN** the user navigates to the settings page
- **THEN** the `name` input field SHALL display the current value stored in the `settings` store

#### Scenario: Settings page pre-fills maxCourseCount

- **WHEN** the user navigates to the settings page
- **THEN** the `maxCourseCount` input field SHALL display the current value stored in the `settings` store

### Requirement: Settings page has save and cancel controls

The settings page SHALL render a "儲存" (save) button and a "取消" (cancel) button.

#### Scenario: Save and cancel buttons are present

- **WHEN** the settings page is rendered
- **THEN** a "儲存" button and a "取消" button SHALL both be visible and interactive

### Requirement: Save settings and return to home screen

When the user submits valid settings, the system SHALL write the new `name` and `maxCourseCount` to the IndexedDB `settings` store and navigate to the home screen.

#### Scenario: Successful save writes to IndexedDB

- **WHEN** the user clicks "儲存" with valid `name` and `maxCourseCount` values
- **THEN** the system SHALL call `saveSettings()` and write the new values to the `settings` store

#### Scenario: Successful save navigates home

- **WHEN** `saveSettings()` completes successfully
- **THEN** the system SHALL navigate to the home screen

### Requirement: Successful save updates home screen

After a successful save, the home screen SHALL reflect the latest `name` and `maxCourseCount` by re-reading from IndexedDB on route entry. The system SHALL NOT use a global reactive store, pub/sub, or subscription to propagate the update.

#### Scenario: Home screen re-reads settings on entry

- **WHEN** the home screen route is entered after a successful settings save
- **THEN** `showHome()` SHALL call `getSettings()` from IndexedDB and render the updated `name` and `maxCourseCount`

#### Scenario: Greeting reflects new name

- **WHEN** the user saves a new `name` and the home screen loads
- **THEN** the greeting SHALL display "嗨，<new name>"

#### Scenario: Count reflects new maxCourseCount

- **WHEN** the user saves a new `maxCourseCount` and the home screen loads
- **THEN** the count display SHALL show "<usedCount>/<new maxCourseCount>"

### Requirement: Cancel settings editing

When the user clicks "取消", the system SHALL navigate to the home screen without writing to the `settings` store.

#### Scenario: Cancel discards changes and returns home

- **WHEN** the user clicks "取消" on the settings page
- **THEN** the system SHALL navigate to the home screen without calling `saveSettings()`

#### Scenario: Cancel preserves original values

- **WHEN** the user returns to the home screen after cancelling
- **THEN** the home screen SHALL display the `name` and `maxCourseCount` values that existed before the settings page was opened
