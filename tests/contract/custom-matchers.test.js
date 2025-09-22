/**
 * Contract Test: Custom Jest Matchers
 * Purpose: Test custom matchers for domain-specific assertions
 * This test MUST FAIL until custom matchers are implemented
 */

import '../../../tests/utils/custom-matchers.js';

describe('Custom Jest Matchers Contract', () => {
  describe('expense validation matchers', () => {
    test('toBeValidExpense should validate expense objects', () => {
      const validExpense = {
        id: 'expense-1',
        amount: 25.50,
        description: 'Valid expense',
        date: '2025-09-21',
        categoryId: 'category-1',
        createdAt: '2025-09-21T10:00:00Z',
        updatedAt: '2025-09-21T10:00:00Z'
      };

      expect(validExpense).toBeValidExpense();
    });

    test('toBeValidExpense should reject invalid expenses', () => {
      const invalidExpense = {
        id: 'expense-1',
        amount: -25.50, // Negative amount
        description: '',  // Empty description
        date: 'invalid-date',
        categoryId: null
      };

      expect(invalidExpense).not.toBeValidExpense();
    });

    test('toHaveValidAmount should validate expense amounts', () => {
      expect({ amount: 25.50 }).toHaveValidAmount();
      expect({ amount: 0.01 }).toHaveValidAmount();
      expect({ amount: 999999.99 }).toHaveValidAmount();
      
      expect({ amount: 0 }).not.toHaveValidAmount();
      expect({ amount: -10 }).not.toHaveValidAmount();
      expect({ amount: 'invalid' }).not.toHaveValidAmount();
    });
  });

  describe('category validation matchers', () => {
    test('toBeValidCategory should validate category objects', () => {
      const validCategory = {
        id: 'category-1',
        name: 'Food',
        color: '#FF6B6B',
        icon: 'utensils',
        isDefault: false,
        createdAt: '2025-09-21T10:00:00Z',
        updatedAt: '2025-09-21T10:00:00Z'
      };

      expect(validCategory).toBeValidCategory();
    });

    test('toBeValidCategory should reject invalid categories', () => {
      const invalidCategory = {
        id: 'category-1',
        name: '', // Empty name
        color: 'invalid-color',
        icon: null,
        isDefault: 'not-boolean'
      };

      expect(invalidCategory).not.toBeValidCategory();
    });

    test('toHaveValidColor should validate hex colors', () => {
      expect({ color: '#FF6B6B' }).toHaveValidColor();
      expect({ color: '#000000' }).toHaveValidColor();
      expect({ color: '#FFFFFF' }).toHaveValidColor();
      
      expect({ color: 'red' }).not.toHaveValidColor();
      expect({ color: '#GG6B6B' }).not.toHaveValidColor();
      expect({ color: '#FF6' }).not.toHaveValidColor();
    });
  });

  describe('date validation matchers', () => {
    test('toBeValidDate should validate date strings', () => {
      expect('2025-09-21').toBeValidDate();
      expect('2025-12-31').toBeValidDate();
      expect('2020-01-01').toBeValidDate();
      
      expect('invalid-date').not.toBeValidDate();
      expect('2025-13-01').not.toBeValidDate();
      expect('2025-09-32').not.toBeValidDate();
    });

    test('toBeToday should check if date is today', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(today).toBeToday();
      
      expect('2020-01-01').not.toBeToday();
    });

    test('toBeFutureDate should check if date is in future', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      expect(tomorrowStr).toBeFutureDate();
      expect('2020-01-01').not.toBeFutureDate();
    });
  });

  describe('analytics validation matchers', () => {
    test('toBeValidSpendingSummary should validate summary objects', () => {
      const validSummary = {
        total: 1250.75,
        count: 45,
        average: 27.79,
        period: {
          startDate: '2025-09-01',
          endDate: '2025-09-30'
        }
      };

      expect(validSummary).toBeValidSpendingSummary();
    });

    test('toBeValidCategoryAnalysis should validate category analysis', () => {
      const validAnalysis = [
        {
          categoryId: 'food',
          categoryName: 'Food',
          total: 400.00,
          count: 20,
          percentage: 40.0
        }
      ];

      expect(validAnalysis).toBeValidCategoryAnalysis();
    });

    test('toBeValidInsight should validate insight objects', () => {
      const validInsight = {
        type: 'high_spending_category',
        title: 'High Food Spending',
        description: 'Your food spending is 25% higher than usual',
        priority: 'high',
        actionable: true
      };

      expect(validInsight).toBeValidInsight();
    });
  });

  describe('export data validation matchers', () => {
    test('toBeValidExportData should validate export structure', () => {
      const validExport = {
        version: '1.0.0',
        exportDate: new Date(),
        totalExpenses: 25,
        totalCategories: 8,
        data: {
          expenses: [],
          categories: [],
          settings: {}
        }
      };

      expect(validExport).toBeValidExportData();
    });

    test('toBeValidImportResult should validate import results', () => {
      const validResult = {
        success: true,
        imported: {
          expenses: 15,
          categories: 3
        },
        skipped: {
          expenses: 2,
          categories: 0
        },
        errors: []
      };

      expect(validResult).toBeValidImportResult();
    });
  });

  describe('UI component matchers', () => {
    test('toBeVisibleComponent should check component visibility', () => {
      const visibleElement = document.createElement('div');
      visibleElement.style.display = 'block';
      document.body.appendChild(visibleElement);

      expect(visibleElement).toBeVisibleComponent();

      const hiddenElement = document.createElement('div');
      hiddenElement.style.display = 'none';
      document.body.appendChild(hiddenElement);

      expect(hiddenElement).not.toBeVisibleComponent();

      document.body.removeChild(visibleElement);
      document.body.removeChild(hiddenElement);
    });

    test('toHaveAccessibleLabel should check ARIA labels', () => {
      const labeledElement = document.createElement('button');
      labeledElement.setAttribute('aria-label', 'Test button');

      expect(labeledElement).toHaveAccessibleLabel();

      const unlabeledElement = document.createElement('button');
      expect(unlabeledElement).not.toHaveAccessibleLabel();
    });

    test('toBeKeyboardNavigable should check tab accessibility', () => {
      const navigableElement = document.createElement('button');
      expect(navigableElement).toBeKeyboardNavigable();

      const nonNavigableElement = document.createElement('div');
      nonNavigableElement.tabIndex = -1;
      expect(nonNavigableElement).not.toBeKeyboardNavigable();
    });
  });

  describe('performance matchers', () => {
    test('toCompleteWithin should check execution time', async () => {
      const fastFunction = () => Promise.resolve('fast');
      const slowFunction = () => new Promise(resolve => setTimeout(() => resolve('slow'), 100));

      await expect(fastFunction()).toCompleteWithin(50);
      await expect(slowFunction()).not.toCompleteWithin(50);
    });

    test('toHaveMemoryUsageBelow should check memory consumption', () => {
      const lightweightObject = { data: 'small' };
      const heavyObject = { data: 'x'.repeat(10000) };

      expect(lightweightObject).toHaveMemoryUsageBelow(1000);
      expect(heavyObject).not.toHaveMemoryUsageBelow(1000);
    });
  });

  describe('localStorage matchers', () => {
    test('toBeStoredInLocalStorage should check storage persistence', () => {
      localStorage.setItem('test-key', 'test-value');
      expect('test-key').toBeStoredInLocalStorage();
      
      expect('non-existent-key').not.toBeStoredInLocalStorage();
      
      localStorage.removeItem('test-key');
    });

    test('toHaveStorageValue should check stored values', () => {
      localStorage.setItem('test-key', JSON.stringify({ test: 'data' }));
      
      expect('test-key').toHaveStorageValue({ test: 'data' });
      expect('test-key').not.toHaveStorageValue({ different: 'data' });
      
      localStorage.removeItem('test-key');
    });
  });
});