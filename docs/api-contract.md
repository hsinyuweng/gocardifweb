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

---

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
