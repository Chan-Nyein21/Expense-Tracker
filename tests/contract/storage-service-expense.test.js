/**
 * Contract Test: StorageService.createExpense()
 * Purpose: Test the expense creation interface contract
 * This test MUST FAIL until StorageService is implemented
 */

import { StorageService } from '../../src/services/StorageService.js';

describe('StorageService.createExpense() Contract', () => {
  let storageService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    storageService = new StorageService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Valid Expense Creation', () => {
    test('should create expense with valid data', async () => {
      const expenseData = {
        amount: 25.50,
        description: 'Coffee and pastry',
        date: '2025-09-21',
        categoryId: 'cat-001'
      };

      const result = await storageService.createExpense(expenseData);

      // Contract assertions
      expect(result).toBeValidExpense();
      expect(result.id).toBeDefined();
      expect(result.amount).toBe(25.50);
      expect(result.description).toBe('Coffee and pastry');
      expect(result.date).toBe('2025-09-21');
      expect(result.categoryId).toBe('cat-001');
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(new Date(result.createdAt)).toBeInstanceOf(Date);
      expect(new Date(result.updatedAt)).toBeInstanceOf(Date);
    });

    test('should generate unique IDs for multiple expenses', async () => {
      const expense1Data = {
        amount: 10.00,
        description: 'Lunch',
        date: '2025-09-21',
        categoryId: 'cat-001'
      };

      const expense2Data = {
        amount: 20.00,
        description: 'Dinner',
        date: '2025-09-21',
        categoryId: 'cat-001'
      };

      const result1 = await storageService.createExpense(expense1Data);
      const result2 = await storageService.createExpense(expense2Data);

      expect(result1.id).not.toBe(result2.id);
      expect(result1.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(result2.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    test('should persist expense to localStorage', async () => {
      const expenseData = {
        amount: 50.00,
        description: 'Groceries',
        date: '2025-09-21',
        categoryId: 'cat-001'
      };

      const result = await storageService.createExpense(expenseData);
      
      // Verify persistence
      const stored = JSON.parse(localStorage.getItem('expenses') || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0]).toEqual(result);
    });
  });

  describe('Validation Requirements', () => {
    test('should reject expense with missing amount', async () => {
      const invalidData = {
        description: 'Missing amount',
        date: '2025-09-21',
        categoryId: 'cat-001'
      };

      await expect(storageService.createExpense(invalidData))
        .rejects.toThrow('amount is required');
    });

    test('should reject expense with negative amount', async () => {
      const invalidData = {
        amount: -10.00,
        description: 'Negative amount',
        date: '2025-09-21',
        categoryId: 'cat-001'
      };

      await expect(storageService.createExpense(invalidData))
        .rejects.toThrow('amount must be positive');
    });

    test('should reject expense with amount exceeding maximum', async () => {
      const invalidData = {
        amount: 1000000.00,
        description: 'Too expensive',
        date: '2025-09-21',
        categoryId: 'cat-001'
      };

      await expect(storageService.createExpense(invalidData))
        .rejects.toThrow('amount cannot exceed 999999.99');
    });

    test('should reject expense with missing description', async () => {
      const invalidData = {
        amount: 25.50,
        date: '2025-09-21',
        categoryId: 'cat-001'
      };

      await expect(storageService.createExpense(invalidData))
        .rejects.toThrow('description is required');
    });

    test('should reject expense with empty description', async () => {
      const invalidData = {
        amount: 25.50,
        description: '',
        date: '2025-09-21',
        categoryId: 'cat-001'
      };

      await expect(storageService.createExpense(invalidData))
        .rejects.toThrow('description cannot be empty');
    });

    test('should reject expense with description too long', async () => {
      const invalidData = {
        amount: 25.50,
        description: 'x'.repeat(201), // 201 characters
        date: '2025-09-21',
        categoryId: 'cat-001'
      };

      await expect(storageService.createExpense(invalidData))
        .rejects.toThrow('description cannot exceed 200 characters');
    });

    test('should reject expense with invalid date format', async () => {
      const invalidData = {
        amount: 25.50,
        description: 'Invalid date',
        date: '2025/09/21', // Wrong format
        categoryId: 'cat-001'
      };

      await expect(storageService.createExpense(invalidData))
        .rejects.toThrow('date must be in YYYY-MM-DD format');
    });

    test('should reject expense with future date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      const invalidData = {
        amount: 25.50,
        description: 'Future expense',
        date: futureDate.toISOString().split('T')[0],
        categoryId: 'cat-001'
      };

      await expect(storageService.createExpense(invalidData))
        .rejects.toThrow('date cannot be in the future');
    });

    test('should reject expense with missing categoryId', async () => {
      const invalidData = {
        amount: 25.50,
        description: 'No category',
        date: '2025-09-21'
      };

      await expect(storageService.createExpense(invalidData))
        .rejects.toThrow('categoryId is required');
    });
  });

  describe('Performance Requirements', () => {
    test('should complete creation within 10ms', async () => {
      const expenseData = {
        amount: 25.50,
        description: 'Performance test',
        date: '2025-09-21',
        categoryId: 'cat-001'
      };

      const startTime = performance.now();
      await storageService.createExpense(expenseData);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(10);
    });
  });

  describe('Error Handling', () => {
    test('should throw ValidationError for invalid data', async () => {
      const invalidData = {
        amount: 'invalid',
        description: 'Type error',
        date: '2025-09-21',
        categoryId: 'cat-001'
      };

      await expect(storageService.createExpense(invalidData))
        .rejects.toThrow('ValidationError');
    });

    test('should provide detailed error messages', async () => {
      const invalidData = {};

      try {
        await storageService.createExpense(invalidData);
      } catch (error) {
        expect(error.message).toContain('amount');
        expect(error.name).toBe('ValidationError');
      }
    });
  });
});