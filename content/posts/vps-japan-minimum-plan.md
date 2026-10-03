+++
title = '国内 VPS 5 社の最小プラン比較: 時間課金と API の有無で選ぶ'
date = '2026-09-02T23:07:57+09:00'
lastmod = '2026-10-03'
draft = false
summary = '国内 VPS 5 サービスの最小プランを、料金・課金単位・お試し・最低利用期間・API の有無で比較。AI やスクリプトから作成〜削除まで自動化するなら ConoHa VPS 3.0、最安で API があるのは WebARENA Indigo。ConoHa は Terraform で実際に作成・計測・削除した結果を載せる。'
categories = ['hosting']
tags = ['vps', 'conoha', 'sakura-internet', 'kagoya', 'xserver', 'webarena']
# OGP 用の画像。本文と一覧には出さない（hidden）。生成は desk の images/gen.sh
[cover]
  image = '/images/og/vps-japan-minimum-plan.jpg'
  alt = '国内 VPS の最小プラン比較'
  hidden = true
  hiddenInList = true
+++

{{< pr >}}

## 結論

国内の VPS 5 サービスの最小プランを、「AI やスクリプトから作って消せるか」を軸に比べました。

- **API や Terraform から作成〜削除まで自動化したい** → ConoHa VPS (Ver.3.0)。サーバー作成まで含む公式 API と Terraform provider を出していて、しかも時間課金なのはここだけです
- **常時動かして月額を抑えたい** → WebARENA Indigo。1GB クラスの月上限が 5 社で最も低く、REST API もあります
- **API は要らず、日単位で使いたい** → KAGOYA CLOUD VPS。日額課金に月上限が付いた料金体系です

| こういう条件なら | 対象 | 決め手 |
| --- | --- | --- |
| API・Terraform・MCP から作成〜削除まで自動化する | ConoHa VPS (Ver.3.0) | 「前提条件」列（サーバー作成を含む公式 API と Terraform provider）と「主な制約」列（時間課金） |
| 常時稼働で月額を最小にする | WebARENA Indigo | 「料金」列（1GB の月上限が最も低い）。最小プランの IPv4 の有無は「主な制約」列 |
| API は不要で、月の途中から日割りで使う | KAGOYA CLOUD VPS | 「料金」列（日額と月上限） |
| 無料で試す | さくらのVPS | 「無料枠」列（期間限定のお試し）。本契約へ自動で移る点は「主な制約」列 |
| 上位寄りのスペックから始める | Xserver VPS | 「料金」列（最小プランが大きい）。新規受付の停止は「主な制約」列 |

{{< cta "conoha-vps" >}}

## 比較表

2026-10-03 時点の公式情報に基づきます。出典は末尾の番号に対応しています。対象名を押すと、その対象の詳細に移ります。

| 対象 | 料金 | 無料枠 | 主な制約 | 前提条件 | 検証区分 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| [ConoHa VPS (Ver.3.0)](#conoha-vps-ver30) | 512MB（1 vCPU・SSD 30GB）は 1.3 円/時、月上限 751 円。1GB（2 vCPU・SSD 100GB）は 1.9 円/時、月上限 1,065 円。36 か月前払いの「まとめトク」なら 512MB 293 円/月（更新時は 326 円/月） | なし | 1 時間単位の課金で月上限あり。まとめトクは途中解約不可。初期費用なし | ConoHa アカウントと支払い手段。公開 API（OpenStack 準拠）、Terraform provider、MCP サーバーが公式。Ubuntu 22.04 / 24.04 / 26.04、Debian 12 / 13 ほか | {{< verified run >}} | [1][2][3][4][5][6] |
| [さくらのVPS](#さくらのvps) | 512MB（1 vCPU・SSD 25GB）は石狩 643 円/月、東京 698 円/月。1GB（2 vCPU・SSD 50GB）は石狩 880 円/月、東京 990 円/月 | クレジットカード払いで 2 週間無料。同時 2 台まで | 月額・年額のみ。最低利用期間 3 か月。お試し期間中に解約しないと自動で本契約。API は電源操作・状態取得などで、サーバー作成・削除は不可。Ubuntu 24.04 は 1GB 以上のプランのみ | さくらインターネット会員 ID と支払い手段。IPv4・IPv6 各 1 個。リージョンは東京・大阪・石狩 | {{< verified spec >}} | [7][8][9][10][11] |
| [KAGOYA CLOUD VPS](#kagoya-cloud-vps) | 1GB は日額 20 円、月上限 550 円、年額 6,072 円 | なし（アカウント登録は無料） | 日額（月上限あり）または年額。公式マニュアルに API の項目がない。スナップショットと無停止スケールアップあり | KAGOYA アカウントと支払い手段。OS テンプレート 12 種（Ubuntu 24.04 / 26.04 を含む） | {{< verified spec >}} | [12][13][14] |
| [Xserver VPS](#xserver-vps) | 2GB（3 vCPU・NVMe 50GB）は 1 か月契約 2,640 円（更新 1,980 円）、36 か月契約 2,035 円/月（更新 1,265 円/月）。受付停止前（2026-09-02）の表示 | 「無料VPS」（2GB / 4GB、NVMe 30GB、30Mbps）。毎日コントロールパネルから手動で契約更新が必要で、更新の自動化は不正行為 | 月額のみで契約期間分を一括前払い。2026-10-03 時点で新規申込みの受付を全プランで一時停止（契約中のアカウントは追加申込み可）。XServer API はレンタルサーバー向けで、VPS の作成・削除は対象外 | Xserver アカウント。無料VPS もクレジットカード登録が必要。Ubuntu 22.04 / 24.04 / 26.04、Debian 11〜13 ほか | {{< verified spec >}} | [15][16][17][18] |
| [WebARENA Indigo](#webarena-indigo) | 768MB（1 vCPU・SSD 20GB）は 0.52 円/時、月上限 319 円。1GB（1 vCPU・SSD 20GB）は 0.70 円/時、月上限 449 円 | 500 円分のクーポン | 1 時間単位の課金で月上限あり。最低利用料 55 円/計算期間。停止中も課金。768MB は IPv6 のみで IPv4 なし。初期上限 3 インスタンス（45 日後に 25 へ変更可、それ以上は eKYC 本人確認） | NTT 系の WebARENA アカウント。REST API あり（ドキュメントは英語のみ）。Ubuntu 18.04〜24.04、Rocky、Alma、Debian ほか | {{< verified spec >}} | [19][20][21][22] |

メモリ 1GB のプランを 1 か月動かしたときの上限額を並べると、次のようになります。
Xserver は最小が 2GB なので、2GB の 1 か月契約（更新時）を参考値として入れています。

{{< bars unit="円/月" caption="1GB クラスのプランを 1 か月動かしたときの上限額（税込。出典は比較表と同じ）" >}}
WebARENA Indigo 1GB: 449
KAGOYA CLOUD VPS 1GB: 550
さくらのVPS 1GB（石狩）: 880
ConoHa VPS 1GB: 1065
Xserver VPS 2GB（参考）: 1980
{{< /bars >}}

## 比較の前提

- 対象に含めたもの: 国内事業者が提供し、公式サイトで料金と上限を公開している VPS のうち、
  個人が支払い手段を登録すれば申し込める 5 サービスです。各社の最小プランと、Ubuntu 24.04 を動かせる最小プランを載せました
- 除外したもの: AWS Lightsail・Google Cloud・Vultr などの海外事業者。通貨・税・リージョンの前提が揃わないため、別の記事で扱います。
  レンタルサーバーは root 権限がなく比較軸が異なるため、ConoHa の GPU プランと Windows Server プランは用途が違うため、それぞれ外しました。
  静的サイトを置くだけなら VPS は要らず、無料ホスティングの比較は[別の記事](/posts/static-site-hosting-free-tier/)にまとめています。
  root 権限が不要なら、[国内の共用レンタルサーバー比較](/posts/shared-hosting-japan/)のほうが月額を抑えられます
- 検証区分の意味: {{< verified run >}} = AI が実際に動かして確認した / {{< verified spec >}} = 公式ドキュメントで確認したのみ
- 料金表記の注意: 料金はすべて税込で、各社の公式ページの表記をそのまま載せています。キャンペーン価格は含めていません
- 選び方の軸: 「料金」列は、時間課金に月上限が付くもの（ConoHa・WebARENA Indigo）、日額に月上限が付くもの（KAGOYA）、月額・年額だけのもの（さくら・Xserver）に分かれます。
  「前提条件」列は、サーバーの作成・削除まで届く公式 API があるかで分かれ、届くのは ConoHa と Indigo だけです。
  「無料枠」列は、お試しが本契約へ自動で移るか、毎日の手動更新が要るかで、試すだけの用途に使えるかが決まります
- 検証の手順: ConoHa VPS に 2026-09-02 に行いました。Terraform provider で 1GB プランのサーバーを作成し、SSH で初期状態を記録して、
  CPU・メモリ・ディスク・回線を計測してから削除する、の順です。ほかの 4 社は公式ページの確認にとどめています。
  結果は「各対象の詳細」の「検証した内容」に書いています

## 各対象の詳細

### ConoHa VPS (Ver.3.0)

この記事で唯一、実際にサーバーを作って計測した対象です。作成から削除までを API 経由で行い、
人間が触ったのは API ユーザーの発行だけでした。

{{< fit run >}}
向く: API・Terraform・MCP から作成〜削除まで自動化したい。短時間だけ動かして消す検証に使いたい
向かない: 前払いの割引を使いながら途中で解約したい。5 社で最も低い月額を求める
{{< /fit >}}

- **料金体系**: 2GB プランは 3.7 円/時（上限 2,033 円）です。1〜36 か月の前払い「まとめトク」は最大 68% 引きになりますが、途中解約はできません。
  契約更新時の単価は初回より高くなります [1]
- **制約**: プランに含まれる SSD（512MB で 30GB、1GB 以上で 100GB）がブートボリュームになります [1]。
  OS テンプレートは Ubuntu 22.04 / 24.04 / 26.04、Debian 12 / 13、AlmaLinux、Rocky Linux、Arch Linux、FreeBSD など。
  Docker、GitLab、Dokku、Jenkins などのアプリケーションテンプレートも 40 種以上あります [6]
- **前提条件**: API を使うにはコントロールパネルで API ユーザーを発行します。
  公開 API は OpenStack 準拠で、Identity / Compute / Image / Volume / Network の各 API があります [2][5]。
  Terraform provider（`gmo-internet/conohavps`、Ver.3.0 専用、ベータ）[3] と MCP サーバー（OSS 版とリモート版、ベータ）[4] が公式に提供されています
- **検証した内容**: 2026-09-02 に Terraform provider 0.1.0 を使い、AI が 1GB プラン（flavor `g2l-t-c2m1`）に Ubuntu 24.04 テンプレート（`vmi-ubuntu-24.04-amd64`）で 100GB のブートボリュームを付けてサーバーを作成し、
  計測後に削除しました。所要時間は次のとおりです。

  | 工程 | 所要時間 |
  | --- | --- |
  | `terraform apply`（キーペア・ボリューム・サーバー） | 37 秒（ボリューム 10 秒、サーバー 22 秒） |
  | apply 完了から SSH 応答まで | 2 秒以内 |
  | `terraform destroy` | 約 5 秒 |

  作成直後の状態は、Ubuntu 24.04.3 LTS、カーネル 6.8.0、Intel Xeon (Icelake) 2 vCPU、メモリ 960 MiB で、
  swap 2 GiB が既定で有効、IPv4 と IPv6 が各 1 個付いていました。待受ポートは 22 のみで、ufw と fail2ban が有効です。
  root で直接ログインする構成で、SSH 鍵を登録した場合はパスワード認証が無効になります。

  ```
  $ ssh root@<ip> 'cat /etc/os-release | head -1; nproc; free -m | head -2; ss -tlnp | grep -c LISTEN'
  PRETTY_NAME="Ubuntu 24.04.3 LTS"
  2
                 total        used        free
  Mem:             960         427         124
  4
  ```

  ひとつ注意点があります。**初回起動直後に unattended-upgrades が 237 パッケージ（カーネル・systemd・openssh を含む）の更新を始め、
  dpkg のロックを 10 分以上握りました。** 作成直後に `apt-get install` を実行する自動化は、ロックの解放を待たないと失敗します。
  更新が終わってからの計測値は次のとおりです。

  | 項目 | 実測値 |
  | --- | --- |
  | sysbench cpu（prime 20000、2 スレッド、15 秒） | 1,624 events/s |
  | sysbench memory（1 MiB ブロック、8 GiB） | 17,393 MiB/s |
  | fio 4k ランダム read/write（QD32、direct） | read 24.8k IOPS / write 24.7k IOPS |
  | fio 1M シーケンシャル read（QD16、direct） | 1,270 MiB/s |
  | HTTP ダウンロード 200 MB（国内ミラー 2 か所） | 11.4〜12.5 MB/s（約 91〜100 Mbps） |
  | ping 1.1.1.1（IPv4）/ 2606:4700:4700::1111（IPv6） | 平均 0.87 ms / 0.74 ms |

  9 月分の確定明細（2026-10-03 確認）では、VPS 1GB の行が「1 Hrs」で 1.65 円、小計 1.65 円、消費税 0.165 円、
  合計 1 円でした（23 分の稼働が 1 時間分に切り上げ）。ブートストレージ 100 GB の行は明細に載っていません。
  料金ページの表記は 1GB が 1.9 円/時（税込）で、明細の 1.65 円（税抜）に消費税を足した額とは一致していません。
  合計 1 円にはクーポンが充当され、実際の請求額は 0 円でした。
  削除後に API でサーバー・ボリューム・キーペアが 0 件になったことも確認しています

{{< cta "conoha-vps" >}}

### さくらのVPS

2 週間の無料お試しがあるのは 5 社の中でここだけです。ただし、そのまま本契約に移る仕組みなので、
試すだけのつもりでも期限の管理が要ります。

{{< fit spec >}}
向く: 無料で試したい（お試しの期限を自分で管理できる）。東京・大阪・石狩からリージョンを選びたい
向かない: サーバーの作成・削除を API から行いたい。試すだけで本契約に移りたくない
{{< /fit >}}

- **料金体系**: 大阪リージョンは 512MB が 671 円、1GB が 935 円です。年額は 12 か月分から約 1 か月分を割り引いた額で、初期費用はありません [7]
- **制約**: お試し期間中は 25 番ポートの送信とネームサーバーの利用が制限されます [8]
- **前提条件**: Ubuntu 24.04 の初期ユーザーは `ubuntu` で root ログインは不可、IPv6 は初期無効、swap なしです [10]
- **検証した内容**: 仕様区分です。上記の公式ページ [7]〜[11] を 2026-09-02 に確認しました。
  お試し期間が本契約に自動移行し、最低利用期間 3 か月が付くため、AI による申込みは行っていません

{{< cta "sakura-vps" >}}

### KAGOYA CLOUD VPS

日額課金で月上限もあるという、時間課金と月額の中間のような料金体系です。
API がないため、自動化よりはコントロールパネルで手動運用する人向けです。

{{< fit spec >}}
向く: API は不要で、月の途中から日割りで使いたい。コントロールパネルで手動運用する
向かない: 作成・削除をスクリプトから自動化したい
{{< /fit >}}

- **料金体系**: 月上限に達しても利用は制限されません [12]
- **制約**: 公式マニュアルの目次（NVMe、Windows Server、KVM、OpenVZ、SSH 接続、ドメイン、SSL、スタートアップガイド）に API の項目がなく、作成・削除はコントロールパネルで行います [14]
- **前提条件**: 表の「前提条件」列に載せた以外の条件は公式ページにありません [13][14]
- **検証した内容**: 仕様区分です。上記の公式ページ [12]〜[14] を 2026-09-02 に確認しました。
  API がないため、AI 単独での作成・削除は行っていません

{{< cta "kagoya-vps" >}}

### Xserver VPS

最小プランが 2GB からで、5 社の中では上位寄りのスペックと価格です。
「無料VPS」がありますが、毎日の手動更新が条件で、自動化した運用には向きません。

{{< fit spec >}}
向く: 上位寄りのスペックから始めたい（契約中のアカウントで追加申込みできる）
向かない: 新規でいま申し込みたい。無料VPS を自動化した運用に使いたい
{{< /fit >}}

- **料金体系**: 4GB プランは 1 か月契約 5,280 円（更新 2,640 円）です。初期費用はありません [15]。
  この金額は 2026-09-02 時点の表示で、2026-10-03 時点の料金ページは受付停止のため 2GB の金額を表示していません
- **制約**: 「無料VPS」は更新を自動化するスクリプトやボットの利用が不正行為とされ、メール送信・イメージ保存・サポートは対象外です [16]。
  2026 年 4 月に提供が始まった XServer API は、エックスサーバーと XServer ビジネス（レンタルサーバー）向けです [18]
- **前提条件**: OS イメージは Ubuntu 22.04 / 24.04 / 26.04、Debian 11〜13、AlmaLinux、Rocky Linux、Oracle Linux、CentOS Stream、Fedora、Arch Linux、openSUSE です [17]
- **検証した内容**: 仕様区分です。上記の公式ページ [15]〜[18] を 2026-09-02 に確認しました。
  無料VPS は毎日の手動更新が条件で自動化が禁止されているため、AI による利用は行っていません

### WebARENA Indigo

5 社で最も安く、REST API もあります。ただしドキュメントが英語のみで、最小の 768MB プランには IPv4 が付きません。

{{< fit spec >}}
向く: 常時稼働で月額を最小にしたい。REST API で作成・削除したい（英語のドキュメントを読む）
向かない: 最小プランで IPv4 が要る。停止中は課金を止めたい
{{< /fit >}}

- **料金体系**: 2GB プランは 1.27 円/時（上限 814 円）です。初期費用はありません [19]
- **制約**: 1GB 以上は IPv4・IPv6 各 1 個です [19][20]。スナップショットは 1 インスタンス 5 個までです [20]
- **前提条件**: ダッシュボードで API 鍵を発行してアクセストークンを取得します [20][22]。
  OS は Ubuntu 18.04〜24.04、CentOS、Rocky Linux、AlmaLinux、Debian、Oracle Linux [20]
- **検証した内容**: 仕様区分です。上記の公式ページ [19]〜[22] を 2026-09-02 に確認しました。
  API でサーバー作成が可能なため、次回の更新で ConoHa と同じ手順を流して実行区分に置き換える予定です

## 用途別の選び方

上から順に答えていくと、条件に合う対象にたどり着きます。各分岐の決め手は比較表の列で、数字はそちらを見てください。

{{< svg src="vps-japan-minimum-plan-flow.svg" alt="用途別の判断フロー。自動化したいなら ConoHa、月額最小なら WebARENA Indigo、日単位なら KAGOYA、無料で試すならさくら、それ以外はスペックかリージョンで Xserver かさくら" caption="図: 用途別の判断フロー" >}}

- API・Terraform・MCP から作成〜削除まで自動化する → ConoHa VPS。決め手は「前提条件」列です。Indigo の REST API は英語ドキュメントのみで、さくらの API は作成・削除に対応していません
- 短時間だけ動かして消す検証用途 → ConoHa か WebARENA Indigo。決め手は「主な制約」列（時間課金）です。Indigo は停止中も課金され、最低利用料があります
- 常時稼働で月額を最小にする → WebARENA Indigo の 1GB。決め手は「料金」列です。IPv4 が要らなければ 768MB で足り、
  国内リージョンの選択やスナップショットが要るならさくらのVPS の 1GB が候補です
- API は不要で、月の途中で始めても日割りにしたい → KAGOYA CLOUD VPS。決め手は「料金」列（日額と月上限）です
- 無料で試したい → さくらのVPS のお試し。決め手は「無料枠」列です。期間内に解約しないと最低利用期間つきの本契約に移る点は「主な制約」列を見てください。
  Xserver の無料VPS は毎日の手動更新が条件で、自動化した運用には使えません

下は、この記事の対象のうち提携している 3 社の公式サイトへのリンクです。順位は上の結論と同じで、
WebARENA Indigo と Xserver VPS は提携が無いためここには載せていません。

{{< ranking >}}
conoha-vps: サーバー作成まで含む公式 API と Terraform provider があり、1 時間単位の課金で作って消せる唯一の対象です。この記事で実際に作成〜計測〜削除まで通しました
kagoya-vps: API は無くコントロールパネルでの操作になりますが、日額 20 円・月上限 550 円で月の途中から日割りで使えます。提携 3 社では 1GB の月上限が最も安くなります
sakura-vps: 5 社で唯一 2 週間の無料お試しがあり、東京・大阪・石狩からリージョンを選べます。API は電源操作までで、お試し期間中に解約しないと最低利用期間 3 か月の本契約に移行します
{{< /ranking >}}

常時稼働させるサーバーの死活監視は、[死活監視の無料枠 5 つの比較](/posts/uptime-monitoring-free-tier/)で無料枠を比べています。
自前のサーバーに立てる Uptime Kuma も、その記事で実際に起動して確認しています。
Terraform や API に渡す認証情報を AI にどう持たせるかは、[シークレット管理 CLI 6 つの比較](/posts/secret-management-cli/)で、機械向けトークンと `run` 相当の注入を実際に動かして比べています。

## よくある質問

### 国内の VPS で、API からサーバーを作成・削除できるのはどれですか？

ConoHa VPS (Ver.3.0) と WebARENA Indigo です。ConoHa は OpenStack 準拠の公開 API に加えて Terraform provider と MCP サーバーが公式にあり [2][3][4][5]、
Indigo は REST API があります（ドキュメントは英語のみ）[20][22]。さくらのVPS の API は電源操作や状態取得までで、作成・削除はできません [9]。
KAGOYA は公式マニュアルに API の項目が無く [14]、XServer API は VPS の作成・削除を対象にしていません [18]。

### 無料で試せる VPS はありますか？

さくらのVPS にクレジットカード払いで 2 週間の無料お試しがあり、期間内に解約しないと最低利用期間 3 か月の本契約に移行します [7][8]。
Xserver VPS の「無料VPS」は毎日コントロールパネルから手動で契約更新する条件で、更新の自動化は不正行為とされています [16]。
WebARENA Indigo は 500 円分のクーポンが付きます [19]。

### 1 時間だけ使って消した場合、いくらかかりますか？

時間課金の ConoHa VPS と WebARENA Indigo なら 1〜2 円です。ConoHa の 1GB は 1.9 円/時 [1]、Indigo の 1GB は 0.70 円/時ですが、Indigo には計算期間ごとの最低利用料 55 円があります [19]。
ConoHa の 9 月分の明細では、23 分の稼働が 1 時間分に切り上げられ、消費税を含めて 1 円でした。

### 最小プランで Ubuntu 24.04 は使えますか？

ConoHa VPS・KAGOYA CLOUD VPS・Xserver VPS・WebARENA Indigo は Ubuntu 24.04 のテンプレートを選べます [6][13][17][20]。
さくらのVPS は Ubuntu 24.04 が 1GB 以上のプランだけで、512MB では選べません [10]。

## 出典

1. [ConoHa VPS 料金・スペック](https://vps.conoha.jp/pricing/) — 2026-10-03 確認
2. [ConoHa VPS API](https://vps.conoha.jp/function/api/) — 2026-10-03 確認
3. [ConoHa ドキュメント — Terraform ConoHa VPS Provider](https://doc.conoha.jp/reference/terraform/terraform-conoha-vps-provider/) — 2026-10-03 確認
4. [ConoHa ドキュメント — ConoHa VPS MCP Server](https://doc.conoha.jp/reference/mcp-server/conoha-vps-mcp-server/) — 2026-10-03 確認
5. [ConoHa ドキュメント — 公開API (ConoHa VPS Ver.3.0)](https://doc.conoha.jp/reference/api-vps3/) — 2026-10-03 確認
6. [ConoHa VPS OS・アプリケーションテンプレート](https://vps.conoha.jp/function/template/) — 2026-10-03 確認
7. [さくらのVPS 料金](https://vps.sakura.ad.jp/) — 2026-10-03 確認
8. [さくらのVPS 2 週間無料お試し](https://vps.sakura.ad.jp/news/vps-free-trial/) — 2026-10-03 確認
9. [さくらの VPS マニュアル — API](https://manual.sakura.ad.jp/vps/api/index.html) — 2026-10-03 確認
10. [さくらの VPS マニュアル — Ubuntu 24.04](https://manual.sakura.ad.jp/vps/os-packages/ubuntu-24.04.html) — 2026-10-03 確認
11. [さくらのVPS 仕様](https://vps.sakura.ad.jp/specification/) — 2026-10-03 確認
12. [KAGOYA CLOUD VPS 料金](https://www.kagoya.jp/cloud/vps/price/) — 2026-10-03 確認
13. [KAGOYA CLOUD VPS 特長](https://www.kagoya.jp/vps/feature/) — 2026-10-03 確認
14. [KAGOYA CLOUD VPS マニュアル](https://support.kagoya.jp/vps/manual/) — 2026-10-03 確認
15. [XServer VPS 料金](https://vps.xserver.ne.jp/price.php) — 2026-10-03 確認
16. [XServer VPS 無料VPS](https://vps.xserver.ne.jp/free.php) — 2026-10-03 確認
17. [XServer VPS OS・アプリイメージ一覧](https://vps.xserver.ne.jp/os-list.php) — 2026-10-03 確認
18. [XServer API リファレンス](https://developer.xserver.ne.jp/api/server/) — 2026-10-03 確認
19. [WebARENA Indigo 料金](https://web.arena.ne.jp/indigo/price/) — 2026-10-03 確認
20. [WebARENA Indigo 機能一覧（Linux）](https://web.arena.ne.jp/indigo/spec/) — 2026-10-03 確認
21. [WebARENA Indigo インスタンス上限値](https://web.arena.ne.jp/indigo/spec/instance.html) — 2026-10-03 確認
22. [WebARENA Indigo API](https://indigo.arena.ne.jp/userapi/) — 2026-10-03 確認
