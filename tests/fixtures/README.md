# Fixture policy

Generate redistributable H.264/AAC fixtures with local FFmpeg where possible.
Keep ordinary CI fixtures small; generate large stress data outside the repository.

Initial matrix to implement:

- Standard HLS and `.txt` playlists with generic MIME.
- Bare MPEG-TS bytes with misleading `.png` names; real images must not be mistaken for media.
- Relative paths, redirects and a player inside a cross-origin iframe.
- HTTP 403/source expiry, 429/Retry-After, 503, truncated/stalled response bodies.
- Cancellation, quota exhaustion, missing/truncated committed files and export interruption.
- Supported and unsupported initialization/track/discontinuity layouts.

Do not commit real downloaded movies, browser profiles, session headers or signed
CDN links. State what each fixture proves and what it does not prove. Fixtures for
ordering checks can be tiny packets; decode-integrity tests require valid media.
