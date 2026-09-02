# kurabebako

AIツール・開発環境・CLI・SaaS・サーバーの比較まとめサイト。Hugo + Cloudflare Workers (Static Assets)。

## コマンド

| 目的 | コマンド |
| --- | --- |
| 開発サーバー | `npm run dev` |
| 本番ビルド | `npm run build`（= `hugo --gc --minify`） |
| Workers配信の再現 | `npm run preview` |
| デプロイ | `npm run deploy` |
| モジュール更新 | `npm run mod:update` |
| 記事の新規作成 | `hugo new content posts/<slug>.md` |

## 変更してはいけない前提

- **Cloudflare Pages は使わない**（レガシー扱い）。ホスティングは Workers Static Assets のみ
- **`wrangler.jsonc` に `main` を追加しない**。静的配信専用にして Worker 実行回数を消費しないための構成。
  追加が必要になった場合は理由を `wrangler.jsonc` のコメントに明記する
- **テーマは Hugo Modules で管理する**。git submodule は使わない
- **ダッシュボードの Build command は空欄**。ビルドは `wrangler.jsonc` の `build.command` → `build.sh` で駆動する
- **`HUGO_VERSION` 環境変数は設定しない**。Cloudflare 側で設定すると standard 版が入り extended にならない。
  バージョンは `build.sh` 内で固定する

## コーディング規約

- 設定ファイルのコメントは日本語。「何をしているか」ではなく **「なぜそうしたか」** を書く
- Hugo の設定キーは `hugo.toml` に集約する。環境変数での分岐は増やさない
- 追加の npm パッケージは原則入れない。`devDependencies` は wrangler のみ
- テーマの上書きは `layouts/` に同名ファイルを置く。テーマ本体（モジュールキャッシュ）は編集しない
- 記事は `content/posts/` 配下。front matter は `title` / `date` / `draft` / `summary` を必須とする
  （`hugo new content posts/<slug>.md` で4キーとも生成される）
- **`date` を未来日時にしない。** Hugo は既定で未来日付の記事をビルド対象から外すため、
  エラーも警告も出ないまま記事がサイトから消える。予約投稿したい場合のみ意図的に使い、
  `npm run dev`（`--buildFuture` 付き）で表示を確認する

## バージョン整合

`build.sh` の `HUGO_VERSION` とローカルの `hugo version` は常に一致させる。
`go.mod` の `go` ディレクティブは Cloudflare のイメージ既定 Go（1.24.3）以下に保つ。
`hugo mod get` がローカルの Go 版に書き戻すことがあるため、モジュール更新後は `go.mod` を確認する。

## コンテンツ方針

**YMYL 領域（医療・薬・健康・金融・保険・転職）に関する記述は書かない。**
本文・見出し・front matter・タクソノミ（tags / categories）・メニュー名に加え、
**動作確認用のサンプルコンテンツにも含めない**。

対象は AIツール・開発環境・CLI・SaaS・サーバーの比較に限定する。
比較軸に価格が入る場合も、料金プランの事実記載にとどめ、
節税・資産運用・収入といった金融的な助言に踏み込まない。

## 秘匿事項

README・設定ファイル・コミットメッセージに勤務先が特定される情報を含めない。
