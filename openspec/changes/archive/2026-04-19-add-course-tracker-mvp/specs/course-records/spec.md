## ADDED Requirements

### Requirement: 課程紀錄資料結構

系統 SHALL 保存課程紀錄，且每筆紀錄的欄位僅包含下列五項；系統 MUST NOT 將使用者設定欄位（`name`、`maxCourseCount`）複製到任何一筆課程紀錄內：

- `courseNumber`（正整數，嚴格遞增，在所有紀錄中必須唯一；僅作為資料層的內部序號與排序鍵，不直接向終端使用者呈現）
- `attended`（布林值，表示使用者是否真的參加該堂課）
- `attendedDate`（ISO 8601 日期字串 `YYYY-MM-DD`）
- `weekday`（整數 0 到 6，其中 0 代表星期日，由 `attendedDate` 推導）
- `note`（字串，可為空）

#### Scenario: 紀錄只包含課程欄位

- **WHEN** 系統保存一筆新的課程紀錄
- **THEN** 該紀錄 MUST 僅包含 `courseNumber`、`attended`、`attendedDate`、`weekday`、`note` 這五個欄位
- **AND** 該紀錄 MUST NOT 包含 `name` 或 `maxCourseCount`

### Requirement: courseNumber 自動遞增

系統 SHALL 使用儲存於 `settings` store 的 `sequence` 計數器（語意為「最後一次已分配的 `courseNumber`」，初始值 `0`）分配 `courseNumber`：新增一筆時，先讀取 `sequence`，以 `sequence + 1` 作為新紀錄的 `courseNumber`，再將 `sequence` 更新為該新值。該語意 MUST NOT 被解釋為「下一個要使用的號碼」。即使紀錄被刪除、或資料庫經由片語閘門的清空流程被清空，系統 MUST NOT 重複使用已出現過的 `courseNumber` 值（亦即清空時 `sequence` 維持不變）。

#### Scenario: 第一筆取得 1

- **WHEN** 課程紀錄 store 為空
- **AND** 使用者新增第一筆課程紀錄
- **THEN** 建立的紀錄 MUST 擁有 `courseNumber` 等於 `1`

#### Scenario: 後續紀錄逐一加一

- **WHEN** 目前 store 內最大的 `courseNumber` 為 `N`
- **AND** 使用者新增一筆課程紀錄
- **THEN** 建立的紀錄 MUST 擁有 `courseNumber` 等於 `N + 1`

#### Scenario: courseNumber 永不重用

- **WHEN** 本資料庫中曾經存在過任何 `courseNumber` 等於 `K` 的紀錄，即使後來已被清空
- **AND** 使用者新增一筆課程紀錄
- **THEN** 建立的紀錄 MUST 擁有嚴格大於 `K` 的 `courseNumber`

### Requirement: 不設紀錄筆數上限

系統 SHALL 允許課程紀錄的總筆數超過 `maxCourseCount`。`maxCourseCount` 僅為顯示用目標值，MUST NOT 作為硬性新增上限。

#### Scenario: 允許新增超過目標堂數

- **WHEN** 目前紀錄筆數已大於或等於 `maxCourseCount`
- **AND** 使用者透過有確認閘門的新增流程新增一筆課程紀錄
- **THEN** 系統 MUST 接受並寫入該筆新紀錄
- **AND** 首頁的第二行 MUST 能正常渲染新的數值（例如 `已上課 105/100`）而不產生錯誤

### Requirement: 列出課程紀錄

系統 SHALL 提供歷史紀錄頁，依 `courseNumber` 由大到小（最新在上）列出所有已保存的課程紀錄。該列表 MUST 為每筆紀錄顯示 `attendedDate`、`weekday` 對應的繁體中文星期字、`attended` 狀態與 `note`。該列表 MUST NOT 向終端使用者顯示 `courseNumber`（`courseNumber` 僅用於排序）。

#### Scenario: 瀏覽紀錄

- **WHEN** 使用者開啟歷史紀錄頁
- **THEN** 系統 MUST 依 `courseNumber` 由大到小的順序列出所有已保存的紀錄
- **AND** 每一列 MUST 顯示 `attendedDate`、對應的繁體中文星期字、`attended` 狀態與 `note`
- **AND** 每一列 MUST NOT 顯示 `courseNumber`
- **AND** 每一列 MUST 使用 `senior-friendly-ui` 定義的高齡友善字級，確保清楚可讀
