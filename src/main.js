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

// Mount app first
app.mount('#app')

// Initialize stores after a short delay to ensure Pinia is ready
setTimeout(async () => {
	const { initializeAllStores } = await import('./stores')
	initializeAllStores()
}, 100)