# gocardifweb：Cardif 商品引入評估

彙整國外保險商品在台灣的**市場需求、發生率暨獲利、法規適用**三面向分析結果，並提供統整建議的內部初審網站。

- 網站：<https://hsinyuweng.github.io/gocardifweb/>
- 技術：React + TypeScript + Vite + Tailwind CSS，純靜態網站，以 GitHub Actions 發布到 GitHub Pages。
- 開發規格：[`docs/web-spec.md`](docs/web-spec.md)；前後端約定：[`docs/api-contract.md`](docs/api-contract.md)；進度紀錄：[`docs/project-status.md`](docs/project-status.md)。

> 網站內容為 AI 輔助之內部初審，須經相關部門人員覆核。

---

## 本機開發

需要 Node.js 22.22 以上（react-router 的最低要求；建議 24 LTS，與自動部署相同）。

```bash
npm install        # 第一次使用時安裝套件
npm run dev        # 開啟 http://localhost:5173/gocardifweb/
npm run build      # 建置到 dist/（含型別檢查）
npm run preview    # 在本機預覽 dist/ 的建置結果
```

| 指令 | 用途 |
|---|---|
| `npm run dev` | 本機開發，存檔後畫面自動更新 |
| `npm run sync` | 匯入 `incoming/` 的報告 |
| `npm run mock-api` | 本機模擬後端（`http://localhost:8787`） |
| `npm run build` | 建置 |

---

## 部署

push 到 `main` 分支後，GitHub Actions（[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)）會自動執行 `npm ci`、`npm run build`，並發布 `dist/`。約一到兩分鐘後網站更新。

### 第一次部署前的設定（只需做一次）

1. 到 GitHub repo 頁面 → **Settings** → 左側 **Pages**。
2. **Build and deployment** 的 **Source** 選「**GitHub Actions**」。
3. 之後每次 push 都會自動部署。進度可在 repo 上方的 **Actions** 分頁查看；也可以在 Actions 分頁選「Deploy to GitHub Pages」→「Run workflow」手動重新部署。

> 免費帳號的 GitHub Pages 需要公開 repo。不論 repo 是否公開，**發布後的網站任何人都看得到**，請只放可以公開的報告。

---

## 新增報告

1. 把後端交付的 summarizer 報告 JSON 放進 `incoming/` 資料夾（此資料夾不會被 commit）。
2. 執行：
   ```bash
   npm run sync
   # 或指定其他資料夾：npm run sync -- --from <資料夾路徑>
   ```
3. sync 會把報告複製到 `public/data/reports/`，並重新產生 `public/data/reports/index.json`。終端機會列出匯入與略過的檔案：
   - 格式錯誤、缺 `report_id`、`schema_version` 不是 `1.x` 的檔案會略過並警告，其他檔案照常匯入。
   - 同一批有重複的 `report_id` 時整批中止，不會複製任何檔案。
4. `npm run dev` 確認畫面正常後，commit 並 push，網站會自動更新。

---

## 切換資料來源

網站啟動時讀取 [`public/config.json`](public/config.json)（不可放任何金鑰）：

```json
{
  "dataSource": "static",
  "apiBaseUrl": "",
  "fallbackToStatic": true,
  "showRoadmapNav": true
}
```

| 欄位 | 說明 |
|---|---|
| `dataSource` | `static`：讀 `public/data/reports/` 的靜態檔（目前正式網站使用）。`api`：向後端讀取。 |
| `apiBaseUrl` | 後端網址，例如 `http://localhost:8787`。`dataSource` 為 `api` 時不可空白，否則畫面顯示設定錯誤。 |
| `fallbackToStatic` | api 模式連不上後端或後端回 5xx 時，改讀靜態檔，並在頂部列顯示「目前無法連線後端，顯示的是離線資料」。 |
| `showRoadmapNav` | 是否在導覽列顯示「規劃中」項目。 |

改完重新整理頁面即可生效，不需重新建置。**commit 前請確認已改回 `static` 模式。**

---

## 用 mock-api 測試 api 模式

1. 開一個終端機執行 `npm run mock-api`（讀取 `public/data/reports/`，監聽 `http://localhost:8787`）。
2. 另一個終端機執行 `npm run dev`。
3. 把 `public/config.json` 改成 `"dataSource": "api"`、`"apiBaseUrl": "http://localhost:8787"`，重新整理：畫面與 static 模式相同，導覽列底部顯示「資料來源：後端連線」。
4. 在 mock-api 的終端機按 `Ctrl + C` 停掉，重新整理：頂部列出現離線提示，畫面改顯示靜態資料，導覽列顯示「資料來源：離線資料」。
5. 測完把 `config.json` 改回 `"dataSource": "static"`、`"apiBaseUrl": ""`。

mock-api 只實作 [`docs/api-contract.md`](docs/api-contract.md) 第 2 節的兩個端點：`GET /api/v1/reports`、`GET /api/v1/reports/<report_id>`。

---

## 專案結構

```
gocardifweb/
├── .github/workflows/deploy.yml   自動部署
├── docs/                          規格、API 約定、範例報告、進度紀錄
├── incoming/                      待匯入報告（不 commit）
├── public/
│   ├── config.json                執行期設定
│   └── data/reports/              報告 JSON 與 index.json（由 sync 產生）
├── scripts/
│   ├── sync-reports.mjs           npm run sync
│   └── mock-api.mjs               npm run mock-api
└── src/
    ├── data/                      資料層：讀取、驗證、轉換（原始 JSON 欄位只在 normalize.ts 讀取）
    ├── components/                畫面元件（只接收整理好的資料）
    ├── pages/                     頁面：市場總覽、案件總覽、報告頁、我的待辦、使用說明
    ├── i18n/zh-TW.ts              所有介面文字
    └── lib/                       格式化、燈號顏色等工具
```

---

## 未來規劃

- **導覽列「規劃中」項目**：海外商品雷達、市場趨勢報告、法規變化追蹤、跨部門審查。
- **競品比較**：需後端在報告中加入競品資料。
- **市場動態**：每日／每週市場資訊與法規變化；先以 GitHub Actions 定時抓取後端資料並重建網站（每日快照），之後再改為 api 即時模式。
- **目標客群與地區分布**：台灣縣市地圖視覺化。
- **市場總覽**：首頁已改為四張卡片（新聞監控、市場脈動、競品與法規異動、我的追蹤清單）；前三張在後端提供資料前顯示「資料準備中」。
- **後端連線**：`dataSource` 改為 `api`，經 Cloudflare tunnel 連到 Controller（見 `docs/api-contract.md`）。
