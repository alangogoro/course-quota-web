## Why

目前新增上課紀錄只能記錄今天、固定一人、沒有可輸入備註的確認視窗；歷史紀錄也只能用「上課」標籤表示狀態，無法反映多人上課或單筆刪除。這次變更要讓實際上課情境能在手機上一次完成，並保留既有使用者資料。

## What Changes

- 首頁「新增上課紀錄」改為開啟符合既有網站風格的 modal 確認視窗，而不是切到整頁確認畫面。
- 新增紀錄 modal 顯示「今天是 M 月 D 日 星期 X」文字，並允許使用者選擇月日；選擇後系統即時更新 weekday 顯示與保存值。
- 新增紀錄 modal 提供 count 欄位，代表上課人數與該筆紀錄貢獻的堂數；預設 1，上限 10。
- 新增紀錄 modal 提供 note 欄位，預設空白，最多 50 字。
- CourseRecord schema 新增 count 欄位；首頁已上課堂數改為所有紀錄 count 的加總。
- 既有 IndexedDB records 需要 migration：舊紀錄依 `attendedDate` 分組，同一天多筆 legacy records 代表多人上課，應合併為 `count = 當日筆數`；單筆日期仍為 `count = 1`，且每筆 migrated record 的 count 不得超過 10。
- 歷史紀錄頁的狀態標籤改為顯示人數，例如「1人」、「2人」；有 note 才在下一行顯示備註，沒有 note 不顯示額外訊息。
- 歷史紀錄頁支援單筆滑動刪除：滑出刪除按鈕後，點刪除再顯示確認視窗，確認後才刪除該筆紀錄。
- 單筆刪除只刪除 records 中的目標 courseNumber，不修改 settings.sequence，因此 courseNumber 仍永不重用。
- 首頁上方設定按鈕左側新增符合整體風格的桌球圖示，圖示由 imagegen 產生並保存為 project asset。

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `course-records`: CourseRecord 新增 count 欄位，首頁堂數改用 count 加總，歷史紀錄顯示人數與備註，並支援單筆刪除。
- `local-persistence`: IndexedDB schema 需要升級並 migrate 既有 records，舊紀錄按日期折疊為 count，單日多筆視為同日人數。
- `senior-friendly-ui`: 新增紀錄 modal、月日選擇、人數與備註輸入、單筆刪除確認 modal、首頁桌球圖示與手機滑動刪除互動。

## Impact

- Affected specs: course-records, local-persistence, senior-friendly-ui
- Affected code:
  - New: public/icons/table-tennis-home.png
  - Modified: src/main.ts, src/db/db.ts, src/styles/base.css
  - Removed: none
