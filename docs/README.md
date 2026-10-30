# gocardifweb 文件入口（每個新對話只必讀本檔）

> 紀錄只寫**現況**與**未來架構**，不寫修改過程（過程看 `git log`）。內容過時就直接改掉或刪除，不要往下追加。

## 1. 現況

- 網站：https://hsinyuweng.github.io/gocardifweb/（repo `hsinyuweng/gocardifweb`，`main` push 後自動部署）
- 頁面：首頁「市場總覽」四框、新聞與法規監控 `#/news`、市場脈動 `#/market`（＋分頁 `#/market/:tab`）、追蹤清單 `#/watchlist`、競品研究 `#/research`、報告頁、我的待辦、使用說明（見 `architecture/overview.md`）
- 2026-10-20 新規劃：階段 1（導覽與競品研究）、2（追蹤清單）、3（新聞與法規監控；加入追蹤按鈕移到固定頂部列）、4（市場脈動：schema 2.0 草案、首頁 1–2 指標、`#/market` 五組）、5A（先讀後端新欄位：數值分數、完成時間、來源與可信度、品牌定位、未跑原因）已完成；2026-10-26 追蹤清單改為法規可行性、市場規模、市場成長三維度（S10 評分方法 1.0）
- 市場資料：`public/data/feed.json`（schema 1.2）、`public/data/market-pulse.json`（schema 2.1）是塗 2026-10-26 交付的第一份真實資料，後端更新時直接換檔；已知資料問題見 `progress/data-status.md`。示意資料仍在 `examples/`

## 2. 下一步

**2026-10-31 新資料待匯入**：後端整包輸出在 `agentdata/`（gitignore，原樣保留）；網站要用的已移到 `incoming/2026-10-30/`（8 份報告 3.json〔含分數與競品比較〕、feed 1.2 含 12 則法規、market-pulse 2.1 含健康度）。匯入方式 `npm run sync -- --from incoming/2026-10-30`，匯入前要先決定是否刪掉舊 9 份報告（見 `progress/data-status.md`）。這批資料讓 10-28「只用現有資料」的隱藏清單需要重新判斷。

**2026-10-28 待確認：只用現有資料改版**。規劃在 Claude Doc https://claude.ai/artifact/RmncqwTL79AdViGEmSGNAP（會刪掉什麼、網頁怎麼改、組員還要補什麼）；後端需求文件已同步（組員版總覽只剩 9 項、新增「暫停」段）。已決定：追蹤清單只比燈號、不算綜合分數；新聞頁改名「業界新聞」；沒資料的功能**畫面隱藏、程式保留**，設計全記在 `backlog/future-features.md`。使用者說「開始改」後才動程式；改完要同步更新本檔、`backlog/roadmap.md`、`decisions/market-dashboard.md`、`progress/data-status.md`。

**視覺改版已完成**（2026-10-27，V1–V5）。先讀 `architecture/diagrams/2026-10-27_視覺改版規劃.md`（第 11 節是實作決定），並用瀏覽器打開同資料夾的第 7 版樣稿 HTML。**V1、V2 已完成**（全站配色、白底導覽、每頁頁首與底色、首頁一句結論＋四框；市場脈動總覽＋分頁 `#/market/:tab`）。**V3 已完成**（報告頁「← 回…」與上一份／下一份、回清單保留捲動位置並標亮、新聞頁第一個畫面）。**V4 已完成**（追蹤清單比較表＋看重預設、報告頁照閱讀路徑重排）。**V5 已完成**（市場脈動總覽改重點指標卡＋指標表、分頁細節改指標表；新聞清單改日期膠囊＋依領域分組；規劃檔第 13 節）。**V6 已完成**（競品研究第一個畫面照閱讀路徑、使用說明更新、我的待辦從導覽收起、schema 2.2 寫進後端需求文件 M7；規劃檔第 14 節）。下一批待使用者決定。等塗交 schema 2.2（金額、同業排名、10 年債日資料）後加圖。

等後端的項目（剩餘階段在 `backlog/roadmap.md`）：**階段 5B**（競品比較表——已請組員提供跑過 `enrich_reports.py` 的完整報告、每日快照自動抓取、下一步對應待解決事項），要等後端交付範例；交付時先看後端需求文件的「交付紀錄」與 `format_variant`（連結在 `backlog/roadmap.md` 第 4 節）。

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
