+++
title = '画像配信 CDN の無料枠比較: 画像 CDN は何の単位で数え、超えたらどうなるか'
date = '2026-10-10T15:10:00+09:00'
lastmod = '2026-10-10'
draft = false
summary = '画像 CDN の無料枠を、Cloudflare Images・Cloudinary・ImageKit・bunny.net Optimizer・imgix で比較。Cloudinary の無料枠（月 25 クレジット）は変換・保存・帯域を合算し、ImageKit は帯域、Cloudflare Images は変換数で数える。超えたときも、止まる・課金なしで放置するとアカウント停止、と分かれる。3 社は API で一巡を実行して確認した。'
categories = ['hosting']
tags = ['image-cdn', 'cloudinary', 'imagekit', 'cloudflare', 'bunny-net', 'imgix']
# OGP 用の画像。本文と一覧には出さない（hidden）。生成は desk の images/
[cover]
  image = '/images/og/image-cdn-free-tier.jpg'
  alt = '画像配信 CDN の無料枠比較'
  hidden = true
  hiddenInList = true
+++

## 結論

画像配信 CDN は、置いた画像を URL の指示どおりにサイズや形式を変えて配るサービスです。
無料枠かトライアルを持つ 5 つを、「無料枠を何の単位で数えるか」「超えたら止まるのか・課金されるのか」「無料のまま API から動かせるか」の 3 点で比べました。

- **画像はすでに自分の置き場所にあり、サイトを Cloudflare に置いているか Worker を書けるなら、変換だけをかぶせたい** → Cloudflare Images。
  無料の範囲は変換だけで保存が無く、超えても課金されません
- **画像を預けて配りたい。超えたら課金されるより、止まるほうがよい** → ImageKit。枠は帯域で数え、すべての項目が上限で止まります
- **変換・保存・帯域を 1 つの枠にまとめ、機能の広さを取りたい** → Cloudinary。超えても課金されませんが、放置するとアカウントが無効化されます

| こういう条件なら | 対象 | 決め手 |
| --- | --- | --- |
| 画像はすでに自分の置き場所にあり、変換だけをかぶせたい | Cloudflare Images | 「前提条件」列（Cloudflare のサイトか Worker）と「主な制約」列（超えても課金なし） |
| 画像を預けて配る。枠は帯域だけで数えたい。超えたら止まってよい | ImageKit | 「無料枠」列（帯域で数える）と「主な制約」列（全項目が上限で止まる） |
| 変換・保存・帯域を 1 つの枠にまとめ、機能の広さを取りたい | Cloudinary | 「無料枠」列（クレジットの合算）と「主な制約」列（超えても課金なし、放置すると無効化） |
| 変換の回数を気にせず、サイト単位の定額で配りたい | bunny.net Optimizer | 「料金」列（サイト単位の定額）と「無料枠」列（トライアルのみ） |
| 有料プランを決める前に、期間限定で試したい | imgix | 「無料枠」列（トライアルのみ）と「料金」列（クレジット制） |

画像を預ける置き場所そのものが目的なら、[個人向けクラウドストレージの無料枠比較](/posts/cloud-storage-free-tier/)が対象です。

## 比較表

2026-10-10 時点の公式情報に基づきます。出典は末尾の番号に対応しています。
料金は月払いの月額（USD）です。Cloudflare Images は最低料金のない従量で、Cloudinary と ImageKit は個人が申し込める最小の有料プランを載せています。
対象名を押すと、その対象の詳細に移ります。

| 対象 | 料金 | 無料枠 | 主な制約 | 前提条件 | 検証区分 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| [Cloudflare Images](#cloudflare-images) | Free は USD 0（変換のみ）。Paid は変換 USD 0.50/1,000、保存 USD 5/10 万枚、配信 USD 1/10 万枚 | **月 5,000 ユニーク変換**。アップロードと保存は Paid のみ | 超えた後の新しい変換はエラーで止まり、課金なし。binding の入力は 20 MB まで | Cloudflare アカウント。Worker 経由の変換ならゾーンの有効化は不要 | {{< verified run >}} | [1][2][3][4] |
| [Cloudinary](#cloudinary) | Free は USD 0。Plus USD 99/月（年払い 89）、Advanced USD 249/月（年払い 224） | **月 25 クレジット**（変換 1,000 回・保存 1 GB・帯域 1 GB のどれでも 1 クレジット） | 超えても課金なし。警告を放置するとアカウントが自動で無効化。変換と帯域は直近 30 日の移動窓。画像は 10 MB まで | アカウントのみ。Free はカード不要で、API も使える | {{< verified run >}} | [5][6][7] |
| [ImageKit](#imagekit) | Free は USD 0。Lite USD 9/月＋従量、Pro USD 89/月＋従量 | **帯域 20 GB/月**、保存（DAM）3 GB | 全項目が上限で止まる（帯域は配信停止、保存はアップロード不可）。暦月でリセット。画像は 25 MB まで | アカウントのみ。カード不要（公式ページの記載）。カスタムドメインは Pro から | {{< verified run >}} | [8][9] |
| [bunny.net Optimizer](#bunnynet-optimizer) | USD 9.50/サイト/月の定額（変換は無制限） | 恒常の無料枠なし。**14 日トライアル** | 配信の帯域は含まれず、CDN の料金（USD 0.002/GB から）が別に要る | アカウント。トライアルはカード不要。20 サイト超は問い合わせ | {{< verified spec >}} | [10][12] |
| [imgix](#imgix) | Starter USD 25/月（年払い 250）・100 クレジット。上位は USD 75/月から | 恒常の無料枠なし。**30 日・100 クレジットのトライアル** | Starter は保存 50 GB・配信 100 GB まで。超えたときの挙動は記載なし | アカウント。トライアルはカード不要。有料のカード要否は記載なし | {{< verified spec >}} | [11] |

{{< bars unit="MB" caption="Free で 1 枚にアップロードできる画像の上限。Cloudflare Images は Free に保存が無いので、Images binding に渡せる入力の上限。bunny.net Optimizer と imgix は恒常の無料枠が無く、料金ページに上限の記載も無いため載せていない" >}}
Cloudinary: 10
Cloudflare Images（binding の入力）: 20
ImageKit: 25
{{< /bars >}}

## 比較の前提

- 対象に含めたもの: 公式の料金ページで無料枠かトライアルの上限を確認でき、URL の指示で画像を変換して配れる 5 つです。Cloudflare Images は Cloudflare の CDN と一体、Cloudinary と ImageKit は画像を預けて変換と配信をする形、bunny.net Optimizer は CDN に後付けする形です
- 除外したもの: 画像を置くだけのクラウドストレージは、変換の機能が主役ではないので対象外です。[個人向けクラウドストレージの無料枠比較](/posts/cloud-storage-free-tier/)で比べています。静的なサイトの配信そのものは[静的サイトの無料ホスティング比較](/posts/static-site-hosting-free-tier/)が対象です
- 検証区分の意味: {{< verified run >}} = AI が実際に動かして確認した / {{< verified spec >}} = 公式ドキュメントで確認したのみ
- 料金表記の注意: 通貨は USD で、税の扱いは各社の料金ページの表示のままです。年払いのある対象は括弧で補いました。Cloudflare Images の変換は「元画像とパラメータの組」を暦月に 1 回だけ数える単位で、Cloudinary の「変換 1,000 回」とは数え方が違います [1][3][5]
- 選び方の軸: 「無料枠」列は、数える単位で分かれます。
  変換数、クレジット（変換・保存・帯域の合算）、帯域のどれを枠にするかで、1 つの棒グラフに並ばないため、棒グラフには 3 社で単位が揃う Free の最大アップロードサイズを載せています。
  「主な制約」列は、枠を超えたときに止まるのか、課金されるのか、アカウントが止まるのかで分かれます。
  「前提条件」列は、画像を預けられるか（Cloudflare Images の Free は変換だけ）と、無料のまま API が使えるかで分かれます。
  Cloudflare Images は、サイトのドメインを Cloudflare に置く（ゾーン）か、Worker（Cloudflare 上で動かす小さなプログラム）を書くかのどちらかが前提です
- 検証の手順: Cloudflare Images・Cloudinary・ImageKit で 2026-10-04 に行い、Cloudinary と ImageKit の使用量は 2026-10-09 に取り直しました。
  bunny.net Optimizer と imgix はトライアル（14 日と 30 日）で切れ、公開後の確認で同じ手順を取り直せないため、公式ページの確認にとどめています。
  実行した 3 社は、(1) 鍵やトークンを非対話で使う (2) 画像をアップロードするか外部の画像を渡す (3) URL の指示で変換して取得する (4) 使用量を確かめる (5) 消す、の段階を流しました。結果は「各対象の詳細」の「検証した内容」に書いています。
  枠を超えたときの挙動（止まる・課金・無効化）は負荷をかけて確かめておらず、3 社とも公式の記述です
- 鍵やトークンを AI エージェントに渡す手段は、[シークレット管理 CLI 6 つの比較](/posts/secret-management-cli/)で比べています。この検証でも、そこで扱った `op run` で鍵を注入しています

## 各対象の詳細

### Cloudflare Images

Cloudflare の CDN と Workers に組み込まれた画像変換です。
無料の範囲は変換だけで、画像を預ける機能は有料の側にあります。

{{< fit run >}}
向く: 画像はすでに別の置き場所にあり、Worker から変換だけをかぶせたい
向かない: 画像を預けて URL だけで配りたい（Free には保存もアップロードも無い）
{{< /fit >}}

- **料金体系**: Paid は Free と同じ最初の 5,000 変換を含み、超過分から従量です。保存と配信はそれぞれ別の単価で、Free には保存と配信の枠がありません [1]
- **制約**: 上限を超えたあとも、キャッシュ済みの変換は配信され続けます。新しい変換だけがエラー 9422 になり、課金はされません [1][4]。
  9432 は旧 Image Resizing 契約のアカウントで Images binding（Worker から Images を直接呼ぶ口）が使えないときのエラーです [4]。
  binding の `.info()` はユニーク変換に数えません [3]
- **前提条件**: URL で変換する `/cdn-cgi/image/` 形式は、ゾーンでの有効化が先に要ります。一方、Worker の `fetch()` に `cf.image` を付ける経路は `*.workers.dev` を含む Worker のあるゾーンで使え、課金は Worker を持つアカウントに付きます [2]
- **検証した内容**: 2026-10-04 に、権限を Workers Scripts Edit だけに絞った API トークンで実行しました。このサイトの本番ゾーンの Images 設定は有効化せず、検証用の Worker を `workers.dev` に出して消しています。

  | 経路 | 呼び出し | 結果 |
  | --- | --- | --- |
  | `fetch()` + `cf.image` | 幅 200・webp | 200 `image/webp` 1,782 B |
  | 同（同じ条件をもう 1 回） | 幅 200・webp | 200、同じ 1,782 B（キャッシュから） |
  | 同 | 幅 400・avif | 200 `image/avif` 4,136 B |
  | 同 | 幅 200・`format=json` | 200。元画像の幅・高さ・形式を返す |
  | Images binding `info()` | — | 200。ファイルサイズ・幅・高さ・形式 |
  | Images binding `input().transform().output()` | 幅 200・webp | 200 `image/webp` 6,118 B |
  | 同 | 幅 400・avif | 200 `image/avif` 4,016 B |
  | Worker の削除 | `DELETE …/scripts/{name}?force=true` | 1 回で消え、直後の GET は 404 |

  元の画像は JPEG 1200×630（31,990 B）です。同じ幅 200・webp でも `fetch()` 経路は 1,782 B、binding 経路は 6,118 B で、変換結果のサイズは経路で変わります（公式に品質の既定値の記載は無いため、理由は確かめていません）。
  Free の 5,000 ユニーク変換を使い切るところまでは、本番と同じアカウントのため当てていません

### Cloudinary

画像と動画を預けて、変換・配信・検索までを 1 つのサービスで扱えるメディア管理寄りのサービスです。
無料枠は変換・保存・帯域を 1 つのクレジットにまとめて数えます。

{{< fit run >}}
向く: 画像を預けて URL で変換して配り、動画や検索の機能も使いたい
向かない: 枠の残りを API でほぼ即時に見張りたい（使用量は日次の断面）
{{< /fit >}}

- **料金体系**: Plus は 225 クレジット、Advanced は 600 クレジットを含みます。Advanced からカスタムドメイン（CNAME）に対応します [5]
- **制約**: 変換と帯域は直近 30 日の移動窓で数え、月初に 0 へ戻りません。保存は常に現在の総量で測ります [6]。
  Free・Plus・Advanced は超過しても課金されず、警告メール、繰り返しの通知と続き、対応しなければ最終的にアカウントが自動で無効化されます [6]。
  Free の動画のアップロードは 100 MB までで、Admin API は 1 時間 500 リクエストです [7]
- **前提条件**: Free はカード不要で、機能にアップロードウィジェット・API・検索が含まれます [5]。鍵ごとに権限を絞る設定は管理画面に見当たらず、鍵はアカウント全体の権限で動きます
- **検証した内容**: 2026-10-04 に、Free のアカウント（カード未登録）の API Key / Secret で実行しました。

  | 手順 | 呼び出し | 結果 |
  | --- | --- | --- |
  | 使用量 | `GET /usage`（Admin API） | 200。`plan: Free`、クレジットの上限 25、使用 0 |
  | アップロード | `POST /image/upload`（外部 URL を `file` に指定。SHA-1 署名） | 200（1.4 秒）。jpg 1200×630・31,990 B |
  | URL 変換 | `w_200,f_webp` | 200 `image/webp` 1,430 B（もう 1 回も同じ） |
  | 同 | `w_400,f_avif` | 200 `image/avif` 3,099 B |
  | 同 | `w_200,f_auto,q_auto` + `Accept: image/avif,image/webp` | 200 `image/webp` 1,430 B（avif ではなく webp） |
  | 同 | 変換なし | 200 `image/jpeg` 31,990 B（元画像と同じ大きさ） |
  | 使用量（直後） | `GET /usage` | 数字は 0 のまま。日次の断面で、直後には反映されない |
  | 削除 | `DELETE /resources/image/upload?public_ids[]=…&invalidate=true` | 200。元画像 1 と派生 4 が消え、その後の GET は 404 |
  | 削除直後の配信 URL | 同じ変換 URL | 1 回目は 200 で配信が続き、5 分後は 404 |

  2026-10-09 に使用量を取り直すと、クレジットは 25 のうち 0.18 で、内訳は保存 0.17・変換 0.01 でした。
  検証でアップロードした画像は消してあるのに保存が約 177 MB 残っていて、中身は新しいアカウントに最初から入っている見本の画像と動画でした。消さない限り、保存で毎月 0.17 クレジットを使います。
  変換の件数は 10 で、10-04 に呼んだ URL 変換 4 種と元画像の取得 1 回に対して数が合わず、数え方の内訳は追えていません

### ImageKit

画像と動画の変換・配信に、メディアライブラリ（DAM）が付いたサービスです。
無料枠は帯域で数えるので、単位が単純です。

{{< fit run >}}
向く: 画像を預けて URL で変換して配り、枠は帯域だけで管理したい。超えたら止まってよい
向かない: 無料のままカスタムドメインを使いたい（Free と Lite には含まれない）
{{< /fit >}}

- **料金体系**: Lite は帯域 40 GB・保存 10 GB を含み、超過は帯域 USD 0.5/GB、保存 USD 0.1/GB です。Pro は帯域 225 GB・保存 225 GB を含み、超過は USD 0.45/GB と USD 0.09/GB です [8]
- **制約**: Free は含まれる量のすべてが hard limit で、帯域を使い切ると配信が止まり、保存を使い切ると新しいファイルをアップロードできません。カウンターは暦月の初めにリセットされます。有料プランは超過分が従量で課金されます [8]。
  Free の動画のアップロードは 100 MB までです [8]。Purge cache API は Free で月 500 回です [8]
- **前提条件**: Free はカード不要です [9]。カスタムドメインは Pro に 1 つ含まれ、追加は 1 つあたり USD 9 です [8]
- **検証した内容**: 2026-10-04 に、Free のアカウント（カード未登録）の private key（Basic 認証）で実行しました。

  | 手順 | 呼び出し | 結果 |
  | --- | --- | --- |
  | 使用量 | `GET /v1/accounts/usage` | 200。帯域・保存とも 0 |
  | アップロード | `POST upload.imagekit.io/api/v1/files/upload`（外部 URL を `file` に指定） | 200（2.8 秒）。jpg 1200×630・31,990 B |
  | URL 変換 | `tr:w-200,f-webp` | 200 `image/webp` 1,412 B（もう 1 回は `x-cache: Hit`） |
  | 同 | `tr:w-400,f-avif` | 200 `image/avif` 2,428 B |
  | 同 | `tr:w-200,f-auto` + `Accept: image/avif,image/webp` | 200 `image/webp` 1,412 B |
  | 同 | 変換なし | 200 `image/jpeg` 31,054 B（元より小さく、既定の最適化がかかる） |
  | 削除 | `DELETE /v1/files/{fileId}` | 204。その後の詳細取得は 404 |
  | 削除直後の配信 URL | 同じ変換 URL | 200 で配信が続く（CDN のキャッシュは残り、消すには Purge cache API が別に要る） |

  2026-10-09 に使用量を取り直すと、帯域は 10-04 の分だけが日付の範囲指定で取れ、43,436 B でした。保存は 1.3 MB で、新しいアカウントに最初から入っている見本の 2 ファイルです。保存 3 GB に対して小さく、枠への影響はほぼありません

### bunny.net Optimizer

CDN 事業者が出している、既存のサイトに後付けする画像の最適化です。
サイト単位の定額で、変換の回数を数えません。

{{< fit spec >}}
向く: 変換の回数を数えず、サイト単位の定額で配りたい
向かない: 恒常の無料枠で続けたい（無料はトライアルのみ）
{{< /fit >}}

- **料金体系**: 1 サイトあたりの月額で、変換・最適化・リクエストは無制限と書かれています [10][12]。月額を時間割りで課金する旨の記載があり、計算方法は書かれていません [10]
- **制約**: Optimizer は CDN の Pull Zone（配信の単位）に有効化する追加機能で、配信の帯域は Optimizer の月額に含まれず、CDN の料金が別にかかります [12]
- **前提条件**: 14 日のトライアルはカード不要です。20 サイトを超える場合は営業への問い合わせが案内されています [10]
- **検証した内容**: トライアルは 14 日で切れ、公開後の確認で同じ手順を取り直せないため実行していません。確認したのは公式の料金ページとドキュメント（2026-10-10）です

### imgix

画像の変換と配信を扱うサービスで、料金はクレジット制です。
恒常の無料枠が無く、試せるのはトライアルです。

{{< fit spec >}}
向く: 有料プランを決める前に、期間限定で試したい
向かない: 無料のまま長く使いたい（恒常の無料枠が無い）
{{< /fit >}}

- **料金体系**: クレジットは帯域 1 GB で 1、キャッシュの保存 1 GB で月 2 と数え、変換の消費は機能ごとに違います。Cloudinary のクレジットとは単位が別です [11]。
  Basic は USD 75/月で 375 クレジット、Midrange は USD 150/月で 830 クレジットです。年払いは月額の 10 倍で表示されています [11]
- **制約**: Starter はメディア保存 50 GB・配信 100 GB までです。超えたときの挙動は料金ページに記載がありません [11]
- **前提条件**: トライアルはカード不要です。有料プランのカード要否は料金ページに記載がありません [11]
- **検証した内容**: トライアルは 30 日で切れ、公開後の確認で同じ手順を取り直せないため実行していません。確認したのは公式の料金ページ（2026-10-10）です

## 用途別の選び方

最初に分かれるのは、画像を預けるのか、すでにある画像に変換だけをかぶせるのか、そして枠を超えたときに止まるのか課金されるのかです。

{{< svg src="image-cdn-free-tier-flow.svg" alt="用途別の判断フロー。画像はすでに自分の置き場所にあり変換だけをかぶせたいなら Cloudflare Images の Free、画像を預けて配りたく上限を超えたら課金より止まるほうがよいなら ImageKit の Free、変換・保存・帯域を 1 つの枠にまとめて機能の広さを取りたいなら Cloudinary の Free、無料枠にこだわらず期間限定で試したいなら bunny.net Optimizer か imgix のトライアル、元画像を預ける置き場所そのものが目的なら画像 CDN ではなくクラウドストレージ" caption="図: 用途別の判断フロー" >}}

- 画像はすでに自分の置き場所にあり、変換だけをかぶせたい → Cloudflare Images。決め手は「無料枠」列です。Worker から呼ぶ形なら本番のゾーン設定は変えずに使えます。[サーバーレス実行環境の無料枠比較](/posts/serverless-free-tier/)で扱った Workers と同じ仕組みの上で動きます
- 画像を預けて配りたく、超えたら止まってよい → ImageKit。決め手は「主な制約」列です。課金されない代わりに、使い切ると配信が止まります
- 変換・保存・帯域を 1 つの枠にまとめ、機能の広さを取りたい → Cloudinary。決め手は「無料枠」列です。保存も同じ枠から減るので、最初から入っている見本の資産は消すかどうかを決めておく必要があります
- 変換の回数を気にしない定額で配りたい → bunny.net Optimizer。決め手は「料金」列です。無料はトライアルだけです
- 有料プランの前に期間限定で試したい → imgix。決め手は「無料枠」列です

## よくある質問

### 画像配信 CDN の無料枠は、クレジットカードなしで使えますか？

Cloudinary の Free はカード不要で [5]、ImageKit の Free も公式ページに「No credit card needed」と書かれています [9]。
bunny.net Optimizer と imgix のトライアルもカード不要です [10][11]。
Cloudflare Images の Free は Cloudflare のアカウントで使え、カードの要否は料金ページに記載がありません [1]。

### 無料枠を超えるとどうなりますか？

Cloudflare Images の Free は新しい変換がエラー 9422 で止まり、課金されません [1][4]。ImageKit の Free は帯域を使い切ると配信が止まります [8]。
Cloudinary の Free は課金されず、警告のあと放置するとアカウントが自動で無効化されます [6]。imgix は超えたときの挙動が料金ページに書かれていません [11]。

## 出典

1. [Cloudflare Docs — Images pricing](https://developers.cloudflare.com/images/pricing/) — 2026-10-10 確認
2. [Cloudflare Docs — Transform via Workers](https://developers.cloudflare.com/images/optimization/transformations/transform-via-workers/) — 2026-10-10 確認
3. [Cloudflare Docs — Images binding](https://developers.cloudflare.com/images/optimization/transformations/bindings/) — 2026-10-10 確認
4. [Cloudflare Docs — Images troubleshooting](https://developers.cloudflare.com/images/reference/troubleshooting/) — 2026-10-10 確認
5. [Cloudinary — Pricing](https://cloudinary.com/pricing) — 2026-10-10 確認
6. [Cloudinary Docs — Billing and plans](https://cloudinary.com/documentation/billing_and_plans) — 2026-10-10 確認
7. [Cloudinary — Compare plans](https://cloudinary.com/pricing/compare-plans) — 2026-10-10 確認
8. [ImageKit — Pricing plans](https://imagekit.io/plans) — 2026-10-10 確認
9. [ImageKit — Forever Free plan](https://imagekit.io/lp/imagekit-forever-free-plan) — 2026-10-10 確認
10. [bunny.net — Optimizer pricing](https://bunny.net/pricing/optimizer/) — 2026-10-10 確認
11. [imgix — Pricing](https://imgix.com/pricing) — 2026-10-10 確認
12. [bunny.net Docs — Optimizer Pricing](https://bunny.net/docs/optimizer/pricing) — 2026-10-10 確認
