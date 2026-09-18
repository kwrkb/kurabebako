+++
title = '静的サイトの無料ホスティング 5 社比較: 広告を載せるならどれか'
date = '2026-09-02T19:43:49+09:00'
lastmod = '2026-09-02'
draft = false
summary = 'Hugo などで生成した静的サイトを無料で公開できる5サービスを、料金・無料枠・上限・商用利用の可否・前提条件で比較。アフィリエイトや広告を載せる予定があるなら Cloudflare Workers Static Assets が条件を満たす。'
categories = ['hosting']
tags = ['static-site', 'cloudflare', 'github-pages', 'netlify', 'vercel']
# OGP 用の画像。本文と一覧には出さない（hidden）。生成は desk の images/gen.sh
[cover]
  image = '/images/og/static-site-hosting-free-tier.jpg'
  alt = '静的サイトの無料ホスティング比較'
  hidden = true
  hiddenInList = true
+++

## 結論

Hugo などで生成した静的サイトを無料で公開できる 5 サービスを、無料枠の上限と用途の制限で比べました。
広告やアフィリエイトを載せる可能性があるなら、Cloudflare Workers Static Assets を選ぶのが安全です。
Vercel Hobby は広告・アフィリエイトを商用利用として禁止し、GitHub Pages は商取引が主目的のサイトを認めていません。
Netlify Free は月のクレジットを使い切るとサイトが止まります。一方で Cloudflare は静的ファイルへのリクエストが無料・無制限で、
料金・上限ページに用途の制限の記載がありません。
非商用の個人サイトで、公開リポジトリが GitHub にあり転送量が月 100 GB に収まるなら、GitHub Pages で足ります。

## 比較表

2026-09-02 時点の公式情報に基づきます。出典は末尾の番号に対応しています。

| 対象 | 料金 | 無料枠 | 主な制約 | 前提条件 | 検証区分 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| Cloudflare Workers Static Assets | 無料。有料は月 5 USD から（静的配信だけなら不要） | 静的ファイルへのリクエストは無料・無制限。保存容量も無料。ビルドは月 3,000 分 | 1 バージョンあたり 20,000 ファイル、1 ファイル 25 MiB。同時ビルド 1、ビルド 20 分で打ち切り | Cloudflare アカウント。独自ドメインは DNS を Cloudflare に置く必要あり。自動ビルドは GitHub か GitLab | {{< verified run >}} | [1][2][3][4][5] |
| Cloudflare Pages | 無料。有料プラン（Pro・Business・Enterprise）は上限が増える | 静的ファイルへのリクエストは無料・無制限。ビルドは月 500 回 | 20,000 ファイル、1 ファイル 25 MiB、100 プロジェクト、同時ビルド 1、ビルド 20 分で打ち切り | Cloudflare アカウント。独自ドメインは Cloudflare 外の DNS でも可 | {{< verified spec >}} | [6][7][8] |
| GitHub Pages | 無料（GitHub Free）。非公開リポジトリから公開するには GitHub Pro 以上 | サイト容量 1 GB、転送量 月 100 GB（ソフト上限） | ビルド 1 時間に 10 回（ソフト上限、独自の Actions なら対象外）、デプロイ 10 分で打ち切り。オンラインビジネス・EC・商用 SaaS など商取引が主目的のサイトは不可 | GitHub アカウント。GitHub Free では公開リポジトリのみ | {{< verified spec >}} | [9][10] |
| Netlify Free | 無料。有料は Personal 月 9 USD から | 月 300 クレジット（本番デプロイ 1 回 15、転送 1 GB 20、リクエスト 1 万件 2） | クレジットを使い切ると全サイトが停止し「Site not available」になる。追加購入不可 | Netlify アカウント。500 プロジェクトまで、チームオーナー 1 名 | {{< verified spec >}} | [11][12] |
| Vercel Hobby | 無料。有料は Pro 月 20 USD（デプロイ席 1 つ込み）から | 転送量 月 100 GB まで（Fair Use の目安） | 非商用・個人利用のみ。広告掲載やアフィリエイト主目的のサイトは商用扱い。1 日 100 デプロイ、200 プロジェクト、1 プロジェクト 50 ドメイン | Vercel アカウント。組織所有の Git リポジトリは接続不可 | {{< verified spec >}} | [13][14][15][16] |

## 比較の前提

- 対象に含めたもの: Git リポジトリからの自動デプロイと独自ドメインの両方を無料枠で提供し、
  公式の料金・上限ページが公開されている 5 サービスです。Hugo・Astro・Eleventy などが出力する
  静的 HTML をそのまま置く用途を想定し、サーバーサイド実行（Functions）の枠は比較していません
- 除外したもの: Firebase Hosting・Render・Surge など。初回は対象を 5 つに絞ったためで、
  次回以降の更新で追加します。VPS やレンタルサーバーは、無料枠での常時公開を前提にできず
  比較軸（無料枠・用途制限）が揃わないため対象外にしました。
  サーバーごと借りる場合の国内 VPS の最小プランは、[別の記事](/posts/vps-japan-minimum-plan/)で比べています。
  root 権限は要らないが WordPress やメールも使いたい場合は、[国内の共用レンタルサーバー比較](/posts/shared-hosting-japan/)が対象になります
- 検証区分の意味: {{< verified run >}} = AI が実際に動かして確認した / {{< verified spec >}} = 公式ドキュメントで確認したのみ
- 料金は USD 表記の公式価格をそのまま載せ、税と為替は考慮していません

## 各対象の詳細

### Cloudflare Workers Static Assets

このサイト自身が使っている構成です。Worker のスクリプトを置かずに静的ファイルだけを配信すると、
Free プランの実行回数の枠を消費しない点が特徴です。

- **料金体系**: Workers Free プランは無料です。Workers Paid は月 5 USD からで、Worker スクリプトの実行回数
  （月 1,000 万回込み、超過 100 万回ごと 0.30 USD）と CPU 時間に課金されます。ただし静的ファイルへの
  リクエストは Free・Paid ともに「無料・無制限」で、保存容量にも課金されません [1][2]。
  Worker スクリプトを置かない静的配信専用の構成なら、Free プランの 1 日 10 万リクエストの
  上限を消費しません [1][3]
- **制約**: 1 バージョンあたりのファイル数は Free 20,000、Paid 100,000。1 ファイル 25 MiB。
  アカウントあたりの Worker 数は Free 100 です [3]。Git 連携のビルド（Workers Builds）は Free で月 3,000 分、同時 1 本、1 回 20 分で打ち切られます [4]
- **前提条件**: Cloudflare アカウント（Free プランで可）。独自ドメインを Custom Domain として
  付けるには、そのドメインの DNS ゾーンが Cloudflare 上で有効である必要があります。DNS レコードと
  証明書は Cloudflare が自動で作成します [5]。自動ビルドを使うには GitHub か GitLab のリポジトリ
  を接続します [4]
- **検証した内容**: このサイト自体が本構成で稼働しています。Worker スクリプトを持たない `wrangler.jsonc`（`main` なし、`assets.directory` のみ）で `main` ブランチへの push から Workers Builds が起動し、`wrangler deploy` が `public/` をアップロードします。
  2026-09-02 に確認した結果は次のとおりです

  ```
  $ curl -sI https://kurabebako.com/
  HTTP/2 200
  server: cloudflare

  $ curl -sI https://kurabebako.com/no-such-page/
  HTTP/2 404

  $ hugo --gc --minify && find public -type f | wc -l
  34
  ```

  Hugo が出す `404.html` を `not_found_handling = "404-page"` で返す設定が、存在しないパスに 404 を返すことも確認しました。ファイル数 34 は上限 20,000 の 0.2% 未満です

### Cloudflare Pages

Workers Static Assets と同じ Cloudflare の静的ホスティングで、違いは主に独自ドメインの扱いにあります。

- **料金体系**: Free プランは無料です。静的ファイルへのリクエストは「Free・Paid ともに無料・無制限」。
  Pages Functions を使う場合のみ Workers の実行回数として課金され、Free では Workers と 1 日 10 万回の枠を共有します [7]
- **制約**: ビルドは Free 月 500 回、同時 1 本、20 分で打ち切り。ファイル数は Free 20,000、
  有料 100,000。1 ファイル 25 MiB。1 アカウント 100 プロジェクト。カスタムドメインは 1 プロジェクト 100 個までです [6]
- **前提条件**: Cloudflare アカウント。Workers と違い、Cloudflare 外の DNS で管理している
  ドメインも Custom Domain にできます [8]。Cloudflare が公開する Workers との機能比較表では、
  Pages が対応し Workers が非対応なのはこの「Cloudflare 外ゾーンの独自ドメイン」1 項目だけです。Early Hints・ブランチデプロイ制御・
  ファイルベースルーティング・Pages Plugins は Workers で部分対応、Cron Triggers・Gradual Deployments・
  Logpush などは Workers のみ対応と示されています [8]
- **検証した内容**: 仕様区分です。上記の公式ページ [6][7][8] を 2026-09-02 に確認しました。
  このサイトでは Workers を採用しているため、Pages への実デプロイは行っていません

### GitHub Pages

リポジトリがすでに GitHub にあるなら、追加のアカウントなしで始められるのが利点です。
ただし利用規約の用途制限があります。

- **料金体系**: GitHub Free で公開リポジトリから無料で公開できます。非公開リポジトリから
  公開するには GitHub Pro・Team・Enterprise Cloud・Enterprise Server が必要です [10]
- **制約**: 公開後のサイト容量 1 GB。転送量は月 100 GB のソフト上限。ビルドは 1 時間 10 回の
  ソフト上限（独自の GitHub Actions ワークフローで公開する場合は対象外）。デプロイは 10 分で打ち切られます [9]。利用規約上、オンラインビジネス・EC サイト・商用 SaaS など
  「商取引の促進を主目的とするサイト」の無料ホスティングとしては使えません [9]
- **前提条件**: GitHub アカウント。URL は `<owner>.github.io` か `<owner>.github.io/<repo>`。
  独自ドメインと HTTPS に対応しています [10]
- **検証した内容**: 仕様区分です。上記の公式ページ [9][10] を 2026-09-02 に確認しました。
  検証用にリポジトリを新規作成する必要があるため、今回は実デプロイを行っていません

### Netlify Free

無料枠がクレジット制で、考え方が他社と違います。
デプロイ回数と転送量が同じ 300 クレジットを分け合う点が分かれ目です。

- **料金体系**: Free は月 0 USD で月 300 クレジット。Personal は月 9 USD で 1,000 クレジット、
  Pro は月 20 USD からで 3,000 クレジットからです [11]。クレジットの消費は本番デプロイ 1 回 15、
  転送量 1 GB あたり 20、Web リクエスト 1 万件あたり 2、コンピュート 1 GB 時あたり 10。
  Deploy Preview とブランチデプロイは 0 です [12]。ビルド時間は課金指標ではなくなりました [12]
- **制約**: Free は「ハードリミット」で追加購入も自動リチャージもできません。クレジットを
  使い切ると「全サイトが停止し、訪問者には Site not available ページが表示される」とあります [12]。
  転送量だけで使い切る場合は月 15 GB、本番デプロイだけなら月 20 回に相当します
  （300 ÷ 20、300 ÷ 15 の計算値）
- **前提条件**: Netlify アカウント。Free はチームオーナー 1 名、500 プロジェクトまでです [11]
- **検証した内容**: 仕様区分です。上記の公式ページ [11][12] を 2026-09-02 に確認しました。
  Netlify アカウントを持たないため実デプロイは行っていません

### Vercel Hobby

無料枠の数字は GitHub Pages と同水準ですが、非商用に限定される点が最も大きな制約です。

- **料金体系**: Hobby は無料で請求サイクルがなく、上限を超えた機能は原則 30 日待つと再開します [13]。
  Pro はプラットフォーム料金が月 20 USD で、デプロイできる席 1 つと月 20 USD 分の利用クレジットを含みます。
  追加席は 1 名 20 USD です [16]
- **制約**: Fair Use ガイドラインの月間目安は転送量（Fast Data Transfer）100 GB までです [14]。
  1 日 100 デプロイ、200 プロジェクト、1 プロジェクト 50 ドメイン [13]。CLI からのアップロードは
  ソース 100 MB までです [15]。**Hobby は非商用・個人利用に限定**され、決済の受付、商品・サービスの
  販売広告、制作や運用で報酬を得ること、アフィリエイトリンクが主目的のサイト、AdSense などの
  広告掲載はすべて商用利用に該当します [14]
- **前提条件**: Vercel アカウント。Hobby チームは Git 組織（Organization）が所有するリポジトリを
  接続できません [15]
- **検証した内容**: 仕様区分です。上記の公式ページ [13][14][15][16] を 2026-09-02 に確認しました。
  Vercel アカウントを持たないため実デプロイは行っていません

## 用途別の選び方

広告を載せるか、DNS を Cloudflare に置けるか、リポジトリを公開できるかの 3 点で、選ぶ対象が分かれます。
各分岐の根拠は比較表の列に書いています。

- 広告・アフィリエイト・有料サービスの案内を載せる → Cloudflare Workers Static Assets か Cloudflare Pages。「主な制約」列のとおり、Vercel Hobby は広告・アフィリエイトを含む商用利用を禁止し、
  GitHub Pages は商取引が主目的のサイトを禁止しています（比較記事に広告を置く程度が該当するかは
  規約文からは判断できません）。Netlify Free は使い切ると停止します。Cloudflare の 2 つは静的リクエストが
  無制限で、料金・上限ページに用途の制限の記載がありません
- ドメインの DNS を Cloudflare に移したくない → Cloudflare Pages。「前提条件」列のとおり、
  Workers の Custom Domain は Cloudflare のゾーンが必須ですが、Pages は外部 DNS でも使えます
- 新規に Cloudflare で始める → Workers Static Assets。機能比較表で Workers のみ対応の項目が多く、
  Workers が非対応で Pages のみ対応なのは外部 DNS のドメインの 1 項目だけです [8]
- 非商用の個人サイトで、リポジトリが公開でよい → GitHub Pages。「無料枠」列の転送量 100 GB は Vercel Hobby と同水準で、追加のアカウントを作らずに済みます
- 非公開リポジトリから非商用サイトを無料で出したい → Netlify Free か Vercel Hobby。
  GitHub Pages は GitHub Pro 以上が要ります。Netlify は「無料枠」列の 300 クレジットを
  デプロイ回数と転送量で分け合う点に注意してください

公開したサイトが落ちていないかを無料枠で見張るなら、[死活監視の無料枠 5 つの比較](/posts/uptime-monitoring-free-tier/)が続きになります。
監視対象はこのサイト自身で、同じ Cloudflare の構成に対して作成から削除までを確認しています。

## 出典

1. [Cloudflare Workers — Static Assets: Billing and limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/) — 2026-09-02 確認
2. [Cloudflare Workers — Pricing](https://developers.cloudflare.com/workers/platform/pricing/) — 2026-09-02 確認
3. [Cloudflare Workers — Limits](https://developers.cloudflare.com/workers/platform/limits/) — 2026-09-02 確認
4. [Cloudflare Workers — Builds: Limits and pricing](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/) — 2026-09-02 確認
5. [Cloudflare Workers — Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) — 2026-09-02 確認
6. [Cloudflare Pages — Limits](https://developers.cloudflare.com/pages/platform/limits/) — 2026-09-02 確認
7. [Cloudflare Pages — Functions: Pricing](https://developers.cloudflare.com/pages/functions/pricing/) — 2026-09-02 確認
8. [Cloudflare Workers — Migrate from Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/) — 2026-09-02 確認
9. [GitHub Docs — GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) — 2026-09-02 確認
10. [GitHub Docs — About GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages) — 2026-09-02 確認
11. [Netlify Docs — Credit-based pricing plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/) — 2026-09-02 確認
12. [Netlify Docs — How credits work](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/) — 2026-09-02 確認
13. [Vercel Docs — Hobby Plan](https://vercel.com/docs/plans/hobby) — 2026-09-02 確認
14. [Vercel Docs — Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines) — 2026-09-02 確認
15. [Vercel Docs — Limits](https://vercel.com/docs/limits) — 2026-09-02 確認
16. [Vercel Docs — Pro Plan](https://vercel.com/docs/plans/pro-plan) — 2026-09-02 確認
