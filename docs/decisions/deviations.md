# 與規格不同、或規格沒寫的實作（都經使用者確認）

> 改相關程式前先看，避免「依規格修正」反而改壞。

- 競品研究頁（原案件總覽）子元件在 `src/components/overview/`（規格第 5 節未列）。
- 清單項目缺 `report_id`：該列顯示但不可點擊。
- 報告清單由 `pages/RootLayout.tsx` 讀一次，經 Outlet context 給各頁（導覽列也要 generated_at）。
- 畫面欄位叫 `moduleCards`（不叫 scorecards）、`KeyPointList` 註解避開 `key_points`：避免驗收第 11 點文字搜尋誤判。
- 法規燈號篩選選項：legend.light 各值；legend 缺漏時用 findings 中出現的值。
- `DataSourceError` 多了 `status` 與第五種 kind `config_error`。**只有 network 與 5xx 觸發離線備援**；4xx（非 404）歸 `server`。
- 離線狀態：`data/connectionStatus.ts` 訂閱，`useSyncExternalStore` 讀；後端成功時清除。
- RWD：`lg`（≥1024px）才顯示側邊導覽；報告頁 C 區 `lg` 以下單欄（列印強制三欄）；D 區兩欄在 `xl`。grid 一律指定 `grid-cols-1` 並在子欄加 `min-w-0`，否則寬表格會撐出整頁橫向捲動。
- 用詞維持規格：「負責單位」（非部門）、「資料品質」（非資料品質警示）。
- 規格修改（已同意）：網址帳號改 hsinyuweng；D1 首頁四區塊；D7 改記「我的單位」；第 10.1 節導覽列；第 11.1–11.2 節案件總覽改為競品研究（`#/research`）。
