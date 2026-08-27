import { computed } from 'vue'
import { currentLang } from '../store/locale.js'
import { translations } from '../i18n/translations.js'

const DATE_LOCALES = { ESP: 'es-MX', ENG: 'en-US', FRA: 'fr-FR' }

export function useLocale() {
  const t = (path) => {
    const keys = path.split('.')
    let obj = translations[currentLang.value] ?? translations.ESP
    for (const key of keys) obj = obj?.[key]
    return typeof obj === 'string' ? obj : path
  }

  const tTag = (tag) => {
    if (!tag) return ''
    return translations[currentLang.value]?.tags?.[tag] ?? tag
  }

  const dateLocale = computed(() => DATE_LOCALES[currentLang.value] ?? 'es-MX')

  return { t, tTag, currentLang, dateLocale }
}
