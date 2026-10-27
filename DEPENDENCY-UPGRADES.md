# Dependency upgrade validation (2026-10-27)

- Minor track: current stable releases within existing semantic major versions, with immutable action pins. Pre-1.0 minor upgrades may break APIs; the SNIProxy patch handles that library migration. Named OS variants remain deliberate targets.
- Alpine 3.22 → 3.24.3; Go 1.26.3 → 1.27.3; wireproxy 1.1.2 → 1.1.3; DERP server 1.98.8 → 1.104.2. SNIProxy 1.6.1 is already its latest stable source release.
- Tracked per-tool Go graphs patch dependencies that remain vulnerable in those upstream source releases. SNIProxy uses a small compatibility patch for dnsproxy 0.86.0 / quic-go 0.64.1. The source release is checksum-verified before copying and patching; untagged HEAD is not selected.
- Ubuntu 26.04 explicitly updates zlib1g and rebuilds Canonical Pebble v1.33.2 with Go 1.27.3. That stable upstream release addresses the old base-image binary's Go runtime advisories.
- Named Ubuntu variants preserve their distributions. Historical Ubuntu 18.04 and 20.04 recipes remain unsupported examples; they do not gain extended security support from these changes.
- All five active linux/amd64 recipes built. Modified Alpine/full/Ubuntu 26.04 images passed CLI smoke checks. Upstream wireproxy configuration tests, DERP command tests, and final-container UDP/TCP DNS rewrite/forwarding/shutdown integration passed. ARM/RISC-V runtime builds were not executed locally.

## Security results

Trivy 0.76.1 scanned current-source baseline and updated images with the same database. Counts are package/advisory instances, including development headers, not unique exploitable defects. The baseline is a fresh build of default-branch source, not an audit of deployed images.

| Image | Before | After | After critical / high |
| --- | ---: | ---: | ---: |
| Alpine | 7 | 7 | 0 / 4 |
| Full | 2279 | 2084 | 7 / 176 |
| Ubuntu 22.04 | 71 | 71 | 0 / 5 |
| Ubuntu 24.04 | 3079 | 3079 | 14 / 373 |
| Ubuntu 26.04 | 3256 | 3242 | 12 / 284 |

- Full-image updates remove 195 reported instances. Its three Go binaries have zero high/critical/medium findings; each retains UNKNOWN `GO-2026-5932` in x/crypto 0.58.0, for which the scanner lists no fixed version.
- Full-image critical distribution findings remain in gawk (CVE-2026-40468/40469), HAProxy (CVE-2026-55203), iperf3/libiperf (CVE-2026-101276), Linux headers (CVE-2026-93221), and OpenSSH (CVE-2026-60002). Across final scanned OS packages, the scanner lists no fixed distribution versions.
- Ubuntu 26.04's zlib CVE-2026-85091 and all fourteen Pebble Go runtime findings are fixed. A fresh apt build adds one vendor-unfixed libexpat1-dev finding (CVE-2025-66382), leaving a net reduction of fourteen instances for that image.
- Alpine's seven findings refer to pip's bundled/SBOM msgpack 1.1.2, setuptools 70.3.0, and urllib3 2.7.0. Independently installed setuptools 84.2.1 / urllib3 2.8.0 are current; that does not prove the vendored copies are unaffected. Findings remain open.
- Some upstream binaries report imperfect embedded versions (wireproxy `1.0.8-dev`, DERP `1.104.2-ERR-BuildInfo`); release pins and Go build metadata identify the selected source versions.
- Reproduce with `docker build --pull -f Dockerfile.full -t utils-audit .` and `trivy image --scanners vuln utils-audit`. Run `node tests/sniproxy-smoke.ts /path/to/sniproxy` for the isolated DNS check. See `go-tools/README.md` for dependency-graph maintenance.
- This minor track preserves existing action majors. Legacy security workflows still use obsolete action runtimes and the retired Ubuntu 18.04 runner; the independent latest track modernizes those scanners. Publishing now rebuilds when Go graphs or source patches change.
- Actionlint passes with the pre-existing `ubuntu-24.04-riscv` and retired `ubuntu-18.04` runner-label diagnostics suppressed. The publishing runner arrangement requires verification. GitHub currently reports no PR checks; local checks are the available execution evidence. This branch remains a draft because obsolete CI runtimes and security findings remain.
