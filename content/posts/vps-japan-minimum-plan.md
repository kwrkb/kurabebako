+++
title = '国内 VPS の最小プラン比較: ConoHa・さくら・KAGOYA・Xserver・WebARENA Indigo を時間課金と API の有無で選ぶ'
date = '2026-09-02T23:07:57+09:00'
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

サーバーの作成から削除までを API や Terraform で自動化するなら、ConoHa VPS (Ver.3.0) を選ぶ。
5 サービスの中で、サーバー作成・削除を含む公開 API と Terraform provider、MCP サーバーを公式に提供し、
かつ 1 時間単位で課金されるのは ConoHa だけだからだ。
月額を最小にしたいなら WebARENA Indigo（1GB で月上限 449 円、REST API あり）、
API が不要で日単位の利用なら KAGOYA CLOUD VPS（1GB で日額 20 円）が条件に合う。

## 比較表

2026-09-02 時点の公式情報に基づく。出典は末尾の番号に対応する。料金はすべて税込。

| 対象 | 料金 | 無料枠 | 主な制約 | 前提条件 | 検証区分 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| ConoHa VPS (Ver.3.0) | 512MB（1 vCPU・SSD 30GB）は 1.3 円/時、月上限 751 円。1GB（2 vCPU・SSD 100GB）は 1.9 円/時、月上限 1,065 円。36 ヶ月前払いの「まとめトク」なら 512MB 293 円/月 | なし | 1 時間単位の課金で月上限あり。まとめトクは途中解約不可。初期費用なし | ConoHa アカウントと支払い手段。公開 API（OpenStack 準拠）、Terraform provider、MCP サーバーが公式。Ubuntu 22.04 / 24.04 / 26.04、Debian 12 / 13 ほか | 実行 | [1][2][3][4][5][6] |
| さくらのVPS | 512MB（1 vCPU・SSD 25GB）は石狩 643 円/月、東京 698 円/月。1GB（2 vCPU・SSD 50GB）は石狩 880 円/月、東京 990 円/月 | クレジットカード払いで 2 週間無料。同時 2 台まで | 月額・年額のみ。最低利用期間 3 ヶ月。お試し期間中に解約しないと自動で本契約。API は電源操作・状態取得などで、サーバー作成・削除は不可。Ubuntu 24.04 は 1GB 以上のプランのみ | さくらインターネット会員 ID と支払い手段。IPv4・IPv6 各 1 個。リージョンは東京・大阪・石狩 | 仕様 | [7][8][9][10][11] |
| KAGOYA CLOUD VPS | 1GB は日額 20 円、月上限 550 円、年額 6,072 円 | なし（アカウント登録は無料） | 日額（月上限あり）または年額。公式マニュアルに API の項目がない。スナップショットと無停止スケールアップあり | KAGOYA アカウントと支払い手段。OS テンプレート 12 種（Ubuntu 24.04 / 26.04 を含む） | 仕様 | [12][13][14] |
| Xserver VPS | 2GB（3 vCPU・NVMe 50GB）は 1 ヶ月契約 2,640 円（更新 1,980 円）、36 ヶ月契約 2,035 円/月（更新 1,265 円/月） | 「無料VPS」（2GB / 4GB、NVMe 30GB、30Mbps）。毎日コントロールパネルから手動で契約更新が必要で、更新の自動化は不正行為 | 月額のみで契約期間分を一括前払い。2GB プランは 2026-09-02 時点で新規受付を一時停止。XServer API はレンタルサーバー向けで、VPS の作成・削除は対象外 | Xserver アカウント。無料VPS もクレジットカード登録が必要。Ubuntu 22.04 / 24.04 / 26.04、Debian 11〜13 ほか | 仕様 | [15][16][17][18] |
| WebARENA Indigo | 768MB（1 vCPU・SSD 20GB）は 0.52 円/時、月上限 319 円。1GB（1 vCPU・SSD 20GB）は 0.70 円/時、月上限 449 円 | 500 円分のクーポン | 1 時間単位の課金で月上限あり。最低利用料 55 円/計算期間。停止中も課金。768MB は IPv6 のみで IPv4 なし。初期上限 3 インスタンス（45 日後に 25 へ変更可、それ以上は eKYC 本人確認） | NTT 系の WebARENA アカウント。REST API あり（ドキュメントは英語のみ）。Ubuntu 18.04〜24.04、Rocky、Alma、Debian ほか | 仕様 | [19][20][21][22] |

## 比較の前提

- 対象に含めたもの: 国内事業者が提供し、公式サイトで料金と上限を公開している VPS のうち、
  個人が支払い手段を登録すれば申し込める 5 サービス。各社の最小プランと、Ubuntu 24.04 を動かせる最小プランを載せた
- 除外したもの: AWS Lightsail・Google Cloud・Vultr など海外事業者（通貨・税・リージョンの前提が揃わないため、別記事で扱う）。
  レンタルサーバー（root 権限がなく、比較軸が異なる）。ConoHa の GPU プランや Windows Server プラン
- 検証区分の意味: **実行** = AI が実際に動かして確認した / **仕様** = 公式ドキュメントで確認したのみ
- 料金は各社の公式ページの税込表記をそのまま載せた。キャンペーン価格は含めない

## 各対象の詳細

### ConoHa VPS (Ver.3.0)

- **料金体系**: 1 時間単位の課金で、月額上限に達するとそれ以上は課金されない。512MB プランは 1.3 円/時（上限 751 円）、
  1GB プランは 1.9 円/時（上限 1,065 円）、2GB プランは 3.7 円/時（上限 2,033 円）。1〜36 ヶ月の前払い「まとめトク」は
  最大 68% 引きになるが途中解約できない。初期費用はない [1]
- **制約**: プランに含まれる SSD（512MB で 30GB、1GB 以上で 100GB）がブートボリュームになる [1]。
  OS テンプレートは Ubuntu 22.04 / 24.04 / 26.04、Debian 12 / 13、AlmaLinux、Rocky Linux、Arch Linux、FreeBSD など。
  Docker、GitLab、Dokku、Jenkins などのアプリケーションテンプレートが 40 種以上ある [6]
- **前提条件**: ConoHa アカウントと支払い手段。API を使うにはコントロールパネルで API ユーザーを発行する。
  公開 API は OpenStack 準拠で、Identity / Compute / Image / Volume / Network の各 API がある [2][5]。
  Terraform provider（`gmo-internet/conohavps`、Ver.3.0 専用、ベータ）[3] と MCP サーバー（OSS 版とリモート版、ベータ）[4] が公式に提供される
- **検証した内容**: 2026-09-02 に Terraform provider 0.1.0 を使い、AI が 1GB プラン（flavor `g2l-t-c2m1`）に
  Ubuntu 24.04 テンプレート（`vmi-ubuntu-24.04-amd64`）で 100GB のブートボリュームを付けてサーバーを作成し、
  計測後に削除した。人間が行った操作は API ユーザーの発行のみで、作成・SSH 接続・計測・削除は API 経由で完結した。

  | 工程 | 所要時間 |
  | --- | --- |
  | `terraform apply`（キーペア・ボリューム・サーバー） | 37 秒（ボリューム 10 秒、サーバー 22 秒） |
  | apply 完了から SSH 応答まで | 2 秒以内 |
  | `terraform destroy` | 約 5 秒 |

  作成直後の状態は次のとおり。Ubuntu 24.04.3 LTS、カーネル 6.8.0、Intel Xeon (Icelake) 2 vCPU、メモリ 960 MiB、
  swap 2 GiB が既定で有効、IPv4 と IPv6 が各 1 個。待受ポートは 22 のみで、ufw と fail2ban が有効。
  root で直接ログインする構成で、SSH 鍵を登録した場合はパスワード認証が無効になる。

  ```
  $ ssh root@<ip> 'cat /etc/os-release | head -1; nproc; free -m | head -2; ss -tlnp | grep -c LISTEN'
  PRETTY_NAME="Ubuntu 24.04.3 LTS"
  2
                 total        used        free
  Mem:             960         427         124
  4
  ```

  **初回起動直後に unattended-upgrades が 237 パッケージ（カーネル・systemd・openssh を含む）の更新を開始し、
  dpkg のロックを 10 分以上保持した。** 作成直後に `apt-get install` を実行する自動化は、ロック解放を待たないと失敗する。
  更新完了後の計測値は次のとおり。

  | 項目 | 実測値 |
  | --- | --- |
  | sysbench cpu（prime 20000、2 スレッド、15 秒） | 1,624 events/s |
  | sysbench memory（1 MiB ブロック、8 GiB） | 17,393 MiB/s |
  | fio 4k ランダム read/write（QD32、direct） | read 24.8k IOPS / write 24.7k IOPS |
  | fio 1M シーケンシャル read（QD16、direct） | 1,270 MiB/s |
  | HTTP ダウンロード 200 MB（国内ミラー 2 か所） | 11.4〜12.5 MB/s（約 91〜100 Mbps） |
  | ping 1.1.1.1（IPv4）/ 2606:4700:4700::1111（IPv6） | 平均 0.87 ms / 0.74 ms |

  課金は 1 時間分（1.9 円）で、削除後に API でサーバー・ボリューム・キーペアが 0 件になったことを確認した

### さくらのVPS

- **料金体系**: 月額または年額。512MB プランは石狩 643 円、大阪 671 円、東京 698 円。1GB プランは石狩 880 円、
  大阪 935 円、東京 990 円。年額は 12 ヶ月分から約 1 ヶ月分を割り引いた額。初期費用はない [7]
- **制約**: 最低利用期間 3 ヶ月 [7]。Ubuntu 24.04 は 1GB 以上のプランでのみ提供され、512MB では選べない [10]。
  API はサーバーの状態取得、電源操作、NFS、ディスクのマウント、パケットフィルタの操作に限られ、
  サーバーの作成・削除はできない [9]。お試し期間中は 25 番ポートの送信とネームサーバーの利用が制限される [8]
- **前提条件**: さくらインターネットの会員 ID と支払い手段。2 週間の無料お試しはクレジットカード払いを選んだ場合のみで、
  期間内に解約しないと自動で本契約に移行する。お試しは同時 2 台まで [8]。IPv4・IPv6 が各 1 個。
  リージョンは東京・大阪・石狩 [11]。Ubuntu 24.04 の初期ユーザーは `ubuntu` で root ログインは不可、IPv6 は初期無効、swap なし [10]
- **検証した内容**: 仕様区分。上記の公式ページ [7]〜[11] を 2026-09-02 に確認した。
  お試し期間が本契約に自動移行し最低利用期間 3 ヶ月が付くため、AI による申込みは行っていない

### KAGOYA CLOUD VPS

- **料金体系**: 日額（月上限あり）または年額。1GB プランは日額 20 円、月上限 550 円、年額 6,072 円。
  月上限に達しても利用は制限されない [12]
- **制約**: 公式マニュアルの目次（NVMe、Windows Server、KVM、OpenVZ、SSH 接続、ドメイン、SSL、スタートアップガイド）に
  API の項目がなく、作成・削除はコントロールパネルで行う [14]。スナップショットと無停止のスケールアップに対応 [13]
- **前提条件**: KAGOYA アカウント（登録は無料）と支払い手段。OS テンプレートは 12 種で、Ubuntu 24.04 / 26.04 を含む [13][14]
- **検証した内容**: 仕様区分。上記の公式ページ [12]〜[14] を 2026-09-02 に確認した。
  API がないため、AI 単独での作成・削除は行っていない

### Xserver VPS

- **料金体系**: 月額のみで、契約期間分を一括前払い。2GB プランは 1 ヶ月契約で初回 2,640 円・更新 1,980 円、
  36 ヶ月契約で 2,035 円/月・更新 1,265 円/月。4GB プランは 1 ヶ月 5,280 円（更新 2,640 円）。初期費用はない [15]
- **制約**: 2GB プランは 2026-09-02 時点で新規受付を一時停止している [15]。「無料VPS」は 2GB / 4GB のメモリ、NVMe 30GB、
  30Mbps で、毎日コントロールパネルから契約を更新しないとサーバーが削除される。更新を自動化するスクリプトやボットの
  利用は不正行為とされ、メール送信・イメージ保存・サポートは対象外 [16]。2026 年 4 月に提供が始まった XServer API は
  エックスサーバーと XServer ビジネス（レンタルサーバー）向けで、VPS のサーバー作成・削除は対象に含まれない [18]
- **前提条件**: Xserver アカウント。無料VPS もクレジットカードの登録が必要 [16]。OS イメージは Ubuntu 22.04 / 24.04 / 26.04、
  Debian 11〜13、AlmaLinux、Rocky Linux、Oracle Linux、CentOS Stream、Fedora、Arch Linux、openSUSE [17]
- **検証した内容**: 仕様区分。上記の公式ページ [15]〜[18] を 2026-09-02 に確認した。
  無料VPS は毎日の手動更新が条件で自動化が禁止されているため、AI による利用は行っていない

### WebARENA Indigo

- **料金体系**: 1 時間単位の課金で月上限あり。768MB プランは 0.52 円/時（上限 319 円）、1GB は 0.70 円/時（上限 449 円）、
  2GB は 1.27 円/時（上限 814 円）。計算期間ごとの最低利用料 55 円。初期費用なし [19]
- **制約**: 768MB プランは IPv6 のみで IPv4 が付かない。1GB 以上は IPv4・IPv6 各 1 個 [19][20]。インスタンスを停止しても
  課金される [19]。初期のインスタンス上限は 3 で、利用開始 45 日後にコントロールパネルから 25 に変更できる。
  それ以上は eKYC の本人確認が必要 [21]。スナップショットは 1 インスタンス 5 個まで [20]
- **前提条件**: WebARENA のアカウントと支払い手段。500 円分のクーポンが付く [19]。REST API があり、
  ダッシュボードで API 鍵を発行してアクセストークンを取得する。ドキュメントは英語のみ [20][22]。
  OS は Ubuntu 18.04〜24.04、CentOS、Rocky Linux、AlmaLinux、Debian、Oracle Linux [20]
- **検証した内容**: 仕様区分。上記の公式ページ [19]〜[22] を 2026-09-02 に確認した。
  API でサーバー作成が可能なため、次回の更新で ConoHa と同じ手順を流して実行区分に置き換える予定

## 用途別の選び方

- API・Terraform・MCP から作成〜削除まで自動化する → ConoHa VPS。「前提条件」列のとおり、サーバー作成を含む公式 API と
  Terraform provider があるのは ConoHa だけで、Indigo の REST API は英語ドキュメントのみ。さくらの API は作成・削除に対応しない
- 1 時間だけ動かして消す検証用途 → ConoHa か WebARENA Indigo。「主な制約」列のとおり、この 2 つだけが時間課金で、
  1 時間の利用は 1〜2 円で済む。Indigo は停止中も課金される点と最低利用料 55 円に注意
- 常時稼働で月額を最小にする → WebARENA Indigo の 1GB（449 円）。IPv4 が要らなければ 768MB（319 円）。
  国内リージョンの選択やスナップショットが要るならさくらのVPS 1GB（石狩 880 円）
- API は不要で、月の途中で始めても日割りにしたい → KAGOYA CLOUD VPS。「料金」列のとおり日額 20 円で、月上限 550 円
- 無料で試したい → さくらのVPS の 2 週間お試し。ただし「主な制約」列のとおり期間内に解約しないと最低利用期間 3 ヶ月の本契約に移行する。
  Xserver の無料VPS は毎日の手動更新が条件で、自動化した運用には使えない

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
