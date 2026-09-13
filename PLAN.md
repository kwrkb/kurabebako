# PLAN

フェーズ境界と現在地だけを書く。手順の分解はここに書かない。
判定基準の根拠は `VISION.md`。

---

## Phase 0 — インフラ構築 ✅ 完了（2026-09-02）

Hugo + Cloudflare Workers (Static Assets) で `kurabebako.com` を配信できる状態にする。

- [x] Hugo プロジェクト初期化、テーマを Hugo Modules で導入
- [x] `wrangler.jsonc` を静的配信専用構成で作成（Worker JS なし）
- [x] `build.sh` でツール版を固定し、ローカルと CI のビルドを一致させる
- [x] Git 連携での自動デプロイ（`main` への push で本番反映）
- [x] カスタムドメイン接続、`*.workers.dev` の閉鎖

**完了条件**: 本番ドメインで全経路が正常応答すること — 達成

---

## Phase 1 — コンテンツの型を決める ✅ 完了（2026-09-02）

1本目を書く前に、量産に頼らず勝つための「型」を確定させる。
`VISION.md` の差別化仮説（料金体系・制約・前提条件の粒度で上回る）を、
再現可能なテンプレートに落とす段階。

- [x] 動作確認用のサンプル記事を削除（架空の対象は `VISION.md` の「検証可能な対象のみ」に反するため）
- [x] 比較記事のテンプレートを決める（見出し構成、比較表の列、出典の示し方）
- [x] 扱う対象の線引きを具体化する（AIが実行・検証できるとは何を指すか）
- [x] shortcode を実装する（`cta` / `ranking` / `pr` / 案件ID管理）
- [x] PR表記の運用ルールを決める

**完了条件**: 同じ型で2本目以降を書き始められること — 達成
（型は `archetypes/posts.md` と `CLAUDE.md` の「記事の型」。違反はビルドで止まる。
必須 front matter・見出し順・比較表の列・検証区分まで機械的に止めるようにしたのは 2026-09-04）

---

## Phase 2 — 投入とインデックス確認（〜3ヶ月）← **現在地**

型に沿って記事を投入し、技術面の問題を切り分ける。

- [x] 1本目を型どおりに書き、型の不足を直す（2026-09-02 `static-site-hosting-free-tier`。archetype の変更は不要だった）
- [x] 検証用 VPS の経路を作る（2026-09-02 ConoHa VPS 3.0 を Terraform + 1Password で作成〜実測〜削除まで AI が自走。構成と結果は desk の `lab/conoha/`、`research/vps-japan/`）
- [x] 2本目: 国内 VPS 比較（2026-09-02 `vps-japan-minimum-plan`。主役は ConoHa を「実行」区分で。他社は「仕様」区分、実測できたものから「実行」に置き換える）
- [ ] 10 本まで投入する（候補と線引きは desk の `backlog.md`。1 本ごとに「実行」区分の主役を置き、収益に近い領域と検索需要が大きい領域を混ぜる）
  - 3 本目: 死活監視の無料枠比較（2026-09-03 `uptime-monitoring-free-tier`。UptimeRobot / Checkly / Uptime Kuma を「実行」区分で。手順は desk の `lab/uptime/`）
  - 4 本目: 国内の共用レンタルサーバー比較（2026-09-05 `shared-hosting-japan`。エックスサーバーを「実行」区分で。お試し中の API キーで REST API・CLI・MCP を動かした。手順は desk の `lab/xserver/`）
  - 5 本目: シークレット管理 CLI 比較（2026-09-05 `secret-management-cli`。Bitwarden Secrets Manager を主役に、6 対象すべてを「実行」区分で。同じ 5 手順を流す検証は desk の `lab/secrets/`）
  - 6 本目: メール送信 API の無料枠比較（2026-09-08 `email-api-free-tier`。Resend を「実行」区分で。API キーだけで送信ドメイン登録 → Cloudflare API で DNS → 認証 → 送信 → 削除まで自走。他 4 社は「仕様」区分。手順は desk の `lab/email/`）
  - 7 本目: スクレイピング API の無料枠比較（2026-09-12 `scraping-api-free-tier`。ScraperAPI を主役に、Firecrawl / ScrapingBee と合わせて 3 社を「実行」区分で。同じ 5 手順を無料枠を使い切らずに流した。Apify / Zyte は「仕様」区分で次回更新に回す。手順は desk の `lab/scraping/`）
- [x] 記事どうしの内部リンクを張る（2026-09-04 に既存 3 本を相互リンクにした。4 本目からは `CLAUDE.md`「記事の型」の内部リンクの規約に従い、新記事を出すたびに既存記事側からも足す）
- [x] 型の検査を 2 つ広げる（2026-09-04。未来日付・expiryDate でビルド対象から外れた記事は `site_checks.html` で、`lastmod` が出典の確認日より古い記事と確認日の無い出典行は `extend_post_content.html` で止める）
- [x] ASP 審査の前提を揃える（2026-09-02 プライバシーポリシー・問い合わせ・About を公開。本番で応答を確認）
- [x] A8.net 登録・収益導線の設置（2026-09-12 に副サイト登録と5案件の提携・台帳登録が完了。共用サーバー・VPS記事に広告リンクとPR表記を掲載済み。公開リンクは `data/affiliates.toml`、申請・条件の詳細は desk の `affiliates/`）
- [x] Search Console 登録（DNS の TXT レコードで所有権を確認済み。2026-09-04 時点でデータはまだ無い）
- [x] sitemap 送信（`https://kurabebako.com/sitemap.xml`。2026-09-05 に Search Console の「サイトマップ」で設置済みを確認。`robots.txt` からも参照している）
- [ ] インデックス数とクロール状況の観測
  - 初回 2026-09-07（Search Console の「検索パフォーマンス」を 2026-09-06 にエクスポート。データは 09-02〜09-04 の 3 日分。生データは desk の `metrics/2026-09-search-console/`）。
    表示・クリックの数値は desk の `metrics/2026-09-search-console/` に置く（計測値は公開リポジトリに書かない）。表示されたのは記事 2 本（`static-site-hosting-free-tier`、`vps-japan-minimum-plan`）とタグページ 6 つ。
    `http://kurabebako.com/` が https と別 URL として表示されている。平文 http が 301 を返さず 200 で本文を返しているため。
    2026-09-07 に Cloudflare の SSL/TLS → Edge Certificates の「Always Use HTTPS」を有効化し、ルート・パス付き・クエリ付きの平文 http が 301 で https に飛ぶことを確認した
  - 2026-09-08 に 6 本目 `email-api-free-tier` を公開し、同日に Search Console の URL 検査からインデックス登録をリクエストした（sitemap 経由の自然なクロールと、リクエストしたこの 1 本の登録速度を次回観測で見比べる）

**判断ポイント**: インデックスされないなら技術面（構成・内部リンク・品質シグナル）を疑う。
収益経路（ASP 承認と案件台帳）が無いまま Phase 3 に入らない

---

## Phase 3 — 検索流入の観測（〜6ヶ月）

**判断ポイント**: 流入ゼロなら、ジャンル選定かコンテンツの型を見直す

---

## Phase 4 — 収益の検証（〜12ヶ月）

**判断ポイント**: コスト回収（ドメイン代 ＋ 検証用 VPS の時間課金分。額は `VISION.md` の最低ライン）＋ CV1件以上で継続。
ゼロなら仮説そのものを検証する。

---

> 3ヶ月時点の実測が出たら、`VISION.md` の数値目標とあわせてこのフェーズ境界を見直す。
