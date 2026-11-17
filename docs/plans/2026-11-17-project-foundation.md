# gDownloader 專案基礎規劃

日期：2026-11-17。狀態：已建立並公開專案基礎；產品架構供實作前檢視，不是已完成的擴充套件。

## 目標與定位

使用者希望建立可長期延伸的開源下載專案，第一個產品是簡單、好看、好用的 Chrome 擴充套件，之後可增加其他能合法取得的檔案與媒體來源。

首要產品承諾是「可靠保存已完成的工作，清楚說明下載與存檔結果」。不以「所有影片皆可下載」作為產品承諾。星數不是可保證的交付項目；可改善的是安裝體驗、文件、可重現性、實際成功率、問題回報品質和貢獻成本。

## 本輪已確認的要求

- 本機專案位置：`~/gDownloader`。
- 產品以 Chrome extension 起步，維持 open source，讓社群可貢獻。
- 保留本次 HLS 實驗、研究與踩坑結果，作為可驗證依據。
- 架構需容納未來的一般下載能力，UI 要簡單、清楚且有一致視覺。

## 本輪提出的選擇

- 採 [ADR 0001](../decisions/0001-extension-first.md) 的第二方案：擴充套件先行、核心獨立的輕量 workspace。
- 建議技術：TypeScript、WXT、React、pnpm workspaces；Vitest 處理核心測試，Playwright bundled Chromium 處理擴充套件 E2E。實際版本在能力驗證後鎖定。
- 原創程式先採 MIT，第三方程式與媒體引擎另行審查授權。
- 公開 README 以英文為主，附繁體中文入口。UI 首批語系規劃英文與繁體中文。
- 依使用者指示以 `romanticamaj/gDownloader` 公開；[同名背景](../naming.md) 保留紀錄，本專案與其他同名工具無關。

以上技術、授權及 UX 是本次規劃的建議，不代表使用者已逐項選定所有實作細節。

## 專案結構

```text
gDownloader/
├── apps/
│   └── extension/              # WXT、Chrome 平台整合與產品畫面
│       ├── entrypoints/        # 未建立：background、sidepanel、offscreen、options
│       └── src/                # 未建立：features、platform、messaging、locales
├── packages/
│   ├── core/                   # 任務、狀態轉移、排程、重試、介面契約
│   ├── media/                  # 媒體辨認、HLS parser、軌道與組裝計畫
│   └── ui/                     # Tokens、基本元件與狀態呈現
├── experiments/
│   └── browser-hls/            # 已跑通的原型及 7 項測試，與產品隔離
├── tests/
│   └── fixtures/               # 規劃：可生成的合成資料與故障伺服器
├── docs/
│   ├── architecture.md
│   ├── roadmap.md
│   ├── decisions/
│   ├── plans/
│   ├── research/
│   ├── case-studies/
│   └── contributing/
├── .github/                    # Issue 與 PR 模板
├── README.md
├── README.zh-TW.md
├── DESIGN.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── AGENTS.md
└── LICENSE
```

現在實際建立的是文件、原型及責任目錄；`entrypoints`、`src`、正式 workspace manifests 與 CI 在實作階段建立，避免空架構被誤認為已支援功能。

## 第一版的使用流程

1. 使用者開啟頁面，點工具列圖示，側邊欄顯示「允許此網站」或可下載資源。
2. 列出資源名稱、格式／畫質、來源與可用大小；不能確定大小時明示未知。
3. 使用者選擇下載。需要另一個媒體主機權限時說明原因並由使用者授權。
4. 任務依序顯示下載、整理檔案、存入下載項目、完成。關閉側邊欄不停止任務。
5. 暫停、失敗或來源過期時，保存已提交的分段；只提供該後端確實支援的恢復動作。
6. 完成後可在下載資料夾顯示檔案。對一般使用者隱藏 OPFS、分檔數與 FFmpeg 等內部細節。

視覺與文字草圖見 [DESIGN.md](../../DESIGN.md)。這輪先定資訊與互動架構，實際可點 UI prototype 是下一階段。

## v0.1 支援範圍

- 一般 HTTP(S) 單檔，以 Chrome 原生下載後端起步。
- 未加密、已結束、單一複合音視訊 MPEG-TS 的 HLS VOD。
- 辨認不標準副檔名；使用者指定或窄範圍規則命中的來源可有限讀取內容確認 HLS。
- 預設並行 3 段，具備背壓、超時、有限重試、取消及磁碟檢查點。
- 正常重新開啟瀏覽器後可找回任務紀錄；來源仍有效才重試，過期則要求重新取得。
- 超過 2 GB 的磁碟合併與最終匯出，是發佈前必須實測通過的門檻。

暫不列入 v0.1：DASH、HLS fMP4、獨立多音軌／字幕、直播、WebRTC、任意程式插件、桌面 GUI、CLI、本機常駐引擎。它們保留在路線圖，不能提早出現在支援清單。

## 首個實作里程碑：能力驗證

正式搭建完整 UI 前，先用最小 MV3 extension 驗證：

- Service worker 重啟、side panel 關閉時，長任務與持久紀錄如何協調。
- Offscreen + worker + OPFS 可否在目前支援瀏覽器完成大檔寫入與磁碟合併。
- 最終 Chrome download 完成事件、物件網址 lease 與暫存清理的關係。
- 測試資料可在本機生成，並能刻意產生 403、429、斷線與磁碟錯誤。
- 外部請求失敗、頁面請求成功的情況如何明確呈現，不能把 host permission 當作保證。

若瀏覽器內合併／匯出無法通過大檔門檻，先比較小型 native companion 與不同的瀏覽器保存路線，再更新 ADR；不默默降級成整部影片建立記憶體 Blob。

## 開源與維護

- 提供真正能重現的安裝步驟、合成 demo 和限制說明，不放尚不存在的商店連結或 CI badges。
- 每個能力用 supported inputs、介面、fixtures、錯誤與恢復行為描述，降低新貢獻者上下文成本。
- PR 品質門檻、測試與社群文件由 [CONTRIBUTING.md](../../CONTRIBUTING.md) 定義。
- Owner 為 `romanticamaj`，已啟用 GitHub 私密漏洞回報；專用行為準則私密聯絡方式與商店發佈身分仍待設定。
- 社群治理先用單一 maintainer review；有實際共同維護者後再加入 CODEOWNERS 與權限分工。

## 下一步與尚待決定

1. 檢視本提案的產品範圍；專案基礎已依指示採 MIT 公開。
2. 撰寫第一個能力驗證的實作計畫，再建立正式 workspace、測試環境與 CI。
3. 能力門檻通過後，製作側邊欄 UI prototype 與第一個端到端可用版本。

GitHub repository 已建立為 `romanticamaj/gDownloader`，並配置原型與文件 CI。尚無商店項目、npm scope、產品版本或套件發布流程。
