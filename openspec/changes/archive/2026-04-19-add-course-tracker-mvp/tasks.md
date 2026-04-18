## 1. 專案初始化

- [x] 1.1 依「Decision: Build stack is Vite + TypeScript + vanilla DOM」建立專案骨架：Vite + TypeScript scaffold、基礎 `index.html` 殼層、以及高齡友善樣式表，並滿足「無障礙最低標準」（內文 18 px、主按鈕標籤 24 px、點擊區至少 48 x 48 CSS 像素、對比達 WCAG AA）。

## 2. 本地資料層

- [x] 2.1 依「Decision: IndexedDB schema with three logical concerns in two object stores」實作「資料庫 schema 與種子資料」的兩個 object store（`settings` + `records`），滿足「IndexedDB 作為主資料儲存」（不得使用 localStorage、cookies、遠端服務或 CSV 作為執行期資料來源），並於首次開啟時以 `{ name: "Cindy", maxCourseCount: 100 }` 與 `{ key: "sequence", value: 0 }` 種子化以滿足「種子化使用者設定」；其中 `sequence` 的語意固定為「最後一次已分配的 `courseNumber`」，`0` 代表尚未分配過任何 `courseNumber`（不得誤解為「下一個要使用的號碼」）。
- [x] 2.2 實作新增課程的 IndexedDB transaction，滿足「寫入路徑原子性」與「courseNumber 自動遞增」：單一 readwrite transaction 內先讀取 `sequence`（最後一次已分配的 `courseNumber`），以 `sequence + 1` 寫入新的 `records` 紀錄，再把 `sequence` 更新為該新值；即使清空後 `sequence` 也不重設，避免重用 `courseNumber`。

## 3. 課程紀錄

- [x] 3.1 依「課程紀錄資料結構」建立 course-record 資料層（`courseNumber`、`attended`、`attendedDate`、`weekday`、`note`；不得含 `name` 或 `maxCourseCount`；`courseNumber` 為內部序號），並驗證「不設紀錄筆數上限」（筆數超過 `maxCourseCount` 時 `已上課 105/100` 仍能正確顯示）。
- [x] 3.2 實作歷史紀錄頁以滿足「列出課程紀錄」：依 `courseNumber` 由大到小排序、每列顯示 `attendedDate` / 繁體中文星期 / `attended` / `note`，且 MUST NOT 向終端使用者顯示 `courseNumber`。

## 4. 首頁與新增上課流程

- [x] 4.1 建立首頁，依「首頁版面配置」依序顯示第一行 `嗨 Cindy`（以 `settings.name` 動態渲染為 `嗨 <name>`）與第二行 `已上課 <usedCount>/<maxCourseCount>`（`usedCount` 動態計算、不得寫死），並驗證「禁止靜默自動新增」——載入、焦點切換或導覽都不得改動紀錄；首頁上不得出現設定頁、CSV 或資料管理頁的入口。
- [x] 4.2 依「Decision: Guarded add-course flow uses an intermediate confirmation screen, not a modal」實作「有確認閘門的新增課程流程」：整頁式確認畫面，MUST NOT 顯示 `courseNumber`；以裝置本地日期計算並渲染 `今天是M月D日 星期X`（繁體中文、不含年份）；提供大字體 `確認新增` 與 `取消` 控制元件。

## 5. 歷史紀錄頁的清空入口

- [x] 5.1 依「Decision: Clear entry is an icon button on the history page with explicit text label」在歷史紀錄頁上方實作「歷史紀錄頁的清空入口」：icon button 搭配清楚可讀的繁體中文文字標籤（例如 `清空上課紀錄`），且 icon button 只作為入口，點擊後導向清空確認畫面，MUST NOT 直接執行清空。

## 6. 清空流程

- [x] 6.1 依「Decision: Phrase-gated destructive clear with NFC-normalised exact match」實作「片語閘門的清空動作」：對 `刪除全部上課紀錄` 做 Unicode NFC 正規化逐字比對（前後不得有空白、不接受簡體與半形變體），並於確認畫面以大字體級距渲染「不可復原警示文字」（`此操作無法復原`）。
- [x] 6.2 實作清空流程語意以滿足「清空時必須保留設定與序號計數器」：以單一 readwrite transaction 清空 `records` store，`settings` store 中的 `name`（`"Cindy"`）、`maxCourseCount`（`100`）與 `sequence`（最後一次已分配的 `courseNumber`）皆須維持不變；清空後新增的 `courseNumber` 會以 `sequence + 1` 分配，嚴格大於清空前曾出現過的最大 `courseNumber`。

## 7. 端對端驗收

- [x] 7.1 於 Android Chrome 與 Samsung Internet 逐一走過所有 spec scenario：首次開啟的 Cindy 種子化、首頁 `嗨 Cindy` 與 `已上課 <usedCount>/<maxCourseCount>` 兩行文案、新增上課流程（確認頁不顯示 `courseNumber`、日期為 `今天是M月D日 星期X` 繁體中文不含年份）、歷史紀錄頁瀏覽（每列不顯示 `courseNumber`）、歷史紀錄頁的清空 icon button 搭配清楚文字標籤、片語閘門清空後設定與序號計數器皆保留，以及關閉再重新開啟瀏覽器後資料仍存在。
