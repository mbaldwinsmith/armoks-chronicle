# Vendored dependencies

## sax 1.6.1

Source: https://github.com/isaacs/sax-js (npm package sax@1.6.1). Licence: Blue Oak Model License 1.0.0; see sax-LICENSE.md.

The implementation is unchanged. A local `const sax = {}` and final ES module export replace the original CommonJS/global wrapper so it can run in a module worker without a build or Node dependencies. The unused Node Stream branch remains guarded by the upstream try/catch.

SHA-256 of committed sax.js: 7abf57096be37afc90bd3f98a21836fd5f36cb8886b85c79ef51a7db9b6f35f1

To update: review the upstream release, repeat only this wrapper adaptation, update licence/checksum, and run parser and browser import tests. Do not load from a CDN.

Storage uses a small application-specific native IndexedDB module. No database wrapper is bundled in this iteration; transactional staging and indexed queries are verified directly.
