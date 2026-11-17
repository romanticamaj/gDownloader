# Security and sensitive reports

No extension release has been published. The repository currently contains an
experimental prototype and project documentation; no production extension version
is supported yet.

Report suspected vulnerabilities through [GitHub private vulnerability reporting](https://github.com/romanticamaj/gDownloader/security/advisories/new).
Private reporting is enabled for this repository and routes reports to its owner,
[@romanticamaj](https://github.com/romanticamaj).

Do not submit live credentials, exploitable private URLs or personal download
histories in public issues. Provide a minimal reproduction and sanitized evidence
through the private reporting flow instead. No response-time guarantee is offered.

## Design requirements

- A website must not be able to turn the extension into an unrestricted fetch,
  filesystem or native-program proxy.
- Validate messages, sender context, requested targets and permissions at the
  privileged boundary. Remote configuration is data, never executable code.
- Export diagnostics without credentials or raw signed URLs by default.
- Request host access with a clear user action and scope; explain additional
  media-origin access when a page uses another host.
- Treat quota errors, missing files and partial exports as incomplete work.

Release readiness requires a permission inventory, dependency/binary license
review and local fixture coverage. See [architecture](docs/architecture.md).
