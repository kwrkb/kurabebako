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
// セクションごとの正常なフィクスチャと一時ファイルの置き場。作例（content/examples/）は比較記事と別の型で、
// 検査も別（layouts/_partials/example_checks.html）なので、ケースに section を書いて切り替える
const fixtures = {
  posts: fs.readFileSync(path.join(__dirname, "fixtures", "valid.md"), "utf8").replace(/\r/g, ""),
  examples: fs.readFileSync(path.join(__dirname, "fixtures", "valid-example.md"), "utf8").replace(/\r/g, ""),
};
const targets = {
  posts: path.join(root, "content", "posts", "zz-fixture-post-checks.md"),
  examples: path.join(root, "content", "examples", "zz-fixture-post-checks.md"),
};

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
const E_VOICE = "体験や主観を示す表現があります";
const E_YMYL = "扱わない領域（YMYL）の語があります";
const E_FAQ_POS = "「## よくある質問」は「## 用途別の選び方」と「## 出典」の間にだけ置けます";
const E_FAQ_Q = "「？」で終わる質問文にしてください";
const E_FIT_KIND = "fit: 第 1 引数は run か spec のみ";
const E_FIT_ROWS = "fit には「向く:」と「向かない:」の 2 行が要ります";
const E_QUICK_LINK = "結論の早見表の「対象」セルは詳細の見出しへのアンカーリンク";
const E_QUICK_COLS = "結論の早見表の列が型と違います";

// 作例の検査（example_checks.html）の文言
const E_EX_H2 = "H2 の構成が作例の型と違います";
const E_EX_LEAD = "冒頭に定型の 1 段落がありません";
const E_EX_REPO = "成果物のリポジトリ";
const E_EX_AI = "5 節目の見出し";
const E_EX_MODEL = "モデルの版が書かれています";
const E_EX_SRC = "出典の行末は";
const ex = (c) => ({ section: "examples", ...c });

// 結論の早見表。valid.md には入れず、「## 比較表」の直前に差し込む
const quick = (target) => `| こういう条件なら | 対象 | 決め手 |\n| --- | --- | --- |\n| 無料で試したい | ${target} | 「無料枠」列 |\n\n`;

// 任意の「よくある質問」節と要点カード（fit）。valid.md には入れず、ここで差し込む
const FAQ = "## よくある質問\n\n### 無料で使えますか？\n\nサンプル A は無料です。\n\n";
const fit = (kind, body) => `{{< fit ${kind} >}}\n${body}\n{{< /fit >}}\n\n`;
const FIT_BODY = "向く: 試すだけの用途\n向かない: 上限を超える用途";

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
  // 語の一覧による検査。壊した記事は content/posts/ に一時的に置くだけで、本番には出ない
  {
    name: "体験表現（本文）",
    make: (s) => swap(s, "無料です。", "無料です。実際に使ってみたところ快適でした。"),
    expect: [E_VOICE, "使ってみ"],
  },
  {
    name: "体験表現（summary）",
    make: (s) => swap(s, "summary = '記事の型の検査", "summary = 'おすすめを紹介します。記事の型の検査"),
    expect: [E_VOICE, "おすすめ"],
  },
  {
    name: "扱わない領域の語（本文）",
    make: (s) => swap(s, "試すだけなら → サンプル A。", "試すだけなら → サンプル A。転職を考えている人にも向きます。"),
    expect: [E_YMYL, "転職"],
  },
  { name: "辞書の語に似た語は通る（稼働・クレジットカード）", make: (s) => swap(s, "無料です。", "無料です。常時稼働で、クレジットカードの登録は不要です。"), expect: null },
  {
    name: "見出し末尾に全角スペース",
    make: (s) => swap(s, "## 比較表\n", "## 比較表　\n"),
    expect: [E_H2, E_SEG],
  },
  // 任意の「よくある質問」節。用途別の選び方と出典の間にだけ置ける
  { name: "よくある質問が用途別の選び方と出典の間", make: (s) => swap(s, "## 出典\n", FAQ + "## 出典\n"), expect: null },
  { name: "よくある質問が比較表の前", make: (s) => swap(s, "## 比較表\n", FAQ + "## 比較表\n"), expect: [E_FAQ_POS] },
  {
    name: "よくある質問の見出しが？で終わらない",
    make: (s) => swap(s, "## 出典\n", "## よくある質問\n\n### 無料で使えるか\n\nサンプル A は無料です。\n\n## 出典\n"),
    expect: [E_FAQ_Q],
  },
  // 要点カード fit。引数は run / spec、行は「向く:」「向かない:」の 2 行
  { name: "fit を正しく使う", make: (s) => swap(s, "- **料金体系**", fit("run", FIT_BODY) + "- **料金体系**"), expect: null },
  { name: "fit の引数が run / spec 以外", make: (s) => swap(s, "- **料金体系**", fit("done", FIT_BODY) + "- **料金体系**"), expect: [E_FIT_KIND] },
  { name: "fit に「向かない:」が無い", make: (s) => swap(s, "- **料金体系**", fit("spec", "向く: 試すだけの用途") + "- **料金体系**"), expect: [E_FIT_ROWS] },
  { name: "早見表の対象がアンカーリンク", make: (s) => swap(s, "## 比較表\n", quick("[サンプル A](#サンプル-a)") + "## 比較表\n"), expect: null },
  { name: "早見表の対象がリンクでない", make: (s) => swap(s, "## 比較表\n", quick("サンプル A") + "## 比較表\n"), expect: [E_QUICK_LINK] },
  {
    name: "早見表の列が型と違う",
    make: (s) => swap(s, "## 比較表\n", "| 条件 | 対象 |\n| --- | --- |\n| 無料で試したい | [サンプル A](#サンプル-a) |\n\n## 比較表\n"),
    expect: [E_QUICK_COLS],
  },

  // 作例（content/examples/）。比較記事の検査は掛からず、作例の検査だけが掛かる
  ex({ name: "作例: 正常", make: (s) => s, expect: null }),
  ex({ name: "作例: CRLF の正常な記事", make: (s) => s.replace(/\n/g, "\r\n"), expect: null }),
  ex({
    name: "作例: 体験や主観の表現があっても通る（判断の理由に主観を入れてよい）",
    make: (s) => swap(s, "私は無料で始められる点で選びました。", "私は無料で始められる点で選びました。使ってみて快適だったのでおすすめです。"),
    expect: null,
  }),
  ex({ name: "作例: H2 が欠ける", make: (s) => swap(s, "## 判断と気づき\n", ""), expect: [E_EX_H2] }),
  ex({ name: "作例: H2 の順番が違う", make: (s) => swap(swap(s, "## 制約と撤収\n", "## 一時\n"), "## 判断と気づき\n", "## 制約と撤収\n").replace("## 一時\n", "## 判断と気づき\n"), expect: [E_EX_H2] }),
  ex({ name: "作例: 冒頭の定型に AI の製品名が無い", make: (s) => swap(s, "この作例は Claude が作り、", "この作例は AI が作り、"), expect: [E_EX_LEAD] }),
  ex({
    name: "作例: 冒頭にリポジトリのリンクが無い",
    make: (s) => swap(s, "https://github.com/kwrkb/kurabebako-example-fixture", "https://example.com/"),
    expect: [E_EX_REPO],
  }),
  ex({ name: "作例: 冒頭の AI 名と 5 節目の見出しが違う", make: (s) => swap(s, "## Claude がしたこと", "## Codex がしたこと"), expect: [E_EX_AI] }),
  ex({ name: "作例: Codex で揃っていれば通る", make: (s) => swap(swap(s, "この作例は Claude が作り", "この作例は Codex が作り"), "## Claude がしたこと", "## Codex がしたこと"), expect: null }),
  ex({
    name: "作例: モデルの版が書かれている",
    make: (s) => swap(s, "サンプル A で公開したページです。", "サンプル A で公開したページです。制作には Claude Opus 5.5 を使いました。"),
    expect: [E_EX_MODEL],
  }),
  ex({ name: "作例: 出典に確認日が無い", make: (s) => swap(s, " — 2026-10-23 確認", ""), expect: [E_EX_SRC] }),
  ex({
    name: "作例: 扱わない領域の語",
    make: (s) => swap(s, "サンプル A で公開したページです。", "サンプル A で公開したページです。転職にも向きます。"),
    expect: [E_YMYL, "転職"],
  }),
  ex({ name: "作例: HTML コメントが残っている", make: (s) => swap(s, "## できたもの\n", "<!-- 指示 -->\n\n## できたもの\n"), expect: ["本文に HTML コメントが残っています"] }),
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

for (const target of Object.values(targets)) {
  if (fs.existsSync(target)) {
    console.error(`前回の一時ファイルが残っています。消してから実行してください: ${target}`);
    process.exit(1);
  }
}

const dest = fs.mkdtempSync(path.join(os.tmpdir(), "kurabebako-post-checks-"));
let failed = 0;
try {
  for (const c of cases) {
    const section = c.section || "posts";
    const target = targets[section];
    fs.writeFileSync(target, c.make(fixtures[section]));
    const { ok, log } = build(dest);
    // 壊した記事を次のケース（別セクション）に持ち越さない
    fs.rmSync(target, { force: true });
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
  for (const target of Object.values(targets)) fs.rmSync(target, { force: true });
  fs.rmSync(dest, { recursive: true, force: true });
}

console.log(`\n${cases.length - failed} / ${cases.length} passed`);
process.exit(failed ? 1 : 0);
