import * as THREE from 'three';
import { cat3d, BREED_NAMES } from './cat3d.js';
const W = 1080, H = 1440, R = new THREE.WebGLRenderer({ canvas: document.getElementById('gl'), antialias: true, preserveDrawingBuffer: true });
R.setPixelRatio(1); R.setSize(W, H, false); R.outputColorSpace = THREE.SRGBColorSpace;
const OV = document.getElementById('ov').getContext('2d'); const cam = new THREE.PerspectiveCamera(40, W / H, 0.05, 900);
const col = s => new THREE.Color().setStyle(s, THREE.SRGBColorSpace);
await new FontFace('Noto', 'url(NotoSansSC.ttf)', { weight: '100 900' }).load().then(f => document.fonts.add(f));
function lights(s, k = 1) { s.add(new THREE.HemisphereLight(0xfff4e8, 0x8a7a6a, 1.5 * k)); const d = new THREE.DirectionalLight(0xffffff, 1.7 * k); d.position.set(-4, 9, 7); s.add(d); const f = new THREE.DirectionalLight(0xffe0c0, 0.5 * k); f.position.set(6, 3, -4); s.add(f) }
const box = (w, h, d, c, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color: col(c) })); m.position.set(x, y + h / 2, z); return m };
function label(t, x, y, px = 34, c = '#fff') { OV.font = `900 ${px}px Noto`; OV.textAlign = 'center'; OV.lineJoin = 'round'; OV.lineWidth = px / 5; OV.strokeStyle = '#1a1420'; OV.strokeText(t, x, y); OV.fillStyle = c; OV.fillText(t, x, y) }
const hh = i => { const v = Math.sin(i * 91.7) * 4375.5; return v - Math.floor(v) };
function flatOld() { const G = window.GRIDS.orange, pal = { K: '#2c2022', O: '#fdae5b', D: '#d36b0e', P: '#ff8caf' }, g = new THREE.Group(), geo = new THREE.BoxGeometry(1, 1, 1);
  G.forEach((r, y) => [...r].forEach((ch, x) => { if (ch === '.') return; const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: col(pal[ch]) })); m.scale.z = y < 4 ? 3 : 7; m.position.set(x - 11, 22 - y, 0); g.add(m) }));
  g.scale.setScalar(0.1); return g }
const S = {};
S.hero = () => { const s = new THREE.Scene(); s.background = col('#ffd9a8'); lights(s); s.add(box(40, 0.1, 40, '#f5c58c', 0, -0.1, 0));
  const c = cat3d('orange', 0.1); c.rotation.y = -0.28; s.add(c); cam.fov = 30; cam.updateProjectionMatrix(); cam.position.set(0.9, 2.2, 7.2); cam.lookAt(0, 1.2, 0); R.render(s, cam) };
S.compare = () => { const s = new THREE.Scene(); s.background = col('#f3d9b8'); lights(s); s.add(box(40, 0.1, 40, '#e9c49a', 0, -0.1, 0));
  const a = flatOld(); a.position.set(-1.35, 0, 0); a.rotation.y = -0.65; s.add(a); const b = cat3d('orange', 0.1); b.position.set(1.35, 0, 0); b.rotation.y = -0.65; s.add(b);
  cam.fov = 36; cam.updateProjectionMatrix(); cam.position.set(0, 2.4, 9.4); cam.lookAt(0, 1.15, 0); R.render(s, cam);
  label('现在：纸片', W * 0.27, 1180, 52); label('新：立体方块', W * 0.73, 1180, 52, '#ffd23f') };
S.turn = () => { const s = new THREE.Scene(); s.background = col('#cfe6f5'); lights(s); s.add(box(40, 0.1, 40, '#b8d8a8', 0, -0.1, 0));
  const L = [[0, '正面', -1.7, 2.2], [-0.8, '3/4', 1.7, 2.2], [-Math.PI / 2, '侧面', -1.7, -2.4], [Math.PI, '背面', 1.7, -2.4]];
  L.forEach(([r, n, x, z]) => { const c = cat3d('orange', 0.1); c.position.set(x, 0, z); c.rotation.y = r; s.add(c) });
  cam.fov = 38; cam.updateProjectionMatrix(); cam.position.set(0, 8.5, 11.5); cam.lookAt(0, 0.8, -0.2); R.render(s, cam);
  L.forEach(([r, n, x, z]) => { const v = (z < 0 ? new THREE.Vector3(x, 2.9, z) : new THREE.Vector3(x, -0.1, z + 1.1)).project(cam); label(n, (v.x + 1) / 2 * W, (1 - v.y) / 2 * H + (z < 0 ? -10 : 40), 40) }) };
S.breeds = () => { const s = new THREE.Scene(); s.background = col('#fbe7cf'); lights(s); s.add(box(60, 0.1, 60, '#f0cfa8', 0, -0.1, 0));
  BREED_NAMES.forEach((b, i) => { const c = cat3d(b, 0.1); const r = Math.floor(i / 3), k = i % 3; c.position.set((k - 1) * 2.6, 0, -r * 2.9 + 3); c.rotation.y = -0.25 * (k - 1); s.add(c) });
  cam.fov = 40; cam.updateProjectionMatrix(); cam.position.set(0, 9.5, 14); cam.lookAt(0, 0.6, -1.6); R.render(s, cam) };
S.street = () => { const s = new THREE.Scene(); s.background = col('#dfe8f0'); s.fog = new THREE.Fog('#dfe8f0', 18, 80); lights(s, 1.05);
  s.add(box(200, 0.1, 200, '#c9ced6', 0, -0.1, 0)); s.add(box(9, 0.02, 200, '#8c929c', 0, 0, 0));
  for (let z = 8; z > -90; z -= 6) for (const sx of [-1, 1]) { const h = 6 + ((z * 7) % 9 + 9) % 9 * 1.6; s.add(box(5, h, 5.4, ['#e8d2bc', '#c9b3a3', '#d9c9b8', '#b8c4cf'][(z / 6 | 0) & 3], sx * 8.5, 0, z)) }
  const d = new THREE.Object3D();
  const fur = new THREE.InstancedMesh(new THREE.BoxGeometry(0.045, 0.045, 0.045), new THREE.MeshLambertMaterial({ color: col('#fffaf2') }), 3500);
  for (let i = 0; i < 3500; i++) { d.position.set((hh(i) - .5) * 16, hh(i + 7) * 7, 6 - hh(i + 3) * 40); d.rotation.set(hh(i + 1) * 3, hh(i + 2) * 3, 0); d.updateMatrix(); fur.setMatrixAt(i, d.matrix) } s.add(fur);
  const drift = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.05, 0.5), new THREE.MeshLambertMaterial({ color: col('#fffdf8') }), 500);
  for (let i = 0; i < 500; i++) { d.position.set((hh(i + 11) - .5) * 9, 0.03, 6 - hh(i + 13) * 50); d.rotation.set(0, 0, 0); d.scale.set(1 + hh(i + 5) * 2, 1, 1 + hh(i + 6) * 2); d.updateMatrix(); drift.setMatrixAt(i, d.matrix) } s.add(drift); d.scale.set(1, 1, 1);
  for (let r = 0; r < 9; r++) for (let k = -2; k <= 2; k++) { const c = cat3d(BREED_NAMES[(r * 5 + k + 7) % BREED_NAMES.length], 0.075); c.position.set(k * 1.75, 0, 1.0 - r * 2.0); s.add(c) }
  const hero = cat3d('orange', 0.12); hero.position.set(0.3, 0, 3.4); hero.rotation.y = -0.3; s.add(hero);
  const puff = new THREE.InstancedMesh(new THREE.BoxGeometry(0.055, 0.055, 0.055), new THREE.MeshLambertMaterial({ color: col('#ffe2bf') }), 160);
  for (let i = 0; i < 160; i++) { const a = hh(i + 30) * 6.28, rr = 1.4 + hh(i + 31) * 1.2; d.position.set(0.3 + Math.cos(a) * rr, 0.5 + hh(i + 32) * 2.8, 3.4 + Math.sin(a) * rr * 0.6); d.rotation.set(hh(i) * 3, hh(i + 1) * 3, 0); d.updateMatrix(); puff.setMatrixAt(i, d.matrix) } s.add(puff);
  cam.fov = 46; cam.updateProjectionMatrix(); cam.position.set(1.2, 2.8, 11); cam.lookAt(0, 1.5, -3); R.render(s, cam);
  const x0 = 28, x1 = W - 28; OV.fillStyle = 'rgba(20,14,24,0.55)'; OV.fillRect(x0, 44, x1 - x0, 30); OV.fillStyle = '#ffd23f'; OV.fillRect(x0, 44, (x1 - x0) * 0.42, 30); OV.strokeStyle = '#1a1420'; OV.lineWidth = 5; OV.strokeRect(x0, 44, x1 - x0, 30);
  OV.textAlign = 'left'; OV.lineJoin = 'round'; OV.font = '800 30px Noto'; OV.lineWidth = 7; OV.strokeText('全球掉毛量', x0 + 6, 114); OV.fillStyle = '#fff'; OV.fillText('全球掉毛量', x0 + 6, 114);
  OV.font = '900 92px Noto'; OV.lineWidth = 16; OV.strokeText('12,800 吨', x0 + 4, 214); OV.fillStyle = '#ffd23f'; OV.fillText('12,800 吨', x0 + 4, 214);
  label('全城下起了猫毛雪', W / 2, 1300, 64) };
window.scene = n => { OV.clearRect(0, 0, W, H); S[n]() }; window.ready = true;
