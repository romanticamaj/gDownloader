const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { run, getPageIdentity } = require('./downloader.js');

test('page resume rejects ambiguous identity and separates identical IDs on different origins', () => {
  const page = { origin: 'https://a.example', pathname: '/player', search: '?id=A' };
  assert.throws(() => getPageIdentity(page, null), /stable video identity/i);
  assert.throws(() => getPageIdentity(page, '   '), /stable video identity/i);
  assert.notEqual(
    getPageIdentity(page, 'video-1'),
    getPageIdentity({ ...page, origin: 'https://b.example' }, 'video-1')
  );
});

// Real disk adapter: writes commit on close and are discarded on abort.
function directory(root) {
  return {
    async getDirectoryHandle(name, { create } = {}) {
      const p = path.join(root, name);
      if (create) await fs.mkdir(p, { recursive: true });
      else await fs.stat(p);
      return directory(p);
    },
    async getFileHandle(name, { create } = {}) {
      const p = path.join(root, name);
      try { await fs.stat(p); } catch (e) {
        if (!create) { e.name = 'NotFoundError'; throw e; }
        await fs.writeFile(p, '');
      }
      return {
        async getFile() {
          const b = await fs.readFile(p);
          return { size: b.length, text: async () => b.toString() };
        },
        async createWritable() {
          const tmp = p + '.pending';
          const handle = await fs.open(tmp, 'w');
          return {
            write: data => handle.writeFile(data),
            async close() { await handle.close(); await fs.rename(tmp, p); },
            async abort() { await handle.close(); await fs.rm(tmp, { force: true }); }
          };
        }
      };
    }
  };
}

async function fixture(t, options = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'hls-disk-test-'));
  const stats = { requests: [], active: 0, peak: 0, failures: 0 };
  let failed = options.failAt;
  const server = http.createServer(async (req, res) => {
    const file = req.url.split('/').at(-1);
    if (file === 'playlist.txt') {
      res.end('#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1\n720p/index.txt\n');
    } else if (file === 'index.txt') {
      res.end('#EXTM3U\n' + (options.extra || '') +
        Array.from({ length: 8 }, (_, i) => `#EXTINF:5,\ns${i}.png\n`).join('') +
        '#EXT-X-ENDLIST\n');
    } else {
      const i = Number(file.match(/s(\d+)/)?.[1]);
      stats.requests.push(i);
      stats.active++; stats.peak = Math.max(stats.peak, stats.active);
      await new Promise(r => setTimeout(r, (3 - i % 3) * 10));
      stats.active--;
      if (i === failed) { res.writeHead(403); res.end(); return; }
      if (i === options.retryAt && stats.failures++ < 2) {
        res.writeHead(503); res.end(); return;
      }
      // 188-byte MPEG-TS packets, with a distinguishable payload per segment.
      const b = Buffer.alloc(188, i); b[0] = 0x47; res.end(b);
    }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  t.after(async () => { await new Promise(r => server.close(r)); await fs.rm(root, { recursive: true, force: true }); });
  const base = `http://127.0.0.1:${server.address().port}`;
  return { root, stats, recover: () => { failed = undefined; },
    args: { directory: directory(root), manifestUrl: base + '/signed-A/playlist.txt',
      mediaId: 'test-video', groupSize: 4, concurrency: 3, retryDelayMs: 1 } };
}

test('parallel download writes ordered bytes and creates a complete concat list', async t => {
  const f = await fixture(t);
  const result = await run(f.args);
  assert.equal(result.completedSegments, 8);
  const p = path.join(f.root, result.folder);
  assert.deepEqual((await fs.readFile(path.join(p, 'part-00001.ts'))).filter((_, i) => i % 188 === 1), Buffer.from([0, 1, 2, 3]));
  assert.deepEqual((await fs.readFile(path.join(p, 'part-00002.ts'))).filter((_, i) => i % 188 === 1), Buffer.from([4, 5, 6, 7]));
  assert.equal(await fs.readFile(path.join(p, 'concat.txt'), 'utf8'), "file 'part-00001.ts'\nfile 'part-00002.ts'\n");
  assert.ok(f.stats.peak > 1 && f.stats.peak <= 3);
});

test('403 preserves completed parts; a refreshed signed URL resumes without redownloading them', async t => {
  const f = await fixture(t, { failAt: 6 });
  await assert.rejects(run(f.args), /403/);
  const folder = (await fs.readdir(f.root))[0];
  const state = JSON.parse(await fs.readFile(path.join(f.root, folder, 'progress.json'), 'utf8'));
  assert.equal(Object.keys(state.completed).length, 1);
  assert.equal((await fs.stat(path.join(f.root, folder, 'part-00002.ts'))).size, 0);
  f.recover(); f.stats.requests = [];
  const result = await run({ ...f.args, manifestUrl: f.args.manifestUrl.replace('signed-A', 'signed-B') });
  assert.equal(result.completedSegments, 8);
  assert.deepEqual([...f.stats.requests].sort(), [4, 5, 6, 7]);
});

test('a truncated completed part is downloaded again instead of being skipped', async t => {
  const f = await fixture(t);
  const first = await run(f.args);
  assert.equal(first.completedSegments, 8);
  await fs.writeFile(path.join(f.root, first.folder, 'part-00001.ts'), 'broken');
  f.stats.requests = [];
  await run(f.args);
  assert.deepEqual([...f.stats.requests].sort(), [0, 1, 2, 3]);
});

test('transient server failures retry and eventually produce a complete file', async t => {
  const f = await fixture(t, { retryAt: 2 });
  assert.equal((await run(f.args)).completedSegments, 8);
  assert.equal(f.stats.requests.filter(i => i === 2).length, 3);
});

test('unsupported encryption is rejected before any output directory is created', async t => {
  const f = await fixture(t, { extra: '#EXT-X-KEY:METHOD=AES-128,URI="key"\n' });
  await assert.rejects(run(f.args), /KEY/);
  assert.deepEqual(await fs.readdir(f.root), []);
});

test('cancel discards the current part and never produces a final concat list', async t => {
  const f = await fixture(t);
  const ctl = new AbortController();
  await assert.rejects(run({ ...f.args, signal: ctl.signal,
    onProgress: p => { if (p.currentPartSegments === 3) ctl.abort(); } }));
  const folder = (await fs.readdir(f.root))[0];
  assert.equal((await fs.stat(path.join(f.root, folder, 'part-00001.ts'))).size, 0);
  await assert.rejects(fs.stat(path.join(f.root, folder, 'concat.txt')));
});
