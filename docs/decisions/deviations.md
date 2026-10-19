# 與規格不同、或規格沒寫的實作（第 3 層）

> 都經過使用者確認。改到相關程式前先看，避免「依規格修正」反而改壞。
> 由舊的 `docs/project-status.md` 拆出（2026-10-20），內容照原樣保留；有新決定就加在對應的段落。

- `src/components/overview/`：首頁子元件資料夾（規格第 5 節未列）。
- 清單項目缺 `report_id` 時該列仍顯示但不可點擊（`OverviewRow.reportId` 可為 null）。
- 報告清單由 `pages/RootLayout.tsx` 讀一次，經 Outlet context 給首頁與報告頁（導覽列也需要 generated_at）。
- 畫面資料欄位 `moduleCards`（原 `scorecards`），避免驗收第 11 點文字搜尋 `scorecard` 誤判；`KeyPointList` 註解避免出現 `key_points`。
- 負責單位從「我的單位」（localStorage）取得時也同步寫進網址（`replace`，不新增瀏覽紀錄）。2026-10-18 起 localStorage 只存導覽列設定的我的單位（見第 5 節）。
- 法規燈號篩選選項：legend.light 各值；legend 缺漏時改用 findings 中出現的值。
- `DataSourceError` 新增 `status`（HTTP 狀態碼）與第五種 kind `config_error`（規格第 6.1 節只列四種；階段 4 計畫中說明並經確認）。4xx（非 404）歸為 `server` 但帶 status，**只有 network 與 5xx 觸發離線備援**。
- 離線狀態用 `src/data/connectionStatus.ts` 的訂閱，RootLayout 以 `useSyncExternalStore` 讀取；後端成功讀取時清除離線標記。
- RWD 斷點用 Tailwind `lg`（≥1024px 顯示側邊導覽）；C 區三欄 `lg` 以下改單欄，列印時強制三欄（`print:grid-cols-3`）；D 區兩欄在 `xl`（≥1280px）。
- **RWD 修正（2026-10-18）**：使用者回報窄螢幕沒有 RWD。原因：報告頁 D 區與 C 區的 grid 沒有指定欄寬，隱含欄寬被表格 `min-w-[720px]` 撐開，造成整頁橫向捲動、表格框內捲動失效。修正：`ReportView` D 區加 `grid-cols-1`、兩個子欄加 `min-w-0`；`ScorecardRow` 加 `grid-cols-1`；首頁 `RecommendationBar` 按鈕加 `shrink-0 whitespace-nowrap`（窄螢幕時整列橫向捲動、不擠扁）。Claude 用 headless Chrome 裝置模擬驗證 390／768／1440px：三頁 `scrollWidth` 等於畫面寬度。
- Claude 的截圖驗證方法：`npx vite preview --port 4173` 後，以 Chrome `--remote-debugging-port` ＋ Node 內建 WebSocket 呼叫 `Emulation.setDeviceMetricsOverride`（`--window-size` 在無頭模式下最小寬度約 500px，iframe 內資料不會載入，皆不可靠）。
- 規格文件本身的修改：只有網址 lsjle → hsinyuweng（三處）。

## 用詞比對（2026-10-18）

- 使用者貼了一份網站架構摘要（導覽列＋報告頁 A–F），與現有實作一致；用詞維持規格：「負責單位」（非「部門」）、「資料品質」（非「資料品質警示」）。
