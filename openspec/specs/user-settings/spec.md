## ADDED Requirements

### Requirement: 種子化使用者設定

系統 SHALL 在首次開啟時以固定預設值建立一筆單一使用者的設定資料，其欄位為 `name`（字串）設為 `"Cindy"`、`maxCourseCount`（正整數）設為 `100`。該筆設定資料 MUST 能在頁面重新整理與瀏覽器重啟後，於同一瀏覽器設定檔中被還原。MVP 首版 MUST NOT 提供任何讓使用者修改 `name` 或 `maxCourseCount` 的 UI。

#### Scenario: 首次開啟時套用固定預設值

- **WHEN** 使用者第一次開啟應用，且尚未存在任何設定資料
- **THEN** 系統 MUST 建立一筆設定資料，其 `name` 等於 `"Cindy"`、`maxCourseCount` 等於 `100`
- **AND** 此筆設定資料 MUST 在首頁可被操作前就已經寫入本地儲存層

#### Scenario: 設定跨工作階段保留

- **WHEN** 使用者曾經開啟過應用至少一次，且設定資料已以預設值種子化
- **AND** 使用者關閉瀏覽器後稍晚再以同一瀏覽器設定檔開啟應用
- **THEN** 系統 MUST 載入先前保存的 `name` 與 `maxCourseCount` 值
- **AND** 首頁 MUST 直接以這些值顯示

#### Scenario: MVP 首版不提供編輯 UI

- **WHEN** 使用者瀏覽 MVP 首版的任何畫面（首頁、新增上課確認頁、歷史紀錄頁、清空資料庫確認頁）
- **THEN** 畫面上 MUST NOT 出現允許修改 `name` 或 `maxCourseCount` 的輸入欄位、設定頁入口或其他類似 UI 元件

#### Scenario: 清空動作不會重置設定

- **WHEN** 使用者成功觸發片語閘門的清空動作
- **THEN** `settings` store 中的 `name` 與 `maxCourseCount` MUST 維持原值（亦即 `"Cindy"` 與 `100`）
- **AND** 系統 MUST NOT 在清空流程中將 `name` 或 `maxCourseCount` 重新種子化或覆寫

## Requirements

### Requirement: 種子化使用者設定

系統 SHALL 在首次開啟時以固定預設值建立一筆單一使用者的設定資料，其欄位為 `name`（字串）設為 `"Cindy"`、`maxCourseCount`（正整數）設為 `100`。該筆設定資料 MUST 能在頁面重新整理與瀏覽器重啟後，於同一瀏覽器設定檔中被還原。MVP 首版 MUST NOT 提供任何讓使用者修改 `name` 或 `maxCourseCount` 的 UI。

#### Scenario: 首次開啟時套用固定預設值

- **WHEN** 使用者第一次開啟應用，且尚未存在任何設定資料
- **THEN** 系統 MUST 建立一筆設定資料，其 `name` 等於 `"Cindy"`、`maxCourseCount` 等於 `100`
- **AND** 此筆設定資料 MUST 在首頁可被操作前就已經寫入本地儲存層

#### Scenario: 設定跨工作階段保留

- **WHEN** 使用者曾經開啟過應用至少一次，且設定資料已以預設值種子化
- **AND** 使用者關閉瀏覽器後稍晚再以同一瀏覽器設定檔開啟應用
- **THEN** 系統 MUST 載入先前保存的 `name` 與 `maxCourseCount` 值
- **AND** 首頁 MUST 直接以這些值顯示

#### Scenario: MVP 首版不提供編輯 UI

- **WHEN** 使用者瀏覽 MVP 首版的任何畫面（首頁、新增上課確認頁、歷史紀錄頁、清空資料庫確認頁）
- **THEN** 畫面上 MUST NOT 出現允許修改 `name` 或 `maxCourseCount` 的輸入欄位、設定頁入口或其他類似 UI 元件

#### Scenario: 清空動作不會重置設定

- **WHEN** 使用者成功觸發片語閘門的清空動作
- **THEN** `settings` store 中的 `name` 與 `maxCourseCount` MUST 維持原值（亦即 `"Cindy"` 與 `100`）
- **AND** 系統 MUST NOT 在清空流程中將 `name` 或 `maxCourseCount` 重新種子化或覆寫

---
### Requirement: Settings page displays current values

When the user navigates to the settings page, the system SHALL read the current `name` and `maxCourseCount` from the IndexedDB `settings` store and pre-fill the corresponding input fields before rendering the page.

#### Scenario: Settings page pre-fills name

- **WHEN** the user navigates to the settings page
- **THEN** the `name` input field SHALL display the current value stored in the `settings` store

#### Scenario: Settings page pre-fills maxCourseCount

- **WHEN** the user navigates to the settings page
- **THEN** the `maxCourseCount` input field SHALL display the current value stored in the `settings` store

---
### Requirement: Settings page has save and cancel controls

The settings page SHALL render a "儲存" (save) button and a "取消" (cancel) button.

#### Scenario: Save and cancel buttons are present

- **WHEN** the settings page is rendered
- **THEN** a "儲存" button and a "取消" button SHALL both be visible and interactive

---
### Requirement: Save settings and return to home screen

When the user submits valid settings, the system SHALL write the new `name` and `maxCourseCount` to the IndexedDB `settings` store and navigate to the home screen.

#### Scenario: Successful save writes to IndexedDB

- **WHEN** the user clicks "儲存" with valid `name` and `maxCourseCount` values
- **THEN** the system SHALL call `saveSettings()` and write the new values to the `settings` store

#### Scenario: Successful save navigates home

- **WHEN** `saveSettings()` completes successfully
- **THEN** the system SHALL navigate to the home screen

---
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

---
### Requirement: Cancel settings editing

When the user clicks "取消", the system SHALL navigate to the home screen without writing to the `settings` store.

#### Scenario: Cancel discards changes and returns home

- **WHEN** the user clicks "取消" on the settings page
- **THEN** the system SHALL navigate to the home screen without calling `saveSettings()`

#### Scenario: Cancel preserves original values

- **WHEN** the user returns to the home screen after cancelling
- **THEN** the home screen SHALL display the `name` and `maxCourseCount` values that existed before the settings page was opened

