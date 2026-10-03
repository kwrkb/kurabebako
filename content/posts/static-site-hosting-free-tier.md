+++
title = '静的サイトの無料ホスティング 5 社比較: 広告を載せるならどれか'
date = '2026-09-02T19:43:49+09:00'
lastmod = '2026-10-03'
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

- **広告やアフィリエイトを載せる可能性がある** → Cloudflare Workers Static Assets。静的ファイルへのリクエストが無料・無制限で、料金・上限ページに用途の制限の記載がありません
- **ドメインの DNS を Cloudflare に移したくない** → Cloudflare Pages。同じ Cloudflare の静的配信で、Cloudflare 外の DNS のドメインも使えます
- **非商用の個人サイトで、公開リポジトリが GitHub にある** → GitHub Pages。追加のアカウントなしで始められます。ただし商取引が主目的のサイトは認められていません

| こういう条件なら | 対象 | 決め手 |
| --- | --- | --- |
| 広告やアフィリエイトを載せる可能性がある | Cloudflare Workers Static Assets | 「無料枠」列（静的ファイルへのリクエストは無料・無制限）と「主な制約」列（上限はファイルとビルドだけ） |
| ドメインの DNS を Cloudflare に移したくない | Cloudflare Pages | 「前提条件」列（Cloudflare 外の DNS でも可） |
| 非商用の個人サイトで、公開リポジトリが GitHub にある | GitHub Pages | 「前提条件」列（GitHub Free は公開リポジトリのみ）と「主な制約」列（商取引が主目的のサイトは不可） |
| 非公開リポジトリから非商用サイトを出したい。デプロイも転送も少ない | Netlify Free | 「無料枠」列（デプロイと転送でクレジットを分け合う）と「主な制約」列（使い切ると全サイトが停止） |
| 非公開リポジトリから非商用の個人サイトを出したい | Vercel Hobby | 「主な制約」列（非商用・個人利用のみ）と「前提条件」列（組織所有のリポジトリは接続不可） |

## 比較表

2026-10-03 時点の公式情報に基づきます。出典は末尾の番号に対応しています。
対象名を押すと、その対象の詳細に移ります。

| 対象 | 料金 | 無料枠 | 主な制約 | 前提条件 | 検証区分 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| [Cloudflare Workers Static Assets](#cloudflare-workers-static-assets) | 無料。有料は月 5 USD から（静的配信だけなら不要） | 静的ファイルへのリクエストは無料・無制限。保存容量も無料。ビルドは月 3,000 分 | 1 バージョンあたり 20,000 ファイル、1 ファイル 25 MiB。同時ビルド 1、ビルド 20 分で打ち切り | Cloudflare アカウント。独自ドメインは DNS を Cloudflare に置く必要あり。自動ビルドは GitHub か GitLab | {{< verified run >}} | [1][2][3][4][5] |
| [Cloudflare Pages](#cloudflare-pages) | 無料。有料プラン（Pro・Business・Enterprise）は上限が増える | 静的ファイルへのリクエストは無料・無制限。ビルドは月 500 回 | 20,000 ファイル、1 ファイル 25 MiB、100 プロジェクト、同時ビルド 1、ビルド 20 分で打ち切り | Cloudflare アカウント。独自ドメインは Cloudflare 外の DNS でも可 | {{< verified spec >}} | [6][7][8] |
| [GitHub Pages](#github-pages) | 無料（GitHub Free）。非公開リポジトリから公開するには GitHub Pro 以上 | サイト容量 1 GB、転送量 月 100 GB（ソフト上限） | ビルド 1 時間に 10 回（ソフト上限、独自の Actions なら対象外）、デプロイ 10 分で打ち切り。オンラインビジネス・EC・商用 SaaS など商取引が主目的のサイトは不可 | GitHub アカウント。GitHub Free では公開リポジトリのみ | {{< verified spec >}} | [9][10] |
| [Netlify Free](#netlify-free) | 無料。有料は Personal 月 9 USD から | 月 300 クレジット（本番デプロイ 1 回 15、転送 1 GB 20、リクエスト 1 万件 2） | クレジットを使い切ると全サイトが停止し「Site not available」になる。追加購入不可 | Netlify アカウント。500 プロジェクトまで、チームオーナー 1 名 | {{< verified spec >}} | [11][12] |
| [Vercel Hobby](#vercel-hobby) | 無料。有料は Pro 月 20 USD（デプロイ席 1 つ込み）から | 転送量 月 100 GB まで（Fair Use の目安） | 非商用・個人利用のみ。広告掲載やアフィリエイト主目的のサイトは商用扱い。1 日 100 デプロイ、200 プロジェクト、1 プロジェクト 50 ドメイン | Vercel アカウント。組織所有の Git リポジトリは接続不可 | {{< verified spec >}} | [13][14][15][16] |

## 比較の前提

- 対象に含めたもの: Git リポジトリからの自動デプロイと独自ドメインの両方を無料枠で提供し、
  公式の料金・上限ページが公開されている 5 サービスです。Hugo・Astro・Eleventy などが出力する
  静的 HTML をそのまま置く用途を想定し、サーバーサイド実行（Functions）の枠は比較していません。
  関数の実行回数・CPU 時間・タイムアウトは、[サーバーレス実行環境の無料枠比較](/posts/serverless-free-tier/)で比べています
- 除外したもの: Firebase Hosting・Render・Surge など。初回は対象を 5 つに絞ったためで、
  次回以降の更新で追加します。VPS やレンタルサーバーは、無料枠での常時公開を前提にできず
  比較軸（無料枠・用途制限）が揃わないため対象外にしました。
  サーバーごと借りる場合の国内 VPS の最小プランは、[別の記事](/posts/vps-japan-minimum-plan/)で比べています。
  root 権限は要らないが WordPress やメールも使いたい場合は、[国内の共用レンタルサーバー比較](/posts/shared-hosting-japan/)が対象になります
- 検証区分の意味: {{< verified run >}} = AI が実際に動かして確認した / {{< verified spec >}} = 公式ドキュメントで確認したのみ
- 料金表記の注意: 料金は USD 表記の公式価格をそのまま載せ、税と為替は考慮していません
- 選び方の軸: 「主な制約」列は、用途の制限で分かれます。Vercel Hobby は広告・アフィリエイトを含む商用利用を禁止し、GitHub Pages は商取引が主目的のサイトを認めていません。
  比較記事に広告を置く程度が該当するかは、規約文からは判断できません。Cloudflare の 2 つは、料金・上限ページに用途の制限の記載がありません。
  「無料枠」列は、上限に達したときの扱いで分かれます。Netlify Free はクレジットを使い切ると全サイトが止まり、Cloudflare の 2 つは静的ファイルへのリクエストに上限がありません。
  「前提条件」列は、独自ドメインの DNS を Cloudflare に置けるかと、リポジトリを公開できるかで分かれます
- 検証の手順: Cloudflare Workers Static Assets は、このサイト自体の稼働で 2026-09-02 に確かめました（トップページの応答・存在しないパスの 404・出力のファイル数）。
  ほかの 4 つは、2026-10-03 に公式ページを確認するにとどめています。結果は「各対象の詳細」の「検証した内容」に書いています

## 各対象の詳細

### Cloudflare Workers Static Assets

このサイト自身が使っている構成です。Worker のスクリプトを置かずに静的ファイルだけを配信すると、
Free プランの実行回数の枠を消費しない点が特徴です。

{{< fit run >}}
向く: 広告やアフィリエイトを載せる可能性がある。ドメインの DNS を Cloudflare に置ける
向かない: ドメインの DNS を Cloudflare の外に置いたまま使いたい
{{< /fit >}}

- **料金体系**: Workers Paid は、Worker スクリプトの実行回数（月 1,000 万回込み、超過 100 万回ごと 0.30 USD）と CPU 時間に課金されます [1][2]。
  Worker スクリプトを置かない静的配信専用の構成なら、Free プランの 1 日 10 万リクエストの上限を消費しません [1][3]
- **制約**: 1 バージョンあたりのファイル数は、Paid では 100,000 です。アカウントあたりの Worker 数は Free で 100 です [3]
- **前提条件**: Free プランで使えます。Custom Domain の DNS レコードと証明書は、Cloudflare が自動で作成します [5]
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
Cloudflare 外の DNS で管理しているドメインも使える点が、Workers との分かれ目です。

{{< fit spec >}}
向く: ドメインの DNS を Cloudflare に移さずに、Cloudflare で配信したい
向かない: Cron Triggers や Gradual Deployments など、Workers だけの機能を使いたい
{{< /fit >}}

- **料金体系**: Pages Functions を使う場合だけ Workers の実行回数として課金され、Free では Workers と 1 日 10 万回の枠を共有します [7]
- **制約**: ファイル数は有料プランで 100,000 です。カスタムドメインは 1 プロジェクト 100 個までです [6]
- **前提条件**: Cloudflare が公開する Workers との機能比較表では、
  Pages が対応し Workers が非対応なのはこの「Cloudflare 外ゾーンの独自ドメイン」1 項目だけです（Custom Branch Aliases は Workers で「提供予定」の表示）。Early Hints・ブランチデプロイ制御・
  ファイルベースルーティング・Pages Plugins は Workers では非対応だが回避策あり、Cron Triggers・Gradual Deployments・
  Logpush などは Workers のみ対応と示されています [8]
- **検証した内容**: 仕様区分です。上記の公式ページ [6][7][8] を 2026-10-03 に確認しました。
  このサイトでは Workers を採用しているため、Pages への実デプロイは行っていません

### GitHub Pages

リポジトリがすでに GitHub にあるなら、追加のアカウントなしで始められるのが利点です。
ただし利用規約の用途制限があります。

{{< fit spec >}}
向く: 非商用の個人サイトで、公開リポジトリが GitHub にある
向かない: 商取引が主目的のサイトを出したい。非公開リポジトリから無料で出したい
{{< /fit >}}

- **料金体系**: 非公開リポジトリから公開できるのは、GitHub Pro のほかに Team・Enterprise Cloud・Enterprise Server です [10]
- **制約**: 利用規約の文言は、「商取引の促進を主目的とするサイト」の無料ホスティングとしては使えない、というものです [9]
- **前提条件**: URL は `<owner>.github.io` か `<owner>.github.io/<repo>` です。
  独自ドメインと HTTPS に対応しています [10]
- **検証した内容**: 仕様区分です。上記の公式ページ [9][10] を 2026-10-03 に確認しました。
  検証用にリポジトリを新規作成する必要があるため、今回は実デプロイを行っていません

### Netlify Free

無料枠がクレジット制で、考え方が他社と違います。
デプロイ回数と転送量が同じクレジットを分け合う点が分かれ目です。

{{< fit spec >}}
向く: 本番デプロイと転送量が少ない非商用サイトを、無料で出したい
向かない: 上限に達してもサイトを止めたくない。本番デプロイを頻繁に回したい
{{< /fit >}}

- **料金体系**: Personal は 1,000 クレジット、
  Pro は月 20 USD からで 3,000 クレジットからです [11]。クレジットの消費には、表の項目のほかにコンピュート 1 GB 時あたり 10 があり、
  Deploy Preview とブランチデプロイは 0 です [12]。ビルド時間は課金指標ではなくなりました [12]
- **制約**: Free は「ハードリミット」で、自動リチャージもできません。使い切ったときの文言は「全サイトが停止し、訪問者には Site not available ページが表示される」です [12]。
  転送量だけで使い切る場合は月 15 GB、本番デプロイだけなら月 20 回に相当します
  （300 ÷ 20、300 ÷ 15 の計算値）
- **前提条件**: Free の条件は、表の「前提条件」列に載せたチームオーナーとプロジェクトの数です [11]
- **検証した内容**: 仕様区分です。上記の公式ページ [11][12] を 2026-10-03 に確認しました。
  Netlify アカウントを持たないため実デプロイは行っていません

### Vercel Hobby

無料枠の数字は GitHub Pages と同水準ですが、非商用に限定される点が最も大きな制約です。
広告やアフィリエイトを載せるサイトは、Hobby では商用利用に当たります。

{{< fit spec >}}
向く: 非商用の個人サイトを、個人のリポジトリから無料で出したい
向かない: 広告やアフィリエイトを載せたい。組織が所有するリポジトリから出したい
{{< /fit >}}

- **料金体系**: Hobby には請求サイクルがなく、上限を超えた機能は原則 30 日待つと再開します [13]。
  Pro の月額には、デプロイできる席のほかに月 20 USD 分の利用クレジットが含まれます。
  追加席は 1 名 20 USD です [16]
- **制約**: 転送量の目安は、Fair Use ガイドラインの Fast Data Transfer の値です [14]。CLI からのアップロードは
  ソース 100 MB までです [15]。商用利用に当たるのは、決済の受付、商品・サービスの
  販売広告、制作や運用で報酬を得ること、アフィリエイトリンクが主目的のサイト、AdSense などの
  広告掲載です [14]
- **前提条件**: 接続できないのは、Hobby チームから Git 組織（Organization）が所有するリポジトリです [15]
- **検証した内容**: 仕様区分です。上記の公式ページ [13][14][15][16] を 2026-10-03 に確認しました。
  Vercel アカウントを持たないため実デプロイは行っていません

## 用途別の選び方

上から順に答えていくと、条件に合う対象にたどり着きます。各分岐の決め手は比較表の列で、数字はそちらを見てください。

- 広告・アフィリエイト・有料サービスの案内を載せる → Cloudflare Workers Static Assets か Cloudflare Pages。決め手は「主な制約」列です。
  Vercel Hobby と GitHub Pages には用途の制限があり、Netlify Free は使い切ると止まります
- ドメインの DNS を Cloudflare に移したくない → Cloudflare Pages。決め手は「前提条件」列です
- 新規に Cloudflare で始める → Workers Static Assets。決め手は「前提条件」列です。
  公式の機能比較表では Workers のみ対応の項目が多く、Pages のみ対応なのは外部 DNS のドメインだけです（Custom Branch Aliases は Workers で提供予定）[8]
- 非商用の個人サイトで、リポジトリが公開でよい → GitHub Pages。決め手は「無料枠」列と「前提条件」列です。追加のアカウントを作らずに済みます
- 非公開リポジトリから非商用サイトを無料で出したい → Netlify Free か Vercel Hobby。決め手は「料金」列と「無料枠」列です。
  GitHub Pages は非公開リポジトリだと有料プランが要ります。Netlify はデプロイ回数と転送量で同じクレジットを分け合います

公開したサイトが落ちていないかを無料枠で見張るなら、[死活監視の無料枠 5 つの比較](/posts/uptime-monitoring-free-tier/)が続きになります。
監視対象はこのサイト自身で、同じ Cloudflare の構成に対して作成から削除までを確認しています。
公開したサイトがどれだけ読まれているかを無料で数えるなら、[アクセス解析の無料枠比較](/posts/analytics-free-tier/)が対象になります。
静的なファイルだけでは足りず、リクエストに応じてコードを動かすなら、[サーバーレス実行環境の無料枠比較](/posts/serverless-free-tier/)が対象になります。

## よくある質問

### 広告やアフィリエイトを載せたサイトを無料で公開できますか？

Vercel Hobby は非商用・個人利用に限られ、AdSense などの広告掲載やアフィリエイトリンクが主目的のサイトは商用利用に当たります [14]。GitHub Pages は、商取引の促進を主目的とするサイトには使えません [9]。
Cloudflare Workers Static Assets と Cloudflare Pages は、料金・上限ページに用途の制限の記載がありません [1][6]。

### 無料枠を超えるとどうなりますか？

Netlify Free はクレジットを使い切ると全サイトが停止し、訪問者には「Site not available」が表示されます。追加購入もできません [12]。
Vercel Hobby は、上限を超えた機能が原則 30 日待つと再開します [13]。Cloudflare の 2 つは静的ファイルへのリクエストに上限がなく、GitHub Pages の転送量 月 100 GB はソフト上限です [1][7][9]。

### 独自ドメインは使えますか？

5 つとも、無料枠で独自ドメインを使えます。Cloudflare Workers Static Assets はドメインの DNS ゾーンを Cloudflare に置く必要があり、Cloudflare Pages は Cloudflare 外の DNS のドメインでも使えます [5][8]。
GitHub Pages は独自ドメインと HTTPS に対応しています [10]。

### Cloudflare Workers と Cloudflare Pages の違いは？

どちらも静的ファイルへのリクエストは無料・無制限で、ファイル数（Free 20,000）と 1 ファイル 25 MiB の上限も同じです [1][3][6][7]。
違いは独自ドメインの扱いで、Pages は Cloudflare 外の DNS のドメインも使えますが、Workers は DNS を Cloudflare に置く必要があります [5][8]。
Cron Triggers・Gradual Deployments・Logpush などは、Workers だけが対応しています [8]。

## 出典

1. [Cloudflare Workers — Static Assets: Billing and limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/) — 2026-10-03 確認
2. [Cloudflare Workers — Pricing](https://developers.cloudflare.com/workers/platform/pricing/) — 2026-10-03 確認
3. [Cloudflare Workers — Limits](https://developers.cloudflare.com/workers/platform/limits/) — 2026-10-03 確認
4. [Cloudflare Workers — Builds: Limits and pricing](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/) — 2026-10-03 確認
5. [Cloudflare Workers — Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) — 2026-10-03 確認
6. [Cloudflare Pages — Limits](https://developers.cloudflare.com/pages/platform/limits/) — 2026-10-03 確認
7. [Cloudflare Pages — Functions: Pricing](https://developers.cloudflare.com/pages/functions/pricing/) — 2026-10-03 確認
8. [Cloudflare Workers — Migrate from Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/) — 2026-10-03 確認
9. [GitHub Docs — GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) — 2026-10-03 確認
10. [GitHub Docs — About GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages) — 2026-10-03 確認
11. [Netlify Docs — Credit-based pricing plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/) — 2026-10-03 確認
12. [Netlify Docs — How credits work](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/) — 2026-10-03 確認
13. [Vercel Docs — Hobby Plan](https://vercel.com/docs/plans/hobby) — 2026-10-03 確認
14. [Vercel Docs — Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines) — 2026-10-03 確認
15. [Vercel Docs — Limits](https://vercel.com/docs/limits) — 2026-10-03 確認
16. [Vercel Docs — Pro Plan](https://vercel.com/docs/plans/pro-plan) — 2026-10-03 確認
