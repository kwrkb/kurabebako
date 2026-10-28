+++
title = 'AI にホームページを公開して、止まったら知らせてもらう'
date = '2026-10-28T14:13:43+09:00'
# 最終確認日。出典の確認日・現物が動くことを最後に確かめた日と揃える（ヘッダーに出る）
lastmod = '2026-10-28'
draft = true
summary = 'GitHub Pages・UptimeRobot・Cloudflare Web Analytics の無料枠を組み合わせ、1 ページのホームページを公開して、止まったらメールで知らせ、訪問を数える仕組みを Claude に作らせた作例。登録はすべて公式 API で行い、実際に一度止めて通知が届くまでを記録した。'
# tags / categories は URL に載るため英語（小文字・ハイフン区切り）で書く。
# tags には部品の比較記事と同じ事業者名を入れる（タグページで比較記事と並ぶ）
categories = ['hosting', 'monitoring']
tags = ['github-pages', 'uptimerobot', 'cloudflare']
# OGP 用の画像。本文と一覧には出さない（hidden）。生成は desk の images/
[cover]
  image = '/images/og/homepage-uptime-alert.jpg'
  alt = '公開したページを心拍の線が見守り、封筒に知らせが届き、棒グラフが訪問を数える図'
  hidden = true
  hiddenInList = true
+++

{{< pr >}}

この作例は Claude が作り、判断と確認は私が行いました。成果物: [リポジトリ](https://github.com/kwrkb/kurabebako-example-homepage-uptime-alert) / [公開ページ](https://kwrkb.github.io/kurabebako-example-homepage-uptime-alert/)

## できたもの

HTML 1 枚のホームページが公開され、止まるとメールが届き、訪問の数が記録される仕組みです。
公開・監視・解析の登録はすべて Claude が公式 API で行い、一度わざと止めて、通知が届いて復旧するまでを記録しました。
動いている現物は[公開ページ](https://kwrkb.github.io/kurabebako-example-homepage-uptime-alert/)で、
何が動いているかはページ自体に書いてあります。実行したときの記録は[リポジトリの runs/](https://github.com/kwrkb/kurabebako-example-homepage-uptime-alert/tree/main/runs)にそのまま置いています。

## 完成形の全体像

{{< svg src="homepage-uptime-alert-arch.svg" alt="構成図。リポジトリの main を GitHub Pages がそのまま配信して公開ページになる。公開ページに置いた 1 行のビーコンが Cloudflare Web Analytics に訪問を送る。UptimeRobot が 5 分おきに公開ページへ HTTP で見に来て、止まったらメールで知らせる。登録はすべて Claude が公式 API で行う" caption="図: 部品 3 つの役割" >}}

部品は 3 つで、どれも無料枠に収まります。費用はこの作例の範囲では 0 円です。

| 部品 | 役割 | 無料枠で収まる条件 | 比較記事 |
| --- | --- | --- | --- |
| GitHub Pages | リポジトリの `main` をそのまま配信する | 公開リポジトリなら GitHub Free で使える。サイト 1 GB、転送量 月 100 GB（ソフト上限）。商取引が主目的のサイトは不可 [1][2][3] | [静的サイトの無料ホスティング 5 社比較](/posts/static-site-hosting-free-tier/) |
| UptimeRobot（Free） | 5 分おきに公開ページへ HTTP で見に来て、止まったらメールで知らせる | 50 モニター、5 分間隔、データ保持 3 か月。API は全プランで使え、10 リクエスト/分 [5][6][7] | [死活監視の無料枠 5 つを比較](/posts/uptime-monitoring-free-tier/) |
| Cloudflare Web Analytics | ページに置いた 1 行のビーコンで訪問を数える。Cookie は使わない | 全プランで無料。参照できるのは直近 6 か月。サイトはアカウントあたり 10 件（ソフト上限） [8][9][10] | [アクセス解析の無料枠比較](/posts/analytics-free-tier/) |

一度止めて戻すまでの記録です（2026-10-28、時刻は UTC。元の記録は [runs/ の outage のログ](https://github.com/kwrkb/kurabebako-example-homepage-uptime-alert/tree/main/runs)）。

| 出来事 | 時刻 | 前の行からの間隔 | 記録の出どころ |
| --- | --- | --- | --- |
| Pages を無効化（API が 204） | 14:12:07 | — | pages のログ |
| UptimeRobot が DOWN を検知 | 14:12:54 | 47 秒 | incident の `startedAt` |
| DOWN のメールが送信済みになる | 14:12:55 | 1 秒 | alerts の `timestamp`（`status` が `SUCCESS`） |
| 手元の curl が初めて 404 を見る | 14:21:21 | 無効化から 555 秒（CDN のキャッシュ切れ） | pages のログ |
| Pages を再有効化（API が 201） | 14:22:33 | — | pages のログ |
| 公開ページが 200 に戻る | 14:23:40 | 67 秒 | pages のログ |
| UptimeRobot が UP を検知 | 14:28:07 | 267 秒 | incident の `resolvedAt`（停止は 913 秒） |
| 復旧のメールが送信済みになる | 14:28:09 | 2 秒 | alerts の `timestamp` |

## なぜこの組み合わせか

- **GitHub Pages**: 私は「リポジトリに HTML を置けば公開される」という最も手数の少ない経路を選びました。
  比較記事では「仕様」区分で、実際に公開したことが無かった部品でもあります。この作例で「実行」に上がりました。
  広告やアフィリエイトリンクを載せるサイトには向かないので、その条件なら比較記事の「前提条件」列を見て
  [Cloudflare Workers Static Assets](/posts/static-site-hosting-free-tier/#cloudflare-workers-static-assets) を選びます
- **UptimeRobot**: 「止まったらメールで知らせる」に要るのは、無料で、API から作れて、通知先にメールがあることの 3 つです。
  比較記事の「前提条件」列（API と Terraform が全プランで使える）がそのまま決め手になりました。
  1 分間隔が要るなら「料金」列の Solo か、[Checkly](/posts/uptime-monitoring-free-tier/#checkly) です
- **Cloudflare Web Analytics**: GitHub Pages には解析が付いていないので、DNS を触らずにタグ 1 行で済むものを足しました。
  Cookie を使わないので同意バナーも要りません。1 年前と比べたいなら比較記事の「無料枠」列を見て
  [Google Analytics 4](/posts/analytics-free-tier/#google-analytics-4) です

{{< cta id="uptimerobot" text="UptimeRobot の Free プランに登録する（カード登録なし）" >}}

## 最初に自分ですること

人の操作が要るのはアカウントと鍵だけで、サイトの登録や設定の画面は一度も開いていません。

- GitHub のアカウントと、`gh auth login` 済みの CLI（Pages の API は `repo` スコープで動きます [4]）
- UptimeRobot のアカウント（Free。登録したメールアドレスが既定の通知先になります）と、Integrations & API で発行する Main API key
- Cloudflare のアカウントと、API トークン（権限は Account Settings Write / Account Settings Read / Account Analytics Read。Account Settings Write がサイトの作成に要る権限です [9]）
- 鍵の置き場。この作例は 1Password に置き、`op run` で環境変数に注入してスクリプトを動かしました

私がしたのは、リポジトリを公開に切り替えること（GitHub Free の Pages は公開リポジトリだけなので [1]）、Cloudflare でトークンを発行して 1Password に入れること、
UptimeRobot の通知先がメールになっているのを見ることの 3 つです。

## Claude がしたこと

各段階は「実行したコマンド → 期待する結果」で、ログは[リポジトリの runs/](https://github.com/kwrkb/kurabebako-example-homepage-uptime-alert/tree/main/runs) にあります。
鍵とメールアドレスはログに出していません。

### 1. ページを書いて公開する

Claude は HTML 1 枚と CSS 1 枚を書き、`main` に push したうえで、GitHub の REST API で Pages を有効化しました [4]。

```bash
bash scripts/pages.sh enable
```

期待する結果: `POST /repos/{owner}/{repo}/pages` が 201 を返し、`pages.status` が `building` → `built` と進み、公開 URL が 200 を返します。
実行では 1 分以内に 200 になりました（[pages のログ](https://github.com/kwrkb/kurabebako-example-homepage-uptime-alert/blob/main/runs/pages-20261028-0648.log)）。

ハマりどころ: 最初は非公開で作ったので、Pages の有効化は「リポジトリを公開に切り替える」まで待ちました。
これは私がしました。

### 2. 訪問を数える

Claude は Cloudflare の API で Web Analytics のサイトを作り、返ってきた `site_token` からビーコンの 1 行を組み立てて `index.html` に書き込み、push しました [9]。

```bash
op run --env-file=cloudflare.env.tpl -- bash scripts/analytics.sh create
```

期待する結果: `POST /accounts/{account_id}/rum/site_info` が 200 を返し、`index.html` の `<head>` にビーコンが入ります。
その後ページを数回開いて `analytics.sh query` を実行すると、GraphQL の `rumPageloadEventsAdaptiveGroups` に開いた回数が立ちます [10]。

ハマりどころ: `auto_install` を付けずに作ると応答に `snippet`（貼り付け用のスクリプト）が入りません。
ビーコンの行は `site_token` から自分で組み立てました（[analytics.sh](https://github.com/kwrkb/kurabebako-example-homepage-uptime-alert/blob/main/scripts/analytics.sh)）。
もう 1 つ、`op run` が伏せるのは標準出力だけで、ファイルに書いたログには素の値が残ります。
URL に入るアカウント ID はログに書く前に置き換えるようにしました。

### 3. 止まったら知らせる

Claude は UptimeRobot の API v3 で通知先の一覧を取り、メールの連絡先を 1 つ選んで、HTTP モニターを作りました [6]。

```bash
op run --env-file=uptimerobot.env.tpl -- bash scripts/monitor.sh create
```

期待する結果: `GET /user/alert-contacts` に `type` が `Email` の連絡先があり、`POST /monitors` が 201 で `status` が `STARTED`、
1〜2 分後の `GET /monitors/{id}` で `UP` になります（[monitor のログ](https://github.com/kwrkb/kurabebako-example-homepage-uptime-alert/blob/main/runs/monitor-20261028-0649.log)）。

ハマりどころ: 通知先は `assignedAlertContacts` に `threshold` と `recurrence` を付けて渡しますが、Free では両方 0 しか受け付けません
（0 は「DOWN になったら 1 回だけ知らせる」）。比較記事の「主な制約」列のとおり、5 分より短い `interval` も API で拒否されます。

### 4. 実際に止めて、知らせが届くのを確かめる

監視は「止まったときに知らせが来る」ことを確かめて初めて仕事をしたと言えます。
Claude は Pages を API で無効化し、UptimeRobot が DOWN を検知して通知を送るまでを追い、再有効化して UP に戻るまでを記録しました。

```bash
op run --env-file=uptimerobot.env.tpl -- bash scripts/outage.sh
```

期待する結果: `DELETE /repos/{owner}/{repo}/pages` が 204 を返して公開 URL が 404 になり、`GET /monitors/{id}` の `status` が `DOWN` に変わります。
通知が送られた事実は `GET /incidents/{id}/alerts` で確かめます。`channelType` が `EMAIL`、`status` が `SUCCESS` の行が、送信済みの記録です。
再有効化すると 200 に戻り、`status` が `UP` に戻って復旧のメールも送られます。時刻は「完成形の全体像」の 2 つ目の表にあります
（[outage のログ](https://github.com/kwrkb/kurabebako-example-homepage-uptime-alert/blob/main/runs/outage-20261028-1412.log)）。

ハマりどころ: Pages を無効化しても、手元の curl はしばらく 200 を返し続けました。
GitHub Pages は `Cache-Control: max-age=600` で配信していて、直前に開いた拠点の CDN キャッシュが切れるまでは古い内容が返ります。
一方で UptimeRobot は別の拠点から見ていて、1 分以内に 404 を検知しました。
「手元では見えているのに、監視は止まったと言っている」状態があり得るので、監視の判定を手元の確認で上書きしないことです。
復旧の検知が遅いのは、UptimeRobot が 5 分おきにしか見に来ないからで、こちらは「無料枠」列の間隔どおりです。

## 同じものを自分の環境で動かす

1. [リポジトリ](https://github.com/kwrkb/kurabebako-example-homepage-uptime-alert)を fork し、`scripts/common.sh` の `OWNER` を自分のユーザー名にします（実行時に `OWNER=<名前>` を渡しても構いません）
2. 「最初に自分ですること」の鍵を 2 つ用意し、`uptimerobot.env.tpl` と `cloudflare.env.tpl` の `op://` 参照を自分の 1Password に合わせます（1Password を使わないなら、同じ名前の環境変数を export します）
3. `scripts/pages.sh enable` → `scripts/analytics.sh create`（push まで）→ `scripts/monitor.sh create` の順に実行します。撤収は `scripts/teardown.sh` です

## 判断と気づき

- 私は、デモのページを「自己解説の 1 ページ」にしました。記事の中に iframe や JS で埋め込む案も Claude から出ましたが、
  このサイトは本文に JS を使わない方針なので、リンクと記録で見せることにしました
- 私は、障害の一巡を実際に起こすことにしました。モニターが UP になっただけでは「知らせが来る」ことの証拠にならないからです。
  Claude の最初の案は「作って UP を確認したら終わり」でしたが、止めて戻す手順を足してもらいました
- Claude が UptimeRobot の API v3 のフィールド名（`assignedAlertContacts` など）を、公式の OpenAPI 定義と Terraform provider の実装から確かめてから書いたのは、
  私が指示したことではありません。ドキュメントの例だけで書くと Free の制約（threshold と recurrence が 0）で止まるところでした
- うまくいかなかった点は 2 つです。1 つは、Pages を無効化したあと手元の確認が CDN のキャッシュで 9 分あまり 200 のままで、
  スクリプトの「404 になるまで待つ」が時間切れの直前までかかったこと。もう 1 つは、`op run` がファイルに書いたログまでは伏せず、
  アカウント ID と通知先の名前がログに残ったこと。どちらも記録を見てから直しました
- UptimeRobot の鍵は、書き込める種類が Main API key の 1 本しか無く、比較記事の検証で使っているものを使い回しました。
  「作例の鍵は作例専用に発行する」という自分の決まりの例外で、撤収の台帳にそう書いてあります

## 制約と撤収

- GitHub Pages: 公開リポジトリが前提で、サイトは 1 GB まで、転送量は月 100 GB、ビルドは 1 時間に 10 回がソフト上限です [2]。
  オンラインビジネスや EC、商用 SaaS など商取引が主目的のサイトには使えません [3]。このデモはアフィリエイトリンクも広告も置いていません
- UptimeRobot（Free）: 50 モニター、5 分間隔、データ保持 3 か月。通知は DOWN のたびに 1 回で、繰り返しの通知は有料プランです [5][6]。
  API は 10 リクエスト/分なので、スクリプトの待ち時間は 30 秒以上にしてあります [7]
- Cloudflare Web Analytics: 参照できるのは直近 6 か月。非サンプリングのデータは 7 日で、その後は約 10% に集約されます [8]。
  API トークンは有効期限を 2026-11-30 にして発行し、切れたら解析サイトはダッシュボードから消します
- 動き続けているのはモニター 1 件と解析サイト 1 件、Pages のサイト 1 件です。消すときは `bash scripts/teardown.sh`（モニターの削除 → 解析サイトの削除 → Pages の無効化）で、リポジトリだけが残ります

## 出典

1. [GitHub Docs — About GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages) — 2026-10-28 確認
2. [GitHub Docs — GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) — 2026-10-28 確認
3. [GitHub Terms for Additional Products and Features — Pages](https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features#pages) — 2026-10-28 確認
4. [GitHub REST API — Pages](https://docs.github.com/en/rest/pages/pages) — 2026-10-28 確認
5. [UptimeRobot Pricing](https://uptimerobot.com/pricing/) — 2026-10-28 確認
6. [UptimeRobot Help — Who should use UptimeRobot's free plan](https://help.uptimerobot.com/en/articles/11604710-who-should-use-uptimerobot-s-free-plan) — 2026-10-28 確認
7. [UptimeRobot API](https://uptimerobot.com/api/) — 2026-10-28 確認
8. [Cloudflare Docs — Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/) — 2026-10-28 確認
9. [Cloudflare API — Create a Web Analytics site](https://developers.cloudflare.com/api/resources/rum/subresources/site_info/methods/create/) — 2026-10-28 確認
10. [Cloudflare Docs — GraphQL Analytics API](https://developers.cloudflare.com/analytics/graphql-api/) — 2026-10-28 確認
11. [Cloudflare — Web Analytics](https://www.cloudflare.com/web-analytics/) — 2026-10-28 確認
