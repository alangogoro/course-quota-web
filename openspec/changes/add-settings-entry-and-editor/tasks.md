## 1. 資料層確認

- [x] 1.1 確認 `src/db/indexeddb.ts`（或 `src/db/db.ts`）中 `settings` store 是否已有 update 函式，支援更新 `name` 與 `maxCourseCount`；若不足則補強（種子化使用者設定）
- [x] 1.2 確認清空流程不會重置 `settings` store 的 `name` 與 `maxCourseCount`（種子化使用者設定）
- [x] 1.3 移除「MVP 首版不提供編輯 UI（Scenario）」的舊有 MVP 限制程式碼或 UI 封鎖邏輯，確認首頁不再有阻止設定入口渲染的條件判斷（MVP 首版不提供編輯 UI（Scenario））

## 2. 路由與頁面骨架（設定頁以獨立路由呈現）

- [x] 2.1 在現有 SPA 路由架構中新增設定頁路由（例如 `#settings` 或 `/settings`），確認從首頁可正確導航至設定頁（設定頁以獨立路由呈現（非 modal））
- [x] 2.2 建立設定頁元件骨架於 `src/features/settings/`，確認路由進出不報錯（設定頁元件骨架）

## 3. 首頁設定入口按鈕（首頁版面配置、設定入口按鈕位置）

- [x] 3.1 在首頁右上角新增設定入口按鈕，必須具有可見的繁體中文文字標籤（例如「設定」）；可額外保留 `aria-label` 輔助，但 `aria-label` 不得取代可見文字；點擊後導航至設定頁路由（Settings entry button on home screen）
- [x] 3.2 確認設定入口按鈕點擊區域 >= 48 x 48 CSS px（設定入口按鈕位置、Settings entry button position）
- [x] 3.3 更新首頁版面配置：移除「MUST NOT 顯示設定頁入口」的 MVP 限制，在版面中加入設定入口 slot（首頁版面配置、Home screen layout）

## 4. 設定頁 UI 與高齡友善標準（Settings page displays current values）

- [x] 4.1 設定頁進入時從 IndexedDB `settings` store 讀取當前 `name` 與 `maxCourseCount`，預填對應輸入欄位（Settings page displays current values）
- [x] 4.2 設定頁渲染帶有清楚標籤的 `name` 輸入框與 `maxCourseCount` 輸入框；欄位標籤與輸入框文字 >= 18 CSS px（設定頁高齡友善標準）
- [x] 4.3 設定頁渲染「儲存」與「取消」按鈕；按鈕標籤 >= 24 CSS px，點擊區域 >= 48 x 48 CSS px（Settings page has save and cancel controls、設定頁高齡友善標準）

## 5. 欄位驗證（Settings validation、欄位驗證規則）

- [x] 5.1 實作 `name` 欄位驗證：去除首尾空白後不可為空，長度 1–50 字元；驗證失敗時在欄位下方顯示錯誤訊息 `名稱不可空白` 或 `名稱最多 50 個字`，並保留使用者輸入值（Empty name is rejected、Name exceeding 50 characters is rejected）
- [x] 5.2 實作 `maxCourseCount` 欄位驗證：正整數 1–9999，拒絕小數、負數、非數字與空白；驗證失敗時顯示錯誤訊息 `請輸入 1 到 9999 之間的整數`（Non-positive-integer maxCourseCount is rejected）
- [x] 5.3 確認驗證成功時不顯示任何錯誤訊息（Valid input passes validation）
- [x] 5.4 確認驗證失敗時 MUST NOT 寫入 `settings` store（Settings validation）

## 6. 儲存並返回首頁（儲存後回首頁並重新讀取 settings）

- [x] 6.1 驗證通過後將新 `name` 與 `maxCourseCount` 寫入 `settings` store（Save settings and return to home screen）
- [x] 6.2 儲存成功後導航回首頁（Successful save updates home screen）
- [x] 6.3 首頁路由進入時重新從 IndexedDB 讀取 `settings`，確認 `嗨 <name>` 與 `已上課 <usedCount>/<maxCourseCount>` 即時反映最新值（儲存後回首頁並重新讀取 settings）

## 7. 取消流程（Cancel settings editing）

- [x] 7.1 設定頁「取消」按鈕點擊後 MUST NOT 寫入 `settings` store，直接導航回首頁（Cancel discards changes and returns home）
- [x] 7.2 返回首頁後確認顯示的 `name` 與 `maxCourseCount` 為取消前的原值（Cancel settings editing）

## 8. 驗收

- [x] 8.1 手動驗收：修改 `name`，儲存，確認首頁問候語立即更新為 `嗨 <新名稱>`
- [x] 8.2 手動驗收：修改 `maxCourseCount`，儲存，確認首頁計數顯示 `已上課 <usedCount>/<新目標>`
- [x] 8.3 手動驗收：嘗試儲存空白 `name`，確認錯誤訊息出現，且 `settings` store 未被寫入
- [x] 8.4 手動驗收：嘗試儲存 `maxCourseCount = 0`，確認錯誤訊息出現，且 `settings` store 未被寫入
- [x] 8.5 手動驗收：按「取消」，確認返回首頁後原值未被覆蓋
- [x] 8.6 手動驗收：修改設定並儲存後重新整理頁面，確認最新值被正確載入（設定跨工作階段保留）
