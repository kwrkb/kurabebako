+++
title = 'エラー監視の無料枠 5 つを比較: 月の例外数・保持期間・Sentry SDK 互換で選ぶ'
date = '2026-10-18T00:23:18+09:00'
lastmod = '2026-10-18'
draft = false
summary = 'エラー監視（エラートラッキング）の無料枠を、Better Stack Errors・Rollbar・Sentry・Honeybadger・GlitchTip で比較。無料で受けられる例外の数は Better Stack が桁違いで、Rollbar・Sentry・Honeybadger が同じ量で並ぶ。無料で複数人が使えるのは Rollbar と GlitchTip のホスト版。Sentry SDK のまま送り先を替えられるのは Better Stack と GlitchTip。Better Stack と Rollbar は API で送信まで実行して確認した。'
categories = ['monitoring']
tags = ['error-tracking', 'better-stack', 'rollbar', 'sentry', 'honeybadger', 'glitchtip']
# OGP 用の画像。本文と一覧には出さない（hidden）。生成は desk の images/
[cover]
  image = '/images/og/error-tracking-free-tier.jpg'
  alt = 'エラー監視サービスの無料枠比較'
  hidden = true
  hiddenInList = true
+++

{{< pr >}}

## 結論

エラー監視は、アプリの中で起きた例外を集めて通知するサービスです。
無料プランを持つ 5 つを、「無料で月に何件受けられるか」「何日残るか」「何人で見られるか」「Sentry SDK のまま送れるか」の 4 点で比べました。

- **無料で受けられる量を優先し、Sentry SDK のまま送り先だけ替えたい** → Better Stack Errors。「無料枠」列の件数が桁違いに多く、Sentry SDK をそのまま使えます
- **無料のまま複数人で同じエラーを見たい** → Rollbar。「無料枠」列でユーザーが無制限で、件数も Sentry と同じ量があります
- **エラーのデータを自分のサーバーに置きたい** → GlitchTip のセルフホスト。オープンソースで、件数の上限は自分の資源で決まります

| こういう条件なら | 対象 | 決め手 |
| --- | --- | --- |
| 無料で受けられる量を優先し、Sentry SDK のまま送り先だけ替えたい | [Better Stack Errors](#better-stack-errors) | 「無料枠」列（件数）と「前提条件」列（Sentry SDK 互換） |
| 無料のまま複数人で同じエラーを見たい | [Rollbar](#rollbar) | 「無料枠」列（ユーザー無制限） |
| エラーのデータを自分のサーバーに置きたい | [GlitchTip](#glitchtip) | 「料金」列（セルフホストは無料）と「前提条件」列 |
| 1 人で、トレースやセッションの記録も同じ画面で試したい | [Sentry](#sentry) | 「無料枠」列（エラー以外の枠） |
| 1 人で、死活監視とステータスページも同じ画面にまとめたい | [Honeybadger](#honeybadger) | 「無料枠」列（監視とステータスページ） |

アプリの外から URL を叩いて、落ちたら知らせる仕組みを探しているなら、[死活監視の無料枠比較](/posts/uptime-monitoring-free-tier/)が対象です。

## 比較表

2026-10-18 時点の公式情報に基づきます。出典は末尾の番号に対応しています。
料金は個人が申し込める最小の有料プランを月払いの月額（USD）で載せ、年払いを括弧で補っています。
対象名を押すと、その対象の詳細に移ります。

| 対象 | 料金 | 無料枠 | 主な制約 | 前提条件 | 検証区分 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| [Better Stack Errors](#better-stack-errors) | Free は USD 0。超過は例外 1 件 USD 0.00005 の従量 | **例外 10 万件/月**、保持 90 日。ほかにログ 3 GB/月（保持 3 日）、監視 10 | 料金ページは Free を「個人プロジェクト向け」と表示し、商用利用の可否は明記なし。受信したエラーを読む API は無い | アカウントのみ。カードの要否は記載なし。Sentry SDK 互換。API はチーム単位のトークン | {{< verified run >}} | [1][2][3][4] |
| [Rollbar](#rollbar) | Free は USD 0。Essentials USD 9/月（年払いは月 7.50、1 万件） | **5,000 件/月**、保持 30 日、**ユーザー無制限**、セッションリプレイ 1,000/月 | 上限に達すると、既定では翌期まで新しいイベントを処理しない。Sentry SDK 互換ではない（自社 SDK か REST API） | アカウントのみ。カード不要。読み取り用のトークンは自分で追加する | {{< verified run >}} | [5][6][7] |
| [Sentry](#sentry) | Developer は USD 0。Team USD 29/月（年払いは月 26、5 万件） | **5,000 件/月**、保持 30 日、**1 ユーザー**。ほかにログ 5 GB、スパン 500 万、リプレイ 50 | 無料は 1 人まで。料金ページは API と外部連携を Team の追加機能として載せる | アカウントのみ。新規は 14 日の Business トライアルで始まり、終了後に Developer へ移る | {{< verified spec >}} | [8][9] |
| [Honeybadger](#honeybadger) | Developer は USD 0。Team USD 26/月（年 USD 286、5 万件） | **5,000 件/月**、保持 15 日、**1 ユーザー**。ほかに死活監視 1、ステータスページ 1 | 上限の 125% で月末まで処理を止める。トライアルの終了までにプランを選ばないと監視が止まる | アカウントのみ。新規は 30 日のトライアル（カード不要）で始まる | {{< verified spec >}} | [10] |
| [GlitchTip](#glitchtip) | セルフホストは無料（MIT）。ホスト版は Small USD 15/月（10 万件） | ホスト版 **1,000 件/月**（例外のほか死活監視の確認なども数える）、メンバー無制限 | ホスト版は上限を超えると段階的に絞り、2 倍で遮断。ホスト版の保持期間は記載なし | セルフホストは Docker と PostgreSQL 14 以上、メモリ 256 MB から。Sentry SDK 互換 | {{< verified spec >}} | [11][12][13][14] |

{{< bars unit="件/月" caption="無料で受けられる例外の数（GlitchTip はホスト版の Free。セルフホストは上限なし。出典は比較表と同じ）" >}}
Better Stack Errors: 100000
Rollbar: 5000
Sentry: 5000
Honeybadger: 5000
GlitchTip（ホスト版）: 1000
{{< /bars >}}

{{< bars unit="日" caption="無料プランでの例外の保持期間（GlitchTip のホスト版は記載なし。セルフホストは既定 90 日で変えられる。出典は比較表と同じ）" >}}
Better Stack Errors: 90
Rollbar: 30
Sentry: 30
Honeybadger: 15
{{< /bars >}}

## 比較の前提

- 対象に含めたもの: アプリが投げた例外を集めるサービスのうち、無料プランか無料のセルフホストを持ち、件数と保持期間が公式に載っている 5 つです。Better Stack Errors と Rollbar は API で送信までを実行し、Sentry・Honeybadger・GlitchTip は公式ページの確認にとどめています
- 除外したもの: アプリの外から URL を叩く死活監視は、[死活監視の無料枠比較](/posts/uptime-monitoring-free-tier/)で比べています。ログ管理や性能監視（APM）が主役のサービスは、無料枠を容量で数えるため件数での比較が揃わず、対象外にしました
- 検証区分の意味: {{< verified run >}} = AI が実際に動かして確認した / {{< verified spec >}} = 公式ドキュメントで確認したのみ
- 料金表記の注意: 通貨は USD で、税の扱いは各社の料金ページの表示のままです。件数の呼び方は exceptions・errors・occurrences・events と各社で違いますが、送られた例外 1 件ごとに数える点は同じです。
  GlitchTip の events だけは、例外のほかに死活監視の確認やトランザクションも同じ枠で数えます [11]
- 選び方の軸: 「無料枠」列は、件数が桁で分かれます。
  Better Stack だけが大きく、Rollbar・Sentry・Honeybadger が同じ量で並び、GlitchTip のホスト版が最も少なくなります。
  同じ列の人数も分かれ目で、Rollbar と GlitchTip のホスト版は無料のまま人数が無制限、Sentry と Honeybadger は 1 人です。
  「主な制約」列は、上限に達したときの動きで分かれます。止める（Rollbar・Honeybadger）、段階的に絞る（GlitchTip）、従量で課金する（Better Stack）の 3 通りです。
  「前提条件」列は、Sentry SDK をそのまま使えるかで分かれます。Better Stack と GlitchTip は DSN を差し替えるだけで送り先を移せ、Rollbar は自社の SDK か REST API で送ります
- 検証の手順: Better Stack Errors と Rollbar で 2026-10-17 に行いました。どちらも無料プランのアカウントと API トークンをユーザーが用意し、AI が送信から後片付けまでを流しています。
  Better Stack は (1) API で受け口（application）を作る (2) Python の Sentry SDK と、Sentry 形式の生のリクエストで例外を 1 件ずつ送る (3) 設定を読み直す (4) ダッシュボードで受信を確かめる (5) 受け口を消す、の段階です。
  Rollbar は (1) REST API で同じ内容の例外を 2 件送る (2) 1 件にまとまるかを見る (3) トークンの権限の分離を見る (4) 解決済みにする、の段階です。
  送った例外のメッセージには、個人情報や実在のデータを含めていません。結果は「各対象の詳細」の「検証した内容」に書いています
- トークンを AI エージェントに渡す手段は、[シークレット管理 CLI 6 つの比較](/posts/secret-management-cli/)で比べています。この検証でも、そこで扱った `op run` でトークンを注入しています

## 各対象の詳細

### Better Stack Errors

ログや死活監視をまとめた Better Stack のうち、例外の収集を受け持つ製品です。
Sentry SDK の送り先として動くので、Sentry から移るときにアプリのコードを書き換えずに済みます。

{{< fit run >}}
向く: 無料で受けられる量を優先し、Sentry SDK のまま送り先だけ替えたい
向かない: 受信したエラーを API で読み出して、自分の仕組みで集計したい
{{< /fit >}}

- **料金体系**: 無料枠を超えた例外は件数に応じた従量で課金されます。同じアカウントの Free には、ログ・トレース・Web イベントの小さな枠と、死活監視・ステータスページも含まれます [1]
- **制約**: Errors API で扱えるのは受け口（application）・そのグループ・リリースの 3 種類で、受信したエラーそのものを読む API はありません [4]。
  料金ページの FAQ はデータの保存先の既定を EU リージョンと書きますが、この検証で作った受け口の保存先は米国西部でした。保存先は作成時に指定でき、省略するとチームの既定になります [1][2]
- **前提条件**: API にはチーム単位の Telemetry API トークンを使います。受け口の作成から DSN の組み立てまで、画面を開かずに進められます [3][4]
- **検証した内容**: 2026-10-17 に、Free のチームの Telemetry API トークンで実行しました。受信の確認は 10-18 にダッシュボードで行い、その後に受け口を消しています。

  | 手順 | 呼び出し | 結果 |
  | --- | --- | --- |
  | 受け口の作成 | `POST /api/v2/applications`（`name` と `platform=python_errors`） | 201。DSN を組むための `token`・`ingesting_host`・`id` と、`errors_retention: 90` が返る [2] |
  | Sentry SDK から送信 | Python の `sentry-sdk` 2.72.0 で DSN を差し替え、`ZeroDivisionError` を `capture_exception` | `event_id` が返り、送信待ちの書き出しも完了 [3] |
  | Sentry 形式の生のリクエスト | `POST https://<ingesting_host>/api/<id>/envelope/`（`X-Sentry-Auth` ヘッダー） | 200。Sentry の envelope 形式をそのまま受ける |
  | 設定の読み直し | `GET /api/v2/applications/{id}` | `errors_retention: 90`、`ingesting_paused: false` |
  | 受信の確認 | ダッシュボードの Errors → Applications | 送った 2 件がどちらも表示された |
  | 削除 | `DELETE /api/v2/applications/{id}` | 204。続く `GET` は 404 |

{{< cta id="better-stack" text="Better Stack の Free プランに登録する" >}}

### Rollbar

例外の収集と集約を専業にしたサービスで、無料プランでも人数の上限がありません。
送信は自社の SDK か REST API で行い、Sentry SDK とは互換がありません。

{{< fit run >}}
向く: 無料のまま複数人で同じエラーを見て、解決済みの管理まで API で回したい
向かない: Sentry SDK を入れたアプリの送り先だけを替えたい
{{< /fit >}}

- **料金体系**: 有料プランは月の件数に応じて段階的に上がり、年払いは 2 か月分が割り引かれます。上限を超えた分を従量で受けるか、金額の上限を決めて受けるかは、Essentials 以上で選べます [5]
- **制約**: トークンは用途ごとの権限（送信用と読み書き用）に分かれ、送信用のトークンに読み書きの権限は同居できません。
  トークンの本体は作成時に 1 回だけ表示され、その後の一覧に出るのは API に使えない識別用の Public ID です [6]。
  item を消す API は無く、解決済みにしても履歴は残ります
- **前提条件**: 新しいプロジェクトには送信用のトークンしか並ばないことがあり、この検証でも読み書き用のトークンは自分で追加しました
- **検証した内容**: 2026-10-17 に、Free のアカウントで送信用と読み書き用のトークンを 1 本ずつ使って実行しました。送ったのは同じ内容の例外 2 件です。

  | 手順 | 呼び出し | 結果 |
  | --- | --- | --- |
  | 取り違え | 一覧に出る 32 文字の値で `POST /api/1/item/` | 403 `access token not found … not using the Public ID as an access token` |
  | 送信 | 作成時に控えた本体で `POST /api/1/item/` を 2 回 | どちらも 200 で `uuid` が返る（約 0.7 秒） |
  | 一覧に出る | `GET /api/1/items/?environment=` | 送信から 3 分以内に item が現れる |
  | まとまり | `GET /api/1/item/{id}` と `/instances/` | `total_occurrences: 2`。同じ内容の 2 件は 1 つの item にまとまる |
  | 権限の分離 | 読み書き用で送信 / 送信用で読み取り | どちらも 403（`post_server_item scope is required` / `read scope is required`） |
  | 解決済みにする | `PATCH /api/1/item/{id}`（`status: resolved`） | 200。続く `GET` で `resolved` |
  | 呼び出しの上限 | 応答ヘッダー | `X-Rate-Limit-Limit: 50000`、1 分で戻る。docs は上限を動的な値と説明し、設定画面に表示するとしている [7] |

### Sentry

エラー監視の代表的なサービスで、各言語の SDK を自社で開発しています。
無料の Developer プランは 1 人用で、エラーのほかにログ・トレース・セッションの記録の枠も付きます。

{{< fit spec >}}
向く: 1 人で、エラーとトレースやセッションの記録を同じ画面で試したい
向かない: 無料のまま複数人で使いたい、または API で外部の仕組みと繋ぎたい
{{< /fit >}}

- **料金体系**: 有料プランでは、含まれる件数を超えた分が量に応じた単価で課金されます。単価は量が増えるほど下がる段階制です [8]
- **制約**: 料金ページは、人数の無制限と API・外部連携を Team プランで加わる機能として載せています [8]
- **前提条件**: 新しいアカウントは 14 日の Business トライアルで始まり、アップグレードしなければ終了後に無料の Developer に移ります [9]。
  2026-10-18 時点の料金ページと docs には、カードの要否の記載がありません
- **検証した内容**: この比較ではアカウントを作らず、実行していません。確認したのは公式の料金ページと docs（2026-10-18）です

### Honeybadger

エラー監視を中心に、ログ・死活監視・ステータスページを 1 つにまとめたサービスです。
無料の Developer プランは 1 人用で、例外の保持は 5 つの中で最も短くなります。

{{< fit spec >}}
向く: 1 人で、エラーと死活監視・ステータスページを同じ画面にまとめたい
向かない: 障害を何週間も後から追う、または無料のまま複数人で使いたい
{{< /fit >}}

- **料金体系**: Team と Business では、上限を超えた分を件数に応じて課金する設定を選べます [10]
- **制約**: 上限を超えても少し先までは処理し、そこで月末まで止まります。上限が近づくとメールで知らせます [10]
- **前提条件**: 新しいアカウントは、人数無制限の 30 日トライアル（カード不要）で始まります。終了前にメールで確認が届き、支払い手段を登録するか Developer に切り替えます。
  どちらも選ばないと、ログインしてプランを選ぶまで監視が止まります [10]
- **検証した内容**: この比較ではアカウントを作らず、実行していません。確認したのは公式の料金ページ（2026-10-18）です

### GlitchTip

Sentry SDK と互換のあるオープンソースのエラー監視で、自分のサーバーで動かすか、開発元のホスト版を使います。
ホスト版の無料枠は 5 つの中で最も少ない一方、人数は無制限です。

{{< fit spec >}}
向く: エラーのデータを自分のサーバーに置き、Sentry SDK をそのまま使いたい
向かない: サーバーを持たず、ホスト版の無料枠で多くの例外を受けたい
{{< /fit >}}

- **料金体系**: ホスト版の有料プランは件数で 3 段階に分かれます。非営利やオープンソースのプロジェクトには割引があります [11]
- **制約**: ホスト版の件数には、例外のほかに死活監視の確認・トランザクション・リリースのファイル容量も含まれます。ホスト先は米国と EU（ドイツ）から選べます [11]。
  セルフホストの保持期間は環境変数で決まり、既定は 90 日です [12]
- **前提条件**: セルフホストは Docker Compose での起動が推奨で、PostgreSQL 14 以上が要ります。メモリは 512 MB が推奨で、Valkey（Redis）は任意です [12]。
  SDK は Sentry のものを使います [13]。ライセンスは MIT です [14]
- **検証した内容**: この検証環境には Docker を用意しておらず、セルフホストは起動していません。ホスト版のアカウントも作っていません。確認したのは公式の料金ページとインストール手順（2026-10-18）です

## 用途別の選び方

最初に分かれるのは、データを自分のサーバーに置くかどうかです。
次に、無料で受けたい量と、無料で何人が見るかで分かれます。

{{< svg src="error-tracking-free-tier-flow.svg" alt="用途別の判断フロー。データを自分のサーバーに置きたいなら GlitchTip のセルフホスト、無料で受けられる量を優先し Sentry SDK のまま送り先を替えたいなら Better Stack Errors の Free、無料のまま複数人で見たいなら Rollbar の Free、1 人でトレースやセッションの記録も試したいなら Sentry の Developer、1 人で死活監視とステータスページもまとめたいなら Honeybadger の Developer、アプリの外から URL を叩いて落ちたら知らせたいならエラー監視ではなく死活監視" caption="図: 用途別の判断フロー" >}}

- エラーのデータを自分のサーバーに置きたい → GlitchTip のセルフホスト。決め手は「料金」列と「前提条件」列です。Sentry SDK をそのまま使えます
- 無料で受けられる量を優先し、Sentry SDK のまま送り先だけ替えたい → Better Stack Errors。決め手は「無料枠」列です。受信したエラーを API で読めない点は「主な制約」列にあります
- 無料のまま複数人で同じエラーを見たい → Rollbar。決め手は「無料枠」列の人数です。Sentry SDK からは移せないので、「主な制約」列のとおり自社の SDK か REST API で送ります
- 1 人で、トレースやセッションの記録も同じ画面で試したい → Sentry。決め手は「無料枠」列のエラー以外の枠です
- 1 人で、死活監視とステータスページも同じ画面にまとめたい → Honeybadger。決め手は「無料枠」列です。保持期間が短い点は棒グラフのとおりです
- アプリの外から URL を叩いて、落ちたら知らせたい → [死活監視の無料枠比較](/posts/uptime-monitoring-free-tier/)が対象です

## よくある質問

### Sentry の無料プランではどこまで使えますか？

無料の Developer プランは 1 人用で、エラーの件数と保持期間は「無料枠」列のとおりです [8]。
新しいアカウントは 14 日の Business トライアルで始まり、アップグレードしなければ終了後に Developer に移ります [9]。

### Sentry SDK のまま送り先だけ替えられますか？

Better Stack Errors と GlitchTip は Sentry SDK に対応していて、DSN を差し替えれば送れます [3][13]。
実行検証でも、Python の Sentry SDK から Better Stack に例外を送れました。Rollbar は自社の SDK か REST API で送ります [5]。

### 無料枠を超えるとどうなりますか？

各社で動きが分かれ、内容は「主な制約」列のとおりです。
Rollbar は既定で翌期まで新しいイベントを処理せず [5]、Honeybadger は上限を少し超えたところで月末まで止まります [10]。
GlitchTip のホスト版は段階的に絞ってから遮断し [11]、Better Stack は超えた分を従量で課金します [1]。

## 出典

1. [Better Stack — Pricing](https://betterstack.com/pricing) — 2026-10-18 確認
2. [Better Stack Docs — Create an application](https://betterstack.com/docs/errors/api/applications/create/) — 2026-10-18 確認
3. [Better Stack Docs — Sentry SDK](https://betterstack.com/docs/errors/collecting-errors/sentry-sdk/) — 2026-10-18 確認
4. [Better Stack Docs — Getting started with Errors API](https://betterstack.com/docs/errors/api/getting-api-token/) — 2026-10-18 確認
5. [Rollbar — Pricing for AI agents](https://rollbar.com/pricing-for-agents) — 2026-10-18 確認
6. [Rollbar Docs — Access Tokens](https://docs.rollbar.com/docs/access-tokens) — 2026-10-18 確認
7. [Rollbar Docs — Rate Limits](https://docs.rollbar.com/docs/rate-limits) — 2026-10-18 確認
8. [Sentry — Pricing](https://sentry.io/pricing/) — 2026-10-18 確認
9. [Sentry Docs — Pricing & Billing](https://docs.sentry.io/pricing/) — 2026-10-18 確認
10. [Honeybadger — Plans & Pricing](https://www.honeybadger.io/plans/) — 2026-10-18 確認
11. [GlitchTip — Pricing](https://glitchtip.com/pricing) — 2026-10-18 確認
12. [GlitchTip Docs — Installation Guide](https://glitchtip.com/documentation/install) — 2026-10-18 確認
13. [GlitchTip — Sentry SDK Documentation](https://glitchtip.com/sdkdocs) — 2026-10-18 確認
14. [GlitchTip Backend — LICENSE](https://gitlab.com/glitchtip/glitchtip-backend/-/blob/master/LICENSE) — 2026-10-18 確認
