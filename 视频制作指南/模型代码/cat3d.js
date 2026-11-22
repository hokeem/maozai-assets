// Volumetric voxel cat modelled on the 猫在 brand orange cat (big round head, tall ears, 3 forehead stripes,
// cheek stripes, black bean eyes with catch-light, blush, NO nose/mouth, curled striped tail) — real 3D, readable from every angle.
import * as THREE from 'three';
const C = s => new THREE.Color().setStyle(s, THREE.SRGBColorSpace);
const h3 = (x, y, z) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s) };
const n3 = (x, y, z, k) => h3(Math.floor(x / k), Math.floor(y / k), Math.floor(z / k));          // coarse blotch noise

// ---------- shape: returns a tag for each voxel (or null) ----------
// kawaii proportions: big round head (cheeks slightly wider), big pointy ears, low big eyes with a catch-light,
// blush, NO nose / mouth; small sitting body, front paws together, hind feet out, tail curled round the front.
const HC = { cy: 15, cz: 0.5 };
function headIn(x, y, z) { if (z > 6) return false; const t = (y - HC.cy) / 6.4, ax = 8.4 - 0.9 * Math.max(0, t) + 0.25 * Math.min(0, t); return Math.abs(x / ax) ** 2.6 + Math.abs(t) ** 2.6 + Math.abs((z - HC.cz) / 6.6) ** 2.6 <= 1 }
const ell = (x, y, z, cx, cy, cz, rx, ry, rz) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 + ((z - cz) / rz) ** 2;
const TAIL = [[2.5, 1.3, -4.4], [5.4, 1.2, -3.0], [6.6, 1.2, 0.0], [5.8, 1.3, 3.0], [3.6, 1.6, 4.9], [1.6, 2.6, 5.6]];
function tailHit(x, y, z) {
  let best = 1e9, bu = 0;
  for (let i = 0; i < TAIL.length - 1; i++) { const a = TAIL[i], b = TAIL[i + 1]; const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]; const ap = [x - a[0], y - a[1], z - a[2]];
    const L = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2; let u = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / L));
    const d = Math.hypot(ap[0] - ab[0] * u, ap[1] - ab[1] * u, ap[2] - ab[2] * u); if (d < best) { best = d; bu = (i + u) / (TAIL.length - 1) } }
  return best <= 1.5 - bu * 0.3 ? bu : -1 }
function shape(x, y, z, opt) {
  const fold = opt.fold;
  if (headIn(x, y, z)) {
    const front = !headIn(x, y, z + 1);
    if (front) {
      const ex = Math.abs(x);                                                        // eyes: 2 wide × 3 tall at x = ±3..4, y = 12..14
      if (ex >= 3 && ex <= 4 && y >= 12 && y <= 14) { if (opt.closed) return y === 12 ? 'eye' : 'head'; return (y === 14 && ex === (x < 0 ? 4 : 3)) ? 'hl' : 'eye' }
      if (ex >= 6 && ex <= 7 && y === 11) return 'blush';
    }
    if ((x === -2 || x === 0 || x === 2) && y >= 18 && z > -3 && !(x === 0 && y === 18)) return 'stripe';   // forehead "M"-ish stripes
    if (Math.abs(x) >= 7 && (y === 13 || y === 15) && z >= 1) return 'stripe';     // short cheek stripes
    return 'head';
  }
  // ears: big pointy triangles, outer edge nearly vertical, slight outward tilt; fold → small & tipped forward
  for (const sx of [-1, 1]) {
    const base = 19.6, H = fold ? 2 : 5.4, ty = y - base;
    if (ty >= 0 && ty < H) { const k = ty / H, cx = sx * (5.3 + 0.6 * k), half = 3.1 * (1 - k) + 0.35, zc = 0.6 + (fold ? ty * 1.1 : 0), hz = 1.5 * (1 - k * 0.5) + 0.2;
      if (Math.abs(x - cx) <= half && Math.abs(z - zc) <= hz) return (!fold && z >= zc + hz - 0.9 && Math.abs(x - cx) < half - 0.9 && k < 0.75) ? 'innerEar' : 'ear' }
  }
  // small pear body + chest
  if (y >= 0 && ell(x, y, z, 0, 4.6, -0.6, 4.8, 5.4, 4.4) <= 1) { if (z >= 1.8 && Math.abs(x) <= 2.4 && y >= 4) return 'chest'; return (y === 3 || y === 6) && z < -1.5 ? 'bstripe' : 'body' }
  // front legs (two columns) + paws, hind feet out to the sides
  for (const sx of [-1, 1]) {
    const lx = sx * 1.7;
    if (y >= 0 && y <= 5 && Math.abs(x - lx) <= 1.1 && z >= 2 && z <= 4.2) return y <= 1 ? 'paw' : 'leg';
    if (y >= 0 && y <= 1.6 && Math.abs(x - sx * 4.2) <= 1.4 && z >= 0 && z <= 3.6) return 'paw';
  }
  const u = tailHit(x, y, z); if (u >= 0) return Math.floor(u * 8) % 2 ? 'tstripe' : 'tail';
  return null;
}
// ---------- breeds: tag → colour ----------
const BASE = { O: '#ffb15f', D: '#d8681a', P: '#ff8caf', K: '#241a1e' };
const COMMON = { hl: '#ffffff', innerEar: '#ff9cbc', blush: '#ff9cbc' };
function tabby(base, stripe, chest, eye = BASE.K) { return t => ({ ...COMMON, stripe, bstripe: stripe, tstripe: stripe, eye, chest, paw: chest })[t] || base }
const mask = (x, y, z) => z > 2 && Math.hypot(x, (y - 13.5) * 1.1) < 4.6;                       // siamese / ragdoll face mask
const BREEDS = {
  orange: tabby(BASE.O, BASE.D, '#ffe3bf'),
  graytabby: tabby('#aca7a9', '#6c666b', '#ebe7e8'),
  brown: tabby('#c19365', '#6e4a2c', '#f0dcc2'),
  black: (t) => ({ ...COMMON, eye: '#ffcf3a', hl: '#fff6c8', innerEar: '#7a5a66', blush: '#8a5a6a' })[t] || '#3a3236',
  white: (t) => ({ ...COMMON, eye: '#4aa3f0' })[t] || '#f8f5f0',
  blue: (t) => ({ ...COMMON, eye: '#7fdc5c', innerEar: '#c8a6b4', blush: '#c88aa0' })[t] || '#8d99aa',
  siamese: (t, x, y, z) => ({ ...COMMON, eye: '#3c9cff', innerEar: '#b08070' })[t] || ((t === 'ear' || t === 'tail' || t === 'tstripe' || t === 'paw' || t === 'leg' || (t === 'head' || t === 'stripe') && mask(x, y, z)) ? '#5c4234' : '#f2e4c8'),
  ragdoll: (t, x, y, z) => ({ ...COMMON, eye: '#3c9cff', paw: '#fcf9f3', chest: '#fcf9f3' })[t] || ((t === 'ear' || t === 'tail' || t === 'tstripe' || (t === 'head' || t === 'stripe') && mask(x, y, z) && Math.abs(x) > 1) ? '#9a7558' : '#f6efe4'),
  tuxedo: (t, x, y, z) => ({ ...COMMON, eye: '#8ee35e', paw: '#fcf9f3', chest: '#fcf9f3' })[t] || (((t === 'head' || t === 'stripe') && z > 2 && Math.abs(x) <= 2 && y <= 12) ? '#fcf9f3' : '#2e282b'),
  cow: (t, x, y, z) => ({ ...COMMON, eye: BASE.K })[t] || (n3(x + 3, y, z, 4) > 0.62 || t === 'ear' && x < 0 ? '#2e282b' : '#fbf8f2'),
  calico: (t, x, y, z) => { const r = ({ ...COMMON, eye: BASE.K, chest: '#fbf8f2', paw: '#fbf8f2' })[t]; if (r) return r; const n = n3(x, y + 1, z, 4); if (t === 'head' && z > 2 && y >= 10 && y <= 16 && Math.abs(x) <= 5.5) return n > 0.45 ? '#f19a3e' : '#fbf8f2'; return n > 0.68 ? '#2e282b' : n > 0.4 ? '#f19a3e' : '#fbf8f2' },
  fold: tabby('#b3b0b2', '#7b7679', '#e9e6e7', '#e8a83a'),
};
export const BREED_NAMES = Object.keys(BREEDS);
// ---------- mesher: culled faces + vertex AO ----------
const FACES = [[[1, 0, 0], [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]]], [[-1, 0, 0], [[0, 0, 1], [0, 1, 1], [0, 1, 0], [0, 0, 0]]],
  [[0, 1, 0], [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]]], [[0, -1, 0], [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]]],
  [[0, 0, 1], [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]]], [[0, 0, -1], [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]]]];
export function catGeo(breed = 'orange', opt = {}) {
  const col = BREEDS[breed] || BREEDS.orange, vox = new Map(), st = opt.lod ? 2 : 1;                    // lod: sample every 2nd voxel for far crowds
  for (let x = -11; x <= 11; x += st) for (let y = -1; y <= 27; y += st) for (let z = -8; z <= 9; z += st) {
    const t = shape(x, y, z, { closed: opt.closed, fold: breed === 'fold' }); if (!t) continue;
    const c = col(t === 'face' ? 'head' : t, x, y, z);
    vox.set(Math.round(x / st) + ',' + Math.round(y / st) + ',' + Math.round(z / st), C(c).multiplyScalar(0.96 + 0.06 * h3(x, y, z))) }
  return meshVox(vox, st);
}
// voxel map ("i,j,k" → Color) → culled, vertex-AO mesh; `st` = world units per voxel index
export function meshVox(vox, st = 1) {
  const key = (x, y, z) => x + ',' + y + ',' + z;
  const has = (x, y, z) => vox.has(key(x, y, z)), pos = [], nor = [], cols = [], idx = [];
  for (const [k, c] of vox) { const [x, y, z] = k.split(',').map(Number);
    for (const [n, q] of FACES) { if (has(x + n[0], y + n[1], z + n[2])) continue; const base = pos.length / 3;
      for (const [a, b, e] of q) { // vertex AO from the 3 neighbours around this corner on the face's outer side
        const vx = x + a, vy = y + b, vz = z + e, ax = n.map(Math.abs), s = [];
        const off = [a ? 0 : -1, b ? 0 : -1, e ? 0 : -1];                                // voxel-space corner neighbours
        const tang = [0, 1, 2].filter(i => !ax[i]); const o = [x + n[0], y + n[1], z + n[2]];
        const d0 = [0, 0, 0], d1 = [0, 0, 0]; d0[tang[0]] = [a, b, e][tang[0]] ? 1 : -1; d1[tang[1]] = [a, b, e][tang[1]] ? 1 : -1;
        const s1 = has(o[0] + d0[0], o[1] + d0[1], o[2] + d0[2]), s2 = has(o[0] + d1[0], o[1] + d1[1], o[2] + d1[2]), cr = has(o[0] + d0[0] + d1[0], o[1] + d0[1] + d1[1], o[2] + d0[2] + d1[2]);
        const ao = (s1 && s2) ? 0 : 3 - (s1 + s2 + cr), sh = [0.62, 0.76, 0.89, 1][ao];
        pos.push(vx, vy, vz); nor.push(...n); cols.push(c.r * sh, c.g * sh, c.b * sh) }
      idx.push(base, base + 1, base + 2, base, base + 2, base + 3) } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g.setIndex(idx); g.translate(-0.5, 0, -0.5); g.scale(st, st, st); return g;
}
export const CAT_MAT = new THREE.MeshLambertMaterial({ vertexColors: true });
export const OUTLINE_MAT = new THREE.MeshBasicMaterial({ color: C('#2c2022'), side: THREE.BackSide });
// a cat = body mesh + slightly inflated back-face hull for the brand's dark outline
const GC = {};
export function cat3d(breed = 'orange', scale = 0.1, opt = {}) {
  const geo = GC[breed + (opt.closed ? 'c' : '') + (opt.lod ? 'L' : '')] ??= catGeo(breed, opt);
  const g = new THREE.Group(), m = new THREE.Mesh(geo, CAT_MAT); g.add(m);
  if (opt.outline !== false) { const o = new THREE.Mesh(geo, OUTLINE_MAT); o.scale.set(1.05, 1.035, 1.07); o.position.y = -11 * 0.035; g.add(o) }
  g.scale.setScalar(scale); return g;
}

// ---------- the dino ("you"): same blocky style — big head, eyes + blush, NO mouth, belly, little arms, back plates, tail ----------
const DP = { G: '#55c662', D: '#2f9a46', B: '#b2ea9f', K: '#241a1e', W: '#ffffff', P: '#ff9cbc' };
function dinoHead(x, y, z) { if (z > 6) return false; const t = (y - 20) / 5.8; return Math.abs(x / 7.4) ** 2.6 + Math.abs(t) ** 2.6 + Math.abs((z - 0.4) / 6.4) ** 2.6 <= 1 }
function dinoTag(x, y, z) {
  if (dinoHead(x, y, z)) { if (!dinoHead(x, y, z + 1)) { const ex = Math.abs(x);
      if (ex >= 3 && ex <= 4 && y >= 18 && y <= 20) return (y === 20 && ex === (x < 0 ? 4 : 3)) ? 'W' : 'K';
      if (ex >= 5 && ex <= 6 && y === 17) return 'P' }
    return 'G' }
  for (const [py, pz] of [[26, -1], [25.5, -3.4], [24, -5.4], [21.5, -6.6]]) if (Math.abs(x) <= 0.6 && Math.hypot(y - py, z - pz) <= 1.5) return 'D';   // head plates
  if (y >= 1 && ell(x, y, z, 0, 8.6, -0.4, 6.0, 7.2, 5.0) <= 1) return (z >= 2.2 && Math.abs(x) <= 3.6 && y >= 3.5 && y <= 13.5) ? 'B' : 'G';
  for (const [py, pz] of [[14, -5.4], [11, -5.8], [8, -5.6]]) if (Math.abs(x) <= 0.6 && Math.hypot(y - py, z - pz) <= 1.6) return 'D';      // back plates
  for (const sx of [-1, 1]) { if (y >= 9.5 && y <= 11.5 && Math.abs(x - sx * 5.6) <= 1.2 && z >= 1 && z <= 4.5) return 'G';             // little arms
    if (y >= 0 && y <= 3 && Math.abs(x - sx * 3.2) <= 1.8 && z >= -1.5 && z <= 2.8) return y < 1 && z > 1.6 ? 'D' : 'G' }                // legs / feet
  if (y >= 1 && z <= -3 && z >= -11) { const k = (-3 - z) / 8, r = 3.2 * (1 - k) + 0.6, cy = 4.2 - 2.4 * k; if (Math.hypot(x, y - cy) <= r) return 'G' }   // tail
  return null }
let DG = null;
export function dinoGeo() { if (DG) return DG; const vox = new Map();
  for (let x = -9; x <= 9; x++) for (let y = 0; y <= 28; y++) for (let z = -12; z <= 8; z++) { const t = dinoTag(x, y, z); if (t) vox.set(x + ',' + y + ',' + z, C(DP[t]).multiplyScalar(0.96 + 0.06 * h3(x, y, z))) }
  return DG = meshVox(vox, 1) }
export function dino3d(scale = 0.13, opt = {}) {
  const g = new THREE.Group(), geo = dinoGeo(), m = new THREE.Mesh(geo, CAT_MAT); g.add(m); g.userData.m = m;
  if (opt.outline !== false) { const o = new THREE.Mesh(geo, OUTLINE_MAT); o.scale.set(1.045, 1.03, 1.05); o.position.y = -13 * 0.03; g.add(o) }
  g.scale.setScalar(scale); return g }
export { shape, BREEDS, h3, C };
