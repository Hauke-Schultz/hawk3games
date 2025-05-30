# User Story 007 - Combo im GameStatsHeader visuell anzeigen

## Story
**Als** Spieler  
**möchte ich** die aktuelle Combo und verbleibende Combo-Zeit im GameStatsHeader sehen  
**damit ich** meinen Combo-Status während des Spiels verfolgen und strategisch nutzen kann.

## Akzeptanzkriterien

### Funktionale Anforderungen
- [ ] Die aktuelle Combo-Anzahl wird prominent im GameStatsHeader angezeigt
- [ ] Ein visueller Timer zeigt die verbleibende Combo-Zeit an
- [ ] Die Combo-Anzeige ist nur sichtbar, wenn eine aktive Combo vorhanden ist (Combo > 0)
- [ ] Bei Combo-Verlust verschwindet die Anzeige mit einer kurzen Animation

### Visuelle Anforderungen
- [ ] Die Combo-Anzeige wird auf der linken Seite des GameStatsHeaders positioniert
- [ ] Die Combo-Zahl ist groß und gut lesbar in der Mitte dargestellt
- [ ] Der Timer ist als kreisförmige Fortschrittsanzeige um die Combo-Zahl herum implementiert
- [ ] Der Kreis läuft im Uhrzeigersinn ab (von 100% auf 0%)
- [ ] Farben ändern sich je nach verbleibender Zeit:
    - Grün: > 66% der Zeit verbleibt
    - Orange: 33-66% der Zeit verbleibt
    - Rot: < 33% der Zeit verbleibt
- [ ] Smooth Animationen bei Combo-Erhöhung und Timer-Updates

### Technische Anforderungen
- [ ] Vue 3 Composition API mit `<script setup>`
- [ ] Reactive Updates basierend auf Game State
- [ ] Performance-optimiert (60 FPS während Animationen)
- [ ] Responsive Design für verschiedene Bildschirmgrößen

## Definition of Done
- [ ] Komponente ist implementiert und getestet
- [ ] Visuelle Tests bestanden
- [ ] Code Review abgeschlossen
- [ ] Dokumentation aktualisiert
- [ ] Integration in GameStatsHeader vollständig

## Mockup-Beschreibung
```
┌─────────────────────────────────────┐
│ GameStatsHeader                     │
│ ┌─────────┐          Score: 1250    │
│ │    🟢   │                         │
│ │  ╭─12─╮ │          Diamant: 65    │
│ │ ╱     ╲ │                         │
│ │╱ COMBO ╲│                         │
│ │╲       ╱│                         │
│ │ ╲_____╱ │                         │
│ └─────────┘                         │
└─────────────────────────────────────┘

Kreis-Timer läuft von außen ab:
🟢 Grün (100-66%)
🟠 Orange (66-33%) 
🔴 Rot (33-0%)
```

## Technische Notizen
- Combo-Daten aus dem zentralen Game Store beziehen
- Timer sollte smooth countdown ohne Frame-Drops
- Cleanup bei Component Unmount für Timer
- Accessibility: ARIA-Labels für Screen Reader