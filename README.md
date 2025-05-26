# Hawk3Games

A Vue 3 mobile-first gaming platform with multiple mini-games.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📖 Documentation

- **[📋 ROADMAP.md](./ROADMAP.md)** - Development plans, features, and milestones
- **[📝 CHANGELOG.md](./CHANGELOG.md)** - Version history and changes

## 🎯 Development Guidelines

### Mobile-First Approach
- **Primary target**: 480px width (mobile)
- Progressive enhancement for larger screens
- Touch-friendly interactions (min 44px targets)

### Code Standards
- **Vue 3**: `<script setup>` syntax with Composition API
- **SCSS + BEM**: `.block__element--modifier` methodology
- **CSS Variables**: All colors in global variables (`src/style.css`)
- **Comments**: English language in source code
- **Modularity**: Reusable components and shared patterns

### Design System
- **Global Variables**: Typography, spacing, colors in `src/style.css`
- **Shared Mixins**: Common patterns in `src/assets/mixins.scss`
- **Theme Support**: Light/dark mode with CSS custom properties
- **Accessibility**: ARIA labels, focus states, semantic HTML

## 🏗️ Project Structure
```
src/
├── components/           # Vue components
│   ├── GameCard/        # Reusable card component
│   ├── FruitMergeGame/  # Game implementation
│   ├── ThemeSwitch/     # Theme toggle
│   └── BottomNavigation/ # Mobile navigation
├── assets/              # SCSS variables and mixins
├── style.css           # Global styles and CSS variables
└── main.js             # App entry point
```

## 🛠️ Technology Stack
- **Frontend**: Vue 3 + Vite
- **Styling**: SCSS with BEM
- **Physics**: Matter.js (planned)
- **PWA**: Service workers (planned)

## 📱 Current Features
- ✅ Mobile-first responsive design
- ✅ Light/dark theme switching
- ✅ BEM methodology implementation
- ✅ Reusable component system
- ✅ Game navigation structure
- 🔄 FruitMerge game (in development)

---

For detailed development plans see [ROADMAP.md](./ROADMAP.md)  
For version history see [CHANGELOG.md](./CHANGELOG.md)