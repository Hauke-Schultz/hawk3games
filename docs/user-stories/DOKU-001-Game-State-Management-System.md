# 🎮 State Management System Documentation

## 📖 Übersicht

Das Hawk3Games State Management System basiert auf **Pinia** und bietet eine modulare, typsichere und performante Lösung für die Verwaltung des gesamten Spielzustands. Das System ist speziell für mobile Gaming optimiert und unterstützt automatisches Speichern, umfassende Analytics und eine saubere Trennung der Verantwortlichkeiten.

---

## 🏗️ Architektur

### Store-Struktur
```
src/stores/
├── index.js          # Zentrale Store-Konfiguration
├── gameStore.js      # Haupt-Game-State (Legacy/Backup)
├── levelStore.js     # Level Management & Progression
├── currencyStore.js  # Coins & Diamonds Management
└── sessionStore.js   # Aktuelle Spiel-Session
```

### Utilities
```
src/utils/
└── storage.js        # LocalStorage mit Error Handling

src/types/
└── game.js          # Type Definitionen & Factory Functions
```

---

## 🎯 Core Stores

### 1. Level Store (`useLevelStore`)

**Zweck:** Verwaltung von Level-Progression, Freischaltungen und Vervollständigung

#### State
```javascript
const levelStore = useLevelStore()

// Level Progress
levelStore.unlockedLevels     // [1, 2, 3] - Freigeschaltete Level
levelStore.completedLevels    // [1, 2] - Abgeschlossene Level
levelStore.levelStars         // { 1: 3, 2: 2 } - Sterne pro Level
levelStore.levelScores        // { 1: 1500, 2: 1200 } - Beste Scores
levelStore.currentLevel       // 3 - Aktuell ausgewähltes Level
```

#### Key Actions
```javascript
// Level Management
levelStore.unlockLevel(3)                    // Level freischalten
levelStore.completeLevel(2, 3, 1500, 45000) // Level abschließen (id, stars, score, timeMs)
levelStore.startLevel(3)                     // Level starten
levelStore.finishLevel()                     // Level beenden

// Analytics
levelStore.getLevelStatistics()              // Umfassende Level-Statistiken
levelStore.totalStars                        // Computed: Gesamte Sterne
levelStore.completionPercentage              // Computed: Fortschritt in %
```

#### Computed Properties
```javascript
levelStore.isLevelUnlocked(3)    // Boolean: Level freigeschaltet?
levelStore.isLevelCompleted(2)   // Boolean: Level abgeschlossen?
levelStore.getLevelStars(1)      // Number: Sterne für Level
levelStore.getNextLevel          // Number|null: Nächstes verfügbares Level
```

### 2. Currency Store (`useCurrencyStore`)

**Zweck:** Verwaltung von Coins, Diamonds und Transaktionen

#### State
```javascript
const currencyStore = useCurrencyStore()

// Current Balance
currencyStore.coins              // 1251 - Aktuelle Coins
currencyStore.diamonds           // 251 - Aktuelle Diamonds

// Lifetime Tracking
currencyStore.totalCoinsEarned   // 5000 - Insgesamt verdiente Coins
currencyStore.totalCoinsSpent    // 3749 - Insgesamt ausgegebene Coins
currencyStore.transactionHistory // Array der letzten 100 Transaktionen
```

#### Key Actions
```javascript
// Earning Currency
currencyStore.addCoins(100, 'level_completion', 'Level 3 completed')
currencyStore.addDiamonds(5, 'achievement', 'Perfect level')

// Spending Currency
currencyStore.spendCoins(50, 'power_up', 'Extra moves')
currencyStore.spendDiamonds(2, 'hint', 'Hint used')

// Batch Operations
currencyStore.purchaseWithMixed(100, 2, 'cosmetic', 'New skin')
currencyStore.canAfford(100, 2)  // Boolean: Kann Kosten bezahlen?

// Level Rewards (Automatic)
currencyStore.rewardForLevel(3, 3, true) // levelId, stars, bonus
```

#### Transaction System
```javascript
// Transaction Structure
{
  id: 'uuid',
  type: 'earn' | 'spend',
  amount: 100,
  currency: 'coins' | 'diamonds',
  source: 'level_completion',
  description: 'Level 3 completed',
  timestamp: 1634567890123,
  balanceAfter: 1351
}
```

### 3. Session Store (`useSessionStore`)

**Zweck:** Verwaltung der aktuellen Spiel-Session und Performance-Tracking

#### State
```javascript
const sessionStore = useSessionStore()

// Current Session
sessionStore.currentSession      // Aktuelle Session-Daten
sessionStore.isGameActive        // Boolean: Spiel aktiv?
sessionStore.gameElapsedTime     // Number: Vergangene Zeit in ms
sessionStore.formattedGameTime   // String: "02:45" Format

// Game Mechanics
sessionStore.currentCombo        // 0-∞: Aktuelle Combo
sessionStore.maxCombo           // 0-∞: Höchste Combo dieser Session
sessionStore.specialMovesUsed   // Number: Verwendete Spezial-Züge
```

#### Key Actions
```javascript
// Session Management
sessionStore.startNewSession(3)     // Neue Session für Level 3
sessionStore.pauseSession()         // Spiel pausieren
sessionStore.resumeSession()        // Spiel fortsetzen
sessionStore.completeSession(1500, true) // Session beenden (score, success)

// Game Updates
sessionStore.updateScore(1200)      // Score aktualisieren
sessionStore.addToScore(100)        // Punkte hinzufügen
sessionStore.incrementMoves()       // Zug-Counter erhöhen
sessionStore.updateCombo(5)         // Combo aktualisieren
sessionStore.useSpecialMove()       // Spezial-Zug verwenden
```

#### Analytics
```javascript
sessionStore.getSessionStatistics() // Umfassende Session-Analytics
sessionStore.getBestSession(3)      // Beste Session für Level 3
sessionStore.movesPerMinute         // Computed: Züge pro Minute
sessionStore.scorePerMove           // Computed: Punkte pro Zug
```

---

## 🔧 Utilities & Helpers

### Storage Utils (`storage.js`)

**Zweck:** Sichere LocalStorage-Operationen mit Error Handling

```javascript
import { saveToStorage, loadFromStorage } from '../utils/storage.js'

// Basic Operations
saveToStorage('gameData', { level: 3, score: 1500 })
const data = loadFromStorage('gameData') // Returns data or null

// Advanced Operations
removeFromStorage('gameData')
isStorageAvailable()                     // Boolean: LocalStorage verfügbar?
getStorageInfo()                        // Speicher-Nutzungsstatistiken
clearGameData()                         // Alle Game-Daten löschen
exportGameData()                        // JSON Export
importGameData(jsonString)              // JSON Import
```

### Game Types (`game.js`)

**Zweck:** Type Definitionen und Factory Functions

```javascript
import { 
  createDefaultPlayer,
  createDefaultGameSession,
  LEVEL_DIFFICULTY,
  GAME_STATUS 
} from '../types/game.js'

// Factory Functions
const player = createDefaultPlayer()
const session = createDefaultGameSession(3)
const level = createDefaultLevel(1, "Getting Started", "Tutorial", LEVEL_DIFFICULTY.EASY)

// Enums
LEVEL_DIFFICULTY.EASY     // 'easy'
GAME_STATUS.PLAYING      // 'playing'
ACHIEVEMENT_TYPE.SCORE_MILESTONE // 'score_milestone'
```

---

## 🎮 Integration in Vue Components

### Setup in Komponenten
```vue
<script setup>
import { useLevelStore, useCurrencyStore, useSessionStore } from '@/stores'

// Store Instanzen
const levelStore = useLevelStore()
const currencyStore = useCurrencyStore()
const sessionStore = useSessionStore()

// Reactive State
const { coins, diamonds } = storeToRefs(currencyStore)
const { currentLevel, totalStars } = storeToRefs(levelStore)
const { isGameActive, formattedGameTime } = storeToRefs(sessionStore)
</script>

<template>
  <div class="game-hud">
    <div class="currency">
      <span>{{ coins }} 💰</span>
      <span>{{ diamonds }} 💎</span>
    </div>
    <div class="level-info">
      Level {{ currentLevel }} | ⭐ {{ totalStars }}
    </div>
    <div class="session-info" v-if="isGameActive">
      Time: {{ formattedGameTime }}
    </div>
  </div>
</template>
```

### Event Handling
```vue
<script setup>
const handleLevelComplete = (stars, score, timeMs) => {
  // 1. Session beenden
  sessionStore.completeSession(score, true)
  
  // 2. Level als abgeschlossen markieren
  levelStore.completeLevel(currentLevel, stars, score, timeMs)
  
  // 3. Belohnungen vergeben
  currencyStore.rewardForLevel(currentLevel, stars)
  
  // 4. Nächstes Level freischalten (automatisch in levelStore)
}

const handleGameStart = (levelId) => {
  // 1. Level starten
  levelStore.startLevel(levelId)
  
  // 2. Session starten
  sessionStore.startNewSession(levelId)
}
</script>
```

---

## 💾 Persistence & Auto-Save

### Auto-Save System
Das System speichert automatisch bei Änderungen:

```javascript
// Debounced Auto-Save (1 Sekunde nach letzter Änderung)
watch([coins, diamonds, unlockedLevels], debouncedSave, { deep: true })

// Manuelles Speichern aller Stores
import { saveAllStores } from '@/stores'
saveAllStores() // Returns: { game: true, levels: true, currency: true }
```

### Initialization beim App-Start
```javascript
// main.js oder App.vue
import { initializeAllStores } from '@/stores'

onMounted(() => {
  initializeAllStores() // Lädt alle gespeicherten Daten
})
```

---

## 📊 Analytics & Statistics

### Level Analytics
```javascript
const stats = levelStore.getLevelStatistics()
/*
{
  totalLevels: 9,
  unlockedCount: 5,
  completedCount: 3,
  perfectCount: 1,
  totalStars: 7,
  maxPossibleStars: 27,
  completionPercentage: 33,
  difficultyBreakdown: {
    easy: { total: 3, completed: 3, percentage: 100 },
    medium: { total: 3, completed: 0, percentage: 0 }
  }
}
*/
```

### Currency Analytics
```javascript
const stats = currencyStore.getCurrencyStatistics()
/*
{
  currentBalance: { coins: 1251, diamonds: 251, totalWorth: 3761 },
  lifetime: { coinsEarned: 5000, coinsSpent: 3749, netCoins: 1251 },
  ratios: { spendingRatio: 75 },
  transactions: { total: 45, coinTransactions: 40, diamondTransactions: 5 }
}
*/
```

### Session Analytics
```javascript
const stats = sessionStore.getSessionStatistics()
/*
{
  current: { level: 3, status: 'playing', score: 1200, moves: 25 },
  history: { totalSessions: 15, completedSessions: 12, successRate: 80 },
  averages: { score: 1150, moves: 28, timeMs: 125000 },
  performance: { averageFPS: 58, movesPerMinute: 13.4 }
}
*/
```

---

## 🛠️ Development Tools

### Debug Functions
```javascript
import { 
  resetAllStores, 
  getStoreStatistics, 
  checkStoreHealth 
} from '@/stores'

// Development Helpers
currencyStore.addCheatCurrency(10000, 1000) // Cheat-Währung hinzufügen
levelStore.unlockAllLevels()                 // Alle Level freischalten
resetAllStores()                            // Komplett zurücksetzen
checkStoreHealth()                          // Gesundheitscheck
```

### Debugging im Browser
```javascript
// Stores global verfügbar machen (nur Development)
if (import.meta.env.DEV) {
  window.stores = {
    level: useLevelStore(),
    currency: useCurrencyStore(),
    session: useSessionStore()
  }
}

// Im Browser Console:
// stores.currency.addCoins(1000)
// stores.level.unlockLevel(5)
```

---

## 🎯 Best Practices

### 1. Store Usage
- **Spezialistische Stores**: Verwende den richtigen Store für die jeweilige Aufgabe
- **Computed Properties**: Nutze Computed für abgeleitete Werte
- **Actions für Mutations**: Verändere State nur über Actions
- **Error Handling**: Prüfe Rückgabewerte der Actions

### 2. Performance
- **storeToRefs()**: Nutze storeToRefs für reaktive Refs in Templates
- **Selective Watching**: Überwache nur relevante State-Teile
- **Debounced Saves**: Auto-Save ist bereits optimiert

### 3. Data Integrity
- **Validation**: Actions validieren Input-Parameter
- **Atomicity**: Verwende Batch-Operations für zusammenhängende Änderungen
- **Consistency**: State bleibt immer in konsistentem Zustand

---

## 🔄 Migration & Updates

### State Version Management
```javascript
// storage.js handled automatisch Versionskonflickte
const STORAGE_VERSION = '1.0.0'

// Bei Version-Mismatch wird gewarnt
// Migration-Logik kann hier implementiert werden
```

### Backup & Restore
```javascript
// Vollständiger Export
const backup = exportGameData()
localStorage.setItem('backup', backup)

// Vollständiger Import
const backup = localStorage.getItem('backup')
importGameData(backup)
```

---

## 🧪 Testing

### Unit Testing (Geplant)
```javascript
// Beispiel für Store-Tests
describe('LevelStore', () => {
  it('should unlock next level after completion', () => {
    const store = useLevelStore()
    store.completeLevel(1, 3, 1500)
    expect(store.isLevelUnlocked(2)).toBe(true)
  })
})
```

### Manual Testing
```javascript
// Im Browser Console verfügbare Test-Funktionen
checkStoreHealth()           // Überprüft alle Stores
getStoreStatistics()         // Zeigt umfassende Statistiken
saveAllStores()             // Testet Speicher-Funktionalität
```

---

## 📝 Nächste Schritte

### Bereits Implementiert ✅
- [x] Pinia Installation und Konfiguration
- [x] Base Game Store Structure
- [x] Level Management Store
- [x] Currency Management Store
- [x] Session Management Store
- [x] LocalStorage Utils mit Error Handling
- [x] Type Definitionen und Factory Functions
- [x] Auto-Save System mit Debouncing
- [x] Comprehensive Analytics für alle Bereiche

### Als Nächstes 🔄
- [ ] Integration mit FruitMergeGame Component
- [ ] UI Components für Currency Display
- [ ] Level Progress Visualization
- [ ] Achievement System Implementation

---

*Dokumentation erstellt am: {{date}}*  
*Version: 1.0.0*  
*State Management System: Pinia-basiert, Mobile-optimiert*