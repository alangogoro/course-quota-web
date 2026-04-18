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
