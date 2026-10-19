# 環境與驗證方法

## 環境

- 本機路徑：`/Users/hylweng/Downloads/Projects/20260919-0000_法巴/Website/gocardifweb`（路徑含中文，`cd` 要加引號）。git 只在這個資料夾執行。
- Node v26（Homebrew）。**Claude 的 Bash 要先 `export PATH="/opt/homebrew/bin:$PATH"`**。CI 用 Node 24。
- 套件：react 19.3、react-router 8.4（HashRouter 從 `react-router` 匯入）、vite 8.3、typescript 7.0、tailwindcss 4.3。沒有 ESLint。**不得安裝其他執行期套件，要先問。**
- 網址帳號 hsinyuweng 寫在三處：`spec/web-spec.md` 第 5 節、驗收第 13 點、`spec/api-contract.md` CORS。日後合併 repo 要改。
- commit 前 `public/config.json` 必須是 static 模式。

## Claude 的驗證方法

- 每次跑 `npm run build`。
- 資料邏輯：scratchpad 寫腳本，用 vite `createServer(...).ssrLoadModule(...)` 載入真實程式（import 用 `$PWD/node_modules/vite/dist/node/index.js`）。
- 畫面：`npx vite preview --port 4173`＋無頭 Chrome `--remote-debugging-port=9333`，Node 內建 WebSocket 呼叫 CDP。寬度用 `Emulation.setDeviceMetricsOverride`（`--window-size` 最小約 500px）。設 localStorage：先到 about:blank 設定再載入。
- 每頁檢查 390px、1440px 無整頁橫向捲動（`scrollWidth`＝畫面寬）。
- 測 api 模式只改 `dist/config.json`，搭配 `npm run mock-api`（port 8787）。
