import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'
import App from './App.vue'
import { initTheme } from './store/theme.js'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

initTheme()
