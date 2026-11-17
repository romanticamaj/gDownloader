# ADR 0001: Chrome extension first, separate download core

Status: proposed. Date: 2026-11-17.

## Context

The working prototype succeeded in browser context while an external HTTP client
received 403. The desired product is an open-source Chrome extension with simple
UI, maintainable internals and room for broader downloads.

## Alternatives

1. Put every feature directly into an extension app. Small initial surface, but
   scheduling, protocol rules and browser lifetime become difficult to separate.
2. Use one lightweight workspace with an extension app and independent core,
   media and UI packages. Slightly more structure; permits isolated testing and
   contributor ownership without multiple repositories.
3. Build a native engine, CLI, desktop app and browser extension immediately.
   Strong local file capabilities but adds installers, permissions, platforms and
   a native communication protocol before the core experience is established.

## Recommendation

Choose option 2. Chrome is the first product surface; browser-independent rules
have narrow ports and the extension owns Chrome-specific adapters. Use plain
pnpm workspaces initially; no separate task orchestrator is needed for four units.

WXT + TypeScript + React is the proposed app stack. The first spike must validate
MV3/offscreen operation and large-file disk-backed mux/export before these choices
are treated as finalized. [WXT introduction](https://wxt.dev/guide/introduction.html)

## Consequences

Do not add empty native-host, CLI or desktop workspaces. Add one only for a proven
capability the browser implementation cannot deliver acceptably. A browser host
permission does not guarantee an external or extension-origin request will behave
like the original page request.
