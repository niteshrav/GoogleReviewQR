/**
 * Runs Next.js with optional --use-system-ca when the Node version supports it.
 * Node 20 (CI) does not support the flag; Node 22.14+ / 23+ do (needed on some Windows TLS setups).
 */
const { spawn } = require("node:child_process");
const path = require("node:path");

function supportsUseSystemCa() {
  const [major, minor] = process.versions.node.split(".").map((part) => Number(part));
  if (Number.isNaN(major) || Number.isNaN(minor)) {
    return false;
  }
  // Flag exists on Node 23+ and was backported to 22.14+.
  return major >= 23 || (major === 22 && minor >= 14);
}

const nextBin = require.resolve("next/dist/bin/next");
const nextArgs = process.argv.slice(2);
const nodeArgs = supportsUseSystemCa() ? ["--use-system-ca", nextBin, ...nextArgs] : [nextBin, ...nextArgs];

const child = spawn(process.execPath, nodeArgs, {
  cwd: path.join(__dirname, "..", "frontend"),
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
