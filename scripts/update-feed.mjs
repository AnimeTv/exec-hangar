// Refreshes feed.json from the community hangar timer (exec.xyxyll.com, MIT License).
// Run by .github/workflows/update-feed.yml. Never fails the workflow: on any
// problem it logs a warning and leaves feed.json as it is.
import { readFile, writeFile } from 'node:fs/promises';

const SOURCE = 'https://exec.xyxyll.com/app.js';
const FILE = new URL('../feed.json', import.meta.url);
const REFRESH_MS = 20 * 60 * 60 * 1000; // rewrite at least daily so the "checked" date stays current

function parse(js, now) {
  const a = js.match(/INITIAL_OPEN_TIME\s*=\s*new\s+Date\(\s*['"]([^'"]{10,40})['"]\s*\)/);
  if (!a) throw new Error('anchor not found');
  const anchorMs = Date.parse(a[1]);
  if (!Number.isFinite(anchorMs) || anchorMs < Date.UTC(2025, 0, 1) || anchorMs > now + 48 * 3600e3) throw new Error('anchor out of range: ' + a[1]);
  const num = (re, d) => { const m = js.match(re); const v = m ? Number(m[1]) : NaN; return Number.isFinite(v) ? v : d; };
  const online = num(/DESIGN_ONLINE_MIN\s*=\s*(\d{1,3})\b/, 65);
  const offline = num(/DESIGN_OFFLINE_MIN\s*=\s*(\d{1,3})\b/, 120);
  const drift = num(/CYCLE_DRIFT_MS\s*=\s*(-?\d{1,6})\b/, 350);
  if (online < 15 || online > 240 || offline < 15 || offline > 600 || Math.abs(drift) > 120000) throw new Error('cycle constants out of range');
  const version = (js.match(/@version\s+([0-9][0-9A-Za-z.\-]{0,20})/) || [])[1] || '';
  // The community "online" span includes the 5-minute dark reset at its end.
  return { anchorMs, timing: { openMin: online - 5, resetMin: 5, chargeMin: offline, driftMs: drift }, fetchedAt: now, source: 'exec.xyxyll.com', version };
}

const now = Date.now();
let current = null;
try { current = JSON.parse(await readFile(FILE, 'utf8')); } catch { /* first run */ }
try {
  const res = await fetch(SOURCE, { headers: { 'User-Agent': 'machine-corps-exec-hangar (GitHub Actions)', 'Cache-Control': 'no-cache' } });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const next = parse(await res.text(), now);
  const same = current && current.anchorMs === next.anchorMs && JSON.stringify(current.timing) === JSON.stringify(next.timing);
  if (same && now - (current.fetchedAt || 0) < REFRESH_MS) {
    console.log('No change; feed.json left as is.');
  } else {
    await writeFile(FILE, JSON.stringify(next, null, 2) + '\n');
    console.log(same ? 'Refreshed check date.' : 'Timing changed: ' + new Date(next.anchorMs).toISOString());
  }
} catch (e) {
  console.log('::warning::Feed not updated: ' + e.message);
}
