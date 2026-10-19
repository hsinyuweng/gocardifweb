# 資料現況

- `public/data/reports/` 9 份報告：fwd-jpy-single-premium-va、chakin、kyobo-modu-jikim-whole-life、oriance、policyme-guaranteed-issue-life-insurance、secure-horizon-iul、singlife-heritage-reserve、surely-life-certua-uk、wealth-term-insurance。
- `incoming/`（gitignore）的 `batch_summary.json` 是多商品批次格式，sync 會略過。
- 已知資料問題（已告知後端）：surely-life 市場規模疑似單位填錯（前端照原樣顯示）；secure-horizon、wealth-term 單位是「億元」，其他是「新台幣元」；singlife 法規模組 `not_run`；負責單位有「上游（顏）」這類非單位名稱。
- 報告**沒有**競品資料、數值分數、品牌定位、審閱狀態。
- `feed.json`、`market-pulse.json` 後端未提供；示意資料在 `docs/examples/`。
