## ADDED Requirements

### Requirement: 片語閘門的清空動作

系統 SHALL 提供「清空所有課程紀錄」的動作。使用者 MUST 先從歷史紀錄頁上方的清空 icon button 進入清空確認畫面，再於確認畫面中一字不差地輸入片語 `刪除全部上課紀錄`（以 Unicode NFC 正規化後逐字比對，且前後不得有空白），才能啟用清空按鈕。系統 MUST NOT 提供任何從其他頁面（例如首頁、新增上課確認頁、設定頁）直接跳過此路徑觸發清空的入口。

#### Scenario: 清空按鈕預設停用

- **WHEN** 使用者從歷史紀錄頁的 icon button 進入清空確認畫面
- **THEN** `清空資料庫` 按鈕 MUST 以停用狀態呈現
- **AND** 頁面 MUST 同時顯示一個文字輸入欄位，其 placeholder 文字提示使用者必須輸入 `刪除全部上課紀錄` 才能啟用按鈕

#### Scenario: 完全相符才啟用

- **WHEN** 使用者於確認輸入欄填入任何值
- **AND** 該值經 Unicode NFC 正規化後，與 `刪除全部上課紀錄` 逐字相符、且無前後空白
- **THEN** `清空資料庫` 按鈕 MUST 進入可點擊狀態

#### Scenario: 近似或部分相符不會啟用

- **WHEN** 使用者所輸入的值與 `刪除全部上課紀錄` 有任何差異（包含多餘空白、錯字、字序不同、簡體變體、或半形變體）
- **THEN** `清空資料庫` 按鈕 MUST 維持停用狀態

### Requirement: 清空時必須保留設定與序號計數器

系統 SHALL 在清空動作成功確認後，刪除 `records` store 中的所有紀錄。系統 MUST NOT 刪除、重設或修改 `settings` store 中的任何值——`name`、`maxCourseCount` 與序號計數器（`{ key: "sequence", value }`）MUST 維持清空前的值，使得後續新增的 `courseNumber` 嚴格大於任何曾經出現過的 `courseNumber`，永不重用。

#### Scenario: 紀錄被清空、設定與序號被保留

- **WHEN** 使用者成功啟用並按下 `清空資料庫` 按鈕
- **THEN** 操作完成後，`records` store MUST 為零筆紀錄
- **AND** `settings` store 中的 `name` MUST 維持 `"Cindy"`
- **AND** `settings` store 中的 `maxCourseCount` MUST 維持 `100`
- **AND** `settings` store 中的序號計數器 MUST 維持清空前的值
- **AND** 首頁下一次渲染 MUST 顯示 `已上課 0/100`

#### Scenario: 清空後新增不重用舊的 courseNumber

- **WHEN** 清空前曾存在最大 `courseNumber` 為 `K` 的紀錄
- **AND** 使用者成功完成清空動作
- **AND** 使用者在清空後新增一筆課程紀錄
- **THEN** 新紀錄的 `courseNumber` MUST 嚴格大於 `K`

### Requirement: 不可復原警示文字

系統 SHALL 在清空確認畫面上，於使用者可輸入確認片語之前，以大字體的高齡友善級距清楚顯示「此操作無法復原」的警示文字。

#### Scenario: 警示文字清楚可見

- **WHEN** 使用者進入清空確認畫面
- **THEN** 不可復原警示文字 MUST 被放置在確認輸入欄上方或緊鄰的位置
- **AND** 警示文字 MUST 使用與主要操作標籤相同等級的大字體

## Requirements

### Requirement: 片語閘門的清空動作

系統 SHALL 提供「清空所有課程紀錄」的動作。使用者 MUST 先從歷史紀錄頁上方的清空 icon button 進入清空確認畫面，再於確認畫面中一字不差地輸入片語 `刪除全部上課紀錄`（以 Unicode NFC 正規化後逐字比對，且前後不得有空白），才能啟用清空按鈕。系統 MUST NOT 提供任何從其他頁面（例如首頁、新增上課確認頁、設定頁）直接跳過此路徑觸發清空的入口。

#### Scenario: 清空按鈕預設停用

- **WHEN** 使用者從歷史紀錄頁的 icon button 進入清空確認畫面
- **THEN** `清空資料庫` 按鈕 MUST 以停用狀態呈現
- **AND** 頁面 MUST 同時顯示一個文字輸入欄位，其 placeholder 文字提示使用者必須輸入 `刪除全部上課紀錄` 才能啟用按鈕

#### Scenario: 完全相符才啟用

- **WHEN** 使用者於確認輸入欄填入任何值
- **AND** 該值經 Unicode NFC 正規化後，與 `刪除全部上課紀錄` 逐字相符、且無前後空白
- **THEN** `清空資料庫` 按鈕 MUST 進入可點擊狀態

#### Scenario: 近似或部分相符不會啟用

- **WHEN** 使用者所輸入的值與 `刪除全部上課紀錄` 有任何差異（包含多餘空白、錯字、字序不同、簡體變體、或半形變體）
- **THEN** `清空資料庫` 按鈕 MUST 維持停用狀態

---
### Requirement: 清空時必須保留設定與序號計數器

系統 SHALL 在清空動作成功確認後，刪除 `records` store 中的所有紀錄。系統 MUST NOT 刪除、重設或修改 `settings` store 中的任何值——`name`、`maxCourseCount` 與序號計數器（`{ key: "sequence", value }`）MUST 維持清空前的值，使得後續新增的 `courseNumber` 嚴格大於任何曾經出現過的 `courseNumber`，永不重用。

#### Scenario: 紀錄被清空、設定與序號被保留

- **WHEN** 使用者成功啟用並按下 `清空資料庫` 按鈕
- **THEN** 操作完成後，`records` store MUST 為零筆紀錄
- **AND** `settings` store 中的 `name` MUST 維持 `"Cindy"`
- **AND** `settings` store 中的 `maxCourseCount` MUST 維持 `100`
- **AND** `settings` store 中的序號計數器 MUST 維持清空前的值
- **AND** 首頁下一次渲染 MUST 顯示 `已上課 0/100`

#### Scenario: 清空後新增不重用舊的 courseNumber

- **WHEN** 清空前曾存在最大 `courseNumber` 為 `K` 的紀錄
- **AND** 使用者成功完成清空動作
- **AND** 使用者在清空後新增一筆課程紀錄
- **THEN** 新紀錄的 `courseNumber` MUST 嚴格大於 `K`

---
### Requirement: 不可復原警示文字

系統 SHALL 在清空確認畫面上，於使用者可輸入確認片語之前，以大字體的高齡友善級距清楚顯示「此操作無法復原」的警示文字。

#### Scenario: 警示文字清楚可見

- **WHEN** 使用者進入清空確認畫面
- **THEN** 不可復原警示文字 MUST 被放置在確認輸入欄上方或緊鄰的位置
- **AND** 警示文字 MUST 使用與主要操作標籤相同等級的大字體