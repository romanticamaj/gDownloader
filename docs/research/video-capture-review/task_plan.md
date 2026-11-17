# Generic video download requirements review

Date: 2026-11-17. Scope: research and specifications, not product implementation or publishing.

- [complete] Compare current spec, executable prototype and agent harness with requested behavior.
- [complete] Verify Chrome/API/protocol constraints using primary sources.
- [complete] Define product contracts, capability levels, recovery/destination policies and acceptance tests.
- [complete] Update spec, architecture, design, roadmap and harness; verify documentation consistency.

User requirements: video download button at the upper right; enqueue; automatic
video titles; multiple simultaneous downloads; expiry-aware resume; chosen directory;
attempt discovery/download for videos with Blob sources on arbitrary websites.

Working UX assumptions pending optional feedback: per-video button plus side-panel
queue, and a remembered arbitrary user-selected directory with a Downloads fallback.

Outcome: detailed requirements, primary-source gap review, 19 pending product test
scenarios and a proposed destination ADR. Defaults remain proposals; a selected
folder never silently falls back. Current reference tests pass 7/7, documentation
and harness checks pass, and patch whitespace passes. No extension/browser test,
product implementation, commit or publication was performed in this review.
