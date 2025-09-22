# 💰 Expense Tracker

A modern, responsive expense tracking application built with vanilla JavaScript, featuring comprehensive form validation, error handling, and a clean user interface.

## ✨ Features

- **📝 Expense Management**: Add, edit, and track expenses with detailed form validation
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🔍 Form Validation**: Real-time validation with user-friendly error messages
- **⚡ Loading States**: Visual feedback during form submission
- **🎨 Modern UI**: Clean, intuitive interface with gradient backgrounds and animations
- **♿ Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **🧪 Comprehensive Testing**: 21/21 passing tests for the ExpenseForm component

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Chan-Nyein21/Expense-Tracker.git
   cd expense-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173`
   - The application will automatically reload when you make changes

## 📋 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Testing
```bash
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate test coverage report
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run format       # Format code with Prettier
```

### End-to-End Testing
```bash
npm run test:e2e           # Open Cypress test runner
npm run test:e2e:headless  # Run Cypress tests headlessly
```

## 🏗️ Project Structure

```
expense-tracker/
├── src/
│   ├── components/
│   │   ├── Component.js      # Base component class
│   │   └── ExpenseForm.js    # Main expense form component
│   ├── models/
│   │   └── Expense.js        # Expense data model
│   ├── services/
│   │   └── StorageService.js # Local storage management
│   ├── utils/
│   │   ├── currency.js       # Currency formatting utilities
│   │   ├── date.js          # Date formatting utilities
│   │   └── validation.js     # Form validation utilities
│   ├── styles/
│   │   ├── main.css         # Main application styles
│   │   └── design-system.css # Design system variables
│   └── main.js              # Application entry point
├── tests/
│   ├── contract/            # Contract tests
│   └── unit/               # Unit tests
├── public/                 # Static assets
├── index.html             # Main HTML file
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
└── jest.config.js         # Jest test configuration
```

## 🧪 Testing

The project includes comprehensive testing with a focus on the ExpenseForm component:

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/contract/expense-form.test.js

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch
```

### Test Categories

- **Contract Tests**: Ensure components meet their interface requirements
- **Unit Tests**: Test individual functions and utilities
- **Validation Tests**: Comprehensive form validation testing

### Current Test Status
- ✅ **ExpenseForm Component**: 21/21 tests passing
- ✅ **Validation Utilities**: 53/53 tests passing

## 🎨 Usage

### Adding an Expense

1. **Fill out the form**:
   - Enter the amount (required, must be positive)
   - Add a description (required, max 255 characters)
   - Select a date (required, cannot be future date)
   - Choose a category from the dropdown

2. **Submit the form**:
   - Click "Add Expense" button
   - Form will show loading state during submission
   - Success notification will appear
   - Form will clear automatically

### Form Validation

The application includes comprehensive validation:

- **Amount**: Must be a positive number, supports decimals
- **Description**: Required, maximum 255 characters
- **Date**: Required, cannot be a future date
- **Category**: Must select from available categories

### Error Handling

- **Real-time validation**: Errors appear as you type
- **User-friendly messages**: Clear, actionable error descriptions
- **Visual feedback**: Error states with appropriate styling
- **Accessibility**: Errors announced to screen readers

## 🔧 Configuration

### Development Server

The application uses Vite for development with the following configuration:

- **Port**: 5173 (configurable in `vite.config.js`)
- **Hot Module Replacement**: Enabled for instant updates
- **Source Maps**: Enabled for debugging

### Build Configuration

Production builds are optimized with:

- **Code splitting**: Automatic chunking for better performance
- **Minification**: Terser for JavaScript compression
- **Tree shaking**: Removes unused code
- **Asset optimization**: Optimized images and CSS

## 🌐 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **ES Modules**: Required (all modern browsers support this)

## 🛠️ Development

### Code Style

This project follows:

- **ESLint**: For code linting and style consistency
- **Prettier**: For code formatting
- **Conventional Commits**: For commit message formatting

### Architecture Patterns

- **Component-based**: Modular, reusable components
- **Event-driven**: Components communicate through events
- **Separation of concerns**: Clear separation between data, logic, and presentation
- **Progressive enhancement**: Works without JavaScript (basic functionality)

## 📦 Dependencies

### Production Dependencies
- None (vanilla JavaScript implementation)

### Development Dependencies
- **Vite**: Build tool and development server
- **Jest**: Testing framework
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Cypress**: End-to-end testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Follow the existing code style
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with vanilla JavaScript for maximum compatibility
- Tested with Jest for reliability
- Styled with modern CSS for a clean interface
- Developed with accessibility in mind

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Chan-Nyein21/Expense-Tracker/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

---

**Happy expense tracking! 💰**