+++
title = 'シークレット管理 CLI 6 つ比較: AI が非対話で扱える範囲'
date = '2026-09-05T23:35:51+09:00'
lastmod = '2026-10-03'
draft = false
summary = 'Bitwarden Secrets Manager・Infisical・Doppler・1Password・HashiCorp Vault Community・OpenBao を、個人が使える最小プランの料金、無料枠の上限、機械向けトークンの作り方とスコープ、run 相当の注入、読み取り専用の作り分けで比較。6 つすべてを AI が実際に動かし、無料でカード登録なしに CI や AI エージェントへ読み書きさせるなら Bitwarden Secrets Manager が条件を満たす。'
categories = ['developer-tools']
tags = ['secrets-management', 'bitwarden', '1password', 'infisical', 'doppler', 'hashicorp-vault', 'openbao']
# OGP 用の画像。本文と一覧には出さない（hidden）。生成は desk の images/
[cover]
  image = '/images/og/secret-management-cli.jpg'
  alt = 'シークレット管理 CLI の比較'
  hidden = true
  hiddenInList = true
+++

## 結論

API キーや認証情報を CI や AI エージェントに渡すためのシークレット管理サービス 6 つを、「人間が画面を触らずに、CLI とトークンだけでどこまで扱えるか」を軸に比べました。

- **無料でカード登録なしに始め、CI や AI エージェントに読み書きまでさせたい** → Bitwarden Secrets Manager。machine account のトークンだけで、project の作成から削除まで CLI で閉じます
- **読み取り専用の役割を API から作り分けたい。将来セルフホストしたい** → Infisical。identity の作成からロールの付与・削除まで REST API で閉じ、セルフホストもできます
- **すでに 1Password を契約している** → 1Password。サービスアカウントと `op run` で足ります。ただしアカウントあたりの日次のリクエスト上限があります

| こういう条件なら | 対象 | 決め手 |
| --- | --- | --- |
| 無料でカード登録なしに始め、CI や AI エージェントに読み書きまでさせたい | Bitwarden Secrets Manager | 「無料枠」列（secret 数は無制限）と「主な制約」列（権限の付け替えは web vault） |
| 読み取り専用の主体を API から作り分けたい。将来セルフホストに移すかもしれない | Infisical | 「主な制約」列（identity の操作は REST API）と「前提条件」列（セルフホスト可） |
| CLI の速さとオフラインでの再実行が欲しい | Doppler | 棒グラフ（注入までの時間が最も短い）と「主な制約」列（機械向けは service token） |
| すでに 1Password を契約していて、ツールを増やしたくない | 1Password | 「料金」列（無料プランなし）と「主な制約」列（アカウントあたりの日次の上限） |
| 自分でサーバーを持ち、policy と AppRole で権限を細かく切りたい | HashiCorp Vault Community | 「前提条件」列（自分でサーバーを起動する）と「主な制約」列（ライセンスと Agent の設定ファイル） |
| Vault と同じ使い方で、BUSL を避けたい | OpenBao | 「主な制約」列（ライセンスと、Vault の手順がそのまま通ること） |

## 比較表

仕様・料金は末尾の各出典の確認日時点、実測は 2026-09-05 時点の情報です。出典は末尾の番号に対応しています。
料金は個人が申し込める最小のプランで揃えています。Bitwarden・Infisical・1Password の有料料金は年払い換算の月額（USD）、Doppler は料金ページの月額表示です。
対象名を押すと、その対象の詳細に移ります。

| 対象 | 料金 | 無料枠 | 主な制約 | 前提条件 | 検証区分 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| [Bitwarden Secrets Manager](#bitwarden-secrets-manager) | Free（USD 0）。有料は Teams USD 6/ユーザー/月、Enterprise USD 12/ユーザー/月 | ユーザー 2・machine account 3・project 3。secret 数は無制限 | project の 4 つ目は 400 で拒否。machine account の権限は web vault で付け、CLI からは変えられない。access token は再表示できない | Bitwarden アカウント（Free）と Free organization。実際の登録ではカード不要（料金ページに記載なし）。`bws` はバイナリか Docker | {{< verified run >}} | [1][2][4][7][8] |
| [Infisical](#infisical) | Free（USD 0）。有料は Pro USD 20/identity/月（年払い。月払いは USD 23。30 日トライアル） | identity 5・environment 3・secret sync 10。project 数は無制限、監査ログの保持なし | environment の 4 つ目は 400 で拒否。project の作成と identity の操作は CLI に無く REST API。token の TTL は設定で指定。既定値は公式内で不一致 | Free にサインアップ。カード不要と料金ページに明記（実際の登録でも不要）。machine identity に Universal Auth か Token Auth。セルフホスト可 | {{< verified run >}} | [9][10][11][12][13] |
| [Doppler](#doppler) | Developer（USD 0、3 ユーザーまで。4 人目から USD 8/月）。有料は Team USD 21/ユーザー/月（14 日トライアル） | project 10・environment 4・service token 50・CLI token 5/ユーザー。監査ログは 3 日 | environment の 5 つ目は拒否。service account は Team 以上のみで、Developer で機械向けに使えるのは config 単位の service token | アカウントのみ。カード不要（実際に登録して確認）。personal token はダッシュボード、service token は CLI で発行 | {{< verified run >}} | [14][15][16][17] |
| [1Password](#1password) | Individual USD 2.99/月（初年度。以後 3.99）、Families USD 4.49/月（初年度。以後 5.99）。無料プランなし | 14 日トライアルのみ | レート制限はトークンあたり write 100/時・read 1,000/時、アカウントあたり 1,000/日で、超過は 429。サービスアカウントの権限は作成後に変更不可 | 有料サブスクリプション。サービスアカウントは web または CLI で作成。作成権限が要る。`op` はバイナリ | {{< verified run >}} | [18][19][20][21] |
| [HashiCorp Vault Community](#hashicorp-vault-community) | 無料（セルフホスト）。HCP Vault Dedicated は組織作成時に USD 500 の trial credit（6 か月） | セルフホストに上限なし | BUSL 1.1（IBM の有料版と競合するホスト型・組み込み提供は対象外）。`run` 相当のサブコマンドは無く、Agent の設定ファイルが要る。`-dev` モードは本番利用不可 | バイナリを置いて自分でサーバーを起動する。アカウント・カードとも不要 | {{< verified run >}} | [22][23][24][25][26] |
| [OpenBao](#openbao) | 無料（セルフホスト） | セルフホストに上限なし | ライセンスは MPL 2.0。Vault 用の CLI 手順と Agent の設定ファイルがそのまま通る（実測） | バイナリを置いて自分でサーバーを起動する。アカウント・カードとも不要 | {{< verified run >}} | [27][28][29] |

{{< bars unit="ms" caption="secret 1 件を子プロセスの環境変数に注入して起動するまでの時間（2026-09-05、macOS Apple Silicon、東京から。各対象の「検証した内容」の実測値。Vault / OpenBao は Agent が子プロセスを起動する前に約 2 秒待つ）" >}}
Doppler（doppler run）: 686
Infisical（infisical run）: 784
Bitwarden（bws run）: 800
1Password（op run）: 1169
Vault（agent exec）: 2117
OpenBao（agent exec）: 2152
{{< /bars >}}

## 比較の前提

- 対象に含めたもの: 公式の料金ページと CLI のドキュメントが公開されていて、個人アカウントから機械向けのトークンを発行し、
  AI が非対話で読み書きできた 6 つです。Bitwarden は Password Manager ではなく Secrets Manager（`bws`）を対象にしました。
  同じ Free アカウントで使えますが別製品で、この記事では Secrets Manager だけを動かしています
- 除外したもの: AWS Secrets Manager や Google Cloud Secret Manager などクラウドの従量課金サービス。無料枠はあってもアカウント作成にカード登録が要り、
  料金の単位（secret 数 × 月、API 呼び出し数）が他と揃いません。HashiCorp のマネージド版 HCP Vault Dedicated は、時間単価が公式の料金ページで取得できなかったため、
  trial credit の記載だけを Vault の行に添えています
- 検証区分の意味: {{< verified run >}} = AI が実際に動かして確認した / {{< verified spec >}} = 公式ドキュメントで確認したのみ
- 料金表記の注意: 1Password の月額は初年度の価格で、2 年目からは上がります [18]。Doppler の Developer は無料ですが、ユーザーが一定の人数を超えると、超えた人数ぶんの月額がかかります [14]
- 選び方の軸: 「無料枠」列は、上限を数える単位が揃いません。Bitwarden は machine account と project の数、Infisical は identity と environment の数、
  Doppler は environment と service token の数で数えます。棒グラフには載せず、実測した注入時間だけを図にしています。
  「主な制約」列は、機械向けの主体の権限をどこで付けるか（web の画面か、CLI や API か）と、`run` 相当のサブコマンドがあるかで分かれます。
  ライセンスもこの列で分かれます。Vault は「OSS」と書いていません。ソースは公開されていますがライセンスが BUSL 1.1 で、OSI の定義するオープンソースではないためです。
  MPL 2.0 のまま維持されているフォークとして OpenBao を別の行にしています。
  「前提条件」列は、アカウントを作って使うサービスか、自分でサーバーを起動するかで分かれます
- 検証の手順: 6 つに、2026-09-05 に同じ 5 段階を流しました。(1) 非対話でトークンを得る (2) secret を 1 件作る (3) `run` 相当で子プロセスの環境変数に注入する (4) 読み取り専用のトークンで書き込みが拒否される (5) secret とトークンを消す。値は出力せず、長さだけを記録しています。
  1Password のサービスアカウントは、この記事の運営で実際に使っているもの（Dev vault に読み取りのみ）で検証し、書き込み可のトークンでの作成〜削除は行っていません。
  結果は「各対象の詳細」の「検証した内容」に書いています

## 各対象の詳細

### Bitwarden Secrets Manager

Password Manager と同じ Bitwarden アカウントで使える、開発者向けの secret 保管サービスです。
Free の organization に置いた machine account のトークンだけで、project の作成から削除まで CLI で閉じました。

{{< fit run >}}
向く: 無料でカード登録なしに、CI や AI エージェントに読み書きまでさせたい
向かない: 機械向けの権限を CLI や API から付け替えたい。project を多く分けたい
{{< /fit >}}

- **料金体系**: Free は organization を作ると有効化できます。有料の料金は年払いです [1][2]
- **制約**: machine account の権限は project ごとに「Can read」か「Can read, write」を選びます [7]。
  access token は Bitwarden 側に保存されません。有効期限は作成時に決め、既定は無期限です [8]。Free organization はコレクションが 2 つまでです [6]
- **前提条件**: Free organization で Secrets Manager を有効にして使います。カードを求められないことは、2026-09-05 の実際の登録で Free organization の作成まで確かめました [1]。
  `bws` のバイナリは 12 MB で、認証は環境変数 `BWS_ACCESS_TOKEN` だけです [4]
- **検証した内容**: 2026-09-05 に bws 2.1.0 で実行しました。認証は machine account の access token（94 文字）だけで、`bws project list` が 0.5 秒で返ります。

  | 操作 | 結果 |
  | --- | --- |
  | `bws project create` → `bws secret create` | 各 0.5 秒。machine account 自身が project を作れ、作った project に自動で権限が付く |
  | `bws secret get`、`bws secret list -o env` | 値が一致。`-o env` は `KEY="value"` 形式で出す |
  | `bws run --project-id <id> -- '<cmd>'` | 0.8 秒。secret の key 名がそのまま環境変数になる。`--no-inherit-env` で親の環境変数を渡さない |
  | 無い secret / project の id を指定 | 404「Resource not found」 |
  | project の 4 つ目を作成 | **400**「You have reached the maximum number of projects (3) for this plan」 |
  | `bws secret delete` → `bws project delete` | 削除後の取得は 404 |

  読み取り専用のトークンで書き込みが拒否されるかは、権限が web 側でしか付けられないため CLI だけでは再現していません。
  検証で作った project と secret はその場で削除し、終了時に project 0 件を確認しています

### Infisical

CLI と REST API の両方が公開されていて、identity（機械向けの主体）の作成やロールの付与まで API で閉じます。
6 つのうち、読み取り専用の主体を作って書き込み拒否まで API だけで再現できたのは Infisical と Vault / OpenBao だけです。

{{< fit run >}}
向く: 読み取り専用の主体を API から作り分けたい。将来セルフホストに移したい
向かない: project の作成や identity の操作まで CLI だけで済ませたい。環境を多く分けたい
{{< /fit >}}

- **料金体系**: 有料プランのトライアルに、カードは不要です [9]
- **制約**: environment の上限を超えると 400「Failed to create environment due to environment limit reached. Upgrade plan」で止まります。
  identity の access token は JWT で、TTL と最大使用回数は Token Auth の設定で決めます [12][13]。
  TTL の既定値は同じ公式ページの設定説明で 2,592,000 秒（30 日）、API 利用説明で 7,200 秒と記載が揃っていないため、ここでは断定しません。
  接続元 IP を絞る機能は Cloud では Pro、セルフホストでは enterprise ライセンスが必要です。既定の `0.0.0.0/0` はすべての IPv4 アドレスを許可します [13]。
  `secrets delete` は `--type` の既定が `personal` のため、identity のトークンでは `--type shared` を付けないと 400「Must be user to delete personal secret」になります [11]
- **前提条件**: Universal Auth は client id と client secret で認証します。カード不要は 2026-09-05 の実際の登録でも確かめました。
  `infisical` のバイナリは 122 MB で、`--token` か環境変数 `INFISICAL_TOKEN` で認証します [10][11][12]。セルフホストできるのは、ソースが公開されているためです [9]
- **検証した内容**: 2026-09-05 に infisical 0.43.129 と REST API で実行しました。identity は Token Auth（TTL 30 日）です。接続元 IP の絞り込みが有効かは検証していません。

  | 操作 | 結果 |
  | --- | --- |
  | `POST /v2/workspace`（API）→ `infisical secrets set` | project 作成 0.9 秒（dev / staging / prod の 3 環境が付く）。set 1.8 秒 |
  | `infisical secrets get --plain`、`infisical export --format dotenv` | 値が一致。無い secret の `get` は終了コード 0 で空を返す |
  | `infisical run --projectId <id> --env dev -- <cmd>` | 0.8 秒。「Injecting 1 Infisical secrets」と出て子プロセスに届く |
  | API で identity をもう 1 つ作り、project に viewer で追加、その token で `secrets set` | 拒否。`secrets delete` は **403**「You are not allowed to delete on secrets」 |
  | identity を削除した後、その token で `secrets get` | **401**「Failed to authorize: identity tokens have been revoked」 |
  | environment の 4 つ目を作成（API） | **400**「environment limit reached. Upgrade plan to create more environments」 |
  | `secrets delete --type shared` → project 削除（API） | 削除後の project 一覧は 0 件 |

  本文なしの DELETE に `Content-Type: application/json` を付けると 500 が返ります。ヘッダーを外すと 200 で通りました

### Doppler

CLI の応答が 6 つで最も速く、取得した secret を暗号化した fallback ファイルに書いて次回以降を速くします。
Developer プランに service account は無く、機械向けには config 単位の service token を使います。

{{< fit run >}}
向く: CLI の速さとオフラインでの再実行が欲しい。環境の数は少なくて足りる
向かない: 無料プランで service account を使いたい。監査ログを長く残したい
{{< /fit >}}

- **料金体系**: Developer の上限には、表に載せた以外に webhook 5・config sync 5 があります [14]
- **制約**: environment の上限を超えると「Your project has reached its limit of 4 environments. Upgrade to the Team plan to increase your limit」で止まります。
  service account（ユーザーに紐づかない主体）は、Developer ではダッシュボードに作成の選択肢が出ません [14]。
  service token は project と config を内包した読み取り専用（`read`）か読み書き（`read/write`）のトークンで、`--max-age` で期限を付けられます [16]
- **前提条件**: personal token は `dp.pt.` で始まり、service token は `dp.st.` で始まります。service token を CLI で作るコマンドは `doppler configs tokens create` です [15][16]。
  `doppler` のバイナリは 11 MB です
- **検証した内容**: 2026-09-05 に doppler 3.76.5 で実行しました。認証は personal token（環境変数 `DOPPLER_TOKEN`）です。

  | 操作 | 結果 |
  | --- | --- |
  | `doppler projects create` → `doppler secrets set`（stdin） | 0.5 秒 / 0.7 秒。project には dev / stg / prd の 3 環境と root config が付く |
  | `doppler secrets get --plain` | 0.4 秒。config には `DOPPLER_CONFIG` / `DOPPLER_ENVIRONMENT` / `DOPPLER_PROJECT` が最初から入る |
  | `doppler run --project <p> --config dev -- <cmd>` | 0.7 秒。2 回目は fallback ファイルが効いて 0.4 秒。`--mount` で環境変数に入れずファイルに渡せる |
  | `doppler configs tokens create --access read --max-age 15m` | 0.5 秒で service token。`doppler me` の type は `service_token` |
  | read の service token で `secrets set` | 拒否「You do not have write access to this config's secrets」 |
  | read の service token で token 作成 / 別 config（prd）の読み取り | 拒否「You do not have access to service tokens」/「This token does not have access to requested config 'prd'」 |
  | `configs tokens revoke` 後に `secrets get` | 拒否「Invalid Auth token」。revoke には `--project` と `--config` の指定が要る |
  | environment の 5 つ目を作成 | 拒否「reached its limit of 4 environments. Upgrade to the Team plan」 |
  | `secrets delete -y` → `projects delete -y` | 削除後の取得は「Could not find requested secret」/「Could not find requested project」 |

### 1Password

パスワードマネージャーの契約に含まれる開発者向け機能で、サービスアカウントのトークンだけで `op read` と `op run` が動きます。
無料プランが無いので主役にはしていませんが、`op run` は子プロセスの標準出力に出た secret を自動で伏せます。

{{< fit run >}}
向く: すでに 1Password を契約していて、ツールを増やしたくない
向かない: 無料で始めたい。CI で毎回の注入を頻繁に回したい（日次の上限がある）
{{< /fit >}}

- **料金体系**: Individual の料金は年払いです。Families は 5 人までです。CLI とサービスアカウントは Individual から使えます [18]
- **制約**: アカウントあたりの日次の上限は Individual / Families の値で、Business は 50,000/日です [21]。
  サービスアカウントの権限は vault ごとに「読み取り / 書き込み / 共有」を作成時に選びます。built-in の Personal・Private・Employee vault と既定の Shared vault には付けられません [20]
- **前提条件**: CLI では `op service-account create` で作成し、トークンは作成時に 1 度だけ表示されます。
  既存のサービスアカウントトークンだけで別のサービスアカウントを作れるかは未確認です [20]。
  `op` は環境変数 `OP_SERVICE_ACCOUNT_TOKEN` だけで認証します [19]
- **検証した内容**: 2026-09-05 に op 2.39.0 で実行しました。トークンはこの記事の運営で使っているもの（Dev vault に読み取りのみ）です。

  | 操作 | 結果 |
  | --- | --- |
  | `op whoami`、`op vault list` | type は `SERVICE_ACCOUNT`。権限の無い vault は一覧に出ない |
  | `op read "op://Dev/<item>/<field>"` | 1.5 秒。サーバー往復のぶん他の 3 サービスより遅い |
  | `op run --env-file=<.env> -- <cmd>` | 1.2 秒。`.env` の `op://` 参照を環境変数に解決する。子が値を `echo` すると `<concealed by 1Password>` に伏せられ、`--no-masking` で外せる |
  | 読み取りのみのトークンで `op item create` / `op item edit` | **(101)**「You do not have permission to perform this action」/「Couldn't update the item.」 |
  | 権限の無い vault を名前で指定 | 「isn't a vault in this account」 |
  | `op service-account ratelimit` | token write 100/時、token read 1,000/時、account read_write 1,000/日の 3 行。拒否された `item create` と `item edit` も write の使用数に 2 件加算された |

  書き込み可のサービスアカウントでの作成〜削除は行っていません。トークンの権限は作成時に固定されるため、必要なら別のサービスアカウントを作ります

### HashiCorp Vault Community

自分でサーバーを起動する方式で、policy と AppRole で権限を細かく切れます。
`run` に相当するサブコマンドは無く、Agent の設定ファイル（`env_template` と `exec`）で子プロセスに注入します。

{{< fit run >}}
向く: 自分でサーバーを持ち、policy と AppRole で権限を細かく切りたい
向かない: サーバーを運用したくない。サブコマンドだけで手軽に注入したい
{{< /fit >}}

- **料金体系**: マネージド版の HCP Vault Dedicated は、時間単価を公式の料金ページから取得できませんでした [26]
- **制約**: Additional Use Grant が除外する「競合」について、LICENSE は、有料サポートを含む有償提供で IBM の有料版と機能が大幅に重なる製品を競合と定義し、組織内部でのホスティング・利用は競合に含めないと明記しています [22]。
  `vault server -dev` は in-memory・unseal 済みで起動します [24]。
  バイナリは 514 MB、dev サーバーの常駐メモリは起動直後 148 MB・一巡後 158 MB でした（実測）
- **前提条件**: `run` 相当は Agent の process supervisor mode で、
  HCL の設定ファイルと auto_auth の設定が要ります [25]
- **検証した内容**: 2026-09-05 に Vault 2.1.0 を `-dev` で起動して実行しました。root トークンは `-dev-root-token-id` で起動時に渡しています。

  | 操作 | 結果 |
  | --- | --- |
  | `vault server -dev` → `vault status` | 250 ms で応答。`storage_type` は `inmem` |
  | `vault kv put` → `vault kv get -field`（KV v2） | 値が一致 |
  | `vault agent`（`env_template` + `exec`） | 2.1 秒で子プロセスに環境変数が届き、子が終わると Agent も終了。うち約 2 秒は起動待ち |
  | policy `read` のみのトークンで `kv put` | **403**。失効後の `kv get` も 403 |
  | AppRole（`role_id` + `secret_id` → token） | login 76 ms。token の policies は `["default", "lab-ro"]`、TTL 599 秒 |
  | `secret_id_num_uses=1` の secret_id を再利用 | **400** |
  | `kv metadata delete` → `kv get` | 「No value found」 |

  検証の終了時にサーバーを停止し、in-memory のため何も残りません

### OpenBao

Vault が MPL 2.0 だった時点からのフォークで、Linux Foundation（OpenSSF）の Sandbox project です。
Vault 用に書いた CLI 手順と Agent の設定ファイルが、コマンド名を `bao` に変えるだけでそのまま通りました。

{{< fit run >}}
向く: Vault と同じ手順のまま、BUSL ではないライセンスで使いたい
向かない: サーバーを運用したくない。Vault と同じ形式のトークンを前提にした仕組みがある
{{< /fit >}}

- **料金体系**: 表の「料金」列のとおり、セルフホストで無料です [27][28]
- **制約**: バイナリは 185 MB、dev サーバーの常駐メモリは起動直後 81 MB・一巡後 86 MB で、Vault より小さいです（実測）。
  トークンは 26 文字で、Vault の 95 文字（`hvs.` 系）と形式が違います。`bao server -dev` の性質は Vault と同じです [29]
- **前提条件**: Vault と同じく、バイナリを置くだけで始められます [27]
- **検証した内容**: 2026-09-05 に OpenBao 2.6.2 で、Vault と同じスクリプトを `bao` に置き換えて実行しました。

  | 操作 | 結果 |
  | --- | --- |
  | `bao server -dev` → `bao status` | 316 ms で応答 |
  | `bao kv put` → `bao kv get -field` | 値が一致 |
  | `bao agent`（Vault と同じ HCL） | 2.2 秒で子プロセスに届く |
  | read のみのトークンで `kv put`、失効後の `kv get` | **403** / 403 |
  | AppRole login、`secret_id` の再利用 | 107 ms / **400** |
  | `kv metadata delete` → `kv get` | 「No value found」 |

## 用途別の選び方

上から順に答えていくと、条件に合う対象にたどり着きます。各分岐の決め手は比較表の列で、数字はそちらを見てください。

{{< svg src="secret-management-cli-flow.svg" alt="用途別の判断フロー。無料でカード登録なしに CI や AI に読み書きさせるなら Bitwarden Secrets Manager、読み取り専用の主体を API で作り分けるか将来セルフホストするなら Infisical、CLI の速さとオフラインの fallback が要るなら Doppler、すでに 1Password を契約しているなら 1Password、自分でサーバーを持って policy で権限を切るなら Vault Community か OpenBao" caption="図: 用途別の判断フロー" >}}

- 無料でカード登録なしに始め、CI や AI エージェントに読み書きまでさせたい → Bitwarden Secrets Manager。決め手は「無料枠」列と「主な制約」列です。
  ただし権限の付け替えは web vault で行います
- 読み取り専用の主体を API から作り分けたい。将来セルフホストに移す可能性がある → Infisical。決め手は「主な制約」列と「前提条件」列です。
  無料枠では environment の数に上限があります
- CLI の速さとオフラインでの再実行が欲しい → Doppler。決め手は棒グラフと「主な制約」列です。機械向けは service token で運用します
- すでに 1Password を契約していて、他のツールを増やしたくない → 1Password。決め手は「料金」列と「主な制約」列です。
  日次の上限は、CI で毎回 `op run` を回す用途だと当たり得ます
- 自分でサーバーを持てて、policy と AppRole で権限を細かく切りたい → Vault Community か OpenBao。決め手は「前提条件」列と「主な制約」列です。
  ライセンスが問題になる用途なら OpenBao です

この記事の検証は、[国内 VPS の最小プラン比較](/posts/vps-japan-minimum-plan/)で Terraform に渡した認証情報と、
[死活監視の無料枠比較](/posts/uptime-monitoring-free-tier/)で使った API キーを、1Password のサービスアカウントから `op run` で注入する運用の延長で行いました。
AI に API キーを渡す場面がある記事では、この記事で比べた手段のどれかが前提になります。
たとえば [トランザクションメール送信 API 5 つの無料枠比較](/posts/email-api-free-tier/)では、Resend の API キーを `op run` で注入して送信ドメインの登録から削除まで動かしています。
[スクレイピング API 5 つの無料枠比較](/posts/scraping-api-free-tier/)でも、3 社の API キーを `op run` で注入して取得から上限の確認まで動かしています。
[クラウドストレージ 6 つの無料プラン比較](/posts/cloud-storage-free-tier/)では、API キーではなくパスワードとアプリ専用パスワードを `op run` で注入して、WebDAV と REST API を動かしています。

## よくある質問

### 無料で使えるシークレット管理サービスはどれですか？

Bitwarden Secrets Manager・Infisical・Doppler には USD 0 のプランがあり、3 つとも 2026-09-05 の実際の登録でカードは求められませんでした [1][9][14]。
Vault Community と OpenBao はセルフホストで無料です [23][27]。1Password は無料プランが無く、14 日のトライアルだけです [18]。

### AI エージェントや CI に、画面を触らずにシークレットを渡せますか？

6 つとも、トークンだけで非対話に子プロセスの環境変数へ注入できました。
Bitwarden・Infisical・Doppler・1Password は `run` 相当のサブコマンド、Vault と OpenBao は Agent の設定ファイル（`env_template` と `exec`）で注入します [4][10][15][19][25]。
ただし Bitwarden の machine account の権限付けと、Doppler の personal token の発行は web の画面で行います [7][15]。

### 読み取り専用のトークンは作れますか？

6 つとも作れます。Doppler は `read` の service token、1Password は作成時に読み取りだけを選んだサービスアカウント、Bitwarden は web vault で「Can read」を付けた machine account です [7][16][20]。
Infisical の viewer の identity と、Vault / OpenBao の `read` だけの policy のトークンでは、書き込みが 403 で拒否されることを確かめています。Bitwarden は権限が web 側でしか付けられないため、拒否は CLI では再現していません。

### HashiCorp Vault と OpenBao の違いは？

OpenBao は Vault が MPL 2.0 だった時点からのフォークで、ライセンスは MPL 2.0 です [27][28]。Vault Community は BUSL 1.1 で、IBM の有料版と競合するホスト型・組み込みの提供が除外されています [22]。
CLI の手順と Agent の設定ファイルは、コマンド名を `bao` に変えるだけでそのまま通りました。

## 出典

1. [Bitwarden Pricing](https://bitwarden.com/pricing/) — 2026-10-03 確認
2. [Bitwarden Secrets Manager](https://bitwarden.com/products/secrets-manager/) — 2026-10-03 確認
3. [Bitwarden Help — Password Manager CLI](https://bitwarden.com/help/cli/) — 2026-10-03 確認
4. [Bitwarden Help — Secrets Manager CLI](https://bitwarden.com/help/secrets-manager-cli/) — 2026-10-03 確認
5. [Bitwarden Help — Secrets Manager Quick Start](https://bitwarden.com/help/secrets-manager-quick-start/) — 2026-10-03 確認
6. [Bitwarden Help — About Organizations](https://bitwarden.com/help/about-organizations/) — 2026-10-03 確認
7. [Bitwarden Help — Machine Accounts](https://bitwarden.com/help/machine-accounts/) — 2026-10-03 確認
8. [Bitwarden Help — Access Tokens](https://bitwarden.com/help/access-tokens/) — 2026-10-03 確認
9. [Infisical Pricing](https://infisical.com/pricing) — 2026-10-03 確認
10. [Infisical Docs — CLI Overview](https://infisical.com/docs/cli/overview) — 2026-10-03 確認
11. [Infisical Docs — CLI Reference](https://infisical.com/docs/cli/reference) — 2026-10-03 確認
12. [Infisical Docs — Machine Identities](https://infisical.com/docs/documentation/platform/identities/machine-identities) — 2026-10-03 確認
13. [Infisical Docs — Token Auth](https://infisical.com/docs/documentation/platform/identities/token-auth) — 2026-10-03 確認
14. [Doppler Pricing](https://www.doppler.com/pricing) — 2026-10-03 確認
15. [Doppler Docs — CLI](https://docs.doppler.com/docs/cli) — 2026-10-03 確認
16. [Doppler Docs — Service Tokens](https://docs.doppler.com/docs/service-tokens) — 2026-10-03 確認
17. [Doppler Docs — Service Accounts](https://docs.doppler.com/docs/service-accounts) — 2026-10-03 確認
18. [1Password 個人向け料金プラン](https://1password.com/jp/pricing/personal) — 2026-10-03 確認
19. [1Password Developer — CLI Get Started](https://www.1password.dev/cli/get-started/) — 2026-10-03 確認
20. [1Password Developer — Service Accounts Get Started](https://www.1password.dev/service-accounts/get-started/) — 2026-10-03 確認
21. [1Password Developer — Service Account Rate Limits](https://www.1password.dev/service-accounts/rate-limits/) — 2026-10-03 確認
22. [HashiCorp Vault LICENSE（BUSL 1.1）](https://github.com/hashicorp/vault/blob/main/LICENSE) — 2026-10-03 確認
23. [Vault Docs — Install](https://developer.hashicorp.com/vault/docs/install) — 2026-10-03 確認
24. [Vault Docs — server command](https://developer.hashicorp.com/vault/docs/commands/server) — 2026-10-03 確認
25. [Vault Docs — Agent process supervisor mode](https://developer.hashicorp.com/vault/docs/agent-and-proxy/agent/process-supervisor) — 2026-10-03 確認
26. [HCP Docs — Billing](https://developer.hashicorp.com/hcp/docs/hcp/admin/billing) — 2026-10-03 確認
27. [OpenBao](https://openbao.org/) — 2026-10-03 確認
28. [OpenBao LICENSE（MPL 2.0）](https://github.com/openbao/openbao/blob/main/LICENSE) — 2026-10-03 確認
29. [OpenBao Docs — server command](https://openbao.org/docs/commands/server/) — 2026-10-03 確認
