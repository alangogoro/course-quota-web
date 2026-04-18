## ADDED Requirements

### Requirement: IndexedDB 作為主資料儲存

系統 SHALL 以 IndexedDB 作為唯一的主資料儲存。系統 MUST NOT 使用 localStorage、sessionStorage、cookies 或任何遠端服務來保存權威的設定資料或課程紀錄。MVP 首版 MUST NOT 讀寫任何 CSV 檔案（無論是在執行期或匯入匯出流程中）。

#### Scenario: 資料在瀏覽器重啟後仍存在

- **WHEN** 使用者新增至少一筆課程紀錄，並關閉分頁或整個瀏覽器程序
- **AND** 使用者稍後在同一瀏覽器設定檔的同一裝置上重新開啟應用
- **THEN** 系統 MUST 從 IndexedDB 載入先前保存的所有設定與紀錄
- **AND** 首頁 MUST 顯示與先前相同的已上堂數

#### Scenario: MVP 首版不讀寫 CSV

- **WHEN** 應用在 MVP 首版執行中
- **THEN** 系統 MUST NOT 讀寫任何 CSV 檔案以完成任何資料操作
- **AND** 所有讀寫 MUST 透過 IndexedDB 層進行


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

### Requirement: 資料庫 schema 與種子資料

系統 SHALL 定義一個名稱穩定的 IndexedDB 資料庫（例如 `course-tracker`）與 schema 版本號。該資料庫 MUST 至少包含以下兩個 object store：

- `settings`：以固定 key 區分下列兩筆 singleton，
  - `{ key: "singleton", name, maxCourseCount }`
  - `{ key: "sequence", value }`（保存「最後一次已分配的 `courseNumber`」；初始值為 `0` 代表尚未分配過任何 `courseNumber`；新增一筆紀錄時以 `value + 1` 作為新的 `courseNumber` 後，再把 `value` 更新為該新值）
- `records`：以 `courseNumber` 為 key（非 auto-increment，由應用自行指定），保存 `{ courseNumber, attended, attendedDate, weekday, note }`。

`courseNumber` 即便在紀錄被刪除後也 MUST 永不重用。

#### Scenario: 首次開啟時建立 schema 並種子化

- **WHEN** 使用者在某個瀏覽器設定檔首次開啟應用
- **THEN** 系統 MUST 依上述規格建立 IndexedDB 資料庫
- **AND** 系統 MUST 在 `settings` store 中植入 `{ key: "singleton", name: "Cindy", maxCourseCount: 100 }`
- **AND** 系統 MUST 在 `settings` store 中植入 `{ key: "sequence", value: 0 }`（`value` 的語意為「最後一次已分配的 `courseNumber`」，`0` 代表尚未分配過任何 `courseNumber`）


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

### Requirement: 寫入路徑原子性

系統 SHALL 將每一個由使用者觸發的寫入動作（新增課程、清空紀錄）包在單一 IndexedDB transaction 中，且該 transaction MUST 涵蓋它所觸及的所有 object store。操作完成後，系統 MUST NOT 讓使用者觀察到任何部分寫入的狀態。

#### Scenario: 新增課程是原子操作

- **WHEN** 使用者確認新增一筆課程紀錄
- **THEN** 系統 MUST 開啟一個同時涵蓋 `records` store 與 `settings` store（用於更新 `sequence`）的 readwrite transaction
- **AND** 兩個更新 MUST 一起 commit 或一起放棄，不得讓使用者觀察到部分狀態

#### Scenario: 清空是原子操作且不觸及設定

- **WHEN** 使用者成功通過片語閘門觸發清空動作
- **THEN** 系統 MUST 在單一 readwrite transaction 中完成 `records` store 的清空
- **AND** 該 transaction MUST NOT 觸及 `settings` store 中的 `{ key: "singleton" }` 或 `{ key: "sequence" }`

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

### Requirement: IndexedDB 作為主資料儲存

系統 SHALL 以 IndexedDB 作為唯一的主資料儲存。系統 MUST NOT 使用 localStorage、sessionStorage、cookies 或任何遠端服務來保存權威的設定資料或課程紀錄。MVP 首版 MUST NOT 讀寫任何 CSV 檔案（無論是在執行期或匯入匯出流程中）。

#### Scenario: 資料在瀏覽器重啟後仍存在

- **WHEN** 使用者新增至少一筆課程紀錄，並關閉分頁或整個瀏覽器程序
- **AND** 使用者稍後在同一瀏覽器設定檔的同一裝置上重新開啟應用
- **THEN** 系統 MUST 從 IndexedDB 載入先前保存的所有設定與紀錄
- **AND** 首頁 MUST 顯示與先前相同的已上堂數

#### Scenario: MVP 首版不讀寫 CSV

- **WHEN** 應用在 MVP 首版執行中
- **THEN** 系統 MUST NOT 讀寫任何 CSV 檔案以完成任何資料操作
- **AND** 所有讀寫 MUST 透過 IndexedDB 層進行

---
### Requirement: 資料庫 schema 與種子資料

系統 SHALL 定義一個名稱穩定的 IndexedDB 資料庫（例如 `course-tracker`）與 schema 版本號。該資料庫 MUST 至少包含以下兩個 object store：

- `settings`：以固定 key 區分下列兩筆 singleton，
  - `{ key: "singleton", name, maxCourseCount }`
  - `{ key: "sequence", value }`（保存「最後一次已分配的 `courseNumber`」；初始值為 `0` 代表尚未分配過任何 `courseNumber`；新增一筆紀錄時以 `value + 1` 作為新的 `courseNumber` 後，再把 `value` 更新為該新值）
- `records`：以 `courseNumber` 為 key（非 auto-increment，由應用自行指定），保存 `{ courseNumber, attended, attendedDate, weekday, note }`。

`courseNumber` 即便在紀錄被刪除後也 MUST 永不重用。

#### Scenario: 首次開啟時建立 schema 並種子化

- **WHEN** 使用者在某個瀏覽器設定檔首次開啟應用
- **THEN** 系統 MUST 依上述規格建立 IndexedDB 資料庫
- **AND** 系統 MUST 在 `settings` store 中植入 `{ key: "singleton", name: "Cindy", maxCourseCount: 100 }`
- **AND** 系統 MUST 在 `settings` store 中植入 `{ key: "sequence", value: 0 }`（`value` 的語意為「最後一次已分配的 `courseNumber`」，`0` 代表尚未分配過任何 `courseNumber`）

---
### Requirement: 寫入路徑原子性

系統 SHALL 將每一個由使用者觸發的寫入動作（新增課程、清空紀錄）包在單一 IndexedDB transaction 中，且該 transaction MUST 涵蓋它所觸及的所有 object store。操作完成後，系統 MUST NOT 讓使用者觀察到任何部分寫入的狀態。

#### Scenario: 新增課程是原子操作

- **WHEN** 使用者確認新增一筆課程紀錄
- **THEN** 系統 MUST 開啟一個同時涵蓋 `records` store 與 `settings` store（用於更新 `sequence`）的 readwrite transaction
- **AND** 兩個更新 MUST 一起 commit 或一起放棄，不得讓使用者觀察到部分狀態

#### Scenario: 清空是原子操作且不觸及設定

- **WHEN** 使用者成功通過片語閘門觸發清空動作
- **THEN** 系統 MUST 在單一 readwrite transaction 中完成 `records` store 的清空
- **AND** 該 transaction MUST NOT 觸及 `settings` store 中的 `{ key: "singleton" }` 或 `{ key: "sequence" }`