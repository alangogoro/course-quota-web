## Context

本專案為純前端 SPA，以 `main.ts` 中的 `navigate(page)` 函式實作路由切換，每個頁面以 `app.innerHTML` 整體替換並重新掛載 event listener。持久狀態儲存於 IndexedDB；`settings` store 含單一 singleton 紀錄（`key: "singleton"`），欄位為 `name` 與 `maxCourseCount`。

目標使用者為退休長青族群，須符合高齡友善 UI 標準：欄位標籤 ≥ 18 CSS px、按鈕文字 ≥ 24 CSS px、觸控目標 ≥ 48×48 CSS px、所有操作用可見文字標籤（不可只依賴圖示或 `aria-label`）。

## Goals / Non-Goals

**Goals:**

- 從首頁透過可見繁體中文文字按鈕進入設定頁
- 設定頁可編輯 `name` 與 `maxCourseCount`，含欄位驗證
- 儲存成功後回首頁，首頁重新讀取 IndexedDB 並顯示最新值
- 取消後回首頁，顯示取消前的原值
- 所有新增 UI 元素符合高齡友善標準

**Non-Goals:**

- 全域 reactive state、pub/sub、subscription 或跨頁面即時同步
- 設定頁開啟期間首頁即時更新
- 設定重置 / 恢復預設值功能
- 增加 `name` 與 `maxCourseCount` 以外的設定欄位

## Decisions

### 設定頁以獨立路由呈現（非 modal）

設定頁以新的 SPA 路由（`"settings"`）實作，沿用現有 `navigate()` 模式，避免 modal 帶來的 z-index 與 focus-trap 複雜度。

### 儲存後回首頁並重新讀取 settings

儲存成功後呼叫 `navigate("home")`，`showHome()` 在每次進入時皆重新呼叫 `getSettings()` 與 `countAttended()`，直接從 IndexedDB 讀取最新值。

**不採用的替代方案：**
- **全域 reactive store / 事件發佈訂閱（pub/sub / subscription）**：此為單人離線 App，不存在多視圖並行更新的需求；引入訂閱機制會增加不必要的複雜度，且在 `innerHTML` 整體替換模式下易造成殭屍 listener。路由進入時重新讀取 DB 是更簡單、可預期的模式。

### Settings entry button on home screen

因目標使用者為退休長青族群，設定入口按鈕**必須**顯示可見的繁體中文文字標籤（例如「設定」）。可額外加入圖示（如齒輪圖示）與 `aria-label` 作為輔助，但兩者均不得取代可見文字。此規則優先於任何「aria-label 即可」的一般 a11y 實務。

### 首頁版面配置

在 `.page` 頂部新增 `.home-header` 容器（`display: flex; justify-content: flex-end`），作為設定入口按鈕的 slot，不影響既有的 `.home-hero` 與 `.btn-stack` 佈局。

### Settings validation

- `name`：trim 後長度 1–50 字元，空白時顯示「名稱不可空白」，超長時顯示「名稱最多 50 個字」
- `maxCourseCount`：`Number.isInteger()` + 範圍 1–9999，任何失敗均顯示「請輸入 1 到 9999 之間的整數」
- 驗證失敗時 MUST NOT 呼叫 `saveSettings()`，確保 IndexedDB 不被寫入
- 驗證為純用戶端，無需 server round-trip

### 設定頁元件骨架

設定頁邏輯建立於 `src/features/settings/index.ts`，匯出 `showSettings(app, navigate)` 非同步函式，由 `main.ts` 路由 switch 呼叫。`escHtml()` 與 `chevronLeftSVG()` 在 settings 模組中各自定義（小型 helper，不抽取為共用模組以降低耦合）。

## Risks / Trade-offs

- **每次進入首頁都讀取 DB**：對於單人離線 App 而言開銷可忽略；若未來改為多資料來源或同步需求，可再引入 reactive state。
- **儲存無法復原**：儲存後舊值立即被覆蓋。緩解：使用者可透過「取消」丟棄所有未儲存變更。
