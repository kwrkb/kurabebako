#!/usr/bin/env node
//------------------------------------------------------------------------------
// 記事の型の検査（layouts/_partials/extend_post_content.html）の回帰テスト。
//
//   npm run test:checks
//
// 検査は Hugo のテンプレートの中にあり、単体では呼べない。そこで fixtures/valid.md を
// 1 か所ずつ壊した記事を content/posts/ に一時的に置き、サイトごとビルドして
// 「通る / この文言で止まる」を確かめる。contentDir を差し替えないのは、検査が
// content/ を決め打ちで読み直しており（front matter の検査と site_checks.html）、
// 本番と同じ経路を通さないと試したことにならないため。
//
// 一時ファイルは finally で消す。途中で強制終了して残っても、.gitignore に入れてあるので
// コミットにもデプロイにも混ざらない。出力は一時ディレクトリに向け、public/ には触れない。
//------------------------------------------------------------------------------
"use strict";

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const valid = fs.readFileSync(path.join(__dirname, "fixtures", "valid.md"), "utf8").replace(/\r/g, "");
const target = path.join(root, "content", "posts", "zz-fixture-post-checks.md");

// 置換が空振りすると「壊していない記事が通った」だけのテストになるので、必ず確かめる
function swap(src, from, to) {
  if (!src.includes(from)) {
    throw new Error(`フィクスチャに置換対象がありません: ${JSON.stringify(from)}`);
  }
  return src.replace(from, to);
}

const RUN = "{{< verified run >}}";
const SPEC = "{{< verified spec >}}";
const noBadge = (s) => swap(s, `| ${SPEC} |`, "| 仕様 |");
const noRun = (s) => swap(s, RUN, SPEC);
const noTable = (s) => s.split("\n").filter((line) => !line.startsWith("|")).join("\n");

const E_BADGE = "比較表の行に検証区分";
const E_RUN = "の対象が 1 つもありません";
const E_TABLE = "「比較表」節に表がありません";
const E_H2 = "H2 の構成が型と違います";
const E_SEG = "「比較表」節を切り出せません";

// expect: null = ビルドが通る / 配列 = ビルドが止まり、どの文言もログに出る
const cases = [
  { name: "正常な記事", make: (s) => s, expect: null },
  { name: "CRLF の正常な記事", make: (s) => s.replace(/\n/g, "\r\n"), expect: null },
  { name: "見出し末尾に半角スペース（正常な表）", make: (s) => swap(s, "## 比較表\n", "## 比較表 \n"), expect: null },
  { name: "見出し末尾にタブ（正常な表）", make: (s) => swap(s, "## 比較表\n", "## 比較表\t\n"), expect: null },
  { name: "「## 出典」の末尾に半角スペース", make: (s) => swap(s, "## 出典\n", "## 出典 \n"), expect: null },

  // ここから 2 つが今回の回帰。修正前は切り出しが空振りして、どちらも黙って通っていた
  // （末尾の「全角スペース」も同じ経路で通っていた）
  {
    name: "見出し末尾に半角スペース + 検証区分の無い行",
    make: (s) => noBadge(swap(s, "## 比較表\n", "## 比較表 \n")),
    expect: [E_BADGE],
  },
  {
    name: "見出し末尾にタブ + 実行区分なし",
    make: (s) => noRun(swap(s, "## 比較表\n", "## 比較表\t\n")),
    expect: [E_RUN],
  },
  {
    name: "「## 比較の前提」の末尾に半角スペース + 表なし",
    make: (s) => noTable(swap(s, "## 比較の前提\n", "## 比較の前提 \n")),
    expect: [E_TABLE],
  },

  { name: "検証区分の無い行", make: noBadge, expect: [E_BADGE] },
  { name: "実行区分が存在しない", make: noRun, expect: [E_RUN] },
  { name: "比較表が存在しない（節はある）", make: noTable, expect: [E_TABLE] },
  {
    name: "比較表が存在しない（節ごと無い）",
    make: (s) => swap(noTable(s), "## 比較表\n", ""),
    expect: [E_H2, E_SEG],
  },
  {
    name: "見出し末尾に全角スペース",
    make: (s) => swap(s, "## 比較表\n", "## 比較表　\n"),
    expect: [E_H2, E_SEG],
  },
];

function build(dest) {
  const r = spawnSync("hugo", ["--destination", dest, "--logLevel", "error"], {
    cwd: root,
    encoding: "utf8",
  });
  if (r.error) {
    throw r.error;
  }
  return { ok: r.status === 0, log: `${r.stdout}\n${r.stderr}` };
}

if (fs.existsSync(target)) {
  console.error(`前回の一時ファイルが残っています。消してから実行してください: ${target}`);
  process.exit(1);
}

const dest = fs.mkdtempSync(path.join(os.tmpdir(), "kurabebako-post-checks-"));
let failed = 0;
try {
  for (const c of cases) {
    fs.writeFileSync(target, c.make(valid));
    const { ok, log } = build(dest);
    let reason = "";
    if (c.expect === null) {
      if (!ok) reason = "通るはずのビルドが止まった";
    } else if (ok) {
      reason = "止まるはずのビルドが通った";
    } else {
      const missing = c.expect.filter((m) => !log.includes(m));
      if (missing.length) reason = `期待した文言がログに無い: ${missing.join(" / ")}`;
    }
    if (reason) {
      failed += 1;
      console.log(`FAIL  ${c.name} — ${reason}`);
      console.log(log.trim().split("\n").map((l) => `      ${l}`).join("\n"));
    } else {
      console.log(`ok    ${c.name}`);
    }
  }
} finally {
  fs.rmSync(target, { force: true });
  fs.rmSync(dest, { recursive: true, force: true });
}

console.log(`\n${cases.length - failed} / ${cases.length} passed`);
process.exit(failed ? 1 : 0);
