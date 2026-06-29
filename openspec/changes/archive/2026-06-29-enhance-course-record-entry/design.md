## Context

目前 course-quota-web 是 mobile-first 的本機課程追蹤工具。新增紀錄流程使用整頁 `confirm-add`，資料層的 `CourseRecord` 尚未記錄人數，首頁堂數以 attended 紀錄筆數計算，歷史紀錄只顯示「上課」標籤。這次變更同時改動資料 shape、IndexedDB migration、首頁統計、history 列表、modal 表單、滑動刪除互動與首頁圖示，因此需要明確設計以避免破壞既有資料。

本專案 UI 已有長輩友善取向：大字級、48px touch target、明確 primary/danger 按鈕、light color scheme。`ui-ux-pro-max` review 對本變更的約束是：modal 必須有明確取消路徑、form field 必須有 visible label、破壞性動作必須有確認、滑動操作不能是唯一可操作路徑、所有互動目標維持至少 48px。

## Goals / Non-Goals

**Goals:**

- 讓使用者從首頁按「新增上課紀錄」後，在同頁 modal 中確認並輸入日期、count 與 note。
- 將 `CourseRecord.count` 定義為上課人數與堂數加總來源；新紀錄預設值為 1，舊資料 migration 會將同一日多筆 legacy records 折疊成 `count`。
- 讓首頁已上課堂數顯示所有紀錄的 count 加總，而不是紀錄筆數。
- 讓歷史紀錄以「N人」顯示 count，且只在 note 非空時顯示備註。
- 讓使用者在歷史紀錄頁透過水平滑動露出刪除按鈕，再經確認 modal 刪除單筆紀錄。
- 透過 imagegen 產生一個與既有風格相容的桌球圖示，放在首頁 header 的設定按鈕左側。

**Non-Goals:**

- 不支援跨年份補登；日期選擇只指定月日，內部使用目前年份組成 `YYYY-MM-DD`。
- 不新增後端、雲端同步、CSV 匯入匯出或多使用者資料模型。
- 不讓滑動完成直接刪除資料；刪除必須經過明確確認。
- 不重設、不壓縮、不重用 `courseNumber`。
- 不把首頁桌球圖示當作 PWA launcher icon 或修改 manifest。

## Decisions

### 使用 `count` 作為人數與堂數的單一欄位

`CourseRecord` 新增 `count: number`，有效範圍為 1 到 10。這個欄位同時代表該筆紀錄的上課人數與首頁堂數加總值。

Rationale：使用者明確要求欄位名稱是 `count`，且人數 1 增加堂數 1、人數 2 增加堂數 2。用一個欄位避免 `peopleCount` 與 `lessonCount` 分裂後需要同步。

Alternatives considered：

- `peopleCount`：語意清楚但違反使用者指定欄位名稱。
- 保持一筆紀錄一堂：無法支援多人上課對堂數的影響。

### 以 IndexedDB version upgrade migration 按日期折疊 legacy records

將 DB schema version 從目前版本升級，migration 在 upgrade transaction 中掃描缺少有效 `count` 的 legacy records，依 `attendedDate` 分組。同一天有多筆 legacy records 時，視為同一天多人上課，將這些 records 折疊成代表紀錄並設定 `count` 為該日筆數。單一日期只有一筆 legacy record 時，該 migrated record 的 `count` 為 1。

為了維持 `count` 上限 10，若同一天 legacy records 超過 10 筆，migration 必須依 `courseNumber` 由小到大排序後，每 10 筆切成一組；每組保留該組最高 `courseNumber` 的 record 作為代表，`count` 設為該組大小，其餘同組 records 從 `records` store 刪除。`settings.sequence` 保持不變，因此未來新增仍不會重用已分配過的 `courseNumber`。如果同組 legacy records 含非空 note，migration 以 `courseNumber` 由小到大的順序串接 distinct trimmed notes，使用 `；` 分隔並限制在 50 user-perceived characters 內。

讀取紀錄與統計時仍要把缺少或無效的 `count` fallback 成 1，避免升級流程中斷造成畫面錯誤。

Rationale：使用者補充既有資料已累積一段時間，過去同一天兩筆上課紀錄很可能代表同一天兩人上課；若只把每筆補 `count=1`，history 會保留兩筆同日紀錄，不符合新資料模型。日期折疊讓舊資料進入新模型後能用「1 筆紀錄 + count」表達同一日多人上課。

Alternatives considered：

- 只在讀取時 fallback：可以顯示但資料庫永遠保留舊 shape，不利後續維護。
- 每筆 legacy record 都補 `count=1`：首頁總數會正確，但同日多人上課仍會顯示成多筆 history rows，違反新 UI 的人數語意。
- 清空後重建資料：會違反資料保留要求。

### 新增紀錄改為首頁 modal 表單

首頁按「新增上課紀錄」後不切 route，而是在首頁上覆蓋 modal。modal 包含：日期文字、月日選擇、count stepper/input、note 欄位、取消與確認按鈕。取消關閉 modal 且不寫入資料；確認通過 validation 後呼叫新增資料操作。

日期選擇以目前年份為基準，使用者只調整月與日。當月日改變時，UI 立即更新「星期X」文字，保存時寫入對應的 `attendedDate` 與 `weekday`。若使用者選到不存在日期，例如 2 月 31 日，UI 必須將日數 clamp 到該月最後一天並更新星期。

Rationale：modal 符合附件參考的確認視窗心智模型，也避免使用者離開首頁脈絡。月日與星期同時顯示可降低補登錯誤。

Alternatives considered：

- 保留整頁 confirm-add：無法符合附件中的 modal 視覺需求。
- 使用完整 date picker 選年月日：功能較完整，但超出本次「選擇月日」範圍，也增加跨年規則。

### 單筆刪除採用 swipe reveal 加確認 modal

歷史紀錄每列支援水平滑動，滑動超過門檻後露出紅色「刪除」按鈕。使用者點刪除按鈕後顯示確認 modal，modal 需顯示該筆紀錄的日期與 count，例如「6月29日 星期一・2人」。按取消關閉確認 modal 並保留紀錄；按刪除才呼叫單筆刪除資料操作。

刪除資料操作只刪除 `records` store 中指定 `courseNumber` 的 record，不修改 `settings.sequence`，不重新排序其他紀錄，不重用任何曾經分配過的 `courseNumber`。

Rationale：滑動刪除符合 mobile list 習慣，但本 app 有長輩友善與防誤觸取向，因此不能讓滑動本身直接刪除。二次確認保留破壞性操作的明確性。

Alternatives considered：

- 滑到門檻直接刪除：最快，但誤觸風險高。
- 每列永遠顯示刪除按鈕：可發現性高，但歷史列表會變得吵雜。

### 歷史紀錄顯示 count 與條件式 note

歷史紀錄的右側 badge 改成 `N人`，不再顯示「✓ 上課」。note 非空且 trim 後仍有內容時，才在日期列下方顯示備註；note 空白時列表列只顯示日期、weekday 與 count。

Rationale：現在 attended 已固定代表上課紀錄，使用者真正需要辨識的是人數與備註。

Alternatives considered：

- 同時顯示「上課」與「N人」：資訊重複，會降低小螢幕掃描效率。

### 首頁桌球圖示用 raster project asset

實作階段使用 built-in imagegen 產生桌球圖示，保存為 `public/icons/table-tennis-home.png`。圖示應是簡潔、扁平、無文字、無 emoji 的桌球拍與球意象，色彩取自現有 primary/surface/text palette，不使用附件圖片的佛經金棕主題。首頁 header 由左側圖示與右側設定按鈕組成，圖示提供非空 alt text 或等效 accessibility label。

Rationale：使用者指定用 imagegen 生成圖示，且這是頁面品牌化視覺資產，不是結構性 icon set。保存到 `public/icons` 可讓 `src/main.ts` 以穩定路徑引用。

Alternatives considered：

- 手寫 SVG：更可控，但不符合使用者指定 imagegen。
- 使用 emoji：與 ui-ux-pro-max 的 structural icon rule 不符，跨平台樣式不穩。

## Implementation Contract

**Data shape:**

- `CourseRecord` MUST include `count: number` in addition to existing `courseNumber`, `attended`, `attendedDate`, `weekday`, and `note`.
- New records MUST save `count` as an integer from 1 through 10.
- New records MUST save `note` as a string with at most 50 user-perceived characters after trimming leading and trailing whitespace for persistence.
- Legacy records without `count` MUST behave as `count = 1` in read fallback, renders, and count aggregation when migration has not folded them yet.

**Storage behavior:**

- The IndexedDB version upgrade MUST group legacy records without a valid count by `attendedDate`; each same-date group of 1 through 10 records MUST become one migrated record with `count` equal to group size.
- If a same-date legacy group has more than 10 records, migration MUST split that date into chunks of at most 10 records and create one migrated record per chunk with `count` equal to chunk size.
- For each migrated group or chunk, the representative record MUST use the highest `courseNumber` in that group or chunk; non-representative records in the group or chunk MUST be removed from `records`.
- The migration MUST preserve `attendedDate` and `weekday` on representative records, MUST preserve or deterministically combine non-empty notes within the 50-character note limit, and MUST NOT modify `settings.singleton` or `settings.sequence`.
- `addCourse` or its replacement MUST accept `attendedDate`, `weekday`, `count`, and `note` values and persist them atomically with the sequence update.
- A new single-record delete operation MUST delete only the requested `courseNumber` from `records`; it MUST NOT modify `settings.sequence`.

**UI behavior:**

- Pressing the homepage primary button opens a modal over the homepage.
- The modal has visible labels for date, count, and note controls; visible cancel and confirm buttons; and a scrim strong enough to separate the foreground card from the page.
- The default modal state uses today in local device time, `count = 1`, and empty note.
- Changing month/day updates the displayed weekday before confirmation.
- Count validation rejects values below 1, above 10, non-integers, and empty values; note validation rejects values over 50 characters.
- Confirm is disabled or blocked while invalid; validation errors appear near the field and are announced with accessible error semantics.
- History rows render date + weekday + `N人`; note renders only when non-empty.
- Swipe on a history row reveals a delete button. Activating that button opens a confirmation modal. Only the confirmation modal's destructive action deletes the record.
- The delete confirmation modal includes enough record context for verification: date, weekday, count, and note when note is non-empty.

**Acceptance criteria:**

- TypeScript build passes with strict settings.
- Existing single-record dates created before this change display as `1人` and contribute 1 to the homepage total.
- Existing same-date legacy duplicates created before this change display as one migrated row per chunk with `count` equal to the number of legacy records in that chunk, for example two records on 6 月 29 日 display as `2人`.
- Adding a record with count 3 increases the homepage total by 3 and shows `3人` in history.
- Adding a record with note `教練代課` shows that note under the history row; adding with an empty note shows no extra note line.
- Selecting 2 月 31 日 clamps to the last valid February day for the current year and updates weekday accordingly.
- Swiping a row does not delete it; clicking the revealed delete button and cancelling keeps it; confirming deletes exactly that row and leaves sequence unchanged.
- The homepage header shows a table-tennis image asset on the left and the settings button on the right without horizontal overflow at 375px width.

**Scope boundaries:**

- In scope: `src/main.ts`, `src/db/db.ts`, `src/styles/base.css`, generated asset `public/icons/table-tennis-home.png`, and focused tests or manual verification for this behavior.
- Out of scope: backend sync, CSV import/export, PWA manifest icon replacement, multi-user support, year picker, bulk delete redesign, global design-system rewrite.

## Risks / Trade-offs

- [Risk] IndexedDB migration bugs could hide or corrupt old records while folding same-date legacy rows. → Mitigation: make the grouping deterministic by `attendedDate` and `courseNumber`, preserve `settings.sequence`, cap chunks at 10, and verify seeded legacy datasets with single-date, duplicate-date, and over-10-date cases.
- [Risk] Swipe gestures can conflict with vertical scroll or browser back gestures. → Mitigation: require horizontal movement threshold, only track one open row at a time, and keep delete behind a visible button plus confirmation modal.
- [Risk] Modal form can feel crowded on small phones. → Mitigation: use existing spacing scale, visible labels, large controls, and allow the modal content to scroll within viewport if needed.
- [Risk] Generated raster icon could miss the UI tone on the first attempt. → Mitigation: generate a simple flat icon, verify size/readability, and save a versioned asset without overwriting unrelated icons.
- [Risk] Folding same-date legacy records changes history row count. → Mitigation: preserve the homepage total by setting `count` to the number of folded records, keep representative `courseNumber` deterministic, and document that same-day duplicates become count rather than separate rows.

## Migration Plan

1. Increase IndexedDB schema version.
2. During `onupgradeneeded`, ensure existing object stores remain intact, load legacy records without valid `count`, group them by `attendedDate`, sort each group by `courseNumber`, and split each date into chunks of at most 10 records.
3. For each group or chunk, keep the highest `courseNumber` record as the representative, set `count` to chunk size, preserve `attendedDate` and `weekday`, deterministically combine non-empty notes within 50 characters, and delete non-representative records from `records`.
4. Keep `settings.sequence` unchanged, even when representative rows are fewer than the original legacy rows.
5. Update read paths to normalize any remaining records with missing/invalid `count` to 1.
6. Update write paths to persist `count` and trimmed `note` for new records.
7. Add single-record deletion without touching settings or sequence.
8. Verify upgrade using a browser profile or seeded IndexedDB state that contains pre-change records without `count`, including same-date duplicates.

Rollback strategy: because this migration can delete non-representative same-date legacy rows after folding them into `count`, rollback to old code is not semantically lossless for history row count. Before applying migration in production-like browser data, implementation should be verified against seeded data. Once migrated, old code can still display representative rows, but it will ignore `count` and undercount folded dates.

## Open Questions

None. The discussion resolved the key interaction decision: swipe reveals delete, then delete confirmation modal performs the destructive action.
