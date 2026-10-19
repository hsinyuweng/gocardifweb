# 資料現況

> 改資料層、匯入報告、和後端討論格式時讀。

- `public/data/reports/` 有 9 份報告：fwd-jpy-single-premium-va（範例）、chakin、kyobo-modu-jikim-whole-life、oriance、policyme-guaranteed-issue-life-insurance、secure-horizon-iul、singlife-heritage-reserve、surely-life-certua-uk、wealth-term-insurance。
- `incoming/`（gitignore）另有 `batch_summary.json`、`fwd-jpy-single-premium-va_summary_report.json`：是多商品批次摘要格式（`products` 陣列＋`cross_cutting`），sync 正確略過；未來首頁圖表可能用到 `cross_cutting.common_missing_inputs`，需後端定版。
- 資料問題（已寫進給後端的文件）：
  - surely-life-certua-uk 市場規模 172,800～259,200 億元，疑似單位填錯；前端照原樣顯示。
  - secure-horizon、wealth-term 的 `reported_unit` 是「億元」，其他是「新台幣元」；跨商品比較前需統一。
  - singlife 的法規模組 `not_run`。
  - 負責單位有「上游（顏）」這類非單位名稱。
- **競品比較：現有 JSON 都沒有競品資料**（只有 `source_ref` 指向 `market_demand:competitor_comparison`），需後端在 summarizer 報告加入。
- 市場總覽的 `feed.json`、`market-pulse.json`：後端尚未提供，線上顯示「資料準備中」。示意資料在 `docs/examples/feed-example.json`、`docs/examples/market-pulse-example.json`，只供本機 mock-api 使用。
