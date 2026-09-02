#!/usr/bin/env node
//------------------------------------------------------------------------------
// build.sh を OS を問わず同じコマンド（node build.js）で起動するための薄いラッパー。
//
// wrangler の build.command は Windows では cmd.exe で実行されるため、
// `chmod` や `./build.sh` が使えない。さらに Windows の PATH 上の `bash` は
// WSL の bash（System32）に解決されるので、Git for Windows 同梱の bash を明示して呼ぶ。
// Cloudflare（Linux）では PATH の bash をそのまま使う。
//
// ビルド手順そのものは build.sh に集約している。ここには置かない。
//------------------------------------------------------------------------------
"use strict";

const { spawnSync } = require("node:child_process");
const { existsSync } = require("node:fs");
const path = require("node:path");

function bashPath() {
  if (process.platform !== "win32") {
    return "bash";
  }
  const bases = [
    process.env.ProgramFiles,
    process.env["ProgramFiles(x86)"],
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Programs"),
  ].filter(Boolean);
  const found = bases
    .map((base) => path.join(base, "Git", "bin", "bash.exe"))
    .find((candidate) => existsSync(candidate));
  if (!found) {
    console.error(
      "Git for Windows の bash.exe が見つかりません（build.sh の実行に必要）。\n" +
        "  winget install --id Git.Git\n" +
        "探した場所: " + bases.map((b) => path.join(b, "Git", "bin", "bash.exe")).join(", ")
    );
    process.exit(1);
  }
  return found;
}

const result = spawnSync(bashPath(), ["build.sh"], {
  stdio: "inherit",
  cwd: __dirname,
});
if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
