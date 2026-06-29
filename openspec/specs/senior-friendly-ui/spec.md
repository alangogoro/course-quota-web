## ADDED Requirements

### Requirement: 首頁版面配置

系統 SHALL 以首頁為預設路由。首頁 MUST 依以下順序顯示，且不得存在其他與之競爭的主要內容：

1. 第一行文案：字面值 `嗨 Cindy`（使用 `settings` store 中的 `name` 動態渲染為 `嗨 <name>` 的格式；MVP 首版 `name` 固定為 `"Cindy"`，因此呈現為 `嗨 Cindy`）。
2. 第二行文案：`已上課 <usedCount>/<maxCourseCount>`，其中 `<usedCount>` 為目前 `attended` 為 `true` 的紀錄筆數，`<maxCourseCount>` 取自 `settings` store（MVP 首版固定為 `100`）。
3. 主要操作按鈕，標籤為 `新增上課紀錄`。
4. 次要入口：進入歷史紀錄頁。

首頁 MUST NOT 顯示設定頁入口、CSV 匯入入口、CSV 匯出入口、或資料管理頁入口（因 MVP 首版皆不做）。

#### Scenario: 首頁顯示 Cindy 專屬文案

- **WHEN** 使用者開啟應用
- **AND** 設定與紀錄 store 皆已載入
- **THEN** 首頁第一行 MUST 呈現為 `嗨 Cindy`
- **AND** 首頁第二行 MUST 呈現為 `已上課 <usedCount>/<maxCourseCount>`，其中 `<usedCount>` 依實際紀錄動態計算（MUST NOT 為硬寫死的數字）
- **AND** MVP 首版 `<maxCourseCount>` MUST 為 `100`

#### Scenario: 超過目標時的顯示方式

- **WHEN** `<usedCount>` 已大於 `<maxCourseCount>`
- **THEN** 首頁第二行 MUST 以 `已上課 <usedCount>/<maxCourseCount>`（例如 `已上課 105/100`）的格式顯示
- **AND** 系統 MUST NOT 因此隱藏、上限化或顯示錯誤

#### Scenario: MVP 首版不顯示已排除的功能入口

- **WHEN** 使用者開啟首頁
- **THEN** 首頁 MUST NOT 渲染指向設定頁、CSV 匯入、CSV 匯出或資料管理頁的任何按鈕或連結



### Requirement: 禁止靜默自動新增

系統 SHALL NOT 於載入畫面、焦點回復或導覽等動作的副作用中建立、修改或刪除任何一筆課程紀錄。課程紀錄 MUST 只因為使用者明確的動作（並通過 `course-records` 或 `destructive-clear` 中定義的確認閘門）才發生變化。

#### Scenario: 開啟應用不會新增紀錄

- **WHEN** 使用者開啟或重新整理應用
- **THEN** 系統 MUST NOT 在使用者執行明確動作之前建立、更新或刪除任何一筆課程紀錄

### Requirement: 有確認閘門的新增課程流程

系統 SHALL 在使用者按下主按鈕 `新增上課紀錄` 之後、紀錄實際寫入資料庫之前，至少插入一個明確的確認步驟。確認頁 MUST NOT 顯示 `courseNumber`（`courseNumber` 僅作為資料層的內部序號與排序鍵），但 MUST 顯示當下裝置本地日期，格式為 `今天是M月D日 星期X`（繁體中文、不含年份；`M` 為 1-12 的月份，`D` 為 1-31 的日期，`X` 為 `日`／`一`／`二`／`三`／`四`／`五`／`六` 中的一個），並提供明顯可區分的 `確認新增` 與 `取消` 控制元件。

#### Scenario: 寫入前必須確認

- **WHEN** 使用者按下主按鈕 `新增上課紀錄`
- **THEN** 系統 MUST 顯示一個確認畫面
- **AND** 確認畫面 MUST NOT 顯示 `courseNumber`
- **AND** 確認畫面 MUST 顯示 `今天是<M>月<D>日 星期<X>` 的繁體中文日期字串，其中 `<M>`、`<D>` 依裝置本地日期計算，`<X>` 為對應的繁體中文星期字
- **AND** 在使用者按下 `確認新增` 之前 MUST NOT 寫入任何紀錄

#### Scenario: 日期依裝置本地計算

- **WHEN** 使用者在裝置本地日期為某年 4 月 18 日 星期六時按下 `新增上課紀錄`
- **THEN** 確認畫面顯示的日期字串 MUST 為 `今天是 4 月 18 日 星期六`（含空格的具體格式由實作決定，但月份、日期、星期文字 MUST 依裝置本地日期動態計算，且 MUST NOT 包含年份）

#### Scenario: 確認頁取消

- **WHEN** 使用者位於確認畫面
- **AND** 使用者按下 `取消`
- **THEN** 系統 MUST 返回首頁，且 MUST NOT 寫入任何紀錄
- **AND** `courseNumber` 序號計數器 MUST NOT 向前推進



### Requirement: 歷史紀錄頁的清空入口

系統 SHALL 在歷史紀錄頁的上方區域放置一個 icon button，作為進入清空資料庫流程的入口。該 icon button MUST 搭配一個清楚可讀的文字標籤（例如 `清空上課紀錄`）；MUST NOT 僅以圖示呈現而無文字。該 icon button MUST NOT 直接執行清空動作，點擊後 MUST 導向 `destructive-clear` 定義的清空確認畫面。

#### Scenario: Icon button 有文字標籤

- **WHEN** 使用者開啟歷史紀錄頁
- **THEN** 頁面上方 MUST 出現一個 icon button
- **AND** 該 button MUST 同時渲染可讀的繁體中文文字標籤，該標籤描述的是清空動作（例如 `清空上課紀錄`）
- **AND** 該 button MUST NOT 僅以純圖示呈現

#### Scenario: Icon button 只是入口

- **WHEN** 使用者在歷史紀錄頁按下該 icon button
- **THEN** 系統 MUST 導向清空資料庫的確認畫面
- **AND** 系統 MUST NOT 在使用者通過 `destructive-clear` 的片語閘門之前刪除任何紀錄

### Requirement: 無障礙最低標準

系統 SHALL 將本文內文的基礎字級設為至少 18 CSS 像素，主要操作按鈕的標籤設為至少 24 CSS 像素。所有可點擊元件的最小點擊區域 MUST 為 48 x 48 CSS 像素。前景色與背景色的對比 MUST 滿足 WCAG AA（內文 >= 4.5:1，大字 >= 3:1）。

#### Scenario: 預設字級

- **WHEN** 應用在 Android 手機瀏覽器的預設縮放下渲染
- **THEN** 內文 MUST 以 18 CSS 像素或以上呈現
- **AND** 主要操作按鈕的標籤 MUST 以 24 CSS 像素或以上呈現

#### Scenario: 點擊區大小

- **WHEN** 任一畫面渲染出一個可操作元件
- **AND** 該元件會觸發導覽、確認或破壞性動作
- **THEN** 該元件的點擊區域 MUST 至少為 48 x 48 CSS 像素

## Requirements

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

---
### Requirement: 禁止靜默自動新增

系統 SHALL NOT 於載入畫面、焦點回復或導覽等動作的副作用中建立、修改或刪除任何一筆課程紀錄。課程紀錄 MUST 只因為使用者明確的動作（並通過 `course-records` 或 `destructive-clear` 中定義的確認閘門）才發生變化。

#### Scenario: 開啟應用不會新增紀錄

- **WHEN** 使用者開啟或重新整理應用
- **THEN** 系統 MUST NOT 在使用者執行明確動作之前建立、更新或刪除任何一筆課程紀錄

---
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

---
### Requirement: 歷史紀錄頁的清空入口

系統 SHALL 在歷史紀錄頁的上方區域放置一個 icon button，作為進入清空資料庫流程的入口。該 icon button MUST 搭配一個清楚可讀的文字標籤（例如 `清空上課紀錄`）；MUST NOT 僅以圖示呈現而無文字。該 icon button MUST NOT 直接執行清空動作，點擊後 MUST 導向 `destructive-clear` 定義的清空確認畫面。

#### Scenario: Icon button 有文字標籤

- **WHEN** 使用者開啟歷史紀錄頁
- **THEN** 頁面上方 MUST 出現一個 icon button
- **AND** 該 button MUST 同時渲染可讀的繁體中文文字標籤，該標籤描述的是清空動作（例如 `清空上課紀錄`）
- **AND** 該 button MUST NOT 僅以純圖示呈現

#### Scenario: Icon button 只是入口

- **WHEN** 使用者在歷史紀錄頁按下該 icon button
- **THEN** 系統 MUST 導向清空資料庫的確認畫面
- **AND** 系統 MUST NOT 在使用者通過 `destructive-clear` 的片語閘門之前刪除任何紀錄

---
### Requirement: 無障礙最低標準

系統 SHALL 將本文內文的基礎字級設為至少 18 CSS 像素，主要操作按鈕的標籤設為至少 24 CSS 像素。所有可點擊元件的最小點擊區域 MUST 為 48 x 48 CSS 像素。前景色與背景色的對比 MUST 滿足 WCAG AA（內文 >= 4.5:1，大字 >= 3:1）。

#### Scenario: 預設字級

- **WHEN** 應用在 Android 手機瀏覽器的預設縮放下渲染
- **THEN** 內文 MUST 以 18 CSS 像素或以上呈現
- **AND** 主要操作按鈕的標籤 MUST 以 24 CSS 像素或以上呈現

#### Scenario: 點擊區大小

- **WHEN** 任一畫面渲染出一個可操作元件
- **AND** 該元件會觸發導覽、確認或破壞性動作
- **THEN** 該元件的點擊區域 MUST 至少為 48 x 48 CSS 像素

---
### Requirement: Settings entry button on home screen

The home screen SHALL display a settings entry button that navigates to the settings page when clicked. The button MUST display a visible Traditional Chinese text label (e.g., "設定"). An optional icon (e.g., gear icon) and an `aria-label` attribute are permitted as supplementary aids, but SHALL NOT replace the visible text label.

#### Scenario: Settings entry button has visible text label

- **WHEN** the home screen is rendered
- **THEN** the settings entry button SHALL display a visible Traditional Chinese text label (e.g., "設定") that is readable without assistive technology

#### Scenario: Settings entry button navigates to settings page

- **WHEN** the user clicks the settings entry button
- **THEN** the system SHALL navigate to the settings page route

---
### Requirement: Settings entry button position

The settings entry button SHALL be placed in the top-right area of the home screen. Its tap target SHALL be at least 48×48 CSS px.

#### Scenario: Settings entry button meets tap target size

- **WHEN** the settings entry button is rendered
- **THEN** the button's clickable area SHALL be at least 48 CSS px in both width and height

---
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

---
### Requirement: 設定頁高齡友善標準

All settings page form elements SHALL meet the following senior-friendly accessibility standards:
- Field labels SHALL have a font size of at least 18 CSS px
- Button labels SHALL have a font size of at least 24 CSS px
- All interactive elements SHALL have a tap target of at least 48×48 CSS px

#### Scenario: Field labels meet minimum font size

- **WHEN** the settings page is rendered
- **THEN** all field labels (e.g., "您的名稱", "目標上課堂數") SHALL have a computed font size of at least 18 CSS px

#### Scenario: Button labels meet minimum font size

- **WHEN** the settings page is rendered
- **THEN** the "儲存" and "取消" button labels SHALL have a computed font size of at least 24 CSS px

#### Scenario: Buttons meet minimum tap target size

- **WHEN** the settings page is rendered
- **THEN** the "儲存" and "取消" buttons SHALL each have a clickable area of at least 48 CSS px in both width and height

---
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

---
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

---
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

