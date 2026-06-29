## MODIFIED Requirements

### Requirement: 課程紀錄資料結構

The system SHALL save course records, and each course record SHALL contain only the following six course fields. The system MUST NOT copy user setting fields (`name`, `maxCourseCount`) into any course record:

- `courseNumber`: positive integer, strictly increasing, unique across all records, used only as an internal ordering key and not displayed to the end user.
- `attended`: boolean indicating that the saved record represents an attended class session.
- `attendedDate`: ISO 8601 date string in `YYYY-MM-DD` format.
- `weekday`: integer from 0 through 6, where 0 means Sunday, derived from `attendedDate`.
- `count`: integer from 1 through 10, representing both the number of attendees and the number of classes contributed by this record.
- `note`: string, allowed to be empty, with a maximum persisted length of 50 user-perceived characters.

#### Scenario: Record contains only course fields

- **WHEN** the system saves a new course record
- **THEN** the record MUST contain only `courseNumber`, `attended`, `attendedDate`, `weekday`, `count`, and `note`
- **AND** the record MUST NOT contain `name` or `maxCourseCount`

#### Scenario: Count boundaries

- **WHEN** the user confirms a new course record with `count` equal to 1
- **THEN** the system MUST save `count` equal to 1
- **WHEN** the user confirms a new course record with `count` equal to 10
- **THEN** the system MUST save `count` equal to 10
- **AND** the system MUST reject or block any new record whose `count` is less than 1, greater than 10, non-integer, or empty

##### Example: valid count values

| User selected count | Persisted count | Home total contribution |
| --- | --- | --- |
| 1 | 1 | +1 |
| 2 | 2 | +2 |
| 10 | 10 | +10 |

#### Scenario: Note length boundary

- **WHEN** the user confirms a new course record with an empty note
- **THEN** the system MUST save `note` as an empty string
- **WHEN** the user confirms a new course record with a note of 50 user-perceived characters
- **THEN** the system MUST save the note
- **AND** the system MUST reject or block notes longer than 50 user-perceived characters

### Requirement: 不設紀錄筆數上限

The system SHALL allow the total number of course records and the summed `count` total to exceed `maxCourseCount`. `maxCourseCount` is only a display target and MUST NOT be used as a hard limit for adding course records.

#### Scenario: Allow adding beyond target by record count

- **WHEN** the number of saved records is greater than or equal to `maxCourseCount`
- **AND** the user adds a course record through the confirmed add flow
- **THEN** the system MUST accept and save the new record

#### Scenario: Allow adding beyond target by count sum

- **WHEN** the current summed `count` total is 99
- **AND** `maxCourseCount` is 100
- **AND** the user adds a confirmed course record with `count` equal to 3
- **THEN** the system MUST accept and save the new record
- **AND** the home screen MUST be able to render `102/100` without hiding, capping, or treating it as an error

### Requirement: 列出課程紀錄

The system SHALL provide a history page that lists all saved course records ordered by `courseNumber` descending, newest first. Each list item MUST display `attendedDate`, the Traditional Chinese weekday text derived from `weekday`, and the record `count` as `<count>人`. If `note` is non-empty after trimming, the item MUST display the note below the date row. If `note` is empty after trimming, the item MUST NOT display any additional note line. The list MUST NOT display `courseNumber` to the end user.

#### Scenario: Browse records with count labels

- **WHEN** the user opens the history page
- **THEN** the system MUST list all saved records ordered by `courseNumber` descending
- **AND** each row MUST display the month, day, Traditional Chinese weekday text, and `<count>人`
- **AND** each row MUST NOT display `courseNumber`
- **AND** each row MUST use senior-friendly typography defined by `senior-friendly-ui`

##### Example: row display values

| Record | Expected visible row |
| --- | --- |
| `attendedDate=2026-06-29`, `weekday=1`, `count=1`, `note=""` | `6月29日 星期一 1人` |
| `attendedDate=2026-06-30`, `weekday=2`, `count=2`, `note="教練代課"` | `6月30日 星期二 2人` plus note line `教練代課` |

#### Scenario: Empty note hides note line

- **WHEN** a saved record has `note` equal to an empty string or whitespace only
- **THEN** the history row MUST display no additional note line for that record

## ADDED Requirements

### Requirement: Course total uses count sum

The system SHALL compute the home screen used course total by summing `count` across all attended course records. Records without a persisted `count` value MUST contribute 1 to the sum when read before or outside migration. Migrated same-day legacy records MUST contribute the migrated representative `count`.

#### Scenario: Sum multiple counts

- **WHEN** the records store contains one record with `count` equal to 1 and another record with `count` equal to 3
- **THEN** the home screen used course total MUST be 4

##### Example: migrated and new records

| Record shape | Contribution |
| --- | --- |
| Legacy record without `count` before migration | 1 |
| Migrated representative for two same-day legacy records | 2 |
| New record with `count=3` | 3 |
| New record with `count=10` | 10 |

### Requirement: Delete a single course record

The system SHALL allow deleting exactly one saved course record by its `courseNumber`. Deleting a single record MUST NOT modify any other record and MUST NOT modify `settings.sequence`.

#### Scenario: Delete selected record only

- **WHEN** records exist with `courseNumber` values 1, 2, and 3
- **AND** the user confirms deletion for `courseNumber` 2
- **THEN** the records store MUST retain records 1 and 3
- **AND** the records store MUST no longer contain record 2
- **AND** `settings.sequence` MUST remain unchanged

#### Scenario: Add after single delete does not reuse courseNumber

- **WHEN** the highest ever assigned `courseNumber` is 3
- **AND** the user deletes record 3
- **AND** the user adds another course record
- **THEN** the new record MUST have `courseNumber` equal to 4
