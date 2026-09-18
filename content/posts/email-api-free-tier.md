+++
title = 'メール送信 API 5 つの無料枠比較: 無料で送れるまでのゲート'
date = '2026-09-08T21:25:18+09:00'
lastmod = '2026-09-08'
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
無料でカード登録なしに、自分のドメインから API で送りたいなら Resend で決まります。
Free Tier に期限が無く、送信ドメインの登録から DNS レコードの取得、送信、削除までが API だけで閉じます。
ただ、開発中のテスト用途で月 100 通あれば足りるなら Postmark、日 300 通まで送りたくマーケティング配信も要るなら Brevo が条件に合います。
Amazon SES は恒常の無料枠が無く、サンドボックスの解除申請とカード登録が要るため、すでに AWS を使っている場合の選択肢です。

## 比較表

2026-09-08 時点の公式情報に基づきます。出典は末尾の番号に対応しています。
料金は個人が申し込める最小のプランで揃え、通貨は各社の料金ページの表記（USD または円）のままです。

| 対象 | 料金 | 無料枠 | 主な制約 | 前提条件 | 検証区分 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| Resend | Free Tier（USD 0）。有料は Pro USD 20/月（月 5 万通）から | 月 3,000 通・**日 100 通**、送信ドメイン 3、データ保持 30 日。マーケティングは連絡先 1,000 まで | 日次の上限が月次と別に効き、超過は 429（`daily_quota_exceeded`）。API は 10 リクエスト/秒。送信ドメインの認証（DKIM の TXT と Return-Path の MX / TXT）が要る | アカウントのみ。Free Tier は「billing information を求めない」と利用規約に明記。API キーは full access と sending access の 2 種で、ドメイン限定もできる | {{< verified run >}} | [1][2][3][4][5][6][7] |
| Postmark | 開発者向けの無料枠（USD 0）。有料は Basic USD 15/月（月 1 万通、超過 USD 1.80/1,000 通）から | **月 100 通**。「never expires or runs out」と明記 | 無料枠での超過送信は不可（「No overages allowed in this plan」）。送信元は確認済みの Sender Signature か認証済みドメインに限られ、未確認だと 422 | アカウントのみ。申込み導線に「No Credit Card Required」。API は `X-Postmark-Server-Token` ヘッダーで認証 | {{< verified spec >}} | [9][10] |
| Brevo | Free（USD 0）。有料は Starter 月額 1,140 円（年払いで 1,026 円）・月 5,000 通から | **日 300 通**。「Free forever, no credit card needed」 | 送信の解禁に Brevo 側のアカウント承認が挟まる（「Once we approve your account for sending」）。メール末尾の「Sent with Brevo」の除去は有料（Starter で月 1,125 円の追加） | アカウントのみ。カード不要と料金ページと FAQ の両方に明記。承認の基準と所要時間は公式に記載なし | {{< verified spec >}} | [11] |
| Mailgun | Free（USD 0）。有料は Basic USD 15/月（月 1 万通）から | **日 100 通**、カスタム送信ドメイン 1、API キー 2、inbound route 1 | **ログ保持 1 日**。ドメインは 1 本のみ。Foundation / Scale の「Free for 1 month」は Free プランとは別のトライアル | アカウントのみ。カード要否は料金ページにも FAQ にも記載が無く、公式には確認できない | {{< verified spec >}} | [12] |
| Amazon SES | 従量。送信 USD 0.10/1,000 通（添付 USD 0.12/GB）、受信 USD 0.10/1,000 通 | 恒常の無料枠は無し。新規アカウント向けに最大 USD 200 のクレジット（Free プランは開設から 6 か月、クレジットは 12 か月で失効） | **サンドボックス**: 検証済みの宛先にしか送れず、24 時間で 200 通・毎秒 1 通。解除には本番アクセス申請（用途と website URL の申告、初回応答 24 時間） | AWS アカウント。開設に支払い方法の登録が要る。送信元のドメインかアドレスの検証が要る | {{< verified spec >}} | [13][14][15] |

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
- 「無料枠」の単位が 3 通りに割れています。月次（Resend 3,000・Postmark 100）、日次（Brevo 300・Mailgun 100。Resend は日 100 が月次と併存）、
  期限付きクレジット（Amazon SES の USD 200）です。棒グラフは日次の上限が公式にあるものだけに絞りました
- Free Tier と Free Trial は分けています。Resend の利用規約は Free Tier に「billing information を求めない」と書く一方で、
  Free Trial は「求めることがある」と別条件にしています。Mailgun の「Free for 1 month」も Free プランとは別のトライアルです
- 検証は Resend だけに行いました。他 4 つはアカウント作成が要るため、公式ページの確認にとどめています。
  検証の手順は (1) API キーを非対話で使う (2) 送信ドメインを登録して DNS レコードを取得し、Cloudflare の API で登録する (3) 認証前・認証後に 1 通ずつ送る (4) 上限のエラーを記録する (5) ドメイン・DNS レコード・API キーを消す、の 5 つです。
  宛先アドレスと API キーの値は記事にもログにも出していません
- API キーを CI や AI エージェントに渡す手段は、[シークレット管理 CLI 6 つの比較](/posts/secret-management-cli/)で比べています。
  この記事の検証でも、そこで扱った `op run` で API キーを注入しています。
  「無料枠が恒常か、一回きりか」という同じ見方で、[スクレイピング API 5 つの無料枠比較](/posts/scraping-api-free-tier/)も書いています

## 各対象の詳細

### Resend

開発者向けのメール送信 API で、ドメイン・API キー・送信・イベントのすべてが REST API と公式 SDK から扱えます。
5 つのうち、無料枠に期限が無く、カード登録が不要であることを利用規約で確認でき、AI が送信ドメインの登録から削除まで動かせたのは Resend だけです。

- **料金体系**: Free Tier は USD 0 で、月 3,000 通・日 100 通・送信ドメイン 3 つまでです。有料は Pro USD 20/月（月 5 万通、ドメイン 10）からで、
  マーケティング配信は連絡先の数で別料金です [1][3]
- **制約**: 日次の上限が月次とは別に効きます。超過は 429 で、`daily_quota_exceeded` と `monthly_quota_exceeded` が分かれています [5]。
  API はチーム単位で 10 リクエスト/秒で、超過は 429 `rate_limit_exceeded` と `ratelimit-*` ヘッダーで返ります [4]。
  データ保持は 30 日です。送信ドメインは DKIM の TXT と、Return-Path 用サブドメインの MX / TXT を DNS に置いて認証します。
  公式はルートドメインでなくサブドメインからの送信を推奨し、認証は「多くは 15 分以内」と書いています [6]
- **前提条件**: アカウントのみです。利用規約が Free Tier について「You are not required to provide billing information to use the Free Tier.」と明記しています [2]。
  API キーは `full_access`（「Can create, delete, get, and update any resource」）と `sending_access`（「Can only send emails」）の 2 種で、
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
月 100 通の枠に期限が無い一方、超過分を買えないため、実運用ではなく API の接続確認や開発中のテストに向きます。

- **料金体系**: 無料枠は USD 0 で月 100 通です。有料は Basic USD 15.00/月（月 1 万通から）で、超過は USD 1.80/1,000 通です [9]
- **制約**: 無料枠は「No overages allowed in this plan」で、100 通に達すると止まります。送信元は確認済みの Sender Signature か認証済みドメインに限られ、
  未確認のアドレスから送ると 422 が返ります。`POSTMARK_API_TEST` をトークンにすると、配信せずにリクエストの検証だけができます [10]
- **前提条件**: アカウントのみで、申込み導線に「Start Free Trial No Credit Card Required」とあります。API は `X-Postmark-Server-Token` ヘッダーで認証します [9][10]
- **検証した内容**: 公式の料金ページと API ガイドを確認しました。アカウント作成が要るため実行していません

### Brevo

マーケティング配信とトランザクションメールの両方を持つサービスで、無料枠は日 300 通です。
5 つのうち唯一、アカウントを作っただけでは送れず、Brevo 側の承認を待つ工程が挟まります。

- **料金体系**: Free は USD 0 で日 300 通です。有料は Starter 月額 1,140 円（年払いで 1,026 円）・月 5,000 通・連絡先 500 からです [11]
- **制約**: 料金ページの FAQ が「Once we approve your account for sending, you can start sending up to 300 emails per day.」と書いており、
  送信の解禁にアカウント承認が要ります。承認の基準と所要時間は公式に記載がありません。
  Free と Starter ではメール末尾に「Sent with Brevo」のロゴが付き、除去は Starter で月 1,125 円の追加、Standard 以上で込みです [11]
- **前提条件**: アカウントのみで、「Free forever, no credit card needed」と料金カードにあり、FAQ でも「Do I have to enter my credit card details to sign up? / No.」と明記しています [11]
- **検証した内容**: 公式の料金ページと FAQ を確認しました。承認の有無で API から送れるかが変わるため、実行区分にはアカウント作成と承認待ちが要ります

### Mailgun

送信・受信の両方を API で扱えるサービスで、Free プランは日 100 通です。
数字だけ見ると Resend の日次上限と同じですが、ログ保持が 1 日で、送信ドメインが 1 本に限られます。

- **料金体系**: Free は USD 0 で日 100 通です。有料は Basic USD 15/月（月 1 万通込み）からで、Foundation / Scale には「Free for 1 month」のトライアルが付きます [12]
- **制約**: ログ保持が 1 日のため、配信結果は当日中に取り出す必要があります。カスタム送信ドメインは 1 本、API キーは 2 つ、inbound route は 1 つまでです [12]
- **前提条件**: アカウントのみです。ただしカード要否は料金ページにも FAQ にも記載が無く、公式には確認できませんでした [12]
- **検証した内容**: 公式の料金ページを確認しました。カード要否は実際に登録しないと判定できないため、実行していません

### Amazon SES

AWS の従量課金のメール送信サービスです。以前あった月次の無料送信枠は 2026-09-08 時点の料金ページから消えており、
新規アカウント向けの期限付きクレジットだけが無料枠にあたります。

- **料金体系**: 送信 USD 0.10/1,000 通（添付 USD 0.12/GB）、受信 USD 0.10/1,000 通の従量です。
  新規アカウントには最大 USD 200 のクレジットが付き、Free プランは開設から 6 か月、クレジットは 12 か月で失効します [13][14]
- **制約**: 新規アカウントはサンドボックスに置かれ、検証済みのアドレスかドメイン宛にしか送れず、24 時間で 200 通・毎秒 1 通に制限されます。
  解除には本番アクセス申請が要り、用途と website URL の申告、初回応答まで 24 時間とされています [15]
- **前提条件**: AWS アカウントの開設に支払い方法の登録が要ります。送信元のドメインかメールアドレスの検証が要ります [14][15]
- **検証した内容**: 公式の料金ページ、無料利用枠のページ、本番アクセス申請の docs を確認しました。カード登録が要るため実行していません

## 用途別の選び方

上から順に答えていくと、条件に合う対象にたどり着きます。各分岐の根拠は下の箇条書きと比較表の列に書いています。

{{< svg src="email-api-free-tier-flow.svg" alt="用途別の判断フロー。カード登録なしで自分のドメインから API で送るなら Resend、開発用で月 100 通までなら Postmark、日 300 通まででマーケティング配信も要り承認待ちを受け入れるなら Brevo、日 100 通でログは当日ぶんで足り受信も試すなら Mailgun、すでに AWS アカウントがあり従量で大量に送るなら Amazon SES" caption="図: 用途別の判断フロー" >}}

- カード登録なしで、自分のドメインから API で送りたい。日 100 通で足りる → Resend。「前提条件」列のとおり利用規約でカード不要が確定していて、
  「検証した内容」のとおりドメイン登録から削除まで API で閉じます。ただし「主な制約」列の日 100 通は月 3,000 通とは別に効きます
- 開発・テスト用で、送るのは月 100 通まで。上限で止まってよい → Postmark。「無料枠」列の月 100 通に期限が無く、
  「主な制約」列のとおり超過分を買えないので、上限を超える前に有料プランへ移るかを決めることになります
- 日 300 通まで送りたい。連絡先の管理も要る。送信前の承認待ちを受け入れられる → Brevo。「無料枠」列の日 300 通は 5 つで最も多い一方、
  「主な制約」列のとおり承認が挟まり、フッターのロゴ除去は有料です
- 日 100 通でよく、ログは当日ぶんで足りる。受信（inbound）も試したい → Mailgun。「主な制約」列のログ保持 1 日と、
  「前提条件」列のカード要否が公式に無いことを受け入れられるかが分かれ目です
- すでに AWS アカウントがあり、従量で大量に送る → Amazon SES。「主な制約」列のサンドボックス解除の申請を通した後は、
  5 つで最も安い従量単価になります

通知メールの送り先として使う場面は、[死活監視の無料枠比較](/posts/uptime-monitoring-free-tier/)で扱った監視サービスの通知や、
[静的サイトの無料ホスティング比較](/posts/static-site-hosting-free-tier/)で扱ったサイトの問い合わせフォームです。
どちらも送信量は日 100 通に収まるため、この記事の無料枠の範囲で足ります。
購読者への一斉配信（ニュースレター）は用途が違い、[ニュースレター配信サービス 5 つの無料枠比較](/posts/newsletter-free-tier/)で扱っています。
Brevo は両方に出ますが、あちらは Marketing Platform のキャンペーン配信として見ています。

## 出典

1. [Resend Pricing](https://resend.com/pricing) — 2026-09-08 確認
2. [Resend Terms of Service](https://resend.com/legal/terms-of-service) — 2026-09-06 確認
3. [Resend Docs — Account quotas and limits](https://resend.com/docs/knowledge-base/account-quotas-and-limits) — 2026-09-08 確認
4. [Resend Docs — Rate limit](https://resend.com/docs/api-reference/rate-limit) — 2026-09-08 確認
5. [Resend Docs — Errors](https://resend.com/docs/api-reference/errors) — 2026-09-08 確認
6. [Resend Docs — Add a domain](https://resend.com/docs/add-a-domain) — 2026-09-08 確認
7. [Resend Docs — Create API key](https://resend.com/docs/api-reference/api-keys/create-api-key) — 2026-09-08 確認
8. [Resend Docs — Create domain](https://resend.com/docs/api-reference/domains/create-domain) — 2026-09-08 確認
9. [Postmark Pricing](https://postmarkapp.com/pricing) — 2026-09-08 確認
10. [Postmark Developer — Send email with API](https://postmarkapp.com/developer/user-guide/send-email-with-api) — 2026-09-08 確認
11. [Brevo Pricing](https://www.brevo.com/pricing/) — 2026-09-08 確認
12. [Mailgun Pricing](https://www.mailgun.com/pricing/) — 2026-09-08 確認
13. [Amazon SES Pricing](https://aws.amazon.com/ses/pricing/) — 2026-09-08 確認
14. [AWS Free Tier](https://aws.amazon.com/free/) — 2026-09-08 確認
15. [Amazon SES Developer Guide — Request production access](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html) — 2026-09-08 確認
