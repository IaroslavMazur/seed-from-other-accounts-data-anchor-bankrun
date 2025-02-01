This repository contains a minimal reproducible example demonstrating an issue with the Bankrun provider for Anchor in TypeScript tests. Specifically, it highlights the error encountered when creating a PDA that uses another account's data field as a seed—resulting in the "Reached maximum depth for account resolution" error.

Uncomment the `.accountsPartial()` statement (and comment the `.accounts` one) to see the PDA account address being resolved correctly.
