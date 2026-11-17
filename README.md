# gDownloader

A browser-first download manager designed around durable progress and reliable saves.

**Status: early development.** A tested browser HLS prototype and the extension design are available. The Chrome extension is not implemented or installable yet.

[繁體中文](README.zh-TW.md) · [Architecture](docs/architecture.md) · [Roadmap](docs/roadmap.md) · [Contributing](CONTRIBUTING.md) · [Agent workflow](docs/contributing/agent-workflow.md)

```text
Discover resources → Download with bounded concurrency → Save progress to disk
                  → Assemble the file → Confirm the final save
```

## What we are building

Start with a Chrome extension that discovers downloadable resources, manages transfers, preserves completed work, and makes the final save explicit. Expand through protocol and transport adapters as real use cases emerge.

The first release targets ordinary HTTP(S) files and a documented subset of unencrypted HLS VOD. It does not promise every website, arbitrary Blob URLs, DRM media, or unattended recovery from every expired source.

The foundation comes from a successful large HLS download: 2,124 segments, bounded concurrency, disk-backed intermediate files, and a verified MP4 export. See the [sanitized case study](docs/case-studies/001-browser-hls.md).

## Repository map

```text
apps/extension/                  Chrome integration and application UI — planned
packages/core/                   Browser-independent job model and scheduler — planned
packages/media/                  Media detection, parsing and assembly plans — planned
packages/ui/                     Shared UI primitives and tokens — planned
experiments/browser-hls/         Executable reference prototype
docs/                           Plans, decisions, research and contributor guides
tests/                          Cross-package fixture and E2E strategy — planned
.github/                        Issue and pull-request templates
```

This is a lightweight workspace proposal, not a set of independently published npm packages. The next milestone is a Chrome MV3 capability spike before the product workspace is implemented.

## Get started

Requirements: Node.js 22 or newer for the current prototype; Python 3 and local FFmpeg/FFprobe only for media merging. No npm dependencies are required for this check.

```sh
git clone https://github.com/romanticamaj/gDownloader.git
cd gDownloader
node --test experiments/browser-hls/downloader.test.cjs
python3 scripts/check_repository.py
```

These tests cover the prototype, not an extension build. See [prototype instructions and limits](experiments/browser-hls/README.md).

The [CI workflow](.github/workflows/ci.yml) runs the prototype tests on Linux/macOS with Node.js 22/24, plus repository-documentation checks. There is no npm install or extension build step yet.

## Ways to contribute now

- Review the [foundation plan](docs/plans/2026-11-17-project-foundation.md) and browser lifecycle assumptions.
- Improve reproducible, synthetic download fixtures and failure cases.
- Review the side-panel flows in [DESIGN.md](DESIGN.md).
- Propose an adapter with its supported inputs, recovery behavior and test evidence.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before sending a change. Never attach account cookies, signed media URLs, browsing histories, or downloaded third-party media to issues.

## Agent-assisted development

[AGENTS.md](AGENTS.md) is the shared repository harness. [CLAUDE.md](CLAUDE.md) imports it with `@AGENTS.md`, keeping Codex and Claude aligned on architecture, supported commands and verification. Neither requires a personal plugin installation. Start with the [agent workflow](docs/contributing/agent-workflow.md).

## Project identity

gDownloader is an independent browser-first project. It is not affiliated with other download tools sharing the same name; see the [naming notes](docs/naming.md).

## License

Original project code is provided under the [MIT License](LICENSE). Third-party dependencies and future media-engine distributions retain their own licenses; distribution review is required before a release. See [third-party policy](docs/third-party.md).
