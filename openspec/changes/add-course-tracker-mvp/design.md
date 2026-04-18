## Context

本專案是一個全新建立、單人使用、純本地執行的網頁工具。MVP 首版的使用者僅有一位——Cindy，一位退休桌球課程學員——她只在自己的 Android 手機上使用此工具追蹤上課進度。目前 repo 尚無任何應用程式碼。因為使用者對操作複雜度與錯誤容忍度低，UI 必須使用大字體、明確按鈕，並對所有寫入動作設置確認閘門；同時資料必須能在瀏覽器重啟後保留，但又不能依賴任何後端。

主要限制：

- 必須以靜態網站形式在本地執行，不得有後端服務。
- 主要目標平台：Android 手機瀏覽器上的 Chrome 與 Samsung Internet（MVP 首版驗收範圍）；其他瀏覽器與 iOS Safari 不在首版範圍內。
- 儲存層：只能使用 IndexedDB；MVP 首版不實作 CSV 匯入匯出。
- 不做認證、不做多人同步、不做雲端服務。
- 所有面向終端使用者的 UI 文案皆為繁體中文（zh-TW），且需符合退休長青族群易讀、易懂的風格。
- MVP 首版使用者固定為 Cindy：初始化時以 `name = "Cindy"`、`maxCourseCount = 100` 種子資料，且不提供任何修改 UI。

## Goals / Non-Goals

**Goals:**

- 交付一個高齡友善的單頁應用，讓 Cindy 能用最少的步驟追蹤已上堂數相對於目標堂數（100）的進度。
- 首頁以兩行文案呈現：第一行 `嗨 Cindy`、第二行 `已上課 <usedCount>/<maxCourseCount>`，`usedCount` 依實際資料動態計算。
- 新增上課確認頁刻意不顯示 `courseNumber`，日期以 `今天是M月D日 星期X` 繁體中文格式呈現。
- 對所有會改動資料的動作（新增課程、清空資料庫）皆設置明確的確認步驟，避免誤觸或重複新增造成的資料損失。
- 透過可審閱、schema 簡潔的 IndexedDB 層，讓資料在瀏覽器重啟後仍然存在。
- 維持程式碼規模小、依賴少，讓單人開發也能長期維護。

**Non-Goals:**

- 不做原生 Android App、後端 API、認證或多人同步。
- 不做設定頁，不允許從 UI 修改 `name` 或 `maxCourseCount`。
- MVP 首版不做 CSV 匯入匯出，也不做資料管理頁。
- 不做 Service Worker／PWA 安裝／離線殼層（靜態網站本身的快取除外）。
- 不做連勝數／分析／報表等超過單純 `已上 / 目標` 計數器的功能。
- 不做跨分頁即時同步（以最後寫入者為準即可）。
- MVP 階段不做 zh-TW 以外的多語系。

## Decisions

### Decision: Build stack is Vite + TypeScript + vanilla DOM

採用 Vite 作為 build 工具、TypeScript 作為程式語言，但刻意不引入重量級 UI 框架。UI 面板數量有限（首頁、新增課程確認頁、歷史紀錄頁、清空資料庫確認頁），以靜態 HTML 加上薄薄一層 TypeScript controller 組成即可。

**理由：** 依賴最少、bundle 最小，對 Android 瀏覽器最友善；單一使用者應用不需要 hydration／reactivity 的複雜性；Vite 提供流暢的開發迴圈與單純的 `vite build` 靜態輸出。

**其他評估過的方案：**

- **React + Vite：** 不採用 — 對於一個四面板、單一使用者的應用是殺雞用牛刀，bundle 與學習成本都不划算。
- **Svelte / Solid：** 不採用 — 技術上可行，但會多一層抽象需要維護；原生 DOM 在本專案已足夠。
- **純靜態 HTML 搭配 script 標籤（不 build）：** 不採用 — 會失去 TypeScript 的型別檢查，而 IndexedDB 層正是本 MVP 中最容易出錯的程式碼。

### Decision: IndexedDB schema with three logical concerns in two object stores

使用單一資料庫 `course-tracker`（版本 `1`），底下只有兩個 object store：

- `settings`：keyPath 為 `"key"`，包含一筆 singleton 設定 `{ key: "singleton", name, maxCourseCount }`，以及一筆保存「最後一次已分配的 `courseNumber`」的 meta 資料 `{ key: "sequence", value: <number> }`（初始為 `0` 代表尚未分配過；新增時取 `sequence + 1` 作為新的 `courseNumber`，再把 `sequence` 更新為該新值）。
- `records`：keyPath 為 `"courseNumber"`，包含 `{ courseNumber, attended, attendedDate, weekday, note }`。

將序號計數器放進 `settings` store，讓新增課程的交易可以在一個 transaction 內同時完成三件事：讀取 `sequence`、以 `sequence + 1` 寫入新的 `records` 紀錄、並把 `sequence` 更新為該新值；`sequence` 的語意固定為「最後一次已分配的 `courseNumber`」，刻意避開「下一個要使用的號碼」這種易混淆的定義。

**理由：** 兩個 store 讓 schema 維持最小；把序號與設定共用同一個 store 不需要增加第三個 store，也讓新增課程的交易更單純。清空資料庫的交易只操作 `records` store，不會動到 `settings`，因此 `name`、`maxCourseCount` 與序號計數器都能被完整保留，`courseNumber` 也永遠不會被重新使用。MVP 首版 `settings` 在首次開啟時以 `{ name: "Cindy", maxCourseCount: 100 }` 與 `{ sequence: 0 }` 種子化，之後不再由 UI 修改。

**其他評估過的方案：**

- **IndexedDB `records` 開啟 auto-increment：** 不採用 — auto-increment 在 store 被清空或重建時會歸零，違反「courseNumber 不可重複使用」的需求。
- **獨立的 `meta` object store 只放序號：** 不採用 — 為一個純量增加一個 store 過於笨重；與 `settings` 共用不會造成壞處，且讓新增課程的交易更簡單。
- **localStorage 放設定、IndexedDB 放紀錄：** 不採用 — 分裂的儲存層讓備份、匯入匯出變複雜，且如果其中一層被瀏覽器清掉，會出現資料不一致。

### Decision: Phrase-gated destructive clear with NFC-normalised exact match

清空資料庫的文字輸入框，會將使用者輸入以 Unicode NFC 正規化後，與字面值 `刪除全部上課紀錄` 進行字元對字元比對。任何前後空白都會讓比對失敗。簡體中文變體（例如 `删除全部上课纪录`）不接受。

**理由：** NFC 正規化可避免不同輸入法路徑在視覺上等價卻在位元組上不同的 false negative；嚴格的字元比對可防止使用者只打到類似片語就意外觸發。要求繁體中文字元也表示只會簡體輸入法的使用者必須主動切換 IME，這種輕微摩擦對應不可復原操作的風險是合理的。

**其他評估過的方案：**

- **只用兩次點擊確認：** 不採用 — 對不可復原操作的摩擦不足，且需求明確要求輸入片語。
- **同時接受繁體與簡體變體：** 不採用 — 增加透過自動完成意外觸發的風險；需求已明訂必須為 `刪除全部上課紀錄`。
- **允許忽略空白／大小寫的模糊比對：** 不採用 — 本片語為中文，無大小寫概念；忽略空白只會削弱閘門，使用者不會因此更方便。

### Decision: Guarded add-course flow uses an intermediate confirmation screen, not a modal

點擊 `新增上課紀錄` 會進入一個專屬的確認頁，頁面上以大字體顯示 `今天是M月D日 星期X`（依裝置本地日期計算；不含年份；月份、日期與星期名稱皆為繁體中文，例如 `今天是 4 月 18 日 星期六`），並提供大按鈕 `確認新增` 與 `取消`。確認頁「不」顯示 `courseNumber`——`courseNumber` 只作為資料層的內部序號與排序鍵，不向終端使用者呈現。

**理由：** 對退休長青族群而言，整頁式確認頁比彈出的 modal 更容易理解；modal 在小螢幕上容易因為誤觸背景被關閉，內容也可能被部分遮擋。整頁式確認頁也提供足夠空間讓 `senior-friendly-ui` 要求的大字體舒展。`courseNumber` 雖是可靠的資料主鍵，但對使用者而言沒有直覺意義，也可能被誤解為「這是我本週／本月第幾堂」而造成困惑，故刻意隱藏。日期刻意不含年份，是因為首頁與確認頁聚焦於「今天上課」這件事情，年份對使用者決策沒有幫助。

**其他評估過的方案：**

- **Modal 對話框：** 不採用 — 有誤觸關閉的風險，小螢幕空間也不夠。
- **在首頁上內嵌展開確認區塊：** 不採用 — 會讓首頁同時存在多種狀態，使主要操作變得不明確。
- **Double-tap 確認（N 秒內點兩次）：** 不採用 — 高齡使用者不會主動發現這種互動。
- **在確認頁顯示 `courseNumber`：** 不採用 — 對終端使用者無意義且可能造成誤解。

### Decision: Clear entry is an icon button on the history page with explicit text label

「清空資料庫」的入口放在歷史紀錄頁上方的 icon button，而不是獨立的「資料管理頁」。icon button 必須搭配清楚可讀的文字標籤（例如 `清空上課紀錄`），顏色與字級需與一般次要操作明顯可區分，且本身只作為入口——點擊後會導向清空確認頁，不能直接執行清空。

**理由：** MVP 首版刻意不做資料管理頁以維持 UI 面板最少；同時歷史紀錄頁是「檢視過往資料」的合理上下文，把破壞性入口放在這裡讓使用者在看到資料全貌後再決定是否清除，比起另開一個資料管理頁更符合使用情境。強制搭配文字標籤是因為退休長青族群不一定能立即辨識抽象圖示，單靠圖示傳達破壞性操作會造成風險。

**其他評估過的方案：**

- **獨立資料管理頁：** 不採用 — 增加一個 MVP 不需要的面板；在只有 Cindy 一人使用的情境下多餘。
- **在首頁主操作區放清空按鈕：** 不採用 — 首頁應聚焦於「嗨 Cindy」與「已上課 X/Y」的正向情境，不宜把破壞性操作擺在最顯眼位置。
- **只用 icon（不加文字）：** 不採用 — 對高齡使用者辨識度不夠，增加誤觸風險。

## Risks / Trade-offs

- **風險：** IndexedDB 可能在瀏覽器儲存空間不足、或使用者手動「清除網站資料」時被瀏覽器清掉，導致資料全失。→ **緩解：** MVP 首版不做 CSV 備份的情況下，使用者只能透過重新建立紀錄來復原；此風險在 MVP 階段被接受，未來加回 CSV 匯出時可提供備份手段。
- **風險：** 同時開兩個分頁時可能在序號計數器上產生競態。→ **緩解：** 依賴 IndexedDB transaction 的序列化保證；第二個分頁的新增交易會在第一個 commit 後觀察到新的序號值。跨分頁即時 UI 更新明確非目標，舊分頁可能會顯示舊的計數直到重新整理。
- **風險：** 未來恢復 CSV 匯入時若沒有同步更新 sequence，會產生 `courseNumber` 衝突。→ **緩解：** 記於下列「Future Considerations」中，並在恢復 CSV 功能的 change 中一併落實。
- **Trade-off：** 選擇原生 DOM 而非框架會讓 controller 層多一點樣板程式碼，但換來更小的 bundle 與零框架鎖定，對一個四面板的應用是合理的。
- **Trade-off：** 固定寫入 `name = "Cindy"` 沒有編輯 UI，意味若換人使用需要重新部署或手動修改種子資料；因使用者明確為 Cindy 一人，此折衷接受。
- **Trade-off：** 以繁體中文片語作為清空閘門，會擋掉只會輸入簡體的使用者。MVP 目標族群是 Cindy，此折衷可接受。

## Future Considerations

**CSV 匯入恢復時的 sequence 規則（MVP 不實作，但設計層面預留）：**

前提：`sequence` 的語意固定為「最後一次已分配的 `courseNumber`」，而非「下一個要使用的號碼」。因此新增時永遠是 `新 courseNumber = sequence + 1`，`sequence = 0` 代表尚未分配過任何 `courseNumber`。

未來若重新加入 CSV 匯入功能，則在匯入成功後，`sequence`（儲存於 `settings` store 的 `{ key: "sequence", value }`）必須依下列規則更新：

- 若匯入後 `records` store 存在至少一筆紀錄：`sequence` 更新為匯入後所有紀錄中最大的 `courseNumber`（即最後一次已分配過的值；下一筆將以 `sequence + 1` 分配）。
- 若匯入後 `records` store 為空：`sequence` 設為 `0`（與首次開啟的初始值一致，代表尚未分配過任何 `courseNumber`）。

此規則確保匯入後新增的紀錄不會與匯入紀錄的 `courseNumber` 衝突、也不會跳過太多號碼，同時避免與「下一個要使用的號碼」語意混淆。MVP 首版因不提供 CSV 匯入，此規則不實作；記錄於此以供未來變更實作時依循。
