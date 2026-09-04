+++
title = '国内 VPS 5 社の最小プラン比較: 時間課金と API の有無で選ぶ'
date = '2026-09-02T23:07:57+09:00'
lastmod = '2026-09-03'
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

## 結論

国内の VPS 5 サービスの最小プランを、「AI やスクリプトから作って消せるか」を軸に比べました。
サーバー作成まで含む公開 API と Terraform provider を公式に出していて、しかも 1 時間単位で課金されるのは ConoHa VPS (Ver.3.0) だけです。
自動化が目的なら、ここで決まります。
ただ、常時動かして月額を抑えたいなら話は別で、WebARENA Indigo の 1GB が月上限 449 円で最安です。
API が要らず日単位で使うなら、KAGOYA CLOUD VPS の日額 20 円が条件に合います。

## 比較表

2026-09-02 時点の公式情報に基づきます。出典は末尾の番号に対応しています。料金はすべて税込です。

| 対象 | 料金 | 無料枠 | 主な制約 | 前提条件 | 検証区分 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| ConoHa VPS (Ver.3.0) | 512MB（1 vCPU・SSD 30GB）は 1.3 円/時、月上限 751 円。1GB（2 vCPU・SSD 100GB）は 1.9 円/時、月上限 1,065 円。36 ヶ月前払いの「まとめトク」なら 512MB 293 円/月 | なし | 1 時間単位の課金で月上限あり。まとめトクは途中解約不可。初期費用なし | ConoHa アカウントと支払い手段。公開 API（OpenStack 準拠）、Terraform provider、MCP サーバーが公式。Ubuntu 22.04 / 24.04 / 26.04、Debian 12 / 13 ほか | {{< verified run >}} | [1][2][3][4][5][6] |
| さくらのVPS | 512MB（1 vCPU・SSD 25GB）は石狩 643 円/月、東京 698 円/月。1GB（2 vCPU・SSD 50GB）は石狩 880 円/月、東京 990 円/月 | クレジットカード払いで 2 週間無料。同時 2 台まで | 月額・年額のみ。最低利用期間 3 ヶ月。お試し期間中に解約しないと自動で本契約。API は電源操作・状態取得などで、サーバー作成・削除は不可。Ubuntu 24.04 は 1GB 以上のプランのみ | さくらインターネット会員 ID と支払い手段。IPv4・IPv6 各 1 個。リージョンは東京・大阪・石狩 | {{< verified spec >}} | [7][8][9][10][11] |
| KAGOYA CLOUD VPS | 1GB は日額 20 円、月上限 550 円、年額 6,072 円 | なし（アカウント登録は無料） | 日額（月上限あり）または年額。公式マニュアルに API の項目がない。スナップショットと無停止スケールアップあり | KAGOYA アカウントと支払い手段。OS テンプレート 12 種（Ubuntu 24.04 / 26.04 を含む） | {{< verified spec >}} | [12][13][14] |
| Xserver VPS | 2GB（3 vCPU・NVMe 50GB）は 1 ヶ月契約 2,640 円（更新 1,980 円）、36 ヶ月契約 2,035 円/月（更新 1,265 円/月） | 「無料VPS」（2GB / 4GB、NVMe 30GB、30Mbps）。毎日コントロールパネルから手動で契約更新が必要で、更新の自動化は不正行為 | 月額のみで契約期間分を一括前払い。2GB プランは 2026-09-02 時点で新規受付を一時停止。XServer API はレンタルサーバー向けで、VPS の作成・削除は対象外 | Xserver アカウント。無料VPS もクレジットカード登録が必要。Ubuntu 22.04 / 24.04 / 26.04、Debian 11〜13 ほか | {{< verified spec >}} | [15][16][17][18] |
| WebARENA Indigo | 768MB（1 vCPU・SSD 20GB）は 0.52 円/時、月上限 319 円。1GB（1 vCPU・SSD 20GB）は 0.70 円/時、月上限 449 円 | 500 円分のクーポン | 1 時間単位の課金で月上限あり。最低利用料 55 円/計算期間。停止中も課金。768MB は IPv6 のみで IPv4 なし。初期上限 3 インスタンス（45 日後に 25 へ変更可、それ以上は eKYC 本人確認） | NTT 系の WebARENA アカウント。REST API あり（ドキュメントは英語のみ）。Ubuntu 18.04〜24.04、Rocky、Alma、Debian ほか | {{< verified spec >}} | [19][20][21][22] |

メモリ 1GB のプランを 1 ヶ月動かしたときの上限額を並べると、次のようになります。
Xserver は最小が 2GB なので、2GB の 1 ヶ月契約（更新時）を参考値として入れています。

{{< bars unit="円/月" caption="1GB クラスのプランを 1 ヶ月動かしたときの上限額（税込。出典は比較表と同じ）" >}}
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
  静的サイトを置くだけなら VPS は要らず、無料ホスティングの比較は[別の記事](/posts/static-site-hosting-free-tier/)にまとめています
- 検証区分の意味: {{< verified run >}} = AI が実際に動かして確認した / {{< verified spec >}} = 公式ドキュメントで確認したのみ
- 料金は各社の公式ページの税込表記をそのまま載せています。キャンペーン価格は含めていません

## 各対象の詳細

### ConoHa VPS (Ver.3.0)

この記事で唯一、実際にサーバーを作って計測した対象です。作成から削除までを API 経由で行い、
人間が触ったのは API ユーザーの発行だけでした。

- **料金体系**: 1 時間単位の課金で、月額上限に達するとそれ以上は課金されません。512MB プランは 1.3 円/時（上限 751 円）、
  1GB プランは 1.9 円/時（上限 1,065 円）、2GB プランは 3.7 円/時（上限 2,033 円）です。1〜36 ヶ月の前払い「まとめトク」は
  最大 68% 引きになりますが、途中解約はできません。初期費用はありません [1]
- **制約**: プランに含まれる SSD（512MB で 30GB、1GB 以上で 100GB）がブートボリュームになります [1]。
  OS テンプレートは Ubuntu 22.04 / 24.04 / 26.04、Debian 12 / 13、AlmaLinux、Rocky Linux、Arch Linux、FreeBSD など。
  Docker、GitLab、Dokku、Jenkins などのアプリケーションテンプレートも 40 種以上あります [6]
- **前提条件**: ConoHa アカウントと支払い手段。API を使うにはコントロールパネルで API ユーザーを発行します。
  公開 API は OpenStack 準拠で、Identity / Compute / Image / Volume / Network の各 API があります [2][5]。
  Terraform provider（`gmo-internet/conohavps`、Ver.3.0 専用、ベータ）[3] と MCP サーバー（OSS 版とリモート版、ベータ）[4] が公式に提供されています
- **検証した内容**: 2026-09-02 に Terraform provider 0.1.0 を使い、AI が 1GB プラン（flavor `g2l-t-c2m1`）に
  Ubuntu 24.04 テンプレート（`vmi-ubuntu-24.04-amd64`）で 100GB のブートボリュームを付けてサーバーを作成し、
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

  翌日の利用金額画面（月の途中の暫定表示）では、VPS 1GB が「1 Hrs」で 1.65 円、ブートストレージ 100GB は 0 円でした
  （23 分の稼働が 1 時間分に切り上げ）。月末確定後の請求額は、確定次第この記事に追記します。
  削除後に API でサーバー・ボリューム・キーペアが 0 件になったことも確認しています

### さくらのVPS

2 週間の無料お試しがあるのは 5 社の中でここだけです。ただし、そのまま本契約に移る仕組みなので、
試すだけのつもりでも期限の管理が要ります。

- **料金体系**: 月額または年額です。512MB プランは石狩 643 円、大阪 671 円、東京 698 円。1GB プランは石狩 880 円、
  大阪 935 円、東京 990 円。年額は 12 ヶ月分から約 1 ヶ月分を割り引いた額です。初期費用はありません [7]
- **制約**: 最低利用期間は 3 ヶ月です [7]。Ubuntu 24.04 は 1GB 以上のプランでのみ提供され、512MB では選べません [10]。
  API はサーバーの状態取得、電源操作、NFS、ディスクのマウント、パケットフィルタの操作に限られ、
  サーバーの作成・削除はできません [9]。お試し期間中は 25 番ポートの送信とネームサーバーの利用が制限されます [8]
- **前提条件**: さくらインターネットの会員 ID と支払い手段。2 週間の無料お試しはクレジットカード払いを選んだ場合のみで、
  期間内に解約しないと自動で本契約に移行します。お試しは同時 2 台までです [8]。IPv4・IPv6 が各 1 個付き、
  リージョンは東京・大阪・石狩から選べます [11]。Ubuntu 24.04 の初期ユーザーは `ubuntu` で root ログインは不可、IPv6 は初期無効、swap なしです [10]
- **検証した内容**: 仕様区分です。上記の公式ページ [7]〜[11] を 2026-09-02 に確認しました。
  お試し期間が本契約に自動移行し、最低利用期間 3 ヶ月が付くため、AI による申込みは行っていません

### KAGOYA CLOUD VPS

日額課金で月上限もあるという、時間課金と月額の中間のような料金体系です。
API がないため、自動化よりはコントロールパネルで手動運用する人向けです。

- **料金体系**: 日額（月上限あり）または年額です。1GB プランは日額 20 円、月上限 550 円、年額 6,072 円。
  月上限に達しても利用は制限されません [12]
- **制約**: 公式マニュアルの目次（NVMe、Windows Server、KVM、OpenVZ、SSH 接続、ドメイン、SSL、スタートアップガイド）に
  API の項目がなく、作成・削除はコントロールパネルで行います [14]。スナップショットと無停止のスケールアップに対応しています [13]
- **前提条件**: KAGOYA アカウント（登録は無料）と支払い手段。OS テンプレートは 12 種で、Ubuntu 24.04 / 26.04 を含みます [13][14]
- **検証した内容**: 仕様区分です。上記の公式ページ [12]〜[14] を 2026-09-02 に確認しました。
  API がないため、AI 単独での作成・削除は行っていません

### Xserver VPS

最小プランが 2GB からで、5 社の中では上位寄りのスペックと価格です。
「無料VPS」がありますが、毎日の手動更新が条件で、自動化した運用には向きません。

- **料金体系**: 月額のみで、契約期間分を一括前払いします。2GB プランは 1 ヶ月契約で初回 2,640 円・更新 1,980 円、
  36 ヶ月契約で 2,035 円/月・更新 1,265 円/月。4GB プランは 1 ヶ月 5,280 円（更新 2,640 円）です。初期費用はありません [15]
- **制約**: 2GB プランは 2026-09-02 時点で新規受付を一時停止しています [15]。「無料VPS」は 2GB / 4GB のメモリ、NVMe 30GB、
  30Mbps で、毎日コントロールパネルから契約を更新しないとサーバーが削除されます。更新を自動化するスクリプトやボットの
  利用は不正行為とされ、メール送信・イメージ保存・サポートは対象外です [16]。2026 年 4 月に提供が始まった XServer API は
  エックスサーバーと XServer ビジネス（レンタルサーバー）向けで、VPS のサーバー作成・削除は対象に含まれていません [18]
- **前提条件**: Xserver アカウント。無料VPS もクレジットカードの登録が必要です [16]。OS イメージは Ubuntu 22.04 / 24.04 / 26.04、
  Debian 11〜13、AlmaLinux、Rocky Linux、Oracle Linux、CentOS Stream、Fedora、Arch Linux、openSUSE です [17]
- **検証した内容**: 仕様区分です。上記の公式ページ [15]〜[18] を 2026-09-02 に確認しました。
  無料VPS は毎日の手動更新が条件で自動化が禁止されているため、AI による利用は行っていません

### WebARENA Indigo

5 社で最も安く、REST API もあります。ただしドキュメントが英語のみで、最小の 768MB プランには IPv4 が付きません。

- **料金体系**: 1 時間単位の課金で月上限があります。768MB プランは 0.52 円/時（上限 319 円）、1GB は 0.70 円/時（上限 449 円）、
  2GB は 1.27 円/時（上限 814 円）。計算期間ごとの最低利用料が 55 円。初期費用はありません [19]
- **制約**: 768MB プランは IPv6 のみで IPv4 が付きません。1GB 以上は IPv4・IPv6 各 1 個です [19][20]。インスタンスを停止しても
  課金されます [19]。初期のインスタンス上限は 3 で、利用開始 45 日後にコントロールパネルから 25 に変更できます。
  それ以上は eKYC の本人確認が必要です [21]。スナップショットは 1 インスタンス 5 個までです [20]
- **前提条件**: WebARENA のアカウントと支払い手段。500 円分のクーポンが付きます [19]。REST API があり、
  ダッシュボードで API 鍵を発行してアクセストークンを取得します。ドキュメントは英語のみです [20][22]。
  OS は Ubuntu 18.04〜24.04、CentOS、Rocky Linux、AlmaLinux、Debian、Oracle Linux [20]
- **検証した内容**: 仕様区分です。上記の公式ページ [19]〜[22] を 2026-09-02 に確認しました。
  API でサーバー作成が可能なため、次回の更新で ConoHa と同じ手順を流して実行区分に置き換える予定です

## 用途別の選び方

上から順に答えていくと、条件に合う対象にたどり着きます。各分岐の根拠は下の箇条書きと比較表の列に書いています。

{{< svg src="vps-japan-minimum-plan-flow.svg" alt="用途別の判断フロー。自動化したいなら ConoHa、月額最小なら WebARENA Indigo、日単位なら KAGOYA、無料で試すならさくら、それ以外はスペックかリージョンで Xserver かさくら" caption="図: 用途別の判断フロー" >}}

- API・Terraform・MCP から作成〜削除まで自動化する → ConoHa VPS。「前提条件」列のとおり、サーバー作成を含む公式 API と
  Terraform provider があるのは ConoHa だけです。Indigo の REST API は英語ドキュメントのみで、さくらの API は作成・削除に対応していません
- 1 時間だけ動かして消す検証用途 → ConoHa か WebARENA Indigo。「主な制約」列のとおり、この 2 つだけが時間課金で、
  1 時間の利用は 1〜2 円で済みます。Indigo は停止中も課金される点と、最低利用料 55 円に注意してください
- 常時稼働で月額を最小にする → WebARENA Indigo の 1GB（449 円）。IPv4 が要らなければ 768MB（319 円）で足ります。
  国内リージョンの選択やスナップショットが要るなら、さくらのVPS 1GB（石狩 880 円）が候補です
- API は不要で、月の途中で始めても日割りにしたい → KAGOYA CLOUD VPS。「料金」列のとおり日額 20 円で、月上限は 550 円です
- 無料で試したい → さくらのVPS の 2 週間お試し。ただし「主な制約」列のとおり、期間内に解約しないと最低利用期間 3 ヶ月の本契約に移行します。
  Xserver の無料VPS は毎日の手動更新が条件で、自動化した運用には使えません

常時稼働させるサーバーの死活監視は、[死活監視の無料枠 5 つの比較](/posts/uptime-monitoring-free-tier/)で無料枠を比べています。
自前のサーバーに立てる Uptime Kuma も、その記事で実際に起動して確認しています。

## 出典

1. [ConoHa VPS 料金・スペック](https://vps.conoha.jp/pricing/) — 2026-09-02 確認
2. [ConoHa VPS API](https://vps.conoha.jp/function/api/) — 2026-09-02 確認
3. [ConoHa ドキュメント — Terraform ConoHa VPS Provider](https://doc.conoha.jp/reference/terraform/terraform-conoha-vps-provider/) — 2026-09-02 確認
4. [ConoHa ドキュメント — ConoHa VPS MCP Server](https://doc.conoha.jp/reference/mcp-server/conoha-vps-mcp-server/) — 2026-09-02 確認
5. [ConoHa ドキュメント — 公開API (ConoHa VPS Ver.3.0)](https://doc.conoha.jp/reference/api-vps3/) — 2026-09-02 確認
6. [ConoHa VPS OS・アプリケーションテンプレート](https://vps.conoha.jp/function/template/) — 2026-09-02 確認
7. [さくらのVPS 料金](https://vps.sakura.ad.jp/) — 2026-09-02 確認
8. [さくらのVPS 2 週間無料お試し](https://vps.sakura.ad.jp/news/vps-free-trial/) — 2026-09-02 確認
9. [さくらの VPS マニュアル — API](https://manual.sakura.ad.jp/vps/api/index.html) — 2026-09-02 確認
10. [さくらの VPS マニュアル — Ubuntu 24.04](https://manual.sakura.ad.jp/vps/os-packages/ubuntu-24.04.html) — 2026-09-02 確認
11. [さくらのVPS 仕様](https://vps.sakura.ad.jp/specification/) — 2026-09-02 確認
12. [KAGOYA CLOUD VPS 料金](https://www.kagoya.jp/cloud/vps/price/) — 2026-09-02 確認
13. [KAGOYA CLOUD VPS 特長](https://www.kagoya.jp/vps/feature/) — 2026-09-02 確認
14. [KAGOYA CLOUD VPS マニュアル](https://support.kagoya.jp/vps/manual/) — 2026-09-02 確認
15. [XServer VPS 料金](https://vps.xserver.ne.jp/price.php) — 2026-09-02 確認
16. [XServer VPS 無料VPS](https://vps.xserver.ne.jp/free.php) — 2026-09-02 確認
17. [XServer VPS OS・アプリイメージ一覧](https://vps.xserver.ne.jp/os-list.php) — 2026-09-02 確認
18. [XServer API リファレンス](https://developer.xserver.ne.jp/api/server/) — 2026-09-02 確認
19. [WebARENA Indigo 料金](https://web.arena.ne.jp/indigo/price/) — 2026-09-02 確認
20. [WebARENA Indigo 機能一覧（Linux）](https://web.arena.ne.jp/indigo/spec/) — 2026-09-02 確認
21. [WebARENA Indigo インスタンス上限値](https://web.arena.ne.jp/indigo/spec/instance.html) — 2026-09-02 確認
22. [WebARENA Indigo API](https://indigo.arena.ne.jp/userapi/) — 2026-09-02 確認
