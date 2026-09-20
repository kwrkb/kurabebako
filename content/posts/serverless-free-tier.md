+++
title = 'サーバーレス実行環境の無料枠比較: 1 回の呼び出しで何ができるか'
date = '2026-09-20T17:28:49+09:00'
lastmod = '2026-09-20'
draft = true
summary = 'Cloudflare Workers・Deno Deploy・Vercel Functions・Netlify Functions・AWS Lambda を、無料枠の単位（回数か CPU 時間かクレジットか）、1 回の呼び出しに許される CPU・待ち時間・メモリ、カードと商用利用の条件で比較。同じ負荷を当てると、Workers の無料プランは CPU を絞る代わりに 300 秒の待ちが通り、Deno Deploy は 24 秒の計算が通る代わりに約 100 秒で応答が切られた。'
categories = ['hosting']
tags = ['serverless', 'cloudflare', 'deno-deploy', 'vercel', 'netlify', 'aws-lambda']
# OGP 用の画像。本文と一覧には出さない（hidden）。生成は desk の images/
[cover]
  image = '/images/og/serverless-free-tier.jpg'
  alt = 'サーバーレス実行環境の無料枠比較'
  hidden = true
  hiddenInList = true
+++

## 結論

リクエストが来たときだけコードを動かすサーバーレス実行環境 5 つを、「無料枠を何の単位で数えるか」「1 回の呼び出しに CPU・待ち時間・メモリをどこまで許すか」「カードと商用利用の条件」の 3 点で比べました。
計算は数ミリ秒で済み、あとは外部 API の応答を待つだけの処理を数多くさばくなら、Cloudflare Workers の無料プランが条件を満たします。
1 回の呼び出しで秒単位の計算をするなら、月の CPU 時間で数える Deno Deploy です。
ただ、Vercel の Hobby は非商用の個人利用に限られ、AWS Lambda は登録に支払い方法が要ります。
Netlify は月 300 クレジットをデプロイと共有し、使い切ると全プロジェクトが止まります。

## 比較表

2026-09-20 時点の公式情報に基づきます。出典は末尾の番号に対応しています。
料金は個人が申し込める最小のプランで揃え、金額は月払いの月額（USD）です。AWS Lambda の単価は米国東部（バージニア北部）の第 1 段です。

| 対象 | 料金 | 無料枠 | 主な制約 | 前提条件 | 検証区分 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| Cloudflare Workers | Free は USD 0。Workers Paid は最低 USD 5/月（1,000 万リクエストと CPU 3,000 万 ms 込み） | **1 日 10 万リクエスト**（UTC 0 時にリセット）。CPU 時間の月間の枠は無い | CPU 10 ms/呼び出し（待ち時間は数えない）。メモリ 128 MB、サブリクエスト 50。実行時間は上限なし | Cloudflare アカウント。作成手順に支払い情報の入力は無い。API トークンの権限は Workers Scripts Write | {{< verified run >}} | [1][2][3][4][5] |
| Deno Deploy | Free は USD 0。Pro USD 20/月、Builder USD 200/月 | **月 100 万リクエスト・Active CPU 10 時間**。Memory time 150 GiB 時、転送 20 GiB、アプリ 10 | 呼び出しごとの CPU 上限とタイムアウトは公式に記載なし。高 CPU 負荷とスクレイパーは利用規定で禁止 | GitHub か Google のアカウントで登録。カード要否は公式に記載なし。トークンは権限を選べない | {{< verified run >}} | [6][7][8][9] |
| Vercel Functions | Hobby は USD 0。Pro USD 20/月（同額のクレジット込みで、超過は従量） | **月 100 万呼び出し・Active CPU 4 時間**。Provisioned Memory 360 GB 時、転送 100 GB | **Hobby は非商用の個人利用のみ**（広告の掲載、アフィリエイトが主目的のサイトは商用）。最大 300 秒、2 GB / 1 vCPU | アカウントのみ。カードは Pro に上げるときに入力する。上限を超えた機能は多くが 30 日待ち | {{< verified spec >}} | [10][11][12][13] |
| Netlify Functions | Free は USD 0。Personal USD 9/月（1,000 クレジット）、Pro USD 20/月（3,000 クレジット） | **月 300 クレジット**（追加購入不可）。本番デプロイ 15/回、コンピュート 10/GB 時、帯域 20/GB | 使い切ると全プロジェクトが停止する。同期 60 秒、バックグラウンド 15 分。メモリ 1,024 MB（Free は変更不可） | アカウントのみ。Free のカード要否は公式に記載なし。2025-09-04 以降の新規アカウントはクレジット制 | {{< verified spec >}} | [14][15][16][17] |
| AWS Lambda | 最低料金なしの従量。x86 USD 0.0000166667/GB 秒、Arm USD 0.0000133334/GB 秒、USD 0.20/100 万リクエスト | **月 100 万リクエスト・40 万 GB 秒**（期限なし。x86 と Arm の両方に使える） | タイムアウト最大 900 秒、メモリ 128〜10,240 MB、本文 6 MB（同期）。無料プランのアカウントは 6 か月で閉鎖 | AWS アカウント。**無料プランでも登録に有効な支払い方法が必須**。新規アカウントは同時実行とメモリの枠が低い | {{< verified spec >}} | [18][19][20][21][22][23] |

{{< bars unit="秒" caption="公式に書かれた、HTTP で呼ぶ関数 1 回の実行時間の上限（無料プラン）。Cloudflare Workers は「上限なし」、Deno Deploy は記載が無いため載せていない。検証では Workers は 300 秒の待ちが通り、Deno Deploy は約 100 秒で 503 になった" >}}
Netlify Functions（同期）: 60
Vercel Functions（Hobby）: 300
AWS Lambda: 900
{{< /bars >}}

## 比較の前提

- 対象に含めたもの: 公式の料金ページとドキュメントで、無料枠・上限・料金を確認できた 5 つです。Cloudflare Workers と Deno Deploy はコードを直接デプロイして動かす形、Vercel と Netlify はサイトのホスティングに関数が付く形、AWS Lambda は関数だけを従量で動かす形です
- 除外したもの: Google Cloud と Azure の関数実行サービスは、今回の確認日で料金と上限を取り直せていないため、次回の更新に回しています。静的なファイルの配信だけなら関数は要らないので、[静的サイトの無料ホスティング比較](/posts/static-site-hosting-free-tier/)が対象になります
- 検証区分の意味: {{< verified run >}} = AI が実際に動かして確認した / {{< verified spec >}} = 公式ドキュメントで確認したのみ
- 無料枠を数える単位が 3 通りに割れています。Workers は 1 日のリクエスト数、Deno Deploy・Vercel・Lambda は月のリクエスト数に加えて CPU 時間やメモリ × 時間、Netlify はデプロイや帯域と共有するクレジットです。1 つの棒グラフに並ばないので、棒グラフは「1 回の実行時間の上限」だけを載せています
- 「CPU 時間」と「実行時間」は別のものです。CPU 時間はコードが計算していた時間、実行時間は呼び出しの開始から終了までの時間で、外部 API の応答を待っている間は実行時間だけが進みます。Workers は待ち時間を CPU 時間に数えないと明記していて [2]、Vercel の Active CPU も I/O の待ちを数えません [11]。Lambda は実行時間 × メモリ（GB 秒）で数えるので、待っている間も課金の対象です [18]
- 同じ「無料」でも続く期間が違います。Workers・Deno Deploy・Vercel Hobby・Netlify Free は期限の無い無料プランです。Lambda の月 100 万リクエストと 40 万 GB 秒も期限がありませんが、AWS の無料プランというアカウントの種類は 6 か月で終わります [20][22]
- 検証は Cloudflare Workers に 2026-09-19 と 2026-09-20、Deno Deploy に 2026-09-19 に行いました。手順は次の 5 つで、どちらも CLI にはログインせず、API のトークンと curl だけで流しています。Vercel・Netlify・Lambda は公式ページの確認にとどめています

  1. API のトークンを非対話で使う
  2. API でコードをデプロイする
  3. 公開された URL を呼び出す
  4. 同じコードで上限に当てる（CPU を使う反復、待つだけの呼び出し、50 回を超えるサブリクエスト、メモリの確保）
  5. API で消す

- Vercel を実行区分にしていないのは、このサイトが広告リンクを載せているためです。「主な制約」列のとおり Hobby は非商用に限られるので、このサイトの検証としてデプロイを残すことはしていません
- API のトークンを AI エージェントに渡す手段は、[シークレット管理 CLI 6 つの比較](/posts/secret-management-cli/)で比べています。この記事の検証でも、そこで扱った `op run` でトークンを注入しています

## 各対象の詳細

### Cloudflare Workers

Cloudflare のエッジで JavaScript や WebAssembly を動かす実行環境です。
無料プランは 1 回の呼び出しの CPU を 10 ms に絞る代わりに、回数を 1 日 10 万まで許し、待ち時間には上限を置いていません。
このサイト自体も Workers の静的アセット配信で動いていますが、静的アセットへのリクエストは無料で、この 10 万には数えられません [1]。

- **料金体系**: Free は USD 0 です。Workers Paid は最低 USD 5/月で、月 1,000 万リクエストと CPU 3,000 万 ms を含みます。超過は 100 万リクエストあたり USD 0.30、CPU 100 万 ms あたり USD 0.02 です。実行時間には課金も上限もありません [1]
- **制約**: Free は 1 日 10 万リクエストで、UTC 0 時にリセットされます。超えると Error 1027 になり、ルートの設定によって Worker を素通しするか、エラーページを返すかが決まります [2]。
  1 回の呼び出しは CPU 10 ms、メモリ 128 MB（isolate 単位）、サブリクエスト 50、同時の外向き接続 6 です。Worker は 100 個まで、Cron Triggers は 5 個まで、Worker のサイズは非圧縮で 64 MiB までです [2]。
  CPU かメモリを超えると Error 1102 が返ります。isolate には、まれに上限を超える呼び出しを許す余裕があり、続けて超えると打ち切る、と limits ページに書かれています [2]。
  HTTP の実行時間に上限はありません。条件はクライアントがつながっていることで、切断後や応答後の処理は `ctx.waitUntil()` で最大 30 秒です [2]
- **前提条件**: Cloudflare アカウントが要ります。作成手順はメールアドレスとパスワードの入力だけで、支払い情報の入力はありません [3]。
  デプロイは `wrangler deploy` のほか、API（`PUT /accounts/{account_id}/workers/scripts/{script_name}`。トークンの権限は Workers Scripts Write）と、公式の Terraform プロバイダーでもできます [4][5]
- **検証した内容**: 2026-09-19 と 2026-09-20 に、権限を 2 つ（Workers Scripts Edit と Account Analytics Read）に絞り、ゾーンの権限を付けない API トークンで実行しました。本番のサイトには触れず、検証用の名前の Worker を `workers.dev` に出して消しています。実行場所は 2 日とも KIX でした。

  | 操作 | 結果 |
  | --- | --- |
  | `GET /user/tokens/verify` | 200。トークンだけで非対話に使える |
  | `PUT .../workers/scripts/{name}`（multipart で ES module を送る） | 200（約 1.0 秒）。続けて `POST .../subdomain` で `workers.dev` に公開。wrangler もログインも不要 |
  | 公開した直後に `GET /` | 1 回目で 200（約 0.7 秒）。以後は 1 回 0.6 秒前後 |
  | CPU を使う反復を 1 回ずつ | CPU 時間 5〜1,513 ms の呼び出しは 200。約 2 秒（2,020 ms と 1,884 ms）で打ち切られて 503 と `error code: 1102` |
  | 重い呼び出しの直後に同じ反復 | CPU 1,513 ms の直後は 407 ms で、その直後は 20 ms で 1102。1 秒あけると 1,572 ms でも 200 |
  | CPU 106〜156 ms の呼び出しを 5 回続ける | 2 日とも 5 回すべて 200 |
  | 待つだけの呼び出し（30 / 60 / 90 / 120 / 300 秒） | すべて 200。記録された CPU 時間は 30 秒待ちで 7 ms、90 秒待ちで 0.7 ms |
  | サブリクエストを 51 回 | 50 回は成功し、51 回目の `fetch()` が例外「Too many subrequests by single Worker invocation」。catch でき、Worker は 200 を返せる |
  | メモリを 64〜512 MB 確保 | 200 MB までは 200、300 MB からは 503 と `error code: 1102` |
  | `DELETE .../workers/scripts/{name}?force=true` | 200。同じ名前をもう一度消すとエラーになり、URL は 404 |

  CPU 時間は GraphQL Analytics API の `workersInvocationsAdaptive` で呼び出しごとに読みました。
  単発なら 10 ms を大きく超えても通りましたが、これは limits ページの言う「余裕」の範囲で、公式が保証しているのは 10 ms だけです。重い呼び出しが続いた直後は 20 ms で打ち切られているので、当てにできる値ではありません。
  1 日 10 万リクエストの上限はアカウント全体で共有されるため、当てていません。Worker を呼んだのは 2 日で合計 60 回です

### Deno Deploy

Deno の開発元が運用する実行環境で、TypeScript をそのままデプロイできます。
無料プランは 1 回の呼び出しに CPU の上限を書いておらず、月 10 時間の Active CPU という総量で数えます。

- **料金体系**: Free は USD 0 です。Pro は USD 20/月で 500 万リクエスト・Active CPU 50 時間、Builder は USD 200/月で 2,500 万リクエスト・Active CPU 500 時間です。超過は 100 万リクエストあたり USD 2、CPU 1 時間あたり USD 0.10 です [6]
- **制約**: Free は月 100 万リクエスト、Active CPU 10 時間、Memory time 150 GiB 時、転送 20 GiB、アプリ 10、カスタムドメイン 5、KV 1 GiB です [6]。
  メモリは、料金ページが「既定の割り当ては 768 MB」、docs が「最大 512 MB」と書いていて、公式内で数字が揃っていません [6][7]。デプロイの総サイズは 1 GB までです [7]。
  呼び出しごとの CPU 上限、リクエストのタイムアウト、Free の枠を超えたときの挙動は、料金ページにも docs にも記載がありません [6][7][8]。アイドル時は 5 秒〜10 分でインスタンスが止まります [8]。
  利用規定は、暗号通貨のマイニング、機械学習のような高 CPU 負荷、外部サイト向けのメディア配信、スクレイパー、フォワードプロキシ、VPN を禁じています。会社のサイトや EC サイトは許容例に入っています [9]
- **前提条件**: GitHub か Google のアカウントで登録します。カードの要否は公式ページに記載がありません [6][7]。
  API は `https://api.deno.com/v2` で、組織のアクセストークンを Bearer で渡します。トークンは権限を選べず、期限は 24 時間・1 週・1 か月の 3 択でした（2026-09-19 に発行画面で確認）
- **検証した内容**: 2026-09-19 に、期限 1 週の組織アクセストークンで実行しました。`deno` コマンドは使わず、ソースを JSON に埋めて API に送っています。登録は GitHub 連携で完了し、カードの入力は求められませんでした。実行場所は `ord`（シカゴ）でした。

  | 操作 | 結果 |
  | --- | --- |
  | `GET /v2/apps` | 200。トークンだけで非対話に使える |
  | `POST /v2/apps` のあと `POST /v2/apps/{app}/deploy` | 202 で `building` になり、6.0 秒で `succeeded`。CLI も Git 連携も不要 |
  | デプロイの直後に `GET /` | 1 回目で 200（約 1.5 秒）。以後は日本から 1 回 0.85 秒前後 |
  | CPU を使う反復を 1 回ずつ | Workers が約 2 秒で打ち切った反復は 200（約 2.1 秒）。その 10 倍の約 24 秒の計算も 200 |
  | さらに 5 倍の反復 | 107 秒で 503 `DEPLOYMENT_TIMED_OUT` |
  | 待つだけの呼び出し（30 / 60 / 90 / 120 / 300 秒） | 90 秒までは 200。120 秒は 99.7 秒で 503 `DEPLOYMENT_TIMED_OUT`、300 秒は 107 秒で 502 `BOOT_FAILED` |
  | サブリクエストを 51 回 | 51 回とも成功 |
  | メモリを 200〜1,500 MB 確保 | 512 MB までは 200、700 MB からは 500 `INTERNAL_SERVER_ERROR` |
  | `DELETE /v2/apps/{app}` | 204。同じアプリをもう一度消すと 404 `APP_NOT_FOUND` |

  約 100 秒で応答が切られる挙動は、公式には書かれていません。計算していても待っているだけでも同じ位置で切られたので、CPU ではなく応答までの時間の壁です。タイムアウトの後も次の呼び出しは 200 で、アプリが止められることはありませんでした。
  使用量は `GET /v2/apps/{app}/analytics` が 15 分ごとに返し、この検証全体の CPU は Free の月 10 時間の 1% 未満でした。アプリを呼んだのは 25 回前後です

### Vercel Functions

フロントエンドのホスティングに付く関数の実行環境で、Hobby でも 1 回 300 秒・メモリ 2 GB まで使えます。
ただ、Hobby は非商用の個人利用に限られるので、広告を載せるサイトでは選べません。

- **料金体系**: Hobby は USD 0 です。Pro は USD 20/月で、同額のクレジットが含まれます [10]。クレジットを超えた分は、100 万呼び出しあたり USD 0.60、Active CPU 1 時間あたり USD 0.128 から、Provisioned Memory 1 GB 時あたり USD 0.0106 からの従量です [12]
- **制約**: Hobby に含まれるのは月 100 万呼び出し、Active CPU 4 時間、Provisioned Memory 360 GB 時、転送 100 GB です [12][13]。
  実行時間は既定も最大も 300 秒で、Pro は 800 秒まで延ばせます。メモリは 2 GB / 1 vCPU の固定で、リクエストとレスポンスの本文は 4.5 MB までです。時間内に終わらないと 504 `FUNCTION_INVOCATION_TIMEOUT` が返ります [11]。
  Hobby は非商用の個人利用に限られます。訪問者への支払いの要求、商品やサービスの販売の宣伝、Google AdSense などの広告の掲載、アフィリエイトリンクが主目的のサイトは商用利用にあたります。寄付の依頼は商用利用にあたらないと注記されています [12]
- **前提条件**: アカウントのみです。カードの入力は Pro へ上げる手順の中にあります [13]。Hobby で上限を超えると、多くの機能は 30 日たつまで使えません [13]
- **検証した内容**: 公式の料金ページと docs を確認しました。「比較の前提」のとおり、このサイトは Hobby の条件に合わないため実行していません

### Netlify Functions

サイトのホスティングに付く関数の実行環境です。
無料プランの単位はクレジットで、関数の実行だけでなく、本番デプロイ・帯域・リクエストと同じ 300 を分け合います。

- **料金体系**: Free は USD 0 で月 300 クレジット、Personal は USD 9/月で 1,000 クレジット、Pro は USD 20/月で 3,000 クレジットからです [14][15]。Personal と Pro はクレジットを買い足せますが、Free は買い足せません [15][16]
- **制約**: クレジットの消費は、本番デプロイが 1 回 15、コンピュートが 1 GB 時あたり 10、帯域が 1 GB あたり 20、Web リクエストが 1 万件あたり 2 です [14][16]。本番デプロイだけで数えると、月 20 回で 300 を使い切ります。
  使い切ると全プロジェクトが一時停止し、訪問者には「Site not available」のページが出ます。残高は次の請求周期の頭に戻ります [16]。
  同期の関数は 60 秒、スケジュール関数は 30 秒、バックグラウンド関数は 15 分で、どれも変更できません。メモリは 1,024 MB で、変えられるのはクレジット制の Pro と Enterprise だけです。本文は 6 MB まで、既定のリージョンは米国東部（オハイオ）です [17]
- **前提条件**: アカウントのみです。Free でカードが要るかどうかは、料金ページにも docs にも記載がありません [14][15]。2025-09-04 以降に作ったアカウントはすべてクレジット制で、それより前のアカウントは旧プランのままです [15]
- **検証した内容**: 公式の料金ページと docs を確認しました。本番デプロイのたびに 15 クレジットを使うため、検証の回数を決めたうえで次回の更新で実行に上げます

### AWS Lambda

AWS の関数実行サービスで、1 回 15 分・メモリ 10 GB まで使える、5 つの中で最も上限の高い対象です。
月 100 万リクエストと 40 万 GB 秒の無料枠に期限はありませんが、登録に支払い方法が要ります。

- **料金体系**: 最低料金の無い従量です。米国東部（バージニア北部）の第 1 段は、x86 が USD 0.0000166667/GB 秒、Arm（Graviton2）が USD 0.0000133334/GB 秒で、リクエストはどちらも 100 万あたり USD 0.20 です [18][23]。
  料金ページの単価の表はリージョンを選ぶと描画されるので、数字は AWS が公開している価格表（Price List。発行日 2026-09-19）から読みました [23]
- **制約**: タイムアウトは最大 900 秒、メモリは 128〜10,240 MB（1,769 MB で 1 vCPU 相当）、同期呼び出しの本文は要求・応答とも 6 MB です。デプロイパッケージは zip で 50 MB、展開後 250 MB、コンテナイメージは 10 GB までです。同時実行の既定は 1,000 ですが、新規アカウントは同時実行とメモリの枠が低く始まり、利用に応じて自動で引き上げられます [19]。
  無料枠の月 100 万リクエストと 40 万 GB 秒は、x86 と Arm の両方に使えます [18]。メモリ 128 MB の関数なら、40 万 GB 秒は 320 万秒ぶんの実行時間にあたります
- **前提条件**: AWS アカウントが要ります。無料プランでも、本人確認と不正利用の防止のために有効な支払い方法の登録が必須で、有料プランに上げるまで請求はされません [21]。
  新規アカウントは登録時に USD 100、活動に応じて最大 USD 100 のクレジットを受け取ります。無料プランは 6 か月たつか、クレジットを使い切ると終わり、アカウントが閉じられます。データは 90 日保持され、その間に有料プランへ上げれば再開できます [20][21][22]。
  クレジットの有効期限はアカウントの作成から 12 か月で、6 か月以内に有料プランへ上げた場合も対象です。期限の無い無料枠は有料プランでも続きます [21]
- **検証した内容**: 公式の料金ページ・docs・FAQ を確認しました。登録にカードが要るため、実行はしていません

## 用途別の選び方

上から順に答えていくと、条件に合う対象にたどり着きます。各分岐の根拠は下の箇条書きと比較表の列に書いています。

{{< svg src="serverless-free-tier-flow.svg" alt="用途別の判断フロー。計算は数ミリ秒で済み、外部 API の応答待ちが中心で回数が多いなら Cloudflare Workers、1 回の呼び出しで秒単位の計算をし応答は 100 秒以内に返せるなら Deno Deploy、15 分までの長い処理や 2 GB を超えるメモリが要りカードを登録してよいなら AWS Lambda、非商用の個人プロジェクトで 1 回 300 秒とメモリ 2 GB が要るなら Vercel Functions の Hobby、すでに Netlify にサイトがあり関数を少し足すだけなら Netlify Functions" caption="図: 用途別の判断フロー" >}}

- 計算は数ミリ秒で済み、外部 API や LLM の応答を待つ時間が長い。回数は多い → Cloudflare Workers。「主な制約」列のとおり待ち時間は CPU 10 ms に数えられず、「検証した内容」では 300 秒の待ちも通りました。
  広告を載せるサイトでも使え、「前提条件」列のとおりカードも要りません
- 1 回の呼び出しで秒単位の計算をする。応答は 100 秒以内に返せる → Deno Deploy。「無料枠」列のとおり月 10 時間の CPU という総量で数えるので、1 回が重くても回数が少なければ収まります。
  ただし「主な制約」列のとおり、機械学習のような高 CPU 負荷とスクレイパーは利用規定で禁じられています。ページの取得を外に任せるなら、[スクレイピング API の無料枠比較](/posts/scraping-api-free-tier/)が対象になります
- 15 分までの長い処理や、2 GB を超えるメモリが要る。カードを登録してよい → AWS Lambda。「主な制約」列の 900 秒と 10,240 MB は 5 つの中で最も高い値です。
  「前提条件」列のとおり、無料プランのアカウントは 6 か月で閉じるので、続けて使うなら有料プランへの切り替えが前提になります
- 非商用の個人プロジェクトで、1 回 300 秒・メモリ 2 GB が要る → Vercel Functions の Hobby。「主な制約」列のとおり、広告の掲載やアフィリエイトが主目的のサイトでは使えません
- すでに Netlify にサイトがあり、関数を少し足すだけ → Netlify Functions。「無料枠」列のとおり本番デプロイ 1 回で 15 クレジットを使うので、関数より先にデプロイの回数が枠を決めます
- 15 分を超える処理や、常に動いているプロセスが要るなら、サーバーレスではなくサーバーを借りる形になります。[国内 VPS の最小プラン比較](/posts/vps-japan-minimum-plan/)が対象です

## 出典

1. [Cloudflare Docs — Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/) — 2026-09-20 確認
2. [Cloudflare Docs — Workers Limits](https://developers.cloudflare.com/workers/platform/limits/) — 2026-09-20 確認
3. [Cloudflare Docs — Create a Cloudflare account](https://developers.cloudflare.com/fundamentals/account/create-account/) — 2026-09-20 確認
4. [Cloudflare Docs — Workers Infrastructure as Code](https://developers.cloudflare.com/workers/platform/infrastructure-as-code/) — 2026-09-20 確認
5. [Cloudflare API — Upload Worker Module](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/methods/update/) — 2026-09-20 確認
6. [Deno Deploy — Pricing](https://deno.com/deploy/pricing) — 2026-09-20 確認
7. [Deno Docs — Deploy pricing and limitations](https://docs.deno.com/deploy/pricing_and_limits/) — 2026-09-20 確認
8. [Deno Docs — Deploy runtime](https://docs.deno.com/deploy/reference/runtime/) — 2026-09-20 確認
9. [Deno Docs — Deploy acceptable use policy](https://docs.deno.com/deploy/acceptable_use_policy/) — 2026-09-20 確認
10. [Vercel — Pricing](https://vercel.com/pricing) — 2026-09-20 確認
11. [Vercel Docs — Vercel Functions Limits](https://vercel.com/docs/functions/limitations) — 2026-09-20 確認
12. [Vercel Docs — Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines) — 2026-09-20 確認
13. [Vercel Docs — Hobby Plan](https://vercel.com/docs/plans/hobby) — 2026-09-20 確認
14. [Netlify — Pricing](https://www.netlify.com/pricing/) — 2026-09-20 確認
15. [Netlify Docs — Credit-based pricing plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/) — 2026-09-20 確認
16. [Netlify Docs — How credits work](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/) — 2026-09-20 確認
17. [Netlify Docs — Functions configuration](https://docs.netlify.com/build/functions/configuration/) — 2026-09-20 確認
18. [AWS Lambda — Pricing](https://aws.amazon.com/lambda/pricing/) — 2026-09-20 確認
19. [AWS Lambda Developer Guide — Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html) — 2026-09-20 確認
20. [AWS — Free Tier](https://aws.amazon.com/free/) — 2026-09-20 確認
21. [AWS — Free Tier FAQs](https://aws.amazon.com/free/free-tier-faqs/) — 2026-09-20 確認
22. [AWS Billing User Guide — Choosing a plan](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier-plans.html) — 2026-09-20 確認
23. [AWS Price List — AWSLambda（us-east-1）](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AWSLambda/current/us-east-1/index.json) — 2026-09-20 確認
