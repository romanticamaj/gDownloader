# gDownloader

以瀏覽器為起點，重視下載進度保存與可靠存檔的下載管理工具。

**目前處於早期開發階段。** 已保留可執行的 HLS 原型與擴充套件設計；Chrome 擴充套件尚未實作，還不能安裝。

[English](README.md) · [專案規劃](docs/plans/2026-11-17-project-foundation.md) · [架構](docs/architecture.md) · [開發路線](docs/roadmap.md) · [Agent 工作流程](docs/contributing/agent-workflow.md)

## 產品方向

第一階段先做好 Chrome 擴充套件：找出可下載資源、管理任務、保留已完成分段，並確認最後確實存檔。之後以協定與傳輸介面擴充其他下載能力。

首版規劃支援一般 HTTP(S) 檔案，以及明確界定的未加密 HLS 點播子集。支援更多來源是長期方向，不承諾任意 Blob、所有網站或 DRM 影片皆可下載。

這次已完整跑通 2,124 個分段的磁碟下載與 MP4 匯出，經驗整理在[匿名案例](docs/case-studies/001-browser-hls.md)。公開專案不包含該影片、網站識別碼或短效簽名網址。

## 資料夾

| 位置 | 責任 | 目前狀態 |
|---|---|---|
| `apps/extension` | Chrome API、側邊欄、背景協調與平台介面 | 規劃 |
| `packages/core` | 任務狀態、排程、重試與完成條件 | 規劃 |
| `packages/media` | 媒體判斷、清單解析與組裝計畫 | 規劃 |
| `packages/ui` | 設計 tokens、共用 UI 與無障礙元件 | 規劃 |
| `experiments/browser-hls` | 已跑通的研究原型與測試 | 可執行，尚非產品 |
| `docs` | 架構、研究、決策、貢獻與發佈規劃 | 已建立 |

## 現在可以驗證的項目

使用 Node.js 22 以上版本：

```sh
git clone https://github.com/romanticamaj/gDownloader.git
cd gDownloader
node --test experiments/browser-hls/downloader.test.cjs
python3 scripts/check_repository.py
```

這是原型的回歸測試，不代表 Chrome 擴充套件已有可安裝版本。原型操作與限制見[說明](experiments/browser-hls/README.md)。[CI](.github/workflows/ci.yml) 會在 Linux/macOS、Node.js 22/24 執行原型測試，並檢查文件連結與 agent harness。

## Agent harness

[AGENTS.md](AGENTS.md) 是共用的專案規則；[CLAUDE.md](CLAUDE.md) 透過 `@AGENTS.md` 匯入同一份內容，供 Codex 與 Claude 使用。規則包含架構邊界、實際可執行的驗證命令、研究原型與正式產品的區別，不依賴個人電腦上的插件。

## 開源協作

原創程式採 [MIT](LICENSE)。歡迎透過 [CONTRIBUTING.md](CONTRIBUTING.md) 提供可重現案例、測試、UI 改善及下載介面。下載紀錄、Cookie、簽名網址與第三方媒體請保留在本機。

本專案與其他同名下載工具無關，背景見[命名紀錄](docs/naming.md)。
