# Hawk3Games

A Vue 3 mobile-first gaming platform with multiple mini-games.

## Development Guidelines

### Mobile-First Approach
- **Primary development target**: 480px width (mobile)
- Start with mobile design and progressively enhance for larger screens
- Use responsive breakpoints defined in `src/style.css`:
    - `--breakpoint-sm: 480px` (Small devices, phones)
    - `--breakpoint-md: 768px` (Medium devices, tablets)
    - `--breakpoint-lg: 992px` (Large devices, small laptops)
    - `--breakpoint-xl: 1200px` (Extra large devices, laptops and desktops)

### CSS Architecture

#### Global Variables (src/style.css)
- **All colors must be defined in global CSS variables** for both light and dark themes
- Use CSS custom properties for consistent theming across components
- Global variables include:
    - Typography scales (`--font-size-*`)
    - Spacing system (`--space-*`)
    - Color palette (light and dark theme variants)
    - Border radius values (`--border-radius-*`)
    - Focus states and shadows
    - Interactive states (`--button-*`, `--card-*`, `--level-*`)

#### SCSS with BEM Methodology
- Use **BEM (Block Element Modifier)** naming convention for CSS classes
- Structure: `.block__element--modifier`
- Examples:
    - `.game-card` (Block)
    - `.game-card__icon` (Element)
    - `.game-card__icon--large` (Modifier)
    - `.game-card--featured` (Block Modifier)

#### Shared Mixins (src/assets/mixins.scss)
- Reusable SCSS mixins for common patterns
- Card mixins: `@include card-interactive`, `@include card-layout`
- Button mixins: `@include button-base`, `@include button-ghost`
- Layout mixins: `@include flex-center`, `@include responsive-grid`
- Level/Game mixins: `@include level-unlocked`, `@include level-completed`
- Text mixins: `@include text-title`, `@include text-card-description`

#### Modular & Reusable Components
- **Maximum reusability**: Components should share styles and patterns
- Example: Level selection cards use the same base styles as GameCard
- Create shared component patterns that can be extended
- Avoid duplicating styles - extract common patterns into reusable classes or mixins
- Use shared mixins to maintain consistency across components

### Vue 3 Development
- Use `<script setup>` syntax
- Write source code comments in English
- Follow composition API patterns
- Ensure components are self-contained but share design system
- Props validation for robust component interfaces

### Component Structure Guidelines
1. **Shared Design Patterns**: Components like GameCard provide base styles that other components can extend
2. **Consistent Spacing**: Use global spacing variables (`--space-*`)
3. **Color System**: All colors from global CSS variables only
4. **Responsive Design**: Mobile-first with progressive enhancement
5. **Accessibility**: Proper ARIA labels, focus states, and semantic HTML
6. **BEM Structure**: Each component follows BEM methodology consistently
7. **Mixin Usage**: Leverage shared mixins for common patterns

### Current Components

#### Base Components
- `GameCard`: Base card component with reusable styling patterns
    - Variants: `default`, `compact`, `featured`
    - Sizes: `small`, `medium`, `large`
    - Reusable for any card-like interface

#### Game Components
- `FruitMergeGame`: Game component that extends GameCard patterns for level selection
    - Level selection using card patterns
    - Game stats display
    - Mobile-optimized interface

#### UI Components
- `ThemeSwitch`: Dark/light mode toggle
- `BottomNavigation`: Mobile navigation component

#### Layout Components
- `App.vue`: Main application layout with mobile-first responsive design

### Design System Features
- **Comprehensive Color System**: Light and dark theme support with CSS variables
- **Typography Scale**: Consistent font sizes across all components
- **Spacing System**: Standardized spacing values
- **Interactive States**: Hover, focus, and active states for all interactive elements
- **Card Patterns**: Reusable card designs for consistent UI
- **Button System**: Multiple button variants and sizes
- **Level/Game States**: Visual indicators for unlocked, locked, completed states

### Technology Stack
- **Frontend**: Vue 3 with Composition API
- **Styling**: SCSS with BEM methodology
- **Build Tool**: Vite
- **Game Physics**: Matter.js (for physics-based games)
- **Design System**: Custom CSS variables with mobile-first approach

## Getting Started

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

## Project Structure
```
src/
├── components/           # Reusable Vue components
│   ├── GameCard/        # Base card component (reusable pattern)
│   ├── FruitMergeGame/  # Main game component
│   ├── ThemeSwitch/     # Theme toggle component
│   └── BottomNavigation/ # Mobile navigation
├── assets/              # Static assets and SCSS variables/mixins
│   ├── variables.scss   # SCSS breakpoint variables
│   └── mixins.scss      # Shared SCSS mixins
├── style.css           # Global styles and CSS variables
└── main.js             # Application entry point
```

## Key Development Principles

### 1. Mobile-First Design
Always start development with 480px width in mind, then enhance for larger screens.

### 2. Reusable Patterns
Use shared mixins and component patterns to avoid code duplication and maintain consistency.

### 3. BEM Methodology
Follow strict BEM naming for predictable and maintainable CSS architecture.

### 4. Global Color System
All colors must be defined in global CSS variables with light/dark theme support.

### 5. Component Modularity
Components should be easily reusable and extendable while maintaining design consistency.