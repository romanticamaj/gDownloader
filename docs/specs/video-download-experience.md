# Video download experience

Status: proposed requirements, 2026-11-17. No extension runtime implements these
contracts yet. The [gap review](../research/2026-11-17-video-capture-gap-review.md)
separates existing evidence from proposals. Requirement IDs link to the
[acceptance matrix](../testing/video-download-acceptance.md).

## Product promise

On supported Chrome pages where the user grants site access, discover video
elements, offer a download action and attempt to resolve a supported source.
Blob videos are a discovery target, not a guarantee of downloadable bytes.
Never associate a different video, advertise unsupported resume, or report a
file saved before the destination backend confirms its write.

Working UX assumptions: an action at each video's upper right plus a side-panel
queue; a remembered user-selected folder with an explicit Chrome Downloads mode.
These defaults can change with user feedback. This document does not promise
access to protected browser pages, DRM decryption or every site's private APIs.

## Discovery, action and source identity

| ID | Required behavior |
|---|---|
| VID-01 | Discover existing and dynamically inserted videos in authorized documents, including permitted cross-origin frames and shadow trees. Track tab, frame, document, element and source epoch. |
| VID-02 | Show a keyboard-accessible upper-right action for a visible video on hover/focus; keep an accessible side-panel alternative. Reposition without covering native controls. Handle scrolling, resizing, SPA navigation and element reuse without duplicate actions. |
| VID-03 | Classify ordinary HTTP(S), real Blob/File, MediaSource and srcObject separately. A click resolves a capability or explains why resolution failed. Network extension/MIME alone is insufficient. |
| VID-04 | Correlate candidates to the selected video, retaining evidence and confidence. A frame with several playlists is ambiguous until disambiguated; show a quality/source chooser instead of silently selecting another video or an advertisement. |
| VID-05 | One user action creates at most one job for the selected video, rendition and destination. Repeated clicks reveal the existing job; explicit duplication remains possible. |

`VideoDescriptor` carries document/element identity, source epoch, observed source
kind, title candidates and capture evidence. `SourceCandidate` carries provenance,
representation/tracks, access context, confidence and capabilities. These are
conceptual contracts, not a stable extension/plugin ABI.

Global automatic overlays require user-granted HTTP(S) site access. Offer a per-site
mode when broad access is declined. `activeTab` alone does not provide persistent
all-site discovery or access to every embedded media host. Revocation removes
observers and blocks new privileged operations. Do not automatically download or
buffer the entire movie merely because an element appeared.

Native video fullscreen and picture-in-picture may not admit an injected overlay;
use the toolbar/side panel fallback. Closed shadow roots need an extension-specific
discovery strategy and browser tests. Restricted pages get an explanatory toolbar
state instead of a promise of an in-page button.

### Source capability ladder

| Source | Attempt | Success boundary |
|---|---|---|
| HTTP(S) file | Resolve metadata; native download or managed streaming | Host/session access and server behavior permit reading |
| Live Blob/File object URL | Read in a context authorized to access its creator/storage partition | Object still exists; transfer and byte transport are verified |
| MediaSource object URL | Resolve HLS/DASH or another reproducible media plan | Supported clear layout, accessible init/media and assembly strategy |
| MediaSource without recoverable source | Explain limitations; future opt-in capture may be offered | Late hooks cannot reconstruct already discarded bytes |
| Encrypted/EME media | Detect and report unsupported protected export | No DRM bypass path |
| MediaStream/WebRTC srcObject | Explain that recording is a separate future capability | No claim of an original complete downloadable file |
| Revoked/inaccessible Blob | Request a fresh source or report unavailable | A copied blob URL is not a durable network URL |

Initially verified product support should target HTTP(S), real Blob and clear,
completed MPEG-TS HLS. fMP4 HLS, alternate tracks and DASH are subsequent adapters.
Discovery can be broad before all of these are downloadable, provided the result
states are honest. Absence of an `encrypted` event is not proof of clear content.

## Names

**NAME-01:** Resolve a video-specific name before enqueueing. Prefer metadata
explicitly associated with that video: a matching VideoObject name/contentUrl or
embedUrl, associated element title/accessible label, a nearby caption/heading, or
a tested site adapter. Page og:title/document.title is a lower-confidence fallback
for multi-video pages. A UUID path is not a meaningful title.

Keep provenance/confidence; show an editable suggested name. Freeze the job title
at enqueue time so later navigation cannot rename it. When no credible name exists,
use a deterministic `video-<date>-<short-id>` fallback. Response filename metadata
may refine a suggestion, subject to validation and user edits.

**NAME-02:** Normalize filename characters, traversal, reserved names, control
characters, length and collisions for supported OSes. Preserve readable Unicode.
Derive the suffix from the actual output container, not the Blob URL or a title
suffix. Uniquify collisions by default; do not silently overwrite files. Reserve
names across concurrent jobs as well as already existing files.

## Queue and resource budgets

**QUEUE-01:** Persist jobs and their selected source/representation, destination,
title, checkpoint and capability set. Multiple jobs can download concurrently;
this is separate from segment concurrency inside one job. Closing the panel must
not terminate a transfer. Restart recovery reconciles bytes and metadata.

**QUEUE-02:** Enforce global and per-job limits, fairness, backpressure, cancellation
and finite retries. Proposed starting policy: two active jobs, six managed network
requests globally, three per job, one assembly at a time. These are tuning proposals,
not browser limits or measured optima. Native Chrome transfers need separate slot
accounting because their internal requests are outside our scheduler's control.
Bound buffered bytes, not just request count; large segments must stream or fail
with an explicit size limit. Keep one writer per job, fenced by source epoch.

UI shows queued, resolving, downloading, assembling, exporting and completed.
Paused, interrupted and waiting states carry typed reasons: source/identity,
permission, target unavailable, quota or network. Show bytes and/or segments with
known denominators only; temporary export bytes are not another download percentage.

## Resume and source expiry

**RESUME-01:** Resume capabilities depend on transport. For a managed HTTP file,
persist offset and a trustworthy validator, request Range/If-Range and verify
206 Content-Range offsets/total. A 200 response cannot be appended to partial
bytes; restart or request a decision. A 416 response alone is not completion.
Without reliable validators/range semantics, expose restart instead of unsafe append.
For HLS, resume only missing verified resources from the selected representation.

**LEASE-01:** Model `SourceLease` with observed time, optional expiry and its
authority/confidence, access context, source epoch and refresh provider capability.
Unknown expiry is normal. Do not interpret arbitrary URL numbers, blob identifiers
or cache freshness as authentication expiry. Resolve again when a queued job starts;
check known deadlines before dispatch and after sleep/restart. A timer is only a
best-effort reminder, not a guarantee of refresh before expiry.

**LEASE-02:** When a supported provider can refresh a known expiring source, request
it early with margin for skew, latency and retries. The margin is a configurable,
tested policy. A provider can use fresh authorized page observations or a tested
site-specific resolution flow. The extension cannot generically mint new server
signatures. Refresh must preserve the selected video and representation; it must
not silently change quality/tracks to finish sooner.

**LEASE-03:** Distinguish expired credentials from ambiguous 401/403, permission,
rate-limit and network failures. Stop futile retries and retain committed bytes.
Without a refresh provider, enter `waiting_for_source` and guide reopening/replaying
the source page. Expired URLs are recoverable only when a fresh valid source can be
obtained. Slower servers cannot be forced to finish before a deadline.

**IDENTITY-01:** Before attaching a refreshed source, validate media and rendition
identity, tracks/codecs/init data and resource layout (sequence, ranges, duration
and available validators/hashes). URL query removal is not an identity proof.
Reject changed/ambiguous content without modifying committed bytes; fence late
responses from old source epochs. Document the evidence required by each adapter.

## Directory and final save

**DEST-01:** Provide two explicit backends:

- **Chrome Downloads:** optional relative subfolder, using Chrome's native transfer
  and completion events. `saveAs` is a per-file chooser, not a remembered arbitrary
  directory capability.
- **Chosen directory:** a real user gesture in an extension-controlled top-level
  manager/settings page invokes the directory picker. Persist the handle in
  IndexedDB where supported, recheck access on each session and request permission
  again when needed. Exact extension-context behavior is a capability-spike gate.

Users can set a default and choose a different destination per job before it starts.
Store a destination reference, not a machine-specific path as public configuration.
Permission loss, disconnected disks and missing targets pause affected saves;
never silently redirect a selected-folder job into Downloads. Cancellation of the
picker leaves the previous setting intact. Avoid file pickers in media iframes.

**DEST-02:** Chosen-folder export streams staged output to the file handle, closes
the writable and checks saved size before returning a receipt. It must not read
the entire output into memory. A direct HTTP job in this mode requires a managed
transport; Chrome's filename option cannot name an absolute target directory.
Crash recovery must reconcile incomplete target files, name reservations and
receipts; never mistake an existing partial file for a completed export.

**SAVE-01:** `completed` requires a validated artifact and backend-specific
`ExportReceipt`: Chrome completed event/download ID, or chosen-folder successful
close plus size verification. Do not promise crash-proof filesystem durability
beyond the APIs. On export failure retain staged data and offer retry without
downloading media again. Clean up only through documented retention/user actions.

## Trust boundaries

**SEC-01:** Treat DOM names, manifests and page messages as untrusted data. Main-world
observation hooks are narrow and optional. Background requests validate extension
sender tab/frame/document, current source epoch, user-approved job and allowed
resource targets. A page-origin check or nonce visible to that page is insufficient
authorization for arbitrary fetches or filesystem writes. Do not expose directory
handles, raw cookies or a general request proxy to page scripts.

Chrome runtime messaging is a small JSON control plane. Do not design large media
transfer around serialized ArrayBuffers. Worker-owned streams/storage are preferred;
a page-context byte bridge needs a bounded, separately tested transport before
claiming session-bound Blob/media support. Host permission alone cannot erase
page CORS or every server/session restriction.

## Delivery order

1. Resolve feasibility: installed extension discovery/correlation, byte transport,
   chosen-folder save/permission persistence, refreshed-source identity and >2 GB export.
2. Complete one end-to-end vertical slice: per-video action → correct title/source
   → two-job queue → HTTP/clear TS HLS → both destinations → verified save/recovery.
3. Add real Blob creator-context transfer with its own evidence; broaden HLS/DASH
   layouts and site refresh providers independently.
4. Advertise only capabilities passing the acceptance matrix. No “all websites”
   or “all Blob videos” success claim follows from a generic discovery action.
