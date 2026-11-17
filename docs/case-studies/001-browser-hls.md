# Case 001: a large browser-only HLS download

This public case is sanitized. No source website, account, media title, signed URL,
media identifier or downloaded content is included.

## Observations

- The video element used a MediaSource-backed Blob URL. Fetching it as a file failed.
- The actual HLS master and media playlists were named `.txt`; their contents
  started with `#EXTM3U`. Segments named `.png` contained MPEG-TS bytes.
- An external command-line request returned 403 while the active browser context
  could retrieve the playlist and segments. The exact access-control cause was
  not established, so no universal header fix is claimed.
- Downloading all data into memory and triggering one large Blob save eventually
  failed for the user. File size, object URL lifetime and browser behavior were
  possible causes; the precise cause was not proven.
- The native directory picker was intercepted by the automation environment.
  Testing the worker with OPFS had not validated that native UI path.

## Successful route

1. Resolve the actual playlist in the correct player frame/context.
2. Fetch with bounded concurrency of three.
3. Close and verify disk-backed parts; record committed work afterward.
4. Export smaller parts from browser storage and verify their local total.
5. Read the 89 parts as one continuous MPEG-TS input and remux locally.
6. Check duration/tracks and decode short regions at the beginning, middle and end.

## Evidence

| Measure | Observed result |
|---|---|
| Downloaded segments | 2,124 / 2,124 |
| Disk parts | 89 |
| Total TS bytes | 3,304,690,320 |
| Final MP4 bytes | 3,196,886,222 |
| Video stream duration | 10,619.166667 seconds, matching playlist |
| Container duration | 10,619.208313 seconds |
| Tracks | H.264 1280×720 and AAC |
| Decode samples | Three 2-second regions passed |

The entire movie was not decoded frame by frame. Peak browser memory was not
instrumented; bounded buffers were a design property, not a measured memory benchmark.

## Important correction

The first concat-demuxer merge accumulated about eight seconds of timing overhead
at grouped boundaries. Continuous TS concat-protocol input removed that discrepancy.
The source still produced audio timestamp warnings that the muxer adjusted; short
decode checks passed. This does not justify using byte concatenation for arbitrary
fMP4, separate tracks or discontinuous streams.

## Product requirements derived from this case

- Inspect content when filenames and MIME labels are misleading.
- Separate request context from protocol parsing.
- Persist bytes/checkpoints and retain staged output after export failure.
- Give object URLs an explicit save lease instead of a fixed revocation timer.
- Test real saved files and native UI paths, not only download progress or OPFS.
- Verify timing and tracks after assembly; report known uncertainty.
