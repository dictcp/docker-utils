# Dependency upgrade validation (2026-10-27)

- Latest track: upgrade existing exact source/runtime versions to their latest supported stable releases. Existing floating selectors stay exactly as declared: GitHub Action aliases/branches, Alpine `3.22`, Debian `trixie-slim`, and named Ubuntu release channels.
- Exact upgrades retained: Go 1.26.3 -> 1.27.3, wireproxy 1.1.2 -> 1.1.3, DERP 1.98.8 -> 1.104.2. SNIProxy 1.6.1 is already its latest stable source release.
- Per-tool Go module graphs patch vulnerable transitive dependencies. SNIProxy's small source patch adapts dnsproxy 0.86.0 / quic-go 0.64.1. Released source checksums are verified before patching; an untagged development head is not selected.
- Ubuntu 26.04 explicitly refreshes `zlib1g`. Pebble remains supplied by the floating Ubuntu base image; no separate source release, builder, binary replacement or version pin is added. The newly introduced Docker frontend reference was also removed; the default frontend parses the existing build instructions.
- Named Ubuntu variants and historical Ubuntu 18.04/20.04 examples remain unchanged as requested.

## Validation and security

- All five active amd64 recipes built during the initial upgrade. Exact full-image source/runtime/Go graphs are unchanged by this correction, so their upstream wireproxy/DERP tests and final-container UDP/TCP DNS integration results remain applicable. The default Docker frontend build-check passes.
- Corrected Alpine and Ubuntu 26.04 recipes were freshly rebuilt with `docker build --pull` and passed CLI smoke checks. Their new scans supersede earlier scans made with the removed Alpine/Pebble pins.
- Trivy 0.76.1 package/advisory instances (including headers, not unique exploitable flaws):

| Image | Initial baseline | Validated updated snapshot | Remaining critical / high |
| --- | ---: | ---: | ---: |
| Alpine | 7 | 7 (fresh corrected build) | 0 / 4 |
| Full | 2279 | 2084 (unchanged exact dependency graph) | 7 / 176 |
| Ubuntu 22.04 | 71 | 71 (unchanged recipe) | 0 / 5 |
| Ubuntu 24.04 | 3079 | 3079 (unchanged recipe) | 14 / 373 |
| Ubuntu 26.04 | 3256 | 3242 (fresh corrected build) | 12 / 284 |

- Floating image channels can move. Fresh `ubuntu:26.04` digest `sha256:19fcd1bf268f02b60aca3bd30bd8a6d9a11759a430e32921833e65f16d87348a` already embeds Pebble built with Go 1.27.3; Trivy reports no findings for that binary. This vendor base-image change is not attributed to a project-maintained Pebble pin. Digests here are evidence only, not Dockerfile pins.
- The full graph removes 195 prior findings. Its three project-built Go utilities have no high/critical/medium findings in the recorded scan; each retains UNKNOWN `GO-2026-5932` in x/crypto 0.58.0 with no fixed version listed.
- Critical/high distribution findings remain. Alpine's seven findings include pip-vendored/SBOM dependencies. Current standalone package versions do not prove those vendored copies safe. See the PR security table before deploying.
- The existing Trivy workflow retains the compatible five-image matrix, native SARIF format and scoped upload permission fixes, using its original floating action references and runner. The ShiftLeft component and original inputs remain unchanged.
- All originally floating GitHub Action refs are preserved. Actionlint reports exactly the baseline diagnostics: obsolete checkout v1/v2 runtimes, the custom `ubuntu-24.04-riscv` label and retired `ubuntu-18.04` runner. This is baseline-equivalent validation, not a clean actionlint result. The publishing workflow additionally rebuilds on Go graph/source patch changes.
- No ARM/RISC-V execution or deployment integration was performed. GitHub has reported no PR checks for these branches; legacy CI limitations and known security findings remain draft blockers.
- Reproduce the full build with `docker build --pull -f Dockerfile.full -t utils-audit .`; run `node tests/sniproxy-smoke.ts /path/to/sniproxy` for isolated DNS checks. See [go-tools/README.md](go-tools/README.md) for graph maintenance.
