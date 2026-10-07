+++
title = 'ComfyUI をローカルとクラウド 3 社で比較: AI に任せられた範囲と、自分でする準備'
date = '2026-10-07T18:05:00+09:00'
lastmod = '2026-10-07'
draft = false
summary = 'ComfyUI を動かす場所として、手元の PC に入れるローカル版と、ComfyUI を用意したクラウド 3 つ（国内の ConoHa AI Canvas、海外の ThinkDiffusion と RunDiffusion）を、最初に自分ですること、AI に任せられた範囲、起動中の課金と保存が消える条件、外部のツールから接続できるかで比較。ローカル版は GPU 付きの PC で、AI が環境の構築から生成・中断・停止までローカル API で一巡した。クラウド 3 つは公式ページの確認で、ConoHa AI Canvas は申込時に支払い情報が要り外部接続の手順が無く、ThinkDiffusion Hobby は月会費なしの時間課金で放置すると保存が消え、RunDiffusion の API Mode は有料の上位プランだけで稼働分の単価は非公開。'
categories = ['ai-tools']
tags = ['comfyui', 'image-generation', 'conoha', 'thinkdiffusion', 'rundiffusion']
# OGP 用の画像。本文と一覧には出さない（hidden）。生成は desk の images/
[cover]
  image = '/images/og/comfyui-local-cloud.jpg'
  alt = 'ComfyUI のローカル版とクラウド 3 社の比較'
  hidden = true
  hiddenInList = true
+++

{{< pr >}}

## 結論

ComfyUI は、モデルと処理をノードでつないだ「ワークフロー」で画像を生成するオープンソースのソフトです。
これを手元の PC に入れるローカル版と、ComfyUI を用意したクラウド 3 つ（国内 1・海外 2）を、
最初に自分ですること、AI に任せられた範囲、起動中の課金と保存が消える条件、外部のツールから接続できるかで比べました。

- **GPU 付きの PC があり、環境の構築から生成・中断・停止まで AI に任せたい** → ローカル版 ComfyUI。ソフトは無料で、
  AI が同じ PC のローカル API（画面を使わずに生成を指示する口）を直接呼べます。準備は PC とモデルの用意と、モデルの利用条件の確認です
- **PC に入れず、円建て・日本語の画面で始めたい** → ConoHa AI Canvas。「料金」列の基本料に起動時間が含まれ、操作はブラウザです。
  申込時に支払い情報が要り、外部のツールから接続する手順は公式にありません
- **月会費なしで、使った時間ぶんだけ払いたい** → ThinkDiffusion Hobby。登録はメールアドレスだけで、「無料枠」列の登録時の無料分があります。
  ただし起動前の支払い登録の要否は公式に記載が無く、「主な制約」列のとおり放置すると保存したものが消えます

| こういう条件なら | 対象 | 決め手 |
| --- | --- | --- |
| GPU 付きの PC があり、AI にローカル API で操作させたい | ローカル版 ComfyUI | 「前提条件」列（AI の入口がローカル API）と「検証区分」列（実行） |
| PC に入れず、円建て・日本語の画面で始めたい | ConoHa AI Canvas | 「料金」列（基本料に起動時間を含む）と「前提条件」列（申込時に支払い情報） |
| 月会費なしで、使った時間ぶんだけ払いたい | ThinkDiffusion Hobby | 「無料枠」列（登録時の無料分）と「主な制約」列（放置で保存が消える） |
| クラウドの ComfyUI を外部のツールから API で呼びたい | RunDiffusion（有料の上位プラン） | 「前提条件」列（API Mode の対象プラン）と「料金」列（稼働分の単価は非公開） |

生成した画像の置き場を別に用意するなら、[クラウドストレージ 6 つの無料プラン比較](/posts/cloud-storage-free-tier/)を見てください。

## 比較表

2026-10-07 時点の公式情報に基づきます。出典は末尾の番号に対応しています。
ローカル版の実行は 2026-10-04 に行いました。対象名を押すと、その対象の詳細に移ります。

| 対象 | 料金 | 無料枠 | 主な制約 | 前提条件 | 検証区分 | 出典 |
| --- | --- | --- | --- | --- | --- | --- |
| [ローカル版 ComfyUI](#ローカル版-comfyui) | ソフト利用料 0 円（GPL-3.0）。PC・電力・モデルの費用は別 | サービス側の上限なし（PC の性能が上限） | 動かせるモデルと解像度は GPU の VRAM と RAM 次第。保存・更新・停止は自分で管理。有料の API ノードは起動オプションで切る | GPU 付き PC（実行は NVIDIA の VRAM 8 GB）、Python 環境、モデルの取得と利用条件の確認。AI が同じ PC のコマンドとローカル API を使える権限 | {{< verified run >}} | [1][2][3][4] |
| [ConoHa AI Canvas](#conoha-ai-canvas) | エントリー 1,100 円 / スタンダード 4,378 円 / アドバンス 9,878 円（月額・税込）。含まれる時間を超えた分は 6.6 円/分 | 無料プラン・トライアルなし。基本料に WebUI の起動時間 10 / 50 / 100 時間/月を含む。ストレージ 30 / 100 / 500 GB | 1 契約で起動できる WebUI は 1 つ。起動〜終了を分単位で課金し、既定 60 分の無操作で自動終了。解約とプラン変更は翌月から | 申込時に支払い情報（クレジットカード・ConoHa チャージ・ConoHa カード）。外部のツールから接続する手順は公式に無い | {{< verified spec >}} | [5][6][7][8][9][11][12] |
| [ThinkDiffusion Hobby](#thinkdiffusion-hobby) | 月会費なし。マシン稼働 USD 0.99 / 1.75 / 2.50 /時（VRAM 16 / 24 / 48 GB）。税の表記なし | 登録時に 15 分。ストレージ 10 GB | 48 時間操作が無いとファイル・カスタムノード・設定が消える。ファイルの出し入れはマシン起動中だけ | 登録はメールアドレスとパスワード（フォームにカード欄なし）。API の案内は Automatic1111 だけで、ComfyUI は記載なし | {{< verified spec >}} | [14][15][16][17][18] |
| [RunDiffusion](#rundiffusion) | Free 0 ドル。API Mode は Creators Club + Runnit Pro（月払い USD 49.99、年払い 41.79/月）以上。サーバー稼働分は別で、単価は公開ページに無い | Free は 1 日 100 トークン（サービス内の生成ツール用）とストレージ 10 GB・72 時間保持。ComfyUI の稼働時間の無料枠は記載なし | API は起動中のセッションだけ有効で、URL は起動のたびに変わる。1 ユーザー・1 GPU 向け | Free / Hobby / Pro では API Mode 不可。自分のモデルの持ち込みは Creators Club の保存領域が要る | {{< verified spec >}} | [19][20][21][22] |

{{< bars unit="秒" caption="ローカル版で 1 枚（1024×1024・20 steps）を生成するのにかかった時間。各条件 1 回の実測で、速度の順位付けには使わない" >}}
初回起動後の生成（モデルの読み込みを含む）: 35.6
保存した環境を再起動して同じ条件で生成: 21.0
起動したまま seed（乱数の種）を変えて生成: 18.5
中断したあとに別の seed で生成: 16.1
{{< /bars >}}

## 比較の前提

- 対象に含めたもの: ComfyUI を手元の PC で動かすローカル版と、ComfyUI を起動できる状態で提供するクラウド 3 つです。
  クラウドは国内の事業者が円建てで提供する ConoHa AI Canvas と、海外の ThinkDiffusion・RunDiffusion を選びました。
  ComfyUI を用意したクラウドはほかにもあり、この記事で網羅はしていません
- 除外したもの: GPU 付きのサーバーだけを借りて自分で ComfyUI を入れる方法は、準備の中身が違うので扱いません。
  ComfyUI の開発元が提供するクラウド版も、今回の確認対象に含めていません。
  モデルどうしの画質の比較や、生成した画像の保管・配信も範囲外です。
  保管先は[クラウドストレージ 6 つの無料プラン比較](/posts/cloud-storage-free-tier/)で比べています
- 検証区分の意味: {{< verified run >}} = AI が実際に動かして確認した / {{< verified spec >}} = 公式ドキュメントで確認したのみ
- 料金表記の注意: ConoHa AI Canvas は税込の円です。ThinkDiffusion と RunDiffusion は米ドルで、料金ページに税の表記が無く、この記事でも円に換算していません。
  ThinkDiffusion は月会費の無い Hobby の標準の時間単価で、割引のある TD-Pro と混ぜていません。
  RunDiffusion は料金ページの既定が年払い表示なので、月払いに切り替えた値を先に書いています
- 選び方の軸: 「料金」列は、固定の月額か、起動した時間ぶんの従量か、その両方かで分かれます。
  「無料枠」列は、無料で試せる入口（登録時の無料分・無料プラン）があるか、それとも基本料に含まれる時間かで分かれます。
  「主な制約」列は、止めたあとに保存したものがいつ消えるかと、同時に起動できる数で分かれます。
  「前提条件」列は、最初に自分ですること（PC の用意・支払い情報・登録）と、AI や外部のツールが入る入口（ローカル API・API Mode・記載なし）で分かれます。
  AI に任せられる範囲は、この列で決まります
- 検証の手順: ローカル版は 2026-10-04 に、AI エージェントが Windows の PC に隔離した Python 環境を作り、ComfyUI の固定版とモデルを取得し、
  ローカル API だけで生成 → 画像の取得 → 終了を一巡しました。同じ日に、保存した環境の再起動、条件の変更、生成途中の中断とその後の生成、終了まで確認しています。
  この記事はその記録を整理したもので、執筆時に生成を取り直してはいません。
  クラウド 3 つは 2026-10-07 に料金ページ・仕様・ガイド・FAQ を読み、アカウントの作成・課金・生成は行っていません
- ここで「AI に任せる」とは、PC のコマンドと API を実行する権限を与えた AI エージェントによる操作を指します。
  チャット画面から手元の ComfyUI へ自動でつながるという意味ではありません。
  API キーや接続 URL を AI に渡す手段は、[シークレット管理 CLI 6 つ比較](/posts/secret-management-cli/)で比べています

## 各対象の詳細

### ローカル版 ComfyUI

手元の PC に ComfyUI とモデルを置いて動かす方法で、4 つの中で唯一、AI が実際に動かして確認した対象です。
人が PC と実行権限を用意したあとは、環境の構築から生成・中断・停止まで AI が進められました。

{{< fit run >}}
向く: GPU 付きの PC と保存先を用意でき、生成条件の変更や中断まで AI にローカル API で任せたい
向かない: 手元にソフトやモデルを置かず、登録だけで始めたい。PC の空き容量やモデルの利用条件を自分で管理したくない
{{< /fit >}}

- **料金体系**: ソフトは GPL-3.0 で無料です [1]。本体とは別に、外部の有料サービスを呼ぶ「API ノード」があり、今回は起動オプションで無効にしました [3]
- **制約**: 開発元の README は、Windows 向けに NVIDIA・AMD・Intel の GPU 別と CPU のみの portable 版を配っています [1]。CPU のみの実行は今回確認していません。
  起動オプションの名前は版で違い、実行した v0.38.0 には有料の API ノードを切る `--disable-api-nodes` があり、現行の README が載せる `--offline` はありません [1][3]。
  導入で時間がかかったのはダウンロードです。モデル（約 6.9 GB）は 1 本の取得が遅く、8 分割で取り直して照合まで約 13 分半、
  依存パッケージも大きいものを先に取得してから残りを入れました。AI が進めても、この待ち時間は消えません
- **前提条件**: 本体とモデルは別のライセンスで、今回使った SDXL Base 1.0 は CreativeML Open RAIL++-M です [4]。
  モデルの取得先と利用条件の確認、PC の空き容量の確保は利用者に残ります
- **検証した内容**: 2026-10-04 に AI エージェントが次の構成で実行しました。成功した環境の記録で、最低の動作要件ではありません。

  | 項目 | 実行条件 |
  | --- | --- |
  | 実行環境 | Windows 11、PowerShell、uv で作った専用の Python 環境 |
  | GPU / RAM | NVIDIA GeForce RTX 4070 Laptop GPU（VRAM 8,188 MiB）/ 約 31.7 GiB |
  | ソフト | ComfyUI v0.38.0、Python 3.13.15、PyTorch 2.14.1（CUDA 13.0） |
  | モデル | SDXL Base 1.0（refiner なし）。公式の SHA-256 と照合 |
  | 生成条件 | 1024×1024、batch 1、20 steps、Euler / normal、CFG 7。架空の山と湖の風景 |
  | 接続 | 127.0.0.1 だけで待ち受け。API ノード・カスタムノード・ブラウザの自動起動を無効化 |

  ローカル API の経路は公式の Server Routes にあります [2]。AI が行った操作と結果は次のとおりです。

  | AI が行った操作 | 結果 |
  | --- | --- |
  | `GET /system_stats`・`GET /models/checkpoints`・`GET /object_info` | 版・GPU・置いたモデル・ノードの仕様を取得。起動から API の受付まで初回は約 3 分半、保存した環境の再起動は約 10 秒 |
  | 存在しないモデル名で `POST /prompt` | HTTP 400 と `value_not_in_list`。生成は始まらない |
  | 正しいワークフローで `POST /prompt` → `GET /history/{prompt_id}` → `GET /view` | 200。PNG（1024×1024）を取得し、画像として開けることと風景が描かれていることを確認 |
  | 保存した環境を再起動し、同じ条件で生成 | PNG のバイト列と画素のハッシュが前回と一致（同じ PC・同じ環境内の観測） |
  | 起動したまま seed を変更 | 画素が変わり、生成が再実行された |
  | 生成途中に `POST /interrupt` | 200。履歴に `execution_interrupted`、出力なし、キューは空 |
  | 中断後に別の seed で生成 | サーバーを再起動せずに正常な PNG を取得 |
  | プロセスを終了 | 待ち受けポートが閉じ、GPU のメモリ使用が 0 に戻ったことを確認 |

  中断は「途中から再開」ではなく、中断したあとに新しい生成を投入して成功した確認です。
  生成にかかった時間は比較表の下の図にあり、各条件 1 回の実測です

### ConoHa AI Canvas

国内の事業者が円建て・日本語の画面で提供する、ブラウザから使う ComfyUI です。
申込から起動までコントロールパネルで完結し、料金は基本料と起動時間の組み合わせです。

{{< fit spec >}}
向く: PC に入れず、円建ての基本料と日本語の案内で、ブラウザから ComfyUI を使いたい
向かない: 無料で試してから決めたい。外部のツールや AI から API で ComfyUI を操作したい
{{< /fit >}}

- **料金体系**: 起動したまま月をまたぐと、その起動の全時間が終了した月に計上され、前月の含まれる時間は使えません [8]。
  クレジットカード払いは月末締め・翌月払いです [8]。プランの違いは基本料・含まれる時間・ストレージの 3 つです [10]
- **制約**: WebUI の起動待ちは課金されず、WebUI の画面に移った時点から停止ボタンまでが課金の対象です [8]。
  解約は予約した当月末日で、即時には解約できません [8]。混雑時に「混雑中」と表示されて起動できないことがあります [9]。
  LoRA 学習の Kohya SS はエントリーでは使えません [6]
- **前提条件**: 申込はメールアドレスとパスワードでアカウントを作り、支払い情報を入力してから確定します [7]。
  起動のたびに WebUI のユーザーネームとパスワードを設定し、ComfyUI はパスワードだけで開きます [11]。
  サポートの範囲はコントロールパネルの操作までで、WebUI やモデルの設定は対象外です [10]
- **検証した内容**: 料金・仕様・契約と WebUI 起動のガイド・契約と WebUI の FAQ を 2026-10-07 に確認しました。
  API や外部のツールからの接続に触れた記述は、ガイドと FAQ のどこにもありませんでした。「接続できない」と断定する根拠にもしていません。
  申込・課金・生成は行っていません

{{< cta "conoha-ai-canvas" >}}

### ThinkDiffusion Hobby

海外のクラウドで、月会費の無い Hobby はマシンを起動した時間ぶんだけ払う方式です。
ワークフローの JSON やモデルの持ち込みを案内しており、保存の扱いが有料の TD-Pro と分かれます。

{{< fit spec >}}
向く: 月会費なしで、必要なときだけマシンを起動して使いたい。自分のモデルやカスタムノードを持ち込みたい
向かない: 使わない期間もファイルを残しておきたい。ComfyUI への API 接続が公式に明記された環境を選びたい
{{< /fit >}}

- **料金体系**: 課金は使った時間ぶんで、マシンを止めると未使用分は戻ります [16]。残高を前払いする仕組みがあります [16]。
  有料の TD-Pro の月額は、料金ページでは年払いと月払いで違う値が載り、ヘルプの Admin & Billing は 1 つの値だけを書いています（更新が 1 年前）[14][16]。
  この記事は料金ページの値を採っています
- **制約**: Hobby のファイル操作はマシンが起動している間だけで、いつでも使えるファイルブラウザは TD-Pro の機能です [15]。
  マシンは複数を同時に起動でき、止め忘れを防ぐ自動停止のタイマーがあります [14]
- **前提条件**: 登録フォームの項目は Google アカウントか、メールアドレスとパスワードだけです [18]。起動前に支払いの登録が要るかは公式ページに記載がありません。
  API の案内は Automatic1111 のマシンについて「すべてのマシンで有効」と書かれ、マシンの URL で外から呼べるとあります [17]。ComfyUI については同じ案内がありません
- **検証した内容**: 料金ページ・登録フォーム・ヘルプのファイル管理・請求・API のページを 2026-10-07 に確認しました。登録・起動・生成は行っていません

### RunDiffusion

海外のクラウドで、ComfyUI を外部のツールから呼ぶ「API Mode」の手順を公式に載せています。
ブラウザで使う条件と API Mode を使う条件が料金表で分かれており、無料プランでは後者が使えません。

{{< fit spec >}}
向く: クラウドの ComfyUI を外部のツールから API で呼びたく、月会費のある上位プランを前提にできる
向かない: 無料プランの登録だけで API 接続まで試したい。稼働分の単価を申込前に公開ページで確かめたい
{{< /fit >}}

- **料金体系**: 料金ページの既定は年払い表示で、月払いに切り替えると各プランの月額が上がります [19]。
  Free の無料分はサービス内の生成ツール向けのトークンで、ComfyUI のサーバー稼働時間とは別です [19]。
  サーバーの大きさは Small・Medium・Large・Max の 4 段ですが、時間単価は公開ページに載っていません [22]
- **制約**: API は起動中のセッションに結び付き、セッションの終了・再起動・URL の変更で止まります [21]。
  公式は接続 URL を一時的なアクセス手段として扱い、公開の場所に置かないよう求めています [21]
- **前提条件**: API Mode は起動前の設定画面で有効にします [21]。自分のモデルやファイルを置くには Creators Club の保存領域が要ります [20]
- **検証した内容**: 料金ページ（月払い・年払いの両方）・FAQ・API ガイド・Getting Started を 2026-10-07 に確認しました。登録・起動・生成は行っていません。
  検索結果に残る古い無料試用の記述は現行の料金ページに無く、採っていません

## 用途別の選び方

上から順に答えていくと、条件に合う対象にたどり着きます。各分岐の決め手は比較表の列で、数字はそちらを見てください。

{{< svg src="comfyui-local-cloud-flow.svg" alt="用途別の判断フロー。GPU 付きの PC があり AI にローカル API で操作させたいならローカル版 ComfyUI、クラウドの ComfyUI を外部のツールから API で呼びたいなら RunDiffusion の API Mode 対象プラン、PC に入れず円建て・日本語の画面で始めたいなら ConoHa AI Canvas、月会費なしで使った時間ぶんだけ払いたいなら ThinkDiffusion Hobby、どれにも当たらなければブラウザで使う 2 つを料金列と主な制約列で見比べる" caption="図: 用途別の判断フロー" >}}

- GPU 付きの PC があり、AI にローカル API で操作させたい → ローカル版 ComfyUI。決め手は「前提条件」列と「検証区分」列です。
  モデルの利用条件の確認と空き容量の確保は自分で行います
- クラウドの ComfyUI を外部のツールから API で呼びたい → RunDiffusion の API Mode 対象プラン。決め手は「前提条件」列です。
  稼働分の単価は公開ページに載っていません
- PC に入れず、円建て・日本語の画面で始めたい → ConoHa AI Canvas。決め手は「料金」列と「前提条件」列です。申込時に支払い情報が要ります
- 月会費なしで、使った時間ぶんだけ払いたい → ThinkDiffusion Hobby。決め手は「無料枠」列と「主な制約」列です。放置すると保存したものが消えます

## よくある質問

### GPU の無い PC でも ComfyUI は動きますか？

開発元は CPU のみの portable 版を配っており、起動オプションにも CPU で処理する指定があります [1][3]。
ただしこの記事の実行は GPU 付きの構成で、CPU のみでの成功や所要時間は確認していません。

### ConoHa AI Canvas に無料トライアルはありますか？

料金ページと契約のガイドに無料トライアルや無料プランの記載はなく、申込時に支払い情報を入力します [5][7]。
「無料利用時間」と呼ばれる枠は、基本料に含まれる起動時間のことです [5]。

### クラウドの ComfyUI を AI エージェントから操作できますか？

公式に手順があるのは RunDiffusion の API Mode で、対象は Creators Club + Runnit Pro 以上です [19][21]。
ThinkDiffusion は Automatic1111 の API を外から呼ぶ手順を載せていますが、ComfyUI についての記載はありません [17]。
ConoHa AI Canvas のガイドと FAQ に、外部からの接続の記述はありません [9][11]。

### 手元のワークフローをクラウドにそのまま持ち込めますか？

ワークフローの JSON のほかに、使っているモデルとカスタムノードが接続先にあることが前提です。
ThinkDiffusion は JSON か PNG からワークフローを読み込め、モデルとカスタムノードの持ち込みを案内しています [14]。
ConoHa AI Canvas はファイルマネージャーからモデルを置き、拡張機能の管理画面からカスタムノードを足します [13]。
RunDiffusion で自分のファイルを置くには Creators Club が要ります [20]。

## 出典

1. [ComfyUI — README（GitHub）](https://github.com/Comfy-Org/ComfyUI) — 2026-10-07 確認
2. [ComfyUI Server Routes（HTTP and WebSocket API）](https://docs.comfy.org/development/comfyui-server/comms_routes) — 2026-10-07 確認
3. [ComfyUI v0.38.0 — comfy/cli_args.py](https://github.com/Comfy-Org/ComfyUI/blob/v0.38.0/comfy/cli_args.py) — 2026-10-07 確認
4. [Stability AI — SD-XL 1.0-base Model Card](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0) — 2026-10-07 確認
5. [ConoHa AI Canvas 料金](https://ai.conoha.jp/canvas/pricing/) — 2026-10-07 確認
6. [ConoHa AI Canvas サービス仕様](https://ai.conoha.jp/canvas/specification/) — 2026-10-07 確認
7. [ConoHa サポート — AI Canvas を契約する](https://support.conoha.jp/ac/add-aicanvas/) — 2026-10-07 確認
8. [ConoHa サポート — AI Canvas よくある質問（契約 / 料金）](https://support.conoha.jp/ai-canvas/faq/faq-contract/) — 2026-10-07 確認
9. [ConoHa サポート — AI Canvas よくある質問（WebUI）](https://support.conoha.jp/ai-canvas/faq/faq-webui/) — 2026-10-07 確認
10. [ConoHa サポート — AI Canvas よくある質問（AI Canvas について）](https://support.conoha.jp/ai-canvas/faq/faq-service/) — 2026-10-07 確認
11. [ConoHa サポート — WebUI を起動・終了する](https://support.conoha.jp/ac/webui-boot/) — 2026-10-07 確認
12. [ConoHa サポート — WebUI の自動終了時間を設定する](https://support.conoha.jp/ac/autotermination/) — 2026-10-07 確認
13. [ConoHa サポート — WebUI（ComfyUI）を使う](https://support.conoha.jp/ac/webui-comfyui/) — 2026-10-07 確認
14. [ThinkDiffusion Pricing](https://www.thinkdiffusion.com/pricing) — 2026-10-07 確認
15. [ThinkDiffusion Help Docs — File Management](https://docs.thinkdiffusion.com/thinkdiffusion-walkthrough/file-management) — 2026-10-07 確認
16. [ThinkDiffusion Help Docs — Admin & Billing](https://docs.thinkdiffusion.com/thinkdiffusion-walkthrough/admin-and-billing) — 2026-10-07 確認
17. [ThinkDiffusion Help Docs — How to view and test Automatic1111 API](https://docs.thinkdiffusion.com/ai-art-video-models-and-apps/automatic1111-in-the-cloud/how-to-view-and-test-automatic1111-api) — 2026-10-07 確認
18. [ThinkDiffusion Sign Up](https://www.thinkdiffusion.com/signup) — 2026-10-07 確認
19. [RunDiffusion Pricing](https://www.rundiffusion.com/pricing) — 2026-10-07 確認
20. [RunDiffusion FAQ](https://www.rundiffusion.com/faq) — 2026-10-07 確認
21. [RunDiffusion Open-Source Application API Guide](https://www.rundiffusion.com/open-source-application-api-guide) — 2026-10-07 確認
22. [RunDiffusion Getting Started](https://www.rundiffusion.com/getting-started) — 2026-10-07 確認
