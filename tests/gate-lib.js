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
// `#` 以降の注釈は値から落とす（`draft = true # 公開前` を true と読むため）。
// 最初のテーブル見出し（`[params]` など）で読むのをやめる。その下の `draft = true` は TOML では params.draft で、
// Hugo はトップレベルの draft 無し＝公開として生成するのに、ここが draft と読むと段階 1 の公開検出から外れていた
// （2026-11-09 の監査 BUG-02。Hugo 側の front_matter.html と同じ規則）
function frontMatter(text) {
  const m = text.replace(/\r/g, "").match(/^\+\+\+\n([\s\S]*?)\n\+\+\+/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split("\n")) {
    if (/^\s*\[/.test(line)) break;
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

// `git diff --unified=0` の出力から、本文の追加・削除行（先頭が + / -）だけを返す。
// ヘッダー（diff --git / index / --- a/ / +++ b/ / new file mode …）は hunk の印 @@ より前にあるので、行の位置で除く。
// 以前は /^[+-](?![+-])/ でヘッダーを除いていたため、Markdown の箇条書きを足した・変えた行（`+- …` / `-- …`）が
// 本文として数えられず、箇条書きにだけリンクを足した公開が誤って止まり、箇条書きの書き換えは行数の上限を
// 素通りしていた（2026-11-09 の監査 BUG-01）
function diffBodyLines(diffText) {
  const body = [];
  let inHunk = false;
  for (const line of diffText.replace(/\r/g, "").split("\n")) {
    if (line.startsWith("diff --git ")) { inHunk = false; continue; }
    if (line.startsWith("@@")) { inHunk = true; continue; }
    if (!inHunk || line.startsWith("\\ No newline")) continue;
    if (line[0] === "+" || line[0] === "-") body.push(line);
  }
  return body;
}

// 撮影記録（tests/layout-check.js --shots が書く manifest.json）の形。checkVisual が例外ではなく stop の文言で
// 止まれるように、読める JSON か・4 組の views・PNG の一覧があるかをここで見る（2026-11-09 の監査 ERR-03、前回 C03）。
// 戻り値は null（正常）か、理由の文字列
function manifestError(m) {
  if (!m || typeof m !== "object") return "manifest が JSON のオブジェクトではありません";
  if (typeof m.htmlSha256 !== "string" || !/^[0-9a-f]{64}$/.test(m.htmlSha256)) return "manifest に撮影した HTML の sha256（htmlSha256）がありません";
  if (!Array.isArray(m.views) || m.views.length !== 4) return `manifest の views が 4 組（375 / 1280px × 明 / 暗）ではありません（${Array.isArray(m.views) ? m.views.length : "無し"}）`;
  if (!Array.isArray(m.images) || !m.images.length) return "manifest に撮影した画像の一覧（images）がありません";
  for (const img of m.images) {
    if (!img || !/^[\w.-]+\.png$/.test(img.file || "")) return `manifest の images にファイル名の無い項目があります（${JSON.stringify(img)}）`;
    if (!/^[0-9a-f]{64}$/.test(img.sha256 || "")) return `manifest の ${img.file} に sha256 がありません`;
  }
  return null;
}

// 生成物の内部参照の検査。pages は { "/posts/a/index.html": html, … }（pub からの相対パス。/ 区切り・先頭 /）、
// files は pub にある全ファイルの Set（HTML 以外の CSS・画像・favicon も含む）。
// a / link の href と img / script / source の src のうち、同一 origin のもの（絶対パスと site で始まる URL）を見る。
// フラグメント（#id）は飛び先のページに id="…" があることを確かめる（結論の早見表と比較表のアンカーリンク。
// CLAUDE.md は「生成後の HTML で確かめる」と人手に置いていたが、ゲートは見ていなかった。2026-11-09 の監査 TEST-02、前回 F08）。
// 相対 URL（../x）と外部 URL・mailto・data: は見ない。戻り値は "ページ → 参照" の配列（空なら問題なし）
function brokenInternalRefs(pages, files, site = "") {
  const decode = (s) => { try { return decodeURIComponent(s.replace(/&amp;/g, "&")); } catch { return s; } };
  const idsOf = new Map();
  const ids = (file) => {
    if (!idsOf.has(file)) idsOf.set(file, new Set([...pages[file].matchAll(/\sid=["']?([^"'\s>]+)/g)].map((m) => decode(m[1]))));
    return idsOf.get(file);
  };
  const resolve = (p) => {
    if (files.has(p)) return p;
    const idx = (p.endsWith("/") ? p : p + "/") + "index.html";
    return files.has(idx) ? idx : null;
  };
  const broken = [];
  for (const [file, html] of Object.entries(pages)) {
    for (const m of html.matchAll(/<(?:a|link|img|script|source)\b[^>]*?\s(?:href|src)=["']?([^"'\s>]+)/g)) {
      let url = m[1];
      if (site && url.startsWith(site)) url = url.slice(site.length) || "/";
      const frag = url.indexOf("#");
      const fragment = frag >= 0 ? decode(url.slice(frag + 1)) : null;
      url = frag >= 0 ? url.slice(0, frag) : url;
      url = url.split("?")[0];
      let target;
      if (url === "") target = file;
      else if (url.startsWith("/") && !url.startsWith("//")) target = resolve(decode(url));
      else continue;
      if (!target) { broken.push(`${file} → ${m[1]}`); continue; }
      if (fragment && pages[target] !== undefined && !ids(target).has(fragment)) broken.push(`${file} → ${m[1]}（id が無い）`);
    }
  }
  return [...new Set(broken)];
}

// noindex と sitemap の食い違いの検査。pages は brokenInternalRefs と同じ形、sitemapXml は public/sitemap.xml の中身。
// 記事が 1 本だけのタグ・カテゴリのページは noindex にして sitemap から外している（layouts/_partials/thin_term.html、2026-11-11）。
// 判定の書き損じやテーマ更新で noindex が記事に付いても、sitemap から記事が落ちても、ビルドは通り、検索から消えるまで気づけない。
// 止めるのは 3 つ: noindex がタグ・カテゴリの個別ページ以外に付いている ／ noindex のページが sitemap にある ／
// noindex でないページが sitemap に無い。sitemap と突き合わせるのは index.html の形のページだけで、404.html と
// ページ送り（/page/N/。1 ページ目は転送だけの HTML）は Hugo が sitemap に載せないので見ない。戻り値は問題の配列（空なら問題なし）
function indexingProblems(pages, sitemapXml, site = "") {
  const locs = new Set([...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => (site && m[1].startsWith(site) ? m[1].slice(site.length) || "/" : m[1])));
  const problems = [];
  for (const [file, html] of Object.entries(pages)) {
    const noindex = /<meta\s+name=["']?robots["']?\s+content=["']?[^"'>]*noindex/i.test(html);
    if (noindex && !/^\/(tags|categories)\/[^/]+\/index\.html$/.test(file)) {
      problems.push(`${file}: noindex が付いています（付けてよいのは記事が 1 本だけのタグ・カテゴリのページだけ）`);
    }
    if (!file.endsWith("/index.html") || /\/page\/\d+\/index\.html$/.test(file)) continue;
    const url = file.slice(0, -"index.html".length);
    if (noindex && locs.has(url)) problems.push(`${url}: noindex のページが sitemap.xml にあります`);
    if (!noindex && !locs.has(url)) problems.push(`${url}: sitemap.xml にありません`);
  }
  return problems;
}

module.exports = { frontMatter, isPublishedText, parseBlock, parseAffiliates, isDisplayPath, diffBodyLines, manifestError, brokenInternalRefs, indexingProblems };
