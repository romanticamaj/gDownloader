/* Paste this whole file into the standalone player's Console. No external libraries. */
(function () {
  'use strict';

  const lines = text => text.trim().split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const uris = text => lines(text).filter(s => !s.startsWith('#'));
  const check = signal => signal?.throwIfAborted();

  function getPageIdentity(page, videoId) {
    if (typeof videoId !== 'string' || !videoId.trim()) {
      throw new Error('No stable video identity; this prototype requires data-video-id');
    }
    return JSON.stringify({ origin: page.origin, videoId: videoId.trim() });
  }

  async function writeText(directory, name, text) {
    const handle = await directory.getFileHandle(name, { create: true });
    const writer = await handle.createWritable();
    try { await writer.write(text); await writer.close(); }
    catch (error) { await writer.abort().catch(() => {}); throw error; }
  }

  async function run({ directory, manifestUrl, mediaId, signal, onProgress = () => {},
    concurrency = 3, groupSize = 24, retries = 3, retryDelayMs = 1000,
    timeoutMs = 45000, fetchImpl = globalThis.fetch }) {
    if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 6 ||
        !Number.isInteger(groupSize) || groupSize < 1) throw new Error('Invalid concurrency/group size');
    if (!mediaId) throw new Error('Missing video identity');
    check(signal);

    async function request(url, mode) {
      for (let attempt = 0; ; attempt++) {
        check(signal);
        try {
          const timeout = AbortSignal.timeout(timeoutMs);
          const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
          const response = await fetchImpl(url, { signal: combined });
          if (!response.ok) {
            const error = new Error('HTTP ' + response.status);
            error.status = response.status;
            await response.body?.cancel();
            throw error;
          }
          if (mode === 'text') return await response.text();
          // Bound each segment as well as the number of simultaneously held segments.
          const reader = response.body.getReader();
          const parts = [];
          let size = 0;
          try {
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              size += value.byteLength;
              if (size > 32 * 1024 * 1024) throw new Error('Segment exceeds 32 MB');
              parts.push(value);
            }
          } catch (error) { await reader.cancel().catch(() => {}); throw error; }
          const bytes = new Uint8Array(size);
          let offset = 0;
          for (const part of parts) { bytes.set(part, offset); offset += part.byteLength; }
          if (!size || size % 188 || bytes[0] !== 0x47 ||
              (size > 188 && bytes[188] !== 0x47)) {
            throw new Error('Segment is not supported MPEG-TS data');
          }
          return bytes;
        } catch (error) {
          check(signal);
          // A signed URL that is rejected needs refreshing, not repeated requests.
          if ((error.status && error.status !== 408 && error.status !== 429 && error.status < 500) ||
              /not supported|exceeds/.test(error.message) || attempt >= retries - 1) throw error;
          await new Promise((resolve, reject) => {
            const finish = () => { signal?.removeEventListener('abort', abort); resolve(); };
            const timer = setTimeout(finish, retryDelayMs * (attempt + 1));
            function abort() { clearTimeout(timer); signal?.removeEventListener('abort', abort); reject(signal.reason); }
            signal?.addEventListener('abort', abort, { once: true });
            if (signal?.aborted) abort();
          });
        }
      }
    }

    let url = manifestUrl;
    let text = await request(url, 'text');
    if (!text.trimStart().startsWith('#EXTM3U')) throw new Error('Not an HLS playlist');
    if (/#EXT-X-(MEDIA|SESSION-KEY):/.test(text)) throw new Error('Separate audio/subtitles or session keys need another tool');
    if (text.includes('#EXT-X-STREAM-INF')) {
      const list = lines(text);
      const variants = [];
      for (let i = 0; i < list.length; i++) {
        if (!list[i].startsWith('#EXT-X-STREAM-INF:')) continue;
        const next = list[i + 1];
        if (!next || next.startsWith('#')) throw new Error('Invalid variant playlist');
        variants.push({ uri: next, bandwidth: Number(list[i].match(/(?:[:,])BANDWIDTH=(\d+)/)?.[1] || 0) });
      }
      variants.sort((a, b) => b.bandwidth - a.bandwidth);
      if (!variants.length) throw new Error('No variants');
      url = new URL(variants[0].uri, url).href;
      text = await request(url, 'text');
    }
    if (!text.trimStart().startsWith('#EXTM3U')) throw new Error('Invalid media playlist');
    const unsupported = text.match(/#EXT-X-(KEY|MAP|BYTERANGE|DISCONTINUITY|GAP|MEDIA|I-FRAMES-ONLY)(?=[:\r\n]|$)/);
    if (unsupported) throw new Error('Unsupported HLS tag: ' + unsupported[1]);
    if (!text.includes('#EXT-X-ENDLIST')) throw new Error('Only completed VOD playlists are supported');
    const segmentUrls = uris(text).map(uri => new URL(uri, url).href);
    if (!segmentUrls.length) throw new Error('Empty media playlist');

    // Ignore expiring hosts/path prefixes, retain order, durations and media identity.
    const canonical = lines(text).filter(l => !l.startsWith('#EXT-X-TOKEN')).map(l =>
      l.startsWith('#') ? l : new URL(l, url).pathname.split('/').slice(-2).join('/')).join('\n');
    const fingerprint = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',
      new TextEncoder().encode(mediaId + '\n' + canonical))), b => b.toString(16).padStart(2, '0')).join('');
    const folder = 'hls-' + fingerprint.slice(0, 16);
    const output = await directory.getDirectoryHandle(folder, { create: true });
    let state = { schema: 1, fingerprint, groupSize, segmentCount: segmentUrls.length, completed: {} };
    try {
      const handle = await output.getFileHandle('progress.json');
      state = JSON.parse(await (await handle.getFile()).text());
      if (state.schema !== 1 || state.fingerprint !== fingerprint || state.groupSize !== groupSize ||
          state.segmentCount !== segmentUrls.length || !state.completed) throw new Error('Checkpoint does not match');
    } catch (error) { if (error.name !== 'NotFoundError') throw error; }

    let completedSegments = 0, savedBytes = 0, sessionBytes = 0;
    const started = performance.now();
    const partName = group => 'part-' + String(group + 1).padStart(5, '0') + '.ts';
    const groups = Math.ceil(segmentUrls.length / groupSize);
    const emit = (phase, temporary = 0) => onProgress({ phase, folder, completedSegments,
      totalSegments: segmentUrls.length, savedBytes, currentPartSegments: temporary,
      bytesPerSecond: sessionBytes / Math.max((performance.now() - started) / 1000, 0.001) });

    for (let group = 0; group < groups; group++) {
      check(signal);
      const start = group * groupSize;
      const end = Math.min(start + groupSize, segmentUrls.length);
      const name = partName(group);
      let valid = false;
      if (state.completed[group]?.bytes > 0) {
        try {
          const handle = await output.getFileHandle(name);
          valid = (await handle.getFile()).size === state.completed[group].bytes;
        } catch (error) { if (error.name !== 'NotFoundError') throw error; }
      }
      if (valid) {
        completedSegments += end - start;
        savedBytes += state.completed[group].bytes;
        emit('resumed');
        continue;
      }
      delete state.completed[group];
      const handle = await output.getFileHandle(name, { create: true });
      const writer = await handle.createWritable();
      let partBytes = 0;
      try {
        for (let i = start; i < end; i += concurrency) {
          check(signal);
          // A fixed window prevents one slow early segment from causing an unbounded queue.
          const pending = segmentUrls.slice(i, Math.min(i + concurrency, end))
            .map(segment => request(segment, 'bytes'));
          const settled = await Promise.allSettled(pending);
          const failed = settled.find(result => result.status === 'rejected');
          if (failed) throw failed.reason;
          for (let j = 0; j < settled.length; j++) {
            check(signal);
            const bytes = settled[j].value;
            await writer.write(bytes);
            partBytes += bytes.byteLength;
            sessionBytes += bytes.byteLength;
            emit('downloading', i - start + j + 1);
          }
        }
        check(signal);
        await writer.close();
      } catch (error) { await writer.abort().catch(() => {}); throw error; }

      if ((await handle.getFile()).size !== partBytes) throw new Error('Written file size mismatch');
      state.completed[group] = { bytes: partBytes };
      // Mark complete only after the part has been closed and its size checked.
      await writeText(output, 'progress.json', JSON.stringify(state, null, 2));
      completedSegments += end - start;
      savedBytes += partBytes;
      emit('committed');
    }
    check(signal);
    await writeText(output, 'concat.txt', Array.from({ length: groups }, (_, i) =>
      "file '" + partName(i) + "'\n").join(''));
    await writeText(output, 'MERGE.txt',
      'Use merge_parts.py from the downloader package:\n' +
      'python3 merge_parts.py "' + folder + '"\n' +
      'Run it from the parent folder that you selected.\n' +
      'Do not use the concat demuxer for these grouped TS files: it can add timestamp gaps.\n');
    emit('complete');
    return { folder, completedSegments, savedBytes, groups };
  }

  function mount() {
    if (window.HLSDisk?.active) throw new Error('A download is already running');
    document.querySelector('#hls-disk-panel')?.remove();
    const panel = document.createElement('div');
    panel.id = 'hls-disk-panel';
    panel.style.cssText = 'position:fixed;top:12px;right:12px;z-index:2147483647;background:#171717;color:white;padding:16px;border:1px solid #888;border-radius:8px;max-width:460px;font:14px/1.6 sans-serif;white-space:pre-wrap';
    const status = document.createElement('div');
    const start = document.createElement('button');
    const stop = document.createElement('button');
    start.textContent = '選擇資料夾並開始／續傳';
    stop.textContent = '停止'; stop.disabled = true;
    panel.append(status, start, stop);
    document.documentElement.append(panel);
    const ready = window === window.top && typeof showDirectoryPicker === 'function';
    status.textContent = ready ? '分段下載：並行 3 段，每 24 段存成一個檔案。\n請先讓播放器載入來源，再按下方按鈕。' :
      '請用桌面 Chrome／Edge 將播放器獨立開成分頁，再貼上程式。\n跨來源 iframe 無法使用這個資料夾選擇器。';
    start.disabled = !ready;
    let controller;
    stop.onclick = () => { controller?.abort(); status.textContent = '正在停止；已完成檔案會保留…'; };
    start.onclick = async () => {
      start.disabled = true;
      window.HLSDisk.active = true;
      controller = new AbortController();
      try {
        const mediaId = getPageIdentity(location,
          document.querySelector('[data-video-id]')?.getAttribute('data-video-id'));
        // This call must be directly inside an actual button click.
        const directory = await showDirectoryPicker({ mode: 'readwrite' });
        stop.disabled = false;
        const urls = performance.getEntriesByType('resource').map(r => r.name);
        const manifestUrl = urls.filter(u => /\/(?:playlist\.(?:txt|m3u8)|master\.m3u8)(?:\?|$)/.test(u)).at(-1);
        if (!manifestUrl) throw new Error('找不到主清單，請先開始播放再重試');
        const result = await run({ directory, manifestUrl, mediaId, signal: controller.signal,
          onProgress: p => {
            const n = p.completedSegments + p.currentPartSegments;
            status.textContent = p.phase === 'complete'
              ? '全部分段已寫入磁碟。\n資料夾：' + p.folder + '\n依 MERGE.txt 的指令合併成 MP4。'
              : n + '/' + p.totalSegments + ' 段 · ' + (n / p.totalSegments * 100).toFixed(1) + '%' +
                '\n已提交磁碟：' + p.completedSegments + ' 段 · ' + (p.savedBytes / 1048576).toFixed(1) + ' MB' +
                '\n本次平均寫入速度：' + (p.bytesPerSecond / 1048576).toFixed(2) + ' MB/s' +
                '\n資料夾：' + p.folder;
          }
        });
        console.log('HLS saved:', result);
      } catch (error) {
        status.textContent = (controller.signal.aborted ? '已停止。' : '未完成：' + error.message) +
          '\n已完成的分檔會保留。重新取得來源後，選同一個父資料夾即可續傳。';
        console.error(error);
      } finally {
        window.HLSDisk.active = false;
        start.disabled = false;
        stop.disabled = true;
      }
    };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { run, getPageIdentity };
  else {
    if (window.HLSDisk?.active) throw new Error('A download is already running');
    window.HLSDisk = { run, mount, active: false };
    mount();
  }
})();
