# Media — planned

Owns content classification, playlist parsing, track selection and an explicit
assembly plan. Starts with clear MPEG-TS HLS VOD. No implementation exists yet.

The output is a data plan, not privileged fetch activity. It may use core domain
types; it cannot import the extension app or UI.

fMP4 initialization data, byte ranges, separate tracks and discontinuities require
their own tested plans before being supported. Unknown layouts fail explicitly.
Container assembly execution is provided by a platform/muxer adapter.
