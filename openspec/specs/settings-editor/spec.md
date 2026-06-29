# settings-editor Specification

## Purpose

TBD - created by archiving change 'add-settings-entry-and-editor'. Update Purpose after archive.

## Requirements

### Requirement: Settings validation

The settings form SHALL validate all fields before writing to IndexedDB. If any field fails validation, the system SHALL NOT call `saveSettings()` or write to the `settings` store.

#### Scenario: Valid input passes validation

- **WHEN** the user provides a non-empty `name` (1–50 characters after trimming) and an integer `maxCourseCount` between 1 and 9999
- **THEN** the system SHALL proceed to write to IndexedDB and navigate home
- **AND** no error messages SHALL be displayed

---
### Requirement: Empty name is rejected

The system SHALL reject a `name` value that is empty or contains only whitespace after trimming.

#### Scenario: Empty name shows error

- **WHEN** the user submits the settings form with an empty `name` field (or whitespace only)
- **THEN** the system SHALL display the error message "名稱不可空白" below the `name` input
- **AND** SHALL NOT write to the `settings` store
- **AND** the input field SHALL retain the user's entered value

---
### Requirement: Name exceeding 50 characters is rejected

The system SHALL reject a `name` value whose length exceeds 50 characters after trimming.

#### Scenario: Overlong name shows error

- **WHEN** the user submits the settings form with a `name` longer than 50 characters
- **THEN** the system SHALL display the error message "名稱最多 50 個字" below the `name` input
- **AND** SHALL NOT write to the `settings` store

---
### Requirement: Non-positive-integer maxCourseCount is rejected

The system SHALL reject any `maxCourseCount` value that is not a positive integer between 1 and 9999. Rejected values include: decimals, negative numbers, zero, non-numeric strings, and empty input.

#### Scenario: Zero maxCourseCount shows error

- **WHEN** the user submits the settings form with `maxCourseCount` equal to 0
- **THEN** the system SHALL display the error message "請輸入 1 到 9999 之間的整數" below the `maxCourseCount` input
- **AND** SHALL NOT write to the `settings` store

#### Scenario: Negative maxCourseCount shows error

- **WHEN** the user submits the settings form with a negative `maxCourseCount`
- **THEN** the system SHALL display the error message "請輸入 1 到 9999 之間的整數" below the `maxCourseCount` input
- **AND** SHALL NOT write to the `settings` store

#### Scenario: Decimal maxCourseCount shows error

- **WHEN** the user submits the settings form with a decimal `maxCourseCount` (e.g., 1.5)
- **THEN** the system SHALL display the error message "請輸入 1 到 9999 之間的整數" below the `maxCourseCount` input
- **AND** SHALL NOT write to the `settings` store

#### Scenario: maxCourseCount exceeding 9999 shows error

- **WHEN** the user submits the settings form with `maxCourseCount` greater than 9999
- **THEN** the system SHALL display the error message "請輸入 1 到 9999 之間的整數" below the `maxCourseCount` input
- **AND** SHALL NOT write to the `settings` store

