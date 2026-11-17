# UI — planned

Shared tokens and the few primitives used across the extension side panel and
options. React is the proposed framework, not installed yet.

Owns typography, spacing, colors, accessible controls and reusable visual states.
Feature orchestration stays in the extension app. Components cannot request
permissions, start transfers or write files.

Start from [DESIGN.md](../../DESIGN.md), then extract components when at least
two real screens need them. Do not build a general-purpose design-system library
before the product flows exist.
