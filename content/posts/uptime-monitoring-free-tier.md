+++
title = '死活監視の無料枠 5 つを比較: 最短間隔と API で選ぶ'
date = '2026-09-03T14:59:52+09:00'
lastmod = '2026-09-03'
draft = false
summary = 'UptimeRobot・Better Stack・Checkly・Cronitor・Uptime Kuma の無料枠を、モニター数・最短間隔・通知手段・公式の自動化手段（API / CLI / Terraform）で比較。無料で 50 件まで API から作成・削除できる UptimeRobot、監視をコードで持つなら Checkly。UptimeRobot・Checkly・Uptime Kuma は実際に監視を作成して確認した結果を載せる。'
categories = ['monitoring']
tags = ['uptime-monitoring', 'uptimerobot', 'better-stack', 'checkly', 'cronitor', 'uptime-kuma']
# OGP 用の画像。本文と一覧には出さない（hidden）。生成は desk の images/gen.sh
[cover]
  image = '/images/og/uptime-monitoring-free-tier.jpg'
  alt = '死活監視サービスの無料枠比較'
  hidden = true
  hiddenInList = true
+++

## 結論

死活監視サービス 4 つと OSS 1 つの無料枠を、「無料のまま、公式の手段で監視を作って消せるか」を軸に比べました。
無料枠が最も大きく、公式の API と Terraform provider が無料のまま使えるのは UptimeRobot です。
50 件まで登録でき、クレジットカードも要りません。
ただ、監視の定義をコードで持って CLI から配備したいなら Checkly が合います。
無料枠は 10 件ですが、最短間隔は 2 分で 5 社の中で最も短く、公式 CLI と Terraform provider の両方があります。
自前のサーバーがあるなら Uptime Kuma が件数無制限で秒単位の間隔を取れますが、公式の管理 API がない点が分かれ目です。

## 比較表

2026-09-03 時点の公式情報に基づきます。出典は末尾の番号に対応しています。料金は各社の表示通貨（USD）です。

| 対象 | 料金 | 無料枠 | 主な制約 | 前提条件 | 検証区分 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| UptimeRobot | Free は USD 0。Solo は USD 9/月（年払い。月払いは USD 10）で 60 秒間隔・10 件・保持 12 か月 | 50 モニター、5 分間隔、データ保持 3 か月。ステータスページ 1（独自ドメイン不可） | 通知はメール・Google Chat・Discord・Pushover など。Slack・Teams・Telegram は Solo 以上、Webhook・PagerDuty は Team 以上。API は 10 req/分。5 分より短い間隔は API でも拒否される | アカウントのみ。クレジットカード不要、商用利用可。API v3 と公式 Terraform provider が全プランで使える。CLI はなし | {{< verified run >}} | [1][2][3][4][5][6] |
| Better Stack（Uptime） | Free は USD 0。追加 50 モニターで USD 25/月（年払い USD 21/月）、30 秒間隔 | 10 モニター + 10 ハートビート、3 分間隔。ステータスページ 1 | 通知はメールと Slack。電話・SMS は有料プランの記載のみ。リージョンは us / eu / as / au | アカウントのみ。クレジットカードの要否は公式に明記なし。REST API v2 と公式 Terraform provider あり。CLI はなし | {{< verified spec >}} | [7][8][9][10][11][12] |
| Checkly | Hobby は USD 0。Starter は USD 24/月で 50 モニター・1 分間隔・3 ユーザー | アップタイムモニター 10、2 分間隔、地点 6 か所。ブラウザチェック 1,000 回/月、API チェック 10,000 回/月（ハードキャップ）。保持は生データ 7 日 | 通知はメール・Slack・Webhook。SMS・電話は Team 以上。1 ユーザーのみ、プライベートロケーション不可 | アカウントのみ。クレジットカード不要。公式 CLI（`checkly test` / `deploy`）と Terraform provider が Hobby でも使える | {{< verified run >}} | [13][14][15][16][28][29] |
| Cronitor | Hacker は USD 0。Business は USD 2/月/モニター + USD 5/月/ユーザー（基本料なし、14 日トライアル） | 5 モニター、5 分間隔。ステータスページ 1（基本） | 通知はメールと Slack のみ。地点数と保持期間は無料枠の記載なし。ダッシュボードユーザー 1 | アカウントのみ。クレジットカード不要（トライアルは必要）。Monitor API と公式 CLI あり。Terraform は community 版のみ | {{< verified spec >}} | [17][18][19][20][21] |
| Uptime Kuma（OSS） | USD 0（サーバー代は別） | 無制限（自前サーバー）。最小間隔はコード上 1 秒（UI は 20 秒未満で警告） | セルフホストが要る。公式の管理 API がなく、Socket.IO の内部 API は「サードパーティ向けに非サポート」と明記。SQLite は NFS 不可 | Node.js 20.4 以上または Docker。MIT ライセンス。通知は 90 種以上、ステータスページは複数可 | {{< verified run >}} | [22][23][24][25][26][27][30] |

無料枠で登録できるモニターの数と、無料枠で選べる最短のチェック間隔を並べると、次のようになります。
Uptime Kuma は自前サーバーで件数に上限がないため、件数の図からは外しています。

{{< bars unit="件" caption="無料枠で登録できるモニターの数（出典は比較表と同じ）" >}}
UptimeRobot: 50
Better Stack: 10
Checkly: 10
Cronitor: 5
{{< /bars >}}

{{< bars unit="秒" caption="無料枠で選べる最短のチェック間隔（短いほど検知が早い。出典は比較表と同じ）" >}}
UptimeRobot: 300
Cronitor: 300
Better Stack: 180
Checkly: 120
Uptime Kuma（自前サーバー）: 1
{{< /bars >}}

## 比較の前提

- 対象に含めたもの: 公式サイトで無料枠の上限を公開していて、個人アカウントから申し込める SaaS 4 つと、
  同じ用途で最も広く使われている OSS の Uptime Kuma です。SaaS はいずれも HTTP(S) の死活監視を無料枠に含みます
- 除外したもの: Pingdom・Datadog Synthetics・New Relic Synthetics などの、無料枠がトライアルのみか、
  監視が上位製品の一機能になっているサービス。Grafana Cloud の Synthetic Monitoring は無料枠がありますが、
  Prometheus 連携が前提で比較軸が変わるため別の記事で扱います
- 検証区分の意味: {{< verified run >}} = AI が実際に動かして確認した / {{< verified spec >}} = 公式ドキュメントで確認したのみ
- 監視対象はすべてこのサイト（`https://kurabebako.com/`）です。実行区分の対象は、作成から削除までを
  公式の自動化手段だけで行い、人間が触ったのはアカウント登録と API キーの発行だけです
- 「最短間隔」は無料枠で設定できる最小値です。有料プランの値は「料金」列に書いています

## 各対象の詳細

### UptimeRobot

無料枠が 50 件で、公式の API と Terraform provider が無料のまま使えます。
この記事では API v3 で作成から削除までを通しました。

- **料金体系**: Free は無料で、クレジットカードの登録も要りません。Solo は年払いで USD 9/月（月払い USD 10）、
  60 秒間隔・10 モニター・ステータスページ 3・保持 12 か月です。SMS と音声通知はクレジットの別売りです [1][2]
- **制約**: 無料枠は 50 モニター・5 分間隔・データ保持 3 か月です。通知先はメール・Google Chat・Discord・Pushover・Pushbullet・Splunk で、
  Slack・Teams・Telegram は Solo 以上、Webhook・Zapier・PagerDuty は Team 以上になります。連携の数に上限はありません [1][2][3]。
  API は無料プランで 10 req/分です [4]
- **前提条件**: アカウントのみ。API キーはダッシュボードの Integrations & API から発行します。API v3 は全プランで作成・編集・削除に対応し、
  公式の Terraform provider（`uptimerobot/uptimerobot`）がモニター・連携・メンテナンス期間・ステータスページを扱います。CLI はありません [4][5][6]
- **検証した内容**: 2026-09-03 に API v3 を無料プランで叩きました。認証は `Authorization: Bearer <API キー>` です。
  作成の必須項目は `friendlyName` / `interval` / `type` / `url` / `timeout` の 5 つでした。結果は次のとおりです。

  | 操作 | 結果 |
  | --- | --- |
  | `GET /monitors`（一覧） | 200。応答ヘッダーに `x-ratelimit-limit: 10`、`x-ratelimit-reset: 60` |
  | `POST /monitors`（間隔 60 秒） | **403**「You can not use this monitor interval. Use higher interval.」 |
  | `POST /monitors`（HTTP、間隔 300 秒） | 201。`status: STARTED`、応答まで 2.2 秒 |
  | 作成 → 取得 → 削除の 3 リクエスト | 7.9 秒。削除後の取得は 404「Monitor not found」 |
  | 作成の 62 秒後に取得 | `status: UP`（初回チェックが反映） |

  無料プランでは 5 分より短い間隔を API から指定しても拒否されます。**API ドキュメントの「minimum: 30」は有料プランの値**で、
  無料枠の下限は料金ページの 5 分が正です。作った監視は 1 件残し、このサイトの運用に使っています

### Better Stack（Uptime）

無料枠は 10 件で、間隔は 3 分です。API と Terraform provider は公式にありますが、
無料枠でカードが要るかどうかが公式に書かれていないため、この記事では仕様区分にとどめています。

- **料金体系**: Free は無料です。有料は追加 50 モニターごとに USD 25/月（年払いなら USD 21/月）で、間隔が 30 秒になります [7]
- **制約**: 無料枠は 10 モニターと 10 ハートビート、間隔は 3 分です。料金ページの「30 秒」は有料の値で、
  ドキュメントに「3 minutes for free plans」と明記されています [7][9]。通知はメールと Slack で、
  電話と SMS の「無制限」は料金ページの有料機能の欄にだけ出てきます [7]。リージョンは us / eu / as / au の 4 つです [10]
- **前提条件**: アカウントのみ。クレジットカードの要否は料金ページに記載がなく、「不要」とは書けません [7]。
  REST API v2（`POST /api/v2/monitors` で `check_frequency` と `regions` を指定）と、
  公式の Terraform provider（`BetterStackHQ/better-uptime`）があります。CLI はありません [10][11][12]
- **検証した内容**: 仕様区分です。上記の公式ページ [7]〜[12] を 2026-09-03 に確認しました。
  カード要否が公式に明記されていないため、AI によるアカウント登録は行っていません

### Checkly

「監視をコードで持つ」流れを無料で再現できるのは、5 つの中で Checkly だけです。
`checkly.config.ts` とチェック定義を書き、`npx checkly test` で試してから `deploy` で配備します。

- **料金体系**: Hobby は無料で、クレジットカードも要りません。Starter は USD 24/月で 50 モニター・1 分間隔・3 ユーザーです [13]
- **制約**: Hobby はアップタイムモニター 10、間隔 2 分、地点 6 か所です。ブラウザチェック 1,000 回/月と API チェック 10,000 回/月はハードキャップで、
  超えると止まります。保持は生データ 7 日・集計 30 日。通知はメール・Slack・Webhook で、SMS と電話は Team 以上です。
  ユーザーは 1 人、プライベートロケーションは使えません [13]
- **前提条件**: アカウントのみ。CLI は環境変数 `CHECKLY_API_KEY` と `CHECKLY_ACCOUNT_ID` で非対話にログインできます [29]。
  公式 CLI は Hobby でも使えると料金ページに明記されています [13][14]。
  Terraform provider（`checkly/checkly`）と Pulumi provider もあります [15][16]
- **検証した内容**: 2026-09-03 に Checkly CLI 9.1.0 で、`UrlMonitor` を 1 件（2 分間隔、東京リージョン、200 のアサーション）定義して配備しました [28]。

  | 操作 | 結果 |
  | --- | --- |
  | `npx checkly test --verbose` | 47.9 秒。テストセッションは `eu-central-1` で走り、200 OK・56 ms |
  | `npx checkly deploy --force` | 7.7 秒で配備完了 |
  | REST API `GET /v1/checks` | `checkType: URL`、`frequency: 2`、`locations: ["ap-northeast-1"]`、`activated: true` |

  `checkly test` はモニターの `locations` とは別の地点で実行される点に注意してください。配備したモニターは残し、このサイトの運用に使っています

### Cronitor

無料枠は 5 件と最も小さいですが、公式の CLI と API で作成・削除ができます。
少数の監視を軽く持ちたい場合の候補です。

- **料金体系**: Hacker は無料です。Business は USD 2/月/モニター + USD 5/月/ユーザーで、基本料と最低額はありません。14 日のトライアルはクレジットカードが要ります [17]
- **制約**: 無料枠は 5 モニター・5 分間隔です（有料は 30 秒）。地点は全体で 11 リージョンですが、無料枠で使える地点数と保持期間は記載がありません。
  通知はメールと Slack のみで、SMS とプレミアム連携は使えません。ダッシュボードのユーザーは 1 人です [17][18]
- **前提条件**: アカウントのみ。無料枠にクレジットカードは要りません。Monitor API（`POST/PUT/DELETE /api/monitors`、Basic 認証）と
  公式 CLI `cronitor`（monitors の create / update / delete）があります。Terraform は公式 provider がなく、community 版のみです [19][20][21]
- **検証した内容**: 仕様区分です。上記の公式ページ [17]〜[21] を 2026-09-03 に確認しました。
  次回の更新で CLI による作成・削除を流して実行区分に置き換える予定です

### Uptime Kuma（OSS）

自前のサーバーに立てれば件数は無制限で、間隔も秒単位で取れます。
ただし公式の管理 API がなく、作成・削除の自動化は内部 API に頼ることになります。
この記事では Docker を使わず、ローカルの Node.js で起動して確認しました。

- **料金体系**: MIT ライセンスの OSS で無料です。サーバー代は別で、
  国内 VPS の最小プランの比較は [別の記事](/posts/vps-japan-minimum-plan/) にまとめています [22]
- **制約**: セルフホストが要ります。公式の REST API はモニター管理向けにはなく、Socket.IO の内部 API は
  「サードパーティ向けに非サポート、予告なく破壊的変更あり」と明記されています [24]。CLI と Terraform は community 版のみです [27]。
  SQLite は POSIX のファイルロックが必須で、NFS 上には置けません [23]。
  最小間隔はコード上 1 秒で、UI は 20 秒未満に警告を出します [30]
- **前提条件**: Node.js 20.4 以上または Docker [22][23]。通知は Telegram・Discord・Slack・SMTP など 90 種以上、ステータスページは複数作れてドメインごとに出し分けられます [25]
- **検証した内容**: 2026-09-03 に Uptime Kuma 2.5.3 を Windows 11 の Node.js 24.18.0 で起動しました。

  | 工程 | 結果 |
  | --- | --- |
  | `npm run setup`（依存の導入と dist の取得） | 39 秒 |
  | `node server/server.js` から HTTP 応答まで | **133 秒**（「Loading modules」だけで 92 秒）。起動直後のメモリ 197 MB |
  | 初回の DB 設定（`POST /setup-database`、SQLite） | 受理後、マイグレーションを経て本体が listen するまで約 2 分 |
  | 内部 API で管理者作成 → ログイン → モニター追加（20 秒間隔） | 追加から初回チェック（UP、200 OK、ping 205 ms）まで 0.2 秒 |
  | 内部 API でモニター削除 | 即時。一覧が 0 件になったことを確認 |

  2.x は初回起動時に SQLite か MariaDB かを選ぶ DB 設定画面が入ります。管理者の作成からモニターの追加・削除まで、
  すべて Socket.IO の内部 API（`setup` / `login` / `add` / `deleteMonitor`）で通りましたが、
  一覧のイベントがコールバックより先に届くなど、公式に保証されない挙動に依存します。
  検証後はサーバーを停止し、ポートが閉じたことを確認しています

## 用途別の選び方

上から順に答えていくと、条件に合う対象にたどり着きます。各分岐の根拠は下の箇条書きと比較表の列に書いています。

{{< svg src="uptime-monitoring-free-tier-flow.svg" alt="用途別の判断フロー。コードで配備したいなら Checkly、10 件より多いか API で作成・削除したいなら UptimeRobot、自前サーバーがあるなら Uptime Kuma、10 件以内で 3 分間隔なら Better Stack、5 件以内なら Cronitor" caption="図: 用途別の判断フロー" >}}

- 監視の定義をコードで持ち、CLI や CI から配備したい → Checkly。「前提条件」列のとおり、公式 CLI の `test` と `deploy` が無料枠で使えるのは Checkly だけです。
  無料枠の最短間隔 2 分も 5 つの中で最も短いです
- 無料で 10 件より多く監視したい、または API で作成・削除したい → UptimeRobot。「無料枠」列の 50 件は他社の 5 倍で、
  API v3 と Terraform provider が無料のまま使えます。ただし「主な制約」列のとおり、Slack 通知は有料プランからです
- 自前のサーバーがあり、秒単位の間隔と件数無制限がほしい → Uptime Kuma。「主な制約」列のとおり公式の管理 API がないため、
  作成・削除を自動化する用途には向きません。手で登録して運用する前提なら最も自由度が高い選択です
- 10 件以内・3 分間隔で、通知はメールと Slack で足りる → Better Stack。無料枠で Slack 通知が使えるのは Better Stack と Checkly、Cronitor です。
  電話・SMS が要るなら有料プランになります
- 5 件以内で最小構成にしたい → Cronitor。公式 CLI と API があり、無料枠にカードは要りません。Terraform は community 版のみです

## 出典

1. [UptimeRobot Pricing](https://uptimerobot.com/pricing/) — 2026-09-03 確認
2. [UptimeRobot Help — Who should use UptimeRobot's free plan](https://help.uptimerobot.com/en/articles/11604710-who-should-use-uptimerobot-s-free-plan) — 2026-09-03 確認
3. [UptimeRobot Help — Integrations: basic information](https://help.uptimerobot.com/en/articles/11361285-integrations-basic-information) — 2026-09-03 確認
4. [UptimeRobot API](https://uptimerobot.com/api/) — 2026-09-03 確認
5. [GitHub — uptimerobot/terraform-provider-uptimerobot](https://github.com/uptimerobot/terraform-provider-uptimerobot) — 2026-09-03 確認
6. [UptimeRobot Blog — Terraform provider release](https://uptimerobot.com/blog/uptimerobot-terraform-provider-release/) — 2026-09-03 確認
7. [Better Stack Pricing](https://betterstack.com/pricing) — 2026-09-03 確認
8. [Better Stack Uptime](https://betterstack.com/uptime) — 2026-09-03 確認
9. [Better Stack Docs — Check frequency](https://betterstack.com/docs/uptime/check-frequency/) — 2026-09-03 確認
10. [Better Stack Docs — Create a new monitor (API v2)](https://betterstack.com/docs/uptime/api/create-a-new-monitor/) — 2026-09-03 確認
11. [Better Stack Docs — Terraform](https://betterstack.com/docs/uptime/terraform/) — 2026-09-03 確認
12. [GitHub — BetterStackHQ/terraform-provider-better-uptime](https://github.com/BetterStackHQ/terraform-provider-better-uptime) — 2026-09-03 確認
13. [Checkly Pricing](https://www.checklyhq.com/pricing/) — 2026-09-03 確認
14. [Checkly Docs — CLI](https://www.checklyhq.com/docs/cli/) — 2026-09-03 確認
15. [Checkly Docs — Terraform provider](https://www.checklyhq.com/docs/terraform-provider/) — 2026-09-03 確認
16. [GitHub — checkly/terraform-provider-checkly resources](https://github.com/checkly/terraform-provider-checkly/tree/main/docs/resources) — 2026-09-03 確認
17. [Cronitor Pricing](https://cronitor.io/pricing) — 2026-09-03 確認
18. [Cronitor Docs — Uptime monitoring](https://cronitor.io/docs/uptime-monitoring) — 2026-09-03 確認
19. [Cronitor Docs — Monitors API](https://cronitor.io/docs/monitors-api) — 2026-09-03 確認
20. [Cronitor Docs — Using Cronitor CLI](https://cronitor.io/docs/using-cronitor-cli) — 2026-09-03 確認
21. [GitHub — cronitorio/terraform-provider-cronitor（404。公式 provider が存在しないことの確認）](https://github.com/cronitorio/terraform-provider-cronitor) — 2026-09-03 確認
22. [GitHub — louislam/uptime-kuma](https://github.com/louislam/uptime-kuma) — 2026-09-03 確認
23. [Uptime Kuma Wiki — How to Install](https://github.com/louislam/uptime-kuma/wiki/%F0%9F%94%A7-How-to-Install) — 2026-09-03 確認
24. [Uptime Kuma Wiki — Internal API](https://github.com/louislam/uptime-kuma/wiki/Internal-API) — 2026-09-03 確認
25. [Uptime Kuma Wiki — Status Page](https://github.com/louislam/uptime-kuma/wiki/Status-Page) — 2026-09-03 確認
26. [Uptime Kuma Wiki — Environment Variables](https://github.com/louislam/uptime-kuma/wiki/Environment-Variables) — 2026-09-03 確認
27. [Uptime Kuma Wiki — 3rd Party Addons / Apps](https://github.com/louislam/uptime-kuma/wiki/3rd-Party-Addons-Apps) — 2026-09-03 確認
28. [Checkly Docs — UrlMonitor construct](https://www.checklyhq.com/docs/constructs/url-monitor/) — 2026-09-03 確認
29. [Checkly Docs — CLI authentication](https://www.checklyhq.com/docs/cli/authentication/) — 2026-09-03 確認
30. [GitHub — louislam/uptime-kuma 2.5.3 src/util.js（MIN_INTERVAL_SECOND）](https://github.com/louislam/uptime-kuma/blob/2.5.3/src/util.js) — 2026-09-03 確認
