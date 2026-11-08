#!/usr/bin/env node
//------------------------------------------------------------------------------
// 生成物（public/）の内部参照の検査。push:site のゲートの 1 段と同じ判定を、push と切り離して単独で回す。
//
//   npm run build && node tests/link-check.js [出力の場所]
//
// 見るのは a / link の href と img / script / source の src のうち同一 origin のもので、パスの先が無い・
// アンカー（#id）の先に id が無いものを止める。判定は tests/gate-lib.js の brokenInternalRefs（単体テストあり）。
// push:site も collect() を require して同じ一覧を渡す（2026-11-09 の監査 TEST-02 / CI-01）。
//------------------------------------------------------------------------------
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { brokenInternalRefs } = require("./gate-lib.js");

const SITE = "https://kurabebako.com";

// pub の下を歩き、HTML の中身（pages）と全ファイルのパス（files）を pub からの相対パス（/ 区切り・先頭 /）で返す
function collect(pub) {
  const pages = {};
  const files = new Set();
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { walk(full); continue; }
      const rel = "/" + path.relative(pub, full).split(path.sep).join("/");
      files.add(rel);
      if (e.name.endsWith(".html")) pages[rel] = fs.readFileSync(full, "utf8");
    }
  })(pub);
  return { pages, files };
}

if (require.main === module) {
  const root = path.resolve(__dirname, "..");
  const pub = path.resolve(root, process.argv[2] || "public");
  if (!fs.existsSync(path.join(pub, "index.html"))) {
    console.error(`NG  ${path.relative(root, pub)}/ にビルド出力がありません。先にビルドしてください`);
    process.exit(1);
  }
  const { pages, files } = collect(pub);
  const broken = brokenInternalRefs(pages, files, SITE);
  if (broken.length) {
    console.error(`NG  内部参照の先がありません（${broken.length} 件）:\n  ${broken.slice(0, 50).join("\n  ")}`);
    process.exit(1);
  }
  console.log(`ok  ${Object.keys(pages).length} ページの同一 origin の内部参照（a / link / img / script / source。#id を含む）は揃っています`);
}

module.exports = { collect };
