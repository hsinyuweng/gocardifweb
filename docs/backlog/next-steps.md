# 下一批實作計畫（2026-10-31 使用者確認方向，新對話照此實作）

> 依序做 A → D。每項做完：`npm run build`、無頭 Chrome 截圖 1440 與 390 寬檢查（方法見 `guides/environment.md`）、更新對應的 `decisions/*.md`，完成的項目從本檔刪掉。全部做完後刪除本檔，並把 `README.md` 第 2 節改寫成現況。
> 共同原則：資料裡的代號、欄位名、組員姓氏一律清掉（`data/cleanText.ts`）；A/B/C 這類等級一律在格子最下面用小灰字註明高低（`components/common/GradeNote.tsx`）；每個往下一頁或下一步的地方都要能回來。

## A. 子頁一律用所屬首頁框的代表色（使用者明確要求，最優先）

- 規則：首頁四框各自的子頁都用該框的顏色，不論從哪裡點進去。**競品的個別報告頁一律黃色（research），不可回到藍色或中性灰藍**，否則會錯亂。
- 對照：
  | 路徑 | 代表色 |
  |---|---|
  | `#/market`、`#/market/:tab` | pulse 天空藍（已是） |
  | `#/news` | news 薄荷綠（已是） |
  | `#/watchlist` | watch 薰衣草（已是） |
  | `#/research`、`#/cases`、**`#/report/:id`、`#/tasks`**（我的待辦只從報告頁進入，屬於競品研究） | research 奶油黃（`report`、`tasks` 要改） |
  | `#/guide`、找不到頁面 | plain（不變） |
- 改 `src/lib/pageTheme.ts` 的 `themeForPath`（加 `report`、`tasks` → `research`），同步改檔頭註解、`architecture/overview.md` 第 6 節、`decisions/deviations.md` 或視覺規劃檔中「報告頁中性灰藍」的敘述。
- 驗證：從首頁、競品研究、追蹤清單、新聞分別點進同一份報告，整頁底色、頁首色、卡片強調色都是黃色；報告頁的追蹤按鈕仍是薰衣草色（它代表「追蹤」動作，不跟頁面色）。

## B. 競品研究表格與報告頁細節區的視覺統一

這些地方還是改版前的樣式（`slate-*`、`navy-*`、`amber-*` 色、`rounded` 小圓角、粗體），和其他頁的新設計（代表色深淺、`ink`／`ink2`／`muted` 文字色、`line` 框線、`rounded-xl` 白卡、中等字重）不一致，是目前最像「開發到一半」的地方。

- 範圍（先 grep `slate-\|navy-\|amber-\|font-semibold` 列出全部，再逐一改）：
  - `components/overview/ReportTable.tsx`、`RecommendationBar.tsx`、`OverviewToolbar.tsx`、`ModuleSignalTable.tsx`（競品研究列表、篩選膠囊、搜尋框）。
  - `components/report/` 的 `BlockersTable`、`NextStepsList`、`DetailTabs`、`DetailBlock`、`MarketDemandDetail`、`ActuarialDetail`、`RegulatoryDetail`、`DataQualityPanel`（黃色警示框改成代表色淡底）、`DataGapsPanel`、`KeyPointList`、`OwnerFilter`、`ReportNav`、`ReportFooter`、`FlowBar`。
  - `components/tasks/`（我的待辦，A 之後是黃色頁）。
- 規則照 `architecture/diagrams/2026-10-27_視覺改版規劃.md` 與 `decisions/`：60-30-10（白卡＋代表色深淺，珊瑚只標最重要的一點）、燈號一律色點＋文字、表頭用 `bg-p-faint`、膠囊選中用 `bg-p`。**只換樣式，不改內容、文字與行為**；若有要改文字或結構的地方，先列給使用者確認。
- 驗證：競品研究頁與報告頁全頁截圖和市場脈動、追蹤清單並排比較，看起來是同一套設計；列印預覽（`window.print`）仍正常。

## C. 市場脈動補新契約保費金額與 10 年債日資料（不用等後端）

- 資料已在 `agentdata/market-pulse-work/output/pulse.json`：`new_premium_total`（新契約保費金額，億元，月資料 20 期）、`new_premium_by_type` 的 `values`（各險別金額）、`gov_bond_yield_10y`（日資料 250 天）。
- 做法比照同業排名：在 `scripts/import-agentdata.mjs` 轉成後端需求文件 M7（schema 2.2）的格式後補進 market-pulse（後端已有同 key 就不補）。格式先讀後端需求文件塗的分頁「M5 schema 2.2」（連結在 `backlog/roadmap.md` 第 4 節）：`new_premium_amount`、`product_mix` 的 `amount_ntd`、`tw_10y_yield_daily`。
- 畫面（設計已在 `backlog/future-features.md` 第 2 節與視覺規劃檔）：成長動能分頁加每月金額直條（億元 1 位小數），各險別金額放指標表；定價環境改用日資料折線。實作前把介面文字表列給使用者確認。
- 完成後刪掉 `future-features.md` 對應兩列。

## D. 報告頁加「交給精算／法規的待確認事項」

- 資料：8 份報告都有 `sections.market_demand.handoffs`（`to_actuarial`、`to_regulatory` 各一段文字），目前沒有顯示。
- 位置建議：報告頁「建議下一步」段落下方，或三面向分頁裡對應的精算、法規分頁開頭；標題與文字先列給使用者確認（例：「市場需求交給發生率暨獲利調查確認」）。
- 同時評估 `tag_update_suggestion`（新標籤建議）是否值得顯示；不顯示就在 `future-features.md` 第 3 節註明原因。
- 完成後刪掉 `future-features.md` 第 3 節對應項目，更新 `decisions/spec-stages.md` 報告頁段落。
