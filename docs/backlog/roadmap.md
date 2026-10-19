# 未來方向（第 2 層）

> 規劃新功能、或和後端討論需求時讀。

## 接下來

1. 儀表板 C：`#/feed`、`#/market` 詳細頁（見 `decisions/market-dashboard.md`）。
2. 儀表板 D：後端交付 `feed.json`、`market-pulse.json` 後接上真實資料。

## 使用者提出的方向與分析

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
- **首頁大改成以圖表為主**：使用者 2026-10-18 決定要做，等後端提供資料後再改。之後已改為「市場總覽」四張卡片儀表板（見 `decisions/market-dashboard.md`），圖表部分用純 SVG。屆時會牽涉規格 D1（首頁型態）修改、圖表套件選擇（規格第 4、14 節，需使用者同意安裝）。
