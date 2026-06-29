## Why

使用者名稱（`name`）與課堂目標（`maxCourseCount`）在首次啟動時由種子資料建立，MVP 階段無法編輯。目標使用者為退休長青族群，需要能在初始設定後調整個人名稱與目標堂數，因此必須提供設定編輯入口與設定頁面。

## What Changes

- 首頁右上角新增設定入口按鈕，必須具有可見的繁體中文文字標籤（例如「設定」）；可額外保留 `aria-label` 作為輔助，但不得以 `aria-label` 取代可見文字
- 新增設定頁面，以獨立路由呈現（非 modal），包含 `name` 與 `maxCourseCount` 的可編輯表單及欄位驗證
- `src/db/db.ts` 新增 `saveSettings(name, maxCourseCount)` 函式，將更新後的設定值寫入 IndexedDB `settings` store
- 儲存成功後導航回首頁；首頁在路由進入時重新從 IndexedDB 讀取 `settings`，並以最新值更新畫面（不使用全域 reactive state、pub/sub 或 subscription）
- 取消後導航回首頁，不寫入 `settings` store；首頁重新讀取後顯示取消前的原值

## Capabilities

### New Capabilities

- `user-settings`：使用者能從首頁進入設定頁，查看並編輯 `name` 與 `maxCourseCount`，儲存後首頁即時反映最新值
- `settings-editor`：設定頁表單，具備 `name`（1–50 字元）與 `maxCourseCount`（正整數 1–9999）的完整欄位驗證；驗證失敗時不寫入 DB
- `senior-friendly-ui`：設定入口按鈕與設定頁表單符合高齡友善標準，包含可見文字標籤、48×48 CSS px 觸控目標、欄位標籤 ≥ 18 CSS px、按鈕文字 ≥ 24 CSS px

### Modified Capabilities

（無現有 spec 需修改）

## Impact

- `src/db/db.ts` — 新增 `saveSettings(name, maxCourseCount): Promise<void>`
- `src/features/settings/index.ts` — 新建設定頁元件（路由 + 表單 + 驗證 + 儲存/取消）
- `src/main.ts` — 新增 `"settings"` 路由、首頁新增設定入口按鈕及 event listener
- `src/styles/base.css` — 新增 `.home-header`、`.btn-settings`、`.settings-form`、`.settings-field`、`.settings-label`、`.field-error` 樣式
