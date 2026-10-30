# 資料現況

- `public/data/reports/` 9 份報告：fwd-jpy-single-premium-va、chakin、kyobo-modu-jikim-whole-life、oriance、policyme-guaranteed-issue-life-insurance、secure-horizon-iul、singlife-heritage-reserve、surely-life-certua-uk、wealth-term-insurance。
- `incoming/`（gitignore）的 `batch_summary.json` 是多商品批次格式，sync 會略過。
- 已知資料問題（已告知後端）：surely-life 市場規模疑似單位填錯（前端照原樣顯示）；secure-horizon、wealth-term 單位是「億元」，其他是「新台幣元」；singlife 法規模組 `not_run`；負責單位有「上游（顏）」這類非單位名稱。
- 報告**沒有**競品資料、數值分數、品牌定位、審閱狀態。
- `feed.json`、`market-pulse.json`：2026-10-26 塗交付（feed 1.2、market-pulse 2.1），放在 `public/data/`。示意資料在 `docs/examples/`（含同險種、萬分比、名次、負數、資料較舊的例子）。
- feed 已知問題（已請塗修正）：8 個官方來源（保險局、公會、金管會、央行）SSL 憑證驗證失敗，所以只有中央社 34 則業者新聞稿、0 則法規；標題結尾多了公司全名；`summary` 是模板句；同一則新聞稿重複出現。
- market-pulse：只有 5 個指標（新契約保費年增率、各險別占比、10 年期公債、通路占比、法巴市占率），健康度組沒有資料；通路占比和法巴市占率都只有 1 期。
- `line_growth.json`（各險別新契約年增率）是給市場需求模組（翁）的市場成長備援，網站不讀。

## 2026-10-30 交付（待匯入，`incoming/2026-10-30/`）

- 報告 8 份（schema 1.1／1.2，`report_id` 是 UUID，檔名前 8 碼對應 `agentdata/` 資料夾）：都有 `dimension_scores`（市場規模、市場成長、法規可行性；品牌契合度全 null）與 `competitor_comparison`（2–4 家台灣競品）。8 份中 7 份「暫緩，待補資料」。仍沒有：`generated_at`、`brand_note`、finding 來源、key_point 網址。
- 未匯入、留在 `agentdata/`：CareScout 第二份（`aacd2f35`，與 `61187f98` 同商品、結論不同，待後端說明哪份為準）；Secure Horizon 第二份（`af2f7e7a`，沒有 3.json）。
- feed 1.2：60 則（新聞 48、法規 12，2026-10-01～10-29），5 個領域都有；`related_report_ids`、`affected_categories` 全空（後端內部檔 `output/feed.json` 有險種標記，匯出時沒帶出）。
- market-pulse 2.1：7 個指標，新增健康度（淨流入 12 期、繼續率 2025 年 1 期）；通路占比、法巴市占率仍只有 1 期。後端內部檔 `market-pulse-work/output/pulse.json` 另有同業排名、新契約保費金額、10 年債日資料，沒匯出到 2.1。
