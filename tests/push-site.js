#!/usr/bin/env node
//------------------------------------------------------------------------------
// main を本番へ push するときの入口。ゲートを全部通ったときだけ push し、デプロイの成否まで見る。
//
//   npm run push:site                                 ゲート → push → デプロイの確認（段階 1）
//   npm run push:site -- --dry-run                    ゲートだけ（push しない）
//   npm run push:site -- --prepare-publish <slug>     段階 2 の前半。公開の条件を検査し、記事を撮影して止まる（終了 3）
//   npm run push:site -- --publish <slug> [--dry-run] 段階 2 の後半。画像の確認記録まで揃っていれば push する
//
// 段階 1（2026-09-21）: AI とルーチンが自律で push してよいのは「公開を伴わないコミット」だけ。
// 記事の公開（draft を倒す・draft でない記事を新しく置く）が未 push の範囲に入っていたら止まる。
// 型検査は構造しか見ておらず、数字が公式ページと合っているか・表示が崩れていないかは、人の preview でしか
// 確かめていなかったため。
//
// 段階 2（2026-10-28）: その 2 点を機械と AI の検査に置き換えたうえで、比較記事 1 本の公開を routine に任せる。
// 環境変数 KURABEBAKO_PUBLISH_STAGE=2 と --prepare-publish / --publish <slug> の両方を要求する（片方だけでは段階 1 のまま）。
// 公開してよい条件は checkPublication() にまとめてある。要点は
//   - 公開するのは content/posts/<slug>.md の 1 本だけで、公開のコミット（HEAD）に既存記事からの内部リンクと
//     新しいタグの _index.md を同梱する。未 push の範囲に無関係な変更（layouts / CSS / 設定 / tests）を混ぜない
//   - desk の research/<slug>/precheck-<今日>.md に、出典を取り直して全セルを照合した結果（```precheck ブロック）がある
//   - desk の research/<slug>/visual-<今日>.md に、撮影した画像を全部読んで判定した結果（```visual ブロック）がある。
//     撮影は --prepare-publish が tests/layout-check.js --shots で行い、公開時のビルドと同じ HTML であることをハッシュで確かめる
// 書式は desk の routines/kurabebako-publish-weekly.md。段階 1 に戻すには環境変数を外すだけでよい。
//
// ゲート: 作業ツリー → 公開の有無（と公開の条件） → 表示・ビルドに効く変更の有無（段階 1 では止める。2026-11-09） →
//         ゲートの判定関数の単体テスト → 型検査の回帰テスト → 本番共通ビルド → 内部リンク切れ →
//         表示の崩れ（公開の前半はここで撮影） → backlog の突き合わせ → push → Workers Builds の check-run → 本番の応答。
//
// `git push` を直接打たずにここを通す理由: ゲートの順番と「push 後にデプロイを確認する」を、
// 手順書ではなくコードで固定するため（push しても Workers Builds が失敗すれば本番は黙って古いまま）。
//------------------------------------------------------------------------------
"use strict";

const { spawnSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const desk = path.resolve(root, "..", "kurabebako-desk");
const REPO = "kwrkb/kurabebako";
const SITE = "https://kurabebako.com";
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function stop(message) {
  console.error(`\nNG  ${message}\npush していません。`);
  process.exit(1);
}

// 引数。--dry-run / --prepare-publish <slug> / --publish <slug> 以外は受け付けない
const argv = process.argv.slice(2);
let dryRun = false;
let prepareSlug = null;
let publishSlug = null;
while (argv.length) {
  const a = argv.shift();
  if (a === "--dry-run") dryRun = true;
  else if (a === "--prepare-publish" || a === "--publish") {
    const slug = argv.shift();
    if (!SLUG.test(slug || "")) stop(`${a} には記事の slug（英小文字・数字・ハイフン）を続けてください`);
    if (a === "--prepare-publish") prepareSlug = slug;
    else publishSlug = slug;
  } else stop(`知らない引数です: ${a}`);
}
if (prepareSlug && publishSlug) stop("--prepare-publish と --publish は同時に指定できません");
if (prepareSlug && dryRun) stop("--prepare-publish はもともと push しないので --dry-run は要りません");
const target = prepareSlug || publishSlug;
const stage = process.env.KURABEBAKO_PUBLISH_STAGE || "1";
if (!["1", "2"].includes(stage)) stop(`KURABEBAKO_PUBLISH_STAGE の値が不正です: ${stage}（1 か 2）`);
if (target && stage !== "2") stop("記事の自律公開は KURABEBAKO_PUBLISH_STAGE=2 のときだけ使えます（いまは段階 1）");
// 「今日」は日本時間。出典の確認日・lastmod・precheck の日付をこれと突き合わせる
const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());

// 外部プロセスには必ず期限を置く（既定 60 秒。ビルドやテストは呼び出し側が延ばす）。期限が無いと、git / gh / Hugo /
// ブラウザのどれか 1 つが応答しないだけで routine が無言で止まり、push 済みかどうかを人が調べることになっていた
// （2026-11-09 の監査 ERR-01、前回 F04）。期限切れは例外にせず timedOut で返し、呼び出し側が「push の前か後か」に応じた文言で止める
function run(cmd, args, opts = {}) {
  const { timeout = 60_000, ...rest } = opts;
  const r = spawnSync(cmd, args, { cwd: root, encoding: "utf8", timeout, shell: process.platform === "win32" && cmd === "npm", ...rest });
  if (r.error && r.error.code === "ETIMEDOUT") return { code: null, out: (r.stdout || "").trim(), err: (r.stderr || "").trim(), timedOut: true, timeout };
  if (r.error) throw r.error;
  return { code: r.status, out: (r.stdout || "").trim(), err: (r.stderr || "").trim(), timedOut: false };
}

// 期限切れの文言。stop() は「push していません」と続けるので、push の後では使わない
const timedOutMessage = (r, cmd, args) => `${cmd} ${args.join(" ")} が ${r.timeout / 1000} 秒以内に終わりません（ハングか通信の停止）`;

function git(...args) {
  const r = run("git", args, { timeout: 120_000 });
  if (r.timedOut) stop(timedOutMessage(r, "git", args));
  if (r.code !== 0) stop(`git ${args.join(" ")} が失敗しました:\n${r.err}`);
  return r.out;
}

// 長い処理（テスト・ビルド・表示の検査）は出力をそのまま流し、終了コードだけ見る
function runLong(label, cmd, args, timeout, opts = {}) {
  const r = run(cmd, args, { stdio: "inherit", timeout, ...opts });
  if (r.timedOut) stop(`${label}が ${timeout / 1000} 秒以内に終わりません（ハングか通信の停止）`);
  return r.code;
}

// git show の生のバイト列（ハッシュを取るときは改行を触らない）
function gitBytes(rev, file) {
  const r = spawnSync("git", ["show", `${rev}:${file}`], { cwd: root });
  return r.status === 0 ? r.stdout : null;
}

function step(name) {
  console.log(`\n== ${name}`);
}

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

// 判定の純粋関数は tests/gate-lib.js（tests/gate-checks.js で公開ゼロのまま試す）。ここは Git / fs に触る側だけ
const { frontMatter, isPublishedText, parseBlock, parseAffiliates, isDisplayPath, diffBodyLines, manifestError, brokenInternalRefs } = require("./gate-lib.js");

// draft でない記事として本番に出る内容かどうか（front matter の draft だけを見る）。ファイルが無ければ null
function isPublished(rev, file) {
  const r = run("git", ["show", `${rev}:${file}`]);
  if (r.code !== 0) return null;
  return isPublishedText(r.out);
}

// desk の記録ファイルから ```<名前> の fenced block を 1 つだけ読み、key: value の表にする（`#` 以降は注釈）
function readBlock(file, name) {
  if (!fs.existsSync(file)) stop(`${path.relative(desk, file)} がありません（desk の research/<slug>/ に今日の日付で置く）`);
  const r = parseBlock(fs.readFileSync(file, "utf8"), name, path.relative(desk, file));
  if (r.error) stop(r.error);
  return r.data;
}

// data/affiliates.toml の id / name / paused だけ読む
function affiliates() {
  return parseAffiliates(fs.readFileSync(path.join(root, "data", "affiliates.toml"), "utf8"));
}

const norm = (s) => s.replace(/[（(][^）)]*[）)]/g, "").replace(/\s+/g, "").toLowerCase();

//------------------------------------------------------------------------------
// 段階 2: 公開の条件。通らなければ stop する。戻り値は撮影する記事（公開する記事とリンクを足した既存記事）
//------------------------------------------------------------------------------
function checkPublication(slug, publishing, changedAll) {
  const file = `content/posts/${slug}.md`;
  if (publishing.length !== 1 || publishing[0] !== file) stop(`公開できるのは 1 回に比較記事 1 本（${file}）だけです。未 push の範囲で公開になるのは: ${publishing.join(", ")}`);
  if (isPublished("HEAD~1", file) === true) stop(`${file} の公開（draft を倒す）は未 push の最後のコミット（HEAD）で行ってください。前のコミットで既に公開になっています`);

  // 未 push の範囲に、公開と関係ない変更を混ぜない。図と OGP は前のコミットにあってもよい
  const allowed = (f) =>
    f === file ||
    (f.startsWith("content/posts/") && f.endsWith(".md") && !f.endsWith("_index.md")) ||
    /^content\/(tags|categories)\/[a-z0-9-]+\/_index\.md$/.test(f) ||
    f === `assets/figures/${slug}-flow.svg` ||
    f === `static/images/og/${slug}.jpg`;
  const unrelated = changedAll.filter((f) => !allowed(f));
  if (unrelated.length) stop(`公開の push に無関係な変更が混ざっています（別に push:site で出してから）:\n  ${unrelated.join("\n  ")}`);

  // 公開のコミット（HEAD）の中身。記事本体・既存記事へのリンク追加・新しい term の _index.md だけ
  const headFiles = git("diff", "--name-only", "HEAD~1", "HEAD").split("\n").filter(Boolean);
  const others = headFiles.filter((f) => f !== file && f.startsWith("content/posts/"));
  if (!others.length) stop("公開のコミットに、既存の公開記事から新しい記事への内部リンクの追加がありません（CLAUDE.md「記事の型」）");
  let backlinks = 0;
  for (const other of others) {
    if (isPublished("origin/main", other) !== true) stop(`${other} は公開済みの記事ではないので、ここからのリンクは内部リンクの要件を満たしません`);
    // 本文の行だけを数える（ヘッダーの除き方は gate-lib の diffBodyLines。箇条書きの行を落とさない。監査 BUG-01）
    const diff = diffBodyLines(git("diff", "--unified=0", "HEAD~1", "HEAD", "--", other));
    if (diff.length > 4) stop(`${other} の変更が内部リンクの追加にしては大きい（${diff.length} 行）。公開のコミットにはリンクの 1〜2 行だけを入れてください`);
    if (diff.some((l) => l.startsWith("+") && l.includes(`/posts/${slug}/`))) backlinks++;
    else stop(`${other} の変更に /posts/${slug}/ へのリンクが含まれていません`);
  }
  const text = fs.readFileSync(path.join(root, file), "utf8");
  const fm = frontMatter(text);
  if (!fm) stop(`${file} の front matter が読めません`);
  const terms = [...(fm.tags || []), ...(fm.categories || [])];
  for (const f of changedAll.filter((x) => /^content\/(tags|categories)\/[a-z0-9-]+\/_index\.md$/.test(x))) {
    const term = f.split("/")[2];
    if (!terms.includes(term)) stop(`${f} はこの記事のタグ・カテゴリではありません`);
    if (gitBytes("origin/main", f) === null && !headFiles.includes(f)) stop(`${f} は新しいタグなので、draft のコミットではなく公開のコミットに入れてください（LESSONS 2026-10-07）`);
    if (!/^title\s*=\s*['"].+['"]/m.test(fs.readFileSync(path.join(root, f), "utf8"))) stop(`${f} に title がありません`);
  }

  // 日付。date は今より前、lastmod は今日（= 出典を取り直した日）
  const date = new Date(fm.date);
  if (Number.isNaN(date.getTime()) || date.getTime() > Date.now()) stop(`${file} の date（${fm.date}）が未来か読めません`);
  if (fm.lastmod !== today) stop(`${file} の lastmod（${fm.lastmod}）が今日（${today}）ではありません。出典を取り直した日に揃えてください`);

  // precheck: 出典を取り直して全セルを照合した記録（desk）
  if (!fs.existsSync(desk)) stop("desk（../kurabebako-desk）が無いので公開の記録を確かめられません");
  const pre = readBlock(path.join(desk, "research", slug, `precheck-${today}.md`), "precheck");
  const sourceCount = (text.split(/^## 出典\s*$/m)[1] || "").split("\n").filter((l) => /^\d+\.\s+\[/.test(l)).length;
  const expect = { slug, date: today, result: "match", unavailable: "0", unresolved: "0", sources: String(sourceCount), fetched: String(sourceCount) };
  for (const [k, v] of Object.entries(expect)) {
    if (pre[k] !== v) stop(`precheck の ${k} が「${pre[k] ?? "（無し）"}」です。期待は「${v}」（${k === "sources" || k === "fetched" ? "記事の出典節の行数" : "今日の全件一致"}）`);
  }
  const articleSha = sha256(gitBytes("HEAD", file));
  if (pre.article_sha256 !== articleSha) stop(`precheck の article_sha256（${(pre.article_sha256 || "（無し）").slice(0, 12)}…）が HEAD の ${file}（${articleSha.slice(0, 12)}…）と違います。照合の後に記事を直したなら取り直してください`);

  // 提携: precheck に列挙した案件が記事に置かれていること。台帳の案件名が「各対象の詳細」の見出しに当たるのに
  // 置いていないときは、precheck の affiliates_skip に理由つきで書いてあることを要求する
  const table = affiliates();
  const listed = (pre.affiliates || "").split(",").map((s) => s.trim()).filter((s) => s && s !== "none");
  // affiliates_skip は「id（理由）, id（理由）」。id は英小文字・数字・ハイフンの先頭部分
  const skipped = (pre.affiliates_skip || "").split(",").map((s) => (s.trim().match(/^[a-z0-9-]+/) || [""])[0]).filter(Boolean);
  const placed = (id) => text.includes(`{{< cta "${id}" >}}`) || new RegExp(`^\\s*${id}:`, "m").test(text);
  for (const id of listed) {
    if (!table[id]) stop(`precheck の affiliates にある ${id} は data/affiliates.toml にありません`);
    if (!placed(id)) stop(`precheck の affiliates にある ${id} の cta / ranking が記事にありません`);
  }
  const headings = (text.split(/^## 各対象の詳細\s*$/m)[1] || "").split(/^## /m)[0].split("\n").filter((l) => l.startsWith("### ")).map((l) => norm(l.slice(4)));
  for (const a of Object.values(table)) {
    if (a.paused || !a.name || listed.includes(a.id) || skipped.includes(a.id)) continue;
    const n = norm(a.name);
    if (headings.some((h) => h.startsWith(n) || n.startsWith(h))) stop(`台帳の案件 ${a.id}（${a.name}）がこの記事の対象に当たるのに cta がありません。使わないなら precheck の affiliates_skip に理由つきで書いてください`);
  }
  console.log(`ok  公開の条件を満たしています: ${file}（内部リンク ${backlinks} 本、案件 ${listed.length} 件）`);
  return [slug, ...others.map((o) => path.basename(o, ".md"))];
}

// 公開の後半: 撮影した画像を全部読んだ記録（desk）と、撮影した HTML が今回のビルドと同じであること
function checkVisual(slug, shots) {
  const vis = readBlock(path.join(desk, "research", slug, `visual-${today}.md`), "visual");
  if (vis.slug !== slug || vis.date !== today) stop(`visual の slug / date が ${slug} / ${today} ではありません`);
  if (vis.result !== "pass") stop(`visual の result が「${vis.result ?? "（無し）"}」です。pass になるまで公開しません`);
  const manifests = Object.fromEntries((vis.manifests || "").split(",").map((s) => s.trim().split("=")).filter((p) => p.length === 2));
  let images = 0;
  for (const s of shots) {
    const mf = path.join(root, ".cache", "layout-shots", s, "manifest.json");
    if (!fs.existsSync(mf)) stop(`${s} の撮影結果（.cache/layout-shots/${s}/manifest.json）がありません。--prepare-publish からやり直してください`);
    // 壊れた manifest（撮影の途中で落ちた・手で直した）は例外ではなく理由を言って止める。PNG の実在とハッシュも照合する
    // （画像を差し替えて「読んだ」と記録する経路を閉じる。2026-11-09 の監査 ERR-03、前回 C03）
    let m;
    try { m = JSON.parse(fs.readFileSync(mf, "utf8")); } catch (e) { stop(`${s} の manifest.json が JSON として読めません（${e.message}）。--prepare-publish からやり直してください`); }
    const bad = manifestError(m);
    if (bad) stop(`${s} の manifest.json が壊れています: ${bad}。--prepare-publish からやり直してください`);
    if (manifests[s] !== sha256(fs.readFileSync(mf))) stop(`visual の manifests に ${s} の今の manifest のハッシュ（${sha256(fs.readFileSync(mf)).slice(0, 12)}…）がありません`);
    for (const img of m.images) {
      const png = path.join(path.dirname(mf), img.file);
      if (!fs.existsSync(png) || sha256(fs.readFileSync(png)) !== img.sha256) stop(`${s} の撮影画像 ${img.file} が無いか、manifest のハッシュと違います。--prepare-publish からやり直してください`);
    }
    const html = path.join(root, "public", "posts", s, "index.html");
    if (!fs.existsSync(html) || sha256(fs.readFileSync(html)) !== m.htmlSha256) stop(`${s} の撮影した HTML と今回ビルドした HTML が違います。記事か生成に変更があったので --prepare-publish からやり直してください`);
    images += m.images.length;
  }
  if (vis.images !== String(images) || vis.read !== String(images)) stop(`visual の images / read（${vis.images} / ${vis.read}）が撮影した枚数（${images}）と一致しません。全部読んでから記録してください`);
  console.log(`ok  画像の確認記録があります（${shots.join(", ")}、${images} 枚）`);
}

//------------------------------------------------------------------------------
step("前提のツール");
// 後半で初めて要る python（desk の check-backlog.py）と gh（デプロイの確認）、ビルドの Hugo の版を最初に確かめる。
// 以前は無ければゲートの終盤か push の後で初めて気づいた（2026-11-09 の監査 CI-02、前回 F21）。
// Windows の `python` は Microsoft Store のスタブに解決されることがあり、引数つきで呼ぶと終了コード 9009 で戻る
const hugoVersion = (fs.readFileSync(path.join(root, "build.sh"), "utf8").match(/^HUGO_VERSION=(\S+)/m) || [])[1];
if (!hugoVersion) stop("build.sh の HUGO_VERSION が読めません");
let hugo;
try { hugo = run("hugo", ["version"]); } catch (e) { stop(`hugo が見つかりません（${e.message}）。README の導入手順で build.sh と同じ版（${hugoVersion} extended）を入れてください`); }
if (hugo.timedOut || hugo.code !== 0 || !hugo.out.includes(`v${hugoVersion}`) || !hugo.out.includes("+extended")) {
  stop(`ローカルの Hugo が build.sh の版（${hugoVersion} extended）と違います: ${hugo.out || hugo.err || "（応答なし）"}`);
}
console.log(`ok  Hugo ${hugoVersion} (extended)`);
if (fs.existsSync(path.join(desk, "check-backlog.py"))) {
  let py;
  try { py = run("python", ["-c", "print(1)"], { timeout: 20_000 }); } catch (e) { py = { code: null, out: "", err: e.message }; }
  if (py.timedOut || py.code !== 0 || py.out !== "1") stop(`python が動きません（desk の check-backlog.py に要る）: ${(py.err || py.out || "").split("\n")[0] || "（応答なし）"}。Windows では Microsoft Store のスタブでなく uv か winget の Python を PATH に`);
  console.log("ok  python");
}
if (!dryRun && !prepareSlug) {
  let gh;
  try { gh = run("gh", ["auth", "status"]); } catch (e) { stop(`gh が見つかりません（${e.message}）。push 後のデプロイの確認に要るので入れてください`); }
  if (gh.timedOut || gh.code !== 0) stop(`gh の認証が無いか期限切れです（push 後のデプロイの確認に要る）: ${(gh.err || gh.out).split("\n")[0]}`);
  console.log("ok  gh の認証");
}

step("作業ツリーとブランチ");
if (git("rev-parse", "--abbrev-ref", "HEAD") !== "main") stop("main ブランチではありません");
if (git("status", "--porcelain")) stop("未コミットの変更があります（ビルドに混ざるので、commit するか退避してから）");
git("fetch", "--quiet", "origin", "main");
if (git("rev-list", "--count", "HEAD..origin/main") !== "0") stop("origin/main が先に進んでいます。git pull --rebase origin main を先に");
const commits = git("log", "--oneline", "origin/main..HEAD");
if (!commits) {
  console.log("未 push のコミットはありません。");
  process.exit(0);
}
console.log(commits);
const head = git("rev-parse", "HEAD");

step("公開を伴うコミットが混ざっていないか");
const changedAll = git("diff", "--name-only", "origin/main", "HEAD").split("\n").filter(Boolean);
// Hugo がページとして読む拡張子（Markdown の別名・HTML・Org・AsciiDoc・reStructuredText・Pandoc）。.md だけを見ると、
// 同じ内容を .html や .org で置いた記事がどちらの検出からも外れる
const CONTENT_EXT = /\.(md|markdown|mdown|mkd|mkdn|html|htm|org|adoc|asciidoc|ad|rst|pdc|pandoc)$/;
const isIndex = (f) => /\/_index\.[a-z]+$/.test(f);
const publishing = changedAll.filter((file) => {
  if (!/^content\/(posts|examples)\//.test(file) || !CONTENT_EXT.test(file) || isIndex(file)) return false;
  // 公開済みの記事の修正（前後とも公開）と、draft のままの記事は通す
  return isPublished("HEAD", file) === true && isPublished("origin/main", file) !== true;
});
// posts / examples 以外のページ（content/ 直下の固定ページ・新しいセクション）の公開も数える。条件は上と同じ
// 「HEAD で公開、origin/main では無いか draft」（新設だけでなく draft を倒す公開も含む）。既存の公開ページの修正と、
// タクソノミ（tags / categories）の _index は通す（表示名を与えるだけのページで、段階 2 の公開コミットに同梱する）。
// それ以外の _index（新しいセクションの一覧ページ）は他のページと同じ条件で見る。既存の公開ページの修正は
// 「前後とも公開」なので条件に当たらず通る。
// 以前は posts / examples だけを見ていたので、固定ページの新設は段階 1 で機械に止まらなかった（2026-11-09 の監査 BUG-04）
const exemptIndex = (f) => isIndex(f) && /^content\/(tags|categories)\//.test(f);
const newPages = changedAll.filter((f) => /^content\//.test(f) && CONTENT_EXT.test(f) && !/^content\/(posts|examples)\//.test(f) && !exemptIndex(f) && isPublished("HEAD", f) === true && isPublished("origin/main", f) !== true);
if (newPages.length) stop(`新しいページの公開が含まれています: ${newPages.join(", ")}\n固定ページの新設はユーザーが preview を確認してから git push origin main で行います`);
let shots = [];
if (publishing.length && !target) {
  stop(`記事の公開が含まれています: ${publishing.join(", ")}\n公開はユーザーが preview を確認してから git push origin main で行います（段階 2 の routine は --prepare-publish / --publish <slug> を使う）`);
} else if (!publishing.length && target) {
  stop(`${target} の公開（draft を倒す）がこの push 範囲にありません`);
} else if (publishing.length) {
  shots = checkPublication(target, publishing, changedAll);
} else {
  console.log("ok  公開を伴う変更はありません");
}

step("表示・ビルドに効く変更が混ざっていないか");
// 段階 1 で AI が自律で push してよいのは「公開を伴わず、表示にも効かない変更」だけ（CLAUDE.md「ブランチ運用」）だが、
// 2026-11-06 の監査（F11）まではパスの制限が段階 2 の checkPublication にしかなく、CSS だけの変更でも
// 回帰テストと横はみ出しの検査が通れば push へ進んでいた。レイアウト・CSS・テーマ・ビルド経路の変更は
// ユーザーが preview を見てから git push origin main で出す。--dry-run はその前の検査に使うので、警告にして続ける
const display = changedAll.filter(isDisplayPath);
if (display.length && !target) {
  const list = display.map((f) => `  ${f}`).join("\n");
  if (dryRun) console.log(`warn 表示・ビルドに効く変更が未 push にあります（--dry-run なので検査は続けます。push はユーザーが preview を見てから git push origin main で）:\n${list}`);
  else stop(`表示・ビルドに効く変更が未 push にあります。npm run push:site -- --dry-run でゲートを通した後、ユーザーが preview を見て git push origin main で出してください:\n${list}`);
} else {
  console.log("ok  表示・ビルドに効く変更はありません");
}

step("ゲートの判定関数の単体テスト");
if (runLong("ゲートの単体テスト", "node", ["--test", "tests/gate-checks.js"], 120_000) !== 0) stop("ゲートの単体テストが落ちました");

step("型検査の回帰テスト");
if (runLong("回帰テスト", "node", ["tests/post-checks.js"], 15 * 60_000) !== 0) stop("回帰テストが落ちました");

step("本番共通ビルド");
if (runLong("ビルド", "node", ["build.js"], 10 * 60_000) !== 0) stop("ビルドが落ちました");
if (git("status", "--porcelain")) stop("テストかビルドが追跡中のファイルを書き換えました");
const pub = path.join(root, "public");
if (target) {
  // 公開する記事が本番の生成物に入っていること（未来日付や expiryDate で黙って落ちていない）
  if (!fs.existsSync(path.join(pub, "posts", target, "index.html"))) stop(`${target} が本番ビルドの出力にありません（date / expiryDate を確認）`);
  if (!fs.readFileSync(path.join(pub, "sitemap.xml"), "utf8").includes(`${SITE}/posts/${target}/`)) stop(`${target} が sitemap.xml にありません`);
  console.log(`ok  ${target} は本番ビルドの出力と sitemap に入っています`);
}

step("内部リンク切れ");
// 未 push のコミットは全部まとめて出る。write-weekly が既存記事から draft の記事へ張った内部リンクが
// 別の push に相乗りすると、本番にリンク切れが出る（draft は本番ビルドに入らない）。生成物で確かめる。
// 見るのは a / link の href と img / script / source の src のうち同一 origin のもので、<link> はテーマが決め打ちで出す
// favicon 類（実物は static/ の直下。desk の images/draw-favicon.py で描く）と CSS・RSS・canonical。テーマ更新で参照先の
// 名前が変わると全ページで 404 になるが、ビルドは通ってしまうので、ここで止める。
// フラグメント（早見表・比較表の #id）も飛び先の id を確かめる。判定は gate-lib の brokenInternalRefs（単体テストあり）
const { pages: builtPages, files: builtFiles } = require("./link-check.js").collect(pub);
const broken = brokenInternalRefs(builtPages, builtFiles, SITE);
if (broken.length) {
  const list = broken.slice(0, 20).map((b) => `  ${b}`).join("\n");
  stop(`内部参照の先がありません（draft の記事へのリンク・無い id へのアンカーが混ざっていないか）:\n${list}`);
}
console.log(`ok  生成物の同一 origin の内部参照（a / link / img / script / source。#id を含む）は ${Object.keys(builtPages).length} ページとも揃っています`);

step("表示の崩れ（主要な幅での横はみ出し）");
const layoutArgs = ["tests/layout-check.js", "public"];
if (prepareSlug) for (const s of shots) layoutArgs.push("--shots", s);
if (runLong("表示の検査", "node", layoutArgs, 15 * 60_000) !== 0) stop("横にはみ出しているページがあるか、ブラウザで検査できませんでした");
if (publishSlug) checkVisual(publishSlug, shots);

step("backlog とサイトの公開状態");
if (fs.existsSync(path.join(desk, "check-backlog.py"))) {
  if (runLong("check-backlog.py", "python", ["check-backlog.py"], 2 * 60_000, { cwd: desk }) !== 0) stop("backlog とサイトの公開状態が食い違っています（desk の backlog.md を直す）");
} else if (target) {
  stop("公開には desk の check-backlog.py が要ります");
} else {
  console.log("desk が見つからないので飛ばします");
}

if (prepareSlug) {
  console.log(`\nok  公開の条件は揃っています。撮影した画像を全部読んで、desk の research/${prepareSlug}/visual-${today}.md を書いてから\n    npm run push:site -- --publish ${prepareSlug} --dry-run → --publish ${prepareSlug} の順に実行してください（push はしていません）。\n    撮影: ${shots.map((s) => `.cache/layout-shots/${s}/`).join(" ")}`);
  process.exit(3);
}
if (dryRun) {
  console.log("\nok  ゲートは全部通りました（--dry-run なので push していません）");
  process.exit(0);
}

step("push");
if (git("rev-parse", "HEAD") !== head) stop("ゲートの途中で HEAD が変わりました。最初からやり直してください");
// 検査した SHA をそのまま送る（途中で main が進んでいても、検査していないものを送らない）。
// KURABEBAKO_PUSH_SITE は tests/hooks/pre-push への合図（ゲートを通った push なので、フックの検査を重ねて回さない）
const pushed = run("git", ["push", "origin", `${head}:refs/heads/main`], { stdio: "inherit", timeout: 5 * 60_000, env: { ...process.env, KURABEBAKO_PUSH_SITE: "1" } });
if (pushed.timedOut || pushed.code !== 0) {
  const probe = run("git", ["ls-remote", "origin", "refs/heads/main"], { timeout: 60_000 });
  const remote = probe.timedOut ? "" : probe.out.split("\t")[0];
  if (remote === head) console.error(`\ngit push は${pushed.timedOut ? "期限切れになり" : "エラーを返し"}ましたが、origin/main は検査した SHA になっています。デプロイの確認に進みます。`);
  else {
    console.error(`\nNG  git push が${pushed.timedOut ? "期限内に終わりませんでした" : "失敗しました"}（origin/main は ${remote ? remote.slice(0, 7) : "不明"}）。push できていません。`);
    process.exit(1);
  }
}

step("デプロイの確認（Workers Builds の check-run）");
// 同じ SHA に複数の check-run が付くことがある（再実行、Worker が増えたとき）。Cloudflare のもののうち id が最大の 1 つを見る
const sleep = (ms) => spawnSync(process.execPath, ["-e", `setTimeout(()=>{}, ${ms})`]);
const deadline = Date.now() + 5 * 60 * 1000;
let lastStatus = "check-run なし";
for (;;) {
  const r = run("gh", ["api", `repos/${REPO}/commits/${head}/check-runs?per_page=100`, "--jq", '[.check_runs[] | select(.app.slug == "cloudflare-workers-and-pages")] | sort_by(.id) | last | select(. != null) | [.name, .status, .conclusion, .details_url] | @tsv'], { timeout: 60_000 });
  if (r.timedOut) {
    lastStatus = "gh api が 60 秒で応答しない";
  } else if (r.code !== 0) {
    lastStatus = `gh が失敗: ${r.err.split("\n")[0]}`;
  } else if (r.out) {
    const [name, status, conclusion, url] = r.out.split("\t");
    lastStatus = `${name}: ${status}`;
    if (status === "completed") {
      if (conclusion !== "success") {
        console.error(`\nNG  push は済みましたが、${name} が ${conclusion} でした。本番は古い版のままの可能性があります。\nログ: ${url}\nビルドトークンの失効などリポジトリの外が原因のこともあるので、自動では revert しません。ログの確認をユーザーに頼んでください。`);
        process.exit(2);
      }
      console.log(`ok  デプロイ成功（${head.slice(0, 7)}、${name}）`);
      break;
    }
  }
  if (Date.now() > deadline) {
    console.error(`\nNG  push は済みましたが、5 分待っても check-run が完了しません（${lastStatus}）。本番に反映されたかは確認できていません。gh で ${head.slice(0, 7)} を見てください。`);
    process.exit(2);
  }
  sleep(15000);
}

step("本番の応答");
// デプロイ成功のあと、本番が実際に新しい内容を返すか。公開した記事はそのページと sitemap、それ以外はトップだけ
(async () => {
  const urls = target ? [`${SITE}/posts/${target}/`, `${SITE}/sitemap.xml`] : [`${SITE}/`];
  const until = Date.now() + 2 * 60 * 1000;
  for (const url of urls) {
    for (;;) {
      let ok = false;
      let detail = "";
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { "cache-control": "no-cache" } });
        const body = await res.text();
        ok = res.status === 200 && (!url.endsWith("sitemap.xml") || body.includes(`${SITE}/posts/${target}/`));
        detail = `HTTP ${res.status}`;
      } catch (e) {
        detail = e.message;
      }
      if (ok) { console.log(`ok  ${url}（${detail}）`); break; }
      if (Date.now() > until) {
        console.error(`\nNG  push とデプロイは済みましたが、${url} が期待どおりに応答しません（${detail}）。本番を確認してください。`);
        process.exit(2);
      }
      sleep(10000);
    }
  }
  process.exit(0);
})();
