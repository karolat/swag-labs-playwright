#!/usr/bin/env bash
set -euo pipefail

PLAYWRIGHT_VERSION=$(node -e "console.log(require('./package.json').devDependencies['@playwright/test'].replace(/[^0-9.]/g,''))")
PLAYWRIGHT_IMAGE="mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
TMP_NODE_MODULES_DIR=$(mktemp -d)
TMP_NPM_CACHE_DIR=$(mktemp -d)

# Create a temporary Docker config to avoid credential-helper errors
tmp_docker_config=$(mktemp -d)
printf '{"auths":{}}' > "$tmp_docker_config/config.json"
cleanup() {
  rm -rf "$tmp_docker_config"
  rm -rf "$TMP_NODE_MODULES_DIR" "$TMP_NPM_CACHE_DIR"
}
trap cleanup EXIT

DOCKER_CONFIG="$tmp_docker_config" docker run --rm --ipc=host \
  -e npm_config_cache=/tmp/.npm \
  -u "$(id -u):$(id -g)" \
  -v "$REPO_ROOT":/work \
  -v "$TMP_NODE_MODULES_DIR":/work/node_modules \
  -v "$TMP_NPM_CACHE_DIR":/tmp/.npm \
  -w /work \
  "$PLAYWRIGHT_IMAGE" \
  /bin/bash -lc "npm install --no-audit --no-fund --package-lock=false && npm install --no-audit --no-fund --package-lock=false --no-save @playwright/test@${PLAYWRIGHT_VERSION} && npm run test:visual:update"
