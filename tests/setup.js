// Test setup file for Jest
// This file is executed before each test file

import './utils/custom-matchers.js';

// Mock localStorage for testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};
global.localStorage = localStorageMock;

// Mock window.location
delete window.location;
window.location = {
  href: 'http://localhost/',
  origin: 'http://localhost',
  pathname: '/',
  search: '',
  hash: '',
  reload: jest.fn(),
  assign: jest.fn(),
  replace: jest.fn()
};

// Mock console methods for testing
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn()
};

// Mock Chart.js for component testing
jest.mock('chart.js', () => ({
  Chart: jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
    resize: jest.fn()
  })),
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  BarElement: jest.fn(),
  LineElement: jest.fn(),
  PointElement: jest.fn(),
  ArcElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn()
}));

// Global test utilities
global.testUtils = {
  // Create a mock DOM element
  createElement: (tag, attributes = {}) => {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  },
  
  // Wait for next tick
  nextTick: () => new Promise(resolve => setTimeout(resolve, 0)),
  
  // Trigger DOM event
  triggerEvent: (element, eventType, eventData = {}) => {
    const event = new Event(eventType, { bubbles: true, cancelable: true, ...eventData });
    element.dispatchEvent(event);
  }
};

// Extended Jest matchers
expect.extend({
  toBeValidExpense(received) {
    const pass = received && 
                 typeof received.id === 'string' &&
                 typeof received.amount === 'number' &&
                 typeof received.description === 'string' &&
                 typeof received.date === 'string' &&
                 typeof received.categoryId === 'string';
    
    return {
      message: () => `expected ${received} to be a valid expense object`,
      pass
    };
  },
  
  toBeValidCategory(received) {
    const pass = received &&
                 typeof received.id === 'string' &&
                 typeof received.name === 'string' &&
                 typeof received.color === 'string' &&
                 typeof received.icon === 'string' &&
                 typeof received.isDefault === 'boolean';
    
    return {
      message: () => `expected ${received} to be a valid category object`,
      pass
    };
  }
});