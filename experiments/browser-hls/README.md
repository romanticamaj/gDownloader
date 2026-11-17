# Browser HLS reference experiment

This is the preserved research prototype, not the future extension architecture.
It handles completed, clear MPEG-TS HLS VOD and rejects more complex tags/layouts.
It does not support arbitrary Blob URLs, DASH, DRM, fMP4 or separate tracks.

## Files

- `downloader.js`: browser console UI and download core, also exported for Node tests.
- `downloader.test.cjs`: seven regression cases using a local HTTP server and real disk adapter.
- `merge_parts.py`: ordered continuous-TS remux helper; requires Python 3, FFmpeg and FFprobe.

Run from repository root with Node.js 22 or newer:

```sh
node --test experiments/browser-hls/downloader.test.cjs
```

For an authorized compatible source in a standalone browser page, paste
`downloader.js` into that page's Console and use its start button. The directory
picker needs a supported top-level secure context and actual user interaction.
The historical automation environment intercepted that picker; its successful
full run instead used OPFS plus smaller file exports. Do not confuse those routes.

For completed prototype parts and `progress.json` in a local directory:

```sh
python3 experiments/browser-hls/merge_parts.py "/path/to/hls-output"
```

The generated `MERGE.txt` is advisory; use the repository command above. Do not
replace the continuous TS path with concat demuxer without checking timestamps.

Original experiment limitations remain visible: detection uses known playlist
names, the UI is temporary, and completed-file checks use size rather than a
cryptographic content hash. The Console UI requires an explicit `data-video-id`
and scopes it to the player origin; pages without this identity are unsupported.
It never infers a resumable media identity from a generic pathname such as `/player`.
Do not promote this script wholesale into production.
