#!/usr/bin/env bash
#------------------------------------------------------------------------------
# Cloudflare Workers (Static Assets) 用ビルドスクリプト。
#
# Cloudflare のビルドイメージには Hugo がプリインストールされているが、
# 既定版は固定されておらず、ダッシュボードの HUGO_VERSION 変数で上書きすると
# extended 版ではなく standard 版が入る（= Sass/WebP が使えない）。
# そのためツール版はこのスクリプト内で固定し、ローカルと CI の差分をなくす。
#
# Go はイメージ同梱のものを使う（go.mod の go ディレクティブを 1.23.0 に
# 抑えてあるため、イメージ既定の Go で Hugo Modules を解決できる）。
#------------------------------------------------------------------------------

set -euo pipefail

HUGO_VERSION=0.165.0

# ビルド時のタイムゾーン（日付の表示揺れを防ぐ）
export TZ=Asia/Tokyo

# Hugo Modules のキャッシュ先。Cloudflare のビルドキャッシュに乗せる
export HUGO_CACHEDIR="${PWD}/.cache/hugo"

build_temp_dir=""
cleanup() {
  if [[ -n "${build_temp_dir}" && -d "${build_temp_dir}" ]]; then
    rm -rf "${build_temp_dir}"
  fi
}
trap cleanup EXIT SIGINT SIGTERM

main() {
  build_temp_dir="$(mktemp -d)"

  # ローカル実行時に既に同じ版の Hugo があればダウンロードを省く
  if command -v hugo &>/dev/null && hugo version | grep -q "v${HUGO_VERSION}.*+extended"; then
    echo "Hugo ${HUGO_VERSION} (extended) は導入済み。ダウンロードを省略します。"
  else
    echo "Installing Hugo ${HUGO_VERSION} (extended)..."
    curl -sfL --output-dir "${build_temp_dir}" -O \
      "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz"
    mkdir -p "${HOME}/.local/hugo"
    tar -C "${HOME}/.local/hugo" -xf "${build_temp_dir}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz"
    export PATH="${HOME}/.local/hugo:${PATH}"
  fi

  echo "Logging tool versions..."
  echo "Hugo: $(hugo version)"
  command -v go &>/dev/null && echo "Go: $(go version)" || echo "Go: not installed"

  echo "Building the project..."
  hugo build --gc --minify
}

main "$@"
