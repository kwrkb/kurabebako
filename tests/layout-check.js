#!/usr/bin/env node
//------------------------------------------------------------------------------
// 表示の崩れの検査。public/ をローカルで配信し、端末に入っている Chrome / Edge をヘッドレスで開いて、
// 主要な幅でページが横にはみ出していないかを見る。
//
//   npm run build && npm run test:layout
//   npm run test:layout -- .cache/draft-check   （draft を含めたビルド出力を見るとき）
//   npm run test:layout -- public --shots <slug> [--shots <slug> ...]
//                                               （上の検査が全部通ったあと、指定した記事を撮影する）
//
// 見るのは「ページ全体の横スクロールが出ているか」の 1 点だけ。このサイトで実際に起きた表示の崩れは、
// どれもこの形だった（2 列の表に比較表向けの CSS が掛かって 1593px、日本語が折り返せず 1309px など。
// desk の research/readability/2026-09.md）。比較表は狭い幅では枠の中で横スクロールさせる設計なので、
// 枠の中のはみ出しは数えない。色・余白・図の見た目の良し悪しは、ここでは分からない。
//
// `--shots` は、その「見た目の良し悪し」を人の preview の代わりに AI が画像で確かめるための撮影（2026-10-28 に
// 足した。公開を routine に任せる「段階 2」の部品。経緯は LESSONS.md）。375px / 1280px × 明 / 暗 の 4 組で、
// 記事を縦 900px の帯（100px 重ねる）に分けて保存し、狭い幅で横スクロールになるフロー図は枠の中を左から右へ
// 送りながら全域を撮る。縮小した全体像では文字が読めないので、等倍の帯だけを残す。出力は
// `.cache/layout-shots/<slug>/` で、`manifest.json` に撮影条件と各 PNG のハッシュを書く。
// 画像ができただけでは合格ではない。読んで判定するのは呼び出し側（公開 routine）の仕事。
//
// npm パッケージを足さない方針（devDependencies は wrangler だけ）なので、puppeteer 等は使わない。
// ブラウザの操作は DevTools Protocol を Node 同梱の WebSocket で直接話す。
//------------------------------------------------------------------------------
"use strict";

const { spawn } = require("node:child_process");
const { createHash } = require("node:crypto");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
// 引数でビルド出力の場所を渡せる。draft は本番ビルドに入らないので、書いた draft を見るときは
// hugo --buildDrafts --destination .cache/draft-check の出力を渡す
const args = process.argv.slice(2);
const pub = path.resolve(root, args[0] && !args[0].startsWith("--") ? args.shift() : "public");
const shotSlugs = [];
while (args.length) {
  const option = args.shift();
  const slug = args.shift();
  if (option !== "--shots" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug || "")) {
    console.error("NG  使い方: layout-check.js [出力の場所] [--shots <slug>]（--shots は繰り返せる。slug は英小文字・数字・ハイフン）");
    process.exit(1);
  }
  if (!shotSlugs.includes(slug)) shotSlugs.push(slug);
}
// スマホ / タブレット / 比較表を画面幅に収める境目（1140px）の手前と先
const WIDTHS = [375, 768, 1100, 1280];
// 撮影する幅とテーマ。幅は「スマホで比較表がカードに組み替わる側」と「PC で表が画面幅に収まる側」の 2 つ
const SHOT_WIDTHS = [375, 1280];
const THEMES = ["light", "dark"];
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".xml": "application/xml", ".json": "application/json", ".webmanifest": "application/manifest+json" };

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

function findBrowser() {
  const env = process.env;
  const candidates =
    process.platform === "win32"
      ? [env.ProgramFiles, env["ProgramFiles(x86)"], env.LOCALAPPDATA].filter(Boolean).flatMap((base) => [
          path.join(base, "Google", "Chrome", "Application", "chrome.exe"),
          path.join(base, "Microsoft", "Edge", "Application", "msedge.exe"),
        ])
      : process.platform === "darwin"
        ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge", "/Applications/Chromium.app/Contents/MacOS/Chromium"]
        : ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/microsoft-edge"];
  return candidates.find((c) => fs.existsSync(c));
}

// 検査するページ。記事（比較記事・作例）は全部、それ以外は種類ごとに 1 つ（トップ・固定ページ・タグの一覧）
function pages() {
  const list = ["/"];
  for (const section of ["posts", "examples"]) {
    const dir = path.join(pub, section);
    if (!fs.existsSync(dir)) continue;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory() && e.name !== "page" && fs.existsSync(path.join(dir, e.name, "index.html"))) list.push(`/${section}/${e.name}/`);
    }
  }
  for (const extra of ["/about/", "/tags/", "/examples/"]) if (fs.existsSync(path.join(pub, extra, "index.html"))) list.push(extra);
  const tags = path.join(pub, "tags");
  const firstTag = fs.existsSync(tags) && fs.readdirSync(tags, { withFileTypes: true }).find((e) => e.isDirectory());
  if (firstTag) list.push(`/tags/${firstTag.name}/`);
  return list;
}

function serve() {
  const server = http.createServer((req, res) => {
    let file = path.join(pub, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (!file.startsWith(pub)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) return res.writeHead(404).end();
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

function launch(exe, profile) {
  const child = spawn(exe, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--hide-scrollbars", "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("ブラウザが 20 秒以内に起動しませんでした")), 20000);
    let buf = "";
    child.stderr.on("data", (d) => {
      buf += d;
      const m = buf.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (m) {
        clearTimeout(timer);
        resolve({ child, port: new URL(m[1]).port });
      }
    });
    child.on("exit", () => reject(new Error(`ブラウザが起動直後に終了しました:\n${buf}`)));
  });
}

// DevTools との会話。応答待ちには期限を置き、切断されたら待っている全部を失敗にする
// （期限が無いと、ブラウザが黙って落ちたときに永久に止まる）。
// `allowedOrigin` を渡すと、その origin 以外への通信（計測タグ・広告の計測画像・外部の画像）を止める。
// 撮影は公開前の記事で行うので、本番の計測に数字を残さないため
function connect(wsUrl, allowedOrigin) {
  const ws = new WebSocket(wsUrl);
  const pending = new Map();
  const waiters = [];
  let id = 0;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const n = ++id;
    const timer = setTimeout(() => { pending.delete(n); reject(new Error(`${method} が 30 秒で応答しません`)); }, 30000);
    pending.set(n, { resolve, reject, timer });
    ws.send(JSON.stringify({ id: n, method, params }));
  });
  const once = (method, ms) => new Promise((resolve, reject) => {
    const w = { method, resolve };
    w.timer = setTimeout(() => { waiters.splice(waiters.indexOf(w), 1); reject(new Error(`${method} を ${ms}ms 待っても来ません`)); }, ms);
    waiters.push(w);
  });
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      clearTimeout(p.timer);
      msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
    } else if (msg.method === "Fetch.requestPaused") {
      const u = new URL(msg.params.request.url);
      const allowed = u.origin === allowedOrigin || ["data:", "blob:"].includes(u.protocol);
      send(allowed ? "Fetch.continueRequest" : "Fetch.failRequest", allowed ? { requestId: msg.params.requestId } : { requestId: msg.params.requestId, errorReason: "BlockedByClient" }).catch(() => {});
    } else if (msg.method) {
      for (let i = waiters.length - 1; i >= 0; i--) {
        if (waiters[i].method === msg.method) {
          const w = waiters.splice(i, 1)[0];
          clearTimeout(w.timer);
          w.resolve();
        }
      }
    }
  };
  ws.onclose = () => {
    for (const p of pending.values()) { clearTimeout(p.timer); p.reject(new Error("DevTools との接続が切れました")); }
    pending.clear();
  };
  return new Promise((resolve, reject) => {
    ws.onopen = () => resolve({ send, once, close: () => ws.close() });
    ws.onerror = () => reject(new Error("DevTools に接続できません"));
  });
}

async function evaluate(cdp, expression) {
  const r = await cdp.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(`ページ内の処理に失敗しました: ${r.exceptionDetails.text}`);
  return r.result.value;
}

// ページ側で実行する。はみ出しの幅と、原因になっていそうな要素を返す
const MEASURE = `(() => {
  const doc = document.documentElement;
  const view = doc.clientWidth;
  const over = doc.scrollWidth - view;
  const offenders = [];
  if (over > 1) {
    const clipped = (el) => { for (let p = el.parentElement; p && p !== doc; p = p.parentElement) { if (getComputedStyle(p).overflowX !== "visible") return true; } return false; };
    for (const el of document.body.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > view + 1 && !clipped(el)) {
        const cls = typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\\s+/).join(".") : "";
        offenders.push(el.tagName.toLowerCase() + cls + " (右端 " + Math.round(r.right) + "px)");
        if (offenders.length >= 5) break;
      }
    }
  }
  return JSON.stringify({ view, over, offenders });
})()`;

// フォント・同一 origin の画像・2 フレームぶんの描画を待ってから撮る
const READY = `(async () => {
  await document.fonts.ready;
  for (const image of document.images) {
    if (new URL(image.src, location.href).origin === location.origin) { image.loading = "eager"; await image.decode().catch(() => {}); }
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  return true;
})()`;

async function captureArticle(cdp, origin, slug) {
  const page = `/posts/${slug}/`;
  const htmlFile = path.join(pub, "posts", slug, "index.html");
  if (!fs.existsSync(htmlFile)) throw new Error(`撮影する記事がビルド出力にありません: ${page}（draft のままか、slug が違う）`);
  const dir = path.join(root, ".cache", "layout-shots", slug);
  // 前回の画像を残さない。古い PNG が今回の証拠に混ざらないように、フォルダごと作り直す
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const manifest = { slug, output: path.relative(root, pub), capturedAt: new Date().toISOString(), htmlSha256: sha256(fs.readFileSync(htmlFile)), browser: (await cdp.send("Browser.getVersion")).product, views: [], images: [] };
  const save = async (name, clip) => {
    const r = await cdp.send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: true, clip: { ...clip, scale: 1 } });
    const bytes = Buffer.from(r.data, "base64");
    if (bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") throw new Error(`PNG になっていません: ${name}`);
    fs.writeFileSync(path.join(dir, name), bytes);
    manifest.images.push({ file: name, ...clip, sha256: sha256(bytes) });
  };
  for (const width of SHOT_WIDTHS) {
    for (const theme of THEMES) {
      await cdp.send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
      await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: theme }] });
      const loaded = cdp.once("Page.loadEventFired", 30000);
      await cdp.send("Page.navigate", { url: origin + page });
      await loaded;
      // テーマは PaperMod の切替と同じ経路（localStorage の pref-theme と <html data-theme>）で固定する
      await evaluate(cdp, `(() => { localStorage.setItem("pref-theme", ${JSON.stringify(theme)}); document.documentElement.dataset.theme = ${JSON.stringify(theme)}; return true; })()`);
      await evaluate(cdp, READY);
      const view = await evaluate(cdp, `(() => { const d = document.documentElement; return { theme: d.dataset.theme, width: d.clientWidth, over: d.scrollWidth - d.clientWidth, background: getComputedStyle(document.body).backgroundColor, tables: document.querySelectorAll(".post-content table").length, fits: document.querySelectorAll(".fit").length, flows: document.querySelectorAll(".figure-svg").length, pr: document.querySelectorAll(".pr-notice").length, ctas: document.querySelectorAll(".cta, .cta-paused, .ranking").length }; })()`);
      if (view.theme !== theme || view.width !== width || view.over > 1) throw new Error(`撮影の条件が揃いません: ${JSON.stringify(view)}`);
      manifest.views.push({ width, theme, ...view });
      const prefix = `${width}-${theme}`;
      await evaluate(cdp, "(() => { scrollTo(0, 0); return true; })()");
      const height = Math.ceil((await cdp.send("Page.getLayoutMetrics")).cssContentSize.height);
      if (height > 40000) throw new Error(`ページが長すぎます（${height}px）。撮影の上限を見直してください`);
      // 縦 900px の帯を 100px 重ねて切る。縮小した全体像は文字が読めないので残さない
      for (let y = 0, i = 0; y < height; y += 800, i++) await save(`${prefix}-tile-${String(i).padStart(2, "0")}.png`, { x: 0, y, width, height: Math.min(900, height - y) });
      // 狭い幅で横スクロールになるフロー図は、枠の中を左から右へ送りながら全域を撮る（両端だけでは中央が欠ける）
      const scrollers = await evaluate(cdp, `(() => [...document.querySelectorAll(".figure-svg-scroll")].map((e) => ({ view: e.clientWidth, total: e.scrollWidth })))()`);
      for (let n = 0; n < scrollers.length; n++) {
        const { view: vw, total } = scrollers[n];
        if (!vw || total <= vw + 1) continue;
        const xs = [];
        for (let x = 0; x < total - vw; x += Math.max(1, vw - 40)) xs.push(x);
        xs.push(total - vw);
        for (let i = 0; i < xs.length; i++) {
          const box = await evaluate(cdp, `(() => { const s = document.querySelectorAll(".figure-svg-scroll")[${n}]; s.scrollLeft = ${xs[i]}; const r = s.getBoundingClientRect(); return { x: Math.max(0, Math.floor(r.x + scrollX)), y: Math.max(0, Math.floor(r.y + scrollY)), width: Math.ceil(r.width), height: Math.ceil(r.height) }; })()`);
          await evaluate(cdp, READY);
          await save(`${prefix}-flow-${n}-part-${i}.png`, box);
        }
        await evaluate(cdp, `(() => { document.querySelectorAll(".figure-svg-scroll")[${n}].scrollLeft = 0; return true; })()`);
      }
    }
  }
  fs.writeFileSync(path.join(dir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  console.log(`ok  撮影 ${page} → ${path.relative(root, dir)}/（${manifest.images.length} 枚。読んで判定するのは呼び出し側）`);
}

async function main() {
  if (!fs.existsSync(path.join(pub, "index.html"))) throw new Error(`${path.relative(root, pub)}/ にビルド出力がありません。先にビルドしてください`);
  const exe = findBrowser();
  if (!exe) throw new Error("Chrome / Edge が見つかりません。表示の検査ができないので止めます（黙って通さない）");

  const server = await serve();
  const origin = `http://127.0.0.1:${server.address().port}`;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "kurabebako-layout-"));
  let child;
  const problems = [];
  try {
    const launched = await launch(exe, profile);
    child = launched.child;
    const target = await (await fetch(`http://127.0.0.1:${launched.port}/json/new?about:blank`, { method: "PUT" })).json();
    const cdp = await connect(target.webSocketDebuggerUrl, origin);
    await cdp.send("Page.enable");
    await cdp.send("Network.enable");
    // 検査用のサーバー以外への通信を止める（計測タグ・広告の計測画像・外部の画像）
    await cdp.send("Fetch.enable", { patterns: [{ urlPattern: "*", requestStage: "Request" }] });

    const list = pages();
    for (const page of list) {
      const marks = [];
      for (const width of WIDTHS) {
        await cdp.send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
        const loaded = cdp.once("Page.loadEventFired", 30000);
        await cdp.send("Page.navigate", { url: origin + page });
        await loaded;
        const { result } = await cdp.send("Runtime.evaluate", { expression: MEASURE, returnByValue: true });
        const m = JSON.parse(result.value);
        if (m.over > 1) {
          marks.push(`${width}:+${m.over}px`);
          problems.push(`${page}  幅 ${width}px で ${m.over}px はみ出し\n      ${m.offenders.join("\n      ") || "（原因の要素を特定できず）"}`);
        } else {
          marks.push(`${width}:ok`);
        }
      }
      console.log(`${marks.every((x) => x.endsWith(":ok")) ? "ok  " : "NG  "}  ${page}  [${marks.join(" ")}]`);
    }
    console.log(`\n${list.length} ページ × ${WIDTHS.length} 幅（${path.basename(exe)}）`);
    // 撮影は横はみ出しが無いときだけ。崩れたページの画像を「確認済み」の材料にしない
    if (!problems.length) for (const slug of shotSlugs) await captureArticle(cdp, origin, slug);
    cdp.close();
  } finally {
    if (child) child.kill();
    server.close();
    // プロファイルの削除はブラウザの終了を待たないと Windows で失敗するので、失敗しても止めない
    setTimeout(() => fs.rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }, () => {}), 500);
  }
  if (problems.length) {
    console.error(`\nNG  横にはみ出しているページがあります:\n  ${problems.join("\n  ")}`);
    return 1;
  }
  console.log("ok  どのページも横にはみ出していません");
  return 0;
}

main().then(
  (code) => setTimeout(() => process.exit(code), 900),
  (e) => {
    console.error(`NG  ${e.message}`);
    setTimeout(() => process.exit(1), 900);
  },
);
