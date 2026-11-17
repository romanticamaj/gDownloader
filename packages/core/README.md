# Core — planned

Browser-independent download domain and scheduling rules. No implementation or
published package exists yet.

Owns job identities, state transitions, capability flags, bounded scheduling,
retry policy, checkpoint coordination and completion rules. Defines ports for
transport, durable metadata, segment storage and export.

Must not depend on Chrome, DOM, React or application feature code. Fake clocks
and deterministic fixtures may exercise domain rules; real disk/network adapters
need integration coverage too.

Do not turn this into a miscellaneous utilities package. Protocol-specific
parsing belongs to [media](../media/README.md).
