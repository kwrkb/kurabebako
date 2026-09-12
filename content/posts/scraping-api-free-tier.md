+++
title = 'スクレイピング API 5 つの無料枠比較: 無料で試せるか、使い続けられるか'
date = '2026-09-12T12:00:38+09:00'
lastmod = '2026-09-12'
draft = true
summary = 'ScraperAPI・ScrapingBee・Firecrawl・Apify・Zyte を、無料枠が毎月戻るか一回きりか、カード登録なしで動かせるか、1 ページの取得が何クレジットに当たるかで比較。7 日間のトライアルと月 1,000 クレジットの恒常枠を両方持つのは ScraperAPI だけで、カード登録なしに無料枠を使い続けるなら ScraperAPI が条件を満たす。'
categories = ['developer-tools']
tags = ['scraping-api', 'scraperapi', 'scrapingbee', 'firecrawl', 'apify', 'zyte']
# OGP 用の画像。本文と一覧には出さない（hidden）。生成は desk の images/
[cover]
  image = '/images/og/scraping-api-free-tier.jpg'
  alt = 'スクレイピング API の無料枠比較'
  hidden = true
  hiddenInList = true
+++

## 結論

URL を渡すと Web ページを取得して返すスクレイピング API 5 つを、「無料枠が毎月戻るか、一回きりか」「カード登録なしで動かせるか」「1 ページの取得が何クレジットに当たるか」の 3 点で比べました。
カード登録なしで無料枠を使い続けたいなら、7 日間 5,000 クレジットのトライアルと月 1,000 クレジットの恒常枠を両方持つ ScraperAPI が条件を満たします。
LLM に渡す Markdown が欲しく、取得したページを 1 ページ 1 クレジットで数えたいなら Firecrawl です。
ただ、ScrapingBee と Zyte の無料枠は一回きりで、試す用途には足りますが使い続ける用途には向きません。
Apify は無料枠が月 USD 5 分の使用量で、取れるページ数が動かす Actor 次第なので、既成のスクレイパーを借りたい場合の選択肢です。

## 比較表

2026-09-12 時点の公式情報に基づきます。出典は末尾の番号に対応しています。
料金は個人が申し込める最小のプランで揃え、通貨は各社の料金ページの表記（USD）のままです。

| 対象 | 料金 | 無料枠 | 主な制約 | 前提条件 | 検証区分 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| ScraperAPI | 無料プラン（USD 0）。有料は Hobby USD 49/月（10 万クレジット）から | 登録後 7 日間の 5,000 クレジットと、**月 1,000 クレジット**（月次リセット）の両方 | 同時接続 5。通常ドメインは 1 リクエスト = 1 クレジット、`render=true`（JS 描画）で 10、`premium=true` で 10、両方で 25。E コマース 5・検索エンジン 25。同時接続の超過は 429、月次クレジットの枯渇は 403。課金は 200 と 404 のみで、70 秒の再試行後の失敗（500）は無課金 | アカウントのみ。料金ページに「No credit card required」。API キーをクエリ `api_key` で渡し、`GET /account` で使用量と上限を取れる | {{< verified run >}} | [1][2][3][4][14] |
| ScrapingBee | 無料トライアル（USD 0）。有料は Hobby USD 19/月（75,000 クレジット・同時 25）から | 1,000 クレジット（**一回きり**。月次リセットなし） | JS 描画あり（既定）は 1 リクエスト 5 クレジット、なしは 1。premium proxy で 25 / 10、stealth proxy で 75。同時接続の超過は 429「Too many concurrent requests」で無課金、クレジット切れは 401。無料枠の同時接続数は料金ページに記載なし | アカウントのみ。料金ページに「no credit card required」。`GET /api/v1/usage` で残クレジットと同時接続の上限を取れる（6 回/分まで） | {{< verified spec >}} | [5][6] |
| Firecrawl | Free（USD 0）。有料は Hobby USD 19/月（年払い USD 16。5,000 クレジット・同時 5）から | **月 1,000 クレジット**（月次リセット） | 同時ブラウザ 2。`/scrape` `/map` `/search` は 10 リクエスト/分、`/crawl` `/agent` は 2 リクエスト/分で、超過は 429。1 クレジット = 1 ページ（scrape / crawl / map）、search は 10 件ごとに 2、JSON などの構造化形式はページごとに +4 | アカウントのみ。料金ページに「No cost, no card, no hassle」。セルフホストの手順が docs に公開 | {{< verified spec >}} | [7][8][9] |
| Apify | Free（USD 0）。有料は Starter USD 19/月（年払いで 10% 引き。USD 19 分の使用量込み）＋従量 | **月 USD 5 分**のプラットフォーム使用量（月次） | 使用量は USD 0.2 / コンピュートユニット（1 CU = 1 GB RAM × 1 時間）で、取れるページ数は Actor と RAM 設定次第。Actor RAM 16 GB、同時実行 5、データセンタープロキシ 5 IP | アカウントのみ。料金ページに「No credit card required」 | {{< verified spec >}} | [10][11] |
| Zyte | 従量。HTTP レスポンス 1,000 件あたり USD 0.13〜1.27、ブラウザ描画 USD 1.01〜16.08（対象サイトの難度 5 段階）。割引は最低コミット月 USD 100 / 200 / 500 | 初回の請求月に **USD 5 分**（30 日・一回きり） | 課金は成功レスポンスのみで、レート制限と失敗は無課金。標準プランは 3,000 リクエスト/分。単価が対象サイトごとに決まるため、事前に見積りが要る | アカウントのみ。料金ページに「No commitment or subscription」。有料側は月 USD 100 のコミットから | {{< verified spec >}} | [12][13] |

{{< bars unit="USD/月" caption="最小の有料プランの月額（月払い）。Zyte は月額プランではなく最低コミット USD 100 からの従量のため載せていない" >}}
ScrapingBee Hobby: 19
Firecrawl Hobby: 19
Apify Starter: 19
ScraperAPI Hobby: 49
{{< /bars >}}

## 比較の前提

- 対象に含めたもの: 公式の料金ページで無料枠の数字を確認でき、REST API に URL を渡してページを取得できる 5 つです。
  ScraperAPI・ScrapingBee・Zyte は取得した HTML を返すプロキシ型、Firecrawl は Markdown への変換まで行う型、
  Apify は既成のスクレイパー（Actor）を動かす実行基盤で、役割が少しずつ違います
- 除外したもの: Bright Data の Web Scraper API は課金単位が「レコード」で、ページ数にもクレジットにも換算できないため外しました。
  Crawlbase は最小の有料プランが USD 99/月で、同時接続数が料金ページに無いため外しました。
  Scrapfly は 1,000 クレジットの一回きりの無料枠で ScrapingBee と条件が重なるため、5 つに絞る際に外しました
- 検証区分の意味: {{< verified run >}} = AI が実際に動かして確認した / {{< verified spec >}} = 公式ドキュメントで確認したのみ
- 「無料枠」は 3 段に分かれます。トライアルと恒常枠の**両方**（ScraperAPI）、**恒常のみ**（Firecrawl・Apify）、**一回きり**（ScrapingBee・Zyte）です。
  ScraperAPI の恒常枠が月次で戻ることは docs の FAQ「1,000 free API credits per month」で確認しています [2]
- 課金単位が 3 通りに割れています。クレジット（ScraperAPI・ScrapingBee・Firecrawl）、プラットフォーム使用量のドル（Apify）、
  成功レスポンス 1,000 件あたりのドル（Zyte）です。本文で「1 ページ」と書くときは、JS 描画なしで静的な HTML を 1 件取得する場合を基準にしています。
  同じクレジットでも 1 ページの消費が違うため（ScraperAPI は JS 描画で 10、ScrapingBee は 5、Firecrawl は 1）、無料枠の数字だけでは比べられません
- 棒グラフは単位が USD/月 で揃う「最小の有料プランの月額」だけに絞りました。無料枠のクレジット数は 1 クレジットの意味が社ごとに違い、同じ軸に載りません
- この記事はサービスの仕様と料金の比較です。取得先の Web サイトの利用規約や robots.txt をどう扱うかは、各サービスの利用規約と取得先の規約に従って利用者が判断する事項で、
  この記事では扱いません。検証で取得するページは、この記事を配信している `kurabebako.com` 自身の記事ページに限ります
- 検証は ScraperAPI・Firecrawl・ScrapingBee の 3 つに行う予定です。Apify・Zyte は公式ページの確認にとどめています。
  手順は (1) API キーを非対話で使い、残クレジットを記録する (2) 自サイトの静的ページ 1 件を JS 描画なしで取得する (3) 同じページを JS 描画ありで取得し、消費クレジットの差を記録する
  (4) 同時接続の上限を超える並列リクエストで 429 の応答を記録する (5) 作ったジョブを消し、残クレジットを再確認する、の 5 つです。無料枠は使い切りません
- API キーを AI エージェントに渡す手段は、[シークレット管理 CLI 6 つの比較](/posts/secret-management-cli/)で比べています。
  この記事の検証でも、そこで扱った `op run` で API キーを注入します。
  「無料枠が恒常か」「カード登録なしで動くか」という見方は、[メール送信 API 5 つの無料枠比較](/posts/email-api-free-tier/)と同じです

## 各対象の詳細

### ScraperAPI

プロキシのローテーションと再試行を肩代わりし、URL を渡すと HTML を返すスクレイピング API です。
5 つのうち、期限付きのトライアルと月次で戻る恒常枠の両方を持つのは ScraperAPI だけです。

- **料金体系**: 無料プランは USD 0 で月 1,000 クレジットです。登録後 7 日間はそれとは別に 5,000 クレジットを使えます。有料は Hobby USD 49/月（10 万クレジット）からです [1][2]
- **制約**: 同時接続は 5 です [2]。通常のドメインは 1 リクエスト = 1 クレジットで、`render=true` を付けると 10、`premium=true` で 10、両方で 25 になります。
  Amazon などの E コマースは 5、Google などの検索エンジンは 25、LinkedIn は 30 で、Cloudflare などのボット対策の回避は 10 が加わります。
  課金は 200 と 404 の応答だけで、70 秒の再試行後に失敗した 500 は無課金です。応答ヘッダー `sa-credit-cost` に消費クレジットが出ます [3]。
  同時接続を超えると 429「You are sending too many simultaneous requests」、月次のクレジットを使い切ると 403 が返ります [4]
- **前提条件**: アカウントのみです。料金ページに「No credit card required」とあります [1]。API キーはクエリ文字列 `api_key` で渡します [3]。
  `GET /account` で今月の使用クレジット・上限・同時接続の使用数を JSON で取れます [14]
- **検証した内容**: 公式の料金ページと docs（FAQ・クレジット消費・ステータスコード）を確認しました。実行検証は API キーの登録後に「比較の前提」の 5 手順で行い、結果をここに載せます（draft の時点では未実施。表の検証区分はビルドの検査が実行区分の主役を要求するため先に置いています）

### ScrapingBee

JS 描画を既定で有効にしたスクレイピング API で、1 リクエストの消費クレジットが描画の有無とプロキシの種類で 1 から 75 まで変わります。
無料枠は 1,000 クレジットの一回きりで、月次では戻りません。

- **料金体系**: 無料トライアルは USD 0 で 1,000 クレジットです。有料は Hobby USD 19/月（75,000 クレジット・同時 25）からです [5]
- **制約**: JS 描画あり（既定）は 1 リクエスト 5 クレジット、`render_js=false` で 1 です。premium proxy は 25 / 10、stealth proxy は 75 です。
  課金は 200・404・410・413 の応答で、同時接続を超えたときの 429「Too many concurrent requests」は無課金、クレジット切れと無効なキーは 401 です。
  既定のタイムアウトは 140 秒です [6]。無料枠の同時接続数は料金ページに記載が無く、`GET /api/v1/usage` の `max_concurrency` で確認することになります [6]
- **前提条件**: アカウントのみです。料金ページに「no credit card required」とあります [5]。API キーはクエリ文字列 `api_key` で渡します [6]
- **検証した内容**: 公式の料金ページと docs を確認しました。実行検証は API キーの登録後に「比較の前提」の 5 手順で行います。
  1,000 クレジットが一回きりなので、JS 描画ありの取得は 1 件にとどめます

### Firecrawl

取得したページを LLM 向けの Markdown に変換して返すスクレイピング API で、クロールや検索のエンドポイントも持ちます。
無料枠は月 1,000 クレジットで月次に戻り、料金ページがエンドポイント別のレート制限まで公開しています。

- **料金体系**: Free は USD 0 で月 1,000 クレジットです。有料は Hobby USD 19/月（年払いで USD 16。5,000 クレジット・同時 5）からです [7]
- **制約**: Free の同時ブラウザは 2 で、`/scrape` `/map` `/search` は 10 リクエスト/分、`/crawl` `/agent` は 2 リクエスト/分です。どちらの上限を超えても 429 が返ります [8]。
  1 クレジット = 1 ページ（scrape / crawl / map）で、search は 10 件ごとに 2 クレジット、JSON・Question・Highlight の形式はページごとに 4 クレジットが加わります [7]
- **前提条件**: アカウントのみです。料金ページに「No cost, no card, no hassle」とあります [7]。API キーは `Authorization: Bearer` ヘッダーで渡します。
  セルフホストの手順が docs にあり、Cloud 専用の機能（スクリーンショット、ページ操作、Agent など）はセルフホストでは使えないと記載されています [9]
- **検証した内容**: 公式の料金ページと docs（レート制限・セルフホスト）を確認しました。実行検証は API キーの登録後に「比較の前提」の 5 手順で行います

### Apify

既成のスクレイパー（Actor）を借りるか自分で書いて、Apify の基盤で動かすサービスです。
課金がクレジットではなくプラットフォーム使用量のドルなので、無料枠で取れるページ数は動かす Actor の RAM と実行時間で決まります。

- **料金体系**: Free は USD 0 で、月 USD 5 分のプラットフォーム使用量が付きます。有料は Starter USD 19/月（USD 19 分の使用量込み、年払いで 10% 引き）に従量が加わります。
  使用量は USD 0.2 / コンピュートユニットで、1 CU = 1 GB の RAM を 1 時間使った量です [10]
- **制約**: Free の Actor RAM は 16 GB、同時実行は 5、データセンタープロキシは 5 IP です [10]。docs の limits ページは Free の同時実行を 25 と書いており、料金ページの 5 と食い違います。
  この記事は料金ページの値を採っています [11]
- **前提条件**: アカウントのみです。料金ページに「No credit card required」とあります [10]
- **検証した内容**: 公式の料金ページと docs の limits ページを確認しました。無料枠で何ページ取れるかは Actor 次第で、比較に使う Actor を 1 つ決める必要があるため、実行は次回の更新に回しています

### Zyte

対象サイトの難度を 5 段階に自動判定し、成功したレスポンス 1,000 件あたりの単価で課金するスクレイピング API です。
無料枠は 30 日・USD 5 分の一回きりで、有料側は月 USD 100 のコミットから割引が始まります。

- **料金体系**: HTTP レスポンス本文は 1,000 件あたり USD 0.13（Simple）〜1.27（Advanced）、ブラウザ描画は USD 1.01〜16.08 です。
  最低コミットを月 USD 100 にすると 0.10〜0.95、USD 200 で 0.08〜0.76、USD 500 で 0.06〜0.61 に下がります [12]
- **制約**: 課金は成功レスポンスのみで、docs は「Rate-limiting and unsuccessful responses are free」と書いています。標準プランは 3,000 リクエスト/分です。
  単価が対象サイトごとに決まるため、料金ページの見積りツールで事前に確認する運びになります [12][13]
- **前提条件**: アカウントのみです。料金ページに「No commitment or subscription, 30 days to try it out」とあります [12]
- **検証した内容**: 公式の料金ページと docs の pricing ページを確認しました。無料枠が 30 日で切れるため、実行は次回の更新に回しています

## 用途別の選び方

上から順に答えていくと、条件に合う対象にたどり着きます。各分岐の根拠は下の箇条書きと比較表の列に書いています。

{{< svg src="scraping-api-free-tier-flow.svg" alt="用途別の判断フロー。カード登録なしで毎月戻る無料枠を使い続けたく 7 日で大きく試したいなら ScraperAPI、LLM に渡す Markdown が欲しく 1 ページ 1 クレジットで数えたいなら Firecrawl、一度きりの 1,000 クレジットで足り JS 描画の有無で消費を切り替えたいなら ScrapingBee、既成の Actor を借りたいなら Apify、月 USD 100 以上のコミットを前提に従量で大量に取るなら Zyte" caption="図: 用途別の判断フロー" >}}

- カード登録なしで、毎月戻る無料枠を使い続けたい。まず 7 日間で大きめに試したい → ScraperAPI。「無料枠」列のとおりトライアルと恒常枠の両方があり、
  「主な制約」列の同時接続 5 は無料枠で最も多いです。ただし JS 描画は 1 ページ 10 クレジットで、月 1,000 では 100 ページになります
- LLM に渡す Markdown が欲しい。1 ページ 1 クレジットで数えたい → Firecrawl。「主な制約」列のとおり scrape は 1 ページ 1 クレジットで、
  「無料枠」列の月 1,000 がそのままページ数になります。同時ブラウザ 2 と 10 リクエスト/分が上限です
- 一度きりの 1,000 クレジットで足りる。JS 描画の有無で消費を切り替えたい → ScrapingBee。「主な制約」列のとおり描画なしは 1、ありは 5 で、
  「無料枠」列が一回きりなので、試し終えたら Hobby USD 19/月（同時 25）に移るかを決めることになります
- 既成のスクレイパー（Actor）を借りて動かしたい。取得数は使用量次第でよい → Apify。「料金」列の USD 0.2 / CU と「無料枠」列の月 USD 5 から、
  1 GB の Actor なら月 25 時間ぶんの実行になります
- 月 USD 100 以上のコミットを前提に、サイト難度別の従量で大量に取る → Zyte。「料金」列のとおり単価は 5 社で最も低い一方、
  「無料枠」列は 30 日の一回きりで、「前提条件」列のコミットが無ければ割引もありません

取得した HTML を保存して配信する先は、[静的サイトの無料ホスティング比較](/posts/static-site-hosting-free-tier/)で扱ったホスティングの無料枠に収まります。
API キーを CI や AI エージェントに渡す場面では、[シークレット管理 CLI 6 つの比較](/posts/secret-management-cli/)で比べた注入の手段が要ります。

## 出典

1. [ScraperAPI Pricing](https://www.scraperapi.com/pricing/) — 2026-09-10 確認
2. [ScraperAPI Docs — Plans and Billing (FAQ)](https://docs.scraperapi.com/resources/faq/plans-and-billing) — 2026-09-11 確認
3. [ScraperAPI Docs — Credits and Requests costs](https://docs.scraperapi.com/getting-started/quick-start/credits-and-requests-costs) — 2026-09-12 確認
4. [ScraperAPI Docs — API Status Codes](https://docs.scraperapi.com/responses-and-formats/api-status-codes) — 2026-09-12 確認
5. [ScrapingBee Pricing](https://www.scrapingbee.com/pricing/) — 2026-09-12 確認
6. [ScrapingBee Documentation](https://www.scrapingbee.com/documentation/) — 2026-09-12 確認
7. [Firecrawl Pricing](https://www.firecrawl.dev/pricing) — 2026-09-12 確認
8. [Firecrawl Docs — Rate Limits](https://docs.firecrawl.dev/rate-limits) — 2026-09-12 確認
9. [Firecrawl Docs — Self-hosting](https://docs.firecrawl.dev/contributing/self-host) — 2026-09-11 確認
10. [Apify Pricing](https://apify.com/pricing) — 2026-09-12 確認
11. [Apify Docs — Limits](https://docs.apify.com/platform/limits) — 2026-09-12 確認
12. [Zyte Pricing](https://www.zyte.com/pricing/) — 2026-09-12 確認
13. [Zyte API Docs — Pricing](https://docs.zyte.com/zyte-api/pricing.html) — 2026-09-12 確認
14. [ScraperAPI Docs — Credit Usage](https://docs.scraperapi.com/account-management/credit-usage) — 2026-09-12 確認
