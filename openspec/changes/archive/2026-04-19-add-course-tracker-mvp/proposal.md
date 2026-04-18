## Why

Cindy 是一位退休的桌球課程學員，需要一個極度簡單、在手機瀏覽器上就能使用的工具，記錄自己已上過幾堂課、距離個人目標（100 堂）還差多少。本專案目前沒有可用的工具，且使用者（Cindy）對介面複雜度容忍度低，因此 MVP 首版刻意限定為「只給 Cindy 本人使用」的單人離線工具：不需登入、不需後端、不需設定頁、不需 CSV 匯入匯出，打開就能看到今天的進度並確認加上一堂課。

## What Changes

- 建立單一的靜態單頁網頁應用（SPA），MVP 首版僅支援 Android 手機瀏覽器中的 Chrome 與 Samsung Internet。
- 使用者設定資料模型仍保留 `name` 與 `maxCourseCount` 兩個欄位，但 MVP 首版在初始化時直接寫入固定預設值 `name = "Cindy"`、`maxCourseCount = 100`，且不提供任何修改 UI。
- 首頁以大字體顯示兩行主內容：第一行 `嗨 Cindy`、第二行 `已上課 <usedCount>/<maxCourseCount>`（`usedCount` 依實際資料動態計算，MVP 首版 `maxCourseCount` 固定為 100，因此進度顯示形如 `已上課 12/100`）。
- 提供「新增上課紀錄」的主要操作按鈕與確認頁。確認頁不顯示 `courseNumber`；日期以繁體中文、不含年份的格式顯示為 `今天是M月D日 星期X`，日期來源為裝置本地日期（依手機當下日期與時區）。
- 提供歷史紀錄頁，依時間序列出所有紀錄；歷史紀錄頁上方放置一個「清空資料庫」的 icon button，作為高風險操作入口（必須搭配清楚可讀的文字提示，不可只靠圖示傳達危險性）。
- 清空資料庫流程必須是兩步：（1）從歷史紀錄頁的 icon button 進入清空頁；（2）顯示不可復原警示，使用者必須手動輸入 `刪除全部上課紀錄` 才能觸發清空。清空後必須保留 `name`、`maxCourseCount`，以及序號計數器（讓 `courseNumber` 永不重用）。
- 所有資料存放於 IndexedDB，關閉瀏覽器後重新開啟仍保留。
- 已上課堂數允許超過 `maxCourseCount`（例如顯示為 `已上課 105/100`），系統不得因此阻擋新增。

## Non-Goals (optional)

- MVP 首版不服務 Cindy 以外的使用者；其他家人朋友的使用情境、以及多人共用同一份資料，皆不在首版範圍內。
- MVP 首版不做設定頁，不提供任何修改 `name` 或 `maxCourseCount` 的 UI。
- MVP 首版不做 CSV 匯入與 CSV 匯出，也不做資料管理頁。
- 不做原生 Android App、不做後端伺服器、不做登入／帳號系統、不做雲端同步。
- 不做進階報表、分析、連勝數或任何超出「已上／目標」單一計數器的統計功能。
- MVP 階段不做 PWA 安裝、Service Worker 離線殼層或推播通知。
- 不支援多個瀏覽器分頁同時編輯（以最後寫入者為準即可）。

**未來可能恢復的功能（非本次範圍，但在設計上需預留退路）：**

- `sequence` 的語意固定為「最後一次已分配的 `courseNumber`」（而不是「下一個要使用的號碼」）。因此初始值為 `0`（尚未分配過任何 `courseNumber`），新增一筆時先計算 `新 courseNumber = sequence + 1` 再把 `sequence` 更新為該新值，清空後 `sequence` 不變。若未來重新加入 CSV 匯入功能，則在匯入成功後：若匯入後 `records` 至少有一筆紀錄，`sequence` 更新為匯入後所有紀錄中最大的 `courseNumber`；若匯入後無任何紀錄，則 `sequence` 設為 `0`。這個規則在 MVP 首版不實作，但在 `design.md` 中以「未來約束」方式記錄，避免後續恢復 CSV 時產生 `courseNumber` 衝突或與「下一個要使用的號碼」語意混淆。

## Capabilities

### New Capabilities

- `user-settings`：以種子資料方式建立固定的單一使用者設定（`name = "Cindy"`、`maxCourseCount = 100`），MVP 首版不提供編輯 UI；設定資料在清空資料庫後仍完整保留。
- `course-records`：建立、列出與統計課程紀錄，`courseNumber` 自動遞增並永不重用，包含出席旗標、日期、星期與備註欄位；不設最大紀錄筆數。
- `senior-friendly-ui`：首頁使用 `嗨 Cindy` 與 `已上課 <usedCount>/<maxCourseCount>` 兩行文案、大字體、低認知負擔設計；新增上課確認頁不顯示 `courseNumber`、以 `今天是M月D日 星期X` 繁體中文日期格式呈現；歷史紀錄頁上方設有文字標示清楚的清空 icon button。
- `destructive-clear`：從歷史紀錄頁的 icon button 進入，需輸入 `刪除全部上課紀錄` 才能執行；清除所有課程紀錄，但保留 `name`、`maxCourseCount` 與序號計數器，並清楚警示此操作不可復原。
- `local-persistence`：所有應用資料存放在 IndexedDB，讓資料在同一瀏覽器設定檔下的頁面重新整理與瀏覽器重啟後仍然存在。

### Modified Capabilities

(none)

## Impact

- 受影響 specs：五個新 capability（`user-settings`、`course-records`、`senior-friendly-ui`、`destructive-clear`、`local-persistence`）。相較於先前版本，`csv-import-export` capability 已自本變更中移除，對應的 spec 檔 `specs/csv-import-export/spec.md` 也一併刪除。
- 受影響程式碼：專案根目錄新增的靜態網站，包含：
  - `index.html`：首頁（顯示 `嗨 Cindy` 與 `已上課 <usedCount>/<maxCourseCount>`）
  - `src/main.ts`（或對應 entry 檔）：應用啟動邏輯，含首次開啟時以固定預設值種子化 `settings` store
  - `src/db/indexeddb.ts`：IndexedDB 封裝（`settings` + `records` 兩個 object store，以及序號計數器）
  - `src/features/home/`：首頁檢視（兩行文案 + 主要操作 + 進入歷史紀錄頁入口）
  - `src/features/add-course/`：有確認步驟的新增課程流程（不顯示 `courseNumber`；顯示 `今天是M月D日 星期X`）
  - `src/features/records/`：歷史紀錄頁（含上方的清空 icon button）
  - `src/features/clear/`：片語驗證的清空資料庫流程（從歷史紀錄頁 icon button 進入）
  - `src/styles/`：大字體、高齡友善的樣式
  - **已從上一版移除：** `src/features/csv/`、以及任何設定編輯 UI 相關的檔案。
- 相依套件：輕量的 build／toolchain（例如 Vite + TypeScript）與最小 UI 堆疊；不包含後端、認證、雲端服務或 CSV 套件。
