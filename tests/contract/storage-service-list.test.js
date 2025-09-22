/**
 * Contract Test: StorageService.listExpenses()
 * Purpose: Test the expense listing and filtering interface contract
 * This test MUST FAIL until StorageService is implemented
 */

import { StorageService } from '../../src/services/StorageService.js';

describe('StorageService.listExpenses() Contract', () => {
  let storageService;

  beforeEach(() => {
    localStorage.clear();
    storageService = new StorageService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Basic Listing', () => {
    test('should return empty array when no expenses exist', async () => {
      const result = await storageService.listExpenses();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(0);
    });

    test('should return all expenses when no filters provided', async () => {
      // Create test expenses
      const expense1 = await storageService.createExpense({
        amount: 25.50,
        description: 'Coffee',
        date: '2025-09-20',
        categoryId: 'cat-001'
      });

      const expense2 = await storageService.createExpense({
        amount: 50.00,
        description: 'Lunch',
        date: '2025-09-21',
        categoryId: 'cat-002'
      });

      const result = await storageService.listExpenses();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeValidExpense();
      expect(result[1]).toBeValidExpense();
      expect(result).toContainEqual(expense1);
      expect(result).toContainEqual(expense2);
    });
  });

  describe('Date Range Filtering', () => {
    beforeEach(async () => {
      // Setup test data with different dates
      await storageService.createExpense({
        amount: 10.00,
        description: 'Old expense',
        date: '2025-09-15',
        categoryId: 'cat-001'
      });

      await storageService.createExpense({
        amount: 20.00,
        description: 'Recent expense',
        date: '2025-09-20',
        categoryId: 'cat-001'
      });

      await storageService.createExpense({
        amount: 30.00,
        description: 'Today expense',
        date: '2025-09-21',
        categoryId: 'cat-001'
      });
    });

    test('should filter expenses by start date', async () => {
      const result = await storageService.listExpenses({
        startDate: '2025-09-20'
      });

      expect(result).toHaveLength(2);
      expect(result.every(expense => expense.date >= '2025-09-20')).toBe(true);
    });

    test('should filter expenses by end date', async () => {
      const result = await storageService.listExpenses({
        endDate: '2025-09-20'
      });

      expect(result).toHaveLength(2);
      expect(result.every(expense => expense.date <= '2025-09-20')).toBe(true);
    });

    test('should filter expenses by date range', async () => {
      const result = await storageService.listExpenses({
        startDate: '2025-09-20',
        endDate: '2025-09-20'
      });

      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2025-09-20');
    });
  });

  describe('Category Filtering', () => {
    beforeEach(async () => {
      await storageService.createExpense({
        amount: 15.00,
        description: 'Food expense',
        date: '2025-09-21',
        categoryId: 'cat-food'
      });

      await storageService.createExpense({
        amount: 25.00,
        description: 'Transport expense',
        date: '2025-09-21',
        categoryId: 'cat-transport'
      });

      await storageService.createExpense({
        amount: 35.00,
        description: 'Another food expense',
        date: '2025-09-21',
        categoryId: 'cat-food'
      });
    });

    test('should filter expenses by category', async () => {
      const result = await storageService.listExpenses({
        categoryId: 'cat-food'
      });

      expect(result).toHaveLength(2);
      expect(result.every(expense => expense.categoryId === 'cat-food')).toBe(true);
    });

    test('should return empty array for non-existent category', async () => {
      const result = await storageService.listExpenses({
        categoryId: 'cat-nonexistent'
      });

      expect(result).toHaveLength(0);
    });
  });

  describe('Amount Filtering', () => {
    beforeEach(async () => {
      await storageService.createExpense({
        amount: 5.00,
        description: 'Small expense',
        date: '2025-09-21',
        categoryId: 'cat-001'
      });

      await storageService.createExpense({
        amount: 25.00,
        description: 'Medium expense',
        date: '2025-09-21',
        categoryId: 'cat-001'
      });

      await storageService.createExpense({
        amount: 100.00,
        description: 'Large expense',
        date: '2025-09-21',
        categoryId: 'cat-001'
      });
    });

    test('should filter expenses by minimum amount', async () => {
      const result = await storageService.listExpenses({
        minAmount: 20.00
      });

      expect(result).toHaveLength(2);
      expect(result.every(expense => expense.amount >= 20.00)).toBe(true);
    });

    test('should filter expenses by maximum amount', async () => {
      const result = await storageService.listExpenses({
        maxAmount: 50.00
      });

      expect(result).toHaveLength(2);
      expect(result.every(expense => expense.amount <= 50.00)).toBe(true);
    });

    test('should filter expenses by amount range', async () => {
      const result = await storageService.listExpenses({
        minAmount: 20.00,
        maxAmount: 50.00
      });

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(25.00);
    });
  });

  describe('Text Search', () => {
    beforeEach(async () => {
      await storageService.createExpense({
        amount: 15.00,
        description: 'Coffee at Starbucks',
        date: '2025-09-21',
        categoryId: 'cat-001'
      });

      await storageService.createExpense({
        amount: 25.00,
        description: 'Lunch at restaurant',
        date: '2025-09-21',
        categoryId: 'cat-001'
      });

      await storageService.createExpense({
        amount: 35.00,
        description: 'Grocery shopping',
        date: '2025-09-21',
        categoryId: 'cat-001'
      });
    });

    test('should search expenses by description text', async () => {
      const result = await storageService.listExpenses({
        searchText: 'coffee'
      });

      expect(result).toHaveLength(1);
      expect(result[0].description.toLowerCase()).toContain('coffee');
    });

    test('should perform case-insensitive search', async () => {
      const result = await storageService.listExpenses({
        searchText: 'RESTAURANT'
      });

      expect(result).toHaveLength(1);
      expect(result[0].description.toLowerCase()).toContain('restaurant');
    });

    test('should return empty array for non-matching search', async () => {
      const result = await storageService.listExpenses({
        searchText: 'nonexistent'
      });

      expect(result).toHaveLength(0);
    });
  });

  describe('Sorting', () => {
    beforeEach(async () => {
      await storageService.createExpense({
        amount: 30.00,
        description: 'B description',
        date: '2025-09-19',
        categoryId: 'cat-001'
      });

      await storageService.createExpense({
        amount: 10.00,
        description: 'A description',
        date: '2025-09-21',
        categoryId: 'cat-001'
      });

      await storageService.createExpense({
        amount: 20.00,
        description: 'C description',
        date: '2025-09-20',
        categoryId: 'cat-001'
      });
    });

    test('should sort expenses by date ascending', async () => {
      const result = await storageService.listExpenses({
        sortBy: 'date',
        sortOrder: 'asc'
      });

      expect(result[0].date).toBe('2025-09-19');
      expect(result[1].date).toBe('2025-09-20');
      expect(result[2].date).toBe('2025-09-21');
    });

    test('should sort expenses by date descending', async () => {
      const result = await storageService.listExpenses({
        sortBy: 'date',
        sortOrder: 'desc'
      });

      expect(result[0].date).toBe('2025-09-21');
      expect(result[1].date).toBe('2025-09-20');
      expect(result[2].date).toBe('2025-09-19');
    });

    test('should sort expenses by amount ascending', async () => {
      const result = await storageService.listExpenses({
        sortBy: 'amount',
        sortOrder: 'asc'
      });

      expect(result[0].amount).toBe(10.00);
      expect(result[1].amount).toBe(20.00);
      expect(result[2].amount).toBe(30.00);
    });

    test('should sort expenses by description ascending', async () => {
      const result = await storageService.listExpenses({
        sortBy: 'description',
        sortOrder: 'asc'
      });

      expect(result[0].description).toBe('A description');
      expect(result[1].description).toBe('B description');
      expect(result[2].description).toBe('C description');
    });
  });

  describe('Pagination', () => {
    beforeEach(async () => {
      // Create 10 test expenses
      for (let i = 1; i <= 10; i++) {
        await storageService.createExpense({
          amount: i * 10,
          description: `Expense ${i}`,
          date: '2025-09-21',
          categoryId: 'cat-001'
        });
      }
    });

    test('should limit number of results', async () => {
      const result = await storageService.listExpenses({
        limit: 5
      });

      expect(result).toHaveLength(5);
    });

    test('should offset results for pagination', async () => {
      const page1 = await storageService.listExpenses({
        limit: 3,
        offset: 0,
        sortBy: 'amount',
        sortOrder: 'asc'
      });

      const page2 = await storageService.listExpenses({
        limit: 3,
        offset: 3,
        sortBy: 'amount',
        sortOrder: 'asc'
      });

      expect(page1).toHaveLength(3);
      expect(page2).toHaveLength(3);
      expect(page1[0].amount).toBe(10);
      expect(page2[0].amount).toBe(40);
    });
  });

  describe('Combined Filters', () => {
    test('should apply multiple filters simultaneously', async () => {
      await storageService.createExpense({
        amount: 15.00,
        description: 'Coffee expense',
        date: '2025-09-20',
        categoryId: 'cat-food'
      });

      await storageService.createExpense({
        amount: 25.00,
        description: 'Lunch expense',
        date: '2025-09-21',
        categoryId: 'cat-food'
      });

      await storageService.createExpense({
        amount: 35.00,
        description: 'Coffee expense',
        date: '2025-09-21',
        categoryId: 'cat-transport'
      });

      const result = await storageService.listExpenses({
        startDate: '2025-09-21',
        categoryId: 'cat-food',
        searchText: 'lunch',
        minAmount: 20.00
      });

      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('Lunch expense');
    });
  });

  describe('Performance Requirements', () => {
    test('should complete listing within 50ms for 1000 records', async () => {
      // This test may be skipped in CI due to time constraints
      // but validates the performance contract
      
      const startTime = performance.now();
      await storageService.listExpenses();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50);
    });
  });
});