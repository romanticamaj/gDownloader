# Implementation handoff and evidence ledger

Updated: 2026-11-18. Status: planning ready; product implementation not started.

Tracking issue: [#1 — implement M0–M4](https://github.com/romanticamaj/gDownloader/issues/1).

## Start here

Read AGENTS.md, the [implementation plan](../superpowers/plans/2026-11-17-extension-implementation.md),
[experience spec](../specs/video-download-experience.md) and
[acceptance matrix](../testing/video-download-acceptance.md). Inspect actual checkout
and installed tooling before acting. Planning is published on
`docs/video-capture-requirements`; start from that branch (or a descendant containing
the plan), not foundation-only main. Recheck Git status and preserve unrelated edits.

Next ready task: **T0**. No pnpm workspace/build/product test commands exist yet.
Do not run or claim future scripts until T0 creates them. The plan owns task
instructions; this file owns current progress, so avoid contradictory duplicate plans.

| Task | State | Dependency | Executed product evidence |
|---|---|---|---|
| T0 shell/toolchain/browser runner | pending | None | None |
| T1 contracts/server/capability gates | pending | T0 | None |
| T2 video capture/action/correlation | pending | T1 | None |
| T3 durable queue/scheduler | pending | T1 | None |
| T4 naming/storage/recovery | pending | T1 | None |
| T5 HTTP/native transfer | pending | T3, T4 | None |
| T5b creator Blob transport/capability result | pending | T1 Blob gate, T3, T4 | None |
| T6 TS HLS/assembly | pending | T1, T4, mux gate | None |
| T7 leases/refresh/identity | pending | T3, T6 | None |
| T8 destination/export | pending | T4, T5, T6, target gate | None |
| T9 composition/permissions/UI | pending | T2, T5b capability result, T7, T8 | None |
| T10 recovery/scale/evidence | pending | T9 | None |

T1 gates are individually tracked in [capability evidence](capability-evidence.md):
association, creator Blob transport, OPFS/lifecycle, both destinations, large mux.
Record measured failures/needs-user-interaction separately from unrun tests.
Real Blob success can remain unavailable while HTTP/HLS development proceeds;
T5b must still provide the tested unavailable/attempt result and report the gap.
Required chosen-folder/large-output failures prevent claiming the full first slice.

## Task evidence format

For each completed task, append:

```text
Task / requirement IDs / acceptance IDs:
Commit or working-tree revision and owned paths:
RED command + expected observed assertion failure:
GREEN command + result:
Broader checks and browser/OS/permission context:
Artifact bytes/hash and receipt (if applicable):
Remaining limitations / dependency gate / next ready task:
```

Mark completed only after its real gate passes. A test runner import error is not
TDD RED. Mocked browser APIs are unit evidence only. Record failures by name and
never hide pending native/large-file tests behind a green aggregate status.

## Verification available before T0

```sh
node --test experiments/browser-hls/downloader.test.cjs
python3 scripts/check_repository.py
git diff --check
```

Research baseline: 7/7 prototype tests and documentation checks passed in the
preceding review. These do not establish installed-extension functionality.

## Suggested next goal

```text
/goal 依照 ~/gDownloader/AGENTS.md 與 docs/implementation/status.md，從 T0 開始，
以 TDD 完成 docs/superpowers/plans/2026-11-17-extension-implementation.md 的
M0–M4 首條端到端流程。依賴就緒後以獨立 worktree 平行處理 capture、core、
platform/media；整合者管理共用介面與 lockfile。持續更新任務狀態與實測證據。
完成條件包含正確影片/名稱、兩任務並行、來源更新與安全續傳、兩種目錄保存、
實際輸出完整性及大檔測試。未通過的能力如實記錄並處理，不宣稱所有 blob
皆可下載。可以本機提交；不要自動 push、merge、發布商店或建立 release。
```

This is a future invocation template, not an active goal or current permission to
start product coding. Runtime goal creation/budget/status follow the tool contract.
