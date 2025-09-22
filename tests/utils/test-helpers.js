/**
 * Test Setup Utilities
 * Purpose: Common setup and teardown functions for tests
 */

import { mockLocalStorage, mockChartJS, cleanupMockDOM } from './test-data.js';

// Global test setup
export const setupTestEnvironment = () => {
  // Mock DOM APIs
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));

  // Mock performance API
  global.performance = {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn()
  };

  // Mock requestAnimationFrame
  global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
  global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

  // Mock Chart.js
  global.Chart = mockChartJS.Chart;

  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });

  // Mock sessionStorage
  Object.defineProperty(window, 'sessionStorage', {
    value: mockLocalStorage,
    writable: true
  });

  // Mock window.location
  delete window.location;
  window.location = {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    reload: jest.fn()
  };

  // Mock window.navigator
  Object.defineProperty(window, 'navigator', {
    value: {
      userAgent: 'Mozilla/5.0 (Test Environment)',
      language: 'en-US',
      languages: ['en-US', 'en'],
      onLine: true
    },
    writable: true
  });

  // Mock console methods for testing
  global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  };

  // Mock Date for consistent testing
  const mockDate = new Date('2024-01-15T12:00:00.000Z');
  global.Date = jest.fn(() => mockDate);
  global.Date.now = jest.fn(() => mockDate.getTime());
  global.Date.parse = Date.parse;
  global.Date.UTC = Date.UTC;

  // Set up JSDOM for custom elements
  window.customElements = {
    define: jest.fn(),
    get: jest.fn(),
    whenDefined: jest.fn(() => Promise.resolve())
  };
};

// Storage-specific setup
export const setupStorageTest = () => {
  mockLocalStorage.clear();
  const testData = {
    expenses: [],
    categories: [],
    budgets: [],
    settings: {
      currency: 'USD',
      dateFormat: 'YYYY-MM-DD',
      theme: 'light'
    }
  };
  
  Object.keys(testData).forEach(key => {
    mockLocalStorage.setItem(key, JSON.stringify(testData[key]));
  });
  
  return testData;
};

// Component testing setup
export const setupComponentTest = (componentHtml = '') => {
  document.body.innerHTML = componentHtml;
  
  // Mock component lifecycle methods
  const mockComponent = {
    mount: jest.fn(),
    unmount: jest.fn(),
    render: jest.fn(),
    update: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  };
  
  return mockComponent;
};

// Form testing setup
export const setupFormTest = (formHtml) => {
  document.body.innerHTML = formHtml;
  
  const form = document.querySelector('form');
  const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
  
  // Mock form validation
  form.checkValidity = jest.fn(() => true);
  form.reportValidity = jest.fn(() => true);
  
  inputs.forEach(input => {
    input.checkValidity = jest.fn(() => true);
    input.setCustomValidity = jest.fn();
  });
  
  return { form, inputs };
};

// Analytics testing setup
export const setupAnalyticsTest = () => {
  const mockAnalytics = {
    track: jest.fn(),
    page: jest.fn(),
    identify: jest.fn(),
    group: jest.fn(),
    alias: jest.fn(),
    ready: jest.fn(cb => cb()),
    reset: jest.fn(),
    debug: jest.fn(),
    timeout: jest.fn(),
    load: jest.fn()
  };
  
  global.analytics = mockAnalytics;
  return mockAnalytics;
};

// Network testing setup
export const setupNetworkTest = () => {
  global.fetch = jest.fn();
  
  const mockResponse = (data, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: jest.fn(() => Promise.resolve(data)),
    text: jest.fn(() => Promise.resolve(JSON.stringify(data))),
    blob: jest.fn(() => Promise.resolve(new Blob([JSON.stringify(data)]))),
    headers: new Map([['content-type', 'application/json']])
  });
  
  return { fetch: global.fetch, mockResponse };
};

// Performance testing setup
export const setupPerformanceTest = () => {
  const marks = new Map();
  const measures = new Map();
  
  global.performance.mark = jest.fn((name) => {
    marks.set(name, performance.now());
  });
  
  global.performance.measure = jest.fn((name, startMark, endMark) => {
    const start = marks.get(startMark) || 0;
    const end = marks.get(endMark) || performance.now();
    const duration = end - start;
    measures.set(name, { name, startTime: start, duration });
  });
  
  global.performance.getEntriesByType = jest.fn((type) => {
    if (type === 'mark') return Array.from(marks.entries()).map(([name, startTime]) => ({ name, startTime }));
    if (type === 'measure') return Array.from(measures.values());
    return [];
  });
  
  global.performance.getEntriesByName = jest.fn((name) => {
    if (marks.has(name)) return [{ name, startTime: marks.get(name) }];
    if (measures.has(name)) return [measures.get(name)];
    return [];
  });
  
  return { marks, measures };
};

// Accessibility testing setup
export const setupAccessibilityTest = () => {
  // Mock screen reader announcements
  const announcements = [];
  
  const mockAriaLive = {
    announce: jest.fn((message, priority = 'polite') => {
      announcements.push({ message, priority, timestamp: Date.now() });
    }),
    clear: jest.fn(() => {
      announcements.length = 0;
    }),
    getAnnouncements: jest.fn(() => [...announcements])
  };
  
  // Mock focus management
  const focusHistory = [];
  
  const originalFocus = HTMLElement.prototype.focus;
  HTMLElement.prototype.focus = jest.fn(function() {
    focusHistory.push(this);
    return originalFocus.call(this);
  });
  
  // Mock keyboard navigation
  const keyboardEvents = [];
  
  const mockKeyboard = {
    press: jest.fn((key, element = document.activeElement) => {
      const event = new KeyboardEvent('keydown', { key });
      keyboardEvents.push({ key, element, timestamp: Date.now() });
      element.dispatchEvent(event);
      return event;
    }),
    getEvents: jest.fn(() => [...keyboardEvents])
  };
  
  return { mockAriaLive, focusHistory, mockKeyboard };
};

// Error handling setup
export const setupErrorHandling = () => {
  const errors = [];
  const warnings = [];
  
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = jest.fn((...args) => {
    errors.push({ args, timestamp: Date.now() });
    originalError(...args);
  });
  
  console.warn = jest.fn((...args) => {
    warnings.push({ args, timestamp: Date.now() });
    originalWarn(...args);
  });
  
  // Mock global error handlers
  window.addEventListener('error', (event) => {
    errors.push({ 
      type: 'error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      timestamp: Date.now()
    });
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    errors.push({
      type: 'unhandledrejection',
      reason: event.reason,
      timestamp: Date.now()
    });
  });
  
  return { errors, warnings };
};

// Cleanup utilities
export const cleanupTestEnvironment = () => {
  cleanupMockDOM();
  jest.clearAllMocks();
  jest.clearAllTimers();
  
  // Restore original methods
  if (HTMLElement.prototype.focus.mockRestore) {
    HTMLElement.prototype.focus.mockRestore();
  }
  
  // Clear event listeners
  window.removeEventListener('error');
  window.removeEventListener('unhandledrejection');
  
  // Reset global state
  delete global.analytics;
  delete global.fetch;
};

// Test data validation
export const validateTestData = (data, schema) => {
  const errors = [];
  
  Object.keys(schema).forEach(key => {
    const rule = schema[key];
    const value = data[key];
    
    if (rule.required && (value === undefined || value === null)) {
      errors.push(`${key} is required`);
    }
    
    if (value !== undefined && rule.type && typeof value !== rule.type) {
      errors.push(`${key} must be of type ${rule.type}`);
    }
    
    if (rule.validate && !rule.validate(value)) {
      errors.push(`${key} validation failed`);
    }
  });
  
  return { valid: errors.length === 0, errors };
};

// Test assertion helpers
export const assertElementVisible = (element) => {
  expect(element).toBeTruthy();
  expect(element.offsetParent).not.toBeNull();
  expect(getComputedStyle(element).display).not.toBe('none');
  expect(getComputedStyle(element).visibility).not.toBe('hidden');
};

export const assertElementAccessible = (element) => {
  expect(element).toBeTruthy();
  
  // Check for accessible name
  const hasAccessibleName = (
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.textContent.trim() ||
    (element.tagName === 'INPUT' && element.labels && element.labels.length > 0)
  );
  expect(hasAccessibleName).toBeTruthy();
  
  // Check for keyboard accessibility
  expect(element.tabIndex).not.toBe(-1);
  expect(element.disabled).not.toBe(true);
};

export const assertValidExpense = (expense) => {
  expect(expense).toBeValidExpense();
  expect(expense.amount).toBeGreaterThan(0);
  expect(expense.description.trim()).not.toBe('');
  expect(expense.date).toBeValidDate();
};

export const assertValidCategory = (category) => {
  expect(category).toBeValidCategory();
  expect(category.name.trim()).not.toBe('');
  expect(category.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
};

// Test timeout utilities
export const withTimeout = (promise, timeout = 5000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Test timeout after ${timeout}ms`)), timeout)
    )
  ]);
};

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default {
  setupTestEnvironment,
  setupStorageTest,
  setupComponentTest,
  setupFormTest,
  setupAnalyticsTest,
  setupNetworkTest,
  setupPerformanceTest,
  setupAccessibilityTest,
  setupErrorHandling,
  cleanupTestEnvironment,
  validateTestData,
  assertElementVisible,
  assertElementAccessible,
  assertValidExpense,
  assertValidCategory,
  withTimeout,
  sleep
};