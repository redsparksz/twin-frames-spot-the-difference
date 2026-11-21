// Seeded random numbers (mulberry32) so every scene paints the same way on
// both panels and on every load: the two pictures differ only where a
// difference says so, never by chance.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function random() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pick `count` distinct items from an array, in rng order.
export function pickSome(rng, items, count) {
  const pool = items.slice();
  const out = [];
  while (pool.length > 0 && out.length < count) {
    out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  }
  return out;
}

// A stable per-scene seed from the scene id, so a scene never re-rolls.
export function sceneSeed(sceneId) {
  let h = 2166136261;
  for (const ch of sceneId) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
