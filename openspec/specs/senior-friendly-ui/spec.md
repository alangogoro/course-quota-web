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


<!-- @trace
source: add-course-tracker-mvp
updated: 2026-04-19
code:
  - .playwright-cli/page-2026-04-18T19-03-55-250Z.yml
  - src/styles/base.css
  - .playwright-cli/page-2026-04-18T19-04-15-884Z.yml
  - .playwright-cli/page-2026-04-18T19-04-33-221Z.yml
  - package.json
  - .playwright-cli/page-2026-04-18T19-03-34-188Z.yml
  - home.png
  - .playwright-cli/page-2026-04-18T19-03-44-750Z.yml
  - history.png
  - vite.config.ts
  - confirm-add.png
  - index.html
  - .playwright-cli/page-2026-04-18T19-04-01-625Z.yml
  - .playwright-cli/page-2026-04-18T19-05-03-572Z.yml
  - tsconfig.json
  - .playwright-cli/page-2026-04-18T19-04-27-848Z.yml
  - .playwright-cli/page-2026-04-18T19-04-22-482Z.yml
  - src/db/db.ts
  - src/main.ts
  - .playwright-cli/page-2026-04-18T19-03-23-633Z.yml
-->

### Requirement: 禁止靜默自動新增

系統 SHALL NOT 於載入畫面、焦點回復或導覽等動作的副作用中建立、修改或刪除任何一筆課程紀錄。課程紀錄 MUST 只因為使用者明確的動作（並通過 `course-records` 或 `destructive-clear` 中定義的確認閘門）才發生變化。

#### Scenario: 開啟應用不會新增紀錄

- **WHEN** 使用者開啟或重新整理應用
- **THEN** 系統 MUST NOT 在使用者執行明確動作之前建立、更新或刪除任何一筆課程紀錄


<!-- @trace
source: add-course-tracker-mvp
updated: 2026-04-19
code:
  - .playwright-cli/page-2026-04-18T19-03-55-250Z.yml
  - src/styles/base.css
  - .playwright-cli/page-2026-04-18T19-04-15-884Z.yml
  - .playwright-cli/page-2026-04-18T19-04-33-221Z.yml
  - package.json
  - .playwright-cli/page-2026-04-18T19-03-34-188Z.yml
  - home.png
  - .playwright-cli/page-2026-04-18T19-03-44-750Z.yml
  - history.png
  - vite.config.ts
  - confirm-add.png
  - index.html
  - .playwright-cli/page-2026-04-18T19-04-01-625Z.yml
  - .playwright-cli/page-2026-04-18T19-05-03-572Z.yml
  - tsconfig.json
  - .playwright-cli/page-2026-04-18T19-04-27-848Z.yml
  - .playwright-cli/page-2026-04-18T19-04-22-482Z.yml
  - src/db/db.ts
  - src/main.ts
  - .playwright-cli/page-2026-04-18T19-03-23-633Z.yml
-->

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


<!-- @trace
source: add-course-tracker-mvp
updated: 2026-04-19
code:
  - .playwright-cli/page-2026-04-18T19-03-55-250Z.yml
  - src/styles/base.css
  - .playwright-cli/page-2026-04-18T19-04-15-884Z.yml
  - .playwright-cli/page-2026-04-18T19-04-33-221Z.yml
  - package.json
  - .playwright-cli/page-2026-04-18T19-03-34-188Z.yml
  - home.png
  - .playwright-cli/page-2026-04-18T19-03-44-750Z.yml
  - history.png
  - vite.config.ts
  - confirm-add.png
  - index.html
  - .playwright-cli/page-2026-04-18T19-04-01-625Z.yml
  - .playwright-cli/page-2026-04-18T19-05-03-572Z.yml
  - tsconfig.json
  - .playwright-cli/page-2026-04-18T19-04-27-848Z.yml
  - .playwright-cli/page-2026-04-18T19-04-22-482Z.yml
  - src/db/db.ts
  - src/main.ts
  - .playwright-cli/page-2026-04-18T19-03-23-633Z.yml
-->

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


<!-- @trace
source: add-course-tracker-mvp
updated: 2026-04-19
code:
  - .playwright-cli/page-2026-04-18T19-03-55-250Z.yml
  - src/styles/base.css
  - .playwright-cli/page-2026-04-18T19-04-15-884Z.yml
  - .playwright-cli/page-2026-04-18T19-04-33-221Z.yml
  - package.json
  - .playwright-cli/page-2026-04-18T19-03-34-188Z.yml
  - home.png
  - .playwright-cli/page-2026-04-18T19-03-44-750Z.yml
  - history.png
  - vite.config.ts
  - confirm-add.png
  - index.html
  - .playwright-cli/page-2026-04-18T19-04-01-625Z.yml
  - .playwright-cli/page-2026-04-18T19-05-03-572Z.yml
  - tsconfig.json
  - .playwright-cli/page-2026-04-18T19-04-27-848Z.yml
  - .playwright-cli/page-2026-04-18T19-04-22-482Z.yml
  - src/db/db.ts
  - src/main.ts
  - .playwright-cli/page-2026-04-18T19-03-23-633Z.yml
-->

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


<!-- @trace
source: add-course-tracker-mvp
updated: 2026-04-19
code:
  - .playwright-cli/page-2026-04-18T19-03-55-250Z.yml
  - src/styles/base.css
  - .playwright-cli/page-2026-04-18T19-04-15-884Z.yml
  - .playwright-cli/page-2026-04-18T19-04-33-221Z.yml
  - package.json
  - .playwright-cli/page-2026-04-18T19-03-34-188Z.yml
  - home.png
  - .playwright-cli/page-2026-04-18T19-03-44-750Z.yml
  - history.png
  - vite.config.ts
  - confirm-add.png
  - index.html
  - .playwright-cli/page-2026-04-18T19-04-01-625Z.yml
  - .playwright-cli/page-2026-04-18T19-05-03-572Z.yml
  - tsconfig.json
  - .playwright-cli/page-2026-04-18T19-04-27-848Z.yml
  - .playwright-cli/page-2026-04-18T19-04-22-482Z.yml
  - src/db/db.ts
  - src/main.ts
  - .playwright-cli/page-2026-04-18T19-03-23-633Z.yml
-->

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

---
### Requirement: 禁止靜默自動新增

系統 SHALL NOT 於載入畫面、焦點回復或導覽等動作的副作用中建立、修改或刪除任何一筆課程紀錄。課程紀錄 MUST 只因為使用者明確的動作（並通過 `course-records` 或 `destructive-clear` 中定義的確認閘門）才發生變化。

#### Scenario: 開啟應用不會新增紀錄

- **WHEN** 使用者開啟或重新整理應用
- **THEN** 系統 MUST NOT 在使用者執行明確動作之前建立、更新或刪除任何一筆課程紀錄

---
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