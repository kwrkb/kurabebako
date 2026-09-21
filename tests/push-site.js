#!/usr/bin/env node
//------------------------------------------------------------------------------
// main を本番へ push するときの入口。ゲートを全部通ったときだけ push し、デプロイの成否まで見る。
//
//   npm run push:site              ゲート → push → デプロイの確認
//   npm run push:site -- --dry-run ゲートだけ（push しない）
//
// AI とルーチンが自律で push してよいのは「公開を伴わないコミット」だけ（2026-09-21 に決めた段階 1）。
// 記事の公開（draft を倒す・draft でない記事を新しく置く）が未 push の範囲に入っていたら、ここで止まる。
// 型検査は構造しか見ておらず、数字が公式ページと合っているか・表示が崩れていないかは、
// まだ人の preview でしか確かめていないため。公開はユーザーが `git push origin main` で行う。
//
// `git push` を直接打たずにここを通す理由: ゲートの順番と「push 後にデプロイを確認する」を、
// 手順書ではなくコードで固定するため（push しても Workers Builds が失敗すれば本番は黙って古いまま）。
//------------------------------------------------------------------------------
"use strict";

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const desk = path.resolve(root, "..", "kurabebako-desk");
const dryRun = process.argv.includes("--dry-run");
const REPO = "kwrkb/kurabebako";

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { cwd: root, encoding: "utf8", shell: process.platform === "win32" && cmd === "npm", ...opts });
  if (r.error) throw r.error;
  return { code: r.status, out: (r.stdout || "").trim(), err: (r.stderr || "").trim() };
}

function git(...args) {
  const r = run("git", args);
  if (r.code !== 0) stop(`git ${args.join(" ")} が失敗しました:\n${r.err}`);
  return r.out;
}

function stop(message) {
  console.error(`\nNG  ${message}\npush していません。`);
  process.exit(1);
}

function step(name) {
  console.log(`\n== ${name}`);
}

// draft でない記事として本番に出る内容かどうか。ファイルが無ければ null
function isPublished(rev, file) {
  const r = run("git", ["show", `${rev}:${file}`]);
  if (r.code !== 0) return null;
  return !/^draft\s*=\s*true\s*$/m.test(r.out);
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

step("公開を伴うコミットが混ざっていないか");
const changed = git("diff", "--name-only", "origin/main", "HEAD", "--", "content/posts").split("\n").filter(Boolean);
const publishing = changed.filter((file) => {
  if (!file.endsWith(".md") || file.endsWith("_index.md")) return false;
  // 公開済みの記事の修正（前後とも公開）と、draft のままの記事は通す
  return isPublished("HEAD", file) === true && isPublished("origin/main", file) !== true;
});
if (publishing.length) {
  stop(`記事の公開が含まれています: ${publishing.join(", ")}\n公開はユーザーが preview を確認してから git push origin main で行います`);
}
console.log("ok  公開を伴う変更はありません");

step("型検査の回帰テスト");
if (run("node", ["tests/post-checks.js"], { stdio: "inherit" }).code !== 0) stop("回帰テストが落ちました");

step("本番共通ビルド");
if (run("node", ["build.js"], { stdio: "inherit" }).code !== 0) stop("ビルドが落ちました");
if (git("status", "--porcelain")) stop("テストかビルドが追跡中のファイルを書き換えました");

step("backlog とサイトの公開状態");
if (fs.existsSync(path.join(desk, "check-backlog.py"))) {
  const r = run("python", ["check-backlog.py"], { cwd: desk, stdio: "inherit" });
  if (r.code !== 0) stop("backlog とサイトの公開状態が食い違っています（desk の backlog.md を直す）");
} else {
  console.log("desk が見つからないので飛ばします");
}

if (dryRun) {
  console.log("\nok  ゲートは全部通りました（--dry-run なので push していません）");
  process.exit(0);
}

step("push");
const sha = git("rev-parse", "HEAD");
if (run("git", ["push", "origin", "main"], { stdio: "inherit" }).code !== 0) stop("git push が失敗しました");

step("デプロイの確認（Workers Builds の check-run）");
const deadline = Date.now() + 5 * 60 * 1000;
for (;;) {
  const r = run("gh", ["api", `repos/${REPO}/commits/${sha}/check-runs`, "--jq", '.check_runs[] | select(.app.slug == "cloudflare-workers-and-pages") | [.status, .conclusion, .details_url] | @tsv']);
  const [status, conclusion, url] = (r.out.split("\n")[0] || "").split("\t");
  if (status === "completed") {
    if (conclusion === "success") {
      console.log(`ok  デプロイ成功（${sha.slice(0, 7)}）`);
      process.exit(0);
    }
    console.error(`\nNG  push は済みましたが、デプロイが ${conclusion} でした。本番は古い版のままです。\nログ: ${url}\nビルドトークンの失効などリポジトリの外が原因のこともあるので、自動では revert しません。ログの確認をユーザーに頼んでください。`);
    process.exit(2);
  }
  if (Date.now() > deadline) {
    console.error(`\nNG  push は済みましたが、5 分待っても check-run が完了しません（${status || "check-run なし"}）。gh で ${sha.slice(0, 7)} を見てください。`);
    process.exit(2);
  }
  spawnSync(process.execPath, ["-e", "setTimeout(()=>{}, 15000)"]);
}
