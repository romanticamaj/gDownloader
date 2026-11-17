# Video download acceptance and evidence

Status: planned product coverage, 2026-11-17. IDs refer to the
[experience spec](../specs/video-download-experience.md). No product test in this
matrix has run yet. Prototype-only evidence is listed separately below.

## Required test environments

- Deterministic core/parser tests with a controllable clock and seeded inputs.
- A synthetic HTTP server with multiple origins/frames, delayed streams, Range
  and validator controls, signed leases and a fake source-refresh provider.
- An installed unpacked extension in persistent Chromium profiles. Record browser,
  OS, permission state and whether instrumentation bypasses any native behavior.
- A separate real Chrome/OS suite for native picker, retained directory access,
  browser restart, disconnected target and generated >2 GB exports. Automated
  chooser interception is not evidence of successful native directory selection.

Do not require live video sites, real cookies, signed URLs or copyrighted media.
Keep generated large fixtures and outputs outside Git.

## Product matrix — all pending

| Test | Requirement | Fixture / fault | Required observation |
|---|---|---|---|
| E01 | VID-01/02 | Initial video, late insertion, reused element, SPA navigation, scrolling/resizing | One action per current video, correct position, no stale source/job binding |
| E02 | VID-01/02, SEC-01 | Cross-origin frame, about/blob related frame, open/closed shadow, access denied/revoked | Supported permitted contexts work; no unauthorized operations; clear fallback |
| E03 | VID-02 | Keyboard, narrow panel, native video fullscreen/PiP, restricted page | Reachable action or documented toolbar fallback, no focus trap |
| E04 | VID-03 | Real Blob, MediaSource/HLS, revoked Blob, srcObject, encrypted source | Correct capability/result, no claim all Blob URLs are files |
| E05 | VID-04, IDENTITY-01 | Two videos, ad playlist, delayed manifest and source change mid-click | Correct selected video or explicit chooser; no silent wrong-video job |
| E06 | VID-05 | Rapid repeated click and coordinator restart during enqueue | At most one durable job; idempotency survives restart |
| E07 | NAME-01/02 | Matching/conflicting VideoObjects, same page with two titles, no title, hostile Unicode/path names | Appropriate provenance/fallback; editable frozen title, safe correct suffix |
| E08 | NAME-02, DEST-02 | Two same-name jobs, existing target, crash while writing | Unique reservations, no silent overwrite, partial target never completed |
| E09 | QUEUE-01/02 | Several jobs with varied segment sizes; slow writer/muxer | Configured active jobs, global/per-job budgets, fairness and bounded buffered bytes |
| E10 | QUEUE-01/02 | Pause/cancel one job, close panel, suspend SW, lose offscreen context, restart browser | Other jobs unaffected; durable work reconciled; stale writers fenced |
| E11 | RESUME-01 | HTTP 206 correct/incorrect Content-Range, changed ETag yielding 200, 416, no Range | Only valid continuation appends; no corruption or false completion |
| E12 | RESUME-01 | HLS missing/truncated part, abort mid-write, crash between close and checkpoint | Only verified work reused; orphan/truncated parts reconciled |
| E13 | LEASE-01/02 | Known deadline, queue delay, unknown deadline, skew, sleep across deadline | Resolve at dispatch; proactive refresh when provider allows; no invented expiry |
| E14 | LEASE-02/03 | Expiry mid-transfer, ordinary 403, 429/Retry-After, refresh provider absent/failing | Typed reason, finite policy, retained work and actionable fresh-source flow |
| E15 | IDENTITY-01 | Fresh signed URL same content vs different video/track/init; old response arrives late | Reuse only on adapter identity proof; changed/old bytes never committed |
| E16 | DEST-01 | Real extension-page directory picker, cancel, restart, revoke, disk unavailable | Correct target persisted where supported; permission recovery; no silent fallback |
| E17 | DEST-02, SAVE-01 | Both backends; deny final write, disk full, interrupt export then retry | Receipt only after backend completion; retry uses staged bytes |
| E18 | QUEUE-02, SAVE-01 | Generated >2 GB media at increasing input lengths | Actual saved byte count/hash, tracks/duration/decode probes; measured memory does not grow with whole movie size |
| E19 | SEC-01 | Forged page messages, navigated frame, arbitrary URL, redirect to unapproved target, hostile manifest/name | Sender/job/epoch/target policy enforced; no handle/cookie exposure or arbitrary proxy |

Large-file report must name measured memory scope (worker/renderer/WASM/browser),
sampling method and baseline; “bounded request count” alone does not establish
bounded memory. Test both destination backends. Record expected vs observed
source requests, committed resources, final output and cleanup after failure.

## Existing executed reference coverage

`node --test experiments/browser-hls/downloader.test.cjs` currently has seven
prototype tests. They partially inform E05/E12/E14/E15 but do not satisfy them:
the prototype tests use explicit media IDs, manual fresh sources and a Node disk
adapter. They do not exercise an installed extension or the new contracts.

`python3 scripts/check_repository.py` verifies documentation file paths and the
shared AGENTS/CLAUDE arrangement. It is not browser/product/agent-behavior coverage.
`git diff --check` checks patch whitespace only.

## Evidence and support claims

Use levels **proposed**, **prototype-tested**, **extension-tested**, and
**release-verified** for each capability. A merge/release record includes:

1. Requirement/test IDs, commit and exact command or manual procedure.
2. Browser version, OS, permissions, source kind/layout and destination backend.
3. Result and artifact checks; failures, unsupported cases and unmeasured limits.
4. Redacted logs and reproducible synthetic fixture location.

The first product release requires the HTTP/clear TS HLS vertical slice, two-job
queue, source identity, expiry failure/recovery, both destination modes and actual
save gates. Unsupported discovery results still need E04 evidence. Real Blob
download support requires its own creator-context transport tests; the presence
of a Blob URL in a HLS fixture is not that evidence. Later adapters must extend
this matrix before their support is advertised.
