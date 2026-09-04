# NOTES

内部構造の索引。**揮発的で鮮度は保証しない。** 仕様ではないので、
こことコードが食い違ったらコードが正しい。

## どこから読むか

| 知りたいこと | 見る場所 |
| --- | --- |
| ビルド〜デプロイの全体像 | `CLAUDE.md` の「アーキテクチャ」 |
| ビルドツールの版 | `build.sh` 冒頭の `HUGO_VERSION`（唯一の定義箇所） |
| 配信の挙動（404・末尾スラッシュ・ドメイン） | `wrangler.jsonc` の `assets` と `workers_dev` |
| サイト設定・テーマ読み込み | `hugo.toml` |
| 記事の骨組み | `archetypes/posts.md`（`hugo new content posts/<slug>.md` が使う） |
| アフィリエイト案件の台帳 | `data/affiliates.toml`（id → 表示名・URL） |
| PR 表記・リンクボタン・ランキング | `layouts/_shortcodes/{pr,cta,ranking}.html`、見た目は `assets/css/extended/affiliate.css` |
| 棒グラフ・SVG 図 | `layouts/_shortcodes/{bars,svg}.html`、見た目は `assets/css/extended/charts.css`。SVG 本体は `assets/figures/` |
| OGP 画像 | `static/images/og/<slug>.jpg`（記事の `cover.image`、hidden）。生成は desk の `images/gen.sh` |
| 記事の規約違反をビルドで止める仕組み | `layouts/_partials/extend_post_content.html`（本文描画後の検査）、`site_checks.html`（トップ描画時のサイト全体の検査）と各 shortcode の `errorf` |
| なぜその構成なのか | `LESSONS.md`、各設定ファイルのコメント |

## テーマの実体の場所

テーマは Hugo Modules で読み込むため、リポジトリ内に実体が無い（`themes/` は空のまま）。
Go のモジュールキャッシュではなく **Hugo 独自のキャッシュ**に展開される。パスの取得:

```bash
hugo config mounts | grep -o '"dir": "[^"]*adityatelange[^"]*"'
```

大文字を含むモジュールパスはキャッシュ上で `!` エスケープされる（`hugo-PaperMod` →
`hugo-!paper!mod`）ため、`ls` のグロブでは見つけにくい。上のコマンドで引くのが確実。

テンプレートを上書きしたいときは、このディレクトリを編集せず
リポジトリの `layouts/` に同じ相対パスでファイルを置く。

## 出力の形

- 記事は `public/posts/<slug>/index.html`（末尾スラッシュ前提）
- タクソノミは `public/tags/<slug>/`、`public/categories/<slug>/`
  slug は英語で書く規約（`CLAUDE.md` 参照）。表示名は `content/tags/<slug>/_index.md` の
  `title` で与える。この2つは独立していて、URL を変えずに表示名だけ直せる
- `404.html` はテーマの `layouts/404.html` から生成される。
  これが無いと配信側の 404 設定が効かない
- ページネーションは1ページ目も `page/1/` を生成する（エイリアス扱い）

## 記事の検査の流れ

shortcode は本文中の出現順に処理され、`.Page.Store` に印を残す。
`pr` が `prDeclared`、`cta` / `ranking` が `hasAffiliate` を立てる。
`cta` / `ranking` は `prDeclared` が無ければその場で `errorf`（＝PR 表記より先にリンクが出るのを防ぐ）。
本文描画後にテーマが呼ぶ `extend_post_content.html` で、`prDeclared` だけ立っている記事と
HTML コメントが残っている記事を `errorf` で止める。

同じ partial で、`content/posts/` の単ページにだけ「記事の型」の検査を掛ける（about / privacy / contact は対象外）。
見るのは front matter の必須 5 キー（`os.ReadFile` でファイルを読み直す。Hugo が date や summary を補うため
`.Params` では「書いてあるか」を判定できない）、slug / tags / categories が英小文字・数字・ハイフンであること、
H2 が型の 6 節と同じ順で並ぶこと、「比較表」節の最初の表が 7 列で各行に `verified` shortcode があること、
表に `verified run` が 1 つ以上あること。「出典」節の各行が `— YYYY-MM-DD 確認` で終わり、
`lastmod` がその最新日より古くないこと（ISO の日付文字列は辞書順で比べられる）。`.RawContent` は CRLF の記事もあるので `\r` を落としてから正規表現を掛ける。

検査の動作確認は、`draft = true` で違反を 1 つ入れた記事を `content/posts/` に置き `hugo -D` を実行する
（`--quiet` を付けると ERROR 行ごと消えるので付けない）。`date` が現在時刻より後だと記事自体が
ビルド対象から外れて検査も走らないので、過去の日時にする。確認したら記事を消す。

未来日付や expiryDate で記事がビルド対象から外れるケースは、ページが無いので上の検査では拾えない。
`extend_head.html` がトップページの描画時に 1 回だけ `site_checks.html` を呼び、`content/posts/` の
`.md`（`_index.md` 以外）のうち `draft = true` でないものが `site.RegularPages` に無ければ止める。
`npm run dev` は `--buildFuture` 付きなので通り、本番ビルドで止まる。動作確認は `draft = false` で
未来日付の記事を置いて `hugo` を実行する。

`errorf` はビルドを失敗にするが、その場でテンプレートの実行を止めない。
後続が nil で落ちて本命のエラーが埋もれないよう、`affiliate.html` は未登録 id でも仮の値を返す。

shortcode を連続する行に書くと、Markdown 側で1つの段落として扱われ `<p>` の中に
`<div>` が入る。前後を空行で区切ると解消する。

## 空のまま置いているディレクトリ

`i18n/` `static/` `themes/`

git は空ディレクトリを追跡しないため、clone 直後には存在しない。
Hugo は無いディレクトリを無視するのでビルドには影響しない。

## ビルドログの読み方

正常時は以下が1回ずつ出る。2回出ていたらビルドが二重に走っている。

```
[custom build] Running: node build.js
[custom build] Installing Hugo <version> (extended)...
```

`Pages` の数が前回より減っていたら、記事が除外されている可能性がある
（未来日付・`draft = true` など）。

## 既知の警告

テーマ内のテンプレートが古い変数名を使っているため、ビルドのたびに
言語関連の deprecation warning が2件出る。リポジトリ側の設定が原因ではないので、
テーマの更新を待つ。出所の確認:

```bash
grep -rn "LanguageDirection\|LanguageCode" "$(hugo config mounts | grep -o '"dir": "[^"]*adityatelange[^"]*"' | sed 's/"dir": "//; s/"$//')/layouts"
```
