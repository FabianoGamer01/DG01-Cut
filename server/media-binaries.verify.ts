// Spawnable binaries must resolve to real files once the app ships as an asar archive.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { accessSync, constants, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, sep } from 'node:path';
import { ffmpegBin, ffprobeBin, unpackedPath } from './media-binaries.ts';

const root = mkdtempSync(join(tmpdir(), 'media-binaries-'));
try {
  const archived = join(root, 'Resources', 'app.asar', 'node_modules', 'ffmpeg-static', 'ffmpeg');
  const twin = join(root, 'Resources', 'app.asar.unpacked', 'node_modules', 'ffmpeg-static', 'ffmpeg');
  assert.equal(unpackedPath(archived), archived, 'without an unpacked twin the path is left alone');
  mkdirSync(join(root, 'Resources', 'app.asar.unpacked', 'node_modules', 'ffmpeg-static'), { recursive: true });
  writeFileSync(twin, 'binary');
  assert.equal(unpackedPath(archived), twin, 'a path inside app.asar is rewritten to its app.asar.unpacked twin');
  const plain = join(root, 'dev', 'node_modules', 'ffmpeg-static', 'ffmpeg');
  assert.equal(unpackedPath(plain), plain, 'dev paths are untouched');
  const lookalike = join(root, 'my-app.asar-notes', 'ffmpeg');
  assert.equal(unpackedPath(lookalike), lookalike, `only a full ${sep}app.asar${sep} segment counts`);
} finally {
  rmSync(root, { recursive: true, force: true });
}

// The resolved dev binaries are real files that can be spawned (an explicit override wins).
assert.ok(!ffmpegBin().includes(`${sep}app.asar${sep}`));
assert.ok(!ffprobeBin().includes(`${sep}app.asar${sep}`));
process.env.OPENCHATCUT_FFPROBE = '/custom/ffprobe';
assert.equal(ffprobeBin(), '/custom/ffprobe');
delete process.env.OPENCHATCUT_FFPROBE;

// Resolving a path is not the same as being able to run it: ffmpeg-static's postinstall
// download can fail silently (npm keeps going, the module just resolves to a path with
// nothing there) and installers can ship the binary without its executable bit (observed
// on this machine: @ffprobe-installer/linux-x64/ffprobe landed 0644, so every probe failed
// with EACCES and media stayed stuck at "1 frame registered" with no error surfaced to the
// user). Actually spawning `-version` is the only check that catches both failure modes.
for (const [label, resolve] of [['ffmpeg', ffmpegBin], ['ffprobe', ffprobeBin]] as const) {
  const path = resolve();
  try {
    accessSync(path, constants.X_OK);
  } catch {
    throw new Error(`${label} at ${path} is missing or not executable (chmod +x, or its installer's postinstall did not run)`);
  }
  const output = execFileSync(path, ['-version'], { encoding: 'utf8', timeout: 10_000 });
  assert.ok(/version/i.test(output), `${label} -version did not print a version banner: ${output.slice(0, 200)}`);
}

console.log('media-binaries checks passed (asar twin rewrite, overrides, ffmpeg/ffprobe actually spawn)');
