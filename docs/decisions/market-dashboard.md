# 市場總覽儀表板 A–D（第 3 層）

> 2026-10-18 架構經使用者核准。A ✅（41ff03c）、B ✅（81b2628）、C ⏭ 下一步、D 等後端資料。
> 由舊的 `docs/project-status.md` 拆出（2026-10-20），內容照原樣保留；有新決定就加在對應的段落。

## 進度

| 階段 | 內容 | 狀態 |
|---|---|---|
| A | 架構、路由、導覽、案件總覽移到 `#/cases`、四張卡片外框、我的追蹤清單 | ✅ 41ff03c |
| B | feed／市場脈動資料層、三張卡片內容、SVG 小線圖、示意資料、mock-api | ✅ 81b2628 |
| C | `#/feed?category=`、`#/market` 詳細頁；卡片「看全部 →」；導覽列兩項改可點；使用說明補充 | ⏸ 暫停：2026-10-20 新規劃（`architecture/diagrams/2026-10-20_網頁規劃說明.md`），待重新規劃 |
| D | 接後端真實資料（sync 或 api 模式），依實際格式調整 types／validate／normalizeMarket | 等後端 |

## C 階段已知的規劃（尚未確認介面文字）

- `#/feed?category=`：新聞、海外新商品、法規、市場統計的完整清單，可以依類別篩選。篩選寫進網址，報告連結帶 `state.from`。
- `#/market`：全部市場指標，較大的趨勢圖＋數值表（純 SVG）。
- 從卡片進入時，麵包屑顯示「市場總覽 / 頁名」。
- 規劃前先看 `architecture/diagrams/` 裡的新架構圖。

## 已確認的決定、文字與實作

- 使用者提供示意圖：四張卡片「新聞監控」「市場脈動」「競品與法規異動」「我的追蹤清單」。原計畫存在 Claude 本機檔 `~/.claude/plans/groovy-petting-wren.md`（新對話不一定讀得到；重點已寫在本檔與 `architecture/overview.md`）。
- 已確認：追蹤清單追蹤「險種＋市場」（存在瀏覽器，點擊連到 `#/cases?category=&country=`）；案件表格移到 `#/cases`；後端資料未到時三張卡片顯示「資料準備中」，示意資料只在本機 mock-api；趨勢小線圖用純 SVG，不裝套件。
- 新路由：`#/` 市場總覽、`#/cases` 案件總覽、`#/feed?category=` 市場動態、`#/market` 市場脈動；導覽列規劃中只留「跨部門審查」（市場動態、市場脈動在 C 階段完成前仍列規劃中）。
- 卡片分工：新聞監控＝feed 的 news、market；競品與法規異動＝product、regulation（避免重複）。
- 資料層：DataSource 新增 `getFeed()`、`getMarketPulse()`（static：`data/feed.json`、`data/market-pulse.json`；api：`/api/v1/feed`、`/api/v1/market-pulse`）；404 → 卡片顯示資料準備中。
- 階段：A 架構＋追蹤清單＋規格文件 → B 資料層＋三張卡片＋示意資料 → C 詳細頁 → D 接後端真實資料。後端需求文件需補：市場脈動格式、feed 的 `country`／`product_category`、更新頻率。
- 這修改規格 D1（首頁型態）、第 10.1、11 節，使用者已同意（已改 `docs/spec/web-spec.md`，D7 也同步改為「我的單位」）。
- **階段 A 確認文字**：導覽列「市場總覽、案件總覽、我的待辦、使用說明」，規劃中「市場動態、市場脈動、跨部門審查」／首頁標題「市場總覽」＋「資料更新於 …」／卡片：新聞監控、市場脈動、競品與法規異動、我的追蹤清單（寬螢幕 2×2 照示意圖；窄螢幕追蹤清單第一）／資料準備中，後端提供後會自動顯示。／追蹤列「險種・國家」＋「N 件商品」，右側「今天更新／昨天更新／N 天前更新」（>30 天顯示「YYYY-MM-DD 更新」），沒有相符「目前沒有相符的案件」／空清單「還沒有追蹤項目。按「＋新增追蹤」選擇險種與市場。」／新增：險種（全部險種）＋市場（全部國家）下拉、加入、取消；兩個都全部不能加入；重複「已在追蹤清單中」／移除「×」（title「移除追蹤」，不確認）／預設空清單／從追蹤清單進案件總覽麵包屑「市場總覽 / 案件總覽」／找不到頁面「回到市場總覽」。
- **階段 A 實作**：`pages/MarketHomePage.tsx`、`components/home/`（HomeCard＋PendingContent、WatchlistCard）、`lib/watchlist.ts`（localStorage key `gocardifweb.watchlist`，可訂閱）、`lib/format.ts`（`todayTaipei`、`daysAgo`、`updatedText`）；`main.tsx` 路由 `index`→市場總覽、`cases`→OverviewPage；Sidebar；NotFound；ReportPage 麵包屑預設 `/cases`。
- 返回鏈：`BreadcrumbItem` 新增 `state`；OverviewPage 導到報告時帶 `fromState`（自己的 location.state），報告頁麵包屑回案件總覽時帶回，所以「市場總覽 → 案件總覽 → 報告 → 案件總覽」仍顯示「市場總覽 / 案件總覽」。OverviewPage 改篩選時保留 state。
- **階段 B 確認文字**：新聞監控＝news＋market 最新 3 則（標題新分頁開原文、第二行「來源 · 相對時間」，不顯示摘要）／相對時間「N 分鐘前、N 小時前、今天、昨天、N 天前」，>30 天顯示日期／市場脈動最多 4 個：名稱、「▲ 3.2%」「▼ 0.8%」「— 0%」、期間文字照資料、SVG 小線圖；**用海軍藍＋▲▼，不用綠紅（D4）**／競品與法規異動＝product＋regulation 最新 4 則，標籤「新商品」「法規」（灰藍）、「影響 N 項既有商品評估」可展開相關商品並連到報告頁／有檔但無項目「目前沒有新的動態。」「目前沒有指標資料。」／非 404 錯誤只影響該卡片／追蹤清單更新時間取相符報告日期與相符動態日期最新者（比對動態的 country、product_category）／「看全部 →」到階段 C 才出現。
- **階段 B 實作**：`types/feed.ts`、`types/marketPulse.ts`、`data/normalizeMarket.ts`（原始欄位只在這三處＋`validate.ts`，使用者提醒正式格式可能不同）；DataSource 四種實作加 `getFeed`、`getMarketPulse`；`pages/useOnDemand.ts`（需要時才讀取）＋ pageChrome `useFeed`、`useMarketPulse`；`components/home/`（NewsList、PulseList、ChangesList、FeedItemLine）、`components/charts/Sparkline.tsx`；`lib/format.ts`（`relativeTimeText`、`changePctText`）；報告頁從市場總覽進來時麵包屑「市場總覽 / 商品」；mock-api 新增兩端點（`public/data/` 有正式檔優先，否則用 `docs/examples/` 示意檔）；sync 認得 `feed.json`、`market-pulse.json` 並複製到 `public/data/`；`docs/spec/api-contract.md` 新增第 2A 節。
- **fetchJson 修正**：本機 vite dev／preview 對不存在的檔案回 200＋首頁 HTML，原本會顯示「資料格式錯誤」；現在收到 `text/html` 視為 404（not_found）。線上 GitHub Pages 本來就回 404。
- 示意資料：`docs/examples/feed-example.json`（8 則，來源都標「示意資料（…）」）、`docs/examples/market-pulse-example.json`（4 個指標）。只供本機 mock-api，不放進 `public/data/`。
- Claude 驗證：build 通過；headless Chrome 測新增（全部＋全部不能加、重複提示）、移除、重新整理保留、追蹤列→案件總覽篩選與麵包屑、報告往返、404 連結、390px 無橫向捲動。
