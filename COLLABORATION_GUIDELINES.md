# 🤝 Collaboration Guidelines

## 📋 Working Process

### 1. Task Confirmation Protocol
- **Before any action**: Claude must clearly state what task will be performed
- **Wait for confirmation**: User must confirm the task before Claude proceeds
- **Purpose**: Prevents incorrect implementations and ensures alignment

### 2. Code Modification Approach

#### Small Changes
- **Show only specific lines** that need modification
- **Don't show**: Complete file contents for minor changes

#### Example Format for Line Changes:
```javascript
// File: src/components/Example/Example.vue
// Line 15:
const isActive = ref(false) // → 
const isActive = ref(true)

// Line 23: 
background-color: red; // →
background-color: var(--accent-color);
```

#### Large Changes
- **Show complete file** only when modifications are extensive
- **Threshold**: More than 20% of file content or structural changes

#### Example Format for Line Changes:
```
File: src/components/Example/Example.vue
Line 15: const isActive = ref(false) → const isActive = ref(true)
Line 23: background-color: red; → background-color: var(--accent-color);
```

### 3. Incremental Development
- **Small steps**: Make changes in digestible chunks
- **Pause for implementation**: Wait for user to implement changes before continuing
- **Avoid overwhelm**: Don't present too many modifications at once
- **Iterative approach**: Build features piece by piece

## 🛠️ Technical Preferences

### Code Standards
- **Vue 3**: Use `<script setup>` syntax with Composition API
- **Comments**: Always write source code comments in English
- **SCSS + BEM**: Follow BEM methodology for CSS class naming
- **Mobile-first**: 480px primary target with progressive enhancement
- **Media Queries**: Write within respective BEM blocks using `@media (min-width: vars.$breakpoint-md)` format
- **SCSS Variables**: Import with `@use './assets/variables.scss' as vars;`

### Project Structure
- **Components**: Modular, reusable Vue components
- **Styling**: Global CSS variables + SCSS mixins
- **Documentation**: Keep README, CHANGELOG, and ROADMAP updated

## 📝 Communication Style

### Task Planning
1. **Describe the goal** clearly
2. **List specific steps** to achieve it
3. **Wait for confirmation** before proceeding
4. **Execute one step at a time**

### Code Review Process
1. **Present changes** in clear, numbered steps
2. **Show before/after** for modified lines
3. **Explain the reasoning** behind changes
4. **Pause for implementation** and testing

### Progress Tracking
- **Update documentation** when adding features
- **Follow semantic versioning** for releases
- **Maintain CHANGELOG.md** with all changes
- **Update ROADMAP.md** as features are completed

## 🎯 Quality Standards

### Before Implementation
- [ ] Task clearly defined and confirmed
- [ ] Changes broken into manageable steps
- [ ] Code follows project conventions
- [ ] Documentation updates planned

### During Implementation
- [ ] One feature/change at a time
- [ ] Clear line-by-line modifications
- [ ] Proper error handling considered
- [ ] Mobile-first approach maintained

### After Implementation
- [ ] Feature tested and working
- [ ] Documentation updated
- [ ] CHANGELOG.md entry added
- [ ] Ready for next iteration

## 🔄 Example Workflow

1. **User Request**: "I want to add a new button to the header"
2. **Claude Response**: "I want to add a new button to the app header with icon and hover states. This involves modifying App.vue lines 25-30 and adding new CSS classes. Should I proceed?"
3. **User Confirmation**: "Yes, go ahead"
4. **Claude Implementation**: Shows specific line changes
5. **User Implementation**: Implements the changes
6. **Next Step**: Claude asks if ready for next modification or testing

## 📊 Success Metrics

- **Clear communication**: No confusion about what will be changed
- **Efficient development**: Changes implemented correctly on first try
- **Maintainable code**: Following established patterns and conventions
- **Progressive enhancement**: Features built incrementally and tested

---

*This document ensures efficient collaboration and high-quality code development for the Hawk3Games project.*