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

HUGO_VERSION=0.168.0
# 上の版の hugo_extended_<版>_linux-amd64.tar.gz の SHA-256。値は GitHub Releases の hugo_<版>_checksums.txt から取り、
# 取得した tarball を自分でも sha256sum して一致を確かめてから書く。版を上げるときは必ず対で更新する（README「バージョン整合」）。
# Cloudflare のビルドは毎回この tarball を取得して実行するので、npm の integrity と go.sum の外にある唯一の実行物だった
# （2026-11-09 の監査 SEC-01、前回 F20）。配布元や経路が変わっていればここで止まる
HUGO_SHA256=787f100057328824f38c6ad7c87ff10d6451ae0a7bc39cedaad0dd2bcde17e53

# ビルド時のタイムゾーン（日付の表示揺れを防ぐ）
export TZ=Asia/Tokyo

# Hugo Modules のキャッシュ先。Cloudflare のビルドキャッシュに乗せる。
# Windows の Git Bash では $PWD が /c/Users/... 形式になり、Windows ネイティブの
# Hugo はそれを C:\c\Users\... と解釈してしまうため、cygpath で Windows 形式に直す
if command -v cygpath &>/dev/null; then
  export HUGO_CACHEDIR="$(cygpath -m "${PWD}")/.cache/hugo"
else
  export HUGO_CACHEDIR="${PWD}/.cache/hugo"
fi

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
  elif [[ "$(uname -s)" == MINGW* || "$(uname -s)" == MSYS* || "$(uname -s)" == CYGWIN* ]]; then
    # 以下の自動導入は Linux 用 tarball 固定なので、Windows では winget に任せる
    echo "Hugo ${HUGO_VERSION} (extended) が見つかりません。次で導入してください:" >&2
    echo "  winget install --id Hugo.Hugo.Extended --version ${HUGO_VERSION} --exact" >&2
    exit 1
  elif [[ "$(uname -s)" == Darwin ]]; then
    # macOS でも Linux 用 tarball を落とすと ~/.local/hugo の Mac 用バイナリを実行不能なもので
    # 上書きしてしまう（wrangler dev の子プロセスで PATH が通っていないと実際に起きた）。
    # 公式配布は .pkg のみなので、pkgutil で展開して中のバイナリだけ置く手順を案内して止まる
    echo "Hugo ${HUGO_VERSION} (extended) が見つかりません。次で導入してください:" >&2
    echo "  curl -fL -o /tmp/hugo.pkg https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_darwin-universal.pkg" >&2
    echo "  pkgutil --expand-full /tmp/hugo.pkg /tmp/hugo-pkg && mkdir -p ~/.local/hugo && cp /tmp/hugo-pkg/Payload/hugo ~/.local/hugo/hugo" >&2
    echo "  そのうえで ~/.local/hugo を PATH に入れる（~/.zshrc）" >&2
    exit 1
  else
    echo "Installing Hugo ${HUGO_VERSION} (extended)..."
    tarball="hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz"
    # 期限と再試行を置く（無いと GitHub が応答しないときビルド時間の上限まで待つ。2026-11-09 の監査 ERR-01）
    curl -sfL --max-time 120 --retry 2 --output-dir "${build_temp_dir}" -O \
      "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/${tarball}"
    echo "${HUGO_SHA256}  ${build_temp_dir}/${tarball}" | sha256sum -c - || {
      echo "Hugo の tarball の SHA-256 が build.sh の HUGO_SHA256 と一致しません。展開せずに止めます" >&2
      exit 1
    }
    mkdir -p "${HOME}/.local/hugo"
    tar -C "${HOME}/.local/hugo" -xf "${build_temp_dir}/${tarball}"
    export PATH="${HOME}/.local/hugo:${PATH}"
  fi

  echo "Logging tool versions..."
  echo "Hugo: $(hugo version)"
  command -v go &>/dev/null && echo "Go: $(go version)" || echo "Go: not installed"

  # 出力先を毎回作り直す。
  # ホスティング側はビルド出力をキャッシュから復元するため、前回の public/ が残る。
  # Hugo は自分が生成しないファイルを消さないので、削除した記事の HTML が
  # そのまま再アップロードされ、消したはずのURLが生き続ける。
  # 型検査の回帰テスト（tests/post-checks.js）が content/ に一時的に置く記事が残っていたら止める。
  # .gitignore に入れてあるので commit には混ざらないが、Hugo はファイルがあれば読むので、強制終了で残った
  # fixture（draft = false）が wrangler deploy / preview のビルドにそのまま入り得た（2026-11-06 の監査 F02）
  if compgen -G "content/posts/zz-fixture-*.md" >/dev/null || compgen -G "content/examples/zz-fixture-*.md" >/dev/null; then
    echo "テストの一時ファイル（content/*/zz-fixture-*.md）が残っています。消してからビルドしてください" >&2
    exit 1
  fi

  echo "Cleaning output directory..."
  rm -rf public

  echo "Building the project..."
  hugo build --gc --minify
}

main "$@"
