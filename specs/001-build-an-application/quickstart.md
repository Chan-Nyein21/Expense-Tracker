# Quick Start Guide: Expense Tracking Application

**Project**: Expense Tracking Application  
**Technology**: HTML, CSS, JavaScript (Vanilla)  
**Target**: Developers new to the project

## Development Environment Setup

### Prerequisites
- **Node.js**: Version 18+ (for development tools)
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+
- **Text Editor**: VS Code recommended with extensions:
  - ESLint
  - Prettier
  - Live Server
  - CSS IntelliSense

### Quick Setup (5 minutes)

```bash
# Clone the repository
git clone <repository-url>
cd expense-tracker

# Install development dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### Project Structure Overview
```
expense-tracker/
├── src/                    # Source code
│   ├── components/         # UI components
│   ├── services/          # Business logic
│   ├── models/            # Data models
│   ├── utils/             # Helper functions
│   ├── styles/            # CSS modules
│   └── main.js            # App entry point
├── tests/                 # Test files
├── docs/                  # Documentation
└── public/                # Static assets
    ├── index.html
    ├── styles.css
    └── app.js
```

## Running the Application

### Development Mode
```bash
npm run dev          # Start with hot reload
npm run dev:debug    # Start with debug logging
npm run dev:test     # Start with test coverage
```

### Production Build
```bash
npm run build        # Build optimized version
npm run serve        # Serve production build
npm run deploy       # Deploy to hosting
```

### Testing
```bash
npm test             # Run all tests
npm run test:unit    # Unit tests only
npm run test:e2e     # End-to-end tests
npm run test:watch   # Watch mode
```

## Core Concepts (10-minute read)

### Application Architecture
```
User Interface (Components)
    ↓
State Management (App State)
    ↓
Services (Storage, Analytics)
    ↓
Data Layer (localStorage)
```

### Key Components
1. **ExpenseForm**: Add/edit expense entries
2. **ExpenseList**: Display and manage expenses
3. **Analytics**: Charts and spending insights
4. **CategoryManager**: Organize expense categories
5. **Settings**: User preferences and configuration

### Data Flow
```
User Action → Component → Service → Storage → State Update → UI Refresh
```

## First Development Task (30 minutes)

### Task: Add a new expense category icon

1. **Locate the Category Model**:
   ```javascript
   // src/models/Category.js
   const AVAILABLE_ICONS = [
     'restaurant', 'car', 'movie', 'home', 'shopping'
     // Add your icon here
   ];
   ```

2. **Add Icon to CSS**:
   ```css
   /* src/styles/icons.css */
   .icon-your-new-icon::before {
     content: '🆕'; /* Your emoji or icon font */
   }
   ```

3. **Test the Change**:
   ```bash
   npm run dev
   # Navigate to Categories → Add Category → Select your new icon
   ```

4. **Write a Test**:
   ```javascript
   // tests/models/Category.test.js
   test('should include new icon in available icons', () => {
     expect(AVAILABLE_ICONS).toContain('your-new-icon');
   });
   ```

## Common Development Workflows

### Adding a New Feature
1. **Create Feature Branch**: `git checkout -b feature/your-feature`
2. **Design Component**: Plan UI and data requirements
3. **Write Tests**: TDD approach with failing tests first
4. **Implement Component**: Create component with contract interface
5. **Integrate**: Wire component into application state
6. **Test**: Verify functionality and run full test suite
7. **Document**: Update relevant documentation
8. **Review**: Submit pull request for review

### Debugging Common Issues

#### Issue: Component not rendering
```javascript
// Check console for errors
console.log('Component state:', component.getState());

// Verify DOM element exists
console.log('Element:', component.getElement());

// Check if component is visible
console.log('Visible:', component.getState().visible);
```

#### Issue: Data not persisting
```javascript
// Check localStorage directly
console.log('Storage:', localStorage.getItem('expenses'));

// Verify service calls
StorageService.listExpenses().then(console.log);

// Check for storage errors
window.addEventListener('storage', console.log);
```

#### Issue: Styling not applied
```css
/* Verify CSS module imports */
@import './component.css';

/* Check BEM naming convention */
.expense-form { }
.expense-form__input { }
.expense-form--disabled { }
```

### Performance Optimization Tips

1. **Bundle Size**: Monitor with `npm run analyze`
2. **Memory Usage**: Use browser DevTools Memory tab
3. **Rendering**: Enable React DevTools Profiler equivalent
4. **Storage**: Limit localStorage to <5MB total

## Key Configuration Files

### package.json
```json
{
  "scripts": {
    "dev": "vite serve",
    "build": "vite build",
    "test": "jest",
    "lint": "eslint src/"
  },
  "dependencies": {
    "chart.js": "^4.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "jest": "^29.0.0",
    "eslint": "^8.0.0"
  }
}
```

### vite.config.js
```javascript
export default {
  root: 'src',
  build: {
    outDir: '../dist',
    target: 'es2020'
  },
  server: {
    port: 3000
  }
};
```

### .eslintrc.js
```javascript
module.exports = {
  env: { browser: true, es2020: true },
  extends: ['eslint:recommended'],
  rules: {
    'no-console': 'warn',
    'complexity': ['error', 10]
  }
};
```

## Helpful Resources

### Documentation
- [Architecture Overview](./architecture.md)
- [API Documentation](./api.md)
- [Component Guide](./components.md)
- [Testing Guide](./testing.md)

### Development Tools
- **Chrome DevTools**: Application → Local Storage
- **VS Code**: Install recommended extensions
- **Git Hooks**: Pre-commit linting and testing
- **NPM Scripts**: See package.json for all available commands

### Getting Help
1. **Check Documentation**: Start with relevant .md files
2. **Search Issues**: Look for similar problems in GitHub issues
3. **Run Tests**: `npm test` to identify breaking changes
4. **Ask Team**: Use project communication channels

## Next Steps

After completing the quick start:

1. **Read Architecture Documentation**: Understand component relationships
2. **Explore Test Suite**: Learn testing patterns and expectations
3. **Review Pull Requests**: See how features are typically implemented
4. **Pick Up First Issue**: Look for "good first issue" labels
5. **Set Up IDE**: Configure debugging and productivity tools

This guide gets you productive quickly while providing paths to deeper understanding of the expense tracking application architecture and development practices.