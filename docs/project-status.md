# gocardifweb 專案進度與決策紀錄（交接文件）

> 給之後的 Claude Code 對話：每次新對話開始，讀完 `CLAUDE.md` 列的必讀文件後，**一定要讀這份**。
> 這裡記錄規格以外、在對話中確認過的所有決定、進度、與規格不同的實作、待辦與未來方向。
> 每完成一個階段或做出新決定，都要更新這份文件（並提醒使用者 commit）。
> 最後更新：2026-10-18（階段 1–5 全部完成並部署；網站已上線、使用者驗證正常）。

---

## 1. 專案概要

- 前端 repo：`https://github.com/hsinyuweng/gocardifweb`（分支 `main`）
- 網站網址（已上線）：`https://hsinyuweng.github.io/gocardifweb/`
  - 2026-10-18 使用者決定用 hsinyuweng 帳號，已改掉規格原本寫的 `lsjle`（`docs/web-spec.md` 第 5 節與驗收第 13 點、`docs/api-contract.md` 的 CORS 網域）。
  - 使用者說「之後可能會和其他 repo 合併，但很久以後」。屆時要再改上述三處；程式內路徑是 `/gocardifweb/`，與帳號無關。
- 本機路徑：`/Users/hylweng/Downloads/Projects/20260919-0000_法巴/Website/gocardifweb`
- 規格：`docs/web-spec.md`（v5），API 約定：`docs/api-contract.md`（v2），範例報告：`docs/examples/summarizer-example-report.json`
- `docs/references/` 內有 base44／manus／figma 的畫面截圖（舊原型參考），不在必讀清單，至今未使用。

## 2. 與使用者合作的方式（補充 CLAUDE.md）

- 使用者是網頁開發新手，有基本程式基礎；一律繁體中文。
- 流程固定：**每個階段先輸出計畫 → 等使用者回覆「確認」→ 才寫程式**（規格第 0 節第 7 條）。規格沒寫清楚的介面文字或行為，列成「需要你確認的介面文字」表格，附建議值，讓使用者一次確認。
- 少量關鍵選擇用 AskUserQuestion 問（建議選項放第一個並標「建議」）。
- 階段完成後：3–5 句說明做了什麼、改了哪些檔案；需要使用者操作的事列成**編號步驟**，寫明**在哪個應用程式（VS Code 終端機）、哪個資料夾（完整路徑＋先給 `cd` 指令）**、輸入什麼、預期看到什麼。
- 使用者驗證後提醒 commit **並 push**（使用者已決定每階段或每次 session 後 commit + push），附建議 commit 訊息與完整指令。
- 指令路徑含中文，`cd` 時要加引號。
- 使用者會換對話：重要資訊要寫進這份文件或 CLAUDE.md，不要只留在對話裡。

## 3. 環境注意事項

- Node.js 用 Homebrew 安裝：v26.12.0、npm 11.20.0（2026-10-18）。
- **Claude 的 Bash 環境 PATH 沒有 `/opt/homebrew/bin`**：執行 node/npm 前要先 `export PATH="/opt/homebrew/bin:$PATH"`。使用者自己的終端機正常。
- **使用者的家目錄 `/Users/hylweng` 本身是一個 git repo**（可能是以前誤用 `git init`）。在 `gocardifweb` 以外的資料夾執行 git 指令會作用在整個家目錄上。所有 git 指令一定要在 `gocardifweb` 內執行。是否清除家目錄的 repo 尚未處理，**未經使用者同意不要動它**。
- 套件版本（package-lock.json 鎖定）：react／react-dom 19.3、react-router 8.4（HashRouter 從 `react-router` 匯入）、vite 8.3、@vitejs/plugin-react 6.1、typescript 7.0、tailwindcss 4.3 + @tailwindcss/vite。**沒有 ESLint**（使用者決定移除）。不得安裝其他執行期套件，需要時先問。
- 驗證資料邏輯的方法（Claude 無法開瀏覽器）：在 scratchpad 寫腳本，用 `vite` 的 `createServer(...).ssrLoadModule('/src/data/normalize.ts')` 載入真實程式碼，對 `public/data/reports/*.json` 跑檢查。畫面與列印效果請使用者在瀏覽器驗證。

## 4. 階段進度（規格第 18 節）

| 階段 | 內容 | 狀態 |
|---|---|---|
| 1 | 專案建立、AppShell、config、資料層、sync、首頁表格 | ✅ 完成、已 push |
| 2 | 報告頁 A–D 區 | ✅ 完成、已 push |
| 3 | 報告頁 E–F 區、小型視覺、列印樣式；新增 8 份報告 | ✅ 完成、已 push |
| 4 | 使用說明頁、mock-api、api 模式與離線備援、RWD | ✅ 完成、已 push（190239a）；RWD 修正併入 538742b |
| 5 | GitHub Actions 部署與 README | ✅ 完成、已 push（538742b）；repo 已公開、Pages 已設定，使用者 2026-10-18 驗證網站「一切正常」 |

## 5. 已確認的決定（依階段）

### 階段 1
- Node 用 Homebrew 安裝；不用 `npm create vite`，手寫設定檔；移除 ESLint。
- 報告頁、使用說明頁在尚未實作時註冊路由並顯示「此頁面將於後續階段完成。」（現已全部實作）。
- `generated_at` 顯示為台北時間到分鐘：`2026-10-11 16:00`。
- 確認的介面文字：載入中…／無法讀取資料，請確認網路連線後重新整理頁面。／找不到報告清單。請先執行 npm run sync 匯入報告。／資料格式錯誤，無法顯示。（下一行小字細節）／伺服器發生錯誤，請稍後再試。／沒有符合條件的案件。／搜尋商品名稱或發行公司、全部國家、全部險種／導覽列底部「資料更新：…」「資料來源：離線資料｜後端連線」／找不到此頁面。＋「回到案件總覽」／建議分布列的「全部」不加件數。
- sync 遇到壞掉的 JSON 或缺 report_id：略過並警告，不中止整批；report_id 含 `/`、`\`、`..` 或為 `index` 也略過；同批 report_id 重複則整批中止、不複製任何檔案。

### 階段 2
- 法規燈號分布條在階段 2 做（C 區用到）；「看詳細內容」連結延到階段 3。
- C 區燈號旁文字與首頁一致：市場需求→需求等級標籤、發生率暨獲利→研究狀態標籤、法規→overall_verdict；下方指標不重複顯示該項。
- 確認文字：產出日期 2026-10-11／審閱日期：市場需求 … · …／判定理由／流程列「✓ 完成」、部門審查灰色附「規劃中」／法規欄分布條不另加標題／未提供（原始值：missing）／負責單位／此負責單位沒有相關項目。／下一步編號用 priority 原值（篩選後保留）／下一步第二行「負責單位：… · 來源面向：…」／疑似輸入錯誤／收合區小標題：資料衝突、證據不一致、缺漏欄位、備註／資料品質全空顯示「無」／網址或記憶的負責單位不在選項內時視為「全部」、網址不變／列印／另存 PDF。

### 階段 3
- 列印時若已選負責單位：印篩選後內容，標題旁印「篩選：負責單位＝○○」；選「全部」不印註明。
- 市場規模區間條刻度從 0 到高估；低到高塗色、中估標點；任一值 null 改純文字。
- 頁尾加「免責聲明」標題（使用者確認要加）。
- 確認文字：摘要／估算方法、目標人口、市場規模估計、信心等級／低估、中估、高估／關鍵發現／來源：…（null 顯示「來源：—」）／定價提示：項目、方向、來源數／findings 欄名：編號、項目、燈號、法規依據、建議措施、負責單位／燈號篩選顯示件數（「全部 19」「待補 7」）／此燈號沒有項目。／篩選：負責單位＝○○／disclaimer null 顯示「—」。
- 使用者確認報告資料**可以公開**（已 commit 9 份報告）。

### 階段 4
- 確認文字：設定錯誤：config.json 的 dataSource 為 api，但 apiBaseUrl 是空的。／後端回 400：「請求格式錯誤，無法取得資料。」＋後端 message，**不**觸發離線備援／選單按鈕 aria-label：開啟選單、關閉選單／使用說明頁標題「使用說明」／使用說明核心問題表欄名「面向／核心問題」，面向名稱用首頁欄名（市場需求、發生率暨獲利、法規適用）／mock-api 未定義路徑回 404 `NOT_FOUND`。

### 階段 5（已確認並實作）
- 使用者決定：GitHub repo 改為**公開**（免費帳號 Pages 需公開 repo；docs/、project-status.md 也會公開）；GitHub Actions 用 **Node 24 LTS**。
- 實作：`.github/workflows/deploy.yml`（push main 與手動觸發 → npm ci → npm run build → 發布 dist/）、繁中 README（網址、本機開發、首次部署設定、新增報告、切換資料來源、mock-api、專案結構、未來規劃）、`vite.config.ts` 註解 lsjle → hsinyuweng。

### 架構比較（2026-10-18）
- 使用者貼了一份網站架構摘要（導覽列＋報告頁 A–F），與現有實作一致；用詞維持規格：「負責單位」（非「部門」）、「資料品質」（非「資料品質警示」）。

## 6. 與規格不同或規格未寫、經確認的實作

- `src/components/overview/`：首頁子元件資料夾（規格第 5 節未列）。
- 清單項目缺 `report_id` 時該列仍顯示但不可點擊（`OverviewRow.reportId` 可為 null）。
- 報告清單由 `pages/RootLayout.tsx` 讀一次，經 Outlet context 給首頁與報告頁（導覽列也需要 generated_at）。
- 畫面資料欄位 `moduleCards`（原 `scorecards`），避免驗收第 11 點文字搜尋 `scorecard` 誤判；`KeyPointList` 註解避免出現 `key_points`。
- 負責單位從 localStorage 取得時也同步寫進網址（`replace`，不新增瀏覽紀錄）。
- 法規燈號篩選選項：legend.light 各值；legend 缺漏時改用 findings 中出現的值。
- `DataSourceError` 新增 `status`（HTTP 狀態碼）與第五種 kind `config_error`（規格第 6.1 節只列四種；階段 4 計畫中說明並經確認）。4xx（非 404）歸為 `server` 但帶 status，**只有 network 與 5xx 觸發離線備援**。
- 離線狀態用 `src/data/connectionStatus.ts` 的訂閱，RootLayout 以 `useSyncExternalStore` 讀取；後端成功讀取時清除離線標記。
- RWD 斷點用 Tailwind `lg`（≥1024px 顯示側邊導覽）；C 區三欄 `lg` 以下改單欄，列印時強制三欄（`print:grid-cols-3`）；D 區兩欄在 `xl`（≥1280px）。
- **RWD 修正（2026-10-18）**：使用者回報窄螢幕沒有 RWD。原因：報告頁 D 區與 C 區的 grid 沒有指定欄寬，隱含欄寬被表格 `min-w-[720px]` 撐開，造成整頁橫向捲動、表格框內捲動失效。修正：`ReportView` D 區加 `grid-cols-1`、兩個子欄加 `min-w-0`；`ScorecardRow` 加 `grid-cols-1`；首頁 `RecommendationBar` 按鈕加 `shrink-0 whitespace-nowrap`（窄螢幕時整列橫向捲動、不擠扁）。Claude 用 headless Chrome 裝置模擬驗證 390／768／1440px：三頁 `scrollWidth` 等於畫面寬度。
- Claude 的截圖驗證方法：`npx vite preview --port 4173` 後，以 Chrome `--remote-debugging-port` ＋ Node 內建 WebSocket 呼叫 `Emulation.setDeviceMetricsOverride`（`--window-size` 在無頭模式下最小寬度約 500px，iframe 內資料不會載入，皆不可靠）。
- 規格文件本身的修改：只有網址 lsjle → hsinyuweng（三處）。

## 7. 架構速覽

```
public/config.json ─ loadConfig ─▶ ConfigContext
pages/RootLayout ─ getDataSource(config) ─▶ Static / Api / Fallback(Api→Static) / ConfigError
                 ─ listReports → normalizeAppMeta → AppShell(Sidebar, TopBar)
pages/OverviewPage ─ normalizeReportIndex → components/overview/*
pages/ReportPage  ─ getReport → normalizeReport → components/report/ReportView
pages/GuidePage   ─ 固定內容（i18n）
```
- 原始 JSON 欄位只在 `src/data/normalize.ts`（及 `validate.ts` 檢查結構）讀取；元件只收 ViewModel（`src/types/viewModel.ts`）。
- 所有介面文字在 `src/i18n/zh-TW.ts`。
- 指令：`npm run dev`、`npm run sync`（`-- --from <路徑>`）、`npm run mock-api`（:8787）、`npm run build`。

## 8. 資料現況

- `public/data/reports/` 有 9 份報告：fwd-jpy-single-premium-va（範例）、chakin、kyobo-modu-jikim-whole-life、oriance、policyme-guaranteed-issue-life-insurance、secure-horizon-iul、singlife-heritage-reserve、surely-life-certua-uk、wealth-term-insurance。
- `incoming/`（gitignore）另有 `batch_summary.json`、`fwd-jpy-single-premium-va_summary_report.json`：是多商品批次摘要格式（`products` 陣列＋`cross_cutting`），sync 正確略過；未來首頁圖表可能用到 `cross_cutting.common_missing_inputs`，需後端定版。
- 資料問題（已寫進給後端的文件）：
  - surely-life-certua-uk 市場規模 172,800～259,200 億元，疑似單位填錯；前端照原樣顯示。
  - secure-horizon、wealth-term 的 `reported_unit` 是「億元」，其他是「新台幣元」；跨商品比較前需統一。
  - singlife 的法規模組 `not_run`。
  - 負責單位有「上游（顏）」這類非單位名稱。
- **競品比較：現有 JSON 都沒有競品資料**（只有 `source_ref` 指向 `market_demand:competitor_comparison`），需後端在 summarizer 報告加入。

## 9. 階段 5 部署驗證步驟（✅ 2026-10-18 使用者已全部完成，留作日後重新部署參考）

（階段 4 已驗證並 push；RWD 修正與階段 5 一起 commit。）
1. 瀏覽器檢查 RWD 修正：`npm run dev`，Chrome 開發者工具手機模式 768／390px，報告頁「待解決事項」只在框內橫向捲動、整頁不左右晃；首頁建議按鈕不被擠扁。
2. GitHub repo → Settings → General → 最下方 Danger Zone → Change visibility → Public。
3. Settings → Pages → Build and deployment → Source 選「GitHub Actions」。
4. 在 `gocardifweb` 資料夾 `git status` 確認 `public/config.json` 不在變更清單，然後 `git add -A`、`git commit -m "feat: 階段5 GitHub Actions 部署與 README；修正窄螢幕 RWD"`、`git push`。
5. repo 的 Actions 分頁：「Deploy to GitHub Pages」build、deploy 兩個 job 都是綠色勾勾。
6. 驗收第 13 點：開 `https://hsinyuweng.github.io/gocardifweb/`，點進一份報告後按重新整理不會 404；開發者工具 Console 沒有紅色錯誤。
- 技術註記：CI 用 Node 24；react-router 8.4 要求 Node ≥ 22.22，vite 8 要求 ^20.19 或 ≥22.12。Claude 已在 scratchpad 以同一份 package-lock 跑 `npm ci` 成功、`npm run build` 通過。

## 10. 待辦與未來方向

### 接下來
1. ✅ 階段 5 部署驗證（2026-10-18 完成）。規格第 18 節五個階段全部完成。
2. （已完成）階段 5：`.github/workflows/deploy.yml`（push main → `npm ci`、`npm run build`、發布 `dist/`）＋ README（Settings → Pages → Source 選 GitHub Actions、如何新增報告、如何切換資料來源、如何用 mock-api 測試、未來規劃）。部署網址 `https://hsinyuweng.github.io/gocardifweb/`。先輸出計畫等確認。

### 未來方向（使用者 2026-10-18 提出；階段 5 之後）
- 使用者的目標：要有「追蹤市場資訊」「實時追蹤」的感覺、呈現多種資訊、隨時持續更新、**每天都要用的必要性**；每日／每週市場資訊與新聞；抓產品目標客群與地區分布；**台灣地圖視覺化**；**競品比較**（使用者說之後會加入）。
- 已提出的可行性分析與建議（使用者尚未逐項確認）：
  - 導覽列「規劃中」四項正好對應：海外商品雷達（新商品動態）、市場趨勢報告（週報）、法規變化追蹤（法規動態）、跨部門審查（協作）。依第 11.1 節只新增路由與頁面。
  - 更新機制兩階段：先「每日快照」（GitHub Actions 定時抓後端 JSON、commit、重建網站），再 api 即時模式。
  - 「實時感」靠介面：今日新增、新標記、最後更新時間、自上次查看後的變化（需報告歷史版本）。
  - 每天必用：「我的待辦」跨商品依負責單位、我追蹤的商品、燈號變化提示。
  - 台灣地圖：建議把內政部縣市界線事先轉成靜態 SVG（22 縣市），CSS 填色，不裝地圖套件；填色用比例不用人數；旁邊配排序長條；用海軍藍深淺，不用燈號色（D4）。需要互動時再考慮 d3-geo（要先問）。
  - 資料層擴充：DataSource 加 listFeed／getCompetitors／getRegions 等；normalize 依主題拆資料夾；api-contract 新增端點；每種新資料先定 JSON 範例檔。
  - 風險：公開網站、新聞著作權（只存標題＋連結＋摘要）、AI 摘要需附原文連結、歷史版本儲存。
  - 建議順序：階段 4–5 → 競品比較 → 法規變化／市場動態（每日快照）→ 地區分布與台灣地圖 → api 即時、歷史比較、追蹤清單。
- **給後端組員的需求文件**（Claude Doc，使用者擁有）：「gocardifweb 未來方向：後端資料需求」 https://claude.ai/code/artifact/91c6050f-8416-40cc-b0f1-76e3f79b7c62 。內容：總覽表、共通原則、競品比較 JSON（建議 `sections.market_demand.competitor_comparison`）、`feed.json`（category: regulation/market/product/news）與週報、`sections.market_demand.target_segment`（22 縣市、內政部行政區代碼）、報告歷史（`version_id`、`history/<report_id>.json`）、首頁圖表需要的彙總資料、兩階段交付架構圖與 API 端點、待後端回覆問題。文件預設私人，要使用者自己分享給組員。
- **首頁大改成以圖表為主**：使用者 2026-10-18 決定要做，但**等後端提供未來方向的資料後再改**。屆時會牽涉規格 D1（首頁型態）修改、圖表套件選擇（規格第 4、14 節，需使用者同意安裝）。

### 之後要和使用者確認的事項
- [x] 階段 5 部署驗證結果（2026-10-18：一切正常）。
- [ ] 後端回覆需求文件後：各新功能的計畫與介面文字。
- [ ] 首頁圖表化：D1 是否修改、要哪些圖表、圖表套件選擇。
- [ ] 台灣地圖的實作方式（靜態 SVG vs 套件）。
- [ ] 家目錄 `/Users/hylweng` 的 git repo 要不要清除（只提醒，不要自行處理）。
- [ ] 未來合併 repo 時更新網址三處。
- [ ] 資料公開性：真實內部資料若不能公開，需改有存取控管的架構。
