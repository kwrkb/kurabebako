+++
title = 'ログ管理 SaaS の無料枠 4 つを比較: 取り込み量・保持日数・超えたときの止まり方で選ぶ'
date = '2026-10-31T10:22:05+09:00'
lastmod = '2026-10-31'
draft = true
summary = 'ログ管理 SaaS の無料枠を、Axiom・Better Stack・Grafana Cloud・New Relic で比較。無料で取り込める量と保持日数、無料枠を超えたときに何が止まるか、API で送れるかを並べる。Grafana Cloud のログの無料枠と保持日数、Better Stack の料金の地域差も表に載せる。Better Stack は API で受け口の作成からログの送信、削除までを実行して確認した。'
categories = ['monitoring']
tags = ['log-management', 'axiom', 'better-stack', 'grafana-cloud', 'new-relic']
# OGP 用の画像。本文と一覧には出さない（hidden）。生成は desk の images/
[cover]
  image = '/images/og/log-management-free-tier.jpg'
  alt = 'ログ管理 SaaS の無料枠比較'
  hidden = true
  hiddenInList = true
+++

{{< pr >}}

## 結論

ログ管理 SaaS は、アプリやサーバーが出すログを送って保存し、あとから検索できるサービスです。
無料枠を持つ 4 つを、「無料で月にどれだけ取り込めるか」「何日残るか」「超えたときに何が止まるか」「API で送れるか」の 4 点で比べました。

- **1 人で、無料のまま多くのログを取り込みたい** → Axiom の Personal。「無料枠」列の取り込み量が 4 つの中で最も大きい一方、保存容量と検索の計算量は別の枠で数えます
- **Grafana のダッシュボードで、指標とログを同じ画面で見たい** → Grafana Cloud Logs。「無料枠」列のとおり、指標とトレースもログと同じ Free に含まれます
- **死活監視やエラー監視と同じアカウントで、少量のログも受けたい** → Better Stack。「無料枠」列の量は小さい一方、監視と例外の枠が同じ Free に入っています

| こういう条件なら | 対象 | 決め手 |
| --- | --- | --- |
| 1 人で、無料のまま多くのログを取り込みたい | [Axiom の Personal](#axiom) | 「無料枠」列（取り込み量。保存と検索は別の枠） |
| Grafana のダッシュボードで、指標とログを同じ画面で見たい | [Grafana Cloud Logs](#grafana-cloud-logs) | 「無料枠」列（指標・トレースも同じ Free） |
| 死活監視やエラー監視と同じアカウントで、少量のログも受けたい | [Better Stack](#better-stack) | 「無料枠」列と「主な制約」列（上限で止まる） |
| 閲覧だけの人を、人数の上限なしに増やしたい | [New Relic](#new-relic) | 「無料枠」列（basic user の人数）と「主な制約」列（超えると全体が止まる） |

## 比較表

2026-10-31 時点の公式情報に基づきます。出典は末尾の番号に対応しています。
料金は無料プランと、個人が申し込める最小の有料の入口を月払いの月額（USD）で載せています。
対象名を押すと、その対象の詳細に移ります。

| 対象 | 料金 | 無料枠 | 主な制約 | 前提条件 | 検証区分 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| [Axiom](#axiom) | Personal は USD 0。Axiom Cloud は USD 25/月＋従量 | 取り込み 500 GB/月、保存 25 GB、保持 30 日、検索 10 GB-hours/月 | 3 データセット・1 ユーザー・監視 3。無料枠を超えたときの動きは記載なし | アカウントのみ、カード不要。API は全プラン | {{< verified spec >}} | [1][2] |
| [Better Stack](#better-stack) | Free は USD 0。Nano（40 GB・保持 30 日）は月払い Europe 30 / US 45 / Singapore 105 | ログ 3 GB/月、保持 3 日。同じ Free に監視 10・例外 10 万件/月。Telemetry を見るメンバーは USD 0 で人数の記載なし | 上限に達すると取り込みが 402 で止まる。SQL で読むには global トークンが要る | アカウントのみ。カードの要否は記載なし。API はチーム単位のトークン | {{< verified run >}} | [3][4][5][6] |
| [Grafana Cloud Logs](#grafana-cloud-logs) | Free は USD 0。Pro は基盤 USD 19/月（50 GB 込み）＋従量 | 取り込み 50 GB/月、保持 14 日。指標・トレースも同じ Free に含まれ、利用者は月 3 人まで | 50 GB を超えたときの動きは記載なし。取り込みは 5 MB/s・1 行 256 KB まで | アカウントのみ、カード不要 | {{< verified spec >}} | [7][8] |
| [New Relic](#new-relic) | Free は USD 0。超過は USD 0.40/GB、full user は最初の 1 人 USD 10 | 全データ共通で 100 GB/月、full user 1・basic user 無制限（問い合わせとダッシュボード）、ログの既定保持 30 日 | 100 GB を超えると、翌月 1 日まで取り込みと画面の両方が止まる | アカウントのみ、カード不要 | {{< verified spec >}} | [9][10][11] |

{{< bars unit="日" caption="無料プランでのログの保持日数（New Relic は docs の既定値。出典は比較表と同じ）" >}}
Axiom（Personal）: 30
New Relic（Free）: 30
Grafana Cloud Logs（Free）: 14
Better Stack（Free）: 3
{{< /bars >}}

## 比較の前提

- 対象に含めたもの: ログを HTTP や専用のエージェントで送り、画面や API で検索できる SaaS のうち、無料プランを持ち、取り込み量と保持日数が公式に載っている 4 つです。Better Stack は API で送信までを実行し、Axiom・Grafana Cloud・New Relic は公式ページの確認にとどめています
- 除外したもの: 自分のサーバーで動かすオープンソースのログ基盤（Loki や OpenSearch の自前運用）は、上限が自分の資源で決まり、無料枠の比較が揃わないため対象外にしました。
  例外の収集が主役のサービスは[エラー監視の無料枠比較](/posts/error-tracking-free-tier/)で比べています
- 検証区分の意味: {{< verified run >}} = AI が実際に動かして確認した / {{< verified spec >}} = 公式ドキュメントで確認したのみ
- 料金表記の注意: 通貨は USD で、税の扱いは各社の料金ページの表示のままです。Better Stack の有料プランは保存先の地域で月額が変わるので、3 地域を並べています。
  無料枠の単位は各社で違い、Axiom は取り込み・保存・検索の計算量を別々に数え、New Relic はログ・指標・トレースを 1 つの枠で数えます
- 選び方の軸: 「無料枠」列は、取り込める量と残る日数が対象ごとに桁で分かれ、無料で見られる人数と、ログ以外の信号が同じ枠に入るかもここに載せています。保持日数は棒グラフのとおりで、障害を何日後まで追えるかがここで決まります。
  「主な制約」列は、無料枠を超えたときの動きで分かれます。取り込みの API が止まると書かれている（Better Stack）、取り込みと画面の両方が止まる（New Relic）、公式に記載がない（Axiom・Grafana Cloud）の 3 通りです。
  「前提条件」列は、AI に送信を任せるときの鍵の単位で分かれます
- 検証の手順: Better Stack で 2026-10-31 に行いました。使ったのは 2026-10-12 に作った Free のチームと、ユーザーが発行したチーム単位の Telemetry API トークンです。
  AI が流したのは、API での受け口（source）の作成、ログの送信と誤った送り方の応答の確認、SQL で読む接続の作成、設定の読み直しと受け口の削除、の 4 段階です。
  送ったのは合成した短い処理ログ 4 行で、個人情報や本物の認証情報は含めていません。結果は「各対象の詳細」の「検証した内容」に書いています
- トークンを AI エージェントに渡す手段は、[シークレット管理 CLI 6 つの比較](/posts/secret-management-cli/)で比べています。この検証でも、そこで扱った `op run` でトークンを注入しています

## 各対象の詳細

### Axiom

イベントやログを大量に取り込み、APL という問い合わせ言語で検索するサービスです。
無料の Personal は 1 人用で、取り込み・保存・検索の計算量を別々の枠で数えます。

{{< fit spec >}}
向く: 1 人で、無料のまま多くのログを取り込みたい
向かない: 保存容量や検索の計算量が別の枠に収まらない、複数人で見たい、または無料枠を超えたときの動きを事前に確かめておきたい
{{< /fit >}}

- **料金体系**: Axiom Cloud は月額の基盤料に一定の取り込み・検索・保存が含まれ、超えた分は量に応じた段階制の単価で課金されます。支出の上限を決めると、超えた使用は課金されずに止まります [1]
- **制約**: 1 つのデータセットで項目（field）の数が上限を超えるイベントは、エラーを返して拒否されます [2]。
  料金ページと制限のページのどちらにも、Personal で取り込み量や保存容量を超えたときの動きは書かれていません [1][2]。通知先はメールと Discord に限られ、エッジのリージョンは Personal では使えません [1][2]
- **前提条件**: Personal は「Permanent. No credit card required.」と表示されています。API は全プランで使え、上限はフェアユースの規定によります [1][2]
- **検証した内容**: この比較ではアカウントを作らず、実行していません。確認したのは公式の料金ページと制限のページ（2026-10-31）です

### Better Stack

死活監視・例外の収集・ログをまとめたサービスで、ログは Telemetry という製品が受け持ちます。
無料の Free は監視や例外の枠と同じアカウントに入り、ログの量と保持は 4 つの中で最も小さくなります。

{{< fit run >}}
向く: 死活監視やエラー監視と同じアカウントで、直近数日の少量のログを受けたい
向かない: 何日も前の障害を追いたい、またはチーム単位のトークンだけでログを読み出したい
{{< /fit >}}

- **料金体系**: 有料プランは保存先の地域で月額が変わり、年払いにすると月額が下がります。含まれる量を超えた取り込みは、地域ごとに単価の違う 1 GB あたりの従量です。Telemetry を見るだけのメンバーには、有料プランでも料金が掛かりません [3]
- **制約**: 取り込みの API は、無料枠か支出の上限に達すると 402 `Quota exceeded` を返します。1 回の送信の大きさにも上限があります [4]。
  SQL でログを読む接続（ClickHouse 互換）を API で作るには、チーム単位ではない global の API トークンが要ります [6]。
  docs は壊れた JSON に 406、誤ったトークンに 403 を返すと書きますが、この検証では 202 と 401 でした [4]
- **前提条件**: 料金ページにカードの要否の記載はありません [3]。この検証のチームは、カードを登録せずに作ったものです。受け口の作成と送信は、チーム単位の Telemetry API トークンだけで進められます [5]
- **検証した内容**: 2026-10-31 に、Free のチームの Telemetry API トークンで実行しました。
  チーム単位のトークンでは送ったログを API で読み出せず、ダッシュボードでの受信の確認もしていません。受け付けの判定は、docs が「successfully logged」とする 202 の応答によります [4]。

  | 手順 | 呼び出し | 結果 |
  | --- | --- | --- |
  | 受け口の作成 | `POST /api/v2/sources`（`name` と `platform=http`。地域は指定しない） | 201。送信用の `token` と `ingesting_host`、`logs_retention: 3` が返る。保存先はチームの既定の `us-west-2a` [5] |
  | 1 件を送る | `POST https://<ingesting_host>/`（JSON 1 件、受け口のトークン） | 202。本文は空 [4] |
  | まとめて送る | 同じ先に JSON 配列で 3 件（`dt` に UNIX ミリ秒） | 202 |
  | 壊れた JSON | 閉じていない JSON を送る | 202。docs の 406 とは違う応答 |
  | 誤ったトークン | 存在しないトークンで送る | 401 `{"error": "Unauthorized"}`。docs は 403 と書く |
  | SQL で読む接続 | `POST /api/v1/connections`（チーム単位のトークン） | 401 `This endpoint requires a global API token, not a team token` [6] |
  | 設定の読み直し | `GET /api/v1/sources/{id}` | `logs_retention: 3`、`ingesting_paused: false` |
  | 削除 | `DELETE /api/v1/sources/{id}` | 204。続く `GET` は 404 |

{{< cta id="better-stack" text="Better Stack の Free プランに登録する" >}}

### Grafana Cloud Logs

ダッシュボードの Grafana を開発する会社のクラウド版で、ログは Loki で受けます。
無料の Free はログ専用ではなく、指標やトレースも同じアカウントで受けて、同じ画面に並べます。

{{< fit spec >}}
向く: Grafana のダッシュボードで、指標とログを同じ画面で見たい
向かない: 無料枠を超えたときの動きを事前に確かめておきたい
{{< /fit >}}

- **料金体系**: Pro は月額の基盤料に一定の取り込みが含まれ、超えた分は処理・書き込み・保持の 3 つに分けて 1 GB ごとに課金されます [7]
- **制約**: 料金ページの Free は「Limited to 50 GB ingested per month」と書くだけで、超えたときの動きは書かれていません。利用者の数は「Limited to 3 active users per month」で、何をもって active と数えるかの説明は料金ページにありません [7]。
  取り込みの上限を超えると、速度は 429 `rate_limited`、1 行の長さは 400 `line_too_long`、ストリームの数は 429 `stream_limit` で拒否されます。1 回の検索で遡れる期間にも上限があります [8]
- **前提条件**: Free は「No credit card required」と表示されています [7]。制限のページは Free と有料を分けて書いていません [8]
- **検証した内容**: この比較ではアカウントを作らず、実行していません。確認したのは公式の料金ページと Loki の制限のページ（2026-10-31）です

### New Relic

性能監視（APM）を中心に、ログ・指標・トレースを 1 つの基盤で扱うサービスです。
無料枠はログ専用ではなく、送ったデータの合計で数えます。

{{< fit spec >}}
向く: 閲覧だけの人を、人数の上限なしに増やしたい
向かない: 無料枠を超えたときも、ログの取り込みと画面を止めたくない
{{< /fit >}}

- **料金体系**: 無料枠を超えた取り込みは 1 GB ごとの従量で、保持の長い Data Plus は単価が上がります。Standard の full platform user は 2 人目から単価が上がり、人数にも上限があります [9]
- **制約**: 料金ページの FAQ は、無料の取り込み量を超えると「Data ingest will cease and you will lose access to the platform」と書きます。
  有料に切り替えるか、翌月 1 日になると取り込みと画面が戻ります [9]。
  basic user ができるのは「run queries and create and view custom dashboards」で、APM やログの専用画面は full platform user の範囲です [10]。
  ログの既定の保持は docs の表の値（「無料枠」列）です [11]。無料枠のページは、無料のデータの保持を「at least eight days」と短く書いています [10]
- **前提条件**: 無料枠はカード不要です。有料へ切り替えるときに、カードと請求先の登録が要ります [9][10]
- **検証した内容**: この比較ではアカウントを作らず、実行していません。確認したのは公式の料金ページ・無料枠のページ・データ保持の docs（2026-10-31）です

## 用途別の選び方

最初に分かれるのは、無料で見る人数に上限があってよいかです。「無料枠」列の人数は、上限なし・数人・1 人・記載なしに分かれます。
上限があってよいなら、無料で取り込みたい量、普段使う画面、監視と同じアカウントにまとめるかで分かれます。

{{< svg src="log-management-free-tier-flow.svg" alt="用途別の判断フロー。閲覧だけの人を人数の上限なしに増やしたいなら New Relic の Free、1 人で無料のまま多くのログを取り込みたいなら Axiom の Personal、Grafana のダッシュボードで指標とログを同じ画面で見たいなら Grafana Cloud Logs の Free、死活監視やエラー監視と同じアカウントで少量のログを受けたいなら Better Stack の Free、アプリの外から止まったことを知りたいならログ管理ではなく死活監視" caption="図: 用途別の判断フロー" >}}

- 閲覧だけの人を、人数の上限なしに増やしたい → New Relic。決め手は「無料枠」列の basic user の人数です。超えたときに画面ごと止まる点は「主な制約」列にあります
- 1 人で、無料のまま多くのログを取り込みたい → Axiom の Personal。決め手は「無料枠」列の取り込み量で、保存と検索の枠が別に数えられる点も同じ列にあります。超えたときの動きが公式に無い点は「主な制約」列にあります
- Grafana のダッシュボードで、指標とログを同じ画面で見たい → Grafana Cloud Logs。決め手は「無料枠」列で、指標とトレースが同じ Free に含まれます
- 死活監視やエラー監視と同じアカウントで、少量のログも受けたい → Better Stack。決め手は「無料枠」列で、保持日数の短さは棒グラフのとおりです
- アプリの外から URL を叩いて、止まったことを知りたい → [死活監視の無料枠比較](/posts/uptime-monitoring-free-tier/)が対象です。例外を拾いたいなら[エラー監視の無料枠比較](/posts/error-tracking-free-tier/)が対象です

## 出典

1. [Axiom — Pricing](https://axiom.co/pricing) — 2026-10-31 確認
2. [Axiom Docs — Limits and requirements](https://axiom.co/docs/reference/limits) — 2026-10-31 確認
3. [Better Stack — Pricing](https://betterstack.com/pricing) — 2026-10-31 確認
4. [Better Stack Docs — Ingesting logs via HTTP](https://betterstack.com/docs/logs/ingesting-data/http/logs/) — 2026-10-31 確認
5. [Better Stack Docs — Create a source](https://betterstack.com/docs/logs/api/create-a-source/) — 2026-10-31 確認
6. [Better Stack Docs — Create a connection](https://betterstack.com/docs/logs/api/connections/create/) — 2026-10-31 確認
7. [Grafana Labs — Pricing](https://grafana.com/pricing/) — 2026-10-31 確認
8. [Grafana Cloud Docs — Loki limits](https://grafana.com/docs/grafana-cloud/send-data/logs/loki-limits/) — 2026-10-31 確認
9. [New Relic — Pricing](https://newrelic.com/pricing) — 2026-10-31 確認
10. [New Relic — Free tier](https://newrelic.com/pricing/free-tier) — 2026-10-31 確認
11. [New Relic Docs — Manage data retention](https://docs.newrelic.com/docs/data-apis/manage-data/manage-data-retention/) — 2026-10-31 確認
