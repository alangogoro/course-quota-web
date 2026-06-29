## 1. Data Contract And Migration

- [x] [P] 1.1 建立資料層驗證案例，覆蓋「課程紀錄資料結構」、「Course total uses count sum」、「不設紀錄筆數上限」與「使用 `count` 作為人數與堂數的單一欄位」：驗證 `count=1/2/10` 的加總、舊紀錄缺少 `count` 時以 1 計算、同日兩筆 legacy records migration 後成為一筆 `count=2`、同日 12 筆 legacy records migration 後成為 `count=10` 與 `count=2` 兩筆、`count` 超過 `maxCourseCount` 仍可顯示；以專案可執行的測試或 browser-seeded IndexedDB 驗證腳本證明失敗後再實作。
- [x] 1.2 更新 `src/db/db.ts` 的 `CourseRecord` contract 與新增紀錄 API，讓新紀錄持久化 `count` 與 trimmed `note`，並拒絕空值、非整數、低於 1、高於 10 的 count 與超過 50 字的 note；以 1.1 的驗證案例和 `npm run typecheck` 證明資料 shape 與 validation 契約成立。
- [x] 1.3 實作「資料庫 schema 與種子資料」、「Legacy record count migration」與「以 IndexedDB version upgrade migration 按日期折疊 legacy records」：升級 IndexedDB version，依 `attendedDate` 分組 legacy records，單日一筆成為 `count=1`，單日多筆依 `courseNumber` 排序後每 10 筆切 chunk，保留每個 chunk 最高 `courseNumber` 作為代表並刪除非代表 records，保持 `settings.sequence` 不變；以 seeded legacy IndexedDB 驗證單筆日期、同日兩筆、同日 12 筆與 non-empty note 合併情境。
- [x] 1.4 更新首頁堂數查詢，使 `countAttended` 或替代函式回傳所有 attended records 的 count 加總，且缺少/無效 count fallback 為 1；以 1.1 驗證案例確認 migration 前 fallback、migration 後同日折疊代表 record、新舊紀錄混合時首頁總數都正確。
- [x] 1.5 實作「Delete a single course record」、「寫入路徑原子性」的單筆刪除資料操作：依 `courseNumber` 刪除 exactly one record，不修改其他 records、不修改 `settings.sequence`；以資料層測試或 browser-seeded IndexedDB 驗證刪除 record 2 後 records 1/3 保留且下一筆新增不重用 courseNumber。

## 2. Add-Record Modal UI

- [x] 2.1 將首頁「新增上課紀錄」改為「有確認閘門的新增課程流程」modal，落實「新增紀錄改為首頁 modal 表單」：點擊只開啟同頁 modal，不寫入資料，modal 顯示 date、count、note visible labels、`取消` 與 `確認新增`；以 browser 手動驗證或互動測試確認按下新增後 records 數量不變。
- [x] 2.2 實作月日選擇與 weekday 即時更新：預設本地今天、以目前年份組成 `YYYY-MM-DD`、選擇 2026 年 6 月 29 日顯示 星期一、選擇不存在日期時 clamp 到該月最後一天；以 browser 互動驗證 date label、persisted `attendedDate` 與 `weekday`。
- [x] 2.3 實作 count stepper/input 與 note 欄位 validation：count 預設 1、範圍 1 到 10、note 預設空白且上限 50 字，錯誤訊息顯示在欄位附近並阻止 confirm；以 browser 互動驗證 invalid count/note 不能送出、valid `count=3` 和 note 可送出。
- [x] 2.4 實作「Add-record modal visual treatment」與 ui-ux-pro-max 約束：modal 使用既有色彩 token、scrim、圓角、48 x 48 CSS px 以上 touch targets、可見 focus state、`取消` escape route；以 375px viewport、鍵盤 tab order、contrast spot-check 與 reduced-motion 檢查驗證無水平 overflow。
- [x] 2.5 串接 modal confirm/cancel 到資料層：取消不推進 `settings.sequence`，確認寫入 `attendedDate`、`weekday`、`count`、`note` 並回到首頁更新 count sum；以 browser flow 驗證取消後首頁數字不變、確認 `count=3` 後首頁增加 3。

## 3. History Display And Single Delete

- [x] 3.1 更新「列出課程紀錄」與「歷史紀錄顯示 count 與條件式 note」：history rows 依 `courseNumber` descending 顯示 `M月D日 星期X` 與 `N人`，note 只在 trim 後非空時顯示；以 seeded records 驗證 `1人`、`2人` 與有/無 note 的兩種列呈現。
- [x] 3.2 實作「History row swipe delete interaction」：水平 swipe 只 reveal 紅色 `刪除` 按鈕，不刪除資料，且一次最多一列保持 open；以手機寬度 browser 互動驗證 swipe 後 record 仍存在、第二列 swipe 會關閉第一列。
- [x] 3.3 實作「Single-record delete confirmation modal」與「單筆刪除採用 swipe reveal 加確認 modal」：點 revealed `刪除` 顯示含日期、weekday、count 與非空 note 的確認 modal，按 `取消` 保留資料，按 destructive confirm 刪除 exactly selected record；以 browser 互動驗證取消不刪、確認刪除後只該 row 消失且 `settings.sequence` 不變。

## 4. Home Header Icon And Final Verification

- [x] [P] 4.1 使用 imagegen 產生「首頁桌球圖示用 raster project asset」：產出簡潔扁平、無文字、無 emoji、符合現有網站色彩的桌球圖示並保存為 `public/icons/table-tennis-home.png`；以檔案存在、圖片尺寸檢查、透明/背景需求檢查與人工預覽確認小尺寸仍可辨識。
- [x] 4.2 更新「首頁版面配置」與「Home screen layout」：`.home-header` 左側顯示桌球圖示、右側保留設定按鈕，圖示有非空 alt 或等效 accessible label，375px viewport 無水平 overflow；以 browser 截圖或 DOM assertion 驗證位置、可及性文字與 layout。
- [x] 4.3 執行整體驗證：跑 `npm run typecheck` 與 `npm run build`，再用 browser 手動驗證新增 modal、count sum、history 顯示、swipe delete、delete confirmation、legacy migration 同日折疊與首頁圖示；將驗證結果對照 `course-records`、`local-persistence`、`senior-friendly-ui` delta specs，確認沒有超出 Non-Goals 的 manifest、CSV、year picker 或 backend 變更。
