+++
title = 'スクレイピング API 5 つの無料枠比較: 無料で試せるか、使い続けられるか'
date = '2026-09-12T12:00:38+09:00'
lastmod = '2026-10-03'
draft = false
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

{{< pr >}}

## 結論

URL を渡すと Web ページを取得して返すスクレイピング API 5 つを、「無料枠が毎月戻るか、一回きりか」「カード登録なしで動かせるか」「1 ページの取得が何クレジットに当たるか」の 3 点で比べました。

- **カード登録なしで、毎月戻る無料枠を使い続けたい** → ScraperAPI。期限付きのトライアルと月次で戻る恒常枠を、両方持つのはここだけです
- **LLM に渡す Markdown が欲しく、ブラウザ描画込みでもページ数どおりに数えたい** → Firecrawl。取得したページを Markdown に変換して返し、無料枠も月次で戻ります
- **既成のスクレイパー（Actor）を借りて動かしたい** → Apify。取れるページ数は動かす Actor 次第です。
  ScrapingBee と Zyte の無料枠は一回きりで、試す用途には足りますが使い続ける用途には向きません

| こういう条件なら | 対象 | 決め手 |
| --- | --- | --- |
| カード登録なしで、毎月戻る無料枠を使い続けたい。まず登録直後に大きめに試したい | ScraperAPI | 「無料枠」列（トライアルと恒常枠の両方）と「前提条件」列（カード不要） |
| LLM に渡す Markdown が欲しく、ブラウザ描画込みでもページ数どおりに数えたい | Firecrawl | 「無料枠」列（月次で戻る）と「主な制約」列（クレジットがそのままページ数） |
| 一回きりの無料枠で足り、JS 描画の有無で消費を切り替えて試したい | ScrapingBee | 「無料枠」列（一回きり）と「主な制約」列（描画とプロキシの種類で消費が変わる） |
| 既成のスクレイパー（Actor）を借りて動かしたい | Apify | 「料金」列（使用量のドルで課金）と「無料枠」列（月次の使用量） |
| 月額のコミットを前提に、サイトの難度別の従量で大量に取りたい | Zyte | 「料金」列（対象サイトの難度で単価が決まる）と「前提条件」列（割引はコミットから） |

{{< cta id="scraperapi" text="ScraperAPI の無料プランに登録する（カード登録なし）" >}}

## 比較表

2026-10-03 時点の公式情報に基づきます。出典は末尾の番号に対応しています。
料金は個人が申し込める最小のプランで揃え、通貨は各社の料金ページの表記（USD）のままです。対象名を押すと、その対象の詳細に移ります。

| 対象 | 料金 | 無料枠 | 主な制約 | 前提条件 | 検証区分 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| [ScraperAPI](#scraperapi) | 無料プラン（USD 0）。有料は Hobby USD 49/月（10 万クレジット）から | 登録後 7 日間の 5,000 クレジットと、**月 1,000 クレジット**（月次リセット）の両方 | 同時接続 5。通常ドメインは 1 リクエスト = 1 クレジット、`render=true`（JS 描画）で 10、`premium=true` で 10、両方で 25。同時接続の超過は 429、月次クレジットの枯渇は 403。課金は 200 と 404 のみで、70 秒の再試行後の失敗（500）は無課金 | アカウントのみ。料金ページに「No credit card required」。API キーをクエリ `api_key` で渡し、`GET /account` で使用量と上限を取れる | {{< verified run >}} | [1][2][3][4][14] |
| [ScrapingBee](#scrapingbee) | 無料トライアル（USD 0）。有料は Hobby USD 19/月（75,000 クレジット・同時 25）から | 1,000 クレジット（**一回きり**。月次リセットなし） | JS 描画あり（既定）は 1 リクエスト 5 クレジット、なしは 1。premium proxy で 25 / 10、stealth proxy で 75。同時接続の超過は 429 で無課金、クレジット切れは 401。無料枠の同時接続は 5（料金ページに記載が無く、`GET /api/v1/usage` の `max_concurrency` で確認） | アカウントのみ。料金ページに「no credit card required」。`GET /api/v1/usage` で残クレジットと同時接続の上限を取れる（6 回/分まで） | {{< verified run >}} | [5][6] |
| [Firecrawl](#firecrawl) | Free（USD 0）。有料は Hobby USD 19/月（年払い USD 16。5,000 クレジット・同時 5）から | **月 1,000 クレジット**（月次リセット） | 同時ブラウザ 2（超えた分はキューに入り、6 並列でも 429 は出ない）。`/scrape` `/map` `/search` は 10 リクエスト/分、`/crawl` `/agent` は 2 リクエスト/分で、超過は 429。1 クレジット = 1 ページ（scrape / crawl / map）、search は 10 件ごとに 2、JSON などの構造化形式はページごとに +4 | アカウントのみ。料金ページに「No cost, no card, no hassle」。セルフホストの手順が docs に公開 | {{< verified run >}} | [7][8][9] |
| [Apify](#apify) | Free（USD 0）。有料は Starter USD 19/月（年払いで 10% 引き。USD 19 分の使用量込み）＋従量 | **月 USD 5 分**のプラットフォーム使用量（月次） | 使用量は USD 0.2 / コンピュートユニット（1 CU = 1 GB RAM × 1 時間）で、取れるページ数は Actor と RAM 設定次第。Actor RAM 16 GB、同時実行 5、データセンタープロキシ 5 IP | アカウントのみ。料金ページに「No credit card required」 | {{< verified spec >}} | [10][11] |
| [Zyte](#zyte) | 従量。HTTP レスポンス 1,000 件あたり USD 0.13〜1.27、ブラウザ描画 USD 1.01〜16.08（対象サイトの難度 5 段階）。割引は最低コミット月 USD 100 / 200 / 500 | 初回の請求月に **USD 5 分**（30 日・一回きり） | 課金は成功レスポンスのみで、レート制限と失敗は無課金。標準プランは 3,000 リクエスト/分。単価が対象サイトごとに決まるため、事前に見積りが要る | アカウントのみ。料金ページに「No commitment or subscription」。有料側は月 USD 100 のコミットから | {{< verified spec >}} | [12][13] |

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
- 本文の 429・403・401 は HTTP のステータスコードです。429 は同時接続やレート制限の超過、403 と 401 はクレジット切れや無効なキーのような権限側の拒否を示します
- 料金表記の注意: 通貨は各社の料金ページの表記（USD）のままです。課金単位は 3 通りに割れています。クレジット（ScraperAPI・ScrapingBee・Firecrawl）、プラットフォーム使用量のドル（Apify）、
  成功レスポンス 1,000 件あたりのドル（Zyte）です。本文で「1 ページ」と書くときは、JS 描画なしで静的な HTML を 1 件取得する場合を基準にしています。
  棒グラフは単位が USD/月 で揃う「最小の有料プランの月額」だけに絞りました。無料枠のクレジット数は 1 クレジットの意味が社ごとに違い、同じ軸に載りません
- 選び方の軸: 「料金」列は、同じ月額で並ぶ 3 つ（ScrapingBee・Firecrawl・Apify）と、それより高い ScraperAPI、月額プランを持たず従量の Zyte に分かれます。
  「無料枠」列は、トライアルと恒常枠の**両方**（ScraperAPI）、**恒常のみ**（Firecrawl・Apify）、**一回きり**（ScrapingBee・Zyte）の 3 段です。
  ScraperAPI の恒常枠が月次で戻ることは docs の FAQ で確認しています [2]。
  「主な制約」列は、ページあたりの消費クレジットが JS 描画やプロキシの種類で増えるかと、どの応答に課金されるかが社ごとに違い、無料枠の数字だけでは比べられません。
  「前提条件」列は、5 つともアカウントだけで始められます。分かれるのは、残クレジットを API で取れるか（ScraperAPI・ScrapingBee）と、有料側にコミットが要るか（Zyte）です
- この記事はサービスの仕様と料金の比較です。取得先の Web サイトの利用規約や robots.txt をどう扱うかは、各サービスの利用規約と取得先の規約に従って利用者が判断する事項で、
  この記事では扱いません。検証で取得するページは、この記事を配信している `kurabebako.com` 自身の記事ページに限ります
- 検証の手順: ScraperAPI・Firecrawl・ScrapingBee の 3 つに 2026-09-12 に行い、Apify・Zyte は公式ページの確認にとどめています。
  手順は (1) API キーを非対話で使い、残クレジットを記録する (2) 自サイトの静的ページ 1 件を JS 描画なしで取得する (3) 同じページを JS 描画ありで取得し、消費クレジットの差を記録する (4) 同時接続の上限を超える並列リクエストで 429 の応答を記録する (5) 残クレジットを再確認し、サーバー側に残るジョブやデータが無いことを確かめる、の 5 つです。
  無料枠は使い切っておらず、各社の結果は「各対象の詳細」の「検証した内容」に書いています
- API キーを AI エージェントに渡す手段は、[シークレット管理 CLI 6 つの比較](/posts/secret-management-cli/)で比べています。
  この記事の検証でも、そこで扱った `op run` で API キーを注入します。
  「無料枠が恒常か」「カード登録なしで動くか」という見方は、[メール送信 API 5 つの無料枠比較](/posts/email-api-free-tier/)と同じです

## 各対象の詳細

### ScraperAPI

プロキシのローテーションと再試行を肩代わりし、URL を渡すと HTML を返すスクレイピング API です。
5 つのうち、期限付きのトライアルと月次で戻る恒常枠の両方を持つのは ScraperAPI だけです。

{{< fit run >}}
向く: カード登録なしで、毎月戻る無料枠を使い続けたい。登録直後に大きめに試したい
向かない: JS 描画が要るページを無料枠で多く取りたい（描画ありはページあたりの消費が大きい）
{{< /fit >}}

- **料金体系**: 料金と無料枠は、表の「料金」列と「無料枠」列に載せたとおりです [1][2]
- **制約**: 表の「主な制約」列の単価は通常のドメインのものです。Amazon などの E コマースは 5、Google などの検索エンジンは 25、LinkedIn は 30 で、Cloudflare などのボット対策の回避は 10 が加わります。
  応答ヘッダー `sa-credit-cost` に消費クレジットが出ます [3]。
  同時接続を超えたときの 429 の本文は「You are sending too many simultaneous requests」です [4]
- **前提条件**: `GET /account` は今月の使用クレジットと上限に加えて、同時接続の使用数も JSON で返します [14]
- **検証した内容**: 公式の料金ページと docs（FAQ・クレジット消費・ステータスコード）を確認したうえで、2026-09-12 に無料プランのアカウントで「比較の前提」の 5 手順を実行しました。
  取得先は自サイトの静的ページ 1 件です。

  | 操作 | 結果 |
  | --- | --- |
  | `GET /account` | 200。`concurrencyLimit` 5、`requestLimit` 5,000（登録直後は 7 日間のトライアル枠が乗った状態） |
  | 描画なしで取得 | 200（1.9 秒）。`sa-credit-cost: 1`。事前見積りの `GET /account/urlcost` も 1 |
  | `render=true` で取得 | 200（**19.8 秒**）。`sa-credit-cost: 10` |
  | 12 並列 | 200 × 8、**429 × 4**。本文は docs どおり「You are sending too many simultaneous requests」。`Retry-After` などのヘッダーは無し |
  | 残高の再確認 | 消費 19（1 + 10 + 8）。`creditsLeft` への反映は 1 分ほど遅れた |

  先に終わった枠に後続が入るため、同時 5 を超えた分がすべて 429 になるわけではありません。サーバー側に残るものはありません

{{< cta id="scraperapi" text="ScraperAPI の無料プランに登録する（カード登録なし）" >}}

### ScrapingBee

JS 描画を既定で有効にしたスクレイピング API で、リクエストごとの消費クレジットが描画の有無とプロキシの種類で大きく変わります。
無料枠は一回きりで、月次では戻りません。

{{< fit run >}}
向く: 一回きりの無料枠で足りる。JS 描画の有無で消費を切り替えて試したい
向かない: 無料枠を毎月使い続けたい。premium や stealth のプロキシを多く使いたい
{{< /fit >}}

- **料金体系**: 料金と無料枠は、表の「料金」列と「無料枠」列に載せたとおりです [5]
- **制約**: 課金は 200・404・410・413 の応答です。既定のタイムアウトは 140 秒です [6]
- **前提条件**: API キーはクエリ文字列 `api_key` で渡します [6]
- **検証した内容**: 公式の料金ページと docs を確認したうえで、2026-09-12 に無料トライアルのアカウントで「比較の前提」の 5 手順を実行しました。
  取得先は自サイトの静的ページ 1 件です。

  | 操作 | 結果 |
  | --- | --- |
  | `GET /api/v1/usage` | 200。`max_api_credit` 1,000、`max_concurrency` 5 |
  | `render_js=false` で取得 | 200（1.8 秒）。`spb-cost: 1` |
  | `render_js=true`（既定）で取得 | 200（2.8 秒）。`spb-cost: 5` |
  | 10 並列（`render_js=false`） | 200 × 6、**429 × 4**。本文は `{"message":"Max concurrency allowed 5"}`、ヘッダー `spb-cost: 0`。docs の「Too many concurrent requests」とは文言が違う |
  | 残高の再確認 | 消費 12（1 + 5 + 6）。`used_api_credit` への反映は 1 分ほど遅れた |

  1,000 クレジットが一回きりなので、JS 描画ありの取得は 1 件にとどめています。サーバー側に残るものはありません

### Firecrawl

取得したページを LLM 向けの Markdown に変換して返すスクレイピング API で、クロールや検索のエンドポイントも持ちます。
無料枠は月次に戻り、料金ページがエンドポイント別のレート制限まで公開しています。

{{< fit run >}}
向く: LLM に渡す Markdown が欲しい。ブラウザ描画込みでもページ数どおりにクレジットを数えたい
向かない: JSON などの構造化形式で多くのページを取りたい。短時間に大量のリクエストを流したい
{{< /fit >}}

- **料金体系**: ページごとにクレジットが加わる構造化形式は、JSON・Question・Highlight の 3 つです [7]
- **制約**: docs は、同時ブラウザとレート制限のどちらの上限を超えても 429 が返ると書いています [8]。
  ただ、同時ブラウザのほうは超えた分がキューに入り、6 並列でも 429 は出ませんでした（下の検証）
- **前提条件**: API キーは `Authorization: Bearer` ヘッダーで渡します。
  Cloud 専用の機能（スクリーンショット、ページ操作、Agent など）はセルフホストでは使えないと docs に記載されています [9]
- **検証した内容**: 公式の料金ページと docs（レート制限・セルフホスト）を確認したうえで、2026-09-12 に Free のアカウントで「比較の前提」の 5 手順を実行しました。
  取得先は自サイトの静的ページ 1 件です。

  | 操作 | 結果 |
  | --- | --- |
  | `GET /team/credit-usage` | 200。`planCredits` 1,000 に対して `remainingCredits` 1,025（登録直後は 25 多い。料金ページに記載なし） |
  | `formats: ["markdown"]` で取得 | 200（2.4 秒）。`creditsUsed` 1。Markdown は 11,896 文字 |
  | `json` 形式（タイトルの抽出）で取得 | 200（3.2 秒）。`creditsUsed` 5（docs どおり +4） |
  | 6 並列（`/scrape`） | **200 × 6、429 は無し**（2 秒で完了） |
  | 残高の再確認 | 消費 12（1 + 5 + 6）。`remainingCredits` に直後に反映 |

  同時ブラウザ 2 は拒否ではなくキューで、10 リクエスト/分の枠内なら待ち時間が延びるだけです。`/crawl` は使っていないので、サーバー側に残るジョブはありません

{{< cta id="firecrawl" text="Firecrawl の Free プランに登録する（カード登録なし）" >}}

### Apify

既成のスクレイパー（Actor）を借りるか自分で書いて、Apify の基盤で動かすサービスです。
課金がクレジットではなくプラットフォーム使用量のドルなので、無料枠で取れるページ数は動かす Actor の RAM と実行時間で決まります。

{{< fit spec >}}
向く: 既成のスクレイパー（Actor）を借りて動かしたい。取得数は使用量次第でよい
向かない: 無料枠で取れるページ数を事前に確定させたい（Actor と RAM の設定次第）
{{< /fit >}}

- **料金体系**: 料金と無料枠は、表の「料金」列と「無料枠」列に載せたとおりです [10]
- **制約**: docs の limits ページは Free の同時実行を 25 と書いており、料金ページの 5 と食い違います。
  この記事は料金ページの値を採っています [10][11]
- **前提条件**: 表の「前提条件」列のとおり、アカウントだけで始められます [10]
- **検証した内容**: 公式の料金ページと docs の limits ページを確認しました。無料枠で何ページ取れるかは Actor 次第で、比較に使う Actor を 1 つ決める必要があるため、実行は次回の更新に回しています

### Zyte

対象サイトの難度を 5 段階に自動判定し、成功したレスポンス 1,000 件あたりの単価で課金するスクレイピング API です。
無料枠は一回きりで、有料側は月額の最低コミットから割引が始まります。

{{< fit spec >}}
向く: 月額のコミットを前提に、難度の低いサイトから従量で大量に取りたい
向かない: 無料枠を毎月使い続けたい。難度の高いサイトを安く取りたい
{{< /fit >}}

- **料金体系**: HTTP レスポンス本文の単価は、難度が Simple のサイトが下端、Advanced のサイトが上端です。
  最低コミットを月 USD 100 にすると 0.10〜0.95、USD 200 で 0.08〜0.76、USD 500 で 0.06〜0.61 に下がります [12]
- **制約**: docs の記載は「Rate-limiting and unsuccessful responses are free」です。
  単価が対象サイトごとに決まるため、料金ページの見積りツールで事前に確認する運びになります [12][13]
- **前提条件**: 料金ページの記載は「No commitment or subscription, 30 days to try it out」です [12]
- **検証した内容**: 公式の料金ページと docs の pricing ページを確認しました。無料枠が 30 日で切れるため、実行は次回の更新に回しています

## 用途別の選び方

上から順に答えていくと、条件に合う対象にたどり着きます。各分岐の決め手は比較表の列で、数字はそちらを見てください。

{{< svg src="scraping-api-free-tier-flow.svg" alt="用途別の判断フロー。カード登録なしで毎月戻る無料枠を使い続けたく 7 日で大きく試したいなら ScraperAPI、LLM に渡す Markdown が欲しく 1 ページ 1 クレジットで数えたいなら Firecrawl、一度きりの 1,000 クレジットで足り JS 描画の有無で消費を切り替えたいなら ScrapingBee、既成の Actor を借りたいなら Apify、月 USD 100 以上のコミットを前提に従量で大量に取るなら Zyte" caption="図: 用途別の判断フロー" >}}

- カード登録なしで、毎月戻る無料枠を使い続けたい。まず登録直後に大きめに試したい → ScraperAPI。決め手は「無料枠」列と「主な制約」列です。
  JS 描画はページあたりの消費が大きく、無料枠で取れるページ数が大きく減ります
- LLM に渡す Markdown が欲しい。ページ数どおりにクレジットを数えたい → Firecrawl。決め手は「主な制約」列と「無料枠」列です。
  同時ブラウザの上限を超えた分はキューで待つので、実質の上限は分あたりのレート制限です
- 一度きりの無料枠で足りる。JS 描画の有無で消費を切り替えたい → ScrapingBee。決め手は「無料枠」列と「主な制約」列です。
  無料枠は月次で戻らないので、試し終えたら有料プランに移るかを決めることになります
- 既成のスクレイパー（Actor）を借りて動かしたい。取得数は使用量次第でよい → Apify。決め手は「料金」列と「無料枠」列です。
  取れるページ数は Actor の RAM と実行時間で決まります
- 月額のコミットを前提に、サイト難度別の従量で大量に取る → Zyte。決め手は「料金」列と「前提条件」列です。
  難度の低いサイトなら単価は対象の中で最も低い一方、難度の高いサイトでは ScraperAPI や ScrapingBee の有料プランより高くなります

下は、この記事の対象のうち提携している 2 社の公式サイトへのリンクです。順位は上の箇条書きと結論の順で、
ScrapingBee・Apify・Zyte は提携が無いためここには載せていません。

{{< ranking >}}
scraperapi: 7 日間 5,000 クレジットのトライアルと月 1,000 クレジットの恒常枠を両方持ち、カード登録なしで使い続けられる唯一の対象です。無料枠の同時接続 5 も最多です
firecrawl: LLM に渡す Markdown をブラウザ描画込みでも 1 ページ 1 クレジットで取れ、月 1,000 クレジットがそのままページ数になります。同時ブラウザ 2 を超えた分は 429 ではなくキュー待ちです
{{< /ranking >}}

取得した HTML を保存して配信する先は、[静的サイトの無料ホスティング比較](/posts/static-site-hosting-free-tier/)で扱ったホスティングの無料枠に収まります。
API キーを CI や AI エージェントに渡す場面では、[シークレット管理 CLI 6 つの比較](/posts/secret-management-cli/)で比べた注入の手段が要ります。

## よくある質問

### スクレイピング API は無料で使い続けられますか？

月次で戻る無料枠を持つのは、ScraperAPI（月 1,000 クレジット）・Firecrawl（月 1,000 クレジット）・Apify（月 USD 5 分の使用量）です [1][2][7][10]。
ScrapingBee の 1,000 クレジットと Zyte の USD 5 分は一回きりで、月次では戻りません [5][12]。

### クレジットカードの登録は要りますか？

ScraperAPI・ScrapingBee・Firecrawl・Apify は、料金ページにカード登録が要らないと書いています [1][5][7][10]。
Zyte の料金ページで確認したのは「No commitment or subscription」の記載で、カードの要否はこの記事では確かめていません [12]。

### JS 描画を使うと、消費クレジットはどれだけ増えますか？

ScraperAPI は `render=true` で 1 リクエスト 10 クレジット（通常は 1）、ScrapingBee は JS 描画あり（既定）で 5（なしは 1）です [3][6]。
Firecrawl は 1 クレジット = 1 ページで、JSON などの構造化形式を使うとページごとに 4 クレジットが加わります [7]。

### 同時接続の上限を超えるとどうなりますか？

ScraperAPI と ScrapingBee は 429 を返し、どちらも 429 には課金されません [3][4][6]。
Firecrawl は、docs では 429 が返ると書かれていますが、同時ブラウザ 2 を超える 6 並列の検証では 429 にならず、キューで順に処理されました [8]。

## 出典

1. [ScraperAPI Pricing](https://www.scraperapi.com/pricing/) — 2026-10-03 確認
2. [ScraperAPI Docs — Plans and Billing (FAQ)](https://docs.scraperapi.com/resources/faq/plans-and-billing) — 2026-10-03 確認
3. [ScraperAPI Docs — Credits and Requests costs](https://docs.scraperapi.com/getting-started/quick-start/credits-and-requests-costs) — 2026-10-03 確認
4. [ScraperAPI Docs — API Status Codes](https://docs.scraperapi.com/responses-and-formats/api-status-codes) — 2026-10-03 確認
5. [ScrapingBee Pricing](https://www.scrapingbee.com/pricing/) — 2026-10-03 確認
6. [ScrapingBee Documentation](https://www.scrapingbee.com/documentation/) — 2026-10-03 確認
7. [Firecrawl Pricing](https://www.firecrawl.dev/pricing) — 2026-10-03 確認
8. [Firecrawl Docs — Rate Limits](https://docs.firecrawl.dev/rate-limits) — 2026-10-03 確認
9. [Firecrawl Docs — Self-hosting](https://docs.firecrawl.dev/contributing/self-host) — 2026-10-03 確認
10. [Apify Pricing](https://apify.com/pricing) — 2026-10-03 確認
11. [Apify Docs — Limits](https://docs.apify.com/platform/limits) — 2026-10-03 確認
12. [Zyte Pricing](https://www.zyte.com/pricing/) — 2026-10-03 確認
13. [Zyte API Docs — Pricing](https://docs.zyte.com/zyte-api/pricing.html) — 2026-10-03 確認
14. [ScraperAPI Docs — Credit Usage](https://docs.scraperapi.com/account-management/credit-usage) — 2026-10-03 確認
