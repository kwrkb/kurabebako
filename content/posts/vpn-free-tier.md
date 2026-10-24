+++
title = '無料で使える VPN 4 つを比較: データ量の上限・選べる場所・CLI で接続を任せられるか'
date = '2026-10-25T00:09:31+09:00'
lastmod = '2026-10-25'
draft = true
summary = '無料で使い続けられる VPN を、Windscribe・Proton VPN・hide.me と国内のセカイVPN の 4 つで比較。無料枠のデータ量と選べる場所、同時接続の台数、カードや登録の要否に加えて、人がアカウントを用意した後に接続・状態確認・切断を CLI で AI に任せられるかで分けました。無料のまま Windows と Linux の CLI で接続から切断まで通ったのは Windscribe で、Windows Sandbox と Linux の VPS の両方で実際に動かして確認しています。Proton VPN と hide.me はデータ量の上限が無い代わりに同時 1 台で、セカイVPN には恒常の無料枠が無く、無料体験の後は有料です。'
categories = ['developer-tools']
tags = ['vpn', 'windscribe', 'proton-vpn', 'hide-me', 'sekai-vpn']
# OGP 用の画像。本文と一覧には出さない（hidden）。生成は desk の images/
[cover]
  image = '/images/og/vpn-free-tier.jpg'
  alt = '無料で使える VPN の無料枠と CLI 接続の比較'
  hidden = true
  hiddenInList = true
+++

{{< pr >}}

## 結論

VPN は、手元の端末と事業者のサーバーの間に暗号化した通信路を作り、インターネットへの出口をそのサーバーに移すサービスです。
無料で使い続けられる 4 つを、「無料枠のデータ量と選べる場所」「同時に繋げる台数とカード・登録の要否」「人がアカウントを用意した後に、
接続・状態確認・切断を CLI で AI に任せられるか」の 3 点で比べました。
地域制限の回避や匿名性の保証、速度の順位付けは扱いません。

- **無料のまま、接続・状態確認・切断を CLI で AI に任せたい** → Windscribe。「無料枠」列のとおり CLI が無料プランでも同じに動き、「検証区分」列のとおり Windows と Linux で接続から切断まで通ります
- **月のデータ量を気にせず無料で使い、接続先の国は任せてよい** → Proton VPN。「無料枠」列のとおりデータ量の上限が無く、国は「主な制約」列のとおりランダムに割り当てられます
- **アカウントを作らずに無料で繋いでみたい** → hide.me。「前提条件」列のとおりアプリは登録不要で、データ量の上限もありません

| こういう条件なら | 対象 | 決め手 |
| --- | --- | --- |
| 無料のまま、接続・状態確認・切断を CLI で AI に任せたい | [Windscribe](#windscribe) | 「無料枠」列（CLI は無料でも同じ）と「検証区分」列（Windows と Linux で一巡） |
| 月のデータ量を気にせず無料で使い、接続先の国は任せてよい | [Proton VPN](#proton-vpn) | 「無料枠」列（データ量の上限なし）と「主な制約」列（国はランダム） |
| アカウントを作らずに無料で繋いでみたい | [hide.me](#hideme) | 「前提条件」列（アプリは登録不要）と「無料枠」列（データ量の上限なし） |
| 日本を含む場所から選び、円建てで払い、体験の後は有料でよい | [セカイVPN](#セカイvpn) | 「料金」列（無料枠なし・円建て）と「前提条件」列（対応 OS） |

## 比較表

2026-10-25 時点の公式情報に基づきます。出典は末尾の番号に対応しています。
料金は海外 3 社が USD、セカイVPN が税込の円で、1 か月プランの額を先に、長期プランを後に載せています。
対象名を押すと、その対象の詳細に移ります。

| 対象 | 料金 | 無料枠 | 主な制約 | 前提条件 | 検証区分 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| [Windscribe](#windscribe) | Free は USD 0。Pro は月払い USD 9、年払い USD 69。Build-a-Plan は 1 か所 USD 1/月で最低 USD 3、7 か所まで | **月 10 GB**（メール未確認は 2 GB）、10 か国の共有サーバー、端末数の上限なし。**CLI は無料でも同じに動く** | Free で選べるのは 10 か国で、**日本は Pro 専用**。静的 IP と IP ローテーションは有料。CLI の文言は OS の言語で出る | アカウントのみ（カード不要）。Windows / macOS はアプリに CLI が同梱、Linux は CLI 専用ビルド。CLI は root では動かない | {{< verified run >}} | [1][2][3][4][5] |
| [Proton VPN](#proton-vpn) | Free は USD 0。Plus は 1 か月 USD 9.99。2 年は初回 USD 83.76 で、更新は 12 か月ごと USD 83.88 | **データ量と時間の上限なし**、同時 1 台、10 か国からランダムに割り当て、速度は「Medium」の表記 | Free は接続先の国を選べない。WireGuard 設定の生成で Free が選べる項目は VPN Accelerator だけ。GUI と CLI は同時に動かせない | Proton アカウントのみ（カード不要）。Linux は GUI と CLI が同じパッケージで入る。WireGuard 設定の生成は web の画面操作 | {{< verified spec >}} | [6][7][8][9][10] |
| [hide.me](#hideme) | Free は USD 0。1 か月 USD 11.99、12＋2 か月 USD 54.99、24＋4 か月 USD 69.99。更新は同じ額と期間 | **データ量の上限なし**、8 か所、同時 1 台。アプリは登録不要 | 場所の数は有料の 1 割弱。Linux は CLI だけで、サーバーの自動選択は未実装（README の TODO） | アプリはアカウント不要。Linux CLI はユーザー名とパスワードで Access-Token を取る。オープンソース（Go） | {{< verified spec >}} | [11][12][13][14] |
| [セカイVPN](#セカイvpn) | 月 1,100 円（税込）、初期費用なし。恒常の無料プランは無く、サービス開始日から翌月末日までの無料体験 | 無料枠なし。体験中もデータ転送量の制限なし、日本を含む 10 か国、同時 3 セッション | 接続中は SMTP など一部のポートが塞がれる。無料体験でもカード情報か身分証明書の提出が要る。同一人物の体験アカウント数に制限 | 対応 OS は Windows / macOS / iOS / Android / Chrome OS で Linux は無い。PPTP・L2TP・OpenVPN・IKEv2・OpenConnect。支払いはカード・NTT 支払い・口座振替 | {{< verified spec >}} | [15][16][17][18] |

{{< bars unit="USD/月" caption="1 か月プランの月額（Windscribe は Pro、Proton VPN は Plus、hide.me は Premium。セカイVPN は円建てなので除いた。出典は比較表と同じ）" >}}
Windscribe Pro: 9
Proton VPN Plus: 9.99
hide.me Premium: 11.99
{{< /bars >}}

{{< bars unit="か所" caption="無料プランで接続できる場所の数（Windscribe と Proton VPN は国の数、hide.me は公式の「server locations」の数。セカイVPN は無料プランが無いので除いた。出典は比較表と同じ）" >}}
Windscribe Free: 10
Proton VPN Free: 10
hide.me Free: 8
{{< /bars >}}

## 比較の前提

- 対象に含めたもの: 恒常の無料プランを持ち、料金と制限を公式ページで裏取りできる海外の 3 社と、国内の事業者で無料体験から始められるセカイVPN です。
  Windscribe は Windows と Linux の CLI で接続から切断までを実行し、Proton VPN・hide.me・セカイVPN は公式ページの確認にとどめています
- 除外したもの: 有料プランしか無い VPN は、無料で使い続けられる範囲を比べる記事の趣旨から外しました。
  地域制限の回避・匿名性やログの扱いの保証・速度の順位付けは、公式の記載を検証できないため比較の軸にしていません。各社の「ログを取らない」などの記述は、この記事では公式の主張として扱い、確認済みとは書いていません
- 検証区分の意味: {{< verified run >}} = AI が実際に動かして確認した / {{< verified spec >}} = 公式ドキュメントで確認したのみ
- 料金表記の注意: 海外 3 社は USD で、税の扱いは各社の料金ページの表示のままです。長期プランは月額換算ではなく請求される総額と期間で載せています。
  Proton VPN の 2 年プランは、ページ内の表示がクーポンの有無で変わるため、脚注の請求総額と更新額だけを載せました。hide.me は長期プランに無料の延長月が付く形で、総額はその延長を含む期間に対する額です。
  セカイVPN は税込の円建てで、支払い方法によって無料体験の起点が変わります
- 選び方の軸: 「無料枠」列は、月のデータ量に上限があるかで分かれます。Windscribe だけに月の上限があり、Proton VPN と hide.me は上限が無い代わりに同時 1 台です。
  「主な制約」列は、無料で接続先を選べるかで分かれます。Windscribe と hide.me は無料の場所から選べ、Proton VPN はランダムに割り当てられます。日本の場所は Windscribe では有料で、セカイVPN は体験の後に有料です。
  「前提条件」列は、CLI の有無と置かれ方で分かれます。Windscribe はアプリに同梱か CLI 専用ビルド、Proton VPN は GUI と同じパッケージ、hide.me はオープンソースの Linux 専用 CLI で、セカイVPN は対応 OS に Linux が無く CLI もありません。
  「検証区分」列は、AI に接続・状態確認・切断を任せる経路を実際に通したかで分かれます
- 検証の手順: Windscribe だけを 2026-10-24 に、2 つの経路で行いました。
  1 つ目は Windows 11 の Windows Sandbox で、公式の GitHub リリースのインストーラーを署名を確かめてから無人で入れ、ユーザーが Sandbox の中で対話的にログインした後、AI が CLI で接続・状態確認・切断を流しています。
  2 つ目は [ConoHa VPS](/posts/vps-japan-minimum-plan/) の Ubuntu 24.04 で、CLI 専用ビルドを入れ、ユーザー名とパスワードを 1Password から `op run` で環境変数に注入して非対話でログインしています。
  AI は認証情報の値を見ていません（注入の手段は[シークレット管理 CLI 6 つの比較](/posts/secret-management-cli/)で扱っています）。
  VPN に繋ぐとその環境の経路と DNS が変わるため、作業用の PC では繋がず、どちらも使い捨ての隔離した環境で行い、VPS は検証の後に消しています。
  段階は (1) 導入とログイン (2) 場所の一覧と無料で選べる範囲 (3) 接続と公開 IP・DNS の変化 (4) 無料プランの境界に当てる (5) 切断して元の状態に戻る、の 5 つです。
  通信速度は Sandbox とリモート接続、VPS の回線の上限に左右され、VPN の性能を表さないので載せていません。結果は「各対象の詳細」の「検証した内容」に書いています

## 各対象の詳細

### Windscribe

カナダの事業者の VPN で、無料プランでも端末数の上限が無く、デスクトップアプリに CLI が同梱されています。
Linux には GUI の無い CLI 専用ビルドがあり、公式のガイドが「CLI は無料と有料で同じに動く」と明記しています。

{{< fit run >}}
向く: 無料のまま、接続・状態確認・切断を CLI で AI に任せたい
向かない: 日本の場所に無料で繋ぎたい。または月のデータ量の上限を気にせず使いたい
{{< /fit >}}

- **料金体系**: Pro は月払いと年払いの 2 つで、年払いは 12 か月ごとの請求です。Build-a-Plan は場所を 1 か所ずつ選んで月額を組む形で、最低額と選べる上限の数があります [2]。
  無料プランのデータ量は、メールアドレスを登録して確認すると「2 GB becomes 10 GB a month, forever」で、登録しなければ少ないままです [1]
- **制約**: 無料プランは共有の無料サーバーだけで、場所の一覧では有料の場所に `(Pro)` が付きます。この検証で `locations` に出た無料の場所は 10 か国 25 台（Best Location を除く）で、北米とヨーロッパに香港が加わる構成でした。
  日本（Tokyo）は 2 台とも `(Pro)` で、無料プランで `connect Tokyo` を出すと `Error: Location does not exist or is disabled` で止まります。
  GUI のアプリが起動していると、`locations` は GUI の窓に一覧を出して端末には何も返しません（`connect` / `status` / `disconnect` は端末に返ります）[4]。
  CLI の出力は OS の言語になり、日本語の Windows では「接続済み: Hong Kong - Victoria」のように見出しが日本語で出ます。
  有料だけの機能は静的 IP と IP ローテーションで、R.O.B.E.R.T. のカスタムルールの数もプランで変わります [3]
- **前提条件**: Windows はアプリの導入で `windscribe-cli.exe` も入り、インストーラーは `-silent` と `-no-auto-start` で無人導入できます [4][5]。
  Linux の CLI は `.deb` / `.rpm` / Arch のパッケージで配られ、systemd の helper サービス（system）とアプリ本体（user unit）が入ります [3][5]。
  CLI は root での実行を拒むので一般ユーザーで呼び、ユーザーのセッションバスが無い環境では `loginctl enable-linger` と `XDG_RUNTIME_DIR` / `DBUS_SESSION_BUS_ADDRESS` の指定が要ります。
  アプリの起動直後、`status` の Internet connectivity が `unavailable` の間に `login` を出すと「Logging in」のまま戻らないことがあり、`available` を待ってから出す必要があります
- **検証した内容**: 2026-10-24 に、無料プラン（メール確認済み）のアカウントで、Windows Sandbox（アプリ 2.24.13、`windscribe-cli.exe`）と ConoHa VPS の Ubuntu 24.04（`windscribe-cli` 2.24.13、CLI 専用ビルド）の 2 経路で実行しました。
  どちらも接続で公開 IP が Windscribe 側に変わり、切断で元に戻っています。

  | 手順 | 呼び出し | 結果 |
  | --- | --- | --- |
  | 導入（Windows） | 公式リリースの `Windscribe_2.24.13_amd64.exe` を Authenticode で確認 → `-silent -no-auto-start` | 署名者 `Windscribe Limited`。`C:\Program Files\Windscribe\windscribe-cli.exe` が入る |
  | ログイン（Windows） | ユーザーが Sandbox の中で `windscribe-cli login` を対話入力 | `status` に「ログイン状態: ログイン済み」「データ使用量: 0 バイト / 10.00 GB」 |
  | 接続（Windows） | `connect best wireguard` | 「接続済み: Hong Kong - Victoria」。7.4 秒。アダプター `WindscribeWireguard` が増え、DNS に `10.255.255.1` が足される。公開 IP が変わる |
  | 切断（Windows） | `disconnect` | 「切断」。アダプターと DNS が元に戻り、公開 IP は接続前と同じ |
  | 導入（Linux） | `apt-get install ./windscribe-cli_2.24.13_amd64.deb` | 7〜31 秒。`windscribe-helper.service`（system）と `windscribe.service`（user unit）が入る |
  | 実行ユーザー（Linux） | root で `windscribe-cli status` | `Aborting: app did not start in time`。一般ユーザーに `enable-linger` を付けると通る |
  | ログイン（Linux） | `windscribe-cli login <user> <pass>`（`op run` で注入） | 1 秒で `Logged in`。対話の入力は無い |
  | 場所の一覧（Linux） | `windscribe-cli locations` | 201 行。`(Pro)` 付きが 175、無料は Best Location と 25 台。`ports wireguard` は `443, 80, 53, 123, 1194, 65142` |
  | 接続（Linux） | `connect best wireguard` | `Connected: Hong Kong - Victoria`（1 秒）。`utun420` に `/32` のアドレス、DNS に `10.255.255.1`。Firewall state は `On` |
  | SSH の維持（Linux） | 設定ファイルに `SplitTunnelingMode=Exclude` と接続元の `/32` | トンネル中も SSH が切れない。既定経路の表示は `eth0` のまま |
  | 無料プランの境界（Linux） | `connect Tokyo` | `Error: Location does not exist or is disabled`。接続は切れ、公開 IP は元に戻る |
  | ログアウト（Linux） | `windscribe-cli logout` | `Logged out`。Firewall state は `Off`。`status` の Data usage は Sandbox の分だけ増えていた |

### Proton VPN

スイスの Proton の VPN で、メールやパスワードマネージャー（[Proton Pass](/posts/password-manager-free-tier/#proton-pass)）と同じ Proton アカウントで使います。
無料プランにデータ量と時間の上限が無い代わりに、同時に繋げるのは 1 台で、接続先の国はランダムに割り当てられます。

{{< fit spec >}}
向く: 月のデータ量を気にせず無料で使い、接続先の国は任せてよい
向かない: 無料で接続先の国を選びたい。または 2 台以上を同時に繋ぎたい
{{< /fit >}}

- **料金体系**: Plus は 1 か月と 2 年の表示があり、2 年は初回の請求総額と、以後 12 か月ごとの更新額が脚注に載っています。
  1 年プランは料金ページの本文に請求総額が出ないため、表から外しました [6]。
  Proton Unlimited はメール・ドライブ・パスワードマネージャーまで含む上位の契約です [6]
- **制約**: 料金ページの無料プランは「Connect to servers in 10 countries (randomly selected)」で、国を指定できません [6]。
  無料プランの案内モーダルと割引の FAQ には「$XX.XX」「XX%」の埋め忘れが残っています（2026-10-11 の確認時から変わっていません）[6]。
  WireGuard の設定ファイルは web の管理画面で生成し、無料プランで選べる VPN のオプションは VPN Accelerator だけです [7]。
  Linux の GUI アプリと CLI は同時に動かせません [9]
- **前提条件**: 無料プランは「No credit card required」です [6]。Linux の対応は Debian・Ubuntu・Fedora の最新版が公式で、Arch と Snap もあります。
  CLI は GUI と同じパッケージ（`proton-vpn-gnome-desktop`）で入り、`protonvpn signin` → `protonvpn connect` → `protonvpn disconnect` の形です [8][9]。
  無料プランのページは Linux を対応プラットフォームに挙げていますが、CLI のガイドにはプランの記載が無く、`connect` は「あなたのプランで使える最速のサーバー」に繋ぐと書かれています [8][10]
- **検証した内容**: この比較ではアカウントを作らず、実行していません。確認したのは公式の料金ページ・無料プランのページ・WireGuard 設定と Linux CLI のサポート記事（2026-10-25）です

### hide.me

マレーシアの eVenture の VPN で、無料プランはアプリなら登録もアカウントも要りません。
Linux 向けには GUI が無く、WireGuard を実装したオープンソースの CLI が公式のクライアントです。

{{< fit spec >}}
向く: アカウントを作らずに無料で繋いでみたい。または Linux で WireGuard ベースの CLI を使いたい
向かない: 多くの場所から選びたい。または 2 台以上を同時に繋ぎたい
{{< /fit >}}

- **料金体系**: 長期プランは「12 Months + 2 Months EXTRA」「24 Months + 4 Months EXTRA」のように無料の延長月が付き、請求は延長を含む期間（14 か月・28 か月）ごとです。
  「Your plan always renews with the same price and duration」と明記され、更新で額が上がる形ではありません [11]
- **制約**: 無料プランは「a choice of 8 server locations」で、有料の「over 92 server locations」に対して 1 割弱です。同時接続は無料が 1 台、有料が 10 台です [12]。
  Linux CLI の README は TODO に「Automatic server selection」を挙げており、接続先のサーバーは `list` で取った一覧から自分で指定します。`list free` で無料のサーバーだけを出せます [14]
- **前提条件**: アプリの無料利用は「No registration, no sign up required」です [12]。
  Linux CLI は `token` コマンドでユーザー名とパスワードから Access-Token を取り、以後の `connect` に使います。アプリと違ってアカウントの情報が要る形です [14]。
  CLI は Go で書かれた単体のバイナリで、`/opt/hide.me` に入り、systemd のテンプレートユニットで接続を常駐させられます。公式の Linux ページが配るのは版 0.9.12 です [13][14]
- **検証した内容**: この比較ではアカウントを作らず、実行していません。確認したのは公式の料金ページ・無料プランのページ・Linux のページと、GitHub の CLI の README（2026-10-25）です

### セカイVPN

国内のインターリンクが提供する VPN で、日本を含む各国のサーバーに繋いでその国の IP アドレスを使う、IP 共有型のサービスです。
恒常の無料プランは無く、サービス開始日から翌月末日までの無料体験の後に月額の課金が始まります。

{{< fit spec >}}
向く: 日本を含む場所から選び、円建てで払い、体験の後は有料でよい
向かない: 無料のまま使い続けたい。または Linux の CLI から繋ぎたい
{{< /fit >}}

- **料金体系**: 料金は 1 つの契約で全サーバーを使える単一の月額で、初期費用はありません。支払いはクレジットカード・NTT 支払い（tabal・電話料金合算）・口座振替の 3 つです [16]。
  無料体験は「サービス開始日から翌月末日まで」で、期間中にマイメニューから退会すれば費用はかかりません。
  クレジットカード支払いならサインアップ日が開始日で即日使え、NTT 支払いと口座振替は手続きの完了日が開始日になります [17][18]
- **制約**: 接続中は SMTP（TCP 25 / 465 / 587）や SMB・NetBIOS など一部のポートに繋げず、メールソフトでの送信は利用規約の禁止事項にも入っています [15]。
  同じルーターの下の複数の端末で同時に使うなら OpenVPN が案内されています [15]。
  無料体験は請求先の情報を利用者確認に兼ねており、カード支払いならカード情報の入力、口座振替と NTT 支払いなら身分証明書の提出が要ります。同一人物とみなされる体験アカウントの数には制限があります [17]
- **前提条件**: 対応 OS は Windows・macOS・iOS・Android・Chrome OS で、Linux は載っていません。公式アプリは Windows・Mac・iOS・Fire TV で、Android と Chrome OS は OS 標準の VPN 設定を使います。
  接続方式は PPTP・L2TP・OpenVPN・IKEv2・OpenConnect（iOS だけ HTTPS 接続も）です [15]
- **検証した内容**: この比較ではアカウントを作らず、実行していません。確認したのは公式のサービス詳細・料金・無料体験・利用開始までの流れのページ（2026-10-25）です

{{< cta "sekai-vpn" >}}

## 用途別の選び方

最初に分かれるのは、無料のまま CLI で接続・状態確認・切断を AI に任せたいかどうかです。
次に、月のデータ量の上限と接続先の選び方のどちらを優先するかで分かれます。

{{< svg src="vpn-free-tier-flow.svg" alt="用途別の判断フロー。無料のまま接続・状態確認・切断を CLI で AI に任せたいなら Windscribe の Free、月のデータ量を気にせず無料で使い接続先の国は任せてよいなら Proton VPN の Free、アカウントを作らずに無料で繋いでみたいなら hide.me の Free、日本を含む場所から選び円建てで払い体験の後は有料でよいならセカイVPN、認証情報を AI に見せずに注入したいならシークレット管理 CLI の比較へ" caption="図: 用途別の判断フロー" >}}

- 無料のまま、接続・状態確認・切断を CLI で AI に任せたい → Windscribe。決め手は「無料枠」列と「検証区分」列です。日本の場所は「主な制約」列のとおり有料になります
- 月のデータ量を気にせず無料で使い、接続先の国は任せてよい → Proton VPN。決め手は「無料枠」列です。国を選べないことは「主な制約」列にあります
- アカウントを作らずに無料で繋いでみたい → hide.me。決め手は「前提条件」列です。Linux で CLI を使うときはアカウントが要る点も同じ列にあります
- 日本を含む場所から選び、円建てで払い、体験の後は有料でよい → セカイVPN。決め手は「料金」列と「前提条件」列です。Linux の対応が無いことも「前提条件」列にあります
- CLI に渡すユーザー名やパスワードを AI に見せずに注入したい → [シークレット管理 CLI 6 つの比較](/posts/secret-management-cli/)が対象です。この検証でも `op run` で注入しています

## よくある質問

### Windscribe の無料プランで日本のサーバーに接続できますか？

できません。無料プランで選べるのは 10 か国の共有サーバーで [1]、この比較の実行検証では日本（Tokyo）の 2 台はどちらも `(Pro)` 付きでした。
無料プランで `connect Tokyo` を出すと `Error: Location does not exist or is disabled` で止まります。日本の場所を使うには Pro か、Build-a-Plan で日本を選ぶ形になります [2]。

### Windscribe の CLI は無料プランでも使えますか？

使えます。公式の Linux のガイドが「The CLI works the same on free and paid plans」と明記し、有料が要るのは静的 IP と IP ローテーションです [3]。
この比較の実行検証では、無料プランのアカウントで Windows のアプリ同梱の CLI と Linux の CLI 専用ビルドの両方で、ログインから接続・切断・ログアウトまで通りました。

### Proton VPN の無料プランと有料プランは何が違いますか？

無料プランは同時 1 台で、接続先は 10 か国からランダムに割り当てられ、速度は「Medium」と表記されています [6]。
データ量と時間の上限は無料でもありません [10]。有料の Plus は国を選んで繋げ、WireGuard 設定の生成で NetShield などのオプションも選べます [6][7]。

## 出典

1. [Windscribe — Use Windscribe for Free](https://windscribe.com/features/use-for-free) — 2026-10-25 確認
2. [Windscribe — Upgrade（Pro / Build-a-Plan）](https://windscribe.com/upgrade) — 2026-10-25 確認
3. [Windscribe Knowledge Base — How to use Windscribe on Linux (CLI and headless)](https://windscribe.com/knowledge-base/articles/how-to-use-windscribe-on-linux-cli-and-headless) — 2026-10-25 確認
4. [Windscribe/Desktop-App — skills/windscribe-cli/SKILL.md](https://github.com/Windscribe/Desktop-App/blob/master/skills/windscribe-cli/SKILL.md) — 2026-10-25 確認
5. [Windscribe/Desktop-App — Release v2.24.13](https://github.com/Windscribe/Desktop-App/releases/tag/v2.24.13) — 2026-10-25 確認
6. [Proton VPN — Pricing](https://protonvpn.com/pricing) — 2026-10-25 確認
7. [Proton VPN Support — How to use WireGuard configuration files](https://protonvpn.com/support/wireguard-configurations) — 2026-10-25 確認
8. [Proton VPN Support — How to use the Proton VPN Linux CLI](https://protonvpn.com/support/use-linux-cli) — 2026-10-25 確認
9. [Proton VPN Support — Install the Linux app and CLI on Debian / Ubuntu](https://protonvpn.com/support/cli-debian-ubuntu) — 2026-10-25 確認
10. [Proton VPN — Free VPN](https://protonvpn.com/free-vpn) — 2026-10-25 確認
11. [hide.me — Pricing](https://hide.me/en/pricing) — 2026-10-25 確認
12. [hide.me — Free VPN](https://hide.me/en/free-vpn) — 2026-10-25 確認
13. [hide.me — VPN for Linux](https://hide.me/en/software/linux) — 2026-10-25 確認
14. [eventure/hide.client.linux — README](https://github.com/eventure/hide.client.linux/blob/master/README.md) — 2026-10-25 確認
15. [インターリンク — セカイVPN サービス詳細](https://www.interlink.or.jp/service/sekaivpn/) — 2026-10-25 確認
16. [インターリンク — セカイVPN 料金](https://www.interlink.or.jp/service/sekaivpn/price.html) — 2026-10-25 確認
17. [インターリンク — 無料体験について](https://www.interlink.or.jp/taiken.html) — 2026-10-25 確認
18. [インターリンク — セカイVPN ご利用開始までの流れ](https://www.interlink.or.jp/service/sekaivpn/flow.html) — 2026-10-25 確認
