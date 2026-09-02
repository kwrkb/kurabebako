# kurabebako

AIツール・開発環境・CLI・SaaS・サーバーの比較まとめサイト。

- 本番: https://kurabebako.com/
- 静的サイトジェネレータ: [Hugo](https://gohugo.io/)（extended 0.165.0）
- ホスティング: Cloudflare Workers (Static Assets)　※ Cloudflare Pages は使わない

## セットアップ（WSL2 / Ubuntu）

リポジトリは **Linux ファイルシステム側**（`~/code/...`）に置くこと。
`/mnt/c/...` に置くとビルドとファイル監視が極端に遅くなる。

### 1. Hugo (extended) の確認

```bash
hugo version
# => hugo v0.165.0-... +extended linux/amd64  ならOK
```

`+extended` が付いていること、`build.sh` の `HUGO_VERSION` と一致していることの2点を確認する。

未インストール、または standard 版・別バージョンだった場合は次の手順で入れ直す。

```bash
HUGO_VERSION=0.165.0
cd "$(mktemp -d)"
curl -sSLO "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz"
curl -sSLO "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_checksums.txt"

# 改ざん検知（OK と出ることを確認）
grep "hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz" "hugo_${HUGO_VERSION}_checksums.txt" | sha256sum -c -

tar xzf "hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz" hugo
install -m 755 hugo ~/.local/bin/hugo
hugo version
```

`~/.local/bin` が PATH に無い場合は通しておくこと。

> **apt の `hugo` は使わない。** バージョンが古いうえ extended 版ではないため、
> Sass / WebP を使う構成で詰まる。

### 2. Go の確認

Hugo Modules の解決に Go が必要。

```bash
go version   # 1.23.0 以上
```

未インストールなら公式 tarball（`/usr/local/go`）で入れる。apt 版は使わない。

### 3. Node 依存

```bash
npm ci   # wrangler のみ
```

### 4. 動作確認

```bash
npm run build     # public/ が生成される
npm run preview   # http://localhost:8787 で Workers 配信を再現
```

## コマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | Hugo 開発サーバー（下書き・未来日付も表示） |
| `npm run build` | 本番ビルド → `public/` |
| `npm run preview` | `wrangler dev` でWorkers配信を再現（`build.sh` が自動実行される） |
| `npm run deploy` | `wrangler deploy`（`build.sh` が自動実行される） |
| `npm run mod:update` | テーマ等の Hugo Modules を更新 |

## Cloudflare の設定

ダッシュボードの **Workers & Pages → 対象プロジェクト → Settings → Build** に入れる値。

| 項目 | 値 |
| --- | --- |
| **Build command** | **空欄のままにする** |
| **Deploy command** | `npx wrangler deploy` |
| Build variables | **設定不要**（`HUGO_VERSION` は設定しない。理由は後述） |

### Build command を空欄にする理由

`wrangler deploy` は実行前に `wrangler.jsonc` の `build.command` を自動で走らせる。
本リポジトリでは以下を設定済み。

```jsonc
"build": {
  "command": "chmod a+x build.sh && ./build.sh"
}
```

ダッシュボード側の Build command にも同じものを入れると **ビルドが2回走る**ため空欄にする。
ビルド手順をリポジトリ内に閉じ込められる（＝ダッシュボードとコードに設定が分散しない）利点もある。

ダッシュボードから駆動したい場合は、以下をそのまま Build command に貼り、
**代わりに `wrangler.jsonc` の `build` ブロックを削除する**こと。

```
chmod a+x build.sh && ./build.sh
```

ただし `build` ブロックを消すと `wrangler dev` / `wrangler deploy` がビルドを実行しなくなるため、
ローカルの `package.json` も併せて次のように変える必要がある。

```jsonc
"preview": "npm run build && wrangler dev",
"deploy":  "npm run build && wrangler deploy"
```

### `HUGO_VERSION` を設定しない理由

Cloudflare のビルドイメージには Hugo と Go がプリインストールされている
（既定 Hugo `extended_0.147.7` / Go `1.24.3`）。ただし **ダッシュボードの `HUGO_VERSION` 変数で
バージョンを上書きすると standard 版がインストールされ、extended 版にならない**。
extended が要る構成（Sass / WebP エンコード）では詰むため、本リポジトリでは環境変数を使わず
`build.sh` 内でバージョンを固定し、extended の tarball を明示的に取得している。

これによりローカルと Cloudflare で同一バージョンの Hugo が使われる。
バージョンを上げるときは `build.sh` の `HUGO_VERSION` と、ローカルの Hugo を揃えて更新する。

Go はイメージ同梱のものをそのまま使う。`go.mod` の `go` ディレクティブを `1.23.0` に抑えてあるため、
イメージ既定の Go 1.24.3 で Hugo Modules を解決できる（`GOTOOLCHAIN` によるツールチェーン
ダウンロードが走らない）。**`hugo mod get` はこのディレクティブをローカルの Go 版に書き戻すことがある**ので、
モジュール更新後は `go.mod` を確認すること。

### 配信ドメイン

本番は **`kurabebako.com`（Custom Domain）のみ**。
`wrangler.jsonc` で `workers_dev` と `preview_urls` を `false` にしており、
`*.workers.dev` では配信されない。同一内容が複数ドメインで配信されると
検索エンジンに重複コンテンツとして扱われるため。

動作確認は本番ドメインか、ローカルの `npm run preview` で行う。

## 構成

```
build.sh         Cloudflare / ローカル共通のビルドスクリプト（ツール版を固定）
wrangler.jsonc   Workers Static Assets の設定
hugo.toml        Hugo 設定（テーマは module.imports で読み込む）
go.mod           Hugo Modules の依存
content/         記事
layouts/         テーマ上書き用（現在は空）
assets/ static/  アセット
```

### Worker 側の JS を持たない構成

`wrangler.jsonc` に `main` を **意図的に置いていない**。
`main` なし = アセット配信のみの Worker となり、静的ファイルへのリクエストが
Worker の実行回数を消費しない。動的処理が必要になった場合のみ `main` を追加し、
その理由を `wrangler.jsonc` のコメントに明記する。

### テーマ

[PaperMod](https://github.com/adityatelange/hugo-PaperMod) を Hugo Modules で導入している。
git submodule は使わない（Cloudflare のビルドで詰まりやすいため）。

ビルド時に PaperMod 由来の deprecation warning
（`.Language.LanguageDirection` / `.Language.LanguageCode`）が出るが、テーマ側の問題であり
ビルドは成功する。テーマ更新で解消される見込み。

## 参考

- [Hugo — Host on Cloudflare](https://gohugo.io/host-and-deploy/host-on-cloudflare/)
- [Cloudflare Workers — Build image](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/)
- [Cloudflare Workers — Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
