import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import { useAuthStore } from './store/AuthStore.js'

async function startApp() {
  const app = createApp(App)

  app.use(createPinia())

  const authStore = useAuthStore()
  await authStore.restoreLogin()

  app.use(router)
  app.mount('#app')
}

startApp()