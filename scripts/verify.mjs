#!/usr/bin/env node
/**
 * scripts/verify.mjs — structural checks against a running site (dev/preview).
 *
 *   node scripts/verify.mjs http://localhost:4321
 *
 * Uses Chrome DevTools Protocol directly (no dependencies): launches system
 * Chromium headless, then per page checks what .agents/verification.md lists:
 *   - no horizontal overflow at 320 px
 *   - exactly one <h1>, no heading-level jumps
 *   - first Tab focuses the skip link
 *   - no console errors / page exceptions
 *   - reduced motion: the wordmark animation resolves to its end state
 * Exit code 1 on any failure.
 */
import { spawn } from 'node:child_process';

const base = (process.argv[2] ?? 'http://localhost:4321').replace(/\/$/, '');
const PAGES = [
  '/pt/',
  '/pt/sobre/',
  '/pt/equipa/',
  '/pt/eventos/',
  '/pt/tornar-me-socio/',
  '/pt/area-de-socio/',
  '/pt/doacoes/',
  '/pt/apoios/',
];

/* ---------------------------------------------------------- CDP plumbing */

const chrome = spawn('chromium-browser', [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--remote-debugging-port=0',
  '--force-device-scale-factor=1',
  '--window-size=1280,900',
  'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });

const wsUrl = await new Promise((resolve, reject) => {
  let buf = '';
  chrome.stderr.on('data', (chunk) => {
    buf += chunk;
    const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) resolve(m[1]);
  });
  chrome.on('exit', () => reject(new Error('chromium exited early')));
  setTimeout(() => reject(new Error('no DevTools endpoint')), 15000);
});

const ws = new WebSocket(wsUrl);
await new Promise((res) => ws.addEventListener('open', res, { once: true }));

let id = 0;
const pending = new Map();
const events = [];
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  } else if (msg.method) {
    events.push(msg);
  }
});
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const msgId = ++id;
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params, ...(sessionId ? { sessionId } : {}) }));
  });

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const cdp = (method, params) => send(method, params, sessionId);

/* -------------------------------------------------------------- checks */

let failures = 0;
const report = (page, name, ok, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${page} — ${name}${detail ? ` (${detail})` : ''}`);
};

for (const path of PAGES) {
  const url = base + path;
  events.length = 0;
  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Log.enable');
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 320, height: 800, deviceScaleFactor: 1, mobile: true,
  });
  await cdp('Page.navigate', { url });
  await new Promise((r) => setTimeout(r, 700));

  const evalJs = async (expression) =>
    (await cdp('Runtime.evaluate', { expression, returnByValue: true })).result?.value;

  // 320 px: no horizontal overflow
  const overflow = await evalJs(
    'document.documentElement.scrollWidth - document.documentElement.clientWidth',
  );
  report(path, 'no horizontal overflow at 320px', overflow <= 1, `overflow ${overflow}px`);

  // one h1, no heading jumps
  const headings = await evalJs(
    '[...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(h=>+h.tagName[1])',
  );
  const h1s = headings.filter((l) => l === 1).length;
  let jump = 0;
  for (let i = 1; i < headings.length; i++) if (headings[i] - headings[i - 1] > 1) jump++;
  report(path, 'exactly one h1', h1s === 1, `${h1s} found`);
  report(path, 'no heading-level jumps', jump === 0, `${jump} jumps`);

  // first Tab reaches the skip link
  await evalJs('document.activeElement.blur(); document.body.focus()');
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
  const focused = await evalJs('document.activeElement.className');
  report(path, 'first Tab focuses skip link', /skip-link/.test(focused ?? ''), String(focused));

  // console errors
  const errors = events.filter(
    (e) =>
      (e.method === 'Runtime.exceptionThrown') ||
      (e.method === 'Log.entryAdded' && e.params.entry.level === 'error'),
  );
  const errorText = errors
    .map((e) => e.params?.entry?.text ?? e.params?.exceptionDetails?.text ?? e.method)
    .join(' | ')
    .slice(0, 160);
  report(path, 'no console errors', errors.length === 0, errorText || `${errors.length} errors`);
}

// reduced motion: the wordmark resolves to its finished state
await cdp('Emulation.setEmulatedMedia', {
  features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
});
await cdp('Page.navigate', { url: base + '/pt/' });
await new Promise((r) => setTimeout(r, 500));
const dash = await (async () =>
  (await cdp('Runtime.evaluate', {
    expression:
      'getComputedStyle(document.querySelector(".wordmark-pen")).strokeDashoffset',
    returnByValue: true,
  })).result?.value)();
report('/pt/', 'reduced motion shows the finished wordmark', dash === '0px', `dashoffset ${dash}`);

console.log(failures ? `\n${failures} check(s) failed.` : '\nAll structural checks passed.');
chrome.kill();
process.exit(failures ? 1 : 0);
