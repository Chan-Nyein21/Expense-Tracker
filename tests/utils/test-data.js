/**
 * Mock Data Utilities for Testing
 * Purpose: Provide consistent test data across all test suites
 */

export const mockExpenses = [
  {
    id: 'exp-001',
    amount: 25.50,
    description: 'Lunch at cafe',
    date: '2024-01-15',
    categoryId: 'cat-food',
    createdAt: '2024-01-15T12:30:00.000Z',
    updatedAt: '2024-01-15T12:30:00.000Z'
  },
  {
    id: 'exp-002',
    amount: 120.00,
    description: 'Grocery shopping',
    date: '2024-01-14',
    categoryId: 'cat-food',
    createdAt: '2024-01-14T18:45:00.000Z',
    updatedAt: '2024-01-14T18:45:00.000Z'
  },
  {
    id: 'exp-003',
    amount: 45.75,
    description: 'Gas station',
    date: '2024-01-13',
    categoryId: 'cat-transportation',
    createdAt: '2024-01-13T08:15:00.000Z',
    updatedAt: '2024-01-13T08:15:00.000Z'
  },
  {
    id: 'exp-004',
    amount: 89.99,
    description: 'Monthly internet bill',
    date: '2024-01-12',
    categoryId: 'cat-utilities',
    createdAt: '2024-01-12T10:00:00.000Z',
    updatedAt: '2024-01-12T10:00:00.000Z'
  },
  {
    id: 'exp-005',
    amount: 15.50,
    description: 'Coffee and snacks',
    date: '2024-01-11',
    categoryId: 'cat-food',
    createdAt: '2024-01-11T16:20:00.000Z',
    updatedAt: '2024-01-11T16:20:00.000Z'
  }
];

export const mockCategories = [
  {
    id: 'cat-food',
    name: 'Food & Dining',
    color: '#FF6B6B',
    icon: 'restaurant',
    isDefault: true
  },
  {
    id: 'cat-transportation',
    name: 'Transportation',
    color: '#4ECDC4',
    icon: 'directions_car',
    isDefault: true
  },
  {
    id: 'cat-utilities',
    name: 'Bills & Utilities',
    color: '#45B7D1',
    icon: 'receipt_long',
    isDefault: true
  },
  {
    id: 'cat-entertainment',
    name: 'Entertainment',
    color: '#96CEB4',
    icon: 'movie',
    isDefault: true
  },
  {
    id: 'cat-shopping',
    name: 'Shopping',
    color: '#FFEAA7',
    icon: 'shopping_bag',
    isDefault: true
  },
  {
    id: 'cat-health',
    name: 'Healthcare',
    color: '#DDA0DD',
    icon: 'local_hospital',
    isDefault: true
  },
  {
    id: 'cat-custom',
    name: 'Custom Category',
    color: '#FF8A80',
    icon: 'category',
    isDefault: false
  }
];

export const mockBudgets = [
  {
    id: 'budget-001',
    categoryId: 'cat-food',
    amount: 500.00,
    period: 'monthly',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    spent: 161.00,
    remaining: 339.00,
    isActive: true
  },
  {
    id: 'budget-002',
    categoryId: 'cat-transportation',
    amount: 200.00,
    period: 'monthly',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    spent: 45.75,
    remaining: 154.25,
    isActive: true
  },
  {
    id: 'budget-003',
    categoryId: 'cat-utilities',
    amount: 150.00,
    period: 'monthly',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    spent: 89.99,
    remaining: 60.01,
    isActive: true
  }
];

export const mockInsights = [
  {
    id: 'insight-001',
    type: 'high_spending_category',
    title: 'High Food Spending',
    description: 'Your food expenses are 32% higher than last month',
    priority: 'medium',
    actionable: true,
    data: {
      categoryId: 'cat-food',
      currentAmount: 161.00,
      previousAmount: 122.00,
      increase: 39.00
    }
  },
  {
    id: 'insight-002',
    type: 'budget_warning',
    title: 'Utilities Budget Warning',
    description: 'You have spent 60% of your utilities budget',
    priority: 'high',
    actionable: true,
    data: {
      categoryId: 'cat-utilities',
      budgetAmount: 150.00,
      spentAmount: 89.99,
      percentage: 60
    }
  },
  {
    id: 'insight-003',
    type: 'savings_opportunity',
    title: 'Transportation Savings',
    description: 'Great job staying under budget on transportation',
    priority: 'low',
    actionable: false,
    data: {
      categoryId: 'cat-transportation',
      budgetAmount: 200.00,
      spentAmount: 45.75,
      savedAmount: 154.25
    }
  }
];

export const mockAnalytics = {
  spendingSummary: {
    total: 296.74,
    count: 5,
    average: 59.35,
    dailyAverage: 19.78
  },
  categoryBreakdown: [
    {
      categoryId: 'cat-food',
      categoryName: 'Food & Dining',
      total: 161.00,
      percentage: 54.2,
      count: 3
    },
    {
      categoryId: 'cat-utilities',
      categoryName: 'Bills & Utilities',
      total: 89.99,
      percentage: 30.3,
      count: 1
    },
    {
      categoryId: 'cat-transportation',
      categoryName: 'Transportation',
      total: 45.75,
      percentage: 15.4,
      count: 1
    }
  ],
  monthlyTrends: [
    { month: '2023-11', total: 428.50 },
    { month: '2023-12', total: 382.75 },
    { month: '2024-01', total: 296.74 }
  ],
  topExpenses: [
    mockExpenses[1], // $120.00 - Grocery shopping
    mockExpenses[3], // $89.99 - Internet bill
    mockExpenses[2]  // $45.75 - Gas station
  ]
};

export const mockExportData = {
  version: '1.0.0',
  exportDate: new Date('2024-01-15T15:30:00.000Z'),
  totalExpenses: 5,
  totalCategories: 6,
  data: {
    expenses: mockExpenses,
    categories: mockCategories,
    budgets: mockBudgets,
    settings: {
      currency: 'USD',
      dateFormat: 'YYYY-MM-DD',
      theme: 'light'
    }
  }
};

export const mockImportResult = {
  success: true,
  imported: {
    expenses: 3,
    categories: 2
  },
  skipped: {
    expenses: 1,
    categories: 0
  },
  errors: []
};

export const mockValidationErrors = {
  expense: {
    invalidAmount: 'Amount must be a positive number',
    missingDescription: 'Description is required',
    invalidDate: 'Date must be in YYYY-MM-DD format',
    missingCategory: 'Category is required'
  },
  category: {
    missingName: 'Category name is required',
    invalidColor: 'Color must be a valid hex code',
    duplicateName: 'Category name already exists'
  },
  budget: {
    invalidAmount: 'Budget amount must be positive',
    missingCategory: 'Category is required for budget',
    invalidPeriod: 'Budget period must be weekly, monthly, or yearly'
  }
};

export const mockApiResponses = {
  success: {
    status: 200,
    data: mockExpenses[0]
  },
  created: {
    status: 201,
    data: mockExpenses[0]
  },
  error: {
    status: 400,
    error: 'Bad Request',
    message: 'Invalid data provided'
  },
  notFound: {
    status: 404,
    error: 'Not Found',
    message: 'Resource not found'
  }
};

export const mockFormData = {
  validExpense: {
    amount: '25.50',
    description: 'Test expense',
    date: '2024-01-15',
    categoryId: 'cat-food'
  },
  invalidExpense: {
    amount: '-10',
    description: '',
    date: 'invalid-date',
    categoryId: ''
  },
  validCategory: {
    name: 'Test Category',
    color: '#FF0000',
    icon: 'test_icon'
  },
  invalidCategory: {
    name: '',
    color: 'invalid-color',
    icon: ''
  }
};

export const mockDOMElements = {
  createExpenseForm: () => {
    const form = document.createElement('form');
    form.innerHTML = `
      <input type="number" id="amount" step="0.01" required>
      <input type="text" id="description" required>
      <input type="date" id="date" required>
      <select id="categoryId" required>
        <option value="">Select category</option>
        <option value="cat-food">Food</option>
        <option value="cat-transportation">Transportation</option>
      </select>
      <button type="submit">Add Expense</button>
    `;
    return form;
  },
  
  createExpenseList: () => {
    const list = document.createElement('div');
    list.className = 'expense-list';
    list.innerHTML = mockExpenses.map(expense => `
      <div class="expense-item" data-id="${expense.id}">
        <span class="amount">$${expense.amount}</span>
        <span class="description">${expense.description}</span>
        <span class="date">${expense.date}</span>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </div>
    `).join('');
    return list;
  },

  createDashboard: () => {
    const dashboard = document.createElement('div');
    dashboard.className = 'dashboard';
    dashboard.innerHTML = `
      <div class="stats">
        <div class="stat-card">
          <span class="label">Total Spent</span>
          <span class="value">$296.74</span>
        </div>
        <div class="stat-card">
          <span class="label">Expenses</span>
          <span class="value">5</span>
        </div>
      </div>
      <div class="chart-container">
        <canvas id="expense-chart"></canvas>
      </div>
    `;
    return dashboard;
  }
};

export const mockEventHandlers = {
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  target: {
    value: '',
    checked: false,
    selectedIndex: 0
  }
};

export const mockLocalStorage = {
  data: {},
  
  getItem: jest.fn((key) => {
    return mockLocalStorage.data[key] || null;
  }),
  
  setItem: jest.fn((key, value) => {
    mockLocalStorage.data[key] = value;
  }),
  
  removeItem: jest.fn((key) => {
    delete mockLocalStorage.data[key];
  }),
  
  clear: jest.fn(() => {
    mockLocalStorage.data = {};
  }),
  
  key: jest.fn((index) => {
    return Object.keys(mockLocalStorage.data)[index] || null;
  }),
  
  get length() {
    return Object.keys(mockLocalStorage.data).length;
  }
};

export const mockChartJS = {
  Chart: jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn(),
    data: { datasets: [] },
    options: {}
  }))
};

export const mockPerformanceData = {
  loadTime: 1500,
  renderTime: 250,
  memoryUsage: 1024 * 1024, // 1MB
  networkRequests: 0,
  cacheHits: 5,
  cacheMisses: 0
};

export const mockAccessibilityData = {
  ariaLabels: ['Add expense', 'Edit expense', 'Delete expense'],
  keyboardNavigation: ['Tab', 'Enter', 'Space', 'Escape'],
  screenReaderText: 'Expense tracker application',
  colorContrast: 4.5,
  focusIndicators: true
};

// Utility functions for testing
export const createMockEvent = (type = 'click', properties = {}) => ({
  type,
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  target: { value: '', ...properties.target },
  ...properties
});

export const createMockExpense = (overrides = {}) => ({
  ...mockExpenses[0],
  id: `exp-${Date.now()}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
});

export const createMockCategory = (overrides = {}) => ({
  ...mockCategories[0],
  id: `cat-${Date.now()}`,
  ...overrides
});

export const createMockBudget = (overrides = {}) => ({
  ...mockBudgets[0],
  id: `budget-${Date.now()}`,
  ...overrides
});

export const setupMockDOM = () => {
  document.body.innerHTML = '';
  global.localStorage = mockLocalStorage;
  global.Chart = mockChartJS.Chart;
};

export const cleanupMockDOM = () => {
  document.body.innerHTML = '';
  mockLocalStorage.clear();
  jest.clearAllMocks();
};

export const waitFor = (condition, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, 10);
      }
    };
    check();
  });
};

export default {
  mockExpenses,
  mockCategories,
  mockBudgets,
  mockInsights,
  mockAnalytics,
  mockExportData,
  mockImportResult,
  mockValidationErrors,
  mockApiResponses,
  mockFormData,
  mockDOMElements,
  mockEventHandlers,
  mockLocalStorage,
  mockChartJS,
  mockPerformanceData,
  mockAccessibilityData,
  createMockEvent,
  createMockExpense,
  createMockCategory,
  createMockBudget,
  setupMockDOM,
  cleanupMockDOM,
  waitFor
};