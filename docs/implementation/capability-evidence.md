# Browser capability gates

Updated: 2026-11-17. All product gates below are **unrun**. Documentation research
is not installed-browser evidence. T1 in the
[implementation plan](../superpowers/plans/2026-11-17-extension-implementation.md)
owns the first measurements; later tasks promote tested behavior into the product.

| Gate | Required evidence | State | Dependent work |
|---|---|---|---|
| G01 video association | Two videos/frames, source change, ambiguity; correct mapping or chooser | unrun | T2/T9 |
| G02 creator Blob transport | Authorized live Blob hash, revoked/navigated contexts, cancellation and bounded byte flow | unrun | T5b success claim |
| G03 runtime/storage | Offscreen/worker OPFS hash, metadata reconciliation after coordinator/panel loss | unrun | T4/T9 |
| G04 Downloads export | Real saved file, event receipt, export retry and object URL lifetime | unrun | T8 |
| G05 chosen directory | Native picker from extension page, persisted handle/regrant, lost target and actual saved file | unrun | T8/full first slice |
| G06 large media | Both destinations >2 GB; TS→MP4 tracks/duration/decode and measured memory/disk scaling | unrun | M4/full first slice |

For each measurement record commit, exact browser/OS, granted permissions,
procedure/command, expected vs observed result, byte count/hash, resource/memory
measurement scope, and redacted artifact locations. Record the tested Chrome
support floor only after API availability and installed-build evidence agree.

Allowed gate results: unrun, pass, fail, or needs-user-interaction. The latter is
not a pass/fail and does not imply a goal-tool status. A failed required gate
needs an ADR and a tested alternative or an explicitly incomplete capability.
No inferred success, silent unsupported fallback or skipped release gate.
