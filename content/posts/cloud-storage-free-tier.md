+++
title = 'クラウドストレージ 6 つの無料プラン比較: WebDAV や API で無料のまま動かせるか'
date = '2026-09-30T06:54:12+09:00'
# 最終確認日。出典の確認日・実行検証の最終日と揃え、再検証したら更新する（ヘッダーに出る）
lastmod = '2026-10-03'
draft = false
summary = 'Koofr・XServer ドライブ・pCloud・MEGA・Icedrive・Internxt の無料プランを、容量ではなく「WebDAV・API・CLI で無料のまま動かせるか」と「スクリプトに渡す認証が本体のパスワードかどうか」で比較。無料で WebDAV と REST API の両方が使え、アプリ専用パスワードで認証できるのは Koofr で、pCloud は WebDAV と rsync が無料プランでも使えると公式に明記されています。'
# tags / categories は URL に載るため英語（小文字・ハイフン区切り）で書く
categories = ['storage']
tags = ['cloud-storage', 'webdav', 'koofr', 'xserver', 'pcloud', 'mega', 'icedrive', 'internxt']
# OGP 用の画像。本文と一覧には出さない（hidden）。生成は desk の images/
[cover]
  image = '/images/og/cloud-storage-free-tier.jpg'
  alt = 'クラウドストレージの無料プラン比較'
  hidden = true
  hiddenInList = true
+++

{{< pr >}}

## 結論

クラウドストレージ 6 つの無料プランを、容量の大小ではなく「WebDAV・API・CLI で無料のまま動かせるか」と「スクリプトや AI に渡す認証が本体のパスワードかどうか」で比べました。

- **無料のまま、本体のパスワードを渡さずに WebDAV と API で動かしたい** → Koofr。アプリ専用パスワードを発行でき、WebDAV と REST API の両方をそれで認証できます
- **国内の事業者で、ファイルの種別に制限なく WebDAV を使いたい** → XServer ドライブのフリープラン。html や zip も、置いて取り出せることを WebDAV で確かめています
- **同じ容量の無料枠から、スクリプトで動かせるものを選びたい** → MEGA。公式の CLI から動かせます。
  Icedrive は WebDAV を新規ユーザーに止めていて、Internxt の CLI と WebDAV は最上位プランだけです

| こういう条件なら | 対象 | 決め手 |
| --- | --- | --- |
| 無料のまま、本体のパスワードを渡さずに WebDAV と REST API で動かしたい | Koofr | 「前提条件」列（アプリ専用パスワードで認証）と「無料枠」列（期限のない無料プラン） |
| 国内の事業者で、html や zip も種別の制限なく WebDAV で置きたい | XServer ドライブ | 「主な制約」列（ファイルごとの上限）と「前提条件」列（管理パネルの ID とパスワードで認証） |
| WebDAV か rsync を、無料プランで使えると公式に明記された対象で使いたい | pCloud | 「前提条件」列（WebDAV と rsync は無料を含む全プラン） |
| WebDAV ではなく、公式の CLI でスクリプトから動かしたい | MEGA | 「前提条件」列（公式 CLI の MEGA CMD）と「主な制約」列（転送量は IP アドレスごと） |
| 公式アプリとブラウザだけで使い、無料の容量を多めに取りたい | Icedrive | 「無料枠」列（容量）と「主な制約」列（WebDAV は新規ユーザーに無効） |
| 公式アプリとブラウザだけで使い、将来は最上位プランで公式 CLI を使う予定がある | Internxt | 「主な制約」列（CLI と WebDAV は最上位の Ultimate のみ） |

## 比較表

2026-10-03 時点の公式情報に基づきます。出典は末尾の番号に対応しています。
料金は最小の有料プランで揃え、通貨は各社の料金ページの表記のままです。対象名を押すと、その対象の詳細に移ります。

| 対象 | 料金 | 無料枠 | 主な制約 | 前提条件 | 検証区分 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| [Koofr](#koofr) | Free（EUR 0）。有料は Briefcase S（10 GB）EUR 0.5/月から。年払いのみ、VAT 22% 込み | **10 GB**。「Free forever」 | zip・exe・html などは公式アプリ以外の経路で制限。削除済みの保持 7 日、公開リンクの転送 50 GB/日 | アカウントのみ。カード登録なし。WebDAV と REST API は**アプリ専用パスワード**で認証 | {{< verified run >}} | [1][2][3][4] |
| [XServer ドライブ](#xserver-ドライブ) | フリープラン（0 円）。有料はスモールビジネス 月 3,960 円（1 か月契約）〜 2,970 円（36 か月）＋初期費用 11,000 円 | **2 GB**（SSD）・1 名 | 公式の上限は 1 ファイル 100 MB。API・CLI の公式の記載なし。有料は法人向けの料金体系 | XServer アカウント。WebDAV はストレージ管理パネルの ID とパスワードで認証 | {{< verified run >}} | [5][6] |
| [pCloud](#pcloud) | Free（USD 0）。有料は Premium 500 GB が月払い USD 4.99/月、年払い USD 49.99/年の表示から。買い切りあり | 登録時 **2 GB**。チュートリアルと招待で最大 10 GB | 共有リンクの転送 50 GB/月。API の接続先は登録地で US / EU に分かれる | メールとパスワード。WebDAV と rsync は無料を含む全プラン対応。初回接続はメールで承認 | {{< verified spec >}} | [7][8][9][10] |
| [MEGA](#mega) | Free（EUR 0）。有料は Essential 200 GB が EUR 3.33/月（年払い、税込 EUR 3.67）から。請求はユーロ | **10 GB** | 無料の転送量は IP アドレスごとの直近 6 時間のダウンロード量で制限。固定の上限値の記載なし | メールとパスワード。経路は公式 CLI の MEGA CMD。WebDAV は MEGA CMD が手元に立てる | {{< verified spec >}} | [11][12][13][14] |
| [Icedrive](#icedrive) | Free（USD 0）。有料は Pro 2 TB が USD 9.99/月、年払いは USD 99（初年度 USD 59 の表示） | **10 GB** | WebDAV は 2026-04-15 から新規ユーザーに無効。無料プランにバージョン履歴なし | アカウントのみ。料金ページの機能一覧に API・CLI・WebDAV の項目なし | {{< verified spec >}} | [15][16] |
| [Internxt](#internxt) | Free（EUR 0）。有料は Essential 1 TB が年払いプランで初月 EUR 1.99、以降 EUR 9.99/月の表示 | **1 GB** | CLI と WebDAV は Ultimate（5 TB）のみ。CLI と WebDAV は 1 ファイル 100 GB まで | 名前とメールで登録。CLI はブラウザ経由か、メールとパスワードでログイン | {{< verified spec >}} | [17][18] |

{{< bars unit="GB" caption="無料プランの容量。pCloud は登録時の値で、チュートリアルと招待で最大 10 GB まで増える" >}}
Koofr: 10
MEGA: 10
Icedrive: 10
pCloud（登録時）: 2
XServer ドライブ: 2
Internxt: 1
{{< /bars >}}

## 比較の前提

- 対象に含めたもの: 公式の料金ページで無料プランの容量を確認でき、ファイルを置いて取り出す用途のクラウドストレージ 6 つです。
  無料プランで WebDAV・API・CLI のどれかが使える 4 つ（Koofr・XServer ドライブ・pCloud・MEGA）と、無料では経路が無い 2 つ（Icedrive・Internxt）を並べています。
  経路が無い 2 つは、容量だけでは分からない違いを示す対比として載せました
- 除外したもの: Google ドライブ・Dropbox・OneDrive は対象に含めていません。3 社の API は、アプリを登録して OAuth 2.0 でアクセストークンを得る方式です [19][20][21]。
  この記事は「ID とパスワード、またはアプリ専用パスワードだけで、WebDAV・REST API・公式 CLI から動かせるか」を軸にしているため、前提が違う 3 社は並べていません。
  S3 互換のオブジェクトストレージも、用途と課金単位が違うため対象外です
- 検証区分の意味: {{< verified run >}} = AI が実際に動かして確認した / {{< verified spec >}} = 公式ドキュメントで確認したのみ
- 料金表記の注意: 金額と通貨は各社の料金ページの表記のままです。
  有料プランは通貨（EUR・USD・円）と容量の刻みが社ごとに違い、同じ軸に載らないため、棒グラフは単位が GB で揃う「無料プランの容量」だけに絞りました。
  XServer ドライブは法人向けのサービスで、有料プランは個人向けの 5 社と価格帯が違います。この記事では無料のフリープランを比較の対象にしています
- 選び方の軸: この記事の「経路」は、公式アプリやブラウザを使わずにファイルを操作する手段を指します。WebDAV は HTTP の拡張で、`curl` や rclone などの汎用のクライアントから使えます。
  「無料枠」列は容量で並びますが、無料プランに経路があるかどうかは容量とは別で、「主な制約」列と「前提条件」列で分かれます。
  「前提条件」列は、スクリプトや AI に渡す認証が分かれ目です。Koofr は本体のパスワードとは別にアプリ専用パスワードを発行でき、漏れたときはそれだけを無効にできます。
  XServer ドライブ・pCloud・MEGA は、アカウント（または管理パネル）のパスワードそのものを渡します。
  「主な制約」列は、経路があっても効く制限（ファイルの種別・ファイルごとの上限・転送量の数え方）と、経路そのものが無いこと（WebDAV の停止・最上位プランだけの CLI）で分かれます
- 検証の手順: Koofr と XServer ドライブの 2 つに 2026-09-28 に行いました。pCloud・MEGA・Icedrive・Internxt は公式ページの確認にとどめています。
  手順は (1) 認証して最上位のフォルダを一覧する (2) 専用フォルダを作り、テキストファイルを置いて一覧に出ることを確かめる (3) 取り出して sha256 が一致することを確かめる (4) html・zip などの種別のファイルを置いて取り出す (5) フォルダごと削除し、消えたことを確かめる、の 5 つです。
  触るのは検証用のフォルダの中だけで、どちらも外部に残したものはありません。結果は「各対象の詳細」の「検証した内容」に書いています（201・207・403 などは HTTP のステータスコードです）
- パスワードやアプリ専用パスワードをスクリプトに渡す手段は、[シークレット管理 CLI 6 つの比較](/posts/secret-management-cli/)で比べています。
  この記事の検証でも、そこで扱った `op run` で認証情報を注入しています

## 各対象の詳細

### Koofr

スロベニアの事業者が運営するクラウドストレージで、無料プランでも WebDAV と REST API の両方が使えます。
6 つのうち、アプリ専用パスワードで認証できることを公式に案内しているのは Koofr だけです。

{{< fit run >}}
向く: 無料のまま、本体のパスワードを渡さずに WebDAV と REST API で動かしたい
向かない: html などのファイルを、公式アプリ以外の経路で置いて取り出したい
{{< /fit >}}

- **料金体系**: 有料は Briefcase S のほかに、M（25 GB）EUR 1/月、L（100 GB）EUR 2/月があります [1]
- **制約**: 種別の制限の対象は zip・rar・exe・apk・html などで、効く経路は公開リンク・共有・WebDAV のような公式アプリ以外の経路です [3]。
  削除済みファイルの保持は、有料プランでは 30 日です [1]
- **前提条件**: WebDAV の接続先は `https://app.koofr.net/dav/Koofr` で、アプリ専用パスワードが無いと接続できません [2]。
  REST API は OAuth 2 のほかに、アプリ専用パスワードとメールアドレスを HTTP Basic で渡す方式があり、公式は後者をブラウザを開けないスクリプト向けとしています [4]
- **検証した内容**: 公式の料金ページ・ヘルプ・開発者ページを確認したうえで、2026-09-28 に Free のアカウントで「比較の前提」の 5 手順を WebDAV と REST API の両方で実行しました。
  認証はどちらもアプリ専用パスワードです。

  | 操作 | WebDAV | REST API |
  | --- | --- | --- |
  | 一覧 | PROPFIND が 207 | `GET /api/v2/places` が 200。容量は 10,240 MB |
  | フォルダ作成 → テキストを置く | 201 → 201 | 200 → 200 |
  | テキストを取り出す | 200、sha256 一致 | 200、sha256 一致 |
  | html・zip を置く | どちらも 201 | どちらも 200 |
  | zip を取り出す | 200、sha256 一致 | 200、sha256 一致 |
  | html を取り出す | **200 で本文が 0 バイト** | **403** `FileBlocked` |
  | フォルダ削除 → 確認 | 204 → 404 | 200 → 404 |

  種別の制限は置くときではなく、取り出すときに効きます。html は保存されて容量にも数えられますが、取り出せません。
  ただ、経路で見え方が違います。REST API は 403 とエラーコード `FileBlocked` を返しますが、WebDAV はエラーにならず空のファイルを返します。
  WebDAV でバックアップを戻す用途では、html が 0 バイトのまま処理が正常に終わる点に注意が要ります。
  公式ヘルプは zip も制限の対象に挙げていますが [3]、テキスト 1 本を入れた zip は両方の経路で取り出せました。
  検証の初回は認証情報の誤りで 401 が続き、6 回目から 429「Too many login retries」になりました。締め出しは 1 時間 45 分後も続いていました

### XServer ドライブ

エックスサーバーが運営する法人向けのクラウドストレージで、0 円のフリープランがあります。
6 つのうち国内の事業者はここだけで、料金は円建てです。

{{< fit run >}}
向く: 国内の事業者で、html や zip も種別の制限なく WebDAV で置きたい
向かない: 本体のパスワードを渡さずに動かしたい。API や CLI から動かしたい
{{< /fit >}}

- **料金体系**: スモールビジネスの容量は HDD 1 TB または SSD 500 GB です。
  月額は契約期間で変わり、3 か月は 3,960 円、6 か月は 3,630 円、12 か月は 3,300 円、24 か月は 3,135 円です（税込）。
  2026-10-14 17:00 までは 12 か月以上の契約が 20% 引きで、36 か月は月 2,376 円です [5]
- **制約**: 有料プランの 1 ファイルの上限は 5 GB です [5]。公式のマニュアルにあるのは WebDAV の接続手順です [6]
- **前提条件**: WebDAV の接続先は `https://<サーバーID>.xdrive.jp/remote.php/webdav/` です [6]。
  WebDAV 専用のパスワードを発行する仕組みはありません。2026-09-28 のフリープランの申込みでは、法人名とカードの入力は求められませんでした
- **検証した内容**: 公式の料金ページとマニュアルを確認したうえで、2026-09-28 にフリープランで「比較の前提」の 5 手順を WebDAV で実行しました。

  | 操作 | 結果 |
  | --- | --- |
  | 一覧（PROPFIND） | 207。管理パネルの ID とパスワードの Basic 認証で通る |
  | フォルダ作成 → テキストを置く | 201 → 201 |
  | テキストを取り出す | 200、sha256 一致 |
  | html・zip・exe を置いて取り出す | すべて 201 → 200、sha256 一致 |
  | 101 MiB のファイルを置く | **201**。一覧のサイズも 105,906,176 バイト |
  | フォルダ削除 → 確認 | 204 → 404 |

  種別の制限はありませんでした。公式の上限は 1 ファイル 100 MB ですが、WebDAV では 101 MiB のファイルを保存できました。上限がブラウザの画面側で効くのかは確かめていません。
  認証なしで読める `status.php` は、製品名 `XDRIVE`、バージョン 16.0.4 を返しました。WebDAV の経路（`remote.php/webdav`）は Nextcloud と同じ形式です

{{< cta "xserver-drive" >}}

### pCloud

スイスの事業者が運営するクラウドストレージで、サブスクリプションのほかに買い切りのプランがあります。
WebDAV と rsync が無料プランでも使えることを、公式ヘルプが明記しています。

{{< fit spec >}}
向く: WebDAV か rsync を、無料プランで使えると公式に明記された対象で使いたい
向かない: 本体のパスワードを渡さずに動かしたい。無料プランでの API の可否を公式の明記で確かめたい
{{< /fit >}}

- **料金体系**: 月払いは Premium Plus 2 TB が USD 9.99/月、Ultra 10 TB が USD 29.99/月です。年払いは 2026-10-03 時点で、USD 59.88 / 119.88 / 359.88 に取り消し線を引いた USD 49.99 / 99.99 / 299.99 が表示されています。
  買い切りは Premium 500 GB が USD 219、Premium Plus 2 TB が USD 499、Ultra 10 TB が USD 1,499 の表示です [8]
- **制約**: API の接続先は、アカウントの登録地によって US（`api.pcloud.com`）と EU（`eapi.pcloud.com`）に分かれます [10]
- **前提条件**: WebDAV の接続先は US が `https://webdav.pcloud.com`、EU が `https://ewebdav.pcloud.com` です。
  確認のメールは新しい端末からの接続でも届き、承認するまで接続できません。2 要素認証を有効にしたままでも使えます [9]
- **検証した内容**: 公式の料金ページ・ヘルプ・API ドキュメントを確認しました。公式ヘルプは WebDAV と rsync について「available for all pCloud plans, including free and paid accounts」と書いています [9]。
  一方、API のドキュメントにはプラン別の制限の記載がなく、無料プランで使えるとの明記もありません [10]。
  実行は次回の更新に回しています

### MEGA

ニュージーランドの事業者が運営するクラウドストレージで、公式のコマンドラインツール MEGA CMD を配布しています。
無料の容量は Koofr・Icedrive と並びますが、転送量の数え方がほかの対象と違います。

{{< fit spec >}}
向く: WebDAV ではなく、公式の CLI でスクリプトから動かしたい
向かない: 共有の回線や CI から大量に取り出したい（転送量の上限を見積もれない）
{{< /fit >}}

- **料金体系**: Essential のほかに、Pro Lite 750 GB が EUR 5.00/月（年払い一括、税込 EUR 5.50）です。
  料金ページは地域の通貨での推定額を表示します [11]
- **制約**: 転送量の上限は地域と混雑の状況で変わります。
  アップロードは転送量を使いません。1 つのファイルが 10 回を超えて全量ダウンロードされるまでは、そのファイルは転送量に数えられません [12]
- **前提条件**: MEGA CMD は非対話のコマンドを持ち、スクリプトから呼び出せます [13][14]。
  WebDAV は MEGA 側に接続先があるのではなく、MEGA CMD が手元に WebDAV のサーバーを立てる方式です [13]
- **検証した内容**: 公式の料金ページ・ヘルプ・MEGA CMD のページを確認しました。MEGA CMD のページとヘルプにプラン別の制限の記載はなく、無料プランで使えるとの明記もありません [13][14]。
  実行は次回の更新に回しています

### Icedrive

ジブラルタルの事業者が運営するクラウドストレージで、無料の容量は Koofr・MEGA と並びます。
WebDAV を新規ユーザーに止めており、無料プランで公式アプリ以外から動かす経路が公式ページにありません。

{{< fit spec >}}
向く: 公式アプリとブラウザだけで使い、API や WebDAV は要らない
向かない: WebDAV・API・CLI のどれかで、スクリプトから動かしたい
{{< /fit >}}

- **料金体系**: 有料は Pro のほかに、Pro Plus 4 TB が USD 15.99/月、Pro Max 6 TB が USD 26.99/月です。
  年払いは Pro Plus が USD 159、Pro Max が USD 269 で、2026-09-30 時点では初年度 40% 引きの USD 89 / 149 が表示されています [15]
- **制約**: WebDAV を止めたのは新規ユーザーに対してで、既存のユーザーは当面使えますが、今後の更新で完全に廃止すると公式ヘルプが書いています [16]
- **前提条件**: 表の「前提条件」列に載せた以外の条件は、料金ページにありません [15]
- **検証した内容**: 公式の料金ページとヘルプを確認しました。無料プランで動かせる経路が無いため、実行の対象にしていません

### Internxt

スペインの事業者が運営するクラウドストレージで、公式の CLI をオープンソースで公開しています。
ただ、CLI と WebDAV を使えるのは最上位の Ultimate だけです。

{{< fit spec >}}
向く: 公式アプリとブラウザだけで使い、将来は最上位プランで公式 CLI を使う予定がある
向かない: 無料プランや下位の有料プランで、CLI や WebDAV から動かしたい
{{< /fit >}}

- **料金体系**: 有料の年払いプランは、Essential のほかに Premium 3 TB が初月 EUR 3.99・以降 EUR 19.99/月、Ultimate 5 TB が初月 EUR 5.99・以降 EUR 29.99/月と表示されています [17]
- **制約**: 公式の CLI の README は、CLI を使えるのは Ultimate のユーザーだけと書いています [18]。
  料金ページのプランのカードでも、「CLI & WebDav support」が載っているのは Ultimate だけです [17]
- **前提条件**: 登録に本人確認とメールの確認はありません [17]
- **検証した内容**: 公式の料金ページと CLI の README（v1.6.9）を確認しました。無料プランで動かせる経路が無いため、実行の対象にしていません

## 用途別の選び方

上から順に答えていくと、条件に合う対象にたどり着きます。各分岐の決め手は比較表の列で、数字はそちらを見てください。

{{< svg src="cloud-storage-free-tier-flow.svg" alt="用途別の判断フロー。無料のまま本体のパスワードを渡さずに WebDAV や API で動かしたいなら Koofr、国内の事業者で種別の制限なく WebDAV を使いたいなら XServer ドライブ、WebDAV か rsync を公式に明記された無料プランで使いたいなら pCloud、公式の CLI でスクリプトから動かしたいなら MEGA、公式アプリだけで使うなら Icedrive か Internxt" caption="図: 用途別の判断フロー" >}}

- 無料のまま、スクリプトや AI に本体のパスワードを渡さずに動かしたい → Koofr。決め手は「前提条件」列です。
  html などは、公式アプリ以外の経路では取り出せません
- 国内の事業者で、html や zip も種別の制限なく置きたい → XServer ドライブ。決め手は「主な制約」列と「無料枠」列で、ファイルごとの上限と容量に収まる用途ならフリープランの WebDAV で足ります。
  渡すのは管理パネルのパスワードそのものです
- WebDAV か rsync を、公式に明記された無料プランで使いたい → pCloud。決め手は「前提条件」列です。初回の接続はメールでの承認が要ります
- WebDAV ではなく、公式の CLI でスクリプトから動かしたい → MEGA。決め手は「前提条件」列です。
  無料の転送量は IP アドレスごとに数えられるため、共有の回線や CI から大量に取り出す用途では上限を見積もれません
- 公式アプリとブラウザだけで使い、API や WebDAV は要らない → Icedrive か Internxt。決め手は「無料枠」列と「主な制約」列です。
  どちらも無料プランに公式アプリ以外の経路がありません

XServer ドライブと同じ XServer アカウントで申し込める共用サーバーは、[国内の共用レンタルサーバー比較](/posts/shared-hosting-japan/)で扱っています。
パスワードをスクリプトに直接書かずに渡す手段は、[シークレット管理 CLI 6 つの比較](/posts/secret-management-cli/)で比べています。

## よくある質問

### 無料プランで WebDAV が使えるクラウドストレージは？

Koofr と XServer ドライブは、無料プランで WebDAV に接続し、ファイルを置いて取り出せることを 2026-09-28 に確かめています [2][6]。
pCloud は、WebDAV と rsync を無料を含む全プランで使えると公式ヘルプが書いています [9]。
Icedrive は 2026-04-15 から新規ユーザーの WebDAV を無効にしていて、Internxt の WebDAV は Ultimate だけです [16][17]。

### スクリプトや AI に本体のパスワードを渡さずに済みますか？

Koofr は本体のパスワードとは別にアプリ専用パスワードを発行でき、WebDAV と REST API の両方をそれで認証できます [2][4]。
XServer ドライブ・pCloud・MEGA は、管理パネルやアカウントのパスワードそのもので認証します [6][9][13]。

### 無料で容量が大きいのはどれですか？

Koofr・MEGA・Icedrive が 10 GB で並びます [1][11][15]。pCloud は登録時 2 GB で、チュートリアルの完了と招待で最大 10 GB まで増えます [7]。
XServer ドライブは 2 GB、Internxt は 1 GB です [5][17]。

### Google ドライブや Dropbox はなぜ比べていないのですか？

3 社の API は、アプリを登録して OAuth 2.0 でアクセストークンを得る方式です [19][20][21]。
この記事は ID とパスワード、またはアプリ専用パスワードだけで動かせるかを軸にしているため、前提が違う 3 社は並べていません。

## 出典

1. [Koofr Pricing](https://koofr.eu/pricing/) — 2026-10-03 確認
2. [Koofr Help — How do I connect a service to Koofr through WebDAV?](https://koofr.eu/help/koofr_with_webdav/how-do-i-connect-a-service-to-koofr-through-webdav/) — 2026-10-03 確認
3. [Koofr Help — I have a free account and cannot share certain files, why?](https://koofr.eu/help/share-files-and-folders/i-have-a-free-account-and-cannot-share-certain-files-why/) — 2026-10-03 確認
4. [Koofr Developers](https://app.koofr.net/developers) — 2026-10-03 確認
5. [XServer ドライブ 料金プラン](https://drive.xserver.ne.jp/price/) — 2026-10-03 確認
6. [XServer ドライブ マニュアル — WebDAV 接続（Windows 10）](https://drive.xserver.ne.jp/support/manual/man_setting_webdav_windows10.php) — 2026-10-03 確認
7. [pCloud Help — Plan details](https://help.pcloud.com/article/plan-details) — 2026-10-03 確認
8. [pCloud Pricing](https://www.pcloud.com/cloud-storage-pricing-plans.html) — 2026-10-03 確認
9. [pCloud Help — Connect to pCloud using WebDAV and rsync](https://help.pcloud.com/article/connect-to-pcloud-using-webdav-and-rsync) — 2026-10-03 確認
10. [pCloud Developers](https://docs.pcloud.com/) — 2026-10-03 確認
11. [MEGA Pricing](https://mega.io/pricing) — 2026-10-03 確認
12. [MEGA Help Centre — What is transfer quota on MEGA?](https://help.mega.io/plans-storage/space-storage/transfer-quota) — 2026-10-03 確認
13. [MEGA CMD](https://mega.io/cmd) — 2026-10-03 確認
14. [MEGA Help Centre — What is MEGA CMD?](https://help.mega.io/desktop-app/mega-cmd/cmd) — 2026-10-03 確認
15. [Icedrive Plans & Pricing](https://icedrive.net/plans) — 2026-10-03 確認
16. [Icedrive Support — Does Icedrive support WebDAV?](https://icedrive.net/help/account/does-icedrive-support-webdav) — 2026-10-03 確認
17. [Internxt Pricing](https://internxt.com/pricing) — 2026-10-03 確認
18. [Internxt CLI（公式 GitHub の README）](https://github.com/internxt/cli) — 2026-10-03 確認
19. [Google Drive API — Choose Google Drive API scopes](https://developers.google.com/workspace/drive/api/guides/about-auth) — 2026-10-03 確認
20. [Dropbox — OAuth Guide](https://docs.dropboxapi.com/dropbox-api/docs/oauth) — 2026-10-03 確認
21. [Microsoft Graph — Authentication and authorization basics](https://learn.microsoft.com/en-us/graph/auth/auth-concepts) — 2026-10-03 確認
