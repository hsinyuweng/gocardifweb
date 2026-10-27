# gocardifweb 文件入口（每個新對話只必讀本檔）

> 紀錄只寫**現況**與**未來架構**，不寫修改過程（過程看 `git log`）。內容過時就直接改掉或刪除，不要往下追加。

## 1. 現況

- 網站：https://hsinyuweng.github.io/gocardifweb/（repo `hsinyuweng/gocardifweb`，`main` push 後自動部署）
- 頁面：首頁「市場總覽」四區塊、新聞與法規監控 `#/news`、市場脈動 `#/market`、追蹤清單 `#/watchlist`、競品研究 `#/research`、報告頁、我的待辦、使用說明（見 `architecture/overview.md`）
- 2026-10-20 新規劃：階段 1（導覽與競品研究）、2（追蹤清單）、3（新聞與法規監控；加入追蹤按鈕移到固定頂部列）、4（市場脈動：schema 2.0 草案、首頁 1–2 指標、`#/market` 五組）、5A（先讀後端新欄位：數值分數、完成時間、來源與可信度、品牌定位、未跑原因）已完成；2026-10-26 追蹤清單改為法規可行性、市場規模、市場成長三維度（S10 評分方法 1.0）
- 市場資料：`public/data/feed.json`（schema 1.2）、`public/data/market-pulse.json`（schema 2.1）是塗 2026-10-26 交付的第一份真實資料，後端更新時直接換檔；已知資料問題見 `progress/data-status.md`。示意資料仍在 `examples/`

## 2. 下一步

依使用者 2026-10-20 新規劃（`architecture/diagrams/2026-10-20_網頁規劃說明.md`）改版。剩餘階段在 `backlog/roadmap.md`。**下一步：階段 5B**（競品比較表——已請組員提供跑過 `enrich_reports.py` 的完整報告、每日快照自動抓取、下一步對應待解決事項），要等後端交付範例；交付時先看後端需求文件的「交付紀錄」與 `format_variant`（連結在 `backlog/roadmap.md` 第 4 節）。

## 3. 改動前：依範圍讀

| 改動涉及 | 讀（都在 `docs/` 下） |
|---|---|
| 任何介面文字、新畫面 | `guides/collaboration.md`、對應的 `decisions/*.md` |
| 頁面、路由、導覽、頁面間連結 | `architecture/overview.md`、`spec/web-spec.md` 第 10–11 節 |
| 首頁四區塊、新聞、市場脈動、追蹤清單 | `decisions/market-dashboard.md`、`spec/api-contract.md` 第 2A 節、`backlog/roadmap.md` |
| 競品研究頁、報告頁 | `spec/web-spec.md` 第 9、11 節、`decisions/spec-stages.md`、`decisions/deviations.md` |
| 我的待辦、負責單位、麵包屑 | `decisions/tasks-owner-backnav.md` |
| 資料層、JSON、後端串接 | `spec/web-spec.md` 第 6–8 節、`spec/api-contract.md`、`progress/data-status.md` |
| 部署、套件、測試 | `guides/environment.md` |
| 規劃新方向、後端需求 | `backlog/roadmap.md`、`backlog/open-questions.md` |

## 4. 改動後：要更新的檔

| 改動 | 更新 |
|---|---|
| 小（bug、樣式） | 通常不用；改到已確認的介面文字才改 `decisions/*.md` |
| 中（新功能、頁面、資料欄位） | 對應 `decisions/*.md`、本檔第 1–2 節；路由或資料流有變再改 `architecture/overview.md` |
| 大（架構、首頁、導覽、規格） | 中的全部＋`spec/*.md`（先經使用者同意）＋`backlog/roadmap.md` |
| 新的合作要求／環境問題 | `guides/`；很重要的寫進 `/CLAUDE.md` |
| 待確認事項 | `backlog/open-questions.md`（確認後刪掉該行，結論寫進 `decisions/`） |

## 5. 檔案

```
spec/            正式規格（修改要使用者同意）：web-spec.md、api-contract.md
architecture/    overview.md（現在的頁面、路由、資料流、程式目錄）；diagrams/（使用者的規劃圖，PDF＋.md 文字版）
decisions/       已確認的介面文字與實作規則：market-dashboard、tasks-owner-backnav、spec-stages、deviations
progress/        data-status.md（現有報告與資料問題）
backlog/         roadmap.md（未來架構與分階段計畫）、open-questions.md
guides/          collaboration.md（合作方式、導覽原則）、environment.md（環境、驗證方法）
examples/        JSON 範例；references/ 舊原型截圖，不必讀
```
