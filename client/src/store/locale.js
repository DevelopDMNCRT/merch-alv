import { ref } from 'vue'

// ── Shared reactive language state ────────────────────────────────────────────
export const currentLang = ref('ESP')

// ── Price formatter ───────────────────────────────────────────────────────────
// Receives a price in MXN and formats it in MXN format.
export function formatPrice(mxnPrice) {
  if (mxnPrice === null || mxnPrice === undefined) return '---'
  return `$${Number(mxnPrice).toLocaleString('es-MX')} MXN`
}
