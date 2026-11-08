//------------------------------------------------------------------------------
// push ゲート（tests/push-site.js）のうち、Git も fs も触らない純粋関数。
//
// ここに分けてある理由: push-site.js は読み込んだ瞬間にゲートを走らせて push まで行く実行プログラムなので、
// require して関数だけ試すことができなかった（2026-11-06 の監査 F05）。判定の間違いは「公開していないつもりの
// 記事を公開する」事故に直結するのに、回帰テストが無い状態だった。副作用の無い部分をここに置き、
// tests/gate-checks.js（node:test）で公開ゼロのまま試す。
//------------------------------------------------------------------------------
"use strict";

// front matter（先頭の +++ ... +++）の中の key = value を素朴に読む。配列は ['a', "b"] の 1 行だけ。
// TOML の完全な解析ではない（公開判定・日付・タグ・案件の突き合わせに要るキーだけ読めればよい）。
// `#` 以降の注釈は値から落とす（`draft = true # 公開前` を true と読むため）
function frontMatter(text) {
  const m = text.replace(/\r/g, "").match(/^\+\+\+\n([\s\S]*?)\n\+\+\+/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^(\w+)\s*=\s*(.*)$/);
    if (!kv) continue;
    let raw = kv[2].trim();
    if (raw.startsWith("[")) fm[kv[1]] = [...raw.matchAll(/'([^']*)'|"([^"]*)"/g)].map((x) => x[1] ?? x[2]);
    else {
      // 引用符の中の # は注釈ではない。引用符で始まるなら対応する閉じ引用符まで、そうでなければ # の前まで
      const q = raw[0];
      if (q === "'" || q === '"') {
        const end = raw.indexOf(q, 1);
        raw = end > 0 ? raw.slice(1, end) : raw.slice(1);
      } else raw = raw.replace(/\s*#.*$/, "").trim();
      fm[kv[1]] = raw;
    }
  }
  return fm;
}

// draft でない記事として本番に出る内容かどうか。front matter の draft だけを見る。
// 以前はファイル全文に /^draft\s*=\s*true\s*$/m を掛けていたので、本文のコード例に `draft = true` の行があると
// 公開済みの記事を「未公開」と読み、新規公開を段階 1 のゲートが見逃す経路があった（監査 F01）。
// Hugo と同じく front matter だけで判定する。front matter が無い・draft が無いものは Hugo は公開扱いにする
function isPublishedText(text) {
  const fm = frontMatter(text);
  if (!fm) return true;
  return fm.draft !== "true";
}

// desk の記録ファイルの ```<名前> の fenced block を 1 つだけ読み、key: value の表にする（`#` 以降は注釈）。
// 戻り値は { data } か { error }（呼び出し側が stop する）
function parseBlock(text, name, label = "") {
  const blocks = [...text.matchAll(new RegExp("^```" + name + "\\s*\\n([\\s\\S]*?)^```", "gm"))];
  if (blocks.length !== 1) return { error: `${label} に \`\`\`${name} のブロックが ${blocks.length} 個あります（1 つだけにする）` };
  const data = {};
  for (const line of blocks[0][1].split("\n")) {
    const kv = line.match(/^([a-z0-9_]+):\s*(.*?)\s*(?:#.*)?$/);
    if (!kv) continue;
    if (kv[1] in data) return { error: `${label} の ${name} ブロックに ${kv[1]} が 2 回あります` };
    data[kv[1]] = kv[2];
  }
  return { data };
}

// data/affiliates.toml の id / name / paused だけ読む（値は '...' か "..." の 1 行）
function parseAffiliates(text) {
  const table = {};
  let cur = null;
  for (const line of text.split("\n")) {
    const sec = line.match(/^\[([a-z0-9-]+)\]\s*(?:#.*)?$/);
    if (sec) { cur = table[sec[1]] = { id: sec[1] }; continue; }
    const kv = cur && line.match(/^(\w+)\s*=\s*(?:'([^']*)'|"([^"]*)")/);
    if (kv) cur[kv[1]] = kv[2] ?? kv[3];
  }
  return table;
}

// 表示・ビルドに効くパス。段階 1（AI の自律 push）ではこれらの変更を未 push に含めない（監査 F11）。
// CLAUDE.md「ブランチ運用」: レイアウト・CSS の変更はユーザーが preview を見てから git push origin main で出す。
// content/ と data/ は含めない（記事の修正・台帳の paused は freshness / expiry-apply の routine が自律で push する）
const DISPLAY_PREFIXES = ["layouts/", "assets/", "static/"];
const DISPLAY_FILES = ["hugo.toml", "go.mod", "go.sum", "build.sh", "build.js", "wrangler.jsonc"];
function isDisplayPath(file) {
  return DISPLAY_PREFIXES.some((p) => file.startsWith(p)) || DISPLAY_FILES.includes(file);
}

module.exports = { frontMatter, isPublishedText, parseBlock, parseAffiliates, isDisplayPath };
