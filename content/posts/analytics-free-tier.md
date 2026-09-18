+++
title = 'アクセス解析の無料枠比較: 何か月見られ、API で取り出せるか'
date = '2026-09-18T21:51:08+09:00'
lastmod = '2026-09-18'
draft = true
summary = 'Cloudflare Web Analytics・Google Analytics 4・Umami・Plausible・Fathom を、無料枠が恒常かトライアルか、無料で何か月さかのぼれるか、無料で API から数字を取り出せるかで比較。無料のまま API でサイトの作成から集計の取得・削除まで閉じたのは Cloudflare Web Analytics と Umami のセルフホスト。Umami Cloud の無料プランは API が使えず、Plausible と Fathom は無料枠が無い。'
categories = ['monitoring']
tags = ['web-analytics', 'cloudflare', 'google-analytics', 'umami', 'plausible', 'fathom']
# OGP 用の画像。本文と一覧には出さない（hidden）。生成は desk の images/
[cover]
  image = '/images/og/analytics-free-tier.jpg'
  alt = 'アクセス解析の無料枠比較'
  hidden = true
  hiddenInList = true
+++

## 結論

サイトの訪問数を数えるアクセス解析サービス 5 つを、「無料枠が恒常かトライアルか」「無料で何か月さかのぼれるか」「無料で API から数字を取り出せるか」の 3 点で比べました。
無料のまま、AI や CI にサイトの登録から集計の取得・削除まで任せたいなら、Cloudflare Web Analytics が条件を満たします。
データを自分のサーバーに置き、保持期間も件数も自分で決めたいなら、MIT ライセンスの Umami をセルフホストする形です。
ただ、Umami Cloud の無料プランは API が使えず、Google Analytics 4 は無料で最長 14 か月さかのぼれる代わりに Cookie を使います。
Plausible と Fathom には無料枠が無く、トライアルの後は有料です。

## 比較表

2026-09-18 時点の公式情報に基づきます。出典は末尾の番号に対応しています。
料金は個人が申し込める最小のプランで揃え、金額は月払いの月額（USD）です。Umami は提供形態で条件が変わるので、セルフホストと Cloud を別の行にしています。

| 対象 | 料金 | 無料枠 | 主な制約 | 前提条件 | 検証区分 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| Cloudflare Web Analytics | 無料。有料プランは無い | 全プランで利用可。参照できるのは**直近 6 か月** | 非サンプリングのデータは 7 日で、その後は約 10% に集約。サイトはアカウントあたり 10 件のソフト上限（サポートに連絡で変更可） | Cloudflare アカウント。DNS の変更もプロキシも不要で、タグを 1 行置く。API はトークンの権限「Account Settings Write」 | {{< verified run >}} | [1][2][3][4][5][6] |
| Google Analytics 4 | 標準プロパティは無料。有料は Analytics 360（金額は非公開で問い合わせ） | 保持は **2 か月か 14 か月**を選ぶ。web のイベント名は無制限 | ファーストパーティ Cookie（`_ga`、既定 2 年）を使う。年齢・性別・興味のデータは常に 2 か月。Data API は 1 日 20 万トークン・同時 10 リクエスト | Google アカウント。Data API は Google Cloud のプロジェクトと OAuth かサービスアカウントの準備が要る | {{< verified spec >}} | [7][8][9][10][11][12] |
| Umami（セルフホスト） | 無料（MIT ライセンス）。サーバーと DB の費用は自分持ち | イベント数・サイト数・保持期間に**上限なし** | API キーは無く、ログインで得たトークンを使う。メールレポートと Streaming API は Cloud 限定 | Node.js 18.18 以上と PostgreSQL 12.14 以上を動かせるサーバー。アカウント・カードとも不要 | {{< verified run >}} | [13][14][15][16][17][18] |
| Umami Cloud | Hobby（USD 0）。有料は Pro USD 20/月（100 万イベント・20 サイト・保持 2 年） | **月 10 万イベント・1 サイト・保持 6 か月** | Hobby は **API・MCP が使えない**（Pro 以上）。イベントは PV に加えてカスタムイベントと保存するプロパティも 1 件ずつ数える | アカウントのみ。有料プランの 14 日トライアルは、終了時に通常料金が請求される | {{< verified spec >}} | [13] |
| Plausible | Starter USD 9/月（月 1 万 PV・1 サイト・保持 3 年）。無料プランなし | **30 日トライアルのみ**（Business の全機能） | Stats API は Business（USD 19/月から）以上で 600 回/時。トライアルが終わるとダッシュボードがロックされる | アカウントのみ。トライアルにカードは不要で、自動では有料に移らない | {{< verified spec >}} | [19][20][21] |
| Fathom | USD 15/月（月 10 万 PV・50 サイト込み）。無料プランなし | **7 日トライアルのみ** | カスタムイベントも PV に数える。API は 600 回/時・同時 5 から（API プランを上げると増える） | アカウントのみ。トライアルのカード要否は料金ページに記載なし | {{< verified spec >}} | [22][23][24] |

{{< bars unit="か月" caption="無料でさかのぼれる期間の上限。Cloudflare は 7 日を過ぎると約 10% に集約されたデータになる。GA4 は設定で選べる最長の値。Umami のセルフホストは上限が無く、Plausible と Fathom は無料枠が無いため載せていない" >}}
Cloudflare Web Analytics: 6
Umami Cloud Hobby: 6
Google Analytics 4（標準）: 14
{{< /bars >}}

## 比較の前提

- 対象に含めたもの: 公式の料金ページとドキュメントで、料金・保持期間・API の条件を確認できた 5 つです。Cloudflare Web Analytics と Google Analytics 4 は無料で使い続けられるサービス、Umami は OSS とそのマネージド版、Plausible と Fathom は Cookie を使わないことを前面に出した有料サービスです
- 除外したもの: GoatCounter はホスト版を「reasonable public usage」なら無料としていますが、上限の数字と有料プランを公開していません [25]。「無料枠」列が埋まらず、OSS をセルフホストする枠は Umami で埋まるため外しました
- 検証区分の意味: {{< verified run >}} = AI が実際に動かして確認した / {{< verified spec >}} = 公式ドキュメントで確認したのみ
- 「無料」の意味が 3 通りに割れています。Cloudflare・GA4・Umami Cloud Hobby は期限の無い無料プラン、Umami のセルフホストはソフトウェアが無料でサーバー代は自分持ち、Plausible と Fathom はトライアルだけです。棒グラフは、期限の無い無料プランで数字が出る 3 つだけを並べています
- 同じ「6 か月」でも粒度が違います。Cloudflare は非サンプリングのデータを 7 日だけ持ち、その後は約 10% に集約します [2]。アクセスの少ないサイトほど、7 日を過ぎた数字は推定に近づきます。Umami Cloud Hobby の 6 か月に、サンプリングの記載はありません [13]
- 数える単位も揃いません。Umami はイベント（PV に加えて、カスタムイベントと保存するプロパティが 1 件ずつ）、Plausible と Fathom は PV（Fathom はカスタムイベントも PV に数える）です [13][19][22]。GA4 と Cloudflare には月あたりの件数の上限がありません
- 「API がある」と「無料で API を使える」は一致しません。5 つとも API を持ちますが、無料のまま使えるのは Cloudflare・GA4・Umami のセルフホストです。Umami Cloud は Pro 以上、Plausible は Business 以上です。Plausible はトライアル中に Business の全機能が使えるので、30 日間は Stats API も試せます [20]
- Cookie の扱いは事実だけを書いています。GA4 はファーストパーティ Cookie を使い [11]、Cloudflare は Cookie も localStorage も使わないと明記しています [3]。Umami・Plausible・Fathom は料金ページで Cookie バナーが不要だと案内しています [13][19][22]。同意の要否は国や地域の法令によるので、この記事では判断しません
- 検証は Cloudflare Web Analytics と Umami のセルフホストに、2026-09-16 に行いました。手順は次の 5 つです。GA4・Umami Cloud・Plausible・Fathom は公式ページの確認にとどめています

  1. API のキーやトークンを非対話で使う
  2. API でサイトを作る
  3. 計測タグから 3 回のアクセスを送る
  4. API で集計を読む
  5. API でサイトを消す

- 解析を載せる先のホスティングは、[静的サイトの無料ホスティング比較](/posts/static-site-hosting-free-tier/)で比べています。サイトが応答しているかを外から見る監視は、[死活監視の無料枠比較](/posts/uptime-monitoring-free-tier/)の範囲です。こちらは「動いているか」、この記事は「読まれているか」を扱います
- API のトークンを AI エージェントに渡す手段は、[シークレット管理 CLI 6 つの比較](/posts/secret-management-cli/)で比べています。この記事の検証でも、そこで扱った `op run` でトークンを注入しています

## 各対象の詳細

### Cloudflare Web Analytics

Cloudflare が無料で提供するアクセス解析で、Cloudflare のプロキシを通していないサイトにもタグ 1 行で入れられます。
5 つのうち、期限の無い無料プランのまま、サイトの作成から集計の取得・削除まで API だけで閉じたのは Cloudflare だけです。

- **料金体系**: 無料です。docs は「Available on all plans」、製品ページは「for free」と書いていて、有料プランはありません [1][3]。Pro 以上のプランには、エッジのログを使う別の解析が付きます [2]
- **制約**: 参照できるのは直近 6 か月です。非サンプリングのデータは 7 日ぶんで、その後は約 10% に集約されます。ダッシュボードと GraphQL は、条件と件数に応じてサンプリングの度合いを動的に選びます [2]。
  サイトはアカウントあたり 10 件のソフト上限で、サポートに連絡すると変更できます [2]。Cookie も localStorage も使わず、IP アドレスや User-Agent によるフィンガープリントもしないと明記されています [3]
- **前提条件**: Cloudflare アカウントが要ります。DNS の変更もプロキシも不要で、JavaScript のタグを 1 行置きます。プロキシを通しているサイトなら、タグの自動挿入も選べます [1][2]。
  サイトの作成は `POST /accounts/{account_id}/rum/site_info`、削除は `DELETE /accounts/{account_id}/rum/site_info/{site_id}` で、どちらもトークンの権限は「Account Settings Write」です [4][5]。集計は GraphQL Analytics API で読みます [6]
- **検証した内容**: 2026-09-16 に、権限を 2 つ（Account Settings Write と Account Analytics Read）に絞った API トークンで実行しました。本番のサイトには触れず、検証用のホスト名でサイトを作って消しています。

  | 操作 | 結果 |
  | --- | --- |
  | `GET /user/tokens/verify` | 200。トークンだけで非対話に使える |
  | `POST /accounts/{id}/rum/site_info`（`host` のみ） | 200（約 0.9 秒）。`site_tag` と `site_token` が返る。docs にある `snippet` は応答に無く、タグは `site_token` から自分で組む |
  | タグ入りの静的ページをブラウザで 3 回開く | ビーコンは `cloudflareinsights.com/cdn-cgi/rum` への POST で、3 回とも 204。登録したホスト名と違う origin からでも受理された |
  | GraphQL `rumPageloadEventsAdaptiveGroups` を `siteTag` で絞る | 送信の約 20 秒後は 0 件、約 1 分 40 秒後に `count=3`・`visits=3`・`sampleInterval=1`（非サンプリング） |
  | 既存 1 件のアカウントでサイトを 11 件目まで作る | 11 件目が `10014 web_analytics.configuration.api.maxSiteInfo` で拒否。ソフト上限の 10 件は API では明確なエラーで止まる |
  | `DELETE .../site_info/{site_tag}` | 200（約 0.7 秒）。同じ tag をもう一度消すと 404 |

  サイトの一覧（`GET .../rum/site_info/list`）は Account Settings Write だけでは 403 で、Account Settings Read を足すと通りました。検証で作ったサイトはその場で削除し、一覧が元の件数に戻ったことを確認しています

### Google Analytics 4

Google が無料で提供するアクセス解析で、流入元・コンバージョン・ユーザー属性まで含む多機能な計測ができます。
無料でさかのぼれる期間は 5 つで最も長い一方、Cookie を使い、API を使うまでの準備が他より多くなります。

- **料金体系**: 標準プロパティは無料です [7]。有料の Analytics 360 は金額が公開されておらず、製品ページの導線は「Talk to Sales」だけです [12]
- **制約**: ユーザー単位・イベント単位のデータの保持は、2 か月か 14 か月を選びます（26 か月以上は 360 のみ）。年齢・性別・興味のデータは、設定にかかわらず常に 2 か月です [8]。
  収集の上限は、ユーザーあたり 1 日 10 万イベント、イベントあたりパラメータ 25、ユーザープロパティ 25 です。web のデータストリームではイベント名の数に上限がありません [9]。
  計測にはファーストパーティ Cookie を使い、`_ga` と `_ga_<container-id>` の既定の有効期限は 2 年です [11]
- **前提条件**: Google アカウントが要ります。Data API は Google Cloud のプロジェクトで有効化し、OAuth かサービスアカウントで認証します。
  標準プロパティのクォータは、プロパティあたり 1 日 20 万トークン・1 時間 4 万トークン、プロジェクトとプロパティの組で 1 時間 1.4 万トークン、同時 10 リクエストです [10]
- **検証した内容**: 公式のヘルプと開発者ドキュメントを確認しました。Data API の準備（Google Cloud のプロジェクト作成とサービスアカウントの発行）が利用者の操作になるため、実行は次回の更新に回しています

### Umami（セルフホスト）

MIT ライセンスで公開されているアクセス解析で、自分のサーバーに Node.js と PostgreSQL を用意して動かします。
件数・サイト数・保持期間を決めるのは自分の DB だけで、5 つのうち無料枠に上限が無いのはこの形だけです。

- **料金体系**: ソフトウェアは無料で、ライセンスは MIT です [18]。サーバーと DB の費用は自分持ちになります。料金ページも「Umami is open-source and can be self-hosted for free」と案内しています [13]
- **制約**: API キーの仕組みは無く、`POST /api/auth/login` にユーザー名とパスワードを渡して得たトークンを、`Authorization: Bearer` で渡します [15]。
  メールレポートと Streaming API は Cloud だけの機能で、セルフホスト版にはありません [13]
- **前提条件**: Node.js 18.18 以上と PostgreSQL 12.14 以上を動かせるサーバーが要ります。初回のビルドでテーブルが作られ、ユーザー名 `admin`・パスワード `umami` のアカウントができます [14]。
  サイトの作成は `POST /api/websites`（`name` と `domain` が必須）、削除は `DELETE /api/websites/{websiteId}` です [16][17]
- **検証した内容**: 2026-09-16 に、Umami v3.3.1 を手元の Windows 機（Node 24、PostgreSQL 18.6）で起動して実行しました。外部のサービスには何も作っていません。導入は `pnpm install` が約 2 分、`pnpm build` が約 1 分でした。

  | 操作 | 結果 |
  | --- | --- |
  | `POST /api/auth/login`（初期の admin） | 200。625 バイトの JWT が返り、`GET /api/me` で role は admin |
  | `POST /api/websites`（`name` と `domain`） | 200（約 0.5 秒）。`domain` は形式を検査され、IP アドレスやパス付きは通らない |
  | `POST /api/send` に curl 既定の User-Agent で送る | `{"beep":"boop"}` が返り、登録されない（bot 扱い）。`DISABLE_BOT_CHECK` で外せる |
  | 同じ送信をブラウザ相当の User-Agent で 3 PV とカスタムイベント 1 件 | いずれも 200（約 0.5 秒）。送信に認証は要らない |
  | `GET /api/websites/{id}/stats` | 送信の約 3 秒後に `pageviews 3`・`visitors 1`・`visits 1`。パス別は `metrics?type=path`（v2 の `type=url` は 400） |
  | `DELETE /api/websites/{id}` | `{"ok":true}`。同じ id の GET は 404 ではなく 200 で `null` を返す |

  `next start` は既定で全インターフェースに束縛するので、手元で試すときは `-H 127.0.0.1` を付けます。初期パスワードは公開前に変える前提です

### Umami Cloud

Umami の開発元が運用するマネージド版で、サーバーを持たずに同じダッシュボードを使えます。
無料の Hobby は 1 サイトを画面で見るためのプランで、API は含まれません。

- **料金体系**: Hobby は USD 0 です。Pro は USD 20/月で 100 万イベント・20 サイト・保持 2 年、超過は 1 イベント USD 0.00003 です。Business は USD 200/月で 1,000 万イベント・保持 5 年です [13]
- **制約**: Hobby は月 10 万イベント・1 サイト・保持 6 か月で、料金表の「API access」と「MCP access」の行は Hobby だけ空欄です [13]。
  イベントは PV に加えて、カスタムイベントと、保存するイベントプロパティを 1 つごとに 1 件と数えます [13]
- **前提条件**: アカウントのみです。有料プランには 14 日のトライアルがあり、終了時に通常料金が請求されます。期間内なら無料で取り消せます [13]
- **検証した内容**: 公式の料金ページを確認しました。Hobby では API が使えないため、「比較の前提」の手順を流せるのは Pro 以上です。ソフトウェア自体の動作は、上のセルフホストで確認しています

### Plausible

EU でホストされる有料のアクセス解析で、Cookie を使わない軽量なスクリプトを前面に出しています。
無料プランはありませんが、トライアルはカード不要で、Business の全機能を 30 日間試せます。

- **料金体系**: 月 1 万 PV の段で、Starter が USD 9/月（1 サイト・保持 3 年）、Growth が USD 14/月（3 サイト）、Business が USD 19/月（10 サイト・保持 5 年）です。年払いは 2 か月ぶん無料になります [19]
- **制約**: Stats API は Business 以上の機能で、既定のレート制限は 1 時間 600 回です [19][21]。サイトを API で作る Sites API は Enterprise です [19]。
  トライアルの終了までに契約しないと、ダッシュボードがロックされます [20]
- **前提条件**: アカウントのみです。登録時にカードは求められず、トライアルが自動で有料に移ることはありません [20]。API キーはアカウントの設定画面で発行し、表示は 1 度だけです [21]
- **検証した内容**: 公式の料金ページと docs を確認しました。アカウントの作成が利用者の操作になるため、実行は次回の更新に回しています。トライアル中は Stats API が使えるので、実行に上げる場合は 30 日のうちに集計の取得まで流します

### Fathom

Cookie を使わないことを前面に出した有料のアクセス解析で、1 つの契約に 50 サイトが含まれます。
無料プランは無く、料金ページの FAQ も「We don't offer a free plan」と明記しています。

- **料金体系**: 月 10 万 PV まで USD 15/月、20 万 PV まで USD 25/月、50 万 PV まで USD 45/月です。どの段にも 50 サイトが含まれ、追加は 50 サイトごとに USD 10/月です。年払いは 2 か月ぶん無料になります [22]
- **制約**: カスタムイベントも月間の PV に数えます。上限を大きく超える状態が続くと、アップグレードの依頼がメールで届き、解消しないとダッシュボードと API の利用が制限されることがあります（収集は続きます）[22]。
  API のレート制限は 1 時間 600 回・同時 5 リクエストからで、API のプランを上げると 1 時間 16,000 回・同時 25 まで増えます。超過は 429 と `Retry-After` ヘッダーです [24]
- **前提条件**: アカウントのみです。トライアルは 7 日で、カード登録の要否は料金ページに記載がありません [22]。API にはサイトの作成と削除のエンドポイントがあります [23]
- **検証した内容**: 公式の料金ページと API ドキュメントを確認しました。無料枠が無く、トライアルのカード要否も確認できていないため、実行はしていません

## 用途別の選び方

上から順に答えていくと、条件に合う対象にたどり着きます。各分岐の根拠は下の箇条書きと比較表の列に書いています。

{{< svg src="analytics-free-tier-flow.svg" alt="用途別の判断フロー。無料のまま API でサイトの作成から集計の取得まで任せたいなら Cloudflare Web Analytics、無料で 1 年前と比べたく流入元やコンバージョンまで見たいなら Google Analytics 4、データを自分のサーバーに置き保持期間も件数も自分で決めたいなら Umami のセルフホスト、サーバーは持たず 1 サイトを画面で見られれば足りるなら Umami Cloud Hobby、有料でよく Cookie を使わない解析を運用ごと任せたいなら Plausible か Fathom" caption="図: 用途別の判断フロー" >}}

- 無料のまま、AI や CI にサイトの登録から集計の取得まで任せたい → Cloudflare Web Analytics。「検証した内容」のとおり、トークン 1 本で作成から削除まで閉じます。
  ただし「主な制約」列のとおり、7 日を過ぎたデータは約 10% に集約され、さかのぼれるのは 6 か月までです
- 無料で 1 年前の同じ月と比べたい。流入元やコンバージョンまで見たい → Google Analytics 4。「無料枠」列の 14 か月は、期限の無い無料プランの中で最も長い値です。
  「主な制約」列のとおり Cookie を使うので、同意の扱いは利用者側で決めることになります
- データを自分のサーバーに置き、保持期間も件数も自分で決めたい。Node.js と PostgreSQL を運用できる → Umami のセルフホスト。「無料枠」列のとおり上限が無く、「検証した内容」のとおり API だけで一巡が閉じます。
  サーバーを借りる場合は、[国内 VPS の最小プラン比較](/posts/vps-japan-minimum-plan/)が対象になります
- サーバーは持ちたくない。1 サイトを画面で見られれば足り、API は要らない → Umami Cloud の Hobby。「無料枠」列の月 10 万イベントと保持 6 か月が上限で、「主な制約」列のとおり API は Pro からです
- 有料でよい。Cookie を使わない解析を、運用ごと任せたい → Plausible か Fathom。1 サイトで月 1 万 PV までなら Plausible の Starter が最も安く、サイトの数が多いなら 50 サイトを含む Fathom です。
  API で数字を取り出すなら、「主な制約」列のとおり Plausible は Business 以上が要ります

## 出典

1. [Cloudflare Docs — Web Analytics](https://developers.cloudflare.com/web-analytics/) — 2026-09-18 確認
2. [Cloudflare Docs — Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/) — 2026-09-18 確認
3. [Cloudflare — Web Analytics](https://www.cloudflare.com/web-analytics/) — 2026-09-18 確認
4. [Cloudflare API — Create a Web Analytics site](https://developers.cloudflare.com/api/resources/rum/subresources/site_info/methods/create/) — 2026-09-18 確認
5. [Cloudflare API — Delete a Web Analytics site](https://developers.cloudflare.com/api/resources/rum/subresources/site_info/methods/delete/) — 2026-09-18 確認
6. [Cloudflare Docs — GraphQL Analytics API](https://developers.cloudflare.com/analytics/graphql-api/) — 2026-09-18 確認
7. [Google Marketing Platform — Analytics](https://marketingplatform.google.com/about/analytics/) — 2026-09-18 確認
8. [Analytics Help — Data retention](https://support.google.com/analytics/answer/7667196?hl=en) — 2026-09-18 確認
9. [Analytics Help — Collection and configuration limits](https://support.google.com/analytics/answer/9267744?hl=en) — 2026-09-18 確認
10. [Google Analytics Data API — Limits and quotas](https://developers.google.com/analytics/devguides/reporting/data/v1/quotas) — 2026-09-18 確認
11. [Analytics Help — Cookie usage on websites](https://support.google.com/analytics/answer/11397207?hl=en) — 2026-09-18 確認
12. [Google Marketing Platform — Analytics 360](https://marketingplatform.google.com/about/analytics-360/) — 2026-09-18 確認
13. [Umami Pricing](https://umami.is/pricing) — 2026-09-18 確認
14. [Umami Docs — Install](https://docs.umami.is/docs/install) — 2026-09-18 確認
15. [Umami Docs — API authentication](https://docs.umami.is/docs/api/authentication) — 2026-09-18 確認
16. [Umami API Reference — Create a website](https://docs.umami.is/docs/api-reference/create-website) — 2026-09-18 確認
17. [Umami API Reference — Delete a website](https://docs.umami.is/docs/api-reference/delete-website) — 2026-09-18 確認
18. [GitHub — umami-software/umami](https://github.com/umami-software/umami) — 2026-09-18 確認
19. [Plausible — Pricing](https://plausible.io/#pricing) — 2026-09-18 確認
20. [Plausible Docs — Free trial](https://plausible.io/docs/trial) — 2026-09-18 確認
21. [Plausible Docs — Stats API](https://plausible.io/docs/stats-api) — 2026-09-18 確認
22. [Fathom Analytics — Pricing](https://usefathom.com/pricing) — 2026-09-18 確認
23. [Fathom Analytics — API](https://usefathom.com/api) — 2026-09-18 確認
24. [Fathom Analytics API — Rate limits and concurrency](https://usefathom.com/api/v1/rate-limits) — 2026-09-18 確認
25. [GoatCounter](https://www.goatcounter.com/) — 2026-09-18 確認
