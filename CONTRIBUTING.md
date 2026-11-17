# Contributing

Thank you for helping build gDownloader. The extension is still being designed;
the [foundation plan](docs/plans/2026-11-17-project-foundation.md) defines the next work.

## Pick a useful change

- A synthetic fixture that reproduces a download, recovery or export failure.
- A parser or scheduler improvement with a clear supported-input contract.
- A smaller UI flow, clearer failure action, keyboard support or translation.
- A documentation correction backed by current official API documentation.

For a new protocol, transport or native companion, first explain the use case,
the package boundary and how its behavior can be tested without private websites.
See [adding capabilities](docs/contributing/add-a-capability.md).

## Local checks today

1. Use Node.js 22 or newer.
2. Run `node --test experiments/browser-hls/downloader.test.cjs` when changing the prototype.
3. Use Python 3 and FFmpeg/FFprobe only if testing the merge helper with local parts.
4. Run `python3 scripts/check_repository.py` for local documentation links and the agent harness.
5. Run `git diff --check` for whitespace errors.

The [reference CI](.github/workflows/ci.yml) runs the current Node tests on Linux/macOS
with Node.js 22/24, plus documentation checks. The planned TypeScript workspace
will add its own install, lint, typecheck and browser-test commands. Do not invent
those commands before the workspace exists. Agent contributions follow the same
review process; see the [agent workflow](docs/contributing/agent-workflow.md).

## Pull requests

Keep one problem per PR. Explain the trigger, expected behavior and actual
verification. For UI work, include sanitized before/after screenshots and keyboard
behavior. For download changes, report memory/storage behavior and failure recovery.
Avoid snapshots or tests that merely repeat implementation constants.

A maintainer reviews changes before merge. No CLA or DCO process is configured.
Contributions are intended to be distributed under the project MIT license;
keep any third-party notices with imported material.

## Reporting failures safely

Include browser/extension version, phase, sanitized error and reproduction steps.
Use a synthetic sample if possible. Remove cookies, authorization headers, signed
query parameters and private titles before uploading diagnostics. Media availability
and authentication errors are distinct from downloader defects.

Read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and [SECURITY.md](SECURITY.md).
