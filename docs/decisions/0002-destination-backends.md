# 0002 — Separate download destinations and completion receipts

Status: proposed; capability validation required. Date: 2026-11-17.

## Context

The foundation assumed Chrome Downloads first and required Chrome completion for
every finished job. The user now requires an arbitrary chosen download directory.
The Downloads API filename option accepts a relative path inside Downloads, not
an arbitrary absolute destination. File System Access is a separate permission
and write lifecycle. [Downloads API](https://developer.chrome.com/docs/extensions/reference/api/downloads),
[File System Access](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access).

## Proposed decision

Introduce a DestinationManager and two export adapters: Chrome Downloads and a
user-chosen directory handle. Use an extension-controlled top-level settings or
manager page for the picker; validate it in an installed build before claiming
support. Persist handles where supported and recheck permission on use.

Completion consumes a backend-specific ExportReceipt after artifact validation:
Chrome's completed event or a successful directory writable close and size check.
Retain staged bytes when export fails. Explicitly selected directories never
silently fall back to Downloads. Output collision handling never silently overwrites.

## Consequences and alternatives

Native Chrome transfers remain useful in Downloads mode. Chosen-directory HTTP
jobs need managed streaming instead of assuming Chrome can target that path.
Both modes need real saved-file tests, separate from OPFS staging checks.
Staging and final output can require substantial combined disk space; quota/target
failures must be visible before data is discarded.

Using only saveAs would provide repeated per-file dialogs rather than the requested
remembered folder. A native companion is deferred until measured browser gates
show it is needed. No product code or minimum Chrome version is decided here.
