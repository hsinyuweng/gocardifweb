# gocardifweb 文件入口（每個新對話先讀這份）

> 這份是**唯一每次都要讀**的紀錄檔。它告訴你：目前做到哪、下一步是什麼、這次改動要先讀哪些檔、改完要更新哪些檔。
> 其他檔案依需要才讀，不要每次全部讀完。
> 最後更新：2026-10-20

---

## 1. 目前狀態（每次改動後更新這一節）

- 網站已上線：https://hsinyuweng.github.io/gocardifweb/（repo `hsinyuweng/gocardifweb`，分支 `main`）
- 規格的 5 個階段全部完成。之後做的是規格以外的功能：我的待辦、我的單位、返回路徑、首頁改為「市場總覽」儀表板。
- **進行中：市場總覽儀表板**（分 A–D 階段）
  - A 架構＋追蹤清單：✅ 已 push（41ff03c）
  - B 資料層＋三張卡片＋示意資料：✅ 已 push（81b2628）
  - **C 詳細頁 `#/feed`、`#/market`：⏭ 下一步**。要先列介面文字表，等使用者「確認」後才實作。
  - D 接後端真實資料：等後端交付
- **2026-10-20 使用者提供新的網頁規劃**：`architecture/diagrams/2026-10-20_網頁規劃說明.md`（另有 PDF）。首頁四區塊改為「新聞與法規監控、市場脈動、追蹤清單（候選商品＋權重滑桿排序）、競品研究」，與目前實作差異很大。**原本的 C 階段先暫停**，下一步是比對差異、提出新的分階段計畫，等使用者確認。

完整的進度表見 [progress/status.md](progress/status.md)。

## 2. 資料夾結構與層級

| 層級 | 何時讀 | 檔案 |
|---|---|---|
| **第 1 層** | 每次對話 | `docs/README.md`（本檔）、`/CLAUDE.md`（自動載入） |
| **第 2 層** | 改動涉及該範圍時（見第 3 節） | 各資料夾的總覽檔 |
| **第 3 層** | 需要細節（確認過的文字、過去的原因）時 | 決策細節、變更紀錄 |

```
docs/
├── README.md                  第 1 層：入口（本檔）
├── spec/                      正式規格（第 0 節規則優先於一切；修改要使用者同意）
│   ├── web-spec.md              前端規格 v5（含已同意的修改）
│   └── api-contract.md          前後端 API 約定 v2（含第 2A 節市場端點）
├── architecture/              網頁現在長什麼樣
│   ├── overview.md              第 2 層：路由、導覽列、頁面關係、資料流、程式目錄
│   └── diagrams/                使用者提供的架構圖、規劃文件（PDF／圖片＋同名 .md 文字版）
├── decisions/                 第 3 層：已確認的決定與介面文字（依功能分檔）
│   ├── spec-stages.md           規格階段 1–5、部署步驟
│   ├── tasks-owner-backnav.md   我的待辦、我的單位、返回路徑
│   ├── market-dashboard.md      市場總覽儀表板 A–D
│   └── deviations.md            與規格不同、或規格沒寫的實作
├── progress/
│   ├── status.md                第 2 層：各階段進度表
│   ├── changelog.md             第 3 層：每次改動一行（日期、commit、範圍）
│   └── data-status.md           現有報告與資料問題
├── backlog/
│   ├── roadmap.md               第 2 層：未來方向、後端需求文件
│   └── open-questions.md        待和使用者確認的事
├── guides/
│   ├── collaboration.md         與使用者合作的方式、導覽原則
│   └── environment.md           環境注意事項、Claude 的驗證方法
├── examples/                  JSON 範例（正式報告範例、市場總覽示意資料）
└── references/                舊原型截圖（base44／manus／figma），不必讀
```

## 3. 改動前：依範圍要讀的檔案

只讀與這次改動有關的列。表中檔案都在 `docs/` 下。

| 這次改動涉及 | 先讀 |
|---|---|
| 任何介面文字或新畫面 | `guides/collaboration.md`、對應的 `decisions/*.md` |
| 新頁面、路由、導覽列、頁面之間的連結 | `architecture/overview.md`、`architecture/diagrams/`、`spec/web-spec.md` 第 10–11 節、`guides/collaboration.md`（導覽原則） |
| 市場總覽、動態、市場脈動、追蹤清單 | `decisions/market-dashboard.md`、`spec/api-contract.md` 第 2A 節 |
| 案件總覽、報告頁 | `spec/web-spec.md` 第 9、11 節、`decisions/spec-stages.md`、`decisions/deviations.md` |
| 我的待辦、負責單位、我的單位、麵包屑 | `decisions/tasks-owner-backnav.md` |
| 資料層、JSON 格式、後端串接 | `spec/web-spec.md` 第 6–8 節、`spec/api-contract.md`、`architecture/overview.md`（資料流）、`progress/data-status.md` |
| 部署、套件、建置、測試方法 | `guides/environment.md`、`decisions/spec-stages.md`（部署） |
| 規劃新方向、後端需求 | `backlog/roadmap.md`、`backlog/open-questions.md` |
| 為什麼當初這樣做 | `progress/changelog.md` → 對應的 `decisions/*.md` |

## 4. 改動後：依大小要更新的檔案

**凡是對網頁本身或整體設計的更動，都要寫進這裡的紀錄，不能只留在對話裡。**

| 改動大小 | 例子 | 要更新 |
|---|---|---|
| **小** | 修 bug、調樣式、改一個元件、改文件錯字 | `progress/changelog.md` 加一行。如果改了已確認的介面文字，也要改對應的 `decisions/*.md` |
| **中** | 新功能、新頁面、新的資料欄位、新的確認文字 | 小的全部，加上：對應的 `decisions/*.md`（確認文字＋實作檔案）、`progress/status.md`、本檔第 1 節。如果路由或資料流有變，也要改 `architecture/overview.md` |
| **大** | 改網頁架構、首頁型態、導覽結構、規格本身 | 中的全部，加上：`spec/*.md`（要先經使用者同意）、`architecture/overview.md`、需要時更新圖、`backlog/roadmap.md` |
| 新的合作要求或環境問題 | 使用者說「之後都要…」 | `guides/collaboration.md` 或 `guides/environment.md`；很重要的寫進 `/CLAUDE.md` |
| 新的待確認事項或未來想法 | — | `backlog/open-questions.md`、`backlog/roadmap.md` |

更新後，在完成報告裡告訴使用者改了哪些紀錄檔，並提醒 commit＋push。
