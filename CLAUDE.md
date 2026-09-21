# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 概要

AIツール・開発環境・CLI・SaaS・サーバーの比較まとめサイト。Hugo + Cloudflare Workers (Static Assets)。

ブログ運用とアフィリエイトをAIに委任し、収益化できるかを検証する実験。
**目的・スコープ・非スコープの正典は `VISION.md`。** 迷ったらそちらを読む。

矛盾したときの優先順位: **`VISION.md` > `PLAN.md` > コード > `NOTES.md`**
（`LESSONS.md` は序列外＝仕様ではなく記録）。
コードが `VISION.md` と矛盾していたら、勝手に寄せずに作業を止めて確認する。

## アーキテクチャ

ビルドとデプロイの経路が4ファイルに分散している。1本の鎖として読むこと。

```
main へ push
 └→ Cloudflare Workers Builds が起動
     ├ npm clean-install              package.json（wrangler をピン留め）
     └ npx wrangler deploy            ダッシュボードの Deploy command
        ├→ wrangler.jsonc の build.command（= node build.js）
        │   └→ build.js → build.sh    OS に応じた bash で build.sh を起動。
        │                             build.sh が Hugo extended を固定版でDL → hugo build → public/
        └→ public/ を Static Assets としてアップロード
```

| ファイル | 役割 |
| --- | --- |
| `wrangler.jsonc` | 配信設定。`main` なし＝Worker JS なし。`assets.directory=./public`、`not_found_handling=404-page`（Hugo が出す `404.html` を使う）、`workers_dev`/`preview_urls` は `false` |
| `build.js` | `build.sh` の起動ラッパー。macOS / Linux では PATH の bash、Windows では Git for Windows の bash を使う（開発環境は macOS と Windows を行き来するので両方の分岐を持つ）。ビルド手順は書かない |
| `build.sh` | **ツール版の唯一の真実**。Hugo の版はここだけで決まる。ローカル実行時は同版が既にあればDLを省く。自動導入は Linux 用 tarball 固定なので、macOS では未導入なら `.pkg` を展開する手順を案内して止まる（Mac 用バイナリを Linux 用で上書きしないため） |
| `hugo.toml` | `module.imports` でテーマを読む。`themes/` は空のまま使わない |
| `go.mod` | Hugo Modules の依存解決用。Go 自体は Cloudflare イメージ同梱のものを使う |

ダッシュボードの Build command が**空欄**なのは、`wrangler deploy` が `build.command` を自動実行するため。
両方に書くとビルドが2回走る。

`main` への push が本番デプロイに直結する。プレビュー環境はないので、
確認は `npm run preview`（ローカルで Workers 配信を再現）で行う。

開発環境は **macOS（Apple Silicon / zsh）と Windows 11（PowerShell）を行き来する**。手順は `README.md`。

- macOS: Hugo は公式 `.pkg` を `pkgutil` で展開して `~/.local/hugo` に置く（Homebrew の hugo は版を固定できないので使わない）。
  Node は fnm、Go は Homebrew
- Windows: Hugo は `winget install --id Hugo.Hugo.Extended --version <build.sh の版> --exact`。Node は fnm、Go は winget。
  Claude Code のツールシェルは PowerShell プロファイルを読まないので、`npm` が要る作業は Bash ツール側（`~/.bashrc` で fnm を初期化済み）で行う
- 改行は `.gitattributes` で全ファイル LF に固定してある。`core.autocrlf` の値に関係なく LF で checkout されるので、
  Windows でも設定を変えない。CRLF になると `bars` / `ranking` shortcode と型検査の partial が行末の `\r` で止まる

## 配信ドメイン

本番は `kurabebako.com`（Custom Domain）のみ。`*.workers.dev` と Preview URL は
`wrangler.jsonc` で閉じてある（同一内容が複数ドメインに出ると重複コンテンツになるため）。

## コマンド

| 目的 | コマンド |
| --- | --- |
| 開発サーバー | `npm run dev` |
| ビルド | `npm run build`（= `node build.js`。本番と同じ入口。Hugo の版確認・古い出力の掃除を含む） |
| 本番へ push | `npm run push:site`（ゲート → push → デプロイの確認。`-- --dry-run` でゲートだけ） |
| 型検査の回帰テスト | `npm run test:checks`（`extend_post_content.html` を触ったら必ず回す） |
| 表示の崩れの検査 | `npm run test:layout`（`npm run build` の後に。全記事を 4 つの幅でヘッドレスの Chrome / Edge に開き、横はみ出しを見る。`layouts/` と CSS を触ったら必ず回す） |
| Workers配信の再現 | `npm run preview` |
| デプロイ | `npm run deploy` |
| モジュール更新 | `npm run mod:update` |
| 記事の新規作成 | `hugo new content posts/<slug>.md`（`archetypes/posts.md` の骨組みで生成） |

linter は無い。テストは 2 つ。表示の崩れの検査（`tests/layout-check.js`。見るのはページ全体の横はみ出しだけで、
色・余白・図の見た目は分からない）と、型検査の回帰テスト（`tests/post-checks.js`。`tests/fixtures/valid.md` を 1 か所ずつ壊した記事を
`content/posts/` に一時的に置いてビルドし、通る / 止まるを確かめる）だけ。動作確認は `npm run build` が通ることと、
`npm run preview` で該当ページが表示されることで行う。

## ブランチ運用

`main` に直接コミットする。**デフォルトブランチにいても、作業用ブランチを先に切らない**
（Claude Code の既定動作とは逆なので明記しておく）。
プレビュー環境を意図的に閉じているため、ブランチを切っても「描画結果を見てからマージ」は
できず、確認手段はどのみちローカルの `npm run preview` になる。PR を挟む価値がない。

- **AI が push するときは `npm run push:site` だけを使う**（`tests/push-site.js`。`git push` を直接打たない）。
  ゲートは 作業ツリーが clean → 公開を伴うコミットが無い → 型検査の回帰テスト → 本番共通ビルド → 内部リンク切れ →
  表示の崩れ（`tests/layout-check.js`）→ desk の `check-backlog.py` の順で、通ったら push して Workers Builds の check-run まで見る。
  自律で push してよいのは**公開を伴わず、表示にも効かない変更**だけ（2026-09-21 に決めた段階 1）。
  記事の公開（draft を倒す）と、レイアウト・CSS の変更は、ユーザーが preview を見てから `git push origin main` で出す。
  型検査は構造しか見ておらず、数字の正しさと表示の崩れは人の目でしか確かめていないため
- 1 コミット＝デプロイできる状態に保つ。履歴は線形（merge commit を作らない）。壊れたら `git revert` で戻す
- 書きかけの記事は `draft = true` のまま `main` に置いてよい。本番ビルドは draft を出さない。
  公開はフラグを倒すコミット 1 つで行う
- ブランチを切るのは次の 2 つだけ。マージは fast-forward か squash にし、マージ後にブランチを消す
  - 全ページに効く変更（テーマ更新・`build.sh`・レイアウト）で、安定するまで複数コミットが要るとき
  - 公開前に `/code-review` をかけたいとき
- `main` 以外を push すると Cloudflare Workers Builds が非本番ビルドを走らせることがある。
  成果物は出ずビルド分数だけ消費するので、ブランチを常用し始めたらダッシュボードの Builds 設定で
  非本番ブランチのビルドを止める
- GitHub Issue は**提案の置き場**で、タスクの正典ではない（フェーズは `PLAN.md`、記事候補は desk の `backlog.md`）。
  Issue を起点に作業するときも上の運用どおり `main` に直接コミットする。ブランチを切って Draft PR を作る
  `resolve-gh-issue` の手順はこのリポジトリでは使わない。リポジトリは public なので、報酬額・計測値など
  desk に置く情報を Issue に書かない

## 変更してはいけない前提

- **Cloudflare Pages は使わない**（レガシー扱い）。ホスティングは Workers Static Assets のみ
- **`wrangler.jsonc` に `main` を追加しない**。静的配信専用にして Worker 実行回数を消費しないための構成。
  `VISION.md` が「Cloudflare Workers 無料枠内なら追加コストゼロ」を12ヶ月の判定前提に置いているため、
  ここが崩れるとコスト計算そのものが変わる。追加が必要になった場合は理由を
  `wrangler.jsonc` のコメントに明記し、`VISION.md` の前提と矛盾しないか確認する
- **テーマは Hugo Modules で管理する**。git submodule は使わない
- **ダッシュボードの Build command は空欄**。ビルドは `wrangler.jsonc` の `build.command` → `build.sh` で駆動する
- **`HUGO_VERSION` 環境変数は設定しない**。Cloudflare 側で設定すると standard 版が入り extended にならない。
  バージョンは `build.sh` 内で固定する

## コーディング規約

- 設定ファイルのコメントは日本語。「何をしているか」ではなく **「なぜそうしたか」** を書く
- Hugo の設定キーは `hugo.toml` に集約する。環境変数での分岐は増やさない
- 追加の npm パッケージは原則入れない。`devDependencies` は wrangler のみ
- テーマの上書きは `layouts/` に同名ファイルを置く。テーマ本体（モジュールキャッシュ）は編集しない
- favicon 一式（`static/` 直下の 5 ファイル）は、テーマの `head.html` が決め打ちで参照する名前のまま置いてある。
  テーマに参照を止める設定は無く、止めるには `head.html` を丸ごと上書きすることになるため。
  描き直すときは desk の `images/draw-favicon.py` を直して実行する（手で編集しない）
- 記事は `content/posts/` 配下。front matter は `title` / `date` / `draft` / `summary` / `lastmod` を必須とする
  （`hugo new content posts/<slug>.md` で5キーとも生成される）。
  `lastmod` は「記事の内容を最後に確認した日」で、ヘッダーに「最終確認」として出る。
  出典節の確認日・実行検証の最終日のうち最新のものと揃え、料金改定などで再検証したら更新する。
  文言だけの修正では動かさない（git の更新日時は使わない設定にしてある）
- **URL に載る値はすべて英語**（小文字・ハイフン区切り）。対象はファイル名（＝slug）、
  `tags`、`categories`、セクション名。日本語を混ぜると percent-encode されて
  共有時に読めない長いURLになる。
  表示名を日本語にしたい場合は、タクソノミ用のページで `title` を与える:

  ```
  content/tags/ai-tools/_index.md
  +++
  title = 'AIツール'
  +++
  ```

  これで URL は `/tags/ai-tools/`、リンクの表示は「AIツール」になる。
  記事側の front matter には英語のスラッグ（`tags = ['ai-tools']`）を書く
- **`date` を未来日時にしない。** Hugo は既定で未来日付の記事をビルド対象から外すため、
  エラーも警告も出ないまま記事がサイトから消える。draft でない記事が未来日付でビルド対象から
  外れていると、本番ビルドが止まる（`layouts/_partials/site_checks.html`）。予約投稿はこの構成では
  できない（push が無ければ再ビルドも走らない）ので、公開日は draft を倒すコミットの日時で決める

## バージョン整合

`build.sh` の `HUGO_VERSION` とローカルの `hugo version` は常に一致させる。
`go.mod` の `go` ディレクティブは Cloudflare のイメージ既定 Go（1.24.3）以下に保つ。
`hugo mod get` がローカルの Go 版に書き戻すことがあるため、モジュール更新後は `go.mod` を確認する。

## コンテンツ方針

`VISION.md` の「やらないこと」と「判断に迷ったときの優先順位」が正典。要点は以下。

- **YMYL 領域（医療・薬・健康・金融・保険・転職）に関する記述は書かない。**
  本文・見出し・front matter・タクソノミ（tags / categories）・メニュー名に加え、
  **動作確認用のサンプルコンテンツにも含めない**
- **AIが実際に実行・検証できる対象のみ扱う。** 物理ガジェットなど触れないものはレビューしない
- **実体験レビューを名乗らない。** 仕様・料金・制約を構造化して比較する情報サイトとして書く
- **量産しない。** Google の「スケールされたコンテンツ悪用」ポリシーに抵触するため、質を優先する
- **アフィリエイトリンクには PR 表記を付ける**（運用は「記事の型」の節）

比較軸に価格が入る場合も、料金プランの事実記載にとどめ、
節税・資産運用・収入といった金融的な助言に踏み込まない。

## 記事の型

すべての記事は比較記事で、骨組みは `archetypes/posts.md` にある。
`hugo new content posts/<slug>.md` で生成し、見出しの構成と比較表の列は変えない。節を減らさない。
型の違反（必須 front matter・見出しの構成と順番・比較表の列・各行の検証区分・実行区分の有無・URL に載る値の英語・
出典の確認日の書式・`lastmod` が出典の確認日より古い・体験や主観を示す表現・扱わない領域の語）はビルドで止まる（`layouts/_partials/extend_post_content.html`）。

- 見出し: 結論 → 比較表 → 比較の前提 → 各対象の詳細 → 用途別の選び方 → 出典
- 比較表の列: 対象 / 料金 / 無料枠 / 主な制約 / 前提条件 / 検証区分 / 出典
- 比較表のセルは、対象を選ぶ判断に効く事実だけを書く。目安は 1 セル 80 字、長くても 100 字まで
  （表を画面幅に収めているので、長いセルはそのまま行の高さになる）。
  エラーメッセージの全文・レコード名・手順・バイナリサイズなどの実測値は「各対象の詳細」に置く。
  本文から「『主な制約』列のとおり」と参照している事実は表に残す
- 出典は公式の料金ページ・ドキュメントのみ。まとめ記事・ブログ・SNS を出典にしない。
  URL と確認日を「出典」節に列挙し、表のセルには番号 `[n]` で紐付ける。
  各行は `1. [ページ名](URL) — YYYY-MM-DD 確認` の形式で、行末の確認日が無いとビルドが止まる
- 関連する既存記事には本文から内部リンクを張る（「比較の前提」の除外理由や「用途別の選び方」の末尾など、
  読者がその記事を必要とする文脈に置く）。新しい記事を出したら、既存記事側からもリンクを足す
- 「使ってみた」「おすすめ」「筆者は」など体験や主観を示す表現を使わない。
  事実（仕様・料金・制約）と、そこから導かれる条件付きの結論だけを書く
- 文体は **です・ます体**。だ・である体は硬くなるので使わない。
  結論と各節の冒頭には「何を、どういう条件で比べたか」の導入を 1〜2 文置く。
  数字は比較表に任せ、本文では「どこが分かれ目か」を書く（表の読み上げにしない）。
  「ただ」「一方で」で文を切り、1 文を短く保つ。丁寧だが読者に話しかける調子にする
- 段落や箇条書きの途中で改行するなら、句読点・括弧（、。）」など）の直後で折る。
  `hugo.toml` の CJK 設定（`css3draft`）が全角文字に接する改行を詰めるので、「が」の後で折って次の行を
  `REST API` で始めると「がREST API」になり、和字と英数の間の空白が消える。折る場所が無ければ 1 行を長いままにする
- archetype の指示コメント（`<!-- -->`）は書き終えたら消す。残っているとビルドが止まる
- shortcode は前後を空行で区切る。続けて書くと1つの段落にまとめられ、HTML が入れ子になる
- 図は 2 種類だけ使う。どちらも JS を使わず、色はテーマ変数に追従する
  - 数値の横並び（料金・上限・実測値）は `{{< bars >}}`（比較表の直後に置く。数値は表と同じ出典）
  - 「用途別の選び方」の分岐は `assets/figures/<slug>-flow.svg` を手で描き `{{< svg >}}` で
    インライン挿入する（`<img>` だと `currentColor` が効かずダークモードで読めない）。
    線と文字は `currentColor`、塗りは `none`。Mermaid は使わない（CDN の JS が要る）

### 扱う対象の線引き

「AI が実行・検証できる」とは、次の両方を満たすこと。

1. 公式の料金ページ・ドキュメントが公開されていて、記述を一次情報で裏取りできる
2. 無料枠・トライアル・OSS のいずれかで、個人アカウント（法人審査なし）から AI が実際に動かせる

1 を満たさない対象は載せない。2 を満たさない対象（有料のみ・法人限定・実機や店舗が要る）は
比較表に検証区分「仕様」で載せてよいが、記事の主役（タイトルに出す対象・結論で推す対象）にはしない。
検証区分は対象ごとに必ず書く: **実行** = AI が実際に動かして確認した / **仕様** = 公式ドキュメントで確認したのみ。
表のセルと「比較の前提」の凡例には文字ではなく `{{< verified run >}}` / `{{< verified spec >}}` を書く
（バッジで表示される。run / spec 以外を渡すとビルドが止まる）。

### PR 表記とアフィリエイトリンク

- アフィリエイトの URL は `data/affiliates.toml` にだけ書く。本文に生の URL を書かず、
  `{{< cta "案件id" >}}` / `{{< ranking >}}` で id を参照する（書式は各 shortcode 冒頭のコメント）
- アフィリエイトリンクを含む記事は本文の先頭に `{{< pr >}}` を置く。含まない記事には置かない。
  リンクより後に置いた・リンクが無いのに置いた・未登録の id を参照した、はいずれもビルドが止まる
- リンクには `rel="sponsored"` が付く（shortcode 側で固定。本文で外さない）
- ランキングの順位は本文の比較結果で決め、報酬額で並べ替えない。各行に理由を書く
- 案件が終了したら台帳から消す。参照している記事がビルドエラーになるので、そこで記事を直す

## 作業机リポジトリ

記事のバックログ・記事ごとの調査メモ・観測データ（Search Console、PV、収益）・ASP の申請状況・
生成画像の作業場は、このリポジトリではなく `~/Code/kurabebako-desk`（`kwrkb/kurabebako-desk`、private）に置く。
本番に出ない運用データを、デプロイされるリポジトリに混ぜないため。
記事を書く前に desk の `backlog.md` で線引きを判定し、調査の生素材を `research/<slug>/` に残す。
Claude Code からは `claude --add-dir ~/Code/kurabebako-desk` で参照する。

## 秘匿事項

README・設定ファイル・コミットメッセージに勤務先が特定される情報を含めない。
