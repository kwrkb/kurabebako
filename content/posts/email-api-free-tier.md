+++
title = 'メール送信 API 5 つの無料枠比較: 無料で送れるまでのゲート'
date = '2026-09-08T21:25:18+09:00'
lastmod = '2026-10-03'
draft = false
summary = 'Resend・Postmark・Brevo・Mailgun・Amazon SES を、無料枠が恒常か、カード登録なしで動かせるか、送信できるまでにどんなゲート（ドメイン認証・アカウント承認・サンドボックス解除）があるかで比較。Resend は AI が API キーだけで送信ドメインの登録から送信・削除まで動かし、無料でカード登録なしに自分のドメインから API で送るなら Resend が条件を満たす。'
categories = ['developer-tools']
tags = ['email-api', 'resend', 'postmark', 'brevo', 'mailgun', 'amazon-ses']
# OGP 用の画像。本文と一覧には出さない（hidden）。生成は desk の images/
[cover]
  image = '/images/og/email-api-free-tier.jpg'
  alt = 'メール送信 API の無料枠比較'
  hidden = true
  hiddenInList = true
+++

## 結論

アプリや CI から通知メールを送るためのメール送信 API 5 つを、「無料枠が恒常か」「カード登録なしで動かせるか」「実際に送れるまでに何が挟まるか」の 3 点で比べました。

- **無料でカード登録なしに、自分のドメインから API で送りたい** → Resend。Free Tier に期限が無く、送信ドメインの登録から DNS レコードの取得、送信、削除までが API だけで閉じます
- **開発中のテストだけ、またはマーケティング配信も要る** → Postmark か Brevo。Postmark は期限のない開発者向けの枠で、Brevo は無料枠の日次の上限が 5 つで最も多くなっています
- **すでに AWS を使っていて、従量で送る** → Amazon SES。恒常の無料枠が無く、送れる相手を広げるにはサンドボックスの解除申請が要ります

| こういう条件なら | 対象 | 決め手 |
| --- | --- | --- |
| カード登録なしで、自分のドメインから API で送りたい | Resend | 「前提条件」列（利用規約でカード不要）と「無料枠」列（期限のない Free Tier） |
| 開発・テスト用で、上限で止まってよい | Postmark | 「無料枠」列（期限のない開発者向けの枠）と「主な制約」列（超過送信は不可） |
| 日次で多めに送りたく、連絡先の管理も要る。承認待ちを受け入れられる | Brevo | 「無料枠」列（5 つで最も多い日次の上限）と「主な制約」列（送信前にアカウント承認） |
| ログは当日ぶんで足り、受信（inbound）も試したい | Mailgun | 「無料枠」列（inbound route を含む）と「主な制約」列（ログ保持が短い） |
| すでに AWS アカウントがあり、従量で大量に送る | Amazon SES | 「料金」列（従量単価）と「主な制約」列（サンドボックスの解除申請） |

## 比較表

2026-10-03 時点の公式情報に基づきます。出典は末尾の番号に対応しています。
料金は個人が申し込める最小のプランで揃え、通貨は各社の料金ページの表記（USD または円）のままです。対象名を押すと、その対象の詳細に移ります。

| 対象 | 料金 | 無料枠 | 主な制約 | 前提条件 | 検証区分 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| [Resend](#resend) | Free Tier（USD 0）。有料は Pro USD 20/月（月 5 万通）から | 月 3,000 通・**日 100 通**、送信ドメイン 3、データ保持 30 日。マーケティングは連絡先 1,000 まで | 日次の上限が月次と別に効き、超過は 429（`daily_quota_exceeded`）。API は 10 リクエスト/秒。送信ドメインの認証（DKIM の TXT と Return-Path の MX / TXT）が要る | アカウントのみ。Free Tier は「billing information を求めない」と利用規約に明記。API キーは full access と sending access の 2 種で、ドメイン限定もできる | {{< verified run >}} | [1][2][3][4][5][6][7] |
| [Postmark](#postmark) | 開発者向けの無料枠（USD 0）。有料は Basic USD 15/月（月 1 万通、超過 USD 1.80/1,000 通）から | **月 100 通**。「never expires or runs out」と明記 | 無料枠での超過送信は不可（「No overages allowed in this plan」）。送信元は確認済みの Sender Signature か認証済みドメインに限られ、未確認だと 422 | アカウントのみ。申込み導線に「No Credit Card Required」。API は `X-Postmark-Server-Token` ヘッダーで認証 | {{< verified spec >}} | [9][10] |
| [Brevo](#brevo) | Free（USD 0）。有料は Starter 月額 1,140 円（年払いで 1,026 円）・月 5,000 通から | **日 300 通**。「Free forever, no credit card needed」 | 送信の解禁に Brevo 側のアカウント承認が挟まる（「Once we approve your account for sending」）。メール末尾の「Sent with Brevo」の除去は有料（Starter で月 1,125 円の追加） | アカウントのみ。カード不要と料金ページと FAQ の両方に明記。承認の基準と所要時間は公式に記載なし | {{< verified spec >}} | [11] |
| [Mailgun](#mailgun) | Free（USD 0）。有料は Basic USD 15/月（月 1 万通）から | **日 100 通**、カスタム送信ドメイン 1、API キー 2、inbound route 1 | **ログ保持 1 日**。ドメインは 1 本のみ。Foundation / Scale の「Free for 1 month」は Free プランとは別のトライアル | アカウントのみ。カード要否は料金ページにも FAQ にも記載が無く、公式には確認できない | {{< verified spec >}} | [12] |
| [Amazon SES](#amazon-ses) | 従量。送信 USD 0.10/1,000 通（添付 USD 0.12/GB）、受信 USD 0.10/1,000 通 | 恒常の無料枠は無し。新規アカウント向けに最大 USD 200 のクレジット（Free プランは開設から 6 か月、クレジットは 12 か月で失効） | **サンドボックス**: 検証済みの宛先にしか送れず、24 時間で 200 通・毎秒 1 通。解除には本番アクセス申請（用途と website URL の申告、初回応答 24 時間） | AWS アカウント。新規の多くは開設時に支払い方法の登録が不要（本人確認で求められる場合あり）。送信元のドメインかアドレスの検証が要る | {{< verified spec >}} | [13][14][15][16] |

{{< bars unit="通/日" caption="無料枠の 1 日あたりの送信上限（公式の料金ページに日次の上限があるものだけ。Postmark は月 100 通で日次の上限が無く、Amazon SES は期限付きクレジットのため載せていない）" >}}
Brevo: 300
Resend: 100
Mailgun: 100
{{< /bars >}}

## 比較の前提

- 対象に含めたもの: 公式の料金ページで無料枠の数字（または「無料枠が無い」こと）を確認でき、REST API で送信できる 5 つです。
  Resend・Postmark・Mailgun はトランザクションメール（通知・認証コードなど）が主用途、Brevo はマーケティング配信も含む製品です。
  Amazon SES は恒常の無料枠が無いものの、比較でよく並ぶため「仕様」区分で含めています
- 除外したもの: SendGrid。2026-09-08 時点で料金ページが twilio.com へ転送され、無料プランの有無を一次情報で確認できなかったためです
- 検証区分の意味: {{< verified run >}} = AI が実際に動かして確認した / {{< verified spec >}} = 公式ドキュメントで確認したのみ
- 料金表記の注意: 金額と通貨は各社の料金ページの表記のままです。Free Tier と Free Trial は分けています。
  Resend の利用規約は Free Tier に「billing information を求めない」と書く一方で、
  Free Trial は「求めることがある」と別条件にしています。Mailgun の「Free for 1 month」も Free プランとは別のトライアルです
- 選び方の軸: 「無料枠」列は、単位が月次・日次・期限付きクレジットの 3 通りに割れていて、Resend は日次の上限が月次と併存します。
  棒グラフは日次の上限が公式にあるものだけに絞りました。
  「前提条件」列は、カード登録が要らないことを公式が明記しているかで分かれます。
  「主な制約」列は、実際に送れるまでに挟まるもの（送信ドメインの認証・アカウント承認・サンドボックスの解除）が分かれ目です
- 検証の手順: Resend だけに 2026-09-08 に行いました。他 4 つはアカウント作成が要るため、公式ページの確認にとどめています。
  手順は (1) API キーを非対話で使う (2) 送信ドメインを登録して DNS レコードを取得し、Cloudflare の API で登録する (3) 認証前・認証後に 1 通ずつ送る (4) 上限のエラーを記録する (5) ドメイン・DNS レコード・API キーを消す、の 5 つです。
  宛先アドレスと API キーの値は記事にもログにも出していません。結果は「各対象の詳細」の「検証した内容」に書いています
- API キーを CI や AI エージェントに渡す手段は、[シークレット管理 CLI 6 つの比較](/posts/secret-management-cli/)で比べています。
  この記事の検証でも、そこで扱った `op run` で API キーを注入しています。
  「無料枠が恒常か、一回きりか」という同じ見方で、[スクレイピング API 5 つの無料枠比較](/posts/scraping-api-free-tier/)も書いています

## 各対象の詳細

### Resend

開発者向けのメール送信 API で、ドメイン・API キー・送信・イベントのすべてが REST API と公式 SDK から扱えます。
5 つのうち、無料枠に期限が無く、カード登録が不要であることを利用規約で確認でき、AI が送信ドメインの登録から削除まで動かせたのは Resend だけです。

{{< fit run >}}
向く: カード登録なしで、自分のドメインから API で送りたい。ドメインの登録まで API で閉じたい
向かない: 無料枠のまま、日次の上限を超えて送りたい（月次とは別に効く）
{{< /fit >}}

- **料金体系**: 有料の Pro は送信ドメイン 10 までで、マーケティング配信は連絡先の数で別料金です [1][3]
- **制約**: 月次の上限の超過は `monthly_quota_exceeded` で、日次の `daily_quota_exceeded` と分かれています [5]。
  API のレート制限はチーム単位で、超過は 429 `rate_limit_exceeded` と `ratelimit-*` ヘッダーで返ります [4]。
  公式はルートドメインでなくサブドメインからの送信を推奨し、認証は「多くは 15 分以内」と書いています [6]
- **前提条件**: 利用規約の原文は「You are not required to provide billing information to use the Free Tier.」です [2]。
  API キーの 2 種は、`full_access` が「Can create, delete, get, and update any resource」、`sending_access` が「Can only send emails」で、
  後者は `domain_id` で特定のドメインに限定できます [7]
- **検証した内容**: 2026-09-08 に REST API（`curl`）で実行しました。送信ドメインは `lab.kurabebako.com`（サブドメイン）で、DNS レコードは Cloudflare の API で登録しました。

  | 操作 | 結果 |
  | --- | --- |
  | `sending_access` のキーで `GET /domains`、`POST /domains` | **401** `restricted_api_key`「This API key is restricted to only send emails」。ドメインとキーの管理は full access のキーでしか呼べない |
  | `POST /domains`（`ap-northeast-1`） | 201（0.5 秒）。DNS レコード 3 件（DKIM の TXT、Return-Path 用 `send` サブドメインの MX と TXT）がゾーンからの相対名で返る |
  | Cloudflare API でレコード 3 件を登録 → `POST /domains/{id}/verify` | 15 秒ごとの `GET /domains/{id}` で 9 回 `pending`、10 回目で `verified`。verify から **155 秒** |
  | 認証前に自ドメインから `POST /emails` | **403** `validation_error`「The lab.kurabebako.com domain is not verified. Please, add and verify your domain」 |
  | `onboarding@resend.dev` からアカウントのアドレス宛 / `example.com` 宛 | 200 / **422** `validation_error`「Invalid `to` field. Please use our testing email address instead of domains like `example.com`」 |
  | `POST /api-keys`（`sending_access`、`domain_id` 付き）→ そのキーで送信 | 201 で発行。自ドメインからの送信は 200（0.4 秒）で、6 秒後の `GET /emails/{id}` は `last_event: delivered`。同じ `Idempotency-Key` で再送すると同じ id が返り二重送信されない |
  | `GET /domains` を 25 並列 | 200 × 9、**429 × 16**。`ratelimit-remaining: 0`、`retry-after: 1`、本文は `rate_limit_exceeded`「You can only make 10 requests per second」 |
  | `DELETE /api-keys/{id}` → DNS レコード削除 → `DELETE /domains/{id}` | すべて 200。終了時に `GET /domains` でドメイン 0 件 |

  日 100 通の上限（`daily_quota_exceeded`）は当てていません。当てると同じ日の送信確認ができなくなるためで、429 の形式はレート制限で確認しています。
  検証で作ったドメイン・DNS レコード・送信専用キーはその場で削除しています

### Postmark

トランザクションメール専業のサービスで、無料枠は「開発者向け」と位置づけられています。
無料枠に期限が無い一方、超過分を買えないため、実運用ではなく API の接続確認や開発中のテストに向きます。

{{< fit spec >}}
向く: 開発中のテストや API の接続確認に、期限のない無料枠を使いたい
向かない: 実運用で、無料枠の上限を超えて送りたい（超過分を買えない）
{{< /fit >}}

- **料金体系**: 料金は表の「料金」列のとおりで、無料枠は開発者向けの位置づけです [9]
- **制約**: 無料枠は上限に達すると止まります。`POSTMARK_API_TEST` をトークンにすると、配信せずにリクエストの検証だけができます [10]
- **前提条件**: 申込み導線の文言は「Start Free Trial No Credit Card Required」です [9]
- **検証した内容**: 公式の料金ページと API ガイドを確認しました。アカウント作成が要るため実行していません

### Brevo

マーケティング配信とトランザクションメールの両方を持つサービスで、無料枠の日次の上限は 5 つで最も多くなっています。
5 つのうち唯一、アカウントを作っただけでは送れず、Brevo 側の承認を待つ工程が挟まります。

{{< fit spec >}}
向く: 日次で多めに送りたく、マーケティング配信や連絡先の管理も要る
向かない: アカウントを作ってすぐ送りたい。無料のままメール末尾のロゴを外したい
{{< /fit >}}

- **料金体系**: Starter の連絡先は 500 からです [11]
- **制約**: 承認の記述は料金ページの FAQ にあり、原文は「Once we approve your account for sending, you can start sending up to 300 emails per day.」です。
  「Sent with Brevo」のロゴは Free と Starter で付き、Standard 以上は除去が料金に込みです [11]
- **前提条件**: カード不要の記述は、料金カードの「Free forever, no credit card needed」と、FAQ の「Do I have to enter my credit card details to sign up? / No.」です [11]
- **検証した内容**: 公式の料金ページと FAQ を確認しました。承認の有無で API から送れるかが変わるため、実行区分にはアカウント作成と承認待ちが要ります

### Mailgun

送信・受信の両方を API で扱えるサービスです。
無料枠の日次の上限は Resend と同じですが、ログ保持が短く、送信ドメインの数も限られます。

{{< fit spec >}}
向く: ログは当日ぶんで足り、受信（inbound）も API で試したい
向かない: 配信結果を後日まとめて取り出したい。カード不要を公式の明記で確かめてから始めたい
{{< /fit >}}

- **料金体系**: 料金は表の「料金」列のとおりです [12]
- **制約**: ログ保持が短いため、配信結果は当日中に取り出す必要があります [12]
- **前提条件**: 表の「前提条件」列に載せた以外の条件は、料金ページにありません [12]
- **検証した内容**: 公式の料金ページを確認しました。カード要否は実際に登録しないと判定できないため、実行していません

### Amazon SES

AWS の従量課金のメール送信サービスです。以前あった月次の無料送信枠は料金ページから消えており、
新規アカウント向けの期限付きクレジットだけが無料枠にあたります。

{{< fit spec >}}
向く: すでに AWS アカウントがあり、従量で大量に送りたい
向かない: 申請なしで、すぐに任意の宛先へ送りたい。恒常の無料枠で使い続けたい
{{< /fit >}}

- **料金体系**: 月次の無料送信枠は、2026-09-08 時点の料金ページに載っていません [13][14]
- **制約**: 新規アカウントはサンドボックスに置かれます。送れるのは、検証済みのアドレスかドメイン宛だけです [15]
- **前提条件**: 支払い方法の登録の要否は、AWS の無料利用枠の FAQ に書かれています [16]
- **検証した内容**: 公式の料金ページ、無料利用枠のページ、本番アクセス申請の docs を確認しました。アカウントの作成が要るため実行していません

## 用途別の選び方

上から順に答えていくと、条件に合う対象にたどり着きます。各分岐の決め手は比較表の列で、数字はそちらを見てください。

{{< svg src="email-api-free-tier-flow.svg" alt="用途別の判断フロー。カード登録なしで自分のドメインから API で送るなら Resend、開発用で月 100 通までなら Postmark、日 300 通まででマーケティング配信も要り承認待ちを受け入れるなら Brevo、日 100 通でログは当日ぶんで足り受信も試すなら Mailgun、すでに AWS アカウントがあり従量で大量に送るなら Amazon SES" caption="図: 用途別の判断フロー" >}}

- カード登録なしで、自分のドメインから API で送りたい → Resend。決め手は「前提条件」列と「無料枠」列です。
  日次の上限は、月次とは別に効きます
- 開発・テスト用で、上限で止まってよい → Postmark。決め手は「無料枠」列と「主な制約」列です。
  超過分を買えないので、上限を超える前に有料プランへ移るかを決めることになります
- 日次で多めに送りたい。連絡先の管理も要る。送信前の承認待ちを受け入れられる → Brevo。決め手は「無料枠」列と「主な制約」列です。
  フッターのロゴ除去は有料です
- ログは当日ぶんで足りる。受信（inbound）も試したい → Mailgun。決め手は「主な制約」列と「前提条件」列です。
  カード要否は公式に記載がありません
- すでに AWS アカウントがあり、従量で大量に送る → Amazon SES。決め手は「料金」列と「主な制約」列です。
  サンドボックス解除の申請を通した後は、5 つで最も安い従量単価になります

通知メールの送り先として使う場面は、[死活監視の無料枠比較](/posts/uptime-monitoring-free-tier/)で扱った監視サービスの通知や、
[静的サイトの無料ホスティング比較](/posts/static-site-hosting-free-tier/)で扱ったサイトの問い合わせフォームです。
どちらも送信量は日 100 通に収まるため、この記事の無料枠の範囲で足ります。
購読者への一斉配信（ニュースレター）は用途が違い、[海外のニュースレター配信サービス 5 つの無料枠比較](/posts/newsletter-free-tier/)で扱っています。
国内の事業者向けに円建てで一斉配信を扱うサービスは、[国内のメール配信システム 5 つの比較](/posts/bulk-email-japan/)で比べています。
Brevo は両方に出ますが、あちらは Marketing Platform のキャンペーン配信として見ています。

## よくある質問

### クレジットカードなしで使えるメール送信 API は？

Resend は、利用規約が Free Tier について「billing information を求めない」と明記しています [2]。
Postmark は申込み導線に「No Credit Card Required」、Brevo は料金ページと FAQ にカード不要とあります [9][11]。
Mailgun はカード要否の記載が公式に無く、Amazon SES は新規の多くが支払い方法の登録不要ですが、本人確認で求められる場合があります [12][16]。

### 無料枠で何通まで送れますか？

Resend は月 3,000 通・日 100 通で、日次の上限が月次とは別に効きます [1][3]。Postmark は月 100 通、Brevo は日 300 通、Mailgun は日 100 通です [9][11][12]。
Amazon SES は恒常の無料枠が無く、新規アカウント向けに最大 USD 200 のクレジットがあります [13][14]。

### Amazon SES は申請なしで送れますか？

新規アカウントはサンドボックスに置かれ、検証済みの宛先にしか送れず、24 時間で 200 通・毎秒 1 通に制限されます [15]。
ほかの宛先へ送るには本番アクセス申請が要り、用途と website URL を申告します。初回応答までは 24 時間とされています [15]。

### 無料枠の上限を超えるとどうなりますか？

Resend は 429 を返し、日次は `daily_quota_exceeded`、月次は `monthly_quota_exceeded` とエラーが分かれています [5]。
Postmark の無料枠は「No overages allowed in this plan」で、上限に達すると止まります [9][10]。

## 出典

1. [Resend Pricing](https://resend.com/pricing) — 2026-10-03 確認
2. [Resend Terms of Service](https://resend.com/legal/terms-of-service) — 2026-10-03 確認
3. [Resend Docs — Account quotas and limits](https://resend.com/docs/knowledge-base/account-quotas-and-limits) — 2026-10-03 確認
4. [Resend Docs — Rate limit](https://resend.com/docs/api-reference/rate-limit) — 2026-10-03 確認
5. [Resend Docs — Errors](https://resend.com/docs/api-reference/errors) — 2026-10-03 確認
6. [Resend Docs — Add a domain](https://resend.com/docs/add-a-domain) — 2026-10-03 確認
7. [Resend Docs — Create API key](https://resend.com/docs/api-reference/api-keys/create-api-key) — 2026-10-03 確認
8. [Resend Docs — Create domain](https://resend.com/docs/api-reference/domains/create-domain) — 2026-10-03 確認
9. [Postmark Pricing](https://postmarkapp.com/pricing) — 2026-10-03 確認
10. [Postmark Developer — Send email with API](https://postmarkapp.com/developer/user-guide/send-email-with-api) — 2026-10-03 確認
11. [Brevo Pricing](https://www.brevo.com/pricing/) — 2026-10-03 確認
12. [Mailgun Pricing](https://www.mailgun.com/pricing/) — 2026-10-03 確認
13. [Amazon SES Pricing](https://aws.amazon.com/ses/pricing/) — 2026-10-03 確認
14. [AWS Free Tier](https://aws.amazon.com/free/) — 2026-10-03 確認
15. [Amazon SES Developer Guide — Request production access](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html) — 2026-10-03 確認
16. [AWS Free Tier FAQs](https://aws.amazon.com/free/free-tier-faqs/) — 2026-10-03 確認
