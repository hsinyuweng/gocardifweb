# 市場總覽首頁（現況）

> 2026-10-20 新規劃會取代本頁大部分內容（見 `backlog/roadmap.md`）。改版完成的部分要從這裡刪除、改寫成新版。

## 版面

- `#/` 標題「市場總覽」＋「資料更新於 …」。四張卡片：新聞監控、市場脈動、競品與法規異動、我的追蹤清單。寬螢幕 2×2；窄螢幕一欄，追蹤清單第一。
- 資料檔 404 →「資料準備中，後端提供後會自動顯示。」；其他錯誤只影響該卡片。有檔無項目：「目前沒有新的動態。」「目前沒有指標資料。」

## 卡片

- **新聞監控**：feed 的 `news`、`market` 最新 3 則。標題新分頁開原文；第二行「來源 · 相對時間」（N 分鐘前／N 小時前／今天／昨天／N 天前，>30 天顯示日期）。
- **市場脈動**：最多 4 個指標：名稱、「▲ 3.2%」「▼ 0.8%」「— 0%」、期間文字、SVG 小線圖。漲跌用海軍藍＋▲▼，不用綠紅（綠黃橘紅只給燈號，D4）。
- **競品與法規異動**：feed 的 `product`、`regulation` 最新 4 則，灰藍標籤「新商品」「法規」；「影響 N 項既有商品評估」可展開，連到報告頁。
- **我的追蹤清單**：追蹤「險種＋市場」（localStorage `gocardifweb.watchlist`）。一列「險種・國家」＋「N 件商品」＋更新時間（相符報告與動態中最新者）；點擊到 `#/cases?category=&country=`。新增：兩個下拉＋加入／取消，兩者皆「全部」不能加入，重複顯示「已在追蹤清單中」；「×」直接移除；空清單「還沒有追蹤項目。按「＋新增追蹤」選擇險種與市場。」

## 實作規則

- 資料：`getFeed()`、`getMarketPulse()`（static `data/feed.json`、`data/market-pulse.json`；api `/api/v1/feed`、`/api/v1/market-pulse`），需要時才讀（`pages/useOnDemand.ts`）。原始欄位只出現在 `types/feed.ts`、`types/marketPulse.ts`、`data/validate.ts`、`data/normalizeMarket.ts`；後端正式格式可能不同。
- 本機 vite 對不存在的檔案回 200＋HTML，`fetchJson` 把 `text/html` 當 404。
- 示意資料只在 `docs/examples/feed-example.json`、`market-pulse-example.json`，只給 mock-api，不放進 `public/data/`。
- 圖表用純 SVG（`components/charts/Sparkline.tsx`），不裝圖表套件。
- 麵包屑：從首頁進報告頁「市場總覽 / 商品」；進案件總覽「市場總覽 / 案件總覽」（`BreadcrumbItem.state` 把來源 state 帶回，多層返回不斷）。
