# 規格階段 1–5 的決定與介面文字（第 3 層）

> 規格第 18 節的五個階段。改動案件總覽、報告頁、使用說明、部署時參考。
> 由舊的 `docs/project-status.md` 拆出（2026-10-20），內容照原樣保留；有新決定就加在對應的段落。

## 階段 1–5 已確認的決定

### 階段 1
- Node 用 Homebrew 安裝；不用 `npm create vite`，手寫設定檔；移除 ESLint。
- 報告頁、使用說明頁在尚未實作時註冊路由並顯示「此頁面將於後續階段完成。」（現已全部實作）。
- `generated_at` 顯示為台北時間到分鐘：`2026-10-11 16:00`。
- 確認的介面文字：載入中…／無法讀取資料，請確認網路連線後重新整理頁面。／找不到報告清單。請先執行 npm run sync 匯入報告。／資料格式錯誤，無法顯示。（下一行小字細節）／伺服器發生錯誤，請稍後再試。／沒有符合條件的案件。／搜尋商品名稱或發行公司、全部國家、全部險種／導覽列底部「資料更新：…」「資料來源：離線資料｜後端連線」／找不到此頁面。＋「回到案件總覽」／建議分布列的「全部」不加件數。
- sync 遇到壞掉的 JSON 或缺 report_id：略過並警告，不中止整批；report_id 含 `/`、`\`、`..` 或為 `index` 也略過；同批 report_id 重複則整批中止、不複製任何檔案。

### 階段 2
- 法規燈號分布條在階段 2 做（C 區用到）；「看詳細內容」連結延到階段 3。
- C 區燈號旁文字與首頁一致：市場需求→需求等級標籤、發生率暨獲利→研究狀態標籤、法規→overall_verdict；下方指標不重複顯示該項。
- 確認文字：產出日期 2026-10-11／審閱日期：市場需求 … · …／判定理由／流程列「✓ 完成」、部門審查灰色附「規劃中」／法規欄分布條不另加標題／未提供（原始值：missing）／負責單位／此負責單位沒有相關項目。／下一步編號用 priority 原值（篩選後保留）／下一步第二行「負責單位：… · 來源面向：…」／疑似輸入錯誤／收合區小標題：資料衝突、證據不一致、缺漏欄位、備註／資料品質全空顯示「無」／網址或記憶的負責單位不在選項內時視為「全部」、網址不變／列印／另存 PDF。

### 階段 3
- 列印時若已選負責單位：印篩選後內容，標題旁印「篩選：負責單位＝○○」；選「全部」不印註明。
- 市場規模區間條刻度從 0 到高估；低到高塗色、中估標點；任一值 null 改純文字。
- 頁尾加「免責聲明」標題（使用者確認要加）。
- 確認文字：摘要／估算方法、目標人口、市場規模估計、信心等級／低估、中估、高估／關鍵發現／來源：…（null 顯示「來源：—」）／定價提示：項目、方向、來源數／findings 欄名：編號、項目、燈號、法規依據、建議措施、負責單位／燈號篩選顯示件數（「全部 19」「待補 7」）／此燈號沒有項目。／篩選：負責單位＝○○／disclaimer null 顯示「—」。
- 使用者確認報告資料**可以公開**（已 commit 9 份報告）。

### 階段 4
- 確認文字：設定錯誤：config.json 的 dataSource 為 api，但 apiBaseUrl 是空的。／後端回 400：「請求格式錯誤，無法取得資料。」＋後端 message，**不**觸發離線備援／選單按鈕 aria-label：開啟選單、關閉選單／使用說明頁標題「使用說明」／使用說明核心問題表欄名「面向／核心問題」，面向名稱用首頁欄名（市場需求、發生率暨獲利、法規適用）／mock-api 未定義路徑回 404 `NOT_FOUND`。

### 階段 5（已確認並實作）
- 使用者決定：GitHub repo 改為**公開**（免費帳號 Pages 需公開 repo；docs/、project-status.md 也會公開）；GitHub Actions 用 **Node 24 LTS**。
- 實作：`.github/workflows/deploy.yml`（push main 與手動觸發 → npm ci → npm run build → 發布 dist/）、繁中 README（網址、本機開發、首次部署設定、新增報告、切換資料來源、mock-api、專案結構、未來規劃）、`vite.config.ts` 註解 lsjle → hsinyuweng。

## 部署驗證步驟（✅ 2026-10-18 使用者已全部完成，留作日後重新部署參考）

（階段 4 已驗證並 push；RWD 修正與階段 5 一起 commit。）
1. 瀏覽器檢查 RWD 修正：`npm run dev`，Chrome 開發者工具手機模式 768／390px，報告頁「待解決事項」只在框內橫向捲動、整頁不左右晃；首頁建議按鈕不被擠扁。
2. GitHub repo → Settings → General → 最下方 Danger Zone → Change visibility → Public。
3. Settings → Pages → Build and deployment → Source 選「GitHub Actions」。
4. 在 `gocardifweb` 資料夾 `git status` 確認 `public/config.json` 不在變更清單，然後 `git add -A`、`git commit -m "feat: 階段5 GitHub Actions 部署與 README；修正窄螢幕 RWD"`、`git push`。
5. repo 的 Actions 分頁：「Deploy to GitHub Pages」build、deploy 兩個 job 都是綠色勾勾。
6. 驗收第 13 點：開 `https://hsinyuweng.github.io/gocardifweb/`，點進一份報告後按重新整理不會 404；開發者工具 Console 沒有紅色錯誤。
- 技術註記：CI 用 Node 24；react-router 8.4 要求 Node ≥ 22.22，vite 8 要求 ^20.19 或 ≥22.12。Claude 已在 scratchpad 以同一份 package-lock 跑 `npm ci` 成功、`npm run build` 通過。
