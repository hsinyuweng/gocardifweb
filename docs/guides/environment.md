# 環境注意事項與驗證方法

> 執行指令、裝套件、部署、或要測試時讀。

## 專案位置

- 前端 repo：`https://github.com/hsinyuweng/gocardifweb`（分支 `main`）
- 網站網址（已上線）：`https://hsinyuweng.github.io/gocardifweb/`
  - 2026-10-18 使用者決定用 hsinyuweng 帳號，已改掉規格原本寫的 `lsjle`（`docs/spec/web-spec.md` 第 5 節與驗收第 13 點、`docs/spec/api-contract.md` 的 CORS 網域）。
  - 使用者說「之後可能會和其他 repo 合併，但很久以後」。屆時要再改上述三處；程式內路徑是 `/gocardifweb/`，與帳號無關。
- 本機路徑：`/Users/hylweng/Downloads/Projects/20260919-0000_法巴/Website/gocardifweb`
- `docs/references/` 內有 base44／manus／figma 的畫面截圖（舊原型參考），不在必讀清單，至今未使用。

## 環境

- Node.js 用 Homebrew 安裝：v26.12.0、npm 11.20.0（2026-10-18）。
- **Claude 的 Bash 環境 PATH 沒有 `/opt/homebrew/bin`**：執行 node/npm 前要先 `export PATH="/opt/homebrew/bin:$PATH"`。使用者自己的終端機正常。
- 家目錄 `/Users/hylweng` 原本誤設為 git repo（0 個 commit、無遠端）；2026-10-18 經使用者同意，Claude 把 `/Users/hylweng/.git` 移到垃圾桶（`~/.Trash/home-dot-git-<時間>`），沒有直接刪除。git 指令仍一律在 `gocardifweb` 內執行。
- 套件版本（package-lock.json 鎖定）：react／react-dom 19.3、react-router 8.4（HashRouter 從 `react-router` 匯入）、vite 8.3、@vitejs/plugin-react 6.1、typescript 7.0、tailwindcss 4.3 + @tailwindcss/vite。**沒有 ESLint**（使用者決定移除）。不得安裝其他執行期套件，需要時先問。
- 驗證資料邏輯的方法（Claude 無法開瀏覽器）：在 scratchpad 寫腳本，用 `vite` 的 `createServer(...).ssrLoadModule('/src/data/normalize.ts')` 載入真實程式碼，對 `public/data/reports/*.json` 跑檢查。畫面與列印效果請使用者在瀏覽器驗證。

## Claude 的驗證方法

- `npm run build`（tsc＋vite）每次都要跑。
- 資料邏輯：在 scratchpad 寫腳本，用 vite `createServer(...).ssrLoadModule(...)` 載入真實程式碼。import vite 要用絕對路徑 `$PWD/node_modules/vite/dist/node/index.js`。
- 畫面：`npx vite preview --port 4173` 後，用無頭 Chrome `--remote-debugging-port=9333`，再用 Node 內建 WebSocket 呼叫 CDP。寬度要用 `Emulation.setDeviceMetricsOverride` 設定，因為 `--window-size` 在無頭模式下最小只能到約 500px。要設 localStorage 時，先導到 about:blank，設定後再重新載入。
- 測試 api 模式時只改 `dist/config.json`，不改 `public/config.json`。要搭配 `npm run mock-api`（port 8787）。
- 每頁都要檢查 390px 與 1440px 寬時沒有整頁左右捲動（`scrollWidth` 等於畫面寬度）。
- commit 前 `public/config.json` 必須是 static 模式。
