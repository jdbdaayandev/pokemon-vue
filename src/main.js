import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css' // We'll need some CSS to overlay the HUD

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.mount('#app')