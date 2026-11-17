# Agent workflow

`AGENTS.md` contains shared project guidance for coding agents. Codex reads it as
repository instructions; Claude reads the same rules through the `@AGENTS.md`
import in `CLAUDE.md`. Keep those rules in one place.

Implementation is planned in the [M0–M4 task plan](../superpowers/plans/2026-11-17-extension-implementation.md).
Resume from the [status/evidence ledger](../implementation/status.md), initially T0.
That ledger includes a copyable future `/goal` and the parallel ownership rules.
The plan specifies TDD cycles, contract/file ownership, commands to create and
browser/native/large-output gates; those future commands are not available yet.

## A useful task handoff

Describe the user-visible result, relevant supported input, existing failure and
scope. Link the plan or issue rather than repeating the entire repository history.
An example for a future implementation task:

> Add a synthetic test for a valid HLS playlist served as text/plain with a .txt
> pathname. Preserve frame/source provenance and leave unsupported media layouts
> explicit. Do not depend on a live website.

## Agent loop

1. Inspect the repository state and the behavior the task touches.
2. Identify the owning package/adapter and the real success condition.
3. Implement only the authorized scope; preserve unrelated work.
4. Run relevant checks and examine output. For a transfer/export change, test
   failure, retained work and final-save behavior rather than only the happy path.
5. Review the diff and update the support matrix/docs for actual delivered behavior.
6. Report changed paths, executed evidence, untested limits and any remaining work.

For video tasks, include requirement IDs from the
[experience spec](../specs/video-download-experience.md) and test IDs from the
[acceptance matrix](../testing/video-download-acceptance.md). A useful handoff names
source/access context, selected representation, document/source epoch, destination
backend, checkpoint and actual completion condition. State whether evidence comes
from the prototype, an installed extension or a release environment. A docs check
does not validate these behaviors. Keep pending product checks pending until the
workspace and real test commands exist.

## Commands available now

```sh
node --test experiments/browser-hls/downloader.test.cjs
python3 scripts/check_repository.py
git diff --check
```

The first command checks the prototype only. Python media-helper execution needs
FFmpeg/FFprobe and completed local parts; it is not part of the current Node CI
suite. No TypeScript product build or browser E2E command exists yet.

Personal plugins and hosted AI tools are optional. A contributor must be able to
understand and verify a PR with ordinary local tooling. Agent-generated changes
follow the same contribution and review requirements as other changes.

When the workspace is implemented, add real commands to `AGENTS.md`, CI and the
contributor guide together. Do not add instructions for nonexistent test scripts.
