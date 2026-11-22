import { chromium } from 'playwright'; import { spawn } from 'node:child_process'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url)), port = 9331;
const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: here, stdio: 'ignore' });
for (let i = 0; i < 100; i++) { try { await fetch(`http://127.0.0.1:${port}/test.html`); break } catch { await new Promise(r => setTimeout(r, 100)) } }
const browser = await chromium.launch({ args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
try { const page = await browser.newPage({ viewport: { width: 1080, height: 1440 } }); page.on('pageerror', e => console.log('PAGEERROR', e.message)); page.on('console', m => { if (m.type() === 'error') console.log('ERR', m.text()) });
  await page.goto(`http://127.0.0.1:${port}/test.html`); await page.waitForFunction(() => window.ready, null, { timeout: 120000 });
  for (const n of process.argv.slice(2)) { await page.evaluate(n => window.scene(n), n); await page.locator('#stage').screenshot({ path: path.join(here, `test_${n}.png`) }); console.log('ok', n) }
} finally { await browser.close(); server.kill('SIGTERM') }
