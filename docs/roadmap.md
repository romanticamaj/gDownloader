# Roadmap

Status as of 2026-11-17: public foundation and executable reference experiment.
Versions below are goals, not published releases or promised dates.

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

- [ ] Create a reproducible TypeScript/WXT/React workspace with lockfile.
- [ ] Validate MV3 service worker, offscreen/worker messaging and durable job records.
- [ ] Validate OPFS segment and seekable output storage on supported Chrome versions.
- [ ] Save a generated greater-than-2-GB output through Chrome downloads; verify actual saved bytes.
- [ ] Retry final export without segment redownload; test the object URL lease lifetime.
- [ ] Measure memory as input length grows; record the support floor and any browser limits.
- [ ] Make an explicit architecture decision if the browser-only path fails these gates.

## v0.1 — a useful Chrome extension

- [ ] Side panel: discovered resources, active jobs and completed exports.
- [ ] Ordinary HTTP(S) file adapter using Chrome downloads.
- [ ] Clear, completed, muxed MPEG-TS HLS VOD adapter.
- [ ] Nonstandard playlist-name detection with bounded user-authorized probing.
- [ ] Limited concurrency, finite retries, cancellation and checkpoint recovery.
- [ ] Fresh source attachment with validated identity, or an honest unrecoverable state.
- [ ] Quota, storage cleanup and final-save errors with actionable UI.
- [ ] English/Traditional Chinese strings, keyboard flows and accessible contrast.
- [ ] Synthetic E2E fixtures and a short reproducible demo.

Release gate: a new user can install an unpacked build, download a supported
fixture and find a verified file without opening DevTools. Closing the panel and
restarting the MV3 coordinator must not lose committed work. Browser restart and
expired-source cases must have explicit tested outcomes.

## v0.2 — broaden media support

- [ ] HLS fMP4 and initialization segments.
- [ ] Separate video/audio tracks and optional subtitles.
- [ ] A documented subset of DASH.
- [ ] Better range/validator-aware ordinary-file recovery and batch queue controls.

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
