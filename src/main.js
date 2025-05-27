import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'
import { initializeAllStores } from './stores'

const app = createApp(App)
const pinia = createPinia()

const savedTheme = localStorage.getItem('theme') || 'light'
document.documentElement.setAttribute('data-theme', savedTheme)

app.use(pinia)

// Initialize stores after Pinia is ready
app.mount('#app')

// Initialize all game stores with saved data
initializeAllStores()