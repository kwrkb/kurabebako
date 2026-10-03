+++
title = '海外のニュースレター配信サービス 5 つの無料枠比較: カード登録なしで API から配信できるのはどれか'
date = '2026-09-15T00:04:33+09:00'
lastmod = '2026-09-27'
draft = false
summary = '海外のニュースレター配信サービス Buttondown・Kit・MailerLite・beehiiv・Brevo を、無料プランを主役に、無料枠の単位が購読者数か配信通数か、カード登録なしで始められるか、無料プランで API から配信まで届くかで比較。Free で API の全機能が使え、購読者の登録から配信・解除・削除まで API だけで閉じたのは Buttondown で、AI や CI に配信を任せるなら Buttondown が条件を満たす。無料で持てる購読者数を最大にするなら Kit。国内の事業者を円建ての有料プランで比べた記事は別にある。'
categories = ['developer-tools']
tags = ['newsletter', 'buttondown', 'kit', 'mailerlite', 'beehiiv', 'brevo']
# OGP 用の画像。本文と一覧には出さない（hidden）。生成は desk の images/
[cover]
  image = '/images/og/newsletter-free-tier.jpg'
  alt = '海外のニュースレター配信サービスの無料枠比較'
  hidden = true
  hiddenInList = true
+++

## 結論

購読者を集めて定期的にメールを配信する海外のニュースレター配信サービス 5 つを、無料プランを主役に、「無料枠の単位が購読者数か配信通数か」「カード登録なしで始められるか」「無料プランで API から配信まで届くか」の 3 点で比べました。

- **AI や CI に、購読者の登録から配信・解除まで任せたい** → Buttondown。Free でも API の全機能が使え、送信前の審査を通れば API だけで一巡が閉じます
- **無料で持てる購読者数を最大にしたい** → Kit。無料の購読者の上限は 5 つで最も多く、配信通数も無制限で、API キーも全プランで発行できます
- **API からの送信は要らず、フォームや連絡先の数で選びたい** → MailerLite・beehiiv・Brevo。
  MailerLite は Free だと API から送れず、beehiiv は送信の API が有料の Pro 以上で、Brevo は通数制で送信の解禁に承認が挟まります

| こういう条件なら | 対象 | 決め手 |
| --- | --- | --- |
| AI や CI に、購読者の登録から配信・解除まで API で任せたい | Buttondown | 「前提条件」列（Free を含む全プランで API キー）と「主な制約」列（送信前の審査） |
| 無料で持てる購読者数を最大にしたく、API でも送りたい | Kit | 「無料枠」列（5 つで最も多い購読者数）と「前提条件」列（API キーは全プラン） |
| フォームや自動化を無料で多く使いたく、API からの送信は要らない | MailerLite | 「無料枠」列（自動化とフォームの数）と「主な制約」列（Free の API は送信を含まない） |
| 無料でカスタムドメインを使いたく、本人確認を受け入れられる | beehiiv | 「無料枠」列（カスタムドメイン可）と「前提条件」列（API キーの発行に本人確認） |
| 購読者数ではなく通数で数え、連絡先を多く持ちたい | Brevo | 「無料枠」列（日次の通数制）と「主な制約」列（送信前にアカウント承認） |

国内の事業者を円建て・日本語の画面で、有料プランを主役に比べた記事は[国内のメール配信システム 5 つの比較](/posts/bulk-email-japan/)です。
会社名や屋号での申込や、日本語のサポートが条件ならそちらを見てください。

## 比較表

2026-09-13 時点の公式情報に基づきます。出典は末尾の番号に対応しています。
料金は個人が申し込める最小のプランで揃え、通貨は各社の料金ページの表記のままです（Brevo のみ円建て）。対象名を押すと、その対象の詳細に移ります。

| 対象 | 料金 | 無料枠 | 主な制約 | 前提条件 | 検証区分 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| [Buttondown](#buttondown) | Free（USD 0）。有料は購読者 100 超で購読者数に応じた従量。タグ・セグメントは +USD 9/月、自動化は +USD 29/月 などのアドオン制 | **購読者 100 まで**。配信通数の上限は無いが、料金は「全購読者への配信が 1 日 1 回まで」を前提に組まれている | API は全体で 600 回/分、購読者の作成は 100 回/日（超過はそれぞれ 429 / 400）。新規アカウントは**送信前に審査**（通常 1〜3 営業日。審査中は下書き可、送信・購読者の収集・公開アーカイブの閲覧は不可）。フッターの「Powered by Buttondown」の除去は有料アドオン | アカウントのみ。登録画面に「No credit card required」。API キーは Free を含む全プランで発行でき、キーごとに `email_access` / `sending_access` を分けられる。API から送るには初回に `X-Buttondown-Live-Dangerously: true` ヘッダーが要る | {{< verified run >}} | [1][2][3][4][5][6] |
| [Kit（旧 ConvertKit）](#kit旧-convertkit) | Newsletter Plan（USD 0）。有料は Creator USD 33/月（購読者 1,000）、Pro USD 66/月から | **購読者 10,000 まで**。配信通数は無制限。フォームとランディングページは無制限、自動化 1 本とシーケンス 1 本 | API キーは 120 回/60 秒（OAuth アプリは 600）。購読者は API で解除できるが削除はできない。フッターの「Built with Kit」の除去は Creator 以上で、運営者住所を設定しないと Kit 社の住所が入る | アカウントのみ。料金ページに「No credit card required」。API キーは全プランで発行でき、ヘッダー `X-Kit-Api-Key` で渡す。送信前の審査は公式ページに記載なし | {{< verified run >}} | [9][10][11][12][13] |
| [MailerLite](#mailerlite) | Free（USD 0）。有料は Comfort USD 12/月（月間通数は購読者枠の 10 倍）、Power USD 25/月（通数無制限）から | **購読者 250 まで、月 2,500 通**。自動化 3、フォーム 3、ランディングページ 1、サイト 1、ユーザー 2 | Free の API は制限付きで**送信を含まない**（「Email sending via the API and MCP server is available on paid plans」）。API は全体 120 回/分、インポート系 5 回/分。購読者が 250 を超えると API 経由の追加も止まる | アカウントのみ。料金ページに「No credit card required」。登録後 14 日間はプレミアム機能のトライアル。API は Bearer トークン | {{< verified spec >}} | [14][15][16][17] |
| [beehiiv](#beehiiv) | Free（USD 0）。有料は Lite USD 49/月、Pro USD 95/月から（年払い時。月払いは 59 / 109。購読者上限は Lite 100,000、Pro 250,000） | **購読者 2,500 まで**。配信通数は無制限。カスタムドメイン可 | API は **Send API を除いて**利用可。Send API と Create post は Pro 以上。Free は 30 回/分（API キー単位） | アカウントのみ（メール認証と電話番号認証）。料金ページに「no credit card required」。**API キーの発行に Stripe Identity での本人確認**と Admin 権限が要る | {{< verified spec >}} | [18][19][20][21][22][23] |
| [Brevo（Marketing Platform）](#brevomarketing-platform) | Free（USD 0）。有料は Starter 月額 1,140 円から（ロゴ除去は Starter だとアドオン） | **日 300 通**（毎日リセット、繰り越しなし）。連絡先は 100,000 件まで保存でき、自動化に入れる連絡先は 2,000 まで。ユーザー 1 | 送信の解禁に Brevo 側の**アカウント承認**が挟まる。300 通を超えるキャンペーンは残りを翌日以降に再送。Free では「Sent with Brevo」を外せない | アカウントのみ。料金ページに「No credit card required」。API キーを `api-key` ヘッダーで渡し、`POST /v3/emailCampaigns` でキャンペーンを作る | {{< verified spec >}} | [24][25][26][27] |

{{< bars unit="購読者" caption="無料で持てる購読者数の上限。Brevo は購読者数ではなく日 300 通の通数制（連絡先は 100,000 件まで保存可）のため載せていない" >}}
Buttondown Free: 100
MailerLite Free: 250
beehiiv Free: 2500
Kit Newsletter Plan: 10000
{{< /bars >}}

## 比較の前提

- 対象に含めたもの: 公式の料金ページで無料枠の数字を確認でき、購読者の登録・メールの作成・配信を API から行える 5 つです。
  Buttondown は個人の書き手向けで API を前面に出したサービス、Kit と MailerLite と beehiiv はフォーム・ランディングページ・自動化まで含む配信基盤、
  Brevo はトランザクション送信も同じアカウントで扱うマーケティング基盤で、役割が少しずつ違います
- 除外したもの: EmailOctopus は無料枠（購読者 2,500・月 10,000 通）とカード不要の条件は揃いますが、API v2 のキャンペーンが取得のみで作成と送信のエンドポイントが無く、
  「API で配信まで届くか」の軸で比べられないため外しました [28]
- 検証区分の意味: {{< verified run >}} = AI が実際に動かして確認した / {{< verified spec >}} = 公式ドキュメントで確認したのみ
- 料金表記の注意: 金額は各社の料金ページの表記のままです。
  Buttondown の料金は購読者数で決まりますが、料金ページは「全購読者への配信が 1 日 1 回まで」を前提に組まれていると明記しています [1]。
  1 日に何通も送る用途では、この前提を「主な制約」として読むことになります
- 選び方の軸: 「無料枠」列は、単位が購読者数（Buttondown・Kit・MailerLite・beehiiv）と 1 日の配信通数（Brevo）に割れています。
  棒グラフは購読者数で数える 4 つだけを並べ、Brevo は外しています。MailerLite は購読者数に加えて月の通数上限も持ちます。
  「主な制約」列は、「API がある」と「API で送れる」が一致しない点が分かれ目です。5 つとも API を持ちますが、無料プランで送信まで API から行えるのは Buttondown・Kit・Brevo の 3 つで、
  MailerLite は Free だと API 送信が塞がれ、beehiiv は Send API が Pro 以上です。
  「前提条件」列と「主な制約」列は、送信までに人間のゲートがあるかでも分かれます。beehiiv は API キーの発行前に Stripe Identity での本人確認、Buttondown は送信前の審査、Brevo は送信前のアカウント承認です。
  Kit と MailerLite は登録だけで API キーを発行できます。AI に任せる場合、ゲートの前までは AI が進められ、ゲート自体は利用者が越えることになります
- 検証の手順: Buttondown と Kit に 2026-09-13 に行いました。MailerLite・beehiiv・Brevo は公式ページの確認にとどめています。
  手順は (A) API キーを非対話で使い、アカウント情報とレート制限のヘッダーを記録する (B) 下書きを作成 → 取得 → 編集 → 削除の順に一巡する (C) 本人管理の宛先 1 件を購読者として登録 → 配信 → 受信箱への到達を確認 → 購読解除 → 作ったものを撤収する、の 3 段階です。
  Kit は新規登録で Creator プランの 14 日トライアル（カード未登録）に入るので、3 段階はその間に行いました。
  トライアル後に Free（Newsletter Plan）へ移った 2026-09-27 に (A) と (B) を再実行し、同じ結果を得ています。(C) の配信は Free では再実行していません。
  各社の結果は「各対象の詳細」の「検証した内容」に書いています
- この記事が扱うのは購読者への一斉配信（ニュースレター）です。登録確認や通知のような 1 通ずつのトランザクション送信は、
  [メール送信 API 5 つの無料枠比較](/posts/email-api-free-tier/)で比べています。Brevo は両方に出ますが、あちらは Transactional の送信、こちらは Marketing Platform のキャンペーン配信として見ています
- API キーを AI エージェントに渡す手段は、[シークレット管理 CLI 6 つの比較](/posts/secret-management-cli/)で比べています。
  この記事の検証でも、そこで扱った `op run` で API キーを注入します

## 各対象の詳細

### Buttondown

個人の書き手向けのニュースレター配信サービスで、無料を含む全プランで API を提供します。
5 つのうち、無料プランで購読者の登録から配信・解除・削除まで API だけで閉じることを実際に確認できたのは Buttondown だけです。

{{< fit run >}}
向く: AI や CI に、購読者の登録から配信・解除・削除まで API で任せたい
向かない: 登録してすぐ送りたい（送信前に審査がある）。全購読者へ日に何度も送りたい
{{< /fit >}}

- **料金体系**: 有料は、購読者数に応じた従量に、機能ごとのアドオンを足す形です [1]
- **制約**: 検証で届いたメールのフッターには、「Powered by Buttondown」と購読解除リンクが入りました
- **前提条件**: 登録画面の文言は「Get started for free. No credit card required.」です [2]。
  アカウント作成時の primary key は全権限で、削除できません [5]。
  `POST /emails` に `status: draft` を渡すと下書き、`about_to_send` に変えると送信です [7]。確認ヘッダーが要ることは、下の検証で確かめています
- **検証した内容**: 公式の料金ページと docs（審査・認証・レート制限・下書き・削除）を確認したうえで、2026-09-13 に Free のアカウントで「比較の前提」の 3 段階を実行しました。
  宛先は本人管理のアドレス 1 件です。

  | 操作 | 結果 |
  | --- | --- |
  | `GET /newsletters` | 200（1.0 秒）。`X-RateLimit-Limit: 600` と残数・リセット時刻のヘッダーが毎回付く |
  | `POST /emails`（`status: draft`）→ 取得 → `PATCH` → `DELETE` | 201 → 200 → 200 → 204。再取得は 404。応答は 0.9 秒前後で、DELETE だけ 2.9 秒。**審査中でも下書きの一巡は通る** |
  | `POST /subscribers` | 201。この呼び出しだけ `X-RateLimit-Limit: 100`（購読者作成の日次枠） |
  | `POST /emails`（`status: about_to_send`、ヘッダー無し） | **400** `sending_requires_confirmation`。本文は「requires the X-Buttondown-Live-Dangerously header. This is only required once per API key」 |
  | 同じ body に `X-Buttondown-Live-Dangerously: true` を付けて再送 | **201**。`GET /emails/{id}` は **11 秒後**に `status: sent`。宛先に到達 |
  | `PATCH /subscribers/{id}`（`type: unsubscribed`）→ `DELETE /subscribers/{id}`、`DELETE /emails/{id}` | 200 → 204 / 204。送信済みのメールも API で消せた [8]。終了時に購読者・メールとも 0 件 |

  審査の状態は API からは見えません。購読者の作成が 201 で通ったことから、審査は通っていると判断しています。サーバー側に残るのはアカウント自体だけです

### Kit（旧 ConvertKit）

フォーム・ランディングページ・自動化まで含むクリエイター向けの配信基盤で、無料の Newsletter Plan があります。
無料で持てる購読者数は 5 つで最も多く、API キーも全プランで発行できます。

{{< fit run >}}
向く: 無料で持てる購読者数を最大にしたく、API でも送りたい
向かない: 撤収のときに購読者を API で削除したい。無料のままフッターの表記を外したい
{{< /fit >}}

- **料金体系**: 料金は表の「料金」列のとおりです [9][10]
- **制約**: 応答にレート制限のヘッダーは付きません（下の検証）。
  検証で届いたメールのフッターには、「Built with Kit」と購読解除リンクに加えて、運営者住所として Kit 社の住所（Seattle）が入りました。
  Kit は運営者住所を設定しない場合に自社の住所で代替する仕様で、自分の住所を出したくない個人にはこの既定が利点になり、事業者は差し替えが要ります [9]
- **前提条件**: API キーについて、ヘルプに「V3 and V4 API keys are not restricted」とあります [11]。
  `POST /v4/broadcasts` は `send_at` を null にすると下書き、時刻を入れると予約または即時の送信です [13]
- **検証した内容**: 公式の料金ページとヘルプ・API リファレンスを確認したうえで、2026-09-13 に Creator の 14 日トライアル中のアカウント（カード未登録）で「比較の前提」の 3 段階を実行しました。
  宛先は本人管理のアドレス 1 件です。
  トライアルの期限（2026-09-27）が過ぎても、このアカウントは自動では Free に切り替わりませんでした。API の `plan_type` は `creator` のまま残り、
  ログインするとカードの登録かダウングレードかを選ぶ画面が出ました。ダウングレードを選んだ後に (A) と (B) を再実行しています（表の下 2 行）。

  | 操作 | 結果 |
  | --- | --- |
  | `GET /v4/account` | 200（1.4 秒）。レート制限のヘッダーは付かない |
  | `POST /v4/broadcasts`（`send_at: null`）→ 取得 → `PUT` → `DELETE` | 201 → 200 → 200 → 204。再取得は 404。応答は 1.3〜1.7 秒 |
  | `POST /v4/subscribers`（`state: active`） | 201。確認メールなしで `active` |
  | `POST /v4/broadcasts`（`send_at` = 現在時刻、`public: false`） | 201。`GET /v4/broadcasts/{id}/stats` の `recipients` が 1 になるまで**約 2 分 40 秒**。宛先に到達 |
  | `POST /v4/subscribers/{id}/unsubscribe` | 204。再取得で `state: cancelled`。削除はできず、購読者と送信済み broadcast はアカウントに残る |
  | Free に移行後の `GET /v4/account`（2026-09-27） | 200。`plan_type: free`、`subscriber_limit: 10000` |
  | Free に移行後の下書きの一巡（2026-09-27） | 201 → 200 → 200 → 204。再取得は 404。応答は 1.3〜1.6 秒で、トライアル中と変わらない |

  送信の反映は Buttondown（11 秒）より遅く、撤収で消せないものが残ります。`public: false` でも `public_url` が付きますが、一覧には出ない前提です

### MailerLite

フォーム・ランディングページ・自動化を Free でも複数持てる配信基盤で、無料枠は購読者数と月の配信通数の両方で数えます。
API は Free でも使えますが、送信は含まれません。

{{< fit spec >}}
向く: フォームや自動化を無料で多く使いたく、API からの送信は要らない
向かない: 無料プランのまま、API から配信まで閉じたい
{{< /fit >}}

- **料金体系**: 料金は表の「料金」列のとおりです [14][15]
- **制約**: 料金表の「MailerLite API」行は Free が Limited で、表に引いた文の続きは「On Free, API and MCP access is limited and doesn't include sending.」です [14]
- **前提条件**: API にはキャンペーンの作成・予約・削除のエンドポイントがあります。送信元は認証済みのアドレスに限られます [17]
- **検証した内容**: 公式の料金ページ・ヘルプ・API ドキュメントを確認しました。アカウントの作成が利用者の操作になるため、実行は次回の更新に回しています。
  実行に上げる場合は、下書きの一巡と、Free で API 送信を試みたときの拒否コードを記録します

### beehiiv

無料でカスタムドメインも使える配信基盤で、無料で持てる購読者数では Kit に次ぎます。
ただ、API キーの発行に本人確認が要り、送信の API は有料の Pro 以上です。

{{< fit spec >}}
向く: 無料でカスタムドメインを使い、API では購読者の管理まで行えれば足りる
向かない: 本人確認なしで API キーを発行したい。無料のまま API から配信したい
{{< /fit >}}

- **料金体系**: 有料プランの購読者の上限は段階制です [18][19]
- **制約**: 料金ページの API の項目は「API Access (excluding Send API)」で、Send API と Create post は「Available on beehiiv Pro and Enterprise plans」です [18][21]
- **前提条件**: 料金ページの文言は「free, forever, with no credit card required」です [18]。
  API キーの発行の条件は「you must first complete your account verification through Stripe Identity Verification」と書かれています [20]
- **検証した内容**: 公式の料金ページ・ヘルプ・開発者ドキュメントを確認しました。本人確認が利用者の操作になるため、実行は次回の更新に回しています。
  本人確認を済ませても Send API は Pro 以上なので、実行に上げられるのは購読者の登録・解除までです

### Brevo（Marketing Platform）

トランザクション送信とキャンペーン配信を同じアカウントで扱うマーケティング基盤で、無料枠は購読者数ではなく 1 日の配信通数で数えます。
連絡先は多く保存でき、送信の解禁に承認が挟まります。

{{< fit spec >}}
向く: 購読者数ではなく通数で数え、連絡先を多く持ちたい。承認待ちを受け入れられる
向かない: 登録してすぐ送りたい。大きなリストへ同じ日のうちに配り切りたい
{{< /fit >}}

- **料金体系**: 料金は表の「料金」列のとおりです [25]
- **制約**: 無料枠の上限と再送の扱いは、ヘルプの FAQ に書かれています [24]。承認の文言は「Once we approve your account for sending」です [25]
- **前提条件**: 表の「前提条件」列に載せた以外の条件は、料金ページにありません [25]
- **検証した内容**: 公式の料金ページ・ヘルプ・API ドキュメントを確認しました。承認のゲートは[メール送信 API 5 つの無料枠比較](/posts/email-api-free-tier/)で扱ったものと同じで、
  承認が通れば実行に上げられます

## 用途別の選び方

上から順に答えていくと、条件に合う対象にたどり着きます。各分岐の決め手は比較表の列で、数字はそちらを見てください。

{{< svg src="newsletter-free-tier-flow.svg" alt="用途別の判断フロー。AI や CI に購読者の登録から配信・解除まで API で任せたくカード登録なしで始めたいなら Buttondown、無料で持てる購読者数を最大にしたく API でも送りたいなら Kit、フォームや自動化を無料で多く使いたく API 送信は要らないなら MailerLite、購読者 2,500 まで無料でカスタムドメインを使いたく本人確認を受け入れられるなら beehiiv、購読者数ではなく通数で数え連絡先を多く持ち承認待ちを受け入れられるなら Brevo" caption="図: 用途別の判断フロー" >}}

- AI や CI に、購読者の登録から配信・解除まで API で任せたい。カード登録なしで始めたい → Buttondown。決め手は「前提条件」列です。
  送信前の審査と、初回の確認ヘッダーは利用者側で越えることになります
- 無料で持てる購読者数を最大にしたい。API でも送りたい → Kit。決め手は「無料枠」列と「前提条件」列です。
  購読者を API で削除できない点と、運営者住所の既定値に注意が要ります
- フォームや自動化を無料で多く使いたい。API からの送信は要らない → MailerLite。決め手は「無料枠」列と「主な制約」列です。
  月の通数上限も、購読者数とは別に効きます
- 無料でカスタムドメインを使って配信したい。本人確認を受け入れられる → beehiiv。決め手は「前提条件」列と「主な制約」列です。
  AI に任せられるのは購読者の管理までです
- 購読者数ではなく通数で数えたい。連絡先を多く持ち、送信前の承認待ちを受け入れられる → Brevo。決め手は「無料枠」列と「主な制約」列です。
  トランザクション送信と同じアカウントで扱えます

購読フォームを置く先は、[静的サイトの無料ホスティング比較](/posts/static-site-hosting-free-tier/)で扱ったホスティングです。
登録確認や通知のような 1 通ずつの送信は、[メール送信 API 5 つの無料枠比較](/posts/email-api-free-tier/)の範囲です。
国内の事業者が円建て・日本語の画面で始める一斉配信（Benchmark Email 日本語版・ブラストメール・める配くんなど）は、
[国内のメール配信システム 5 つの比較](/posts/bulk-email-japan/)で扱っています。

## よくある質問

### 無料プランで、API から配信までできますか？

5 つのうち、無料プランで送信まで API から行えるのは Buttondown・Kit・Brevo の 3 つです [7][13][27]。
MailerLite は Free の API が送信を含まず [14]、beehiiv の Send API は Pro 以上です [21]。
Buttondown は Free のアカウントで、Kit は Creator のトライアル中のアカウントで、購読者の登録から配信・解除まで API で通ることを確かめています。

### クレジットカードなしで始められますか？

5 つとも、料金ページか登録画面に「No credit card required」の記載があります [2][9][14][18][25]。
ただし beehiiv は登録時にメール認証と電話番号認証があり、API キーの発行には Stripe Identity での本人確認が要ります [20][22]。

### 無料で何人の購読者まで持てますか？

Kit が 10,000、beehiiv が 2,500、MailerLite が 250、Buttondown が 100 です [1][10][14][18]。
MailerLite には月 2,500 通の上限もあります [14]。Brevo は購読者数ではなく日 300 通の通数制で、連絡先は 100,000 件まで保存できます [24]。

### 送信前に審査や承認はありますか？

Buttondown は新規アカウントに送信前の審査があり、通常 1〜3 営業日です [4]。Brevo は送信の解禁にアカウント承認が挟まります [25]。
beehiiv は API キーの発行前に Stripe Identity での本人確認が要り [20]、Kit は送信前の審査が公式ページに記載されていません [9][11]。

## 出典

1. [Buttondown Pricing](https://buttondown.com/pricing) — 2026-09-13 確認
2. [Buttondown — Register](https://buttondown.com/register) — 2026-09-13 確認
3. [Buttondown — API](https://buttondown.com/features/api) — 2026-09-13 確認
4. [Buttondown Docs — Account review](https://docs.buttondown.com/account-review) — 2026-09-13 確認
5. [Buttondown Docs — Authentication](https://docs.buttondown.com/api-authentication) — 2026-09-13 確認
6. [Buttondown Docs — Rate limits](https://docs.buttondown.com/api-rate-limits) — 2026-09-13 確認
7. [Buttondown Docs — Drafting emails via the API](https://docs.buttondown.com/drafting-emails-via-the-api) — 2026-09-13 確認
8. [Buttondown Docs — Deleting an email](https://docs.buttondown.com/api-emails-delete) — 2026-09-13 確認
9. [Kit Pricing](https://kit.com/pricing) — 2026-09-13 確認
10. [Kit Help — The Kit Newsletter Plan](https://help.kit.com/en/articles/9053602-the-kit-newsletter-plan) — 2026-09-13 確認
11. [Kit Help — Kit API overview](https://help.kit.com/en/articles/9902901-kit-api-overview) — 2026-09-13 確認
12. [Kit Developers — Authentication](https://developers.kit.com/api-reference/authentication) — 2026-09-13 確認
13. [Kit Developers — Create a broadcast](https://developers.kit.com/api-reference/broadcasts/create-a-broadcast) — 2026-09-13 確認
14. [MailerLite Pricing](https://www.mailerlite.com/pricing) — 2026-09-13 確認
15. [MailerLite Help — Free plan update FAQ](https://www.mailerlite.com/help/free-plan-update-faq) — 2026-09-13 確認
16. [MailerLite Developers — Getting started](https://developers.mailerlite.com/docs/) — 2026-09-13 確認
17. [MailerLite Developers — Campaigns](https://developers.mailerlite.com/docs/campaigns.html) — 2026-09-13 確認
18. [beehiiv Pricing](https://www.beehiiv.com/pricing) — 2026-09-13 確認
19. [beehiiv Help — Plan types and subscriber plan tier pricing](https://www.beehiiv.com/support/article/23874462928663-plan-types-and-subscriber-plan-tier-pricing) — 2026-09-13 確認
20. [beehiiv Help — How to access your Publication ID or API keys](https://www.beehiiv.com/support/article/13091918395799-how-to-access-your-publication-id-or-api-keys) — 2026-09-13 確認
21. [beehiiv Help — Using the Send API and Create post endpoint](https://www.beehiiv.com/support/article/36759164012439-using-the-send-api-and-create-post-endpoint) — 2026-09-13 確認
22. [beehiiv Help — How to create and verify your beehiiv account](https://www.beehiiv.com/support/article/27235107130391-how-to-create-and-verify-your-beehiiv-account) — 2026-09-13 確認
23. [beehiiv Developers — Rate Limiting](https://developers.beehiiv.com/welcome/rate-limiting) — 2026-09-13 確認
24. [Brevo Help — FAQs: What are the limits of the Free plan?](https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan) — 2026-09-13 確認
25. [Brevo Pricing](https://www.brevo.com/pricing/) — 2026-09-13 確認
26. [Brevo Developers — API limits](https://developers.brevo.com/docs/api-limits) — 2026-09-13 確認
27. [Brevo Developers — Create an email campaign](https://developers.brevo.com/reference/createemailcampaign-1) — 2026-09-13 確認
28. [EmailOctopus — API documentation v2](https://emailoctopus.com/api-documentation/v2) — 2026-09-13 確認
