docker-utils
==============
![docker-utils](https://github.com/dictcp/docker-utils/workflows/docker-utils/badge.svg?branch=master)
![Docker Pulls](https://img.shields.io/docker/pulls/dictcp/utils)
![Docker Image Size (latest semver)](https://img.shields.io/docker/image-size/dictcp/utils?sort=semver)

A simple docker image with various tools built-in. Example usage:

```bash
docker run --rm -it dictcp/utils /bin/bash
# OR docker run --rm -it ghcr.io/dictcp/utils /bin/bash
```

Supported tags and respective Dockerfile links
----
- [`ubuntu2404`, `ubuntu`, `latest`](https://github.com/dictcp/docker-utils/blob/master/Dockerfile.ubuntu2404)
- [`ubuntu2204`](https://github.com/dictcp/docker-utils/blob/master/Dockerfile.ubuntu2204)
- [`ubuntu2004`](https://github.com/dictcp/docker-utils/blob/master/Dockerfile.ubuntu2004)
- [`ubuntu1804`](https://github.com/dictcp/docker-utils/blob/master/Dockerfile.ubuntu1804)
- [`alpine`](https://github.com/dictcp/docker-utils/blob/master/Dockerfile.alpine)

Supported arch
----
- x86-64 (aka. `linux/amd64` platform in Docker)
- ~armv7~
- armv8 (aka. `linux/arm64` platform in Docker)
