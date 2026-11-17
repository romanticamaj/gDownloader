# UI direction

Status: proposed design system and text wireframe. No implemented product screens.

## Product experience

The primary surface is a Chrome side panel, opened from the toolbar action.
Keep the page visible while people choose resources or check transfers. Avoid a
popup-only interface that disappears when focus moves. Use a full manager page
later if the task list genuinely outgrows the panel.
[Chrome sidePanel reference](https://developer.chrome.com/docs/extensions/reference/api/sidePanel)

The visual reference is a well-made file-transfer utility: readable rows, clear
file names, stable progress, restrained controls. The memorable element is a thin
blue transfer rail that changes to a saved-state check; no decorative dashboard,
invented statistics or repeated floating cards.

## Tokens — proposal

| Token | Value | Use |
|---|---|---|
| Canvas | `#F7F9FC` | Panel background |
| Surface | `#FFFFFF` | Lists and dialogs |
| Text | `#17243B` | Main content |
| Secondary | `#526079` | Supporting labels |
| Action | `#245AE8` | Primary action and progress |
| Divider | `#DCE3EF` | Row structure |

Define accessible success/error/focus tokens during UI implementation and measure
contrast; don't infer accessibility from a palette alone. Offer light/system mode
first and add a tested dark palette rather than mechanically inverting colors.

Use a locally available system sans-serif stack and tabular numerals for changing
counts. No remote font request. Suggested scale: 14px body, 12px supporting text,
18px section heading; 4/8/12/16/24px spacing; 6px control and 10px dialog corners.

## Panel layout

Target a 360–480px panel and keep narrower layouts usable without horizontal scroll.
Left-align content. Allow long titles to wrap or reveal their full value on demand.
Use a compact header and ordinary rows instead of several dashboards inside a panel.

```text
gDownloader                          Settings

Resources (2)         Downloads (1)
─────────────────────────────────────────────
Example lesson
Video · 720p · MP4                    Download

Project archive
ZIP · 182 MB                         Download
─────────────────────────────────────────────
Example recording                    Pause  ⋯
Downloading     1.2 GB / size unknown
━━━━━━━━━━━━━━━━╸
3.4 MB/s
```

This is illustrative layout copy, not a screenshot or implemented result. Format
and resolution help a user choose; OPFS, WASM, segment filenames and signed URLs
belong in optional diagnostics, not the default product flow.

## Required states

| State | Message intent | Primary action |
|---|---|---|
| No host access | Explain which site access is needed | Allow this site |
| No resource | Ask user to start playback or add a URL | Add URL |
| Resource available | Name, type/quality and known size | Download |
| Downloading | Bytes/segments with truthful denominator | Pause, if supported |
| Paused | Work is retained; show backend limitation | Resume/restart as applicable |
| Source expired | Completed work retained; fresh source required | Get fresh source |
| Storage full | Explain temporary space needed | Manage temporary files |
| Assembling | Final file is being prepared | Cancel |
| Exporting | Downloaded bytes are not saved yet | Retry save on failure |
| Completed | Browser confirmed final save | Show in folder |
| Unsupported | State the unsupported format/capability | View details |

Example Traditional Chinese recovery copy:

> 來源已過期，已保留完成的部分。重新開啟原頁面後，再取得來源繼續下載。

Do not call this “resume” when the backend must redownload from the beginning.
Do not show a fixed ETA for an unknown or unstable total. Announce complete only
after the save confirmation, not after the last HTTP response.

## Accessibility and interaction

- Keyboard can reach tabs, resource actions, pause/retry and settings.
- Visible focus and accessible names are required for icon-only actions.
- Progress updates use throttled announcements; do not read every chunk aloud.
- State and errors use words/icons as well as color. Respect reduced motion.
- Start with semantic controls; add component abstractions only for repeated needs.
- Keep technical details available in a redacted diagnostics view.

Before UI implementation, make a small clickable mockup covering ready, active,
expired-source, export-failure and completed states. Review it at actual panel width.
