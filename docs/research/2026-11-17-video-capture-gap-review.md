# Video capture: specification and harness gap review

Date: 2026-11-17. Baseline: foundation commit `1d2676c`.
Method: local source/document inspection and primary-source research. No extension
was installed or browser feasibility test run for this review. Proposals are in the
[experience spec](../specs/video-download-experience.md); release evidence belongs
in the [acceptance matrix](../testing/video-download-acceptance.md).

## Findings

The product is a public foundation plus a standalone console HLS experiment.
There is no manifest, content script, extension build, title resolver or persistent
multi-job queue. The experiment is useful evidence for one clear TS HLS workflow;
it is not an implementation of generic Blob downloading.

| Requested capability | Current evidence | Missing work |
|---|---|---|
| Action on every eligible video | Side-panel design only | Content/frame/shadow discovery, overlay lifecycle, permission UX, fallback |
| Correct video/source association | Prototype explicit `data-video-id` plus page origin | Candidate graph, document/element epochs, ad/multiple-video disambiguation |
| Automatic meaningful filename | Generic grouped part names | Title evidence/ranking, editable suggestion, sanitization and collision reservations |
| Several files at once | One run, default three segment requests; global active guard | Durable job queue, global budgets/fairness and independent progress |
| Resume before expiry | Committed groups survive; manual replacement signed prefix in a test | Lease/deadline checks, HTTP validators and source refresh providers |
| Recover after expiry | 403 stops; manual resume can reuse matching parts | Failure classification, refresh identity and stale-write fencing |
| Arbitrary chosen folder | Standalone picker route; historical automation used OPFS workaround | Extension-owned picker, persisted handles, permission/disk recovery, final receipts |
| Attempt arbitrary Blob video | A known HLS playlist flow | Real Blob vs MediaSource classification, creator-context transport, more media adapters |
| Maintainable agent harness | Shared AGENTS/CLAUDE, reference tests and docs CI | Product commands, requirement-to-evidence mapping, extension E2E and failure fixtures |

## Why Blob is a discovery signal

A Blob URL is an opaque identifier managed by its creator context; its appearance
does not identify a public media endpoint. MediaSource can feed multiple changing
buffers into a video. Resolving its object URL is not equivalent to obtaining a
complete file. Revocation/lifetime and storage partitioning also matter.
[Blob URLs](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/blob),
[MediaSource](https://developer.mozilla.org/en-US/docs/Web/API/MediaSource).

srcObject can represent a MediaStream rather than an original file; protected
media introduces a separate encrypted-media boundary. These need distinct result
states instead of another generic fetch retry.
[srcObject](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject),
[Encrypted Media Extensions](https://developer.mozilla.org/en-US/docs/Web/API/Encrypted_Media_Extensions_API).

## Chrome constraints that change the design

**Access and discovery.** activeTab is temporary access following invocation.
Persistent automatic discovery requires a site-access model, and embedded frames
need their own matching/permission rules. Content scripts can match related
about/data/blob frames under documented conditions; main-world hooks inherit the
page's CSP. Chrome also exposes `dom.openOrClosedShadowRoot`, so closed shadow
roots should be tested rather than categorically declared impossible.
[activeTab](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab),
[content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts),
[chrome.dom](https://developer.chrome.com/docs/extensions/reference/api/dom).

**Context and transport.** Content-script fetches remain subject to page-origin
CORS rules. Extension-origin requests require appropriate host permissions and
still may fail server/session checks. Chrome runtime messages use JSON serialization;
a design that passes huge binary buffers through runtime messages is unsuitable.
Separate small control messages from tested bounded byte paths.
[network requests](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests),
[messaging](https://developer.chrome.com/docs/extensions/develop/concepts/messaging).

**Folders.** downloads.DownloadOptions.filename is relative to Downloads; it
cannot specify an arbitrary absolute folder. File System Access allows chosen
directories and handle persistence, with access rechecked as needed. Its picker
requires user activation; exact use in our extension page remains untested.
[Downloads API](https://developer.chrome.com/docs/extensions/reference/api/downloads),
[File System Access](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access),
[directory picker](https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker).

**Expiry and resume.** HTTP Range/If-Range defines when partial bytes can be safely
continued; neither a successful request nor 416 proves a complete artifact.
Expiry rules belong to the server. S3, for example, can allow an already-started
transfer past expiry while rejecting a later reconnect; that example is not a
guarantee for arbitrary CDNs. Chrome alarms cannot wake a sleeping machine, so
deadline checks must also run on dispatch and wake/recovery.
[HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110.html#name-range-requests),
[S3 presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html),
[alarms](https://developer.chrome.com/docs/extensions/reference/api/alarms).

**Titles.** VideoObject supplies useful fields such as name, contentUrl and embedUrl.
Our proposal is to match these to the selected video, not assume the page's first
metadata object describes every element. Ranking/confidence is application logic
that needs fixtures, not a browser guarantee. [VideoObject](https://schema.org/VideoObject).

## Prototype evidence and limits

`experiments/browser-hls/downloader.js` supports completed clear MPEG-TS HLS,
bounded parallel requests inside a single job, finite retry, grouped disk writes
and checkpoints. Seven Node tests cover identity guard, ordering, manual fresh
source resume after 403, truncated part recovery, transient retry, encrypted HLS
rejection and cancellation. They do not install an extension or operate native
file pickers. The source matcher removes query data and reduces path identity;
that is not a general safe representation matcher and must not be promoted blindly.

The [historical case](../case-studies/001-browser-hls.md) demonstrates a large
download/desktop merge, not the proposed arbitrary-folder extension export.
OPFS success and a local adapter test must never substitute for a real target-file
save test. The current documentation checker validates local Markdown file paths
and shared harness imports, not browser behavior or agent decision quality.

## Priority and unresolved gates

| Priority | Concrete gate | Decision it resolves |
|---|---|---|
| P0 | Installed extension associates two frame-local videos with the right playlists, including a changing source | Whether generic discovery can safely enqueue without a site adapter |
| P0 | Transfer a synthetic creator-context Blob with bounded memory; test inaccessible/partitioned context | Which Blob/session contexts are actually supported |
| P0 | Extension page chooses a directory, reopens its handle after restart, exports >2 GB and handles revoked access | Browser-only arbitrary-directory feasibility and minimum Chrome version |
| P0 | Controlled expiring source refresh, unchanged/changed identity and late old responses | Safe renewal protocol and honest unsupported cases |
| P1 | Two-job vertical slice with names, both destinations and failure recovery | First usable release |
| P2 | fMP4, alternate audio and DASH fixtures/adapters | Broader real-world coverage |

The recommended approach remains browser-first. No native companion is justified
solely by assumptions; record an ADR if measured storage/export gates require one.
Do not choose a minimum Chrome version until the required APIs and installed-build
tests agree. Proposed queue budgets require measurement before being called optimal.

## Harness changes needed

Keep one shared instruction file and add domain invariants rather than more persona
prompts. Every new support claim needs a requirement ID, a capability level, a
fixture and executed evidence. A handoff must name source/access context, source
epoch/identity, destination backend, checkpoint and real completion condition.

Build/typecheck/test commands must arrive with the workspace, not as fictional
instructions now. Add controlled HTTP/expiry fixtures and installed-extension E2E,
then a separate OS chooser/large-file suite. CI pass today means prototype/docs
pass, never that the video-overlay or arbitrary-Blob product works.
