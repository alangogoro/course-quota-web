## Why

目前專案尚未定義一份清楚且符合實際需求的 `.gitignore`，容易把不應納入版本控制的檔案誤加入 repo，例如 Node / Vite build 產物、手動測試截圖、驗收用圖片、瀏覽器測試 profile 或暫存資料夾。需要一份符合本專案需求的 `.gitignore`，避免 repo 變髒，也避免誤傷正式資產。

## What Changes

- 新增或更新 `.gitignore`，涵蓋以下類別：
  - Node / Vite 專案常見 build 產物（`node_modules/`、`dist/`、`.vite/`）
  - IDE 設定目錄（`.vscode/`）
  - 手動驗收用截圖資料夾（`screenshots/`）
  - 本地測試用的 browser profile / user-data-dir 類型資料夾
  - 常見 OS 暫存檔（`.DS_Store`、`*.log`）
- 保留正式資產：app icon、favicon、manifest 用到的正式圖檔不受影響

## Non-Goals

- 不在此 change 中修改應用功能
- 不在此 change 中改動 UI 或資料流程
- 不在此 change 中加入新的測試框架或 CI 規則

## Capabilities

### New Capabilities

- `repo-hygiene`：建立與維護一份符合本專案實際需求的 `.gitignore`，避免將不必要檔案納入版本控制。

### Modified Capabilities

(none)

## Impact

- 受影響檔案：`.gitignore`
- 不應改動：任何使用者可見功能、IndexedDB schema、首頁、歷史頁、新增頁、清空流程
