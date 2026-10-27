# 資料現況

- `public/data/reports/` 9 份報告：fwd-jpy-single-premium-va、chakin、kyobo-modu-jikim-whole-life、oriance、policyme-guaranteed-issue-life-insurance、secure-horizon-iul、singlife-heritage-reserve、surely-life-certua-uk、wealth-term-insurance。
- `incoming/`（gitignore）的 `batch_summary.json` 是多商品批次格式，sync 會略過。
- 已知資料問題（已告知後端）：surely-life 市場規模疑似單位填錯（前端照原樣顯示）；secure-horizon、wealth-term 單位是「億元」，其他是「新台幣元」；singlife 法規模組 `not_run`；負責單位有「上游（顏）」這類非單位名稱。
- 報告**沒有**競品資料、數值分數、品牌定位、審閱狀態。
- `feed.json`、`market-pulse.json`：2026-10-26 塗交付（feed 1.2、market-pulse 2.1），放在 `public/data/`。示意資料在 `docs/examples/`（含同險種、萬分比、名次、負數、資料較舊的例子）。
- feed 已知問題（已請塗修正）：8 個官方來源（保險局、公會、金管會、央行）SSL 憑證驗證失敗，所以只有中央社 34 則業者新聞稿、0 則法規；標題結尾多了公司全名；`summary` 是模板句；同一則新聞稿重複出現。
- market-pulse：只有 5 個指標（新契約保費年增率、各險別占比、10 年期公債、通路占比、法巴市占率），健康度組沒有資料；通路占比和法巴市占率都只有 1 期。
- `line_growth.json`（各險別新契約年增率）是給市場需求模組（翁）的市場成長備援，網站不讀。
