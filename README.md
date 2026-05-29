docker-utils
==============

> ℹ️ Crafted for Personal Use · Best Effort Basis.


A simple docker image with various tools built-in. Example usage:

```bash
docker run --rm -it ghcr.io/dictcp/utils /bin/bash
```

Supported tags and respective Dockerfile links
----
- [`ubuntu2404`, `latest`, `lite`](https://github.com/dictcp/docker-utils/blob/master/Dockerfile.ubuntu2404)
- [`ubuntu2604`, `ubuntu`](https://github.com/dictcp/docker-utils/blob/master/Dockerfile.ubuntu2604)
- [`ubuntu2204`](https://github.com/dictcp/docker-utils/blob/master/Dockerfile.ubuntu2204)
- ~~`ubuntu2004`~~ EOLed
- ~~`ubuntu1804`~~ EOLed
- [`alpine`](https://github.com/dictcp/docker-utils/blob/master/Dockerfile.alpine)
- [`full`](https://github.com/dictcp/docker-utils/blob/master/Dockerfile.full) : bundles more utilities for my own use case

Supported arch
----
- x86-64 (aka. `linux/amd64` platform in Docker)
- armv8 (aka. `linux/arm64` platform in Docker)
- armv7 (aka. `linux/arm/v7` platform in Docker) **ONLY for ubuntu 24.04**
- riscv64 (aka. `linux/riscv64` platform in Docker) **ONLY for ubuntu 24.04**
  - Targets **RV64GC + lp64d ABI**, which covers the vast majority of RISC-V boards in the wild.
  - Ubuntu 26.04's riscv64 port raises the minimum ISA profile to include Zba/Zbb (bit manipulation) extensions. Many current cores — such as the T-Head C910 found in boards like the Sipeed LM3A / Scaleway EM-RV1 — do not implement these standard encodings, causing an immediate `SIGILL` at runtime. Ubuntu 24.04 stays on the conservative RV64GC baseline and runs correctly on those cores.
