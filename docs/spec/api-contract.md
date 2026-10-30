# gocardif 前後端 API 約定

> 對象：前端（gocardifweb）與後端（Controller）開發者。
> 版本：v2（報告清單新增 `module_summary` 與 `blocker_counts`）。
> 狀態：第 2 節為正式約定，前端已依此實作；第 3、4 節為草案，皆未實作。

---

## 1. 通用規則

- 提供者：Controller（REST API）。前端不直接呼叫 Hermes。
- Base URL：前端 `public/config.json` 的 `apiBaseUrl`。
- 路徑前綴：`/api/v1`。
- 請求與回應皆為 JSON（UTF-8）。
- CORS：允許 `https://hsinyuweng.github.io`（只寫網域）；本機開發另允許 `http://localhost:5173`。
- 錯誤格式：

```json
{ "error": { "code": "REPORT_NOT_FOUND", "message": "說明文字" } }
```

| 狀態碼 | 時機 | 前端處理 |
|---|---|---|
| 400 | 請求格式錯誤 | 顯示錯誤說明 |
| 404 | 資源不存在 | 顯示「找不到此報告」 |
| 5xx | 伺服器錯誤 | 可觸發離線資料 |

- 欄位擴充原則：回應可新增欄位，前端會忽略不認得的欄位；刪除或改名欄位前須先通知前端。

---

## 2. 報告讀取（正式約定）

回應內容與前端靜態檔完全相同。

### 2.1 取得報告清單 `GET /api/v1/reports`

```json
{
  "generated_at": "2026-10-11T08:00:00Z",
  "reports": [
    {
      "report_id": "fwd-jpy-single-premium-va",
      "name": "FWD円建一時払変額年金",
      "issuer": "FWD Life Insurance Japan",
      "country": "JP",
      "category": "年金險（變額年金）",
      "recommendation": "hold_missing_info",
      "label": "暫緩，待補資料",
      "signal_color": "yellow",
      "generated_date": "2026-10-11",
      "module_summary": {
        "market_demand": { "signal": "green", "text": "明確需求" },
        "actuarial": { "signal": "yellow", "research_status": "partial_evidence" },
        "regulatory": { "signal": "yellow", "overall_verdict": "待確認" }
      },
      "blocker_counts": { "critical": 0, "blocking": 7, "warning": 5 }
    }
  ]
}
```

欄位來源（皆取自該份報告）：

| 清單欄位 | 報告欄位 |
|---|---|
| name、issuer、country、category | `product_snapshot` 同名欄位 |
| recommendation、label、signal_color | `headline` 同名欄位 |
| generated_date | `report_meta.generated_date` |
| module_summary.market_demand.signal／text | `scorecard.market_demand.signal`／`.label` |
| module_summary.actuarial.signal／research_status | `scorecard.actuarial.signal`／`.research_status` |
| module_summary.regulatory.signal／overall_verdict | `scorecard.regulatory.signal`／`.overall_verdict` |
| blocker_counts.critical／blocking／warning | `blockers` 中 severity 為該值的筆數 |

- 報告缺少某欄位時填 null；計數缺少時填 0。
- `generated_at`：清單產生時間，ISO 8601。

### 2.2 取得單一報告 `GET /api/v1/reports/{report_id}`

- 回應 summarizer 輸出的報告 JSON 原文，不包裝、不修改（格式見 `docs/examples/summarizer-example-report.json`）。
- 找不到時回 404，`code` 為 `REPORT_NOT_FOUND`。
- 前端已支援的選用欄位（2026-10-20，schema 1.1 草案；格式細節見後端需求文件「AI 詳細版」與各組員分頁）：`report_meta.generated_at`（S11）、`report_meta.source_files.<模組>.skip_reason`（R1-B）、`dimension_scores`（S10；評分方法 1.0：`feasibility`、`market_size`、`market_growth` 各含 `score`、`level`、`basis`、`rationale`、`confidence`，選用 `value`、`unit`、`source`、`source_url`、`as_of`；`profitability`、`saturation`、`brand_fit` 目前固定 null）、`headline.brand_note`／`brand_note_source`（S12）、`sections.*.key_points[].source_url`／`as_of`（A2）、`sections.regulatory.findings[].evidence_scheme`／`evidence_level`／`sources`（R4）、`legend.evidence_<scheme>.<等級>.label`。沒有這些欄位時畫面與原本相同。
- 2026-10-31 起也讀：`sections.market_demand.competitor_comparison`（M1：`has_direct_competitor`、`no_competitor_reason`、`comparison_dimensions[]`、`competitors[]`（`name`、`issuer`、`is_direct`、`attributes`{維度: 文字}、`currency`、`premium_mode`、`difference`、`source_url`）、`gap_analysis`）；`product_snapshot.source_documents[]`（`title`、`type`、`url`、`publication_date`；後端沒給時 `npm run import` 從 1.json 補）。
- `npm run sync` 產生報告清單時，把 `generated_at` 與 `dimension_scores` 原樣複製到清單每筆。

---

## 2A. 市場總覽資料（2026-10-18 新增；2026-10-26 後端交付 feed 1.2、market-pulse 2.1）

首頁「市場總覽」使用。回應內容與靜態檔相同，原樣回傳；格式細節見後端需求文件 S7、M5，示意檔在 `docs/examples/feed-example.json`、`docs/examples/market-pulse-example.json`。

| 端點 | 靜態檔（static 模式） | 必要欄位 | 用在 |
|---|---|---|---|
| `GET /api/v1/feed` | `public/data/feed.json` | `items` 陣列 | 首頁新聞區塊、新聞與法規監控頁 |
| `GET /api/v1/market-pulse` | `public/data/market-pulse.json` | `metrics` 陣列 | 首頁市場脈動區塊、市場脈動頁 |

- `feed.json` 每則（schema 1.2）：
  - `kind`：`news`（新聞）或 `regulation`（法規）。缺漏時前端用舊欄位 `category` 推得（`regulation` 為法規，其餘為新聞）。
  - `domain`：`product_channel` 商品與通路動態、`market_macro` 市場與總經情勢、`regulation` 監理法規、`claims_consumer` 理賠與消保、`customer_brand` 客群經營與品牌公關。缺漏或其他值只出現在「全部」。
  - `related_report_ids`：法規標題或摘要提到的商品 report_id（「可能相關」，關鍵字比對，不是影響判斷）。
  - `affected_categories`：法規相關險種，與報告 `product_snapshot.category` 同一組名稱；新聞省略。前端比對追蹤商品時，報告險種相同或是「險種（…）」細分都算「同險種」。
  - `self_reported`：`true`＝業者自行發布的新聞稿，來源後顯示「業者自述」；缺漏視為 `false`。
  - `sources`（目前一律 `[]`）前端不讀。
  - 其他欄位不變：`id`、`title`、`summary`、`source`、`url`、`published_at`、`country`、`product_category`。
- `market-pulse.json`（schema 2.1＝2.0＋每個指標的 `stale`）：
  - 檔案：`schema_version`（`"2.1"`）、`generated_at`、`focus_summary`（`{ "text", "as_of" }`，也接受純字串；缺漏時不顯示本月焦點）、`metrics`。
  - 每個指標共同欄位：`key`、`group`（`growth` 成長動能、`pricing` 定價環境、`channel` 通路結構、`health` 健康度、`brand` 品牌與競爭；缺漏或其他值當作 `growth`）、`type`（`trend`、`multi_line`、`share`、`timeline`、`ranking`；缺漏當作 `trend`；其他值略過）、`featured`（`true` 顯示在首頁，只限 `trend`，最多 2 個）、`label`、`unit`（`%`、`新台幣元`、`萬分比`、`名`，其他照原文）、`source`、`source_url`、`as_of`、`stale`（`true` 顯示「資料較舊」，後端判斷；`_status` 前端不讀）。
  - `trend`：`latest_value`、`change_pct`（`null` 時不顯示變化）、`change_unit`（`pct` 百分比，預設；`pp` 百分點）、`change_label`、`series`（`[{ period, value }]`，由舊到新；`period` 可為 `2026-08`、`2026-Q3`、`2026-W43`）。
  - `multi_line`：`lines`（`[{ name, series }]`，最多 4 條，共用同一個 `unit`）。
  - `share`：`periods`（`[{ period, parts: [{ name, share_pct, growth_pct? }] }]`，由舊到新；`growth_pct` 是年增率，沒有去年同期時 `null`；最多 4 項，超過的前端合併為「其他」；不滿 6 期前端註「資料累積中」）。
  - `timeline`：`events`（`[{ date, title, status: done|upcoming, note? }]`）。
  - `ranking`（schema 2.2，M7；2026-10-31 起支援）：`period`、`rows`（`[{ name, value, rank, is_self }]`，依 `value` 由高到低，`is_self` 只有一筆）。後端還沒交時，`npm run import` 從 `pulse.json` 的 `company_ranking` 轉出（`key: company_ranking`、`group: brand`、`unit: %`、`value`＝市占率）。
  - 沒有任何 `featured` 時，首頁顯示成長動能組的前 2 個 `trend`。schema 1.0（沒有 `group`、`type`）仍可顯示。
- 尚未提供時回 404（`NOT_FOUND`）：前端該卡片顯示「資料準備中」，不視為錯誤。
- 錯誤格式與離線備援規則同第 1 節。
- 正式格式若與草案不同，前端只需調整 `src/types/feed.ts`、`src/types/marketPulse.ts`、`src/data/validate.ts`、`src/data/normalizeMarket.ts`。

## 3. 模組詳細資料（草案，未實作）

- 用途：未來呈現模組層級的細節與圖表，例如發生率暨獲利模組的 `incidence_time_series`（可畫成趨勢線圖）。
- 構想端點：`GET /api/v1/reports/{report_id}/modules/{module_key}`，回應該模組輸出原文。
- 待決定：各模組輸出格式定版、是否對外提供。

---

## 4. 分析任務（草案，未實作）

### 4.1 非同步設計理由
agent 分析需數分鐘，瀏覽器與 Cloudflare 代理都有逾時限制，因此採「送出任務 → 取得任務編號 → 前端定時查詢 → 完成後以 report_id 讀取報告」。

### 4.2 端點草案
- `POST /api/v1/jobs` → 202，`{ "job_id": "字串", "status": "queued" }`
- `GET /api/v1/jobs/{job_id}` →

```json
{
  "job_id": "字串",
  "status": "queued | running | completed | failed",
  "stage": "字串或 null",
  "report_id": "完成時為報告 id，否則 null",
  "error": "失敗時為說明，否則 null",
  "created_at": "ISO 8601",
  "updated_at": "ISO 8601"
}
```

### 4.3 待後端決定
1. 建立任務的請求欄位（需對照 fetch-information 的輸入）。
2. 存取控管：網站公開，前端無法保存密鑰；建立任務會產生費用，必須有防護（例如使用者輸入通行碼、限制每小時任務數）。
3. 任務與報告的儲存位置，以及新報告是否自動出現在第 2.1 節清單。
4. 查詢進度間隔與最長等待時間。
