# 未來發展方向：等資料才做的功能

> 這些功能設計過（有些程式已做好），但後端還沒交所需資料。已做好的**都是有資料才出現**，資料到了會自動顯示；還沒做的只留設計。資料交付後：確認畫面 → 把該列刪掉，現況寫回 `decisions/`。
> 2026-10-31 收到 10-30 交付後，綜合分數、法規動態、新聞 5 領域、健康度、多線圖已有資料並上線；同業排名、競品比較表已完成（見 `decisions/`）。
> 「組員編號」對應後端需求文件（連結在 `roadmap.md` 第 4 節）的「暫停（2026-10-28）」段。

## 1. 已做好、等資料

| 功能 | 原本的設計（畫面） | 需要的資料（組員編號） | 程式位置 |
|---|---|---|---|
| 報告完成時間（時分） | 原本首頁競品研究「完成於 2026-10-11 14:30」（2026-10-31 首頁改列建議，暫不用；有資料後可放回報告頁頁首） | `report_meta.generated_at`（ISO 8601 含時區）（S11） | `data/normalize.ts`（`generatedAt`、`generatedTime`） |
| 模組未跑原因 | 三面向卡「未提供（原因：…）」取代原始狀態 | `report_meta.source_files.<模組>.skip_reason`（R1-B） | `components/report/ScorecardRow.tsx` |
| 品牌定位一句 | 報告頁一句話結論下方灰字「品牌定位：…（來源）」 | `headline.brand_note`、`brand_note_source`（M6、S12） | `components/report/DecisionSummary.tsx` |
| 法規發現的來源與可信度 | 每筆 finding 標題下「來源 ▾」，展開為「可信度 A：說明」與來源清單（新分頁），列印一律展開 | `findings[].sources[]`（name、url、as_of）、`evidence_scheme`、`evidence_level`，legend `evidence_<scheme>`（R4）；孫的 `2c.json` 已有 `rule_basis.source_url`，統整時沒帶進 3.json | `components/report/RegulatoryDetail.tsx` |
| 關鍵發現的來源連結與日期 | 「來源：X · 資料日期 …」，X 有網址時是新分頁連結；精算關鍵發現加「證據等級 X」 | `key_points[].source_url`、`as_of`；精算 `evidence_level`（A2） | `components/report/KeyPointList.tsx`、`SourceRefText.tsx` |
| 資料衝突 | 報告頁資料品質「資料衝突」一組 | `data_quality.conflicts`（目前 8 份都是空陣列） | `components/report/DataQualityPanel.tsx` |
| 法規與追蹤商品的關聯 | 清單上方勾選「只看可能相關追蹤清單商品」（網址 `affects=1`）；法規一行加「可能相關追蹤清單 N 項商品 ▾」「同險種 N 項 ▾」，展開列出商品連報告頁（麵包屑「新聞與法規監控 / 商品」）；一律寫「可能相關」不寫「影響」 | feed `related_report_ids`、`affected_categories`（R3） | `pages/NewsPage.tsx`（`productsOf`、`inCategory`） |
| 制度時程 | 定價環境「會計／資本制度時程」；已發生實心點、預計空心點；指標表上期欄「預計 日期 標題」 | market-pulse `type: "timeline"`、`events[]`（M5） | `components/charts/Timeline.tsx`、`MetricChart.tsx`、`lib/pulseTable.ts` |
| 同業申訴率 | 細節區申訴率（多線）；有資料後品牌與競爭說明改成「法巴市占率、同業排名與申訴率」 | market-pulse 申訴率指標（M5 候選指標） | `i18n/zh-TW.ts` 組別說明 |

## 2. 設計過、還沒做

| 功能 | 原本的設計 | 需要的資料（組員編號） |
|---|---|---|
| 指標一句話 | 每個指標可選 `headline` 當圖表標題 | `headline`（M7） |
| 來源抓取狀態 | 新聞頁提示「主管機關與公會來源這次沒有抓到」 | feed 1.3 `sources_status`（M7）；內部檔 `news-monitor-work/output/feed.json` 的 `run.sources_status` 已有（10-29 全部成功，暫不需要） |
| 每日自動更新 | 網站每天固定時間抓後端快照 | 每日快照網址與完成時刻（S9） |
| 燈號變化提示 | 標出「燈號有變化的商品」、報告歷史版本 | 報告歷史版本（S6） |
| 台灣地圖 | 縣市靜態 SVG＋CSS 填色（海軍藍深淺） | 縣市客群資料（M2、S5） |
| 登入與個人待辦 | 待辦指派到人、完成狀態，換電腦不會不見 | 登入與後端儲存（L1） |
| 多人共用審閱 | 「未審閱」全組共用 | 後端儲存（L2） |
| 跨部門審查 | 導覽列已有灰色「規劃中」項目 | 未定 |
| 原規劃的獲利性、市場飽和度維度 | 2026-10-20 規劃的排序維度，2026-10-26 改成法規可行性、市場規模、市場成長 | `dimension_scores.profitability`、`saturation`（評分方法 1.0 固定 null） |

## 3. 已有資料、還沒用的（可直接做）

- 市場需求交給精算／法規的待確認事項 `sections.market_demand.handoffs`（9 份都有）：可放在報告頁對應面向。
- 標籤更新建議 `sections.market_demand.tag_update_suggestion`：不顯示（2026-10-31 使用者決定；是給後端維護標籤庫用的，讀報告的人用處不大）。
