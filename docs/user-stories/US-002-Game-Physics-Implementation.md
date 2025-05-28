# 🎮 User Story: Game Physics Implementation

## 📖 Story Description

**Als Spieler möchte ich, dass FruitMerge mit echter Physik funktioniert, damit ich Früchte fallen lassen und verschmelzen kann und ein echtes Gameplay-Erlebnis habe.**

---

## 🎯 Acceptance Criteria

- [ ] **AC1**: Früchte fallen realistisch mit Gravity und Physik
- [ ] **AC2**: Touch/Click controls ermöglichen das Fallenlassen von Früchten
- [ ] **AC3**: Früchte verschmelzen automatisch bei Berührung gleicher Typen
- [ ] **AC4**: Score wird live basierend auf Verschmelzungen berechnet
- [ ] **AC5**: Game Over Detection wenn Container überläuft
- [ ] **AC6**: Smooth 60fps Performance auf mobilen Geräten

---

## 📋 Implementation Tasks

### 🏗️ Phase 1: Matter.js Setup ⏳ PENDING
- [ ] **T1.1**: Matter.js installation und Konfiguration
- [ ] **T1.2**: Physics World Setup in GamePlayArea.vue
- [ ] **T1.3**: Canvas Element Integration
- [ ] **T1.4**: Basic Physics Test (falling objects)

### 🍎 Phase 2: Fruit Objects ⏳ PENDING
- [ ] **T2.1**: Fruit Factory System implementieren
- [ ] **T2.2**: Fruit Collision Bodies erstellen
- [ ] **T2.3**: Visual Fruit Rendering (Canvas/SVG)
- [ ] **T2.4**: Fruit Type System (🍎→🍊→🍇 progression)

### 🎮 Phase 3: Game Mechanics ⏳ PENDING
- [ ] **T3.1**: Touch/Click Drop Controls implementieren
- [ ] **T3.2**: Collision Detection für Merging
- [ ] **T3.3**: Fruit Merge Logic und Animation
- [ ] **T3.4**: Container Boundaries und Game Over Detection

### 📊 Phase 4: Score Integration ⏳ PENDING
- [ ] **T4.1**: Score Calculation System
- [ ] **T4.2**: SessionStore Integration für live Updates
- [ ] **T4.3**: Combo System für aufeinanderfolgende Merges
- [ ] **T4.4**: Level Completion Logic

### 🎨 Phase 5: Visual Polish ⏳ PENDING
- [ ] **T5.1**: Fruit Sprites und Animations
- [ ] **T5.2**: Particle Effects für Merges
- [ ] **T5.3**: UI Feedback und Visual Enhancements
- [ ] **T5.4**: Mobile Touch Optimization

### 🚀 Phase 6: Performance & Testing ⏳ PENDING
- [ ] **T6.1**: Performance Optimization für Mobile
- [ ] **T6.2**: 60fps Stability Testing
- [ ] **T6.3**: Memory Management
- [ ] **T6.4**: Integration Testing mit State Management

---

## 🛠️ TECHNICAL IMPLEMENTATION PLAN

### Matter.js Physics Engine Integration

#### 🔧 **Core Dependencies**
```javascript
// Matter.js bereits in package.json verfügbar
import Matter from 'matter-js'

// Physics World Configuration
const engine = Matter.Engine.create()
const world = engine.world
const render = Matter.Render.create({
  element: gameCanvas.value,
  engine: engine,
  options: {
    width: 480,
    height: 600,
    wireframes: false,
    background: 'transparent'
  }
})
```

#### 🍎 **Fruit Object System**
```javascript
// Fruit Types with progression chain
const FRUIT_TYPES = {
  CHERRY: { id: 1, emoji: '🍒', radius: 20, nextType: 'STRAWBERRY' },
  STRAWBERRY: { id: 2, emoji: '🍓', radius: 25, nextType: 'GRAPE' },
  GRAPE: { id: 3, emoji: '🍇', radius: 30, nextType: 'ORANGE' },
  ORANGE: { id: 4, emoji: '🍊', radius: 35, nextType: 'APPLE' },
  APPLE: { id: 5, emoji: '🍎', radius: 40, nextType: 'PEAR' },
  PEAR: { id: 6, emoji: '🍐', radius: 45, nextType: 'PINEAPPLE' },
  PINEAPPLE: { id: 7, emoji: '🍍', radius: 50, nextType: 'MELON' },
  MELON: { id: 8, emoji: '🍉', radius: 55, nextType: 'COCONUT' },
  COCONUT: { id: 9, emoji: '🥥', radius: 60, nextType: null }
}

// Fruit Factory Function
const createFruit = (x, y, type) => {
  const fruitType = FRUIT_TYPES[type]
  const body = Matter.Bodies.circle(x, y, fruitType.radius, {
    restitution: 0.3,
    frictionAir: 0.01,
    render: {
      fillStyle: 'transparent'
    }
  })
  
  body.fruitType = type
  body.emoji = fruitType.emoji
  return body
}
```

#### 🎮 **Game Mechanics Implementation**
```javascript
// Collision Detection for Merging
Matter.Events.on(engine, 'collisionStart', (event) => {
  event.pairs.forEach(pair => {
    const { bodyA, bodyB } = pair
    
    if (bodyA.fruitType && bodyB.fruitType && 
        bodyA.fruitType === bodyB.fruitType) {
      // Trigger merge animation and scoring
      handleFruitMerge(bodyA, bodyB)
    }
  })
})

// Touch/Click Drop System
const handleDropFruit = (event) => {
  const rect = gameCanvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const dropY = 50 // Fixed drop height
  
  const newFruit = createFruit(x, dropY, getRandomFruitType())
  Matter.World.add(world, newFruit)
  
  // Update session store
  sessionStore.incrementMoves()
}
```

### State Management Integration ✅ READY

#### 📊 **Score System Integration**
```javascript
// Real-time Score Updates
const handleFruitMerge = (fruitA, fruitB) => {
  const fruitType = FRUIT_TYPES[fruitA.fruitType]
  const baseScore = fruitType.id * 100
  const comboMultiplier = sessionStore.currentCombo + 1
  const totalScore = baseScore * comboMultiplier
  
  // Update session store (already implemented)
  sessionStore.addToScore(totalScore)
  sessionStore.updateCombo(comboMultiplier + 1)
  
  console.log(`🎯 Merge! +${totalScore} points`)
}
```

#### 🏆 **Level Completion Integration**
```javascript
// Level Target System
const checkLevelCompletion = () => {
  const currentLevel = levelStore.currentLevel
  const levelConfig = levelStore.getLevelConfig(currentLevel)
  const currentScore = sessionStore.currentSession.score
  
  if (currentScore >= levelConfig.targetScore) {
    // Use existing store methods
    const stars = calculateStars(currentScore, levelConfig)
    levelStore.completeLevel(currentLevel, stars, currentScore, sessionStore.gameElapsedTime)
    currencyStore.rewardForLevel(currentLevel, stars)
    
    console.log(`🎉 Level ${currentLevel} completed!`)
  }
}
```

### Mobile Performance Optimization

#### 📱 **60fps Target Strategy**
- **Matter.js Performance Settings**: Optimized physics step timing
- **Canvas Rendering**: Efficient draw cycles with requestAnimationFrame
- **Memory Management**: Fruit object pooling und cleanup
- **Touch Optimization**: Debounced touch events für responsive controls

---

## 📊 INTEGRATION WITH EXISTING SYSTEMS ✅

### State Management Ready Status
- **✅ SessionStore**: Live score, moves, time tracking bereit
- **✅ LevelStore**: Level progression und completion logic bereit
- **✅ CurrencyStore**: Automatic reward system bereit
- **✅ GameStateManager**: Central orchestration component bereit

### Component Integration Plan
- **GamePlayArea.vue**: Wird erweitert mit Canvas und Physics
- **GameStateManager.vue**: Existing event handlers ready für game events
- **DebugPanel.vue**: Physics debugging tools hinzufügbar

---

## 🎯 SUCCESS METRICS

### Core Gameplay ⏳ PENDING
- [ ] Früchte fallen smooth mit realistischer Physik
- [ ] Touch controls responsive und präzise (< 100ms latency)
- [ ] Merge detection funktioniert 100% zuverlässig
- [ ] Score updates in real-time ohne lag

### Performance ⏳ PENDING
- [ ] 60fps maintained auf 480px mobile target
- [ ] Memory usage stabil (no leaks)
- [ ] Battery efficient physics calculations
- [ ] Smooth animations ohne frame drops

### Integration ⏳ PENDING
- [ ] Session data correctly tracked and persisted
- [ ] Level completion triggers work seamlessly
- [ ] Currency rewards calculated correctly
- [ ] Debug tools provide useful physics insights

---

## 🔄 DEFINITION OF DONE

- [ ] Matter.js physics engine fully integrated ⏳
- [ ] Complete fruit drop and merge mechanics working ⏳
- [ ] Touch controls optimized für mobile ⏳
- [ ] Real-time score integration mit SessionStore ⏳
- [ ] Level completion logic connected ⏳
- [ ] Performance target 60fps achieved ⏳
- [ ] Mobile testing completed successfully ⏳
- [ ] Documentation updated ⏳
- [ ] Code review passed ⏳
- [ ] Integration with existing stores verified ⏳

---

## 🎉 ACHIEVEMENTS TO UNLOCK

- [ ] **🎮 Physics Master**: Matter.js successfully integrated
- [ ] **🍎 Fruit Alchemist**: Complete merge system implemented
- [ ] **⚡ Performance Pro**: 60fps mobile performance achieved
- [ ] **🎯 Score Keeper**: Real-time scoring system working
- [ ] **📱 Touch Wizard**: Mobile controls perfectly responsive
- [ ] **🔗 Integration Hero**: Seamless store integration completed
- [ ] **🏆 Game Creator**: First playable game mechanics ready

---

## 📚 TECHNICAL RESOURCES

### Matter.js Documentation
- [Matter.js Official Docs](https://brm.io/matter-js/)
- [Matter.js Examples](https://brm.io/matter-js/demo/)
- [Performance Best Practices](https://github.com/liabru/matter-js/wiki/Performance)

### Canvas Optimization
- [Canvas Performance Tips](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- [requestAnimationFrame Guide](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)

### Mobile Touch Events
- [Touch Events API](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
- [Mobile Performance](https://web.dev/mobile-performance/)

---

## 🚀 NEXT DEVELOPMENT PHASES

Nach Abschluss dieser User Story sind folgende Phasen geplant:

### 🎨 **Phase 3: Visual Polish** (Next)
- Enhanced fruit sprites and animations
- Particle effects für dramatic merges
- UI polish und juice effects
- Audio integration

### 🏆 **Phase 4: Advanced Features** (Future)
- Power-ups und special items
- Advanced level objectives
- Achievement system expansion
- Multiplayer preparation

---

*Diese User Story baut auf dem **vollständig abgeschlossenen State Management System** auf und implementiert die ersten echten Gameplay-Mechaniken für FruitMerge.*

**Current Status**: Ready to Start 🚀  
**Prerequisites**: ✅ State Management System Complete  
**Target Completion**: Phase 2 Complete  
**Next Milestone**: Playable Game Prototype 🎮

---

## 🔗 RELATED DOCUMENTATION

- **[📝 CHANGELOG.md](../../../CHANGELOG.md)** - Will be updated with physics implementation
- **[🗺️ ROADMAP.md](../../../ROADMAP.md)** - Phase 2 tracking
- **[🤝 COLLABORATION_GUIDELINES.md](../../../COLLABORATION_GUIDELINES.md)** - Development process
- **[📋 README.md](../../../README.md)** - Updated feature documentation

**Game Physics Implementation: READY TO START** 🎯🚀