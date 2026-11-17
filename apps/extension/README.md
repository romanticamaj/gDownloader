# Extension app — planned

Owns WXT entrypoints, Chrome APIs, UI composition, permissions, capture and
platform adapters. There is no installable extension or manifest here yet.

Planned layout:

```text
entrypoints/       background, sidepanel, offscreen and options
src/features/      capture, resource selection, jobs, settings, diagnostics
src/platform/      Chrome downloads, OPFS repository/store, transport adapters
src/messaging/     validated commands/events and runtime ownership
src/locales/       English and Traditional Chinese product strings
```

One offscreen document coordinates workers per profile. Long transfers must not
live in the side panel. Platform adapters implement the contracts of
[`packages/core`](../../packages/core/README.md).

See [architecture](../../docs/architecture.md) and [first milestone](../../docs/roadmap.md).
The [implementation plan](../../docs/superpowers/plans/2026-11-17-extension-implementation.md)
defines actual WXT entrypoints, permission strategy and test order. Start at
[the status ledger](../../docs/implementation/status.md); no build exists yet.
