# gocardifweb 文件入口（每個新對話只必讀本檔）

> 紀錄只寫**現況**與**未來架構**，不寫修改過程（過程看 `git log`）。內容過時就直接改掉或刪除，不要往下追加。

## 1. 現況

- 網站：https://hsinyuweng.github.io/gocardifweb/（repo `hsinyuweng/gocardifweb`，`main` push 後自動部署）
- 頁面：首頁「市場總覽」四框、新聞與法規監控 `#/news`、市場脈動 `#/market`（一頁）、追蹤清單 `#/watchlist`、競品研究 `#/research`、報告頁、我的待辦、使用說明（見 `architecture/overview.md`）
- 已完成：階段 1–4、5A、5B（競品比較表）、視覺改版 V1–V6（`architecture/diagrams/2026-10-27_視覺改版規劃.md`）、11-01 顯示資料整理與使用者回饋改版
- 資料（2026-10-31 起一律以後端整包輸出 `agentdata/` 為準，gitignore）：`npm run import` 轉換並整批換新到 `public/data/`。目前 8 份報告（10-30 交付，含 S10 分數、台灣競品比較）、feed 1.2（60 則，含法規 12 則）、market-pulse 2.1＋同業排名（由 `pulse.json` 轉換）。資料夾結構、略過的檔案與已知資料問題見 `progress/data-status.md`

## 2. 下一步

**2026-11-01 使用者回饋改版兩輪（已實作，待使用者看過與 commit）**：照 `architecture/diagrams/2026-11-01_回饋整理.md`（來源 `2026-11-01_回饋.pdf` 與對話）。目標：一眼看出市場動態，能用圖就不用文字。全站好綠壞紅（`lib/tone.ts`）、寫 % 不寫「個百分點」、商品簡稱、法規只寫能不能、拿掉「下一步」列；首頁四框照側欄順序、兩行結論；**引進分數**（`lib/introScore.ts`）全站排序；市場脈動一頁（大標題＋大圖＋4 張圖卡）；新聞最上面「重點新聞」＋清單 ★；使用說明改圖示卡片。現況寫在 `decisions/market-dashboard.md`、`decisions/spec-stages.md`。

**等後端**（使用者已轉達組員，交付後照 `progress/data-status.md` 檢查再 `npm run import`）：CareScout 兩份選哪份、商品 `short_name`、法規項目摘要（feed 的法規沒有 `summary`）、市場規模分數分級太粗（8 件中 5 件 100 分）、正式的引進分數（目前前端自算）、重點新聞的相關性判斷（目前前端關鍵字比對）、法規 `affected_categories`／`related_report_ids`、finding 來源、分數鑑別度與分數／結論不一致、理由裡的欄位代號（`verdict.confidence`）、3.json 漏填發行公司與國家、Secure Horizon `af2f7e7a` 沒產出 3.json、各等級（市場需求 A/B/C、精算 T1/T2、信心）的定義。其他等資料的功能見 `backlog/future-features.md`；剩餘階段見 `backlog/roadmap.md`（後端需求文件連結在第 4 節）。


## 3. 改動前：依範圍讀

| 改動涉及 | 讀（都在 `docs/` 下） |
|---|---|
| 任何介面文字、新畫面 | `guides/collaboration.md`、對應的 `decisions/*.md` |
| 頁面、路由、導覽、頁面間連結 | `architecture/overview.md`、`spec/web-spec.md` 第 10–11 節 |
| 首頁四區塊、新聞、市場脈動、追蹤清單 | `decisions/market-dashboard.md`、`spec/api-contract.md` 第 2A 節、`backlog/roadmap.md` |
| 配色、版面、視覺改版 | `architecture/diagrams/2026-10-27_視覺改版規劃.md`（＋同名樣稿 HTML） |
| 競品研究頁、報告頁 | `spec/web-spec.md` 第 9、11 節、`decisions/spec-stages.md`、`decisions/deviations.md` |
| 我的待辦、負責單位、麵包屑 | `decisions/tasks-owner-backnav.md` |
| 資料層、JSON、後端串接 | `spec/web-spec.md` 第 6–8 節、`spec/api-contract.md`、`progress/data-status.md` |
| 部署、套件、測試 | `guides/environment.md` |
| 規劃新方向、後端需求、恢復隱藏功能 | `backlog/roadmap.md`、`backlog/future-features.md`、`backlog/open-questions.md` |

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
architecture/    overview.md（現在的頁面、路由、資料流、程式目錄）；diagrams/（使用者的規劃圖，PDF＋.md 文字版；視覺改版規劃與樣稿 HTML）
decisions/       已確認的介面文字與實作規則：market-dashboard、tasks-owner-backnav、spec-stages、deviations
progress/        data-status.md（現有報告與資料問題）
backlog/         roadmap.md（未來架構與分階段計畫）、future-features.md（等資料才做、先隱藏的功能）、open-questions.md
guides/          collaboration.md（合作方式、導覽原則）、environment.md（環境、驗證方法）
examples/        JSON 範例；references/ 舊原型截圖，不必讀
```
