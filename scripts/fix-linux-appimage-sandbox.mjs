#!/usr/bin/env node
// Chromium's setuid sandbox helper (chrome-sandbox) only grants privileges when it
// is owned by root and has the setuid bit. electron-builder's AppImage target can't
// produce that on its own: mksquashfs runs as whatever uid packaged the app (dragon
// on this machine, any CI runner elsewhere), never root, so the shipped chrome-sandbox
// is setuid but owned by a non-root uid -- which the kernel treats as a no-op, not a
// privilege escalation. Without this fix, launching the AppImage hangs at the zygote
// fork stage (no gpu-process/renderer spawned, no error dialog). `--no-sandbox` avoids
// the hang but has been observed to crash Chromium's network service on this machine
// (ERR_FAILED -2 loading the app's own localhost URL) -- prefer this fix over that flag.
//
// This step needs a real root chown, so it cannot run inside an unprivileged build
// (see config/electron-builder.config.mjs). Run it once per AppImage build:
//   node scripts/fix-linux-appimage-sandbox.mjs [path/to/OpenChatCut-*.AppImage]
// It extracts the AppImage persistently (bypassing the ephemeral /tmp/.mount_* FUSE
// mount, which disappears when the process exits) and fixes chrome-sandbox in place.
// Requires passwordless or interactive sudo.

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const releaseDir = resolve(import.meta.dirname, '..', 'release');

function findAppImage() {
  const candidates = readdirSync(releaseDir)
    .filter((name) => name.endsWith('.AppImage'))
    .map((name) => join(releaseDir, name));
  if (candidates.length === 0) {
    throw new Error(`No .AppImage found in ${releaseDir}. Run npm run desktop:dist:linux first.`);
  }
  candidates.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  return candidates[0];
}

const appImagePath = resolve(process.argv[2] ?? findAppImage());
const extractDir = join(dirname(appImagePath), 'squashfs-root');
const sandboxPath = join(extractDir, 'chrome-sandbox');

console.log(`AppImage: ${appImagePath}`);

if (!existsSync(extractDir)) {
  console.log('Extracting persistently to', extractDir);
  execFileSync(appImagePath, ['--appimage-extract'], { cwd: dirname(appImagePath), stdio: 'inherit' });
} else {
  console.log('Reusing existing extraction at', extractDir);
}

if (!existsSync(sandboxPath)) {
  throw new Error(`chrome-sandbox not found at ${sandboxPath} -- extraction layout may have changed.`);
}

console.log('Applying root ownership + setuid bit (sudo required)...');
execFileSync('sudo', ['chown', 'root:root', sandboxPath], { stdio: 'inherit' });
execFileSync('sudo', ['chmod', '4755', sandboxPath], { stdio: 'inherit' });

console.log(`\nFixed. Launch with: ${join(extractDir, 'openchatcut')}`);
