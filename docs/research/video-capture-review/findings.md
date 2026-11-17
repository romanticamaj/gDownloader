# Findings

## Repository inspection

- No extension manifest, content script, title resolver, multi-job scheduler,
  SourceLease, destination service or browser E2E exists.
- Architecture currently chooses side-panel-first and browser default Downloads;
  those choices do not yet satisfy an inline per-video button or arbitrary directory.
- Prototype concurrency controls requests within one run; it is not a global queue.
- Prototype requires data-video-id, recognizes specific playlist names, rejects
  KEY/MAP/BYTERANGE/DISCONTINUITY and only handles completed MPEG-TS HLS.
- Expiry results in stopping on most 4xx. A fresh signed source can be supplied
  manually with a matching checkpoint; there is no expiry detector or refresh provider.
- Prototype file naming is generic; no DOM metadata/title extraction is implemented.
- Current harness checks seven Node prototype tests plus Markdown links and CLAUDE
  import consistency. It does not test an installed extension or actual browser save.

## Verified primary-source constraints

- Chrome downloads filename is relative to default Downloads; absolute paths and
  parent traversal are errors. Arbitrary chosen roots need a separate destination backend.
- File System Access requires an actual user gesture for a picker; handles may be
  persisted in IndexedDB but permission must be rechecked.
- activeTab is granted after invocation, not automatically on every site. It does
  not grant all cross-origin frame/media hosts.
- Content script frame coverage and MAIN/ISOLATED worlds must be specified, not
  inferred from permission to the parent page.
- Chrome has chrome.dom.openOrClosedShadowRoot; closed shadow roots are not an
  automatic impossibility. Cross-origin frames and fullscreen/PiP still need their own handling.
- Chrome runtime messaging uses JSON serialization, not arbitrary transferable
  ArrayBuffer channels. A page-context media-byte bridge is a feasibility item,
  not solved by adding postMessage to an architecture diagram.
- HTTP resume must distinguish 206 with matching Content-Range/validators from
  200/full-body and 416; never append an unexpected full representation.
- File System Access export has no Chrome download ID; completion must use a
  backend-specific receipt, not always chrome.downloads.onChanged.
- Source expiry is not generally derivable from Blob UUIDs or arbitrary URL
  numbers, and HTTP 403 alone does not prove expiry. A refresh provider is required.
