# 網頁架構（現況）

> 只寫網頁**現在**的樣子。未來架構見 `../backlog/roadmap.md`。

## 1. 路由與頁面

| 路徑 | 頁面 | 檔案 |
|---|---|---|
| `#/` | 市場總覽：四區塊（新聞與法規監控、市場脈動、追蹤清單、競品研究） | `pages/MarketHomePage.tsx` |
| `#/news` | 新聞與法規監控：頁籤、影響篩選寫進網址（`tab`、`affects`） | `pages/NewsPage.tsx` |
| `#/market` | 市場脈動：本月焦點＋五組指標 | `pages/MarketPage.tsx` |
| `#/watchlist` | 追蹤清單：權重滑桿、綜合分數排序 | `pages/WatchlistPage.tsx` |
| `#/research` | 競品研究：全部報告，篩選與排序寫進網址（`q`、`country`、`category`、`rec`、`unread`、`sort`、`dir`） | `pages/OverviewPage.tsx` |
| `#/cases` | 舊網址，replace 轉到 `#/research`（保留查詢字串） | `main.tsx` |
| `#/report/:reportId` | 報告頁，A–F 區，可帶 `?owner=` | `pages/ReportPage.tsx` |
| `#/tasks` | 我的待辦，可帶 `?owner=` | `pages/TasksPage.tsx` |
| `#/guide` | 使用說明 | `pages/GuidePage.tsx` |
| `*` | 找不到此頁面，連「回到市場總覽」 | `pages/NotFoundPage.tsx` |

路由定義在 `src/main.tsx`。新增頁面時只新增路由與頁面檔（規格第 11.1 節）。

## 2. 導覽列（Sidebar）

- 可點擊的項目依序為：市場總覽、新聞與法規監控、市場脈動、追蹤清單、競品研究、我的待辦、使用說明。
- 規劃中（灰色、不可點）：跨部門審查。
- 頂部列右側：狀態提示；報告頁的「加入追蹤清單」（頁面以 portal 放入動作區）。
- 底部：我的單位（設定／更改）、資料更新時間、資料來源（離線資料／後端連線）。

## 3. 頁面之間的連結與返回路徑

```
市場總覽 ─ 競品研究一則 ───────▶ 報告頁                          麵包屑「市場總覽 / 商品」
        ─ 競品研究「看全部 →」▶ 競品研究?unread=1               麵包屑「市場總覽 / 競品研究」
        ─ 追蹤清單一則 ───────▶ 報告頁                          麵包屑「市場總覽 / 商品」
        ─ 追蹤清單「看全部 →」▶ 追蹤清單                        麵包屑「市場總覽 / 追蹤清單」
        ─ 新聞「看全部 →」───▶ 新聞與法規監控                  麵包屑「市場總覽 / 新聞與法規監控」
        ─ 市場脈動「看全部 →」▶ 市場脈動                        麵包屑「市場總覽 / 市場脈動」
        ─ 新聞標題 ───────────▶ 外部原文（新分頁）
競品研究 ─ 點一列 ───────────▶ 報告頁                          麵包屑「競品研究 / 商品」，回到原篩選
新聞頁 ─ 受影響商品 ─────────▶ 報告頁                          麵包屑「新聞與法規監控 / 商品」，回到原頁籤
追蹤清單 ─ 商品名稱 ─────────▶ 報告頁                          麵包屑「追蹤清單 / 商品」，權重不變
報告頁 ─ 看追蹤清單 → ───────▶ 追蹤清單                        麵包屑「商品 / 追蹤清單」
我的待辦 ─ 看報告 → ─────────▶ 報告頁（帶 ?owner=）             麵包屑「我的待辦 / 商品」
報告頁 E 區 ─ ↑ 回到三面向 ──▶ 同頁 C 區
```

- 實作方式：導過去時把來源網址放進 `location.state.from`，麵包屑由它決定上一層（`lib/ownerParam.ts` 的 `readFromPath`、`readFromState`）。
- `BreadcrumbItem.state` 讓麵包屑可以把上一層的 state 帶回去，所以多層返回不會斷。

## 4. 資料流

```
public/config.json ─ loadConfig ─▶ ConfigContext
pages/RootLayout ─ getDataSource(config) ─▶ Static / Api / Fallback(Api→Static) / ConfigError
  ├─ listReports（一次）─▶ normalizeAppMeta ─▶ AppShell（Sidebar、TopBar）
  ├─ allReports（需要時才讀）─▶ 我的待辦、我的單位選項
  ├─ feed（需要時才讀）──────▶ 市場總覽、新聞與法規監控
  └─ marketPulse（需要時才讀）▶ 市場總覽（市場脈動）、市場脈動頁
（以上經 Outlet context 傳出：useIndexState、useAllReports、useFeed、useMarketPulse）
pages/* ─ normalize* ─▶ ViewModel ─▶ components/*
```

| 資料 | static 模式 | api 模式 | 原始格式只在這些檔案出現 |
|---|---|---|---|
| 報告清單 | `data/reports/index.json` | `/api/v1/reports` | `types/reportIndex.ts`、`validate.ts`、`normalize.ts` |
| 單份報告 | `data/reports/<id>.json` | `/api/v1/reports/<id>` | `types/report.ts`、`validate.ts`、`normalize.ts` |
| 動態清單 | `data/feed.json` | `/api/v1/feed` | `types/feed.ts`、`validate.ts`、`normalizeMarket.ts` |
| 市場脈動 | `data/market-pulse.json` | `/api/v1/market-pulse` | `types/marketPulse.ts`、`validate.ts`、`normalizeMarket.ts` |

- 元件只收 ViewModel（`types/viewModel.ts`）。後端格式改變時只改上表最右欄的檔案。
- 資料檔不存在（404）時，卡片顯示「資料準備中」。本機 vite 對不存在的檔案回傳 HTML，也當作 404 處理（`fetchJson`）。
- 只有網路錯誤與 5xx 會改讀靜態檔（離線備援）。
- 瀏覽器存放的資料：`gocardifweb.owner`（我的單位）、`gocardifweb.candidates`（追蹤清單）、`gocardifweb.weights`（權重）、`gocardifweb.reviewed`（已審閱報告）。

## 5. 程式目錄

```
src/
├── main.tsx                 路由
├── config/                  config.json 讀取
├── data/                    DataSource 四種實作、validate、normalize、normalizeMarket、allReports、connectionStatus
├── types/                   原始 JSON 型別（report、reportIndex、feed、marketPulse）、viewModel
├── lib/                     格式、國家、篩選、負責單位、追蹤清單、待辦彙整等工具
├── i18n/zh-TW.ts            所有介面文字
├── components/
│   ├── layout/              AppShell、Sidebar、TopBar
│   ├── common/              SignalLabel、StatusMessage
│   ├── charts/              MarketSizingBar、RegulatoryDistributionBar、Sparkline、LineChart、ShareBars、Timeline（純 CSS／SVG，不用套件）
│   ├── market/              市場脈動頁的指標卡片
│   ├── news/                新聞與法規監控（標籤、每則）
│   ├── home/                市場總覽卡片
│   ├── overview/            競品研究頁（原案件總覽）
│   ├── report/              報告頁 A–F 區
│   ├── tasks/               我的待辦
│   └── watchlist/           追蹤清單（權重滑桿、清單列）
└── pages/                   各頁面、RootLayout、pageChrome（共用狀態 hooks）、useOnDemand
scripts/                     sync-reports.mjs（匯入報告、feed、market-pulse）、mock-api.mjs（本機模擬後端）
```

## 6. 視覺規則摘要

- 綠、黃、橘、紅只用在燈號（D4）。市場脈動的漲跌用海軍藍加 ▲▼；多系列圖表用藍紫系 4 色（`lib/chartPalette.ts`）。
- 寬度 ≥1024px（`lg`）才顯示側邊導覽。市場總覽寬螢幕 2×2，窄螢幕一欄（競品研究第一）。
- 每個頁面在 390px 寬時都不能整頁左右捲動。
