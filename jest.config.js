export default {
  // Test Environment
  testEnvironment: 'jsdom',
  
  // Module Resolution
  moduleFileExtensions: ['js', 'json'],
  transform: {
    '^.+\\.js$': ['babel-jest', { 
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
      plugins: ['@babel/plugin-transform-modules-commonjs']
    }]
  },
  
  // Test File Patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],
  
  // Coverage Configuration (Constitutional Requirement: 90% minimum)
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/main.js', // Entry point excluded
    '!src/**/*.config.js'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // Test Setup
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Module Mapping for absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1'
  },
  
  // Performance and Timeout
  testTimeout: 10000,
  maxWorkers: '50%',
  
  // Error Handling
  bail: false,
  verbose: true,
  
  // Mock Configuration
  clearMocks: true,
  restoreMocks: true,
  
  // File Watching
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/coverage/'
  ]
};