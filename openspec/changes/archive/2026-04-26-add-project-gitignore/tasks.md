## 1. .gitignore 實作

- [x] 1.1 在 `.gitignore` 中加入 `.vscode/`（整個 IDE 設定目錄），確認 git status 不追蹤 `.vscode/` 內任何檔案（Ignore IDE configuration directories）
- [x] 1.2 在 `.gitignore` 中加入 `screenshots/`，供手動驗收截圖使用（Ignore manual acceptance test screenshots）
- [x] 1.3 在 `.gitignore` 中加入 browser profile 相關目錄：`user-data-dir/`、`.playwright/`、`playwright-user-data/`（Ignore browser profile directories）
- [x] 1.4 確認 `.gitignore` 已包含 Node / Vite build artifacts（`node_modules/`、`dist/`、`.vite/`）、OS 檔案（`.DS_Store`、`*.log`）（Ignore Node and Vite build artifacts、Ignore OS and log artifacts）
- [x] 1.5 確認正式資產不被忽略：`public/icons/`、`public/favicon.ico`（或相等路徑）、manifest 引用的圖檔均可被 git 追蹤（Preserve production assets）

## 2. 驗收

- [x] 2.1 在 `screenshots/` 目錄內建立測試檔（例如 `test.png`），執行 `git status`，確認該檔案不出現（Ignore manual acceptance test screenshots）
- [x] 2.2 確認 `.vscode/` 不出現於 `git status`（Ignore IDE configuration directories）
