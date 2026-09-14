---
description: 記事のネタ探しを 1 回ぶん回す（曜日ごとにレンズが変わる）
---

kurabebako の記事ネタ探しを 1 回ぶん実行する。**探すだけで、記事は書かない。**

## 手順

1. `$HOME/Code/kurabebako-desk/neta-method.md` を読む。これが手順の正典。
2. `date +"%Y-%m-%d %A"` で今日の曜日を出し、対応するレンズを 1 つだけ選ぶ。
   引数（`$ARGUMENTS`）でレンズ名が指定されていれば、曜日より優先する。
3. `$HOME/Code/kurabebako-desk/backlog.md` の `候補` 件数を数える。15 件を超えていたら
   発掘レンズを昇格レンズに差し替える。
4. `$HOME/Code/kurabebako-desk/neta-log.md` の直近 2 週間ぶんを読み、同じカテゴリを
   掘り直さないようにする。
5. `$HOME/Code/kurabebako-desk/reports/codex/kurabebako-neta-daily/` の直近 1 週間ぶんの
   `report.md` を読む。Codex が掘ったカテゴリは掘り直さず、候補を引き継ぐときは数字を
   公式ページで取り直してから点数を付け、備考に「Codex 報告 YYYY-MM-DD」と書く
   （neta-method.md の「Codex の報告を参考にする」）。
6. レンズを回す。裏取りは**公式の料金ページ・ドキュメントのみ**。WebSearch で当たりを付け、
   数字は WebFetch で公式ページから取る。まとめ記事・ブログ・SNS は出典にしない。
7. 4 軸（裏取り / 実行 / 収益 / 需要）で 0〜2 点ずつ付け、`backlog.md` を更新する。
   6 点以上は `調査中` に上げ、`research/<slug>/notes.md` を起こす。
8. `neta-log.md` の先頭に当日のエントリを足す。候補ゼロの日も
   「見た対象と、なぜ候補にならなかったか」を必ず書く。
9. desk リポジトリだけをコミットする（push はしない）。

## 触ってはいけないもの

- `content/posts/` — 記事執筆は別のレーン
- サイト本体リポジトリ（`kurabebako`）のファイル全般
- YMYL（医療・薬・健康・金融・保険・転職）に触れる対象は点数を付けずに却下する

## 出力

最後に 5 行以内で報告する。今日のレンズ、追加した候補、状態が変わった候補、次に書く 1 本。
