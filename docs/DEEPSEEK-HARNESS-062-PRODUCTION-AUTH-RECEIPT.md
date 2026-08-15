# DeepSeek Harness plugin 0.6.2 production-auth receipt

Date: 2026-08-15 EDT

Outcome: **PRODUCTION_AUTH_PARTIAL_PASS** for fresh Device Flow, bounded account data, connected Apply/Revert, connection-preserving remount, and Disconnect. **CONNECTED_ACTIVITY_FAIL** because two successful connected Applies produced no observable `/plugin/deepseek-harness/use` request.

## Proven from the public package

- The loaded artifact was the public npm `@dexthemes/deepseek-harness-plugin@0.6.2` package.
- Fresh GitHub Device Flow completed and the plugin entered its connected state.
- The account panel showed six published themes and eight achievements.
- A connected Apply changed the Harness theme and Revert restored the previous/default state.
- Remounting the DexThemes surface preserved the in-memory connection.
- Disconnect returned the plugin to anonymous behavior.

## Exact failed boundary

Two connected Applies produced no observable request to `/plugin/deepseek-harness/use`. Therefore this receipt does not prove a new Connected Apps last-used timestamp or client-reported Apply count. **Deep Current** was already unlocked before the fresh connection, so the observed eight achievements also do not prove that this Device Flow newly awarded **Harnessed** / **Deep Current**.

The ignored local evidence artifact is not production data and is not used here beyond the bounded facts above.

## Unreleased repair boundary

The `0.6.3` source change routes both card and preview Apply actions through one explicit coordinator after Harness accepts the theme. The account client exposes bounded recording, acknowledgement, and failure states; a failed request retains only its random UUID in memory, and retry reuses that UUID so an ambiguous response cannot double count. The request remains limited to the receipt and normalized plugin version. Anonymous Apply/Revert still sends no account request.

Source tests and builds are not loaded-runtime proof. A reviewed `0.6.3` package must be installed from its eventual public artifact, connected through a fresh production Device Flow, and observed sending and receiving `/plugin/deepseek-harness/use` before Connected Apps activity is considered proven.
