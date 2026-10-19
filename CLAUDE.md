# gocardifweb 專案說明（Claude Code 每次啟動自動讀取）

## 必讀文件
- **每個新對話先讀 `docs/README.md`**（文件入口），裡面有目前進度、下一步、資料夾結構。依它告訴我目前進度與下一步。
- 其他文件**依改動範圍**讀（`docs/README.md` 第 3 節的對照表），不用每次全部讀完。
- 正式規格：`docs/spec/web-spec.md`（唯一依據；第 0 節規則優先於一切）、`docs/spec/api-contract.md`；報告範例：`docs/examples/summarizer-example-report.json`。
- 我提供的架構圖、示意圖放在 `docs/architecture/diagrams/`。

**紀錄規則**：對網頁本身或整體設計的任何更動，都要直接寫進 `docs/` 的紀錄檔，依改動大小更新（`docs/README.md` 第 4 節），不能只留在對話裡。規格與我在對話中的口頭指示衝突時，先停下來問我，不要自行選擇。

## 與我合作的方式
- 我是網頁開發新手，有基本程式基礎。請用繁體中文溝通。
- 每完成一個階段，用三到五句話說明：做了什麼、改了哪些檔案、我要怎麼驗證。
- 除了上述說明，凡是需要我另外操作或確認的事（例如安裝軟體、執行指令、修改設定、在瀏覽器檢查畫面、回覆選擇），都要另外列成編號步驟，寫清楚要在哪裡做、輸入什麼、預期看到什麼。
- 要我執行指令時，一律註明在哪個應用程式（例如 VS Code 的終端機）、哪個資料夾（寫完整路徑，並先給 `cd` 指令）執行。git 指令必須在 `gocardifweb` 資料夾內執行。
- 修改前先說明要改什麼、為什麼。不要為了讓錯誤消失而放寬型別、刪除功能或寫死數值；如果只能繞過問題，請明說。
- 每個階段完成且我驗證通過後，提醒我 commit，並建議 commit 訊息。
- 需要安裝規格以外的套件、或規格沒寫清楚時，先問我。

## 常用指令
- `npm run dev`：本機開發
- `npm run sync`：匯入 `incoming/` 的報告
- `npm run mock-api`：本機模擬後端
- `npm run build`：建置

## 環境提醒（給 Claude）
- Claude 的 Bash 環境沒有 `/opt/homebrew/bin`，執行 node／npm 前先 `export PATH="/opt/homebrew/bin:$PATH"`。
- git 指令只在本資料夾內執行（家目錄原本誤設的 repo 已於 2026-10-18 移除）。
- 我會 commit 並 push 每個階段；commit 前提醒我確認 `public/config.json` 是 static 模式。
