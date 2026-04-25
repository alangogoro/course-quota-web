## 1. 設計 Icon 視覺資產

- [x] 1.1 使用 `ui-ux-pro-max` skill 進行 icon 設計 review：確認「桌球 + 球拍」圖示的風格方向（顏色、線條、背景）符合本專案簡潔成熟的視覺方向，並產出 icon 設計規格
- [x] 1.2 實作 Icon design is a ping-pong paddle and ball motif：依設計規格製作 512×512 px SVG 或 PNG 來源圖檔，確保圖示在 48×48 px 時仍可辨識桌球主題

## 2. 產出多尺寸 Icon 資產

- [x] 2.1 實作 Icon assets cover Android home screen sizes：依來源圖產出 `public/icons/icon-192.png`（192×192）與 `public/icons/icon-512.png`（512×512）一般用途 PNG
- [x] 2.2 產出 maskable icon：製作 `public/icons/icon-512-maskable.png`（512×512），safe zone 範圍內放置桌球圖示，符合 Android adaptive icon 規格，確保 `"purpose": "maskable"` 正確聲明
- [x] 2.3 產出 `public/icons/apple-touch-icon.png`（180×180），供 Apple touch icon meta tag 使用

## 3. 建立 Web App Manifest

- [x] 3.1 實作 Web app manifest provides required fields：新增或覆寫 `public/manifest.webmanifest`，填入 `name`（「桌球課出席記錄」）、`short_name`（「課程記錄」）、`start_url`（與 `vite.config.ts` `base` 一致，目前為 `/course-quota-web/`）、`display`（`standalone`）、`theme_color`（`#1A6FB5`）、`background_color`（`#F7F2ED`）
- [x] 3.2 在 manifest `icons` 陣列中宣告三筆圖示：192 png、512 png、512 maskable png，路徑對應 `public/icons/` 下的實際檔案，確保 Manifest references 192 and 512 icons 且 Maskable icon is declared

## 4. 更新 index.html

- [x] 4.1 實作 index.html links to the manifest 並滿足 Path consistency with deployment base：在 `index.html` `<head>` 補上 `<link rel="manifest" href="{base}manifest.webmanifest">`，`{base}` 須與 `vite.config.ts` `base` 設定一致（目前為 `/course-quota-web/`）
- [x] 4.2 實作 Apple touch icon meta tag is present：在 `index.html` `<head>` 補上 `<link rel="apple-touch-icon" href="{base}icons/apple-touch-icon.png">`，`{base}` 同上，若部署路徑改變須同步更新

## 5. 驗收

- [x] 5.1 確認 Icon files exist in the repository：執行 `git status` 確認 `public/icons/` 下的所有 icon 檔案皆已 tracked（不被 `.gitignore` 排除）
- [x] 5.2 在 Android Chrome 開啟部署網址，使用「新增至主畫面」功能，確認 Home screen icon is recognisable to the primary user：主畫面顯示桌球圖示而非預設英文縮寫或空白圖示
- [x] 5.3 在 Chrome DevTools Application → Manifest 面板驗證 manifest 欄位正確解析，`display` 為 `standalone`，icons 清單含 192、512、512-maskable 三筆
