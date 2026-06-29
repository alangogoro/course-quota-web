## MODIFIED Requirements

### Requirement: 首頁版面配置

The system SHALL use the home screen as the default route. The home screen MUST display these primary elements without any competing main content:

1. A top home header containing a table-tennis image on the left and the settings entry button on the right.
2. Greeting text rendered as `嗨 <name>`, where `<name>` comes from the `settings` store.
3. Count text rendered as `已上課 <usedCount>/<maxCourseCount>`, where `<usedCount>` is the sum of `count` across all attended course records and `<maxCourseCount>` comes from the `settings` store.
4. The primary action button labeled `新增上課紀錄`.
5. The secondary entry for the history page.

The home screen MUST NOT display CSV import, CSV export, or unrelated data-management entries.

#### Scenario: Home screen displays dynamic greeting and count sum

- **WHEN** the user opens the app
- **AND** settings and records stores have loaded
- **THEN** the home screen MUST display `嗨 <name>` using the stored name
- **AND** the home screen MUST display `已上課 <usedCount>/<maxCourseCount>` where `<usedCount>` is calculated from record `count` values
- **AND** the count MUST NOT be hard-coded

##### Example: Count sum display

| Records | Expected home count |
| --- | --- |
| one record with `count=1` | `1/100` |
| records with `count=1` and `count=3` | `4/100` |
| one legacy record without `count` and one record with `count=2` | `3/100` |

#### Scenario: Count can exceed target

- **WHEN** `<usedCount>` is greater than `<maxCourseCount>`
- **THEN** the home screen MUST display `已上課 <usedCount>/<maxCourseCount>`, for example `已上課 105/100`
- **AND** the system MUST NOT hide, cap, or treat the value as an error

#### Scenario: Home header displays table-tennis image and settings button

- **WHEN** the home screen is rendered
- **THEN** the home header MUST display a table-tennis image on the left
- **AND** the home header MUST display the settings entry button on the right
- **AND** both elements MUST fit within a 375 CSS px wide viewport without horizontal overflow

### Requirement: 有確認閘門的新增課程流程

The system SHALL show a modal confirmation form after the user presses the primary `新增上課紀錄` button and before the system writes any course record. The modal MUST NOT display `courseNumber`. The modal MUST display the selected date as `今天是 M 月 D 日 星期X`, MUST allow the user to choose month and day, MUST allow selecting `count` from 1 through 10, MUST allow entering a note up to 50 user-perceived characters, and MUST provide visually distinct `確認新增` and `取消` controls.

#### Scenario: Pressing add opens modal without writing

- **WHEN** the user presses `新增上課紀錄` on the home screen
- **THEN** the system MUST display the add-record modal over the home screen
- **AND** the modal MUST display date, count, and note controls with visible labels
- **AND** the system MUST NOT write any course record before the user presses `確認新增`

#### Scenario: Default modal values

- **WHEN** the add-record modal opens
- **THEN** the selected month and day MUST default to the device local date
- **AND** the displayed weekday MUST match the selected month and day in the current year
- **AND** `count` MUST default to 1
- **AND** `note` MUST default to an empty value

#### Scenario: Selecting month and day updates weekday

- **WHEN** the current year is 2026
- **AND** the user selects 6 月 29 日 in the add-record modal
- **THEN** the modal MUST display 星期一
- **AND** confirming the modal MUST save `attendedDate` as `2026-06-29`
- **AND** confirming the modal MUST save `weekday` as 1

#### Scenario: Invalid month day clamps to valid date

- **WHEN** the current year is 2026
- **AND** the user attempts to select 2 月 31 日
- **THEN** the modal MUST clamp the selected date to 2 月 28 日
- **AND** the modal MUST update the displayed weekday for 2026-02-28

#### Scenario: Count and note validation

- **WHEN** the user enters an empty count, a count below 1, a count above 10, or a non-integer count
- **THEN** the modal MUST block confirmation and display an error near the count control
- **WHEN** the user enters a note longer than 50 user-perceived characters
- **THEN** the modal MUST block confirmation and display an error near the note control

#### Scenario: Cancel add modal

- **WHEN** the add-record modal is open
- **AND** the user presses `取消`
- **THEN** the modal MUST close
- **AND** the system MUST NOT write a course record
- **AND** `settings.sequence` MUST NOT advance

### Requirement: Home screen layout

The home screen layout SHALL include a dedicated `.home-header` area at the top of the `.page` element. The `.home-header` area MUST contain a table-tennis image aligned to the left and the settings entry button aligned to the right.

#### Scenario: Home header renders table-tennis image and settings button

- **WHEN** the home screen is rendered
- **THEN** a `.home-header` container MUST exist at the top of the `.page` element
- **AND** the `.home-header` container MUST contain the table-tennis image on the left
- **AND** the `.home-header` container MUST contain the settings entry button on the right

#### Scenario: Table-tennis image is accessible

- **WHEN** the home header table-tennis image is rendered
- **THEN** the image MUST have non-empty alternative text or an equivalent accessible label
- **AND** the image MUST NOT be an emoji glyph

## ADDED Requirements

### Requirement: Add-record modal visual treatment

The add-record modal SHALL follow the existing site style: light surface, large rounded corners, senior-friendly typography, clear primary and secondary actions, and a scrim that visually separates the modal from the home screen. The modal controls MUST maintain at least 48 x 48 CSS px touch targets.

#### Scenario: Modal has clear escape and confirm actions

- **WHEN** the add-record modal is visible
- **THEN** it MUST show a visible `取消` control
- **AND** it MUST show a visible `確認新增` control
- **AND** each control MUST have a clickable area of at least 48 x 48 CSS px

#### Scenario: Modal foreground remains readable

- **WHEN** the add-record modal is visible
- **THEN** modal text MUST meet WCAG AA contrast against the modal surface
- **AND** the scrim MUST reduce background visual competition without making the modal content harder to read

### Requirement: History row swipe delete interaction

The history page SHALL support deleting a single course record through a swipe-reveal interaction. A horizontal swipe on a record row MUST reveal a visible destructive `刪除` button. The swipe gesture itself MUST NOT delete the record.

#### Scenario: Swipe reveals delete button

- **WHEN** the user horizontally swipes a history record row past the reveal threshold
- **THEN** the row MUST reveal a visible `刪除` button
- **AND** the record MUST remain saved

#### Scenario: Swipe does not directly delete

- **WHEN** the user swipes a history record row and releases the pointer
- **THEN** the system MUST NOT delete that record unless the user subsequently activates the revealed `刪除` button and confirms deletion

#### Scenario: Only one row stays open

- **WHEN** one history row has its delete button revealed
- **AND** the user swipes a different history row
- **THEN** the first row MUST close or return to its normal position
- **AND** the second row MUST reveal its delete button when the swipe passes the reveal threshold

### Requirement: Single-record delete confirmation modal

The system SHALL show a confirmation modal after the user activates a revealed single-record `刪除` button. The confirmation modal MUST include the selected record's month, day, weekday, and count. If the selected record has a non-empty note, the confirmation modal MUST include the note. The selected record MUST be deleted only after the user confirms the destructive action.

#### Scenario: Delete button opens confirmation modal

- **WHEN** the user activates the revealed `刪除` button for a record dated 2026-06-29 with `weekday=1` and `count=2`
- **THEN** the system MUST display a confirmation modal
- **AND** the modal MUST include `6月29日 星期一`
- **AND** the modal MUST include `2人`
- **AND** the record MUST remain saved until the user confirms deletion

#### Scenario: Cancel single delete confirmation

- **WHEN** the single-record delete confirmation modal is visible
- **AND** the user presses `取消`
- **THEN** the modal MUST close
- **AND** the selected record MUST remain saved

#### Scenario: Confirm single delete

- **WHEN** the single-record delete confirmation modal is visible
- **AND** the user presses the destructive delete confirmation control
- **THEN** the system MUST delete exactly the selected record
- **AND** the system MUST return the history list to a state where that row is no longer visible
