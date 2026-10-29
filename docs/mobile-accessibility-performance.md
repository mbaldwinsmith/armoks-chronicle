# Mobile Usability, Accessibility and Performance Pass

## Scope and changes

This pass improves the existing static app without a framework, build step, dependency download, database migration or source-data changes.

- Narrow layouts use larger navigation/action targets, 16px input text, flexible pagination and one-column filters on the smallest screens. Names, filenames, report cells and record headings wrap. Population tables stay within their container; wide ranking tables and relationship diagrams keep named, keyboard-focusable scroll regions.
- Shared text/accent tokens meet 4.5:1 against all three theme surfaces in the automated palette checks. Control outlines use the stronger muted token. Low-opacity Bestiary aside text is restored to full opacity. Focus outlines remain visible. Forced-colour rules preserve control boundaries and focus; biome/faction swatches retain their authored colours alongside textual labels.
- Main landmarks are named by their current page heading. Skip-link and route focus remain supported. Archive deletion opens on the safe Keep World button and closing restores focus to the trigger when still visible. Existing polite import, search, report and record statuses remain in place.
- Reduced-motion rules cover all elements and pseudo-elements, including transitions and smooth scrolling. The app has no animated camera movement.
- The atlas keeps main view/zoom/site/coordinate controls available while putting secondary settlement/conflict filters in a native disclosure. One-pointer pan and two-pointer pinch use separate state; cancelled or completed pinches cannot become accidental tile selections. Touch marker hit areas are enlarged, with same-tile results retaining their linked list. Coordinates and site selection remain alternatives to map gestures.
- Atlas paints are coalesced to one pending animation frame. Closing cancels pending paint. Relief paint order is cached, offscreen site markers are skipped, repeated hover text is suppressed, and unchanged resize notifications do not reset zoom.
- Specialist views load through native dynamic imports, guarded against stale navigation and retaining cancellation/unsaved-research protection. Failed module loads show an actionable message. The initial bookshelf no longer fetches all explorers.

## Reproducible checks

Run `node --test tests/*.test.mjs tests/preview.cjs`, then serve the repository and run `tests/browser.html`. The ordinary browser runner imports independently authored disposable fixtures and runs `tests/usability.js` before its existing cleanup. It checks 19 primary routes at both 320px and 390px iframe widths: document overflow, visible heading count, main landmark association, labelled inputs, 16px input text and 44px buttons/navigation. It also checks report reflow with 200% root text size and asserts that the bookshelf did not fetch specialist modules. `tests/mobile.html` is an optional manual preview of the real app at selected CSS widths, using saved archives without changing them.

Five new Node tests cover coalesced/cancelled paints, pointer taps versus drags, pinch/finger-lift behaviour, cancellation recovery and both shared colour palettes. The complete Node suite passes 366 tests.

The static eager JavaScript dependency graph drops from 61 modules / 548,298 uncompressed source bytes to 14 modules / 52,651 bytes (about 90% fewer source bytes). These counts follow static imports from `js/app.js`; they exclude HTML/CSS, workers started later, HTTP compression and cache effects. They demonstrate deferred code, not a measured phone startup-time guarantee. Browser resource checks verify that deferred specialist modules remain unfetched on the bookshelf.

## Qualification limits

CSS-width iframe checks exercise real responsive layout in Chromium. They do not certify physical phones, iOS Safari, Android browser chrome, touch hardware, operating-system magnification, screen-reader speech output or low-memory imports. Enlarging root text is a text reflow check, not full browser zoom. Keyboard/DOM/accessibility-tree checks and palette calculations are not a WCAG conformance certification. Full NVDA/VoiceOver journeys, physical-device pinch testing, browser zoom and OS forced-colour/reduced-motion checks, Firefox/Safari qualification, large-world reference-device timings and memory profiling remain open in PLAN.md.

Verified on 29 October 2026 against production JavaScript cohort `0.33.0`, the enlarged-action-label CSS fix `0.33.1` (commit `74452c0257ca14abb30f12d2e84cb3fe22fbdef3`) and browser harness `0.33.0.3`. The full live Chromium suite ended **ALL TESTS PASSED**. Its 19-route checks passed at both 320px and 390px, including strict document/client-width comparisons, a 500-character unbroken figure heading and labelled 44px controls. The report dossier also passed the 200% root-text-size reflow check. The bookshelf requested 14 JavaScript module resources at each width.

Manual narrow-layout checks covered keyboard Enter navigation, named main focus, the skip link, keyboard theme activation, and safe dialog focus: Keep World on opening, Escape dismissal, focus returned to Delete World. The suite’s exact-run recovery removed only an explicitly identified interrupted fictional fixture run before its normal isolation checks; the final run removed its own fixtures and preserved existing archives.

The first enlarged-text check identified an overflowing action label; action labels now wrap. The harness was also made independent of background iframe animation-frame callbacks and given explicit navigation-readiness checks. These are test infrastructure corrections, not additional product dependencies. No supplied original world content or findings were published.
