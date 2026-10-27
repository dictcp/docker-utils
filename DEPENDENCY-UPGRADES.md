# Dependency upgrade validation (2026-10-27)

- Minor track: latest stable releases within each component's existing semantic major. Pre-1.0 changes can still break compatibility.
- Alpine 3.22 → 3.24.3; Go 1.26.3 → 1.27.3; wireproxy 1.1.2 → 1.1.3; DERP server 1.98.8 → 1.104.2. SNIProxy 1.6.1 is already its latest stable release.
- Named Ubuntu variants preserve their target distributions. Active recipes fetch current distribution packages when built; historical Ubuntu 18.04 and 20.04 recipes remain unsupported examples. Their security cannot be guaranteed without the appropriate extended support arrangements.
- All five active variants (`alpine`, `full`, `ubuntu2204`, `ubuntu2404`, `ubuntu2604`) built on linux/amd64. Updated Alpine/full CLI smoke checks passed without network access. ARM and RISC-V builds were not executed locally.

## Security results

Trivy 0.76.1 scanned both the baseline and updated Alpine/full images using the same vulnerability database. Counts are package/advisory instances, not unique exploitable defects.

| Image | Before | After | After critical / high |
| --- | ---: | ---: | ---: |
| Alpine | 7 | 7 | 0 / 4 |
| Full | 2279 | 2151 | 7 / 206 |

- Full-image updates remove 128 reported instances, including Go standard-library findings. Seven critical distribution findings remain in gawk, HAProxy, iperf3/libiperf, Linux headers, and OpenSSH; the scanner lists no fixed distribution version. Upstream Go binaries also retain vulnerable transitive dependencies even at their latest stable releases.
- Alpine findings refer to pip's bundled/SBOM packages (msgpack 1.1.2, setuptools 70.3.0, urllib3 2.7.0). Separately installed setuptools 84.2.1 and urllib3 2.8.0 are current, but this does not prove pip's vendored code is unaffected. These findings remain open.
- The full build's upstream binaries print imperfect embedded version strings (`wireproxy 1.0.8-dev`, DERP `1.104.2-ERR-BuildInfo`); the Go install commands and build module metadata identify the selected source versions.
- Reproduce with `docker build --pull -f Dockerfile.full -t utils-audit .` followed by `trivy image --scanners vuln utils-audit`. Scan every deployment image again before use.
- Existing workflows still rely on a retired Ubuntu 18.04 scanner runner and a RISC-V runner label not recognized by actionlint. The minor branch preserves action major versions and cannot modernize all unsupported action runtimes. The separate latest track repairs the scanner workflows; the publishing runner arrangement still needs verification.
