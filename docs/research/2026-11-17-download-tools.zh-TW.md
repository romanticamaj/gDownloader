> Historical research snapshot, 2026-11-17. Product features mentioned below belong to the compared tools or the reference experiment, not a shipped gDownloader extension.

# Blob 影片下載流程與現有工具研究

查證日期：2026-11-17。以下區分本次實測、官方文件、原始碼檢查與尚未驗證項目。這次沒有安裝新擴充套件，也沒有重新下載整部影片。

## 結論

已有現成工具做媒體偵測、分段下載與合併。適合先比較猫抓、Video DownloadHelper 和開源 HLS Downloader；需要終端機自動化時再搭配 N_m3u8DL-RE 或 yt-dlp。沒有一個工具能因為看到 `blob:` 就保證下載任意影片。

`blob:` 是物件網址，可能指向完整 Blob，也可能指向 MediaSource。它不是一種影片格式，也不能從 UUID 算出伺服器原始網址。[MDN](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/blob)

## 可複製的流程

1. 播放影片，確認真正的播放器在主頁或哪個 iframe。
2. 偵測實際媒體請求，辨認內容，而非只看副檔名。本次是 `.txt` 內的 HLS 與 `.png` 內的 MPEG-TS。
3. 區分完整 MP4/WebM、HLS、DASH、即時媒體、DRM。一般有效 Blob 可以在來源環境讀取；MediaSource 要往回找資料來源。DRM 不能套用一般分段合併方法。[Blob 文件](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/blob)、[EME 文件](https://developer.mozilla.org/en-US/docs/Web/API/Encrypted_Media_Extensions_API)
4. 先讀清單與少量分段測試。若終端機 403、瀏覽器 200，優先測瀏覽器內下載路徑；headers、Cookie、短效簽名及請求環境均可能相關，不能僅憑 403 判定原因。
5. 使用有限並行、分段落盤、重試與完成紀錄。簽名過期需要重新取得來源；保留舊分段不等於所有工具都能自動接上新簽名。
6. 按容器與軌道合併。連續 MPEG-TS、帶初始化段的 fMP4、獨立音視訊、時間軸 discontinuity 要分別處理。不能把任意分段都直接二進位串接。[FFmpeg concat protocol](https://ffmpeg.org/ffmpeg-protocols.html#concat)
7. 核對段數、大小、時長與音視訊軌；再抽查解碼。成功匯出檔案不代表內容必然完整。

## 工具比較

| 工具 | 已查證的能力 | 對這次需求的限制 |
|---|---|---|
| [猫抓 / Cat Catch](https://github.com/xifangczy/cat-catch) | Chrome 擴充套件；可自訂 URL 規則、手動輸入 HLS 內容或網址，有並行與「邊下邊存」；可對接本機工具 | 一般合併模式仍可能耗用大量 RAM。這個網站是否能完整下載，未安裝實測 |
| [Video DownloadHelper](https://downloadhelper.net/) | 現成 Chrome/Firefox/Edge 介面，官方列出 HLS/DASH 支援；V10 不再需要 CoApp，能利用瀏覽器 Cookie、headers 和 cache | 非開源下載核心的程式碼研究對象；免費版進階下載有額度，特定大檔案及過期恢復仍需實測 |
| [puemos/hls-downloader](https://github.com/puemos/hls-downloader) | 開源 HLS 擴充套件；確認 OPFS 分段儲存、有限並行、FFmpeg WASM 磁碟輸入／輸出路徑 | Chrome 版目前依官方說明手動載入 MV3 ZIP；v5.6.0 的自動偵測不匹配本次 `.txt + text/plain` |
| [N_m3u8DL-RE](https://github.com/nilaoda/N_m3u8DL-RE) | 本機 HLS/DASH/MSS 工具；明確提供並行、分段重試、暫存目錄、HTTP headers、分段數檢查與合併選項 | 需要先取得實際來源；不會自動繼承目前網頁的全部請求條件，也不保證能處理本次的 403 |
| [yt-dlp](https://github.com/yt-dlp/yt-dlp) | 網站抽取器及 HLS/DASH 下載；`-N 3` 可並行下載分段，另有重試與續傳選項 | 本次來源終端機已實測 403；調高並行不會解決存取失敗 |

### 猫抓：最值得先測的開源 Chrome 選項

官方文件明確提供自訂正則與後置副檔名，可針對這次的 `/playlist.txt`、`/index.txt` 設定窄範圍 URL 規則並標為 m3u8，再進解析器；這是依文件提出的設定建議，尚未安裝驗證此網站。

大檔應選「邊下邊存」，再以本機 FFmpeg 處理。普通記憶體合併與線上 FFmpeg 是不同路徑，不能因為裝了擴充套件就假設不會碰到大檔記憶體問題。其線上 FFmpeg 文件目前另列大小限制，不能推廣成所有 ffmpeg.wasm 都有相同上限。[設定文件](https://cat-catch.94cat.com/docs/settings)、[M3U8 文件](https://cat-catch.94cat.com/docs/m3u8parse)

安裝入口以專案連出的 [官方 Chrome 商店](https://chromewebstore.google.com/detail/cat-catch/jfedfbgedapdagkghmgibemcoggfppbb) 為準。查證時商店列出 2.7.4，更新日期 2026-10-26。

### HLS Downloader：架構最接近，但偵測仍有限制

確認過 `OPFSBucket` 與 `disk-mux-worker.ts`：片段以 File 物件掛入 WORKERFS，concatf 作為連續輸入，輸出寫入可 seek 的 OPFS 檔案。這與本次避免整部影片塞進 RAM 的方向一致。舊 IndexedDB 任務仍有完整 Blob 的相容路徑。[儲存與合併原始碼](https://github.com/puemos/hls-downloader/blob/21ba8008a545843b9b34ff709614133873dc59a7/src/background/src/workers/disk-mux-worker.ts)

對 v5.6.0 的 `isHlsResponse` 真實函式只移除型別後執行，三個案例全部符合預期：

| URL / MIME | 判斷結果 |
|---|---|
| playlist.txt + text/plain | false |
| playlist.m3u8 + text/plain | true |
| playlist.txt + application/vnd.apple.mpegurl | true |

因此不能說它開箱即可偵測本次來源。這只驗證辨識函式，不代表已安裝擴充套件測完端到端流程。[版本固定的原始碼](https://github.com/puemos/hls-downloader/blob/v5.6.0/src/core/src/use-cases/is-hls-response.ts)

Chrome 安裝依官方 README 的 MV3 ZIP 解壓載入步驟，勿把商店中的任意同名套件當成此專案。[安裝文件](https://github.com/puemos/hls-downloader#chrome)、[v5.6.0 release](https://github.com/puemos/hls-downloader/releases/tag/v5.6.0)

### Video DownloadHelper：操作方便，但注意目前版本與免費額度

V10 文件確認不再需要 Companion App，且能利用瀏覽器 cache/Cookie/headers。Chrome 商店的正確入口由官網連出。[V10 說明](https://help.downloadhelper.net/article/21-about-v10)、[Chrome 商店](https://chromewebstore.google.com/detail/video-download-helper/lmjnegcaeklhafolokijcfjliaokphfk)

免費版普通單檔下載不限次；進階串流下載目前是初始 3 次，之後每兩小時 1 次。沒有採用舊版 QR 浮水印或 CoApp 教學作為現在的結論。[免費限制](https://help.downloadhelper.net/article/29-non-premium-restrictions)

其官方亦明確不支援破解 DRM，因此「任何影片」不是可承諾範圍。[DRM 說明](https://help.downloadhelper.net/article/14-what-can-i-do-if-the-video-is-protected-by-drm)

## 建議採用順序

- 想維持開源、Chrome 圖形操作並處理這次的非標準名稱：先測猫抓，必要時加窄範圍規則，使用邊下邊存。
- 想先試最少操作的現成介面：測 Video DownloadHelper V10，確認免費額度是否符合用量。
- 想研究或改造架構：參考 HLS Downloader 的 OPFS、offscreen/worker、佇列與磁碟合併；需額外處理內容辨識與特定請求環境。
- 真正來源可由外部 HTTP 客戶端讀取時：交給 N_m3u8DL-RE 或 yt-dlp；否則保留本次已跑通的瀏覽器分段路線。

若日後封裝成自己的工具，建議拆成「偵測器 → 協定／軌道解析 → 下載任務與落盤 → 容器合併 → 完整性驗證」。可重用整個流程，但每個網站是否可存取、每種媒體如何組裝仍需要分類。

## 本次手寫工具能直接重用的範圍

現有 downloader.js 支援已結束、未加密、無 MAP/BYTERANGE/DISCONTINUITY 等複雜標籤的 MPEG-TS HLS，來源偵測仍包含本次 playlist.txt 的規則。它不是任意 Blob／任意 DASH 下載器。

本次已完整跑通：2,124 段 → 89 個磁碟分檔 → 本機 MP4。第一次 concat demuxer 合併增加約 8 秒；改成連續 TS concat protocol 後影片時長與清單一致。這個修正也不能直接套到任意 fMP4 或音視訊分離來源。
