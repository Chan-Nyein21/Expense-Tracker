import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.js', 'tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        FormData: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly'
      }
    },
    rules: {
      // Code Quality Standards (Constitutional Requirement)
      'complexity': ['error', { max: 10 }],
      'max-lines-per-function': ['error', { max: 50 }],
      'max-params': ['error', { max: 5 }],
      'max-depth': ['error', { max: 4 }],
      
      // Naming Conventions
      'camelcase': ['error', { properties: 'always' }],
      'no-underscore-dangle': ['error', { allowAfterThis: true }],
      
      // Code Style
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'comma-trailing': ['error', 'never'],
      
      // Best Practices
      'no-console': ['warn'],
      'no-debugger': ['error'],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-var': ['error'],
      'prefer-const': ['error'],
      'prefer-arrow-callback': ['error'],
      
      // Error Prevention
      'no-undef': ['error'],
      'no-implicit-globals': ['error'],
      'no-global-assign': ['error'],
      'no-eval': ['error'],
      'no-implied-eval': ['error'],
      
      // Performance
      'no-loop-func': ['error'],
      'no-new-func': ['error']
    }
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      globals: {
        // Jest globals
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        
        // Cypress globals
        cy: 'readonly',
        Cypress: 'readonly',
        context: 'readonly'
      }
    },
    rules: {
      'no-console': 'off',
      'max-lines-per-function': 'off'
    }
  }
];