import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'
import { initializeAllStores } from './stores'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Mount app first
app.mount('#app')

// Initialize stores after a short delay to ensure Pinia is ready
setTimeout(async () => {
	const { initializeAllStores } = await import('./stores')
	const stores = await initializeAllStores()

	// Sicherstellen, dass Theme korrekt angewendet wird
	if (stores && stores.settingsStore) {
		stores.settingsStore.detectSystemTheme()
		console.log('🎨 Theme system initialized')
	}
}, 100)