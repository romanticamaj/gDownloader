# Cross-package tests — planned

There is no extension E2E suite here yet. Executable reference tests live in
[`experiments/browser-hls`](../experiments/browser-hls/README.md).

Planned layers:

| Layer | Evidence |
|---|---|
| Domain/parser | Valid transitions, stable identity, unsupported inputs |
| Disk/network integration | Ordering, commit atomicity, quota and partial-write recovery |
| Extension E2E | MV3 lifecycle, permissions, panel closure, real output save |
| Large-file stress | More than 2 GB, bounded memory growth, export retry |
| Media integrity | Segment count, expected duration, tracks and decode checks |

Use Playwright's bundled Chromium and an isolated persistent profile for
extension loading. Do not assume ordinary Chrome side-loading flags still work.
[Official extension test guide](https://playwright.dev/docs/chrome-extensions)

The [implementation plan](../docs/superpowers/plans/2026-11-17-extension-implementation.md)
defines TDD task order and future commands; the
[acceptance matrix](../docs/testing/video-download-acceptance.md) defines E01–E19.
T0 creates the runner. Unit mocks are distinct from installed-extension evidence,
and actual Chrome toolbar/panel and native picker interactions need their own
recorded checks. Do not skip a required gate to make the aggregate suite green.

Native chooser and extension-managed download flows are separate test cases.
If automation intercepts the chooser, do not count an OPFS-only test as an
end-to-end test of choosing a local directory.
