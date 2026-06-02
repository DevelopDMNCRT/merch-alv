import { computed } from 'vue'
import { currentLang } from '../store/locale.js'
import { translations } from '../i18n/translations.js'


export function useLocale() {
  const t = (path) => {
    const keys = path.split('.')
    let obj = translations.ESP
    for (const key of keys) obj = obj?.[key]
    return typeof obj === 'string' ? obj : path
  }

  const tTag = (tag) => {
    if (!tag) return ''
    return translations.ESP.tags?.[tag] ?? tag
  }

  const dateLocale = computed(() => 'es-MX')

  return { t, tTag, currentLang, dateLocale }
}
