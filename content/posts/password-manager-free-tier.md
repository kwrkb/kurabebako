+++
title = 'パスワードマネージャー 4 つを比較: 無料枠・CLI が使えるプラン・同期の持ち方で選ぶ'
date = '2026-10-21T20:37:37+09:00'
lastmod = '2026-10-21'
draft = false
summary = '個人向けのパスワードマネージャーを、Bitwarden・KeePassXC・Proton Pass・1Password の 4 つで比較。恒常の無料枠があるか、CLI がどのプランから使えるか、同期をクラウドに任せるか自分で持つかで分けました。無料のまま CLI で登録・書き換え・削除まで AI に任せられるのは Bitwarden と KeePassXC です。1Password は有料プランのサービスアカウントで同じ操作が通り、3 つとも実際に動かして確認しています。Proton Pass の CLI は有料プランからで、1Password には恒常の無料プランがありません。'
categories = ['developer-tools']
tags = ['password-manager', 'bitwarden', 'keepassxc', 'proton-pass', '1password']
# OGP 用の画像。本文と一覧には出さない（hidden）。生成は desk の images/
[cover]
  image = '/images/og/password-manager-free-tier.jpg'
  alt = 'パスワードマネージャーの無料枠と CLI の比較'
  hidden = true
  hiddenInList = true
+++

## 結論

パスワードマネージャーは、ログイン情報を 1 か所に暗号化して保管し、端末やブラウザから呼び出すサービスです。
個人向けの 4 つを、「恒常の無料枠があるか」「CLI がどのプランから使えるか」「同期をクラウドに任せるか自分で持つか」の 3 点で比べました。
CLI が無料プランから使えるかどうかが、保管庫への登録や整理を AI に任せられるかの分かれ目になります。

- **無料のまま、登録・書き換え・削除を CLI で AI に任せたい** → Bitwarden。「無料枠」列に CLI が含まれ、「検証区分」列のとおり作成から完全削除まで通ります
- **保管庫のファイルを自分で持ち、アカウントを作りたくない** → KeePassXC。「前提条件」列のとおりアカウント不要で、鍵ファイルだけで CLI が非対話に動きます
- **無料でメールのエイリアスも使い、CLI は要らない** → Proton Pass。「無料枠」列にエイリアスが含まれ、CLI は「主な制約」列のとおり有料プランからです

| こういう条件なら | 対象 | 決め手 |
| --- | --- | --- |
| 無料のまま、登録・書き換え・削除を CLI で AI に任せたい | [Bitwarden](#bitwarden) | 「無料枠」列（CLI を含む）と「検証区分」列（作成から完全削除まで一巡） |
| 保管庫のファイルを自分で持ち、アカウントを作りたくない | [KeePassXC](#keepassxc) | 「前提条件」列（アカウント不要・鍵ファイルだけで開く）と「主な制約」列（同期は自分で持つ） |
| 無料でメールのエイリアスも使い、CLI は要らない | [Proton Pass](#proton-pass) | 「無料枠」列（エイリアス）と「主な制約」列（CLI は有料） |
| 有料でよく、家族と共有し、開発者向けの CLI と SDK まで使いたい | [1Password](#1password) | 「料金」列（無料プランなし）と「主な制約」列（サービスアカウントが扱える保管庫） |

CI や AI エージェントに機械用のトークンで secret を渡す仕組みを探しているなら、[シークレット管理 CLI 6 つの比較](/posts/secret-management-cli/)が対象です。

## 比較表

2026-10-21 時点の公式情報に基づきます。出典は末尾の番号に対応しています。
料金は個人が申し込める最小の有料プランを月払いの月額（USD）で載せ、年払いを括弧で補っています。
対象名を押すと、その対象の詳細に移ります。

| 対象 | 料金 | 無料枠 | 主な制約 | 前提条件 | 検証区分 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| [Bitwarden](#bitwarden) | Free は USD 0。Premium は年払いのみで月 1.65（年 USD 19.80）、Families 月 3.99（年 USD 47.88、6 人） | **端末・項目とも無制限**、他 1 人と共有、テキストの Send、パスキー、暗号化エクスポート、**CLI** | TOTP の生成・ファイル添付・ファイルの Send は Premium。CLI でも同じ境界で止まる | アカウントのみ（登録時にカード不要）。CLI は個人 API キーでログインし、unlock にマスターパスワード本体が要る | {{< verified run >}} | [1][2][3][4] |
| [KeePassXC](#keepassxc) | 無料（GPL-2.0 または GPL-3.0 のオープンソース）。有料プランなし | 上限なし（保管庫は手元の 1 ファイル）。**CLI `keepassxc-cli` 同梱**、鍵ファイルだけで非対話に開ける | クラウド同期の機能は無く、ファイルの置き場と同期は自分で持つ。`export` は平文の XML / CSV | **アカウント不要**。Windows / macOS / Linux。CLI の文言とごみ箱の名前は OS のロケールで決まる | {{< verified run >}} | [10][11][12][13] |
| [Proton Pass](#proton-pass) | Free は USD 0。Pass Plus 月 4.99（年払いは月 2.99、年 USD 35.88）、Pass Family 月 6.99（年払いは月 4.99、6 人） | ログイン・端末とも無制限、vault 2、共有 2 人、**hide-my-email エイリアス 10**、1 GB、パスキー | **CLI・2FA 認証器・項目単位の共有・ファイル添付は Pass Plus 以上** | Proton アカウントのみ（カード不要）。CLI を使うなら有料プラン | {{< verified spec >}} | [7] |
| [1Password](#1password) | **恒常の無料プランなし**。Individual 月 4.99（年払いは月 3.99）、Families 月 7.99（年払いは月 5.99、5 人） | 14 日のトライアルのみ（カード不要） | トライアル後は有料。CLI（`op`）はサブスクリプションが前提。サービスアカウントは個人の既定の保管庫（Private）を扱えず、共有用の vault だけ | 1Password アカウント。CLI はデスクトップアプリ連携か、vault 単位で権限を絞ったサービスアカウントのトークンで認証。1 ユーザー 1 GB | {{< verified run >}} | [8][9] |

{{< bars unit="USD/月" caption="最小の有料プランの月額（年払い換算。1Password は通常価格で、新規の初年度の割引は詳細に。KeePassXC は有料プランが無く 0。出典は比較表と同じ）" >}}
Bitwarden Premium: 1.65
Proton Pass Plus: 2.99
1Password Individual: 3.99
KeePassXC: 0
{{< /bars >}}

{{< bars unit="ms" caption="CLI でログイン項目を 1 件登録するのにかかった時間（Bitwarden と KeePassXC は 2026-10-20、1Password は 10-21 の実行。bw create item / keepassxc-cli add / op item create。出典は各対象の「検証した内容」）" >}}
Bitwarden（bw）: 7431
1Password（op）: 3379
KeePassXC（keepassxc-cli）: 226
{{< /bars >}}

## 比較の前提

- 対象に含めたもの: 個人が使う保管庫のうち、恒常の無料プランかオープンソースの無償版を持ち、料金と CLI の有無を公式ページで裏取りできる 4 つです。
  Bitwarden・KeePassXC・1Password は CLI で登録から削除までを実行し、Proton Pass は公式ページの確認にとどめています
- 除外したもの: CI や AI エージェント向けに機械用のトークンで secret を注入するサービス（Bitwarden Secrets Manager・1Password のサービスアカウント・Infisical・Doppler など）は、
  [シークレット管理 CLI 6 つの比較](/posts/secret-management-cli/)で比べています。ブラウザや OS に内蔵の保管機能は、単体の料金ページと CLI が無いため対象外にしました
- 検証区分の意味: {{< verified run >}} = AI が実際に動かして確認した / {{< verified spec >}} = 公式ドキュメントで確認したのみ
- 料金表記の注意: 通貨は USD で、税の扱いは各社の料金ページの表示のままです。Bitwarden の有料プランは年払いだけが表示され、月額は年額を 12 で割った表示です。
  Proton Pass と 1Password は月払いと年払いの両方があり、表には月払いを載せています。1Password の年払いには新規の初年度だけの割引があり、表は通常価格です
- 選び方の軸: 「料金」列は、恒常の無料プランがあるかで分かれます。Bitwarden と Proton Pass は無料のまま使い続けられ、KeePassXC は料金そのものが無く、1Password はトライアルの後に有料になります。
  「無料枠」列と「主な制約」列は、CLI が無料プランに含まれるかで分かれます。Bitwarden と KeePassXC は含まれ、Proton Pass は有料プランから、1Password はサブスクリプションが前提です。
  「前提条件」列は、CLI に何を渡して開くかで分かれます。Bitwarden は個人 API キーに加えてマスターパスワード本体が要り、KeePassXC は鍵ファイルだけで開け、1Password はサービスアカウントのトークン 1 つで足ります。
  同期の持ち方も「主な制約」列にあり、KeePassXC だけがクラウド同期を持たず、ファイルの置き場を自分で決めます
- 検証の手順: Bitwarden と KeePassXC は 2026-10-20 に、1Password は 2026-10-21 に、Windows 11 の Git Bash から行いました。
  Bitwarden は無料プランのアカウントと個人 API キー、マスターパスワードをユーザーが 1Password に置き、AI が `op run` で環境変数に注入して CLI を流しています。
  AI は鍵やパスワードの値を見ていません。KeePassXC は鍵ファイルだけで保管庫を作り、パスワードの入力なしに流しています。
  1Password は有料の Individual プランで、ユーザーが作ったサービスアカウントのトークンを環境変数で渡し、書き込みを許した検証用の vault だけで流しています。無料のトライアルの経路と、デスクトップアプリ連携の対話的な認証は動かしていません。
  段階は (1) 非対話でログインまたは保管庫を開く (2) フォルダとログイン項目を登録する (3) 検索・取り出し・書き換えをして読み直す (4) 無料プランの境界に当てる (5) ごみ箱・完全削除・エクスポートまで消す、の 5 つです。
  保管した項目はダミー（`example.com`、ユーザー名 `demo`、生成したパスワード）だけで、本物の認証情報は CLI に渡していません。結果は「各対象の詳細」の「検証した内容」に書いています
- 鍵やパスワードを AI エージェントに渡す手段は、[シークレット管理 CLI 6 つの比較](/posts/secret-management-cli/)で比べています。この検証でも、そこで扱った `op run` で注入しています

## 各対象の詳細

### Bitwarden

オープンソースのパスワードマネージャーで、クラウドの保管庫を無料プランのまま端末の数を問わず使えます。
CLI の `bw` が無料プランに含まれ、個人 API キーでログインすれば画面を開かずに保管庫を操作できます。

{{< fit run >}}
向く: 無料のまま、保管庫への登録・書き換え・削除を CLI で AI に任せたい
向かない: TOTP の生成やファイルの添付まで無料で済ませたい
{{< /fit >}}

- **料金体系**: 料金ページには年払いの額だけが載り、月額はその 12 分の 1 の表示です。Families は Premium の機能を 6 人分含み、無料のトライアルから始められます [1]
- **制約**: Premium の機能を CLI から呼ぶと `Premium status is required to use this feature.` で止まります。この検証では TOTP の取り出し・添付の作成・ファイルの Send の 3 つがこの文言で拒否されました。
  無料プランの Send はテキストだけで、ファイルは Premium からです [2]。
  CLI は 1 回の呼び出しごとに起動と同期を行うため、項目を 1 件読むだけでも数秒かかります。棒グラフの登録の時間はその一例です
- **前提条件**: 個人 API キー（`client_id` と `client_secret`）は web アプリの Settings → Security → Keys でしか表示されず、CLI からは作れません。
  API キーはマスターパスワードの代わりにはならず、保管庫を復号する `bw unlock` にはマスターパスワード本体を環境変数（`--passwordenv`）かファイル（`--passwordfile`）で渡します [3][4]。
  CLI のログイン状態は既定でユーザーのアプリデータに残るので、この検証では `BITWARDENCLI_APPDATA_DIR` で作業用の場所に向け、終了時に消しています。
  CLI のソースは GPL v3.0 で、`npm` の `@bitwarden/cli` のほか単体のバイナリと Chocolatey・Snap でも配られています [3][6]
- **検証した内容**: 2026-10-20 に、無料プランのアカウントで `bw` 2026.10.0（npm、Node.js 24）を実行しました。全段が非対話で通り、作った項目・フォルダ・Send は消しています。

  | 手順 | 呼び出し | 結果 |
  | --- | --- | --- |
  | ログイン | `bw login --apikey`（`BW_CLIENTID` / `BW_CLIENTSECRET`） | `You are logged in!`。15.8 秒。2 段階認証の入力は無し。`bw status` は `locked` |
  | 復号 | `bw unlock --passwordenv BW_PASSWORD --raw` | 88 文字のセッション鍵が返り、`BW_SESSION` に入れて以後の呼び出しに使う。`status` は `unlocked` |
  | 同期 | `bw sync` | `Syncing complete.`（3.9 秒） |
  | 登録 | `bw create folder` → `bw generate -ulns --length 20` → `bw get template item` を jq で埋めて `bw encode \| bw create item` | フォルダと login 型の項目（`example.com` / `demo`）が作られ、`id` が返る。項目の作成は 7.4 秒 |
  | 検索と取り出し | `bw list items --search <名前>` → `bw get password <id>` | 1 件。取り出したパスワードは作成時に生成した値と一致 |
  | 書き換え | `bw get item <id> \| jq \| bw encode \| bw edit item <id>` | ユーザー名と notes が変わり、`revisionDate` が更新。読み直しでも反映（8.6 秒） |
  | 無料プランの境界 | `bw get totp` / `bw create attachment --file` / `bw send -f` | 3 つとも `Premium status is required to use this feature.`（終了コード 1） |
  | テキストの Send | `bw send -n <名前> --deleteInDays 1 "<本文>"` → `bw send list` → `bw send delete` | `send.bitwarden.com` の URL が返り、一覧に 1 件、削除後は 0 件 |
  | ごみ箱と復元 | `bw delete item <id>` → `bw list items --trash --search` → `bw restore item <id>` | 通常の検索は 0 件、ごみ箱に 1 件。復元で通常の検索に戻る |
  | 完全削除 | `bw delete item <id> --permanent` → `bw get item <id>` | 通常・ごみ箱とも 0 件。`get` は `Not found.` |
  | エクスポート | `bw export --format encrypted_json --output <path>` | `encrypted: true` の JSON が書き出される（項目を消した後なので 229 バイト） |
  | 施錠と終了 | `bw lock` → `bw logout` | `Your vault is locked.` → `You have logged out.`。`status` は `unauthenticated` |

### KeePassXC

保管庫を手元の 1 ファイル（`.kdbx`）として持つオープンソースのパスワードマネージャーで、アカウントもクラウドもありません。
同梱の `keepassxc-cli` は鍵ファイルだけで開けるので、パスワードの入力を挟まずにスクリプトから操作できます。

{{< fit run >}}
向く: 保管庫のファイルを自分で持ち、アカウントを作らずに CLI で登録・整理を任せたい
向かない: 複数の端末で同じ保管庫を使い、同期の仕組みを自分で用意したくない
{{< /fit >}}

- **料金体系**: 有料プランは無く、本体は GPL-2.0 または GPL-3.0 で配られています [13]。Windows は MSI・ポータブルの ZIP・winget、macOS は DMG と Homebrew、Linux は Flatpak や各ディストリビューションのパッケージがあります [11]
- **制約**: クラウド同期の機能は無く、公式の FAQ は保管庫のファイルを同期サービスのフォルダに置き、鍵ファイルは別に配る方法を案内しています [10]。
  `export` は XML と CSV だけで、どちらも平文で標準出力に出ます [12]。CSV にはパスワードの列がそのまま含まれるので、書き出し先に注意が要ります。
  `rm` はごみ箱が有効なら項目をごみ箱に移し、ごみ箱の中の項目に対して実行すると完全に消します [12]
- **前提条件**: CLI のメッセージとごみ箱のグループ名は OS のロケールで決まります。
  日本語の Windows ではごみ箱が「ゴミ箱」という名前で作られ、英語名の `Recycle Bin/sample` を指すと `エントリー Recycle Bin/sample が見つかりません。` で止まります。
  スクリプトからごみ箱の中を消すときは、`ls` でグループ名を取ってから指定します
- **検証した内容**: 2026-10-20 に、Windows 11 へ winget で入れた KeePassXC 2.7.12 の `keepassxc-cli` で実行しました。鍵ファイルだけで開き、パスワードの入力はありません。保管庫のファイルは終了時に消しています。

  | 手順 | 呼び出し | 結果 |
  | --- | --- | --- |
  | 作成 | `keepassxc-cli db-create --set-key-file <鍵> <db>` | `新しいデータベースを正常に作成しました。`（0.2 秒）。`db-info` は AES 256 ビット、KDF は AES、ごみ箱が有効 |
  | 登録 | `mkdir` → `add -q --no-password -k <鍵> -u demo --url https://example.com -g -L 20 <db> <グループ>/sample` | グループと、生成した 20 文字のパスワード付きの項目が作られる。登録は 0.23 秒 |
  | 検索と取り出し | `search` → `show` → `show -s -a Password` | `search` は `/<グループ>/sample` を返す。`show` のパスワード欄は `PROTECTED`、`-s` で値が出る |
  | 書き換え | `edit -q -u demo2 --url https://example.org` → `show -a UserName` / `-a URL` | ユーザー名と URL が変わり、パスワードは不変 |
  | ごみ箱 | `rm <グループ>/sample` → `ls -R` | 項目が `ゴミ箱/` に移る。元の場所の `show` は `エントリーが見つかりませんでした。` |
  | 完全削除 | `rm ゴミ箱/sample` → `rmdir <グループ>`（2 回） | ごみ箱の項目が消える。グループも 1 回目でごみ箱へ、2 回目で消える |
  | エクスポート | `export -f xml` / `export -f csv` | 平文の XML と CSV が標準出力に出る。CSV のヘッダーは Group・Title・Username・Password・URL・Notes・TOTP… |
  | 境界 | 鍵なしで開く / 無い項目を `show` / 無いファイルを開く | `不正な資格情報です。` / `エントリーが見つかりませんでした。` / `開くのに失敗しました: 見つかりません`（いずれも終了コード 1） |

### Proton Pass

メールやカレンダーと同じ Proton のアカウントで使うパスワードマネージャーで、無料プランにメールアドレスを隠すエイリアスが付きます。
CLI は料金ページの比較表で有料プランの列にだけ載っていて、無料プランでは使えません。

{{< fit spec >}}
向く: 無料でログイン情報とメールのエイリアスをまとめ、画面とブラウザ拡張だけで使う
向かない: 無料のまま CLI で保管庫を操作したい
{{< /fit >}}

- **料金体系**: 月払いと年払いがあり、年払いは月払いより安い月額になります。Pass Family は Pass Plus の機能を 6 人分含みます。Proton Unlimited はメール・VPN・ドライブまで含む上位の契約です [7]
- **制約**: 無料プランは vault の数と共有できる人数に上限があり、項目単位の共有・2FA 認証器・項目の履歴・ファイル添付・CLI は Pass Plus 以上の列に載っています [7]
- **前提条件**: 無料プランは「No credit card required」と明記されています。CLI を使うなら Pass Plus 以上の契約が要ります [7]
- **検証した内容**: この比較ではアカウントを作らず、実行していません。確認したのは公式の料金ページ（2026-10-21）です

### 1Password

有料プランだけのパスワードマネージャーで、個人向けと家族向けの 2 つの契約があります。
CLI の `op` は開発者向けの機能として用意され、デスクトップアプリとの連携かサービスアカウントで認証します。

{{< fit run >}}
向く: 有料でよく、家族と保管庫を共有し、CLI と SDK を開発にも使いたい
向かない: 無料のまま使い続けたい。または個人の既定の保管庫そのものを CLI だけで任せたい
{{< /fit >}}

- **料金体系**: 年払いの通常価格に加えて、1Password.com から直接申し込む新規の契約には初年度だけの割引があります。割引はアプリストア経由では適用されません [8]
- **制約**: 恒常の無料プランは無く、14 日のトライアルの後はどちらかの契約を選びます。支払いはカードのほか、米国の口座の ACH と 1Password のギフトカードに対応しています [8]。
  サービスアカウントには、共有用に作った vault しか見えません。この検証で個人の既定の保管庫（Private）を指すと `"Private" isn't a vault in this account.` で止まり、読み取りだけを許した vault への作成は `(101) You do not have permission to perform this action` で止まりました。
  `op item delete` は既定で完全に消し、`--archive` を付けるとアーカイブに移ります。復元は CLI にありません
- **前提条件**: トライアルはカード不要です。CLI の導入手順はどのプラットフォームでも「1Password subscription」を前提に書かれ、
  macOS と Linux でアプリ連携を使うにはデスクトップアプリが要ります。サービスアカウントのトークンは vault 単位で範囲を絞れます [9]
- **検証した内容**: 2026-10-21 に、有料の Individual プランのサービスアカウント（検証用の vault に読み書き、ほかの vault は読み取りだけ）で `op` 2.40.0 を実行しました。全段が非対話で通り、作った項目は消しています。
  サービスアカウントで secret を注入する側の実行は、[シークレット管理 CLI 6 つの比較](/posts/secret-management-cli/)で扱っています。

  | 手順 | 呼び出し | 結果 |
  | --- | --- | --- |
  | 認証 | `OP_SERVICE_ACCOUNT_TOKEN` を環境変数に置いて `op whoami` | `user_type: SERVICE_ACCOUNT`。ログインの操作は無い（0.4 秒） |
  | 見える保管庫 | `op vault list` | 共有用に作った vault 3 つだけ。個人の既定の保管庫（Private）は出ない |
  | 登録 | `op item create --category Login --title <名前> --url https://example.com username=demo --generate-password=20,letters,digits,symbols` | `LOGIN` の項目が作られ、`id` が返る（3.4 秒）。パスワードは CLI 側で生成 |
  | 検索と取り出し | `op item list --vault <vault>` → `op item get <id> --fields password --reveal` | タイトル一致 1 件。取り出したパスワードは 20 文字で、`--reveal` を付けないと伏せ字 |
  | 書き換え | `op item edit <id> username=demo2 notesPlain=...` → `op item get` | ユーザー名と notes が変わり、`version` が 2 に。パスワードは不変（4.2 秒） |
  | 権限の境界 | 読み取りだけの vault に `op item create` / `Private` を指定 | `(101) You do not have permission to perform this action` / `"Private" isn't a vault in this account.` |
  | アーカイブ | `op item delete <id> --archive` → `op item list --include-archive` | 通常の一覧は 0 件、`--include-archive` で 1 件（`state: ARCHIVED`） |
  | 完全削除 | `op item delete <id>` → `op item get <id>` | 一覧は 0 件。`get` は `isn't an item in the ... vault` |
  | 呼び出しの上限 | `op service-account ratelimit` | トークンあたり書き込み 100 回/時・読み取り 1,000 回/時、アカウントあたり 1,000 回/日。この一巡で書き込み 10 回・読み取り 61 回 |

## 用途別の選び方

最初に分かれるのは、保管庫のファイルを自分で持つか、クラウドに置くかです。
次に、無料のまま CLI を使いたいかどうかで分かれます。

{{< svg src="password-manager-free-tier-flow.svg" alt="用途別の判断フロー。保管庫のファイルを自分で持ちアカウントを作りたくないなら KeePassXC、無料のまま登録・書き換え・削除を CLI で AI に任せたいなら Bitwarden の Free、無料でメールのエイリアスも使い CLI は要らないなら Proton Pass の Free、有料でよく家族と共有し CLI と SDK まで使いたいなら 1Password、CI や AI エージェントに機械用のトークンで secret を渡したいならパスワードマネージャーではなくシークレット管理 CLI" caption="図: 用途別の判断フロー" >}}

- 保管庫のファイルを自分で持ち、アカウントを作りたくない → KeePassXC。決め手は「前提条件」列です。同期は「主な制約」列のとおり自分で持ちます
- 無料のまま、登録・書き換え・削除を CLI で AI に任せたい → Bitwarden。決め手は「無料枠」列と「検証区分」列です。CLI に渡すものは「前提条件」列にあります
- 無料でメールのエイリアスも使い、CLI は要らない → Proton Pass。決め手は「無料枠」列です。CLI が要るなら「主な制約」列のとおり有料プランになります
- 有料でよく、家族と共有し、CLI と SDK まで使いたい → 1Password。決め手は「料金」列と「前提条件」列です。サービスアカウントで扱える保管庫の範囲は「主な制約」列にあります
- CI や AI エージェントに機械用のトークンで secret を渡したい → [シークレット管理 CLI 6 つの比較](/posts/secret-management-cli/)が対象です

## よくある質問

### Bitwarden の無料プランで CLI は使えますか？

使えます。CLI は個人 API キーでログインし、マスターパスワードで復号します [3][4]。
この比較の実行検証では、無料プランのアカウントで項目の作成・書き換え・ごみ箱・復元・完全削除・暗号化エクスポートまで非対話で通りました。
TOTP の生成・ファイル添付・ファイルの Send は Premium の機能で、CLI から呼ぶと止まります [2]。

### KeePassXC はクラウド同期が要りますか？

要りません。保管庫は手元の 1 ファイルで、同期の機能は本体にありません [10]。
複数の端末で使うなら、公式の FAQ のとおりファイルを同期サービスのフォルダに置き、鍵ファイルは別に配ります [10]。

### 1Password に無料プランはありますか？

恒常の無料プランはありません。Individual と Families のどちらも 14 日のトライアルがあり、カードの登録は不要です [8]。
CLI の導入手順はサブスクリプションを前提に書かれています [9]。実行検証では、有料プランのサービスアカウントで項目の作成から完全削除まで非対話で通りました。

## 出典

1. [Bitwarden — Pricing](https://bitwarden.com/pricing/) — 2026-10-21 確認
2. [Bitwarden Help — About Bitwarden Plans](https://bitwarden.com/help/about-bitwarden-plans/) — 2026-10-21 確認
3. [Bitwarden Help — Password Manager CLI](https://bitwarden.com/help/cli/) — 2026-10-21 確認
4. [Bitwarden Help — Personal API Key for CLI Authentication](https://bitwarden.com/help/personal-api-key/) — 2026-10-21 確認
5. [Bitwarden Help — Encrypted Exports](https://bitwarden.com/help/encrypted-export/) — 2026-10-21 確認
6. [bitwarden/clients — LICENSE.txt](https://github.com/bitwarden/clients/blob/main/LICENSE.txt) — 2026-10-21 確認
7. [Proton Pass — Pricing & Plans](https://proton.me/pass/pricing) — 2026-10-21 確認
8. [1Password — Pricing for Individuals & Families](https://1password.com/pricing/password-manager) — 2026-10-21 確認
9. [1Password Developer — Get started with 1Password CLI](https://www.1password.dev/cli/get-started/) — 2026-10-21 確認
10. [KeePassXC — Documentation and FAQ](https://keepassxc.org/docs/) — 2026-10-21 確認
11. [KeePassXC — Download](https://keepassxc.org/download/) — 2026-10-21 確認
12. [keepassxc-cli(1) — man page](https://github.com/keepassxreboot/keepassxc/blob/develop/docs/man/keepassxc-cli.1.adoc) — 2026-10-21 確認
13. [KeePassXC — COPYING](https://github.com/keepassxreboot/keepassxc/blob/develop/COPYING) — 2026-10-21 確認
