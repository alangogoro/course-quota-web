## MODIFIED Requirements

### Requirement: 資料庫 schema 與種子資料

The system SHALL define a stable IndexedDB database name, such as `course-tracker`, and a schema version number. The database MUST contain at least these two object stores:

- `settings`: keyed by fixed `key` values for these singleton entries:
  - `{ key: "singleton", name, maxCourseCount }`
  - `{ key: "sequence", value }`, where `value` means the last assigned `courseNumber`; initial value `0` means no `courseNumber` has been assigned yet.
- `records`: keyed by `courseNumber`, not IndexedDB auto-increment, saving `{ courseNumber, attended, attendedDate, weekday, count, note }`.

`courseNumber` MUST never be reused after a record is deleted or after all records are cleared. `count` MUST be stored as an integer from 1 through 10 for new records.

#### Scenario: First open creates schema and seed data

- **WHEN** the user opens the app for the first time in a browser profile
- **THEN** the system MUST create the IndexedDB database with the stores described above
- **AND** the system MUST seed `settings` with `{ key: "singleton", name: "Cindy", maxCourseCount: 100 }`
- **AND** the system MUST seed `settings` with `{ key: "sequence", value: 0 }`

#### Scenario: New record persists count

- **WHEN** the user confirms a new course record with `count` equal to 4
- **THEN** the system MUST persist that record in `records` with `count` equal to 4

### Requirement: 寫入路徑原子性

The system SHALL wrap each user-triggered write action in a single IndexedDB transaction that covers all object stores touched by the action. The system MUST NOT expose a partially written state after the operation completes.

#### Scenario: Adding a course is atomic

- **WHEN** the user confirms a new course record with `attendedDate`, `weekday`, `count`, and `note`
- **THEN** the system MUST open one readwrite transaction covering `records` and `settings`
- **AND** the system MUST read `settings.sequence`
- **AND** the system MUST save the new record with `courseNumber = sequence + 1`
- **AND** the system MUST update `settings.sequence` to the new `courseNumber`
- **AND** both updates MUST commit together or abort together

#### Scenario: Clearing records is atomic and does not touch settings

- **WHEN** the user successfully passes the destructive-clear phrase gate
- **THEN** the system MUST clear the `records` store in one readwrite transaction
- **AND** that transaction MUST NOT modify `{ key: "singleton" }` or `{ key: "sequence" }` in the `settings` store

#### Scenario: Deleting one record is atomic and does not touch settings

- **WHEN** the user confirms deletion for one `courseNumber`
- **THEN** the system MUST delete that record from the `records` store in one readwrite transaction
- **AND** that transaction MUST NOT modify `{ key: "singleton" }` or `{ key: "sequence" }` in the `settings` store

## ADDED Requirements

### Requirement: Legacy record count migration

The system SHALL migrate existing records that do not contain a valid `count` field by grouping legacy records by `attendedDate`. Legacy records for a date with one record MUST migrate to one record with `count` equal to 1. Legacy records for a date with multiple records MUST migrate to one or more representative records whose `count` values preserve the number of legacy records for that date. Each representative record MUST have `count` from 1 through 10. The migration MUST NOT modify `settings.singleton` or `settings.sequence`.

#### Scenario: Single existing record without count migrates to count one

- **WHEN** the browser profile contains a pre-change record `{ courseNumber: 7, attended: true, attendedDate: "2026-06-29", weekday: 1, note: "" }`
- **AND** the upgraded app opens the IndexedDB database
- **THEN** the migrated record MUST still have `courseNumber` equal to 7
- **AND** the migrated record MUST still have `attendedDate` equal to `2026-06-29`
- **AND** the migrated record MUST still have `weekday` equal to 1
- **AND** the migrated record MUST still have `note` equal to an empty string
- **AND** the migrated record MUST have `count` equal to 1

#### Scenario: Same-day legacy records migrate to one count record

- **WHEN** the browser profile contains pre-change records `{ courseNumber: 4, attended: true, attendedDate: "2026-06-29", weekday: 1, note: "" }` and `{ courseNumber: 5, attended: true, attendedDate: "2026-06-29", weekday: 1, note: "" }`
- **AND** the upgraded app opens the IndexedDB database
- **THEN** the records store MUST contain one migrated representative record for `2026-06-29`
- **AND** the representative record MUST have `courseNumber` equal to 5
- **AND** the representative record MUST have `attendedDate` equal to `2026-06-29`
- **AND** the representative record MUST have `weekday` equal to 1
- **AND** the representative record MUST have `count` equal to 2
- **AND** the records store MUST NOT contain the non-representative record with `courseNumber` equal to 4

##### Example: same-day migration output

| Legacy records for date | Migrated records |
| --- | --- |
| one record on `2026-06-29` with `courseNumber=4` | one record with `courseNumber=4`, `count=1` |
| two records on `2026-06-29` with `courseNumber=4,5` | one record with `courseNumber=5`, `count=2` |
| three records on `2026-06-29` with `courseNumber=4,5,6` | one record with `courseNumber=6`, `count=3` |

#### Scenario: Same-day legacy records above count limit split into chunks

- **WHEN** the browser profile contains 12 pre-change records for `2026-06-29` with `courseNumber` values 1 through 12
- **AND** the upgraded app opens the IndexedDB database
- **THEN** the records store MUST contain two migrated representative records for `2026-06-29`
- **AND** one representative record MUST have `courseNumber` equal to 10 and `count` equal to 10
- **AND** one representative record MUST have `courseNumber` equal to 12 and `count` equal to 2
- **AND** no migrated record MUST have `count` greater than 10

#### Scenario: Same-day legacy notes combine deterministically

- **WHEN** same-day legacy records contain non-empty notes `A` and `B` after trimming
- **AND** the upgraded app opens the IndexedDB database
- **THEN** the migrated representative note MUST contain `A` before `B`
- **AND** the migrated representative note MUST use `；` as the separator
- **AND** the migrated representative note MUST be no longer than 50 user-perceived characters

#### Scenario: Existing settings and sequence survive migration

- **WHEN** the browser profile contains `{ key: "singleton", name: "Cindy", maxCourseCount: 100 }` and `{ key: "sequence", value: 12 }`
- **AND** the upgraded app opens the IndexedDB database
- **THEN** the `singleton` settings entry MUST remain unchanged
- **AND** the `sequence` settings entry MUST remain 12

#### Scenario: Read fallback for unmigrated count

- **WHEN** a record read from IndexedDB is missing `count` or has an invalid `count`
- **THEN** the system MUST treat that record as `count` equal to 1 for rendering and total calculation
- **AND** the system MUST NOT crash or hide the record
