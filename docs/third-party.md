# Third-party code and media engines

Original project code uses MIT. Existing project research is linked in
[the research report](research/2026-11-17-download-tools.zh-TW.md); linking a project
does not import its implementation or grant a different license to its code.

- Preserve attribution and license notices for any deliberately imported source.
- Do not copy Cat Catch implementation into this MIT codebase without a specific
  licensing decision; its current project license is GPL-3.0.
- HLS Downloader is an MIT-licensed reference, not currently a vendored dependency.
- FFmpeg licensing depends on the actual build and included components. Choose
  and review the precise WASM/native artifact before redistributing it. Do not
  label every FFmpeg binary as MIT because our wrapper is MIT.
- Pin dependencies and commit a lockfile once the workspace is created. Bundle
  extension executable code rather than loading remote scripts at runtime.
- Generate test media locally or use fixtures with explicit redistribution rights.

No media-engine binary, third-party source tree or downloaded media is bundled
in this foundation repository.
