# 未來發展方向：等資料才做的功能

> 2026-10-28 決定：網站先做「只用現有資料」的階段性成品。下列功能曾經設計過（有些已做好），但後端從沒交過所需資料，所以**先從畫面隱藏**，設計記在這裡，資料到了再打開或接著做。
> 已做好的部分**程式保留、畫面隱藏**；還沒做的只留設計。資料交付後：照本檔恢復 → 把該列刪掉，現況寫回 `decisions/`。
> 「組員編號」對應後端需求文件（連結在 `roadmap.md` 第 4 節）的「暫停（2026-10-28）」段。

## 1. 已做好、先隱藏

| 功能 | 原本的設計（畫面） | 需要的資料（組員編號） | 程式位置 |
|---|---|---|---|
| 追蹤清單綜合分數 | 比較表欄位：法規可行性、市場規模、市場成長、（有資料才出現）品牌／通路契合度、綜合；每格分數＋小橫條，燈號換算標「燈號」，沒資料「無資料」；「看重　平均｜法規優先｜市場優先」改權重（1/1/1/1、3/1/1/1、1/2/2/1）；「計算明細 ▾」列出依據、級數、說明、可信度、原始數值與來源、算式；名次依綜合分數；首頁追蹤框「最高分 ○○ 67」與前 4 名分數橫條 | 報告 `dimension_scores` 的 `feasibility`、`market_size`、`market_growth`、`brand_fit`（0–100、`level` 1–5、`rationale`、`confidence`、`value`/`unit`、來源）（S10；品牌未排定） | `lib/score.ts`、`lib/weights.ts`、`components/watchlist/CompareTable.tsx`、`CandidateBreakdown.tsx`、`PresetPicker.tsx`、`components/home/` 追蹤框；細節見 `decisions/market-dashboard.md` 追蹤清單節 |
| 報告完成時間（時分） | 首頁競品研究「日本 · 完成於 2026-10-11 14:30」，同一天的報告依完成時間排先後 | `report_meta.generated_at`（ISO 8601 含時區）（S11） | `data/normalize.ts`（`generatedAt`、`generatedTime`）、`pages/MarketHomePage.tsx`、`components/home/ResearchList.tsx` |
| 模組未跑原因 | 三面向卡「未提供（原因：…）」取代原始狀態 | `report_meta.source_files.<模組>.skip_reason`（R1-B） | `components/report/ScorecardRow.tsx` |
| 品牌定位一句 | 報告頁一句話結論下方灰字「品牌定位：…（來源）」 | `headline.brand_note`、`brand_note_source`（M6、S12） | `components/report/DecisionSummary.tsx` |
| 法規發現的來源與可信度 | 每筆 finding 標題下「來源 ▾」，展開為「可信度 A：說明」與來源清單（新分頁），列印一律展開 | `findings[].sources[]`（name、url、as_of）、`evidence_scheme`、`evidence_level`，legend `evidence_<scheme>`（R4） | `components/report/RegulatoryDetail.tsx` |
| 關鍵發現的來源連結與日期 | 「來源：X · 資料日期 …」，X 有網址時是新分頁連結；精算關鍵發現加「證據等級 X」 | `key_points[].source_url`、`as_of`；精算 `evidence_level`（A2） | `components/report/KeyPointList.tsx`、`SourceRefText.tsx` |
| 資料衝突 | 報告頁資料品質「資料衝突」一組 | `data_quality.conflicts`（目前 9 份都是空陣列） | `components/report/DataQualityPanel.tsx` |
| 法規動態 | 新聞頁新聞、法規混排，每則 [新聞]／[法規] 標籤；數字磚「法規 N 則」（0 則時珊瑚色「近 30 天沒有新的法規」）；結論句「…，法規 N 則」；首頁新聞框「· 法規 N 則」；頁名「新聞與法規監控」、說明「同業新聞稿、主管機關法規與公告」 | feed `kind: "regulation"` 的項目（R3；目前 8 個官方來源 SSL 失敗，抓不到） | `components/news/FeedKindTag.tsx`、`lib/newsStory.ts`、`lib/feedSummary.ts`、`lib/insights.ts`、`pages/NewsPage.tsx` |
| 法規與追蹤商品的關聯 | 清單上方勾選「只看可能相關追蹤清單商品」（網址 `affects=1`）；法規一行加「可能相關追蹤清單 N 項商品 ▾」「同險種 N 項 ▾」，展開列出商品連報告頁（麵包屑「新聞與法規監控 / 商品」）；一律寫「可能相關」不寫「影響」 | feed `related_report_ids`、`affected_categories`（R3） | `pages/NewsPage.tsx`（`productsOf`、`inCategory`） |
| 新聞 5 個領域 | 依領域分組固定 5 組：商品與通路動態、市場與總經情勢、監理法規、理賠與消保、客群經營與品牌公關；空的組寫「這段期間沒有項目」；各領域則數圖 5 個都列（監理法規 0 則珊瑚色） | feed `domain` 出現 `market_macro`、`regulation`（M4、R3） | `pages/NewsPage.tsx`（`DOMAINS`）、`components/home/NewsList.tsx` |
| 市場脈動健康度 | 分頁 `#/market/health`「健康度（全行業解約率與繼續率）」；總覽下一步右側「健康度…尚無資料，有資料後會多一個分頁」；數字 2 位小數 | market-pulse `group: "health"` 的指標（M5） | `lib/pulse.ts`、`pages/MarketPage.tsx`、`components/market/MarketTabs.tsx` |
| 多線圖 | 指標表一列標題＋每條線一列；看圖展開圖例＋折線，最多 4 條，其餘「另有 N 條未顯示」 | market-pulse `type: "multi_line"`（M5） | `components/charts/LineChart.tsx`、`components/market/MetricChart.tsx`、`lib/pulseTable.ts` |
| 制度時程 | 定價環境「會計／資本制度時程」；已發生實心點、預計空心點；指標表上期欄「預計 日期 標題」 | market-pulse `type: "timeline"`、`events[]`（M5） | `components/charts/Timeline.tsx`、`MetricChart.tsx`、`lib/pulseTable.ts` |
| 同業申訴率 | 品牌與競爭說明「法巴市占率與同業申訴率」；細節區申訴率 | market-pulse 申訴率指標（M5 候選指標） | `i18n/zh-TW.ts` 組別說明 |

## 2. 設計過、還沒做

| 功能 | 原本的設計 | 需要的資料（組員編號） |
|---|---|---|
| 新契約保費金額 | 成長動能分頁每月金額直條；各險別金額（億元 1 位小數） | market-pulse 2.2 `new_premium_amount`、`product_mix` 的 `amount_ntd`（M7） |
| 同業排名 | 品牌與競爭：前 5 名＋法巴前後各 1 名橫條（法巴珊瑚）、結論補「與前後名次的差距」、細節區全部 20 家表格；新元件 `RankingBars` | market-pulse 2.2 `type: "ranking"`、`company_ranking`（含 `is_self`）（M7） |
| 10 年債日資料、指標一句話 | 定價環境改日線；每個指標可選 `headline` 當圖表標題 | `tw_10y_yield_daily`、`headline`（M7） |
| 來源抓取狀態 | 新聞頁提示「主管機關與公會來源這次沒有抓到」 | feed 1.3 `sources_status`（M7） |
| 競品比較表 | 報告頁競品比較表（量化指標可畫圖） | `sections.market_demand.competitor_comparison`（M1、A1、S4；組員 `enrich_reports.py` 轉換） |
| 每日自動更新 | 網站每天固定時間抓後端快照 | 每日快照網址與完成時刻（S9） |
| 燈號變化提示 | 標出「燈號有變化的商品」、報告歷史版本 | 報告歷史版本（S6） |
| 台灣地圖 | 縣市靜態 SVG＋CSS 填色（海軍藍深淺） | 縣市客群資料（M2、S5） |
| 登入與個人待辦 | 待辦指派到人、完成狀態，換電腦不會不見 | 登入與後端儲存（L1） |
| 多人共用審閱 | 「未審閱」全組共用 | 後端儲存（L2） |
| 跨部門審查 | 導覽列已有灰色「規劃中」項目 | 未定 |
| 原規劃的獲利性、市場飽和度維度 | 2026-10-20 規劃的排序維度，2026-10-26 改成法規可行性、市場規模、市場成長 | `dimension_scores.profitability`、`saturation`（評分方法 1.0 固定 null） |

## 3. 已有資料、還沒用的（可直接做）

- 市場需求交給精算／法規的待確認事項 `sections.market_demand.handoffs`（9 份都有）：可放在報告頁對應面向。
- 標籤更新建議 `sections.market_demand.tag_update_suggestion`。
