# Armok’s Chronicle

*Every world a history. Every downfall a story.*

A local-first Dwarf Fortress Legends explorer, built with semantic HTML, CSS, and native JavaScript modules. An unofficial fan project, independent of Bay 12 Games and DFHack.

## Current edition: foundation

Implemented: responsive archive shell, hash navigation, dark/parchment reading themes, keyboard focus handling, field guide, and background preview of local export headers and sizes.

World parsing, persistent archives, searching, maps (including optional Raised Relief), biographies, and records are planned, not yet implemented. File preview reads up to 8 KiB per file and does not upload or save exports.

See [PLAN.md](PLAN.md) for the development checklist and [architecture](docs/architecture.md) for module boundaries and the worker protocol.

## Run locally

From the repository directory, run:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000/. No npm install, compilation, or build is needed. Opening index.html using file:// is not supported by browser module/worker security rules.

## GitHub Pages

In repository **Settings → Pages**, select:

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/ (root)**

Save. Once GitHub publishes the branch, the site should be available at https://mbaldwinsmith.github.io/armoks-chronicle/.

All deployable assets are committed. `.nojekyll` disables Jekyll processing. No custom build/deploy Action is needed; GitHub's own Pages publishing infrastructure may still appear in Actions. Pages settings and live publication must be verified separately from local checks.

## Export preview

Choose standard `legends.xml` and any matching `legends_plus.xml`, `world_map.csv`, `world_history.txt`, and `world_sites_and_pops.txt` files. The foundation edition identifies likely types and displays sizes. It does not check complete XML validity or confirm that files belong to the same world.

## Tests

The browser smoke test is optional development tooling. Install Playwright and its Chromium browser in your development environment, then start a static server from the repository's parent directory on port 8000 and run:

```sh
node tests/smoke.cjs
```

The default URL is http://127.0.0.1:8000/armoks-chronicle/; set `BASE_URL` to override it. These tests do not build production assets. See [verification notes](docs/verification.md) for checks and remaining limits.

## Licence

MIT © 2026 Mark Baldwin-Smith. See [LICENSE](LICENSE). No third-party runtime libraries are bundled in this edition.
