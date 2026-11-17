# Roadmap

Status as of 2026-11-17: public foundation and executable reference experiment.
Versions below are goals, not published releases or promised dates.

Execution is broken into M0–M4 in the
[implementation plan](superpowers/plans/2026-11-17-extension-implementation.md).
The [status ledger](implementation/status.md) owns task progress and executed
evidence; initially T0 is ready and all product tasks are pending.

## Foundation — current

- [x] Establish local repository and community documentation.
- [x] Preserve a sanitized reference experiment and its regression tests.
- [x] Record research, architecture alternatives, UI direction and known failure lessons.
- [x] Publish the foundation as `romanticamaj/gDownloader` under MIT.
- [x] Set the repository owner and enable GitHub private vulnerability reporting.
- [x] Share one agent harness through AGENTS.md and CLAUDE.md.
- [x] Configure reference-test and documentation CI.
- [ ] Finalize the product implementation decisions through the capability spike.
- [ ] Publish a dedicated private conduct contact before scaling community support.

## Capability spike — first implementation

- [ ] Validate installed-extension video/frame/shadow discovery and source association.
- [ ] Prove bounded creator-context Blob byte transport or document its supported subset.
- [ ] Validate chosen-directory selection in an extension page, handle recovery and export receipts.
- [ ] Test source leases, refresh-provider identity and stale-response fencing with a controlled clock/server.
- [ ] Create a reproducible TypeScript/WXT/React workspace with lockfile.
- [ ] Validate MV3 service worker, offscreen/worker messaging and durable job records.
- [ ] Validate OPFS segment and seekable output storage on supported Chrome versions.
- [ ] Save a generated greater-than-2-GB output through Chrome downloads; verify actual saved bytes.
- [ ] Verify the same large-file and permission/failure gates for the chosen-directory backend.
- [ ] Retry final export without segment redownload; test the object URL lease lifetime.
- [ ] Measure memory as input length grows; record the support floor and any browser limits.
- [ ] Make an explicit architecture decision if the browser-only path fails these gates.

## v0.1 — a useful Chrome extension

- [ ] Per-video upper-right action with frame/SPA lifecycle and accessible fallback.
- [ ] Video-specific title suggestions, editable safe names and collision reservations.
- [ ] Persistent multi-job queue with global/per-job resource budgets and fairness.
- [ ] Side panel: discovered resources, active jobs and completed exports.
- [ ] Ordinary HTTP(S) native Downloads and managed chosen-folder transports.
- [ ] Clear, completed, muxed MPEG-TS HLS VOD adapter.
- [ ] Nonstandard playlist-name detection with bounded user-authorized probing.
- [ ] Limited concurrency, finite retries, cancellation and checkpoint recovery.
- [ ] Fresh source attachment with validated identity, or an honest unrecoverable state.
- [ ] Known-expiry checks and refresh where a provider exists; retained work otherwise.
- [ ] Explicit Downloads/chosen-folder modes with permission and disconnected-target recovery.
- [ ] Quota, storage cleanup and final-save errors with actionable UI.
- [ ] English/Traditional Chinese strings, keyboard flows and accessible contrast.
- [ ] Synthetic E2E fixtures and a short reproducible demo.

Release gate: a new user can install an unpacked build, download a supported
fixture and find a verified file without opening DevTools. Closing the panel and
restarting the MV3 coordinator must not lose committed work. Browser restart and
expired-source cases must have explicit tested outcomes.
Use the [experience spec](specs/video-download-experience.md) and
[acceptance matrix](testing/video-download-acceptance.md) for detailed release gates.
Real Blob/File download support must pass its creator-context gate before being
advertised; MediaSource-backed HLS is not proof of generic Blob transfer.

## v0.2 — broaden media support

- [ ] HLS fMP4 and initialization segments.
- [ ] Separate video/audio tracks and optional subtitles.
- [ ] A documented subset of DASH.
- [ ] Extend HTTP resume coverage and queue controls beyond the first verified subset.

Each entry needs fixtures, assembly semantics and failure coverage before it is
advertised. These entries are candidates, not all prerequisites of one release.

## Later — driven by demonstrated needs

Evaluate live capture, Firefox/Edge portability, native FFmpeg companion, CLI,
additional file/source adapters and declarative site recipes independently.
There is no desktop/native/plugin runtime commitment yet.

## Continuous quality and contribution

- Core/parser tests: deterministic inputs and state transitions.
- Integration tests: real disk transactions plus HTTP 403/429/5xx, retry-after,
  truncated/stalled bodies, cancellation and recovery.
- Extension E2E: Playwright bundled Chromium persistent profiles; validate real
  saved files, not just a success toast. Native chooser behavior is a separate test.
- UI: empty, loading, permission, error and finished states; keyboard and narrow layouts.
- Large-file regression: generated media, quota behavior, memory and final export.
- CI: lint/typecheck/test/build once those commands exist. Pin action revisions;
  use minimal workflow permissions. No fake badges or percentage targets.
- Current CI covers only the executable reference tests and repository documentation;
  product builds, browser E2E and large-file stress gates remain future work.
- Release: reviewed permission diff, reproducible ZIP, changelog, third-party notices,
  install/recovery docs and a compatibility matrix supported by tests.

## What earns adoption

Make the first success easy to reproduce, report limitations honestly, preserve
work during failures, answer issues with evidence, and keep starter contributions
small. Track download/export success and recovery regressions with local fixtures;
GitHub stars remain a community outcome, not an engineering acceptance test.
