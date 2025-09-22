import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Base Configuration
    baseUrl: 'http://localhost:5173',
    supportFile: false, // Disable support file for now
    specPattern: 'tests/e2e/**/*.test.js',
    fixturesFolder: 'tests/e2e/fixtures',
    screenshotsFolder: 'tests/e2e/screenshots',
    videosFolder: 'tests/e2e/videos',
    
    // Browser Configuration
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Test Configuration
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // Video and Screenshot Settings
    video: true,
    screenshotOnRunFailure: true,
    
    // Experimental Features
    experimentalStudio: true,
    
    setupNodeEvents(on, config) {
      // Code coverage plugin
      // require('@cypress/code-coverage/task')(on, config);
      
      // Task definitions
      on('task', {
        log(message) {
          console.log(message);
          return null;
        }
      });
      
      return config;
    }
  },
  
  component: {
    devServer: {
      framework: 'vite',
      bundler: 'vite'
    },
    specPattern: 'tests/component/**/*.test.js',
    supportFile: false // Disable support file for now
  },
  
  // Environment Variables
  env: {
    COVERAGE: true,
    FAIL_FAST: false
  },
  
  // Retries
  retries: {
    runMode: 2,
    openMode: 0
  },
  
  // Chrome specific flags for headless mode
  chromeWebSecurity: false
});