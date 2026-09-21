# AGENTS.md — kurabebako

このリポジトリで作業するエージェント向けの案内。日本語で作業・報告する。
目的・スコープは `VISION.md`、詳細な編集規約は `CLAUDE.md` が参照先。本ファイルは既存運用を案内し、仕様やフェーズ判断を置き換えない。

## Codex の全体手順

Codex で記事の企画・調査・執筆・図と OGP の制作・検証・採用後の更新を行うときは、
[kurabebako-workflow](.agents/skills/kurabebako-workflow/SKILL.md) を読む。
このスキルは Codex 向けの実行手順であり、共通仕様は本ファイルと `CLAUDE.md` 等を参照する。
Claude 用の設定・スキル・定期処理には組み込まない。
定期処理では desk の `routines/codex/README.md` と該当プロンプトの専用出力範囲を優先し、
共有記事への反映は別作業として扱う。

## 作業開始とドキュメント

1. `git status --short` と `git branch --show-current` で現在地と既存変更を確認する。無関係な変更を巻き戻さない。
2. `VISION.md` → `PLAN.md` → `LESSONS.md` → `CLAUDE.md` → `README.md` を読む。内部構造の索引は `NOTES.md`。
3. 変更対象と関連ファイルを最低一度全文読み、コメントと `git log` で実装意図を確認してから編集する。
4. 記事作業では `../kurabebako-desk/backlog.md` と該当する `research/<slug>/`・`lab/<対象>/README.md` も読む。

優先順位は **`VISION.md` > `PLAN.md` > コード > `NOTES.md`**。コードが VISION と矛盾する場合は、該当する変更を止めてユーザーに確認する。

| ファイル | 更新の扱い |
| --- | --- |
| `VISION.md` | 正典。変更はユーザー承認必須。現在有効な目的・設計判断だけを書く |
| `PLAN.md` | フェーズ・完了条件・現在地。細かなタスク分解を増やさない。フェーズ境界では次へ進む前に確認する |
| `LESSONS.md` | 序列外の判断記録。追記専用。合理的な代替案を却下した時点で記録し、過去エントリを編集・削除しない |
| `NOTES.md` | 内部構造の索引。実装と違えばコードが正しい。更新してよい |
| `CLAUDE.md` | 既存の詳細な作業・編集規約。共通ルールの変更時は本ファイルとの食い違いを確認する |
| desk の `reviews/` | 調査と提案。記載しただけでは仕様変更・実装承認にならない |

判断記録は次の形式。決め手を観測事実で書けない重要な判断はユーザーに確認する。

```markdown
## YYYY-MM-DD: <一行サマリ>
- 却下した案: <具体的な案>
- 決め手: <観測した事実>
- 覆す条件: <再検討できる前提の変化>
```

## 構成と変更箇所

Hugo + PaperMod（Hugo Modules）で HTML を生成し、Cloudflare Workers Static Assets で配信する。
本番経路は `main` へ push → Workers Builds → `wrangler deploy` → `wrangler.jsonc` の `build.command` → `node build.js` → `build.sh` → `public/`。

| 場所 | 役割 |
| --- | --- |
| `build.js` / `build.sh` | OS 別の Bash 選択 / Hugo の版固定・出力掃除・ビルド |
| `wrangler.jsonc` | 静的配信・404・公開ドメイン・ビルド設定 |
| `hugo.toml` / `go.mod` / `go.sum` | サイト設定・テーマ導入 / モジュールの版 |
| `content/posts/<slug>.md` / `archetypes/posts.md` | 比較記事 / 新規記事の骨組み。全体検査は posts 直下の Markdown を対象にする |
| `content/{about,privacy,contact}.md` | 固定ページ。比較記事の6節構成は適用しない |
| `layouts/_partials/extend_post_content.html` | front matter・見出し・比較表・出典日・PR の整合検査 |
| `layouts/_partials/site_checks.html` | 非 draft 記事が未来日付・期限切れ等で生成対象から落ちた場合に停止 |
| `layouts/_shortcodes/` | `pr` / `cta` / `ranking` / `verified` / `bars` / `svg` |
| `data/affiliates.toml` | 公開リンク用の案件 ID、URL、固定文言、計測画像 |
| `assets/css/extended/` / `assets/figures/` / `static/images/og/` | 拡張 CSS / インライン SVG / 採用済み OGP 画像 |
| `static/favicon*` / `static/apple-touch-icon.png` / `static/safari-pinned-tab.svg` | テーマの head が決め打ちで参照する favicon 一式。手で編集せず desk の `images/draw-favicon.py` で描き直す |

- Cloudflare Pages へ移さない。`wrangler.jsonc` に Worker JS 用の `main` を追加しない。
- `workers_dev` / `preview_urls` は `false`、`not_found_handling` は `404-page`。Cloudflare の Build command は空欄。
- Hugo の版は `build.sh` の `HUGO_VERSION` で決め、ローカルと一致させる。ダッシュボード側に同名の環境変数を設定しない。
- テーマ更新後は `go.mod` の Go 宣言がローカルの版へ書き換わっていないか確認し、CI と互換性を保つ。
- テーマ変更は `layouts/` の上書きで行う。キャッシュを直接編集しない。git submodule を導入しない。
- 設定キーは `hugo.toml` に集約し、コメントは日本語で理由を書く。npm 依存は原則増やさない。
- `public/`、`resources/_gen/`、`.cache/`、`.wrangler/`、`node_modules/` は生成物。手編集・コミットしない。
- 改行は `.gitattributes` に従って LF。編集は `apply_patch`、検索は `rg`、ファイル探索は `fd`（なければ `rg --files`）を使う。

## 比較記事と広告

`hugo new content posts/<slug>.md` で作る。詳細は `CLAUDE.md` の「記事の型」と各 shortcode の冒頭コメント。

- front matter は `+++` で囲んだ TOML。`title` / `date` / `lastmod` / `draft` / 空でない `summary` が必須。
- `date` は公開時点以前。下書きは `draft = true`。`lastmod` は出典確認・実行検証の最新日と揃え、文言修正だけで進めない。
- URL に載る slug・tags・categories は英小文字・数字・ハイフン。日本語表示名はタクソノミページの `title` で付ける。
- H2 は **結論 → 比較表 → 比較の前提 → 各対象の詳細 → 用途別の選び方 → 出典**。追加・省略・並べ替えはしない。
- 比較表は **対象 / 料金 / 無料枠 / 主な制約 / 前提条件 / 検証区分 / 出典** の7列。
- 各対象と凡例に `{{< verified run >}}` / `{{< verified spec >}}` を使う。記事の主役は実際に動かした対象に限る。
- 出典は公式料金ページ・公式ドキュメントのみ。表の `[n]` と末尾の `1. [ページ名](URL) — YYYY-MM-DD 確認` を対応させる。料金・制約は執筆時に再確認する。
- です・ます体で、仕様・実測・条件付きの結論を分ける。主観的な体験レビュー、YMYL、実機を触れない物理商品のレビュー、量産は対象外。
- 内部リンクは必要な文脈に置き、新記事公開時は既存記事側からも足す。雛形の HTML コメントを消し、shortcode 前後は空行にする。
- 数値図は単位を揃えて `bars`。選択フローは `assets/figures/<slug>-flow.svg` を `svg` で挿入する。線・文字は `currentColor`、塗りは `none`。本文の図に Mermaid や CDN の JS を追加しない。
- アフィリエイト URL は `data/affiliates.toml` に集約し、本文は `cta` / `ranking` の ID 参照にする。
- 広告リンクのある記事は本文先頭に `pr`。無い記事には置かない。`rel="sponsored"`、固定 `text`、素材と対の `pixel` を維持する。
- ranking の各行は `案件id: 理由`。順位は比較結果で決め、報酬で変えない。案件終了時は台帳と参照記事を一緒に直す。

## Windows での実行と検証

現在の環境は Windows ネイティブの PowerShell。WSL 前提にしない。Node は fnm、Python は uv を使う。
`build.js` が Git for Windows の Bash を選ぶ。Node が見つからなければ fnm と PATH を確認する。

| 目的 | コマンドと注意 |
| --- | --- |
| 依存復元 | `npm ci`（lockfile に従う）。Hugo Modules には Go が必要 |
| 編集中の表示 | `npm run dev`（draft・未来日付を含むため公開判定には使わない） |
| 本番と共通のビルド | `npm run build`（= `node build.js`。版確認と `public/` の掃除を含む。作業ディレクトリと出力先を確認して使う） |
| 型検査の回帰テスト | `npm run test:checks`（`content/posts/` に一時ファイルを置いてビルドする。`extend_post_content.html` を変えたら回す） |
| Workers 配信の再現 | `npm run preview`（共通ビルドも走る。localhost で確認） |
| 完成した draft の検査 | `hugo --buildDrafts --gc --minify --destination .cache/draft-check`（空の雛形は型検査に失敗する） |

独立した lint / 型チェックのスクリプトは無い。テストは上の回帰テストだけ。実施した検証と未確認事項を区別する。

- 記事・テンプレート・設定変更は本番条件のビルドを通す。dev だけの成功で終えない。
- 描画変更はスマホ幅・明暗テーマで該当ページ・比較表・図・PR を確認する。配信変更は記事・404・末尾スラッシュも確認する。
- 型検査の変更は正常例と対象の違反例を確認する。`--quiet` でエラーを隠さない。未登録案件等のエラーを警告に弱めない。
- ビルド成功は出典の正しさ・実行証跡・結論の妥当性を保証しない。単位・期限・出典との対応は別に読む。
- 終了前に `git diff --check`・`git diff`・`git status --short` で差分を確認する。

## desk・Git・公開の境界

- サイト本体は public。調査素材・バックログ・ASP 条件や報酬・アクセス/収益の観測値は private の `../kurabebako-desk/` に置く。記事に必要なサービス仕様と実行結果は本文に記載できる。
- 秘密情報は desk にも保存しない。値は 1Password から `op run` 等で注入し、ログに露出させない。外部環境を扱う前に lab 手順と `teardown.md` を読む。
- 設定・ドキュメント・コミットメッセージにも勤務先が特定される情報を含めない。
- 通常は既存の `main` で作業し、ブランチを機械的に作らない。全体に効く複数コミットの変更や公開前レビュー用の例外は `CLAUDE.md` に従う。
- commit は差分確認後に論理単位で行う。`main` の push と `npm run deploy` は本番反映。単なる調査・編集・ビルドの一部として実行しない。push するときは `npm run push:site`（ゲート → push → デプロイ確認）だけを使い、記事の公開とレイアウト・CSS の変更はユーザーの push に任せる（`CLAUDE.md`「ブランチ運用」）。
- 定期処理は desk の `routines.md` と該当プロンプトを読み、その書き込み範囲・push 制約を守る。
