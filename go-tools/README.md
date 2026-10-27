# Go utility dependency graphs

- Each `go.mod`/`go.sum` locks a released CLI source module and compatible transitive dependencies. Go `tool` directives keep the command dependency visible to `go mod tidy`.
- The builder uses `go build -mod=readonly` so dependency changes must be reviewed in these files rather than silently selected during an image build.
- Source releases remain wireproxy v1.1.3, Tailscale/DERP v1.104.2, and SNIProxy v1.6.1. Updating their transitive modules fixes advisories that remain in the upstream release graphs.
- SNIProxy v1.6.1 needs `patches/sniproxy-v1.6.1-dnsproxy.patch` for current dnsproxy APIs: constructor-based configuration, context-aware lifecycle/requests, and the handler interface. Docker downloads the checksum-verified source release, copies it, applies that patch, and adds a build-local replacement. The module cache is not edited.
- To update a graph, enter its directory and run `go get <module>@<version>` followed by `go mod tidy`. Verify its source release stays pinned. Pre-1.0 libraries can break APIs across minor versions.
- The DNS integration check is `node tests/sniproxy-smoke.ts /path/to/sniproxy`. It uses loopback sockets and a local DNS stub to verify UDP/TCP rewriting, upstream forwarding, and graceful shutdown without contacting the public network.
- Upstream wireproxy configuration tests and Tailscale DERP command tests run against these graphs. Container CLI and DNS checks validate the final image.

- The Ubuntu 26.04 recipe separately rebuilds Canonical Pebble v1.33.2 with Go 1.27.3. Its base-image copy was compiled with Go 1.27.1; the stable upstream update addresses those standard-library advisories without changing the target OS.
