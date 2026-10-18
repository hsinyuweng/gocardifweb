# gocardifweb 專案進度與決策紀錄（交接文件）

> 給之後的 Claude Code 對話：每次新對話開始，讀完 `CLAUDE.md` 列的必讀文件後，**一定要讀這份**。
> 這裡記錄規格以外、在對話中確認過的所有決定、進度、與規格不同的實作、待辦與未來方向。
> 每完成一個階段或做出新決定，都要更新這份文件（並提醒使用者 commit）。
> 最後更新：2026-10-18（階段 1–5 全部完成並部署；規格外功能「我的待辦」程式完成，待驗證）。

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
- **導覽原則（使用者 2026-10-18 要求，往後所有功能都適用）**：每個能到下一頁或下一步的地方，都要能往回走——畫面上有可點的返回（麵包屑或連結）、瀏覽器「上一頁」有效，而且回到原本的狀態（篩選、選擇保留）。規劃新功能時要在計畫中寫出返回方式。
- 使用者會換對話：重要資訊要寫進這份文件或 CLAUDE.md，不要只留在對話裡。

## 3. 環境注意事項

- Node.js 用 Homebrew 安裝：v26.12.0、npm 11.20.0（2026-10-18）。
- **Claude 的 Bash 環境 PATH 沒有 `/opt/homebrew/bin`**：執行 node/npm 前要先 `export PATH="/opt/homebrew/bin:$PATH"`。使用者自己的終端機正常。
- 家目錄 `/Users/hylweng` 原本誤設為 git repo（0 個 commit、無遠端）；2026-10-18 經使用者同意，Claude 把 `/Users/hylweng/.git` 移到垃圾桶（`~/.Trash/home-dot-git-<時間>`），沒有直接刪除。git 指令仍一律在 `gocardifweb` 內執行。
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
| 規格外 A | 我的待辦 `#/tasks` | ✅ 完成、已 push（8747f7d） |
| 規格外 | 返回路徑修正、我的單位 | ✅ 完成、已 push（f6c540b、0f4f28a） |
| 儀表板 A | 市場總覽首頁、案件總覽移到 `#/cases`、我的追蹤清單 | 🟡 程式完成，待使用者驗證、commit + push；下一步階段 B（feed／市場脈動資料層＋三張卡片） |

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

### 規格外功能 A「我的待辦」（2026-10-18 已確認並實作，待使用者瀏覽器驗證與 commit）
- 新頁面 `#/tasks?owner=<單位>`：跨 9 份報告彙整某負責單位的待解決事項（blockers）與建議下一步（next_steps）。讀 index 後同時讀全部報告；部分讀取失敗時其餘照常顯示並註明。
- 使用者已選：**依商品分組**（每件商品一塊：名稱連到報告頁並帶 `?owner=`、該單位的待解決事項表、建議下一步）；**未選單位或選「全部」時提示先選單位**，顯示各單位件數按鈕；**導覽列「案件總覽」下方新增「我的待辦」**（修改規格第 10.1 節，經使用者同意）。
- 負責單位與報告頁共用 localStorage 記憶；沿用列印；「上游（顏）」與「上游」照原樣分開顯示。
- 確認文字：導覽列／標題／麵包屑「我的待辦」／請選擇負責單位，查看各商品需要處理的事項。／單位按鈕「法遵 85」（件數＝待解決＋下一步，多到少）／摘要「待解決事項 N（**重大** N）· 建議下一步 N · 涉及 N 件商品」（使用者選「重大」，與首頁及 legend.severity 一致）／商品標題「名稱（發行公司）」＋「看報告 →」（帶 `?owner=`）／區內沿用報告頁小標與欄位，某類無項目顯示「無」／此負責單位沒有相關項目。／有 N 份報告無法讀取，以下內容不包含：○○、○○。／列印標題旁「篩選：負責單位＝○○」。
- 排序：商品依重大件數多到少，同數依案件總覽預設順序（產出日期新到舊）；缺 report_id 的清單列略過；完全沒有報告時沿用首頁「目前沒有報告」。
- 檔案：新增 `src/pages/TasksPage.tsx`、`src/components/tasks/`（OwnerPicker、TaskGroupCard）、`src/lib/tasks.ts`；修改 `main.tsx`（路由）、`Sidebar.tsx`（導覽項目）、`zh-TW.ts`（`nav.tasks`、`tasks`）、`viewModel.ts`（`BlockerViewModel.severityKey`、`OwnerCount`／`TaskProductGroup`／`TaskSummary`）、`normalize.ts`（填 severityKey）、README 專案結構。重用報告頁的 `OwnerFilter`、`BlockersTable`、`NextStepsList`（未修改）。
- Claude 驗證：真實資料彙整（法遵 54＋31＝85，與統計一致）；headless Chrome 390／1440px 無整頁橫向捲動。

### 返回路徑修正與「我的單位」（2026-10-18 已確認並實作，與「我的待辦」一起待驗證、commit）
- 返回路徑（依第 2 節導覽原則）：
  1. 首頁搜尋、篩選、排序寫入網址（`q`、`country`、`category`、`rec`（缺漏建議為 `__missing__`）、`sort`、`dir`；預設值不寫；用 replace 不新增紀錄）。進報告頁時以 `location.state.from` 帶上來源網址，麵包屑「案件總覽」回到原狀態，瀏覽器上一頁也恢復。
  2. 從我的待辦進報告頁：麵包屑「我的待辦 / 商品名稱」，回到同一單位（`state.from`）；報告頁切換單位時保留 state。
  3. 我的待辦：點單位按鈕**新增**瀏覽紀錄（上一頁回選單位畫面）；下拉切換用 replace；摘要旁「← 所有單位」連到 `#/tasks?owner=`。
  4. 報告頁 E 區分頁列右側「↑ 回到三面向」，捲回 C 區。
- 「我的單位」（使用者選方案乙；丙「真正的個人待辦」需後端登入，長期項目）：導覽列底部「我的單位：法遵 更改」／未設定時「我的單位：未設定 設定」；按下後變下拉（第一項「未設定」）＋「取消」。選項為全部報告的負責單位（依件數）。
- **D7 調整（使用者確認）**：localStorage（沿用 key `gocardifweb.owner`）改存「我的單位」，**只有導覽列設定會改**；報告頁與我的待辦的下拉只改網址。預設順序：網址 → 我的單位 → 全部。網址 `?owner=`（空值）表示明確選「全部」，不套用我的單位；報告頁選「全部」也寫成 `?owner=`。
- 架構：全部報告改由 `RootLayout` 在需要時讀一次（`src/data/allReports.ts` 的 `loadAllReports`，經 Outlet context 的 `useAllReports()` 給我的待辦，並提供導覽列選項）；`lib/ownerPreference.ts` 改為可訂閱（`useSyncExternalStore`，含跨分頁 storage 事件）；新增 `lib/ownerParam.ts`。
- 修改既有頁面（第 11.1 節例外，使用者同意）：OverviewPage、ReportPage、ReportView、DetailTabs、Sidebar、AppShell、RootLayout、pageChrome、overviewFilter。
- Claude 驗證：headless Chrome 實際點擊五條路線（首頁篩選→報告→返回／麵包屑；待辦選單位→上一頁；所有單位→上一頁；待辦→報告→切換單位→麵包屑；看詳細內容→回到三面向；設定、取消我的單位後兩頁預設）全部符合預期。

### 首頁改為「市場總覽」儀表板（2026-10-18 架構已核准，分 A–D 階段；A 已實作，待使用者驗證與 commit）
- 使用者提供示意圖：四張卡片「新聞監控」「市場脈動」「競品與法規異動」「我的追蹤清單」。完整計畫：`/Users/hylweng/.claude/plans/groovy-petting-wren.md`（Claude 本機檔）。
- 已確認：追蹤清單追蹤「險種＋市場」（存在瀏覽器，點擊連到 `#/cases?category=&country=`）；案件表格移到 `#/cases`；後端資料未到時三張卡片顯示「資料準備中」，示意資料只在本機 mock-api；趨勢小線圖用純 SVG，不裝套件。
- 新路由：`#/` 市場總覽、`#/cases` 案件總覽、`#/feed?category=` 市場動態、`#/market` 市場脈動；導覽列規劃中只留「跨部門審查」（市場動態、市場脈動在 C 階段完成前仍列規劃中）。
- 卡片分工：新聞監控＝feed 的 news、market；競品與法規異動＝product、regulation（避免重複）。
- 資料層：DataSource 新增 `getFeed()`、`getMarketPulse()`（static：`data/feed.json`、`data/market-pulse.json`；api：`/api/v1/feed`、`/api/v1/market-pulse`）；404 → 卡片顯示資料準備中。
- 階段：A 架構＋追蹤清單＋規格文件 → B 資料層＋三張卡片＋示意資料 → C 詳細頁 → D 接後端真實資料。後端需求文件需補：市場脈動格式、feed 的 `country`／`product_category`、更新頻率。
- 這修改規格 D1（首頁型態）、第 10.1、11 節，使用者已同意（已改 `docs/web-spec.md`，D7 也同步改為「我的單位」）。
- **階段 A 確認文字**：導覽列「市場總覽、案件總覽、我的待辦、使用說明」，規劃中「市場動態、市場脈動、跨部門審查」／首頁標題「市場總覽」＋「資料更新於 …」／卡片：新聞監控、市場脈動、競品與法規異動、我的追蹤清單（寬螢幕 2×2 照示意圖；窄螢幕追蹤清單第一）／資料準備中，後端提供後會自動顯示。／追蹤列「險種・國家」＋「N 件商品」，右側「今天更新／昨天更新／N 天前更新」（>30 天顯示「YYYY-MM-DD 更新」），沒有相符「目前沒有相符的案件」／空清單「還沒有追蹤項目。按「＋新增追蹤」選擇險種與市場。」／新增：險種（全部險種）＋市場（全部國家）下拉、加入、取消；兩個都全部不能加入；重複「已在追蹤清單中」／移除「×」（title「移除追蹤」，不確認）／預設空清單／從追蹤清單進案件總覽麵包屑「市場總覽 / 案件總覽」／找不到頁面「回到市場總覽」。
- **階段 A 實作**：`pages/MarketHomePage.tsx`、`components/home/`（HomeCard＋PendingContent、WatchlistCard）、`lib/watchlist.ts`（localStorage key `gocardifweb.watchlist`，可訂閱）、`lib/format.ts`（`todayTaipei`、`daysAgo`、`updatedText`）；`main.tsx` 路由 `index`→市場總覽、`cases`→OverviewPage；Sidebar；NotFound；ReportPage 麵包屑預設 `/cases`。
- 返回鏈：`BreadcrumbItem` 新增 `state`；OverviewPage 導到報告時帶 `fromState`（自己的 location.state），報告頁麵包屑回案件總覽時帶回，所以「市場總覽 → 案件總覽 → 報告 → 案件總覽」仍顯示「市場總覽 / 案件總覽」。OverviewPage 改篩選時保留 state。
- Claude 驗證：build 通過；headless Chrome 測新增（全部＋全部不能加、重複提示）、移除、重新整理保留、追蹤列→案件總覽篩選與麵包屑、報告往返、404 連結、390px 無橫向捲動。

### 架構比較（2026-10-18）
- 使用者貼了一份網站架構摘要（導覽列＋報告頁 A–F），與現有實作一致；用詞維持規格：「負責單位」（非「部門」）、「資料品質」（非「資料品質警示」）。

## 6. 與規格不同或規格未寫、經確認的實作

- `src/components/overview/`：首頁子元件資料夾（規格第 5 節未列）。
- 清單項目缺 `report_id` 時該列仍顯示但不可點擊（`OverviewRow.reportId` 可為 null）。
- 報告清單由 `pages/RootLayout.tsx` 讀一次，經 Outlet context 給首頁與報告頁（導覽列也需要 generated_at）。
- 畫面資料欄位 `moduleCards`（原 `scorecards`），避免驗收第 11 點文字搜尋 `scorecard` 誤判；`KeyPointList` 註解避免出現 `key_points`。
- 負責單位從「我的單位」（localStorage）取得時也同步寫進網址（`replace`，不新增瀏覽紀錄）。2026-10-18 起 localStorage 只存導覽列設定的我的單位（見第 5 節）。
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
- 2026-10-18 改版：依 Summarizer（S1–S9）、市場需求（M1–M4）、發生率暨獲利（A1）、法規適用（R1–R3）、長期（L1）分類，開頭有 18 項追蹤表（優先 P1/P2/P3、狀態下拉）。P1：S1 負責單位固定清單、S2 項目 id 跨版本不變、M3 市場規模單位、R1 重跑 Singlife 法規、R2 findings 負責單位與 id。新增需求：S3 `next_steps.related_blocker_ids`、A1 競品 `metrics`、L1 個人待辦（登入、assignee、status、API）。
- **首頁大改成以圖表為主**：使用者 2026-10-18 決定要做，但**等後端提供未來方向的資料後再改**。屆時會牽涉規格 D1（首頁型態）修改、圖表套件選擇（規格第 4、14 節，需使用者同意安裝）。

### 之後要和使用者確認的事項
- [x] 階段 5 部署驗證結果（2026-10-18：一切正常）。
- [ ] 後端回覆需求文件後：各新功能的計畫與介面文字。
- [ ] 首頁圖表化：D1 是否修改、要哪些圖表、圖表套件選擇。
- [ ] 台灣地圖的實作方式（靜態 SVG vs 套件）。
- [x] 家目錄 git repo 已清除（2026-10-18，移到垃圾桶）。
- [ ] 未來合併 repo 時更新網址三處。
- [ ] 資料公開性：真實內部資料若不能公開，需改有存取控管的架構。
