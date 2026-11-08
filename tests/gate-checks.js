#!/usr/bin/env node
//------------------------------------------------------------------------------
// push ゲートの判定関数（tests/gate-lib.js）の単体テスト。Git にも本番にも触らない。
//
//   npm run test:gate   （= node --test tests/gate-checks.js）
//
// 公開の可否を決める関数の回帰を、記事を 1 本も公開せずに確かめるために置く（2026-11-06 の監査 F01 / F05 / F11）。
//------------------------------------------------------------------------------
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { frontMatter, isPublishedText, parseBlock, parseAffiliates, isDisplayPath, diffBodyLines, manifestError, brokenInternalRefs } = require("./gate-lib.js");

const FM = (body) => `+++\n${body}\n+++\n`;
const published = FM("title = 'A'\ndraft = false\nsummary = 'S'");
const draft = FM("title = 'A'\ndraft = true\nsummary = 'S'");

test("isPublishedText: front matter の draft で決まる", () => {
  assert.equal(isPublishedText(published + "\n本文"), true);
  assert.equal(isPublishedText(draft + "\n本文"), false);
});

test("isPublishedText: 本文のコード例の draft = true は公開判定に効かない（監査 F01）", () => {
  const text = published + "\n## 本文\n\n```toml\ndraft = true\n```\n";
  assert.equal(isPublishedText(text), true);
});

test("isPublishedText: 注釈付き・空白違い・CRLF の draft = true は未公開", () => {
  assert.equal(isPublishedText(FM("draft = true # 公開前")), false);
  assert.equal(isPublishedText(FM("draft=true")), false);
  assert.equal(isPublishedText(FM("draft = true").replace(/\n/g, "\r\n")), false);
});

test("isPublishedText: front matter に draft が無い・front matter が無いものは公開扱い（Hugo と同じ）", () => {
  assert.equal(isPublishedText(FM("title = 'A'")), true);
  assert.equal(isPublishedText("draft = true\n本文だけ"), true);
});

test("isPublishedText: テーブル見出し（[params]）の下の draft = true はトップレベルの draft ではない（Hugo は公開する。監査 BUG-02）", () => {
  assert.equal(isPublishedText(FM("title = 'A'\n[params]\ndraft = true")), true);
  assert.equal(isPublishedText(FM("title = 'A'\ndraft = true\n[params]\nx = 1")), false);
  assert.equal(frontMatter(FM("title = 'A'\n[params]\nsummary = 'S'")).summary, undefined);
});

test("frontMatter: 文字列・配列・注釈・引用符の中の #", () => {
  const fm = frontMatter(FM("title = 'a # b'\ndate = '2026-01-01T00:00:00+09:00' # 公開\ntags = ['x', \"y\"]\nlastmod = 2026-01-02 # memo"));
  assert.equal(fm.title, "a # b");
  assert.equal(fm.date, "2026-01-01T00:00:00+09:00");
  assert.deepEqual(fm.tags, ["x", "y"]);
  assert.equal(fm.lastmod, "2026-01-02");
  assert.equal(frontMatter("本文だけ"), null);
});

test("parseBlock: 1 つのブロックだけ読み、注釈を落とし、重複キーを拒む", () => {
  const ok = parseBlock("メモ\n```precheck\nslug: a # 記事\nresult: match\n```\n", "precheck", "f.md");
  assert.deepEqual(ok.data, { slug: "a", result: "match" });
  assert.match(parseBlock("```precheck\nslug: a\n```\n```precheck\nslug: b\n```\n", "precheck", "f.md").error, /2 個/);
  assert.match(parseBlock("```precheck\nslug: a\nslug: b\n```\n", "precheck", "f.md").error, /2 回/);
  assert.match(parseBlock("本文のみ", "visual", "f.md").error, /0 個/);
});

test("parseAffiliates: id / name / paused を読む", () => {
  const t = parseAffiliates("[a]\nname = 'A 社'\nurl = 'https://x'\n\n[b-2] # memo\nname = \"B\"\npaused = '受付停止中'\n");
  assert.equal(t.a.name, "A 社");
  assert.equal(t.a.paused, undefined);
  assert.equal(t["b-2"].paused, "受付停止中");
});

test("isDisplayPath: レイアウト・CSS・テーマ・ビルド経路は表示に効く、content / data / tests は効かない（監査 F11）", () => {
  for (const f of ["layouts/_partials/extend_post_content.html", "assets/css/extended/charts.css", "static/favicon.ico", "hugo.toml", "go.mod", "go.sum", "build.sh", "build.js", "wrangler.jsonc"]) {
    assert.equal(isDisplayPath(f), true, f);
  }
  for (const f of ["content/posts/a.md", "data/affiliates.toml", "tests/push-site.js", "package.json", "CLAUDE.md", "archetypes/posts.md"]) {
    assert.equal(isDisplayPath(f), false, f);
  }
});

test("diffBodyLines: ヘッダーを除き、箇条書きの行（+- …）と front matter の区切り（+++）を本文として数える（監査 BUG-01）", () => {
  const diff = [
    "diff --git a/content/posts/x.md b/content/posts/x.md",
    "index 1111111..2222222 100644",
    "--- a/content/posts/x.md",
    "+++ b/content/posts/x.md",
    "@@ -3,0 +4 @@",
    "+- 除外したもの: [比較](/posts/domain-registrar/) で扱う。",
    "@@ -10 +11 @@",
    "-- 古い箇条書き",
    "+段落で [x](/posts/domain-registrar/) を参照。",
    "@@ -1 +1 @@",
    "-+++",
    "++++",
    "\ No newline at end of file",
  ].join("\n");
  const lines = diffBodyLines(diff);
  assert.deepEqual(lines, ["+- 除外したもの: [比較](/posts/domain-registrar/) で扱う。", "-- 古い箇条書き", "+段落で [x](/posts/domain-registrar/) を参照。", "-+++", "++++"]);
  assert.equal(lines.filter((l) => l.startsWith("+") && l.includes("/posts/domain-registrar/")).length, 2);
  assert.deepEqual(diffBodyLines(""), []);
  assert.deepEqual(diffBodyLines(diff.replace(/\n/g, "\r\n")).length, 5);
});

test("manifestError: 形の崩れた撮影記録を理由つきで止める（監査 ERR-03）", () => {
  const ok = { htmlSha256: "a".repeat(64), views: [{}, {}, {}, {}], images: [{ file: "375-light-tile-00.png", sha256: "b".repeat(64) }] };
  assert.equal(manifestError(ok), null);
  assert.match(manifestError(null), /オブジェクト/);
  assert.match(manifestError({ ...ok, htmlSha256: "x" }), /htmlSha256/);
  assert.match(manifestError({ ...ok, views: [{}] }), /views が 4 組/);
  assert.match(manifestError({ ...ok, images: [] }), /images/);
  assert.match(manifestError({ ...ok, images: [{ file: "../x.png", sha256: "b".repeat(64) }] }), /ファイル名/);
  assert.match(manifestError({ ...ok, images: [{ file: "a.png" }] }), /sha256/);
});

test("brokenInternalRefs: パスの欠落・フラグメントの欠落・img の欠落を拾い、外部と相対は見ない（監査 TEST-02）", () => {
  const pages = {
    "/index.html": '<a href="/posts/a/">a</a> <a href="https://kurabebako.com/posts/a/#%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB-a">anchor</a> <link rel="stylesheet" href="/css/x.css?v=1"> <a href="https://example.com/">ext</a> <a href="mailto:x@y">m</a> <a href="../rel/">rel</a>',
    "/posts/a/index.html": '<h3 id="サンプル-a">A</h3> <a href="#サンプル-a">self</a> <a href="#missing">x</a> <a href="/posts/none/">none</a> <img src="/images/og/a.jpg"> <img src="/images/og/none.jpg"> <a href="/posts/a/#%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB-b">b</a> <a href="/about">about</a> <a href="/">top</a>',
  };
  const files = new Set([...Object.keys(pages), "/css/x.css", "/images/og/a.jpg", "/about/index.html"]);
  const broken = brokenInternalRefs(pages, files, "https://kurabebako.com");
  assert.deepEqual(broken, [
    "/posts/a/index.html → #missing（id が無い）",
    "/posts/a/index.html → /posts/none/",
    "/posts/a/index.html → /images/og/none.jpg",
    "/posts/a/index.html → /posts/a/#%E3%82%B5%E3%83%B3%E3%83%97%E3%83%AB-b（id が無い）",
  ]);
});
