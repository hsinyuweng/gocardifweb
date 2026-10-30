# 下一批實作計畫（2026-10-31 使用者確認方向，新對話照此實作）

> 依序做 C → D（A 子頁代表色、B 視覺統一已完成）。每項做完：`npm run build`、無頭 Chrome 截圖 1440 與 390 寬檢查（方法見 `guides/environment.md`）、更新對應的 `decisions/*.md`，完成的項目從本檔刪掉。全部做完後刪除本檔，並把 `README.md` 第 2 節改寫成現況。
> 共同原則：資料裡的代號、欄位名、組員姓氏一律清掉（`data/cleanText.ts`）；A/B/C 這類等級一律在格子最下面用小灰字註明高低（`components/common/GradeNote.tsx`）；每個往下一頁或下一步的地方都要能回來。

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
