import { ref, watch } from 'vue'

export const currentTheme = ref('light')

// Initialize theme from localStorage or system preference
export function initTheme() {
  const saved = localStorage.getItem('theme')
  if (saved) {
    currentTheme.value = saved
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    currentTheme.value = 'dark'
  } else {
    currentTheme.value = 'light'
  }
  // Apply without animation on init
  applyTheme(currentTheme.value, false)
}

function applyTheme(theme, animate = true) {
  const html = document.documentElement

  if (animate) {
    // Add transitioning class to enable the fast smooth transition
    html.classList.add('theme-transitioning')
  }

  if (theme === 'dark') {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }

  if (animate) {
    // Remove class after transition completes (matches 0.15s transition)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          html.classList.remove('theme-transitioning')
        }, 150)
      })
    })
  }
}

export function toggleTheme() {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
}

// Watch for changes and persist
watch(currentTheme, (newTheme) => {
  localStorage.setItem('theme', newTheme)
  applyTheme(newTheme, true)
})
