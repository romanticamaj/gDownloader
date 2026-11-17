# Adding a download capability

This guide describes the planned contribution boundary; exact interfaces will
stabilize after the first extension capability spike.

## Choose the owning layer

| Change | Owner |
|---|---|
| New job state, retry or queue rule | `packages/core` |
| New manifest syntax or media assembly plan | `packages/media` |
| Browser capture, request context, OPFS or native download bridge | `apps/extension/src/platform` — planned |
| Resource list, recovery action or user setting | `apps/extension/src/features` — planned |
| Reusable accessible control/token | `packages/ui` |

Propose a native companion or new package only when a concrete capability needs it.

## Describe the contract

Include supported inputs, how it identifies a resource, required access, selected
tracks/container, memory/disk behavior and completion evidence. Explain pause,
restart, source refresh and export retry separately.

Provide one success fixture and meaningful failure fixtures. A live URL that
requires your account is not an independently reproducible test. A site adapter
is not allowed to run arbitrary remote code or bypass the extension's permission
boundary.

## Review checklist

- Wrong data cannot be silently appended to an existing download after a URL refresh.
- A long transfer cannot grow an unbounded queue behind a slow write.
- Committed bytes survive cancellation and coordinator interruption as documented.
- Success means the output was saved, not merely downloaded or muxed.
- Unsupported input produces an actionable state and preserves useful work.
- New dependencies, permissions and licensing are explained in the PR.
