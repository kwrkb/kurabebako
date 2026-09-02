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

## 空のまま置いているディレクトリ

`assets/` `data/` `i18n/` `layouts/` `static/` `themes/`

git は空ディレクトリを追跡しないため、clone 直後には存在しない。
Hugo は無いディレクトリを無視するのでビルドには影響しない。

## ビルドログの読み方

正常時は以下が1回ずつ出る。2回出ていたらビルドが二重に走っている。

```
[custom build] Running: chmod a+x build.sh && ./build.sh
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
