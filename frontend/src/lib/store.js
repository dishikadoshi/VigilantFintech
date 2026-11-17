/** Tiny pub/sub so service/plan buttons can pre-fill the contact form on the same page. */
const listeners = new Set();
export const prefill = { service: null, message: '', stamp: 0 };
export function setPrefill(p) { Object.assign(prefill, p, { stamp: Date.now() }); listeners.forEach((f) => f(prefill)); }
export function onPrefill(f) { listeners.add(f); return () => listeners.delete(f); }
