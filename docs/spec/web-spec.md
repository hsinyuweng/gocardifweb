# gocardifweb：商品引入評估平台前端開發規格（給 Claude Code）

> 版本：v5。本文件取代所有舊版。
> 第 2 節「設計決策」為目前預設值，由專案負責人決定；若與其他段落衝突，以第 2 節為準。

---

## 0. 嚴格規則（優先於本文件其他所有內容）

1. 本文件若出現「【待填」或「【待確認」字樣，先停止並詢問，不得自行假設。
2. 報告資料格式以 `docs/examples/summarizer-example-report.json` 與第 8 節為準；後端 API 格式以 `docs/spec/api-contract.md` 為準。不得自行發明欄位、檔名、路徑、判定用語、顏色、數字或文案。本文件未提供的介面文字，先列出來詢問。
3. 本階段只實作「讀取並呈現報告」。不得實作資料輸入表單、分析任務送出、審查流程、登入或任何寫入後端的功能。
4. 前端程式碼與設定檔中不得出現 API 金鑰、token 或密碼。不得呼叫 `docs/spec/api-contract.md` 以外的端點。
5. 不得修改報告 JSON 的內容。
6. 只能在本前端專案資料夾內新增或修改檔案。
7. 開始實作前先輸出實作計畫（檔案結構、元件拆分、資料流），等我回覆「確認」後才寫程式。
8. 每完成第 18 節的一個階段，用繁體中文簡短說明：做了什麼、如何啟動與驗證、哪些檔案改了。等我確認後才進行下一階段，並提醒我 commit。
9. 欄位為 null 時顯示「—」；陣列為空時顯示「無」；資料讀取失敗或格式錯誤時顯示錯誤說明。任何情況都不得白畫面或自行補值。

---

## 1. 目的、使用者與設計原則

### 1.1 目的與使用者
- 使用者：保險公司商品開發、法遵、精算人員，每天使用，非技術背景。
- 目的：快速掌握「哪些國外商品值得引入台灣、卡在哪裡、下一步誰要做什麼」。
- 本階段呈現 summarizer 統整三個分析模組後輸出的報告 JSON。

### 1.2 設計原則（所有畫面都要符合）
1. **結論先行**：打開報告頁，不捲動就能看到建議結論、一句話理由、三個面向的燈號。
2. **燈號必有理由**：任何顏色標示旁都有文字標籤，並能往下找到依據。
3. **待辦導向**：使用者能立即看到「哪些事卡住、由哪個單位處理」。
4. **高密度、不擁擠**：列表用表格，不用大卡片；不用「一張大卡片只放一個數字」的設計；版面寬度充分利用。
5. **誠實呈現缺口**：資料不足不等於負面結論；缺什麼資料要明確列出。
6. **只放能用的功能**：未實作的功能只能以「規劃中」標示，且不可點擊；不得做出看似可用但無實際作用的按鈕。
7. **用語一致**：介面只用繁體中文；同一概念全站同一個詞。

---

## 2. 設計決策（目前預設值）

| 編號 | 項目 | 採用 |
|---|---|---|
| D1 | 首頁型態 | 市場總覽四區塊：新聞與法規監控、市場脈動、追蹤清單、競品研究（2026-10-20 經使用者同意修改；原案件總覽表格改為競品研究頁 `#/research`） |
| D2 | 報告頁版面 | 頂部決策摘要＋三面向計分列，下方雙欄（主欄：待解決事項、下一步；側欄：資料品質、資料缺口），最下方為各面向詳細分頁 |
| D3 | 導覽 | 左側固定導覽列；「規劃中」功能以灰色不可點擊項目顯示 |
| D4 | 色彩 | 主色為深海軍藍 `#1E3A5F` 與中性灰；綠、黃、橘、紅只用於燈號，不作為裝飾或按鈕色。多系列圖表用藍紫系 4 色（`lib/chartPalette.ts`，2026-10-20 經使用者同意） |
| D5 | 資訊密度 | 緊湊：表格內文 14px、列高約 40px、區塊間距 16–24px |
| D6 | 介面語言 | 繁體中文單語（文字集中於 i18n 檔，保留未來加英文的可能） |
| D7 | 部門視角 | 報告頁待解決事項與下一步可依負責單位篩選；篩選值寫入網址可分享；記住使用者在導覽列設定的「我的單位」作為預設（2026-10-18 經使用者同意，原為記住上次選擇） |
| D8 | 圖表 | 本階段只做兩個純 CSS 小型視覺（法規燈號分布條、市場規模區間條），不安裝圖表套件 |
| D9 | 列印 | 報告頁提供「列印／另存 PDF」，使用瀏覽器列印功能與專用列印樣式 |
| D10 | legend 標籤中的全形括號內容 | 原文顯示，不在前端修改 |
| D11 | 資料品質 | 「疑似輸入錯誤」一律醒目顯示；其他資料品質項目預設收合 |
| D12 | 使用說明頁 | 提供，內容依第 11.4 節 |

---

## 3. 架構與資料流

### 3.1 前端分層

```
頁面（pages/）           讀網址參數、呼叫資料層、處理載入中與錯誤
   │
資料層（data/）          依設定決定資料來源 → 驗證格式 → 轉換為畫面用資料
   ├ StaticDataSource    讀網站內 public/data/（本階段使用）
   ├ ApiDataSource       讀後端 API（已實作讀取，預設不啟用）
   ├ validate.ts         檢查最基本結構
   └ normalize.ts        把報告 JSON 轉成 ReportViewModel（唯一讀取原始欄位的地方）
   │
呈現元件（components/）  只接收 ViewModel 作為 props，不取資料、不讀原始 JSON 欄位
```

- **原始 JSON 欄位只允許在 `normalize.ts` 中讀取。** 報告格式日後微調時，只需修改 normalize 與型別，元件不需改動。
- normalize 必須容忍未知的新欄位（忽略即可），以及缺少的欄位（轉為 null 或空陣列）。

### 3.2 本階段資料流（static 模式）
1. 後端組員交付 summarizer 報告 JSON。
2. 放入 `incoming/`，執行 `npm run sync`。
3. sync 腳本複製報告到 `public/data/reports/`，並產生 `public/data/reports/index.json`。
4. commit 並 push，GitHub Actions 自動部署。

### 3.3 未來資料流（api 模式）
```
瀏覽器（GitHub Pages）──HTTPS──▶ Cloudflare tunnel ──▶ Controller（REST API）──▶ Hermes／PostgreSQL
```
端點定義見 `docs/spec/api-contract.md`。

---

## 4. 技術選型

| 項目 | 選擇 |
|---|---|
| 渲染方式 | 前端渲染（CSR），純靜態網站 |
| 框架 | React + TypeScript，以 Vite 建置 |
| 樣式 | Tailwind CSS |
| 路由 | React Router，使用 HashRouter |
| 套件管理 | npm，必須提交 package-lock.json |
| 部署 | GitHub Actions 發布至 GitHub Pages |
| Vite base 路徑 | `/gocardifweb/` |

- 開始前先執行 `node -v`。若版本低於當下 Vite 穩定版的最低要求，停止並告訴我如何升級。
- 套件安裝當下最新穩定版，由 package-lock.json 鎖定。除上表外不得安裝其他執行期套件（含圖示、圖表、UI 元件庫）；若認為必要，先詢問。圖示一律用內嵌 SVG 或文字。
- 程式碼註解：繁體中文。
- 字型：系統字型堆疊 `"PingFang TC", "Noto Sans TC", "Microsoft JhengHei", system-ui, sans-serif`，不載入外部字型。
- 介面固定文字集中在 `src/i18n/zh-TW.ts`。來自 JSON 的文字不放入此檔。
- RWD：桌機（1280px 以上）為主要情境；1024px 以下側邊導覽收合為選單按鈕、雙欄改單欄、表格可橫向捲動。

---

## 5. 專案結構

- 前端專案為獨立 repo `gocardifweb`（`https://github.com/hsinyuweng/gocardifweb`），對應 `https://hsinyuweng.github.io/gocardifweb/`。

```
gocardifweb/
├── CLAUDE.md
├── .github/workflows/deploy.yml
├── docs/                            # 結構與閱讀順序見 docs/README.md（2026-10-20 經使用者要求整理）
│   ├── README.md                    # 入口：目前狀態、改動前要讀哪些檔、改動後要更新哪些檔
│   ├── spec/web-spec.md、spec/api-contract.md
│   └── examples/summarizer-example-report.json
├── incoming/                        # 待匯入報告（加入 .gitignore）
├── public/
│   ├── config.json
│   └── data/reports/
│       ├── index.json
│       └── <report_id>.json
├── scripts/
│   ├── sync-reports.mjs
│   └── mock-api.mjs
├── src/
│   ├── config/
│   ├── data/
│   │   ├── DataSource.ts
│   │   ├── StaticDataSource.ts
│   │   ├── ApiDataSource.ts
│   │   ├── validate.ts
│   │   ├── normalize.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── report.ts                # 原始報告 JSON 型別（第 8 節）
│   │   ├── reportIndex.ts           # 報告清單型別
│   │   └── viewModel.ts             # 畫面用資料型別
│   ├── lib/                         # 數字格式、國家代碼、顏色對應等工具
│   ├── i18n/zh-TW.ts
│   ├── components/
│   │   ├── layout/                  # AppShell、Sidebar、TopBar
│   │   ├── common/                  # 燈號標籤、表格、空狀態、錯誤訊息
│   │   ├── charts/                  # D8 的 CSS 小視覺；未來圖表也放這裡
│   │   └── report/                  # ReportView 及其子元件
│   └── pages/
│       ├── OverviewPage.tsx         # 競品研究（全部報告）
│       ├── ReportPage.tsx           # 報告頁
│       └── GuidePage.tsx            # 使用說明
├── README.md
└── package.json
```

---

## 6. 資料層

### 6.1 介面
```ts
interface DataSource {
  listReports(): Promise<ReportIndex>;
  getReport(reportId: string): Promise<Report>;
}
```
- 頁面透過 `src/data/index.ts` 取得資料，元件與頁面中不得直接呼叫 fetch。
- 讀取失敗時拋出 `DataSourceError`，含 `kind`：`network`、`not_found`、`invalid_format`、`server`。

### 6.2 路徑對應
| 方法 | static 模式 | api 模式 |
|---|---|---|
| listReports | `./data/reports/index.json` | `GET {apiBaseUrl}/api/v1/reports` |
| getReport | `./data/reports/<report_id>.json` | `GET {apiBaseUrl}/api/v1/reports/<report_id>` |

### 6.3 執行期設定 `public/config.json`
```json
{
  "dataSource": "static",
  "apiBaseUrl": "",
  "fallbackToStatic": true,
  "showRoadmapNav": true
}
```
- 啟動時讀取；讀取失敗時使用上方預設值。不得包含任何金鑰。
- `dataSource` 為 `api` 但 `apiBaseUrl` 為空時，顯示設定錯誤說明。
- `fallbackToStatic`：api 模式發生 `network` 或 `server` 錯誤時改讀靜態檔，並在頂部列顯示「目前無法連線後端，顯示的是離線資料」。
- `showRoadmapNav`：是否在導覽列顯示「規劃中」項目（第 10.1 節）。

### 6.4 validate.ts
- 必要條件：物件、有 `report_meta` 與 `headline` 兩個物件欄位、`report_meta.report_id` 為字串；否則拋出 `invalid_format`。
- `schema_version` 不以 `1.` 開頭時不拋錯，附帶版本不符旗標。
- 清單必須有 `reports` 陣列。

### 6.5 normalize.ts
- 輸入原始報告，輸出 `ReportViewModel`。所有第 9 節的顯示規則（標籤查詢、顏色、數字格式、國家代碼、排序）都在此完成或由此呼叫 `lib/` 的工具函式。
- ViewModel 中所有可能缺漏的值型別必須允許 null。

### 6.6 mock-api.mjs
- Node.js 內建模組，`npm run mock-api` 監聽 `http://localhost:8787`，只實作 `docs/spec/api-contract.md` 第 2 節兩個端點，資料讀自 `public/data/reports/`，回應帶 `Access-Control-Allow-Origin: *`。

---

## 7. sync 腳本

- `scripts/sync-reports.mjs`，Node.js 內建模組。執行 `npm run sync`（預設讀 `incoming/`）或 `npm run sync -- --from <路徑>`。
- 規則：
  1. 讀取所有 `.json`。
  2. `report_meta.schema_version` 不以 `1.` 開頭者略過並警告。
  3. 以 `report_meta.report_id` 為檔名複製到 `public/data/reports/`，覆蓋同名檔。
  4. 同批次 report_id 重複時停止並印出檔名。
  5. 掃描 `public/data/reports/` 全部報告（不含 index.json），重新產生 `index.json`，格式見 `docs/spec/api-contract.md` 第 2.1 節。缺少的欄位填 null，計數缺少時填 0。

---

## 8. 報告 JSON schema（schema_version 1.x）

以 `docs/examples/summarizer-example-report.json` 為準，所有欄位都可能為 null。此格式日後可能微調。

- `report_meta`：`schema_version`、`generated_date`、`report_id`；`source_files.<模組鍵>.status`、`.review_date`（`file` 不顯示）
- `product_snapshot`：`name`、`issuer`、`country`、`category`、`currency`、`premium_mode`、`mechanism_summary`
- `headline`：`recommendation`、`label`、`signal_color`、`one_line_summary`、`reasons`（`matched_rule` 不顯示）
- `scorecard`
  - `market_demand`：`status`、`level`、`label`、`confidence`、`signal`
  - `actuarial`：`status`、`research_status`、`comparability`、`pricing_flag_count`、`signal`
  - `regulatory`：`status`、`overall_verdict`、`counts`（red、yellow、green、pending、not_applicable）、`signal`
- `sections`
  - `market_demand`：`summary`；`market_sizing`（`methodology`、`target_population`、`estimate_low`、`estimate_mid`、`estimate_high`、`reported_unit`、`confidence`）；`key_points`；`data_gaps`（`handoffs`、`tag_update_suggestion` 不顯示）
  - `actuarial`：`summary`；`key_points`；`pricing_flags`（`topic`、`direction`、`source_count`）；`evidence_gaps`
  - `regulatory`：`summary`；`findings`（`item_id`、`title`、`light`、`suspected_red`、`law`、`remedy`、`owner`）；`key_laws`
  - key_points：`id`、`text`、`evidence_scheme`、`evidence_level`、`source`
  - 所有 `source_ref` 不顯示
- `blockers`：`id`、`module`、`title`、`severity`、`owner`、`action`
- `next_steps`：`id`、`priority`、`action`、`owner`、`source_module`
- `data_quality`：`conflicts`、`suspected_input_errors`、`evidence_mismatch`、`missing_fields`、`notes`
- `legend`：`recommendation`、`severity`、`light`、`module`、`demand_level`
- `disclaimer`

模組鍵固定為 `market_demand`、`actuarial`、`regulatory`，顯示順序亦同。

---

## 9. 顯示規則

### 9.1 標籤
- `legendLabel(group, key)`：回傳 `legend[group][key].label`，查不到時回傳 key 原文。模組名稱用 `legendLabel("module", 模組鍵)`，原文顯示（D10）。
- `research_status` 標籤：先查 `legend.research_status`；查不到時使用下表；仍查不到則顯示原值。

| 值 | 標籤 |
|---|---|
| sufficient_evidence | 證據充分 |
| partial_evidence | 部分證據 |
| insufficient_evidence | 證據不足 |

- 各模組的核心問題（固定文字，放 i18n）：

| 模組鍵 | 核心問題 |
|---|---|
| market_demand | 產品是否有需求 |
| actuarial | 產品是否能獲利 |
| regulatory | 產品是否能引入 |

### 9.2 顏色
| color 名稱 | Tailwind 色系 |
|---|---|
| green | emerald |
| yellow | amber |
| orange | orange |
| red | red |
| gray | slate |
- 未列出的名稱當作 gray。`headline.signal_color`、`scorecard.*.signal` 直接是 color 名稱；`findings[].light` 與 `blockers[].severity` 先查 legend 取得 color。
- 燈號標籤一律「色點＋文字」，不得只有顏色。

### 9.3 數字格式
- `target_population`：千分位加「人」。
- `estimate_*`：`reported_unit` 為「新台幣元」時除以 100,000,000、四捨五入至整數，加千分位與「億元」；其他單位顯示千分位原數字與 reported_unit 原文。

### 9.4 證據等級
- `evidence_level` 不為 null 時顯示小標籤「證據等級 A」；null 時不顯示。不同 `evidence_scheme` 不得一起排序或比較；`evidence_scheme` 不顯示。

### 9.5 負責單位
- owner 以全形斜線「／」拆分為多個單位；null 歸入「未指定」。

### 9.6 國家代碼
- JP＝日本、US＝美國、GB＝英國、FR＝法國、SG＝新加坡、HK＝香港、KR＝韓國、CN＝中國；其他顯示原代碼。

### 9.7 schema 版本
- 版本不符時，頂部列顯示黃色提示「報告格式版本不符，部分內容可能無法正確顯示」，其餘照常。

---

## 10. 版面框架（所有頁面共用）

### 10.1 左側導覽列（寬 232px，深海軍藍底）
- 頂部：文字標誌「Cardif 商品引入評估」（不使用任何公司 Logo 圖檔）。
- 可用項目：「市場總覽」（`#/`）、「新聞與法規監控」（`#/news`）、「市場脈動」（`#/market`）、「追蹤清單」（`#/watchlist`）、「競品研究」（`#/research`）、「我的待辦」（`#/tasks`）、「使用說明」（`#/guide`）（2026-10-20 經使用者同意修改）。
- `showRoadmapNav` 為 true 時，另顯示「規劃中」分組，含：跨部門審查。每項為灰色、不可點擊、右側附「規劃中」小標籤，滑鼠移上不改變游標為手指。
- 底部：我的單位（設定／更改）、資料更新時間（index.json 的 `generated_at`）與目前資料來源（「離線資料」或「後端連線」）。

### 10.2 頂部列（高 56px，白底，下方細分隔線）
- 左：頁面麵包屑（例：競品研究 / FWD円建一時払変額年金）。
- 右：僅在需要時顯示狀態提示（離線資料、版本不符）；報告頁另有「加入追蹤清單」（2026-10-20 經使用者同意：頂部列固定，捲到哪裡都按得到）。不放通知、角色切換或全域搜尋。

### 10.3 主內容
- 左右內距 24px，不設最大寬度上限至 1600px；超過 1600px 置中。

---

## 11. 頁面

### 11.1 路由
| 路徑 | 頁面 |
|---|---|
| `#/` | 市場總覽（儀表板） |
| `#/news` | 新聞與法規監控（可帶 `?tab=<領域>&affects=1`，第 11.6 節） |
| `#/watchlist` | 追蹤清單：候選商品依綜合分數排序（第 11.5 節） |
| `#/research` | 競品研究：全部報告（篩選與排序寫入網址；舊網址 `#/cases` 轉址至此） |
| `#/report/:reportId` | 報告頁（可帶 `?owner=<單位>`） |
| `#/tasks` | 我的待辦（可帶 `?owner=<單位>`） |
| `#/guide` | 使用說明 |

規劃中：`#/market`（見 `docs/backlog/roadmap.md`）。每個能進入下一頁或下一步的地方，都要能返回原狀態（麵包屑、瀏覽器上一頁）。

新增頁面時以新增路由與頁面檔為主；修改既有頁面須經使用者同意。

### 11.2 競品研究（`#/research`，原案件總覽）
1. **標題列**：標題「競品研究」；右側小字「共 N 件 · 資料更新於 <generated_at>」。
2. **建議分布列**（單列、高度不超過 48px）：最前面是可切換的「未審閱 N」（網址 `unread=1`，可與建議篩選並用；未審閱＝本瀏覽器未打開過該報告，或報告產出日期已更新），接著「全部」，再以小型可點擊標籤顯示每種 `recommendation` 的件數（標籤文字用清單中的 `label`，色點用 `signal_color`），依件數多到少排列。點擊即篩選表格，再點一次取消。
3. **工具列**：搜尋框（比對商品名稱與發行公司）、國家下拉、險種下拉。只有這三個篩選。
4. **案件表格**，欄位依序：

| 欄位 | 內容 |
|---|---|
| 商品 | name（粗體，未審閱時後面加「未審閱」標籤）；下一行小字 issuer |
| 國家 | 國家代碼轉換 |
| 險種 | category |
| 市場需求 | 色點＋`module_summary.market_demand.text` |
| 發生率暨獲利 | 色點＋research_status 標籤（第 9.1 節） |
| 法規適用 | 色點＋`module_summary.regulatory.overall_verdict` |
| 整體建議 | label 標籤（signal_color 底色淡色版） |
| 待解決 | 「阻斷 n · 注意 m」；有 critical 時前面加「重大 k」並以紅字顯示 |
| 產出日期 | generated_date |

   - 整列可點擊進入報告頁。預設依產出日期新到舊；可點「商品」「產出日期」欄位標題切換排序。
   - 三個模組欄的欄位標題用 `legend.module` 無法取得（清單不含 legend），因此使用 i18n 固定文字「市場需求」「發生率暨獲利」「法規適用」。
5. 無資料時顯示「目前沒有報告。新增方式請見 README。」

### 11.3 報告頁（`#/report/:reportId`）

ReportPage 只負責取資料與載入／錯誤狀態，成功後渲染 `<ReportView vm={...} />`。

**A. 流程列**（單列、高度約 40px）：以四個步驟顯示此商品所在位置：
1. 資料蒐集（完成）
2. 三面向分析（顯示「3／3 完成」，計算 `source_files` 中 status 為 `provided` 的數量）
3. 統整建議（完成）
4. 部門審查（灰色，標「規劃中」）

**B. 決策摘要區**（全寬）
- 第一行：商品名稱（大標）；右側「列印／另存 PDF」按鈕。
- 第二行小字：issuer · 國家 · category · currency · premium_mode。
- 第三行：`headline.label` 大型燈號標籤＋`one_line_summary`。
- `reasons` 條列（最多顯示全部，不收合）。
- 右上小字：產出日期，以及三模組 review_date。
- `mechanism_summary` 以一行灰字顯示於最下方，標題「商品機制」。

**C. 三面向計分列**（三欄等寬，高度一致）
- 每欄：標題為 `legendLabel("module", 鍵)`；下方灰字核心問題（第 9.1 節）；燈號（scorecard.signal）；關鍵指標：
  - market_demand：需求等級（`legendLabel("demand_level", level)`）、信心等級。
  - actuarial：研究狀態、可比程度、定價提示數。
  - regulatory：overall_verdict；法規燈號分布條（D8，第 13 節）。
- 各模組 `sections.<鍵>.summary`（最多三行，超過以「…」截斷，滑鼠移上顯示全文）。
- 底部連結「看詳細內容」，點擊切換到 E 區對應分頁並捲動過去。
- status 不為 `provided` 時，該欄顯示「未提供」與原始值。

**D. 雙欄區**（1280px 以上：主欄 2/3、側欄 1/3）
- 主欄
  - **待解決事項**：標題右側為負責單位下拉（選項來自 blockers 與 next_steps 的 owner，依第 9.5 節拆分，加「全部」）。表格欄位：嚴重度（legend.severity 標籤＋色點）、面向（legend.module）、事項、負責單位、處理方式。依 critical、blocking、warning、其他排序。
  - **建議下一步**：依 priority 排列的編號清單，每項顯示 action、負責單位、來源面向。套用同一個負責單位篩選。
  - 負責單位篩選值同步寫入網址 `?owner=`；網址有值時優先使用；否則讀取 localStorage 鍵 `gocardifweb.owner`（讀寫皆以 try/catch 包住）；選擇後寫回 localStorage。
- 側欄
  - **資料品質**：`suspected_input_errors` 非空時，以琥珀色提示框直接顯示全部內容（D11）。其下「更多資料品質註記」預設收合，展開後依序顯示 conflicts、evidence_mismatch、missing_fields、notes（空陣列不顯示；全部為空時不顯示此收合區）。
  - **資料缺口**：合併顯示 `sections.market_demand.data_gaps` 與 `sections.actuarial.evidence_gaps`，每項前標面向名稱。

**E. 各面向詳細內容**（全寬分頁籤，預設 market_demand）
- market_demand：summary；市場規模（methodology、目標人口、低／中／高估計值以市場規模區間條呈現（D8）、confidence）；key_points（文字、來源、證據等級）。
- actuarial：summary；key_points；定價提示表格（topic、direction、source_count）。
- regulatory：summary；燈號篩選（全部＋legend.light 各值）；findings 表格（item_id、title、燈號、law、remedy、owner），`suspected_red` 為 true 的列加註「疑似紅燈」；關鍵法規 key_laws 條列。

**F. 頁尾**：disclaimer 原文。

### 11.4 使用說明（`#/guide`）
內容固定如下（放入 i18n）：
1. **這個網站做什麼**：彙整國外保險商品在台灣的市場需求、發生率暨獲利、法規適用三面向分析結果，並提供統整建議。
2. **流程**：資料蒐集 → 三面向分析 → 統整建議 → 部門審查（規劃中）。
3. **三個面向回答的問題**：同第 9.1 節核心問題表。
4. **怎麼看一份報告**：先看最上方建議與理由；再看三面向燈號；接著依自己的部門篩選「待解決事項」；需要細節時看下方分頁。
5. **注意**：本網站內容為 AI 輔助之內部初審，須經相關部門人員覆核；資料不足不代表負面結論。

---

### 11.5 追蹤清單（`#/watchlist`，2026-10-20 經使用者同意新增）
- 候選商品＝使用者在報告頁底部「加入追蹤清單」的報告，存在瀏覽器（依加入順序）。
- 四個維度：可行性、獲利性、市場飽和度、品牌／通路契合度；每個維度一支 0–5 權重滑桿（預設 3、3、3、0），拖動即時重算排序；權重存在瀏覽器。
- 綜合分數＝Σ(分數×權重)÷Σ權重，無資料或權重 0 的維度不計入。後端提供數值分數前，暫用燈號換算（綠 100、黃 67、橘 33、紅 0；可行性＝法規適用、獲利性＝發生率暨獲利、市場飽和度＝市場需求；品牌／通路契合度尚無資料）。
- 每列可展開計算明細、連到報告頁、移出（可復原）。首頁追蹤清單區塊顯示前 5 名。
- 加入／移出在報告頁頂部列右側（第 10.2 節）。

### 11.6 新聞與法規監控（`#/news`，2026-10-20 經使用者同意新增）
- 資料：動態清單（`api-contract.md` 第 2A 節）。每則分「新聞」「法規」（`kind`），屬於 5 個領域之一（`domain`）。
- 頁籤：全部｜商品與通路動態｜市場與總經情勢｜監理法規｜理賠與消保｜客群經營與品牌公關，附件數；新聞法規混排，新到舊，每次顯示 30 則＋「顯示更多」。
- 開關「只看影響追蹤清單商品」：只留 `related_report_ids` 含追蹤清單商品的法規。法規可展開列出受影響的追蹤商品，連到報告頁。
- 頁籤與開關寫入網址（replace）。首頁新聞區塊顯示最新 5 則＋「看全部 →」。

## 12. 列印（D9）
- 「列印／另存 PDF」按鈕呼叫 `window.print()`。
- 列印樣式：隱藏導覽列、頂部列、按鈕與篩選器；E 區三個分頁內容全部依序展開；資料品質收合區展開；保留燈號文字；每個大區塊避免跨頁斷開。

---

## 13. 小型視覺（D8，純 CSS）
- **法規燈號分布條**：一條水平條，依 counts 各值比例分段，顏色依 legend.light；下方以文字列出各值標籤與數字。總數為 0 時顯示「無資料」。
- **市場規模區間條**：顯示低、中、高三個估計值的位置與數字；任一值為 null 時改為純文字列出。
- 兩者放在 `components/charts/`，不得安裝圖表套件。

---

## 14. 擴充預留（只保留結構，不實作）
- 新頁面：依第 11.1 節規則新增；導覽列的「規劃中」項目屆時改為可點擊。
- 新資料：報告格式微調時只改 `types/report.ts` 與 `normalize.ts`。
- 圖表：未來需要正式圖表時，再選定套件並放入 `components/charts/`。
- 後端互動：依 `docs/spec/api-contract.md` 第 3、4 節，屆時再排入。
- 英文介面：新增 `src/i18n/en.ts`。

---

## 15. 部署
- `deploy.yml`：push 到 main 時執行 `npm ci`、`npm run build`，發布 `dist/`。
- README 需寫明：Settings → Pages → Source 選「GitHub Actions」；如何新增報告；如何切換資料來源；如何用 mock-api 測試；未來規劃。

---

## 16. 開發用資料
- 使用 `docs/examples/summarizer-example-report.json`，開發一開始複製進 `incoming/` 並執行 sync。不得自行製作假報告。

---

## 17. 驗收標準
1. 首頁表格顯示範例報告一列：整體建議「暫緩，待補資料」（黃）、市場需求「明確需求」（綠）、發生率暨獲利「部分證據」（黃）、法規適用「待確認」（黃）、待解決「阻斷 7 · 注意 5」。
2. 建議分布列出現「全部」與「暫緩，待補資料 1」；點擊後表格篩選正確。
3. 報告頁在 1440×900 視窗不捲動即可看到：流程列、商品名稱、建議標籤、一句話摘要、三面向計分列。
4. 市場規模顯示 670、960、1,250 億元與「7,291,797 人」；法規分布條顯示黃燈 4、綠燈 6、待補 7、不適用 2。
5. 負責單位選「風控」時，待解決事項只剩 G-PAY-01 一列；網址出現 `?owner=風控`；重新整理後維持篩選。
6. 側欄直接顯示「benefit_payout_type 為『日額給付』…」的疑似輸入錯誤提示。
7. 法規分頁選「待補」時顯示 7 筆。
8. 列印預覽中導覽列與按鈕隱藏，三個面向內容全部出現。
9. 啟動 mock-api 並切換 config 為 api 模式，畫面與 static 模式相同；關閉 mock-api 後出現離線提示並改顯示靜態資料。
10. 刪除範例報告的 legend 整段後頁面仍可顯示；改成不合法 JSON 時顯示格式錯誤說明。
11. 全專案搜尋：`src/components/` 內沒有 fetch、資料層匯入，也沒有讀取原始報告欄位（如 `scorecard`、`headline`）的程式碼。
12. 寬度 768px 時導覽列收合為選單按鈕，內容改單欄，表格可橫向捲動。
13. `npm run build` 無錯誤、無型別錯誤；部署後 `https://hsinyuweng.github.io/gocardifweb/` 可開啟，重新整理不 404；Console 無錯誤；全專案無金鑰。

---

## 18. 實作階段
1. 專案建立、AppShell（導覽列、頂部列）、config 讀取、資料層與 sync 腳本、首頁表格。
2. 報告頁 A–D 區。
3. 報告頁 E–F 區、小型視覺、列印樣式。
4. 使用說明頁、mock-api、api 模式與離線備援、RWD。
5. GitHub Actions 部署與 README。
