# 🎮 User Story: Game State Management System

## 📖 Story Description

**Als Spieler möchte ich, dass mein Fortschritt in FruitMerge automatisch gespeichert wird und beim nächsten Besuch verfügbar ist, damit ich nahtlos weiterspielen kann.**

---

## 🎯 Acceptance Criteria

- [ ] **AC1**: Spielfortschritt wird automatisch lokal gespeichert
- [ ] **AC2**: Levels werden basierend auf Fortschritt freigeschaltet
- [ ] **AC3**: Coins und Diamonds werden korrekt verwaltet und persistiert
- [ ] **AC4**: Sterne-System funktioniert und wird gespeichert
- [ ] **AC5**: Game Settings werden beibehalten
- [ ] **AC6**: Nahtlose Wiederherstellung beim App-Neustart

---

## 📋 Implementation Tasks

### 🏗️ Phase 1: Foundation Setup
- [ ] **T1.1**: Pinia installation und Konfiguration
- [ ] **T1.2**: Base Game Store Structure erstellen
- [ ] **T1.3**: TypeScript interfaces für State definieren
- [ ] **T1.4**: Local Storage Utils implementieren

### 🎲 Phase 2: Level Management
- [ ] **T2.1**: Level Progress Store implementieren
- [ ] **T2.2**: Level-Unlock-Logik erstellen
- [ ] **T2.3**: Sterne-System implementieren
- [ ] **T2.4**: Level Completion Handler

### 💰 Phase 3: Currency System
- [ ] **T3.1**: Coins & Diamonds Store implementieren
- [ ] **T3.2**: Reward System erstellen
- [ ] **T3.3**: Transaction History (optional)
- [ ] **T3.4**: Currency Display Components aktualisieren

### 💾 Phase 4: Persistence Layer
- [ ] **T4.1**: Auto-Save System implementieren
- [ ] **T4.2**: State Hydration beim App-Start
- [ ] **T4.3**: Migration System für Updates
- [ ] **T4.4**: Error Handling für Storage

### 🎮 Phase 5: Game Session State
- [ ] **T5.1**: Current Game State Store
- [ ] **T5.2**: Pause/Resume Funktionalität
- [ ] **T5.3**: Score Tracking System
- [ ] **T5.4**: Game Over Handling

### 🔧 Phase 6: Integration & Testing
- [ ] **T6.1**: FruitMergeGame Component Integration
- [ ] **T6.2**: State Management in Level Selection
- [ ] **T6.3**: Manual Testing aller Features
- [ ] **T6.4**: Performance Optimization

---

## 🛠️ Technical Requirements

### Dependencies
- **Pinia**: ^2.1.0 (State Management)
- **@pinia/nuxt**: Falls Nuxt verwendet wird
- **Vue 3**: Bereits vorhanden

### File Structure
```
src/
├── stores/
│   ├── index.js                 # Pinia setup
│   ├── gameStore.js            # Main game state
│   ├── levelStore.js           # Level management
│   ├── currencyStore.js        # Coins/Diamonds
│   └── sessionStore.js         # Current game session
├── utils/
│   ├── storage.js              # LocalStorage utilities
│   └── gameUtils.js            # Game helper functions
└── types/
    └── game.js                 # Type definitions
```

### State Schema
```javascript
// Game State Structure
{
  player: {
    id: string,
    name: string,
    createdAt: timestamp,
    lastPlayed: timestamp
  },
  progress: {
    unlockedLevels: number[],
    completedLevels: number[],
    levelStars: { [levelId]: number },
    totalStars: number
  },
  currency: {
    coins: number,
    diamonds: number,
    history: []
  },
  settings: {
    soundEnabled: boolean,
    musicEnabled: boolean,
    hapticEnabled: boolean
  },
  currentSession: {
    level: number,
    score: number,
    moves: number,
    startTime: timestamp,
    isPaused: boolean
  }
}
```

---

## 🎯 Current Progress

### ✅ Completed Tasks
*Keine Tasks bisher abgeschlossen*

### 🔄 In Progress
*Bereit zum Start mit T1.1*

### ⏳ Next Up
**T1.1: Pinia installation und Konfiguration**

---

## 📝 Implementation Notes

### Best Practices
- Mobile-first approach beibehalten
- English comments in source code
- Vue 3 `<script setup>` syntax verwenden
- BEM methodology für CSS
- Error boundaries für Store Operations

### Performance Considerations
- Lazy loading für große State Objects
- Debounced auto-save (nicht bei jedem State Change)
- Efficient state updates (nur changed properties)

### Testing Strategy
- Unit tests für Store Actions
- Integration tests für Storage Operations
- Manual testing auf verschiedenen Devices

---

## 🔄 Definition of Done

Ein Task ist abgeschlossen wenn:
- [ ] Code implementiert und getestet
- [ ] Funktionalität auf Mobile (480px) getestet
- [ ] Error Handling implementiert
- [ ] Documentation aktualisiert
- [ ] Code Review durchgeführt
- [ ] Integration mit bestehenden Components erfolgreich

---

## 📚 Resources & References

- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vue 3 Composition API](https://vuejs.org/api/composition-api-setup.html)
- [LocalStorage Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

*Diese User Story wird kontinuierlich aktualisiert während der Implementation.*