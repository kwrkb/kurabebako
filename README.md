# kurabebako

AIツール・開発環境・CLI・SaaS・サーバーの比較まとめサイト。

- 本番: https://kurabebako.com/
- 静的サイトジェネレータ: [Hugo](https://gohugo.io/)（extended 0.166.0）
- ホスティング: Cloudflare Workers (Static Assets)　※ Cloudflare Pages は使わない

## セットアップ

開発環境は macOS（Apple Silicon / zsh）と Windows 11（PowerShell）を行き来する。
リポジトリはどちらも `~/Code/kurabebako`（Windows では `C:\Users\<user>\Code\kurabebako`）に置く
（作業机リポジトリ `kurabebako-desk` を同じ親ディレクトリに並べる前提）。

### macOS / zsh

以下はすべてターミナル（zsh）で実行する。

#### 1. Hugo (extended) の導入

`build.sh` の `HUGO_VERSION` と同じ版を使う。Homebrew の `hugo` は最新版に追従して版を固定できないので使わない。
公式の macOS 向け配布は `.pkg` のみなので、`pkgutil` で展開してバイナリだけ `~/.local/hugo` に置く（sudo 不要）。

```bash
V=0.166.0
curl -fL -o /tmp/hugo.pkg "https://github.com/gohugoio/hugo/releases/download/v${V}/hugo_extended_${V}_darwin-universal.pkg"
pkgutil --expand-full /tmp/hugo.pkg /tmp/hugo-pkg
mkdir -p ~/.local/hugo && cp /tmp/hugo-pkg/Payload/hugo ~/.local/hugo/hugo && chmod +x ~/.local/hugo/hugo
echo 'export PATH="$HOME/.local/hugo:$PATH"' >> ~/.zshrc
```

```bash
hugo version
# => hugo v0.166.0-... +extended darwin/arm64  ならOK
```

`+extended` が付いていること、`build.sh` の `HUGO_VERSION` と一致していることの2点を確認する。
版を上げるときは `build.sh` の `HUGO_VERSION` を変え、上の手順で同版を置き直す。

> `~/.local/hugo` が PATH に無い状態で `build.sh` を実行すると、macOS では自動導入せず上の手順を表示して止まる。
> 自動導入は Linux 用 tarball 固定で、そのまま走ると Mac 用バイナリを実行不能なもので上書きするため。

#### 2. Go の確認

Hugo Modules の解決に Go が必要。Homebrew の `go` で入れる。

```bash
go version   # 1.23.0 以上
```

#### 3. Node 依存

Node は fnm で入れる（`brew install fnm` → `fnm install --lts` → `fnm default lts-latest`）。
`~/.zshrc` に `eval "$(fnm env --use-on-cd)"` が入っていないと `npm` が見つからないので注意。

```bash
npm ci   # wrangler のみ
```

### Windows 11 / PowerShell

Git for Windows（`build.js` が同梱の bash で `build.sh` を動かす）が入っている前提。

#### 1. Hugo (extended) の導入

winget は `--version` で版を固定できるので、`build.sh` の `HUGO_VERSION` と同じ版を明示して入れる。
`winget upgrade --all` で上がってしまったら、`build.sh` の版を上げるか、同じコマンドで入れ直す。

```powershell
winget install --id Hugo.Hugo.Extended --version 0.166.0 --exact
hugo version
# => hugo v0.166.0-... +extended windows/amd64  ならOK
```

#### 2. Go の確認

```powershell
winget install --id GoLang.Go
go version   # 1.23.0 以上
```

#### 3. Node 依存

Node は fnm で入れる（`winget install --id Schniz.fnm` → `fnm install --lts` → `fnm default lts-latest`）。
PowerShell の `$PROFILE` に `fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression` が要る。
Git Bash から使う場合は `~/.bashrc` に `eval "$(fnm env --shell bash)"` を入れる（Claude Code の Bash ツールはこちらを読む）。

```powershell
npm ci   # wrangler のみ
```

### 動作確認（共通）

```bash
npm run build     # = node build.js。Hugo の版確認・古い public/ の掃除を含む本番共通ビルド
npm run preview   # http://localhost:8787 で Workers 配信を再現
```

### 改行コードについて

`.gitattributes` で**全ファイルを LF 固定**にしている（`* text=auto eol=lf`）。`core.autocrlf` の値に
関係なく LF で checkout されるので、Windows でも git の設定は変えない。
CRLF になると `build.sh` は bash が行末の `\r` を構文エラーにし、記事は `bars` / `ranking` shortcode と
型検査の partial が `\r` 付きの行を数値・行末として読めずにビルドが止まる。
エディタ側も LF で保存する（`.editorconfig` は置いていないので、エディタが `.gitattributes` を見ない場合は手で設定する）。

## コマンド

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | Hugo 開発サーバー（下書き・未来日付も表示） |
| `npm run build` | 本番共通ビルド（= `node build.js`。Hugo の版確認・古い出力の掃除 → 生成） |
| `npm run test:layout` | 表示の崩れの検査。ビルド済みの `public/` をヘッドレスの Chrome / Edge で開き、全記事を 4 つの幅で横はみ出しが無いか見る |
| `npm run push:site` | 本番へ push する入口。ゲート（公開の有無・回帰テスト・ビルド・内部リンク切れ・backlog）を通ったら push し、デプロイの成否まで確認する。記事の公開を含むと止まる |
| `npm run test:checks` | 記事の型検査の回帰テスト（壊した記事を一時的に置いてビルドし、止まることを確かめる） |
| `npm run preview` | `wrangler dev` で Workers 配信を再現（`node build.js` が自動実行される） |
| `npm run deploy` | `wrangler deploy` で本番反映（`node build.js` が自動実行される） |
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
  "command": "node build.js"
}
```

`build.js` は OS に応じた bash で `build.sh` を起動するだけの薄いラッパー。
macOS と Cloudflare（Linux）では PATH の bash をそのまま使う。
Cloudflare 公式の例は `chmod a+x build.sh && ./build.sh` だが、Windows では
`build.command` が cmd.exe で実行されるため `chmod` が無く、PATH 上の `bash` も
WSL に解決される。そのため node 経由で bash を選んで呼ぶ形にした。開発環境は macOS と Windows を
行き来するので、両方の分岐を持つ。
ビルド手順そのものは `build.sh` に集約しており、`build.js` には書かない。

ダッシュボード側の Build command にも同じものを入れると **ビルドが2回走る**ため空欄にする。
ビルド手順をリポジトリ内に閉じ込められる（＝ダッシュボードとコードに設定が分散しない）利点もある。

ダッシュボードから駆動したい場合は、以下をそのまま Build command に貼り、
**代わりに `wrangler.jsonc` の `build` ブロックを削除する**こと。

```
node build.js
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
build.js         build.sh を OS に応じた bash で起動するラッパー（wrangler の build.command）
build.sh         Cloudflare / ローカル共通のビルドスクリプト（ツール版を固定）
wrangler.jsonc   Workers Static Assets の設定
hugo.toml        Hugo 設定（テーマは module.imports で読み込む）
go.mod           Hugo Modules の依存
content/         記事
archetypes/      `hugo new` の雛形（posts.md が比較記事の骨組み）
data/            アフィリエイト案件の台帳
layouts/         テーマ上書き・記事検査・shortcode（pr / cta / ranking / verified / bars / svg）
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

2026-09-19 の本番共通ビルドは成功し、非推奨警告が 3 件出た
（`.Language.LanguageDirection` / `.Language.LanguageCode` / `.Site.Data`）。
言語関連の 2 件は PaperMod 由来。警告の確認先は `NOTES.md` を参照。

## 参考

- [Hugo — Host on Cloudflare](https://gohugo.io/host-and-deploy/host-on-cloudflare/)
- [Cloudflare Workers — Build image](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/)
- [Cloudflare Workers — Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)

## ライセンス

- 記事・図・画像（`content/`、`assets/figures/`、`static/images/`）は All rights reserved。転載・再配布はできません
- それ以外のコード（レイアウト・CSS・ビルドスクリプト・設定）は MIT License

詳細は [LICENSE](LICENSE) を参照。
