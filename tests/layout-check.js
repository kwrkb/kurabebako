#!/usr/bin/env node
//------------------------------------------------------------------------------
// 表示の崩れの検査。public/ をローカルで配信し、端末に入っている Chrome / Edge をヘッドレスで開いて、
// 主要な幅でページが横にはみ出していないかを見る。
//
//   npm run build && npm run test:layout
//   npm run test:layout -- .cache/draft-check   （draft を含めたビルド出力を見るとき）
//
// 見るのは「ページ全体の横スクロールが出ているか」の 1 点だけ。このサイトで実際に起きた表示の崩れは、
// どれもこの形だった（2 列の表に比較表向けの CSS が掛かって 1593px、日本語が折り返せず 1309px など。
// desk の research/readability/2026-09.md）。比較表は狭い幅では枠の中で横スクロールさせる設計なので、
// 枠の中のはみ出しは数えない。色・余白・図の見た目の良し悪しは、ここでは分からない。
//
// npm パッケージを足さない方針（devDependencies は wrangler だけ）なので、puppeteer 等は使わない。
// ブラウザの操作は DevTools Protocol を Node 同梱の WebSocket で直接話す。
//------------------------------------------------------------------------------
"use strict";

const { spawn } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
// 引数でビルド出力の場所を渡せる。draft は本番ビルドに入らないので、書いた draft を見るときは
// hugo --buildDrafts --destination .cache/draft-check の出力を渡す
const pub = path.resolve(root, process.argv[2] || "public");
// スマホ / タブレット / 比較表を画面幅に収める境目（1140px）の手前と先
const WIDTHS = [375, 768, 1100, 1280];
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon", ".xml": "application/xml", ".json": "application/json", ".webmanifest": "application/manifest+json" };

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

// 検査するページ。記事は全部、それ以外は種類ごとに 1 つ（トップ・固定ページ・タグの一覧）
function pages() {
  const list = ["/"];
  const posts = path.join(pub, "posts");
  for (const e of fs.readdirSync(posts, { withFileTypes: true })) {
    if (e.isDirectory() && e.name !== "page" && fs.existsSync(path.join(posts, e.name, "index.html"))) list.push(`/posts/${e.name}/`);
  }
  for (const extra of ["/about/", "/tags/"]) if (fs.existsSync(path.join(pub, extra, "index.html"))) list.push(extra);
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

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  const pending = new Map();
  const waiters = [];
  let id = 0;
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method) {
      for (let i = waiters.length - 1; i >= 0; i--) if (waiters[i].method === msg.method) waiters.splice(i, 1)[0].resolve();
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => { pending.set(++id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
  const once = (method, ms) => new Promise((resolve, reject) => { waiters.push({ method, resolve }); setTimeout(() => reject(new Error(`${method} を ${ms}ms 待っても来ません`)), ms); });
  return new Promise((resolve, reject) => { ws.onopen = () => resolve({ send, once, close: () => ws.close() }); ws.onerror = () => reject(new Error("DevTools に接続できません")); });
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

async function main() {
  if (!fs.existsSync(path.join(pub, "index.html"))) throw new Error(`${path.relative(root, pub)}/ にビルド出力がありません。先にビルドしてください`);
  const exe = findBrowser();
  if (!exe) throw new Error("Chrome / Edge が見つかりません。表示の検査ができないので止めます（黙って通さない）");

  const server = await serve();
  const origin = `http://127.0.0.1:${server.address().port}`;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "kurabebako-layout-"));
  const { child, port } = await launch(exe, profile);
  const problems = [];
  try {
    const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
    const cdp = await connect(target.webSocketDebuggerUrl);
    await cdp.send("Page.enable");
    await cdp.send("Network.enable");
    // ローカルの検査で計測タグを鳴らさない
    await cdp.send("Network.setBlockedURLs", { urls: ["*googletagmanager.com*", "*google-analytics.com*", "*cloudflareinsights.com*"] });

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
    cdp.close();
    console.log(`\n${list.length} ページ × ${WIDTHS.length} 幅（${path.basename(exe)}）`);
  } finally {
    child.kill();
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
