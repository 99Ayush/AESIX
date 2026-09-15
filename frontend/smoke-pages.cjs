// Route smoke test: every page must render (never a white screen).
// Usage:  npm run smoke            (expects dev server on http://localhost:5173)
//         npm run smoke -- http://localhost:4173   (preview build)
// Requires Google Chrome installed. Exits 1 if any route renders empty
// or throws an uncaught JS exception.
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const WebSocket = require('ws');

const BASE = process.argv[2] || 'http://localhost:5173';
const DEBUG_PORT = 9333;
const ROUTES = ['/login', '/register', '/dashboard', '/basicInfo', '/docs', '/consent', '/abha', '/profile', '/kindle', '/namaste-code', '/icd-code', '/socrates', '/genai', '/doctor'];
const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function cdp(pathname, method) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: 'localhost', port: DEBUG_PORT, path: pathname, method: method || 'GET' }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch (e) { reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 120)}`)); } });
    });
    req.on('error', reject);
    req.end();
  });
}

async function waitForDebugger(retries = 30) {
  for (let i = 0; i < retries; i++) {
    try { await cdp('/json/version'); return; } catch { await new Promise((r) => setTimeout(r, 500)); }
  }
  throw new Error('Chrome debugger did not start');
}

let msgId = 0;
const pending = new Map();
function send(ws, method, params) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params: params || {} }));
  });
}

async function checkRoute(base, route) {
  const target = await cdp('/json/new?about:blank', 'PUT');
  const ws = await new Promise((resolve, reject) => {
    const s = new WebSocket(target.webSocketDebuggerUrl, { maxPayload: 256 * 1024 * 1024 });
    s.on('open', () => resolve(s));
    s.on('error', reject);
  });
  const errors = [];
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id).resolve(msg.result); pending.delete(msg.id); }
    else if (msg.method === 'Runtime.exceptionThrown') {
      const ex = msg.params.exceptionDetails;
      errors.push(`EXCEPTION: ${ex.text || ''} :: ${((ex.exception && ex.exception.description) || '').split('\n')[0]}`);
    }
  });
  await send(ws, 'Runtime.enable');
  await send(ws, 'Page.enable');
  await send(ws, 'Page.navigate', { url: base + route });
  await new Promise((r) => setTimeout(r, 6000));
  const evalRes = await send(ws, 'Runtime.evaluate', {
    expression: `(() => { const r = document.getElementById('root'); return r ? r.innerHTML.length : -1; })()`,
    returnByValue: true,
  });
  const len = evalRes.result.value;
  ws.close();
  await cdp(`/json/close/${target.id}`, 'PUT').catch(() => {});
  return { route, len, errors: [...new Set(errors)] };
}

(async () => {
  if (!fs.existsSync(CHROME)) {
    console.error(`Chrome not found at ${CHROME} (set CHROME_PATH to override)`);
    process.exit(2);
  }
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'smoke-chrome-'));
  const chrome = spawn(CHROME, [`--headless=new`, '--no-sandbox', '--disable-gpu', `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
  let failures = 0;
  try {
    await waitForDebugger();
    for (const r of ROUTES) {
      try {
        const t = await checkRoute(BASE, r);
        const white = t.len <= 0;
        if (white || t.errors.length > 0) failures++;
        console.log(`${white ? 'WHITE-SCREEN' : t.errors.length ? 'JS-ERROR   ' : 'OK          '} ${r} (rootChars=${t.len})`);
        t.errors.forEach((e) => console.log(`    !! ${e}`));
      } catch (e) {
        failures++;
        console.log(`ERROR        ${r} :: ${e.message}`);
      }
    }
  } finally {
    try { chrome.kill(); } catch { /* noop */ }
    await new Promise((r) => setTimeout(r, 2500));
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* best-effort */ }
  }
  console.log(failures === 0 ? `SMOKE PASS: all ${ROUTES.length} routes render on ${BASE}` : `SMOKE FAIL: ${failures} problem(s)`);
  process.exit(failures === 0 ? 0 : 1);
})();
