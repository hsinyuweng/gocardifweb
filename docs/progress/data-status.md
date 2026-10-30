# 資料現況

## 來源與匯入

- 唯一來源：後端整包輸出放在 `agentdata/`（gitignore，原樣保留不刪）。新資料到了就整包換掉，再 `npm run import`（轉換到 `incoming/agentdata/` → 驗證 → 整批換新到 `public/data/`）。規則見 `decisions/spec-stages.md`「sync 與 import」。
- `agentdata/` 結構與網站用到的檔：

| 位置 | 網站用途 |
|---|---|
| `<商品 id>/3.json` | 報告（原樣匯入，只補空欄位） |
| `<商品 id>/1.json` | 補發行公司、國家、幣別、繳費方式；商品原始資料連結 |
| `news-monitor-work/news-regulatory-monitor.json` | `feed.json` |
| `market-pulse.json` | `market-pulse.json` |
| `market-pulse-work/output/pulse.json` | 後端還沒交 schema 2.2 時補上：同業排名（`company_ranking` → `ranking`）、新契約保費金額（`new_premium_total` → `new_premium_amount`）、各險別金額（`new_premium_by_type` → `product_mix` 的 `amount_ntd`）、10 年債日資料（`gov_bond_yield_10y` → `tw_10y_yield_daily`）；後端已有同 key 就不補 |

- 網站不讀（後端過程或內部檔）：`<商品 id>/` 的 `2a/2b/2c.json`、`2c.md`、`*_report.md`、發生率 CSV、`run*.out`、`verified.json`（＝1.json）、各種 cache；`enrichscript/`；`news-monitor-work/output|state|work`；`market-pulse-work/output/frontend/`（與 `market-pulse.json` 相同）、`line_growth.json`。

## 目前資料（2026-10-30 交付）

- 報告 8 份（schema 1.1／1.2，`report_id` 是 UUID）：都有 `dimension_scores`（品牌契合度全 null）與 `competitor_comparison`（2–4 家台灣競品）；7 份「暫緩，待補資料」、1 份「有條件推進」。
- 略過：CareScout 第二份 `aacd2f35`（與 `61187f98` 同商品、結論不同，`import-agentdata.mjs` 的 `SKIP`）；Secure Horizon 第二份 `af2f7e7a`（統整沒產出 3.json）。
- feed 1.2：60 則（新聞 48、法規 12，2026-10-01～10-29），5 個領域都有；15 則沒有摘要；`related_report_ids`、`affected_categories` 全空。
- market-pulse 2.1：7 個指標（成長 2、定價 1、通路 1、健康度 2、品牌 1）＋由 `pulse.json` 轉換的同業排名（2026-08，20 家，法巴第 10 名）、新契約保費金額（20 個月）、各險別金額、10 年債日資料（250 天）；通路占比、法巴市占率只有 1 期；繼續率只有 2025 年 1 期。

## 已知資料問題（已請後端處理）

- 分數鑑別度低：市場成長 7/8 份 100 分、市場規模 4/8 份 100 分，排名幾乎只看法規可行性。
- 分數與結論不一致：CareScout「有條件推進」但法規可行性 12（最低）；Secure Horizon 88 分但「暫緩」。
- 3.json 漏填發行公司、國家（網站已用 1.json 補）；判斷理由出現欄位代號「verdict.confidence」與模組代號（網站已把模組代號換成名稱）。
- 法規 finding 沒有來源（孫的 `2c.json` 有 `rule_basis.source_url`）；沒有 `generated_at`、`brand_note`。
- 法規與商品的比對全空（內部 `output/feed.json` 有險種標記 `related_primary_categories`，匯出時沒帶出）。
- 新聞：部分法規其實是產險或公司治理裁罰（例「上市櫃公司永續發展行動方案」被歸為重大裁罰）。
