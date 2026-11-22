// Orange tabby voxel cat, sitting, modelled after the "cute blocky 3D orange cat" look: fine cubes, soft shading, no outline,
// big black eyes with a white catch-light, pink nose on a white muzzle, blush, 3 forehead stripes, white chest + paws, ringed tail.
import * as THREE from 'three';
import { meshVox, C, h3 } from './cat3d.js';
const se = (x, y, z, cx, cy, cz, rx, ry, rz, p) => Math.abs((x - cx) / rx) ** p + Math.abs((y - cy) / ry) ** p + Math.abs((z - cz) / rz) ** p <= 1;
const HEAD = [0, 22, 1, 9.3, 7.0, 7.4, 3.2];
const headIn = (x, y, z) => se(x, y, z, ...HEAD);
const TAIL = [[5.5, 1.4, -6.5], [9.8, 2.4, -5.0], [12.0, 5.5, -3.0], [12.0, 9.8, -2.0], [10.5, 13.6, -2.4], [8.4, 15.2, -3.4]];
function tailU(x, y, z) { let best = 1e9, bu = 0;
  for (let i = 0; i < TAIL.length - 1; i++) { const a = TAIL[i], b = TAIL[i + 1], ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ap = [x - a[0], y - a[1], z - a[2]], L = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2;
    const u = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / L)), d = Math.hypot(ap[0] - ab[0] * u, ap[1] - ab[1] * u, ap[2] - ab[2] * u); if (d < best) { best = d; bu = (i + u) / (TAIL.length - 1) } }
  return best <= 1.75 - bu * 0.35 ? bu : -1 }
function headTag(x, y, z, o) {
  if (headIn(x, y, z)) {
    const front = !headIn(x, y, z + 1), ax = Math.abs(x);
    if (front && z > 4) {
      if (ax >= 3 && ax <= 5 && y >= 21 && y <= 23) { if (o.closed) return y === 21 ? 'eye' : 'head'; return (y === 23 && ax === (x < 0 ? 5 : 3)) ? 'hl' : 'eye' }
      if (ax >= 7 && ax <= 8 && y === 19) return 'blush';
      if ((x === 0 || x === -1) && y === 19) return 'nose';
      if ((x / 4.1) ** 2 + ((y - 18) / 2.9) ** 2 <= 1 || (ax <= 2 && y >= 15 && y <= 16)) return 'muzzle';
    }
    if ((x === -3 || x === 0 || x === 3) && y >= 25 && z > -3 && !(x === 0 && y === 25)) return 'stripe';
    if (ax >= 8 && (y === 20 || y === 22 || y === 24) && z >= 0) return 'stripe';
    return 'head';
  }
  for (const sx of [-1, 1]) { const base = 27.6, H = 6.6, ty = y - base;
    if (ty >= 0 && ty < H) { const k = ty / H, cx = sx * (5.6 + 0.7 * k), half = 3.7 * (1 - k) + 0.4, zc = 0.8, hz = 1.8 * (1 - k * 0.55) + 0.2;
      if (Math.abs(x - cx) <= half && Math.abs(z - zc) <= hz) return (z >= zc + hz - 1.0 && Math.abs(x - cx) < half - 0.9 && k < 0.78) ? 'inner' : 'ear' } }
  return null }
function tailPts(P, x, y, z, r0 = 1.75, r1 = 1.4) { let best = 1e9, bu = 0;
  for (let i = 0; i < P.length - 1; i++) { const a = P[i], b = P[i + 1], ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ap = [x - a[0], y - a[1], z - a[2]], L = ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2;
    const u = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / L)), d = Math.hypot(ap[0] - ab[0] * u, ap[1] - ab[1] * u, ap[2] - ab[2] * u); if (d < best) { best = d; bu = (i + u) / (P.length - 1) } }
  return best <= r0 - bu * (r0 - r1) ? bu : -1 }
const POSE_HEAD = { sit: [0, 0], loaf: [-10, 7], walk: [-6, 10], curl: [-14, 6] };
function tag(x, y, z, o) {
  const pose = o.pose || 'sit', [dy, dz] = POSE_HEAD[pose];
  const h = headTag(x, y - dy, z - dz, o); if (h) return h;
  if (pose === 'sit') return tagSit(x, y, z, o);
  const stripeB = (x, z) => z < 0 && Math.floor((x + 40) / 1.6) % 2 === 0;
  if (pose === 'loaf') {
    if (y >= 0 && se(x, y, z, 0, 5, -3, 6.7, 5.3, 9.6, 2.4)) { if (z >= 4.5 && y < 5) return 'bib'; return stripeB(x, z + 3) && y > 3 ? 'stripe' : 'body' }
    for (const sx of [-1, 1]) { if (y >= 0 && y <= 2.4 && Math.abs(x - sx * 3.2) <= 1.5 && z >= 7 && z <= 12.5) return 'paw'; if (y >= 0 && se(x, y, z, sx * 5.8, 3.4, -6.5, 2.6, 3.4, 4.5, 2.4)) return 'body' }
    const u = tailPts([[4.5, 1.4, -12], [8.4, 1.4, -8], [9.0, 1.4, -2], [7.8, 1.4, 4.5]], x, y, z); if (u >= 0) return Math.floor(u * 8) % 2 ? 'stripe' : 'body'; return null }
  if (pose === 'walk') {
    if (y >= 0 && se(x, y, z, 0, 9.5, -1, 5.2, 4.4, 9.4, 2.4)) { if (z >= 5 && y < 9.5 && Math.abs(x) <= 3) return 'bib'; return stripeB(x, z + 1) ? 'stripe' : 'body' }
    if (y >= 8 && se(x, y, z, 0, 12.5, 6, 3.4, 4, 4.2, 2.4)) return 'body';
    for (const sx of [-1, 1]) for (const sz of [5.5, -7.5]) if (y >= 0 && y <= 6.5 && Math.abs(x - sx * 3.2) <= 1.3 && Math.abs(z - sz) <= 1.5) return y <= 1.8 ? 'paw' : (y >= 3 && y <= 4 && sz < 0 ? 'stripe' : 'leg');
    const u = tailPts([[0, 11, -9.5], [0, 14.5, -13.2], [0, 18.5, -14], [0, 21.5, -12.6], [0, 23, -10.2]], x, y, z, 1.4, 1.1); if (u >= 0) return Math.floor(u * 8) % 2 ? 'stripe' : 'body'; return null }
  if (pose === 'curl') {
    if (y >= 0 && se(x, y, z, 0, 5.2, -1, 8.6, 5.2, 8.6, 2.4)) return stripeB(x, z + 1) && y > 2 ? 'stripe' : 'body';
    for (const sx of [-1, 1]) if (y >= 0 && y <= 2 && Math.abs(x - sx * 3) <= 1.4 && z >= 9 && z <= 11.5) return 'paw';
    const u = tailPts([[8.2, 1.7, -4], [9.3, 1.7, 2], [7, 1.7, 8], [2.5, 1.5, 11]], x, y, z, 1.6, 1.3); if (u >= 0) return Math.floor(u * 8) % 2 ? 'stripe' : 'body'; return null }
  return null }
function tagSit(x, y, z, o) {
  if (y >= 0 && se(x, y, z, 0, 9, -1, 6.7, 9.8, 6.4, 2.4)) { if (z >= 2.4 && Math.abs(x) <= 3.7 && y >= 1.5) return 'bib'; if (z < -1.2 && Math.floor((x + 40) / 1.6) % 2 === 0 && y > 2) return 'stripe'; return 'body' }
  for (const sx of [-1, 1]) {
    if (y >= 0 && y <= 9.5 && Math.abs(x - sx * 3.1) <= 1.55 && z >= 2.6 && z <= 6) { if (y <= 2.6) return 'paw'; return (y >= 4.5 && y <= 5.5) || (y >= 7.4 && y <= 8.4) ? 'stripe' : 'leg' }
    if (y >= 0 && y <= 2.4 && Math.abs(x - sx * 3.1) <= 1.55 && z > 6 && z <= 7) return 'paw';
    if (y >= 0 && se(x, y, z, sx * 5.9, 3.7, -1.4, 3.4, 4.3, 5.4, 2.4)) return (y <= 1.4 && z > 2) ? 'paw' : ((z < 0 && (y === 4 || y === 5)) ? 'stripe' : 'body');
  }
  const u = tailU(x, y, z); if (u >= 0) return (Math.floor(u * 9) % 2) ? 'stripe' : 'body';
  return null }
const COL = { body: '#f1a24c', head: '#f1a24c', leg: '#f1a24c', ear: '#f1a24c', stripe: '#d97c2b', bib: '#f8f3ea', muzzle: '#f8f3ea', paw: '#f8f3ea', nose: '#f08c9c', blush: '#f4a3ae', inner: '#f59aa8', eye: '#2a2024', hl: '#ffffff' };
export function bloopVox(o = {}) { const vox = new Map();
  for (let x = -13; x <= 13; x++) for (let y = 0; y <= 34; y++) for (let z = -17; z <= 22; z++) { const t = tag(x, y, z, o); if (!t) continue;
    vox.set(x + ',' + y + ',' + z, C(COL[t]).multiplyScalar(t === 'eye' || t === 'hl' ? 1 : 0.96 + 0.06 * h3(x, y, z))) }
  return vox }
let GEO = {}; export function bloopCat(o = {}, scale = 0.1) { const k = (o.pose || 'sit') + (o.closed ? 'c' : 'o'); if (!GEO[k]) { const vx = bloopVox(o); GEO[k] = meshVox(vx, 1); GEO[k].userData.vox = vx }
  const g = new THREE.Group(), m = new THREE.Mesh(GEO[k], new THREE.MeshLambertMaterial({ vertexColors: true })); g.add(m); g.scale.setScalar(scale); return g }
