# 我的待辦、我的單位、返回路徑（第 3 層）

> 規格以外的功能。改動負責單位、我的待辦、麵包屑、瀏覽器存放的偏好時參考。
> 由舊的 `docs/project-status.md` 拆出（2026-10-20），內容照原樣保留；有新決定就加在對應的段落。

## 規格外功能 A「我的待辦」（2026-10-18 已確認並實作；✅ 已 push 8747f7d）
- 新頁面 `#/tasks?owner=<單位>`：跨 9 份報告彙整某負責單位的待解決事項（blockers）與建議下一步（next_steps）。讀 index 後同時讀全部報告；部分讀取失敗時其餘照常顯示並註明。
- 使用者已選：**依商品分組**（每件商品一塊：名稱連到報告頁並帶 `?owner=`、該單位的待解決事項表、建議下一步）；**未選單位或選「全部」時提示先選單位**，顯示各單位件數按鈕；**導覽列「案件總覽」下方新增「我的待辦」**（修改規格第 10.1 節，經使用者同意）。
- 負責單位與報告頁共用 localStorage 記憶；沿用列印；「上游（顏）」與「上游」照原樣分開顯示。
- 確認文字：導覽列／標題／麵包屑「我的待辦」／請選擇負責單位，查看各商品需要處理的事項。／單位按鈕「法遵 85」（件數＝待解決＋下一步，多到少）／摘要「待解決事項 N（**重大** N）· 建議下一步 N · 涉及 N 件商品」（使用者選「重大」，與首頁及 legend.severity 一致）／商品標題「名稱（發行公司）」＋「看報告 →」（帶 `?owner=`）／區內沿用報告頁小標與欄位，某類無項目顯示「無」／此負責單位沒有相關項目。／有 N 份報告無法讀取，以下內容不包含：○○、○○。／列印標題旁「篩選：負責單位＝○○」。
- 排序：商品依重大件數多到少，同數依案件總覽預設順序（產出日期新到舊）；缺 report_id 的清單列略過；完全沒有報告時沿用首頁「目前沒有報告」。
- 檔案：新增 `src/pages/TasksPage.tsx`、`src/components/tasks/`（OwnerPicker、TaskGroupCard）、`src/lib/tasks.ts`；修改 `main.tsx`（路由）、`Sidebar.tsx`（導覽項目）、`zh-TW.ts`（`nav.tasks`、`tasks`）、`viewModel.ts`（`BlockerViewModel.severityKey`、`OwnerCount`／`TaskProductGroup`／`TaskSummary`）、`normalize.ts`（填 severityKey）、README 專案結構。重用報告頁的 `OwnerFilter`、`BlockersTable`、`NextStepsList`（未修改）。
- Claude 驗證：真實資料彙整（法遵 54＋31＝85，與統計一致）；headless Chrome 390／1440px 無整頁橫向捲動。

## 返回路徑修正與「我的單位」（2026-10-18 已確認並實作；✅ 已 push f6c540b、0f4f28a）
- 返回路徑（依 `guides/collaboration.md` 的導覽原則）：
  1. 首頁搜尋、篩選、排序寫入網址（`q`、`country`、`category`、`rec`（缺漏建議為 `__missing__`）、`sort`、`dir`；預設值不寫；用 replace 不新增紀錄）。進報告頁時以 `location.state.from` 帶上來源網址，麵包屑「案件總覽」回到原狀態，瀏覽器上一頁也恢復。
  2. 從我的待辦進報告頁：麵包屑「我的待辦 / 商品名稱」，回到同一單位（`state.from`）；報告頁切換單位時保留 state。
  3. 我的待辦：點單位按鈕**新增**瀏覽紀錄（上一頁回選單位畫面）；下拉切換用 replace；摘要旁「← 所有單位」連到 `#/tasks?owner=`。
  4. 報告頁 E 區分頁列右側「↑ 回到三面向」，捲回 C 區。
- 「我的單位」（使用者選方案乙；丙「真正的個人待辦」需後端登入，長期項目）：導覽列底部「我的單位：法遵 更改」／未設定時「我的單位：未設定 設定」；按下後變下拉（第一項「未設定」）＋「取消」。選項為全部報告的負責單位（依件數）。
- **D7 調整（使用者確認）**：localStorage（沿用 key `gocardifweb.owner`）改存「我的單位」，**只有導覽列設定會改**；報告頁與我的待辦的下拉只改網址。預設順序：網址 → 我的單位 → 全部。網址 `?owner=`（空值）表示明確選「全部」，不套用我的單位；報告頁選「全部」也寫成 `?owner=`。
- 架構：全部報告改由 `RootLayout` 在需要時讀一次（`src/data/allReports.ts` 的 `loadAllReports`，經 Outlet context 的 `useAllReports()` 給我的待辦，並提供導覽列選項）；`lib/ownerPreference.ts` 改為可訂閱（`useSyncExternalStore`，含跨分頁 storage 事件）；新增 `lib/ownerParam.ts`。
- 修改既有頁面（第 11.1 節例外，使用者同意）：OverviewPage、ReportPage、ReportView、DetailTabs、Sidebar、AppShell、RootLayout、pageChrome、overviewFilter。
- Claude 驗證：headless Chrome 實際點擊五條路線（首頁篩選→報告→返回／麵包屑；待辦選單位→上一頁；所有單位→上一頁；待辦→報告→切換單位→麵包屑；看詳細內容→回到三面向；設定、取消我的單位後兩頁預設）全部符合預期。
