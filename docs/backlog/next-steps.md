# 下一批實作計畫（2026-10-31 使用者確認方向，新對話照此實作）

> 剩 D（A、B、C 已完成）。每項做完：`npm run build`、無頭 Chrome 截圖 1440 與 390 寬檢查（方法見 `guides/environment.md`）、更新對應的 `decisions/*.md`，完成的項目從本檔刪掉。全部做完後刪除本檔，並把 `README.md` 第 2 節改寫成現況。
> 共同原則：資料裡的代號、欄位名、組員姓氏一律清掉（`data/cleanText.ts`）；A/B/C 這類等級一律在格子最下面用小灰字註明高低（`components/common/GradeNote.tsx`）；每個往下一頁或下一步的地方都要能回來。

## D. 報告頁加「交給精算／法規的待確認事項」

- 資料：8 份報告都有 `sections.market_demand.handoffs`（`to_actuarial`、`to_regulatory` 各一段文字），目前沒有顯示。
- 位置建議：報告頁「建議下一步」段落下方，或三面向分頁裡對應的精算、法規分頁開頭；標題與文字先列給使用者確認（例：「市場需求交給發生率暨獲利調查確認」）。
- 同時評估 `tag_update_suggestion`（新標籤建議）是否值得顯示；不顯示就在 `future-features.md` 第 3 節註明原因。
- 完成後刪掉 `future-features.md` 第 3 節對應項目，更新 `decisions/spec-stages.md` 報告頁段落。
