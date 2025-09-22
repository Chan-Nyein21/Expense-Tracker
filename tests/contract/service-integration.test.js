/**
 * Contract Test: Service Integration
 * Purpose: Test integration between StorageService and AnalyticsService
 * This test MUST FAIL until service integration is implemented
 */

import { StorageService } from '../../src/services/StorageService.js';
import { AnalyticsService } from '../../src/services/AnalyticsService.js';

describe('Service Integration Contract', () => {
  let storageService;
  let analyticsService;

  beforeEach(() => {
    localStorage.clear();
    storageService = new StorageService();
    analyticsService = new AnalyticsService(storageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('StorageService and AnalyticsService integration', () => {
    test('should provide real-time analytics updates when expenses change', async () => {
      // Initial state - no expenses
      const initialSummary = await analyticsService.getSpendingSummary({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });
      expect(initialSummary.total).toBe(0);
      expect(initialSummary.count).toBe(0);

      // Add expenses
      await storageService.createExpense({
        amount: 50.00,
        description: 'Lunch',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      await storageService.createExpense({
        amount: 25.00,
        description: 'Coffee',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      // Analytics should reflect changes immediately
      const updatedSummary = await analyticsService.getSpendingSummary({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });

      expect(updatedSummary.total).toBe(75.00);
      expect(updatedSummary.count).toBe(2);
      expect(updatedSummary.average).toBe(37.50);
    });

    test('should update category analytics when categories change', async () => {
      // Create custom category
      const customCategory = await storageService.createCategory({
        name: 'Custom Food',
        color: '#FF6B6B',
        icon: 'utensils',
        isDefault: false
      });

      // Add expense to custom category
      await storageService.createExpense({
        amount: 100.00,
        description: 'Custom meal',
        date: '2025-09-21',
        categoryId: customCategory.id
      });

      // Analytics should include custom category
      const categoryAnalysis = await analyticsService.getSpendingByCategory({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });

      const customCategoryData = categoryAnalysis.find(cat => cat.categoryId === customCategory.id);
      expect(customCategoryData).toBeDefined();
      expect(customCategoryData.total).toBe(100.00);
      expect(customCategoryData.categoryName).toBe('Custom Food');
    });

    test('should handle category deletion and expense reassignment', async () => {
      // Create custom category and expense
      const customCategory = await storageService.createCategory({
        name: 'Temporary',
        color: '#00FF00',
        icon: 'temp',
        isDefault: false
      });

      await storageService.createExpense({
        amount: 75.00,
        description: 'Temp expense',
        date: '2025-09-21',
        categoryId: customCategory.id
      });

      // Verify expense is in custom category
      let categoryAnalysis = await analyticsService.getSpendingByCategory({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });
      expect(categoryAnalysis.find(cat => cat.categoryId === customCategory.id)).toBeDefined();

      // Delete category (should reassign expense to "Other")
      await storageService.deleteCategory(customCategory.id);

      // Analytics should show expense moved to "Other" category
      categoryAnalysis = await analyticsService.getSpendingByCategory({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });

      const otherCategory = categoryAnalysis.find(cat => cat.categoryName === 'Other');
      expect(otherCategory).toBeDefined();
      expect(otherCategory.total).toBe(75.00);
    });

    test('should provide consistent data across multiple analytics queries', async () => {
      // Create test data
      const expenses = [
        { amount: 30.00, description: 'Expense 1', date: '2025-09-20', categoryId: 'default-food' },
        { amount: 45.00, description: 'Expense 2', date: '2025-09-21', categoryId: 'default-transport' },
        { amount: 60.00, description: 'Expense 3', date: '2025-09-22', categoryId: 'default-food' }
      ];

      for (const expense of expenses) {
        await storageService.createExpense(expense);
      }

      // Query analytics from different angles
      const summary = await analyticsService.getSpendingSummary({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });

      const categoryBreakdown = await analyticsService.getSpendingByCategory({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });

      const dailyTrends = await analyticsService.getDailyTrends({
        startDate: '2025-09-20',
        endDate: '2025-09-22'
      });

      // Verify consistency
      expect(summary.total).toBe(135.00);
      
      const totalFromCategories = categoryBreakdown.reduce((sum, cat) => sum + cat.total, 0);
      expect(totalFromCategories).toBe(135.00);

      const totalFromTrends = dailyTrends.reduce((sum, day) => sum + day.total, 0);
      expect(totalFromTrends).toBe(135.00);
    });
  });

  describe('data persistence and recovery', () => {
    test('should maintain analytics accuracy after storage recovery', async () => {
      // Create expenses
      await storageService.createExpense({
        amount: 100.00,
        description: 'Test expense',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      const originalSummary = await analyticsService.getSpendingSummary({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });

      // Simulate app restart by creating new service instances
      const newStorageService = new StorageService();
      const newAnalyticsService = new AnalyticsService(newStorageService);

      const recoveredSummary = await newAnalyticsService.getSpendingSummary({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });

      expect(recoveredSummary.total).toBe(originalSummary.total);
      expect(recoveredSummary.count).toBe(originalSummary.count);
    });

    test('should handle corrupted storage gracefully', async () => {
      // Add valid data
      await storageService.createExpense({
        amount: 50.00,
        description: 'Valid expense',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      // Corrupt localStorage data
      localStorage.setItem('expense-tracker-expenses', 'invalid-json');

      // Services should handle corruption gracefully
      const newStorageService = new StorageService();
      const newAnalyticsService = new AnalyticsService(newStorageService);

      const summary = await newAnalyticsService.getSpendingSummary({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });

      // Should return empty/default state without throwing
      expect(summary.total).toBe(0);
      expect(summary.count).toBe(0);
    });
  });

  describe('performance integration', () => {
    test('should maintain performance with large datasets', async () => {
      // Create many expenses
      const expenses = [];
      for (let i = 0; i < 1000; i++) {
        expenses.push({
          amount: Math.random() * 100,
          description: `Expense ${i}`,
          date: '2025-09-21',
          categoryId: i % 2 === 0 ? 'default-food' : 'default-transport'
        });
      }

      const startTime = performance.now();

      // Batch create expenses
      for (const expense of expenses) {
        await storageService.createExpense(expense);
      }

      const createTime = performance.now() - startTime;
      expect(createTime).toBeLessThan(5000); // 5 seconds max

      // Test analytics performance
      const analyticsStartTime = performance.now();
      
      const summary = await analyticsService.getSpendingSummary({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });

      const analyticsTime = performance.now() - analyticsStartTime;
      expect(analyticsTime).toBeLessThan(500); // 500ms max

      expect(summary.count).toBe(1000);
    });

    test('should cache analytics results for performance', async () => {
      // Add test data
      await storageService.createExpense({
        amount: 75.00,
        description: 'Cache test',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      // First query (should compute)
      const firstQueryStart = performance.now();
      const firstResult = await analyticsService.getSpendingSummary({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });
      const firstQueryTime = performance.now() - firstQueryStart;

      // Second identical query (should use cache)
      const secondQueryStart = performance.now();
      const secondResult = await analyticsService.getSpendingSummary({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });
      const secondQueryTime = performance.now() - secondQueryStart;

      expect(secondResult).toEqual(firstResult);
      expect(secondQueryTime).toBeLessThan(firstQueryTime); // Cache should be faster
    });
  });

  describe('error handling integration', () => {
    test('should handle storage errors gracefully in analytics', async () => {
      // Mock storage failure
      jest.spyOn(storageService, 'listExpenses').mockRejectedValue(new Error('Storage failure'));

      const summary = await analyticsService.getSpendingSummary({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });

      // Should return fallback data structure
      expect(summary).toBeValidSpendingSummary();
      expect(summary.total).toBe(0);
      expect(summary.error).toBeDefined();
    });

    test('should provide meaningful error messages', async () => {
      // Test various error scenarios
      const invalidDateRange = analyticsService.getSpendingSummary({
        startDate: '2025-09-30',
        endDate: '2025-09-01' // Invalid: end before start
      });

      await expect(invalidDateRange).rejects.toThrow('end date must be after start date');

      const invalidCategory = analyticsService.getSpendingByCategory({
        startDate: '2025-09-01',
        endDate: '2025-09-30',
        categoryId: 'non-existent-category'
      });

      await expect(invalidCategory).rejects.toThrow('category not found');
    });
  });

  describe('budget integration', () => {
    test('should integrate budgets with analytics', async () => {
      // Set budget
      await storageService.setBudget('default-food', {
        amount: 200.00,
        period: 'monthly',
        startDate: '2025-09-01'
      });

      // Add expenses
      await storageService.createExpense({
        amount: 150.00,
        description: 'Food expense',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      // Analytics should include budget information
      const budgetAnalysis = await analyticsService.getBudgetAnalysis({
        categoryId: 'default-food',
        month: '2025-09'
      });

      expect(budgetAnalysis.budgetAmount).toBe(200.00);
      expect(budgetAnalysis.spentAmount).toBe(150.00);
      expect(budgetAnalysis.remainingAmount).toBe(50.00);
      expect(budgetAnalysis.percentageUsed).toBe(75.00);
    });

    test('should track budget progress over time', async () => {
      await storageService.setBudget('default-food', {
        amount: 300.00,
        period: 'monthly',
        startDate: '2025-09-01'
      });

      // Add expenses over several days
      const expenses = [
        { amount: 50.00, date: '2025-09-05' },
        { amount: 75.00, date: '2025-09-10' },
        { amount: 100.00, date: '2025-09-15' },
        { amount: 50.00, date: '2025-09-20' }
      ];

      for (const expense of expenses) {
        await storageService.createExpense({
          ...expense,
          description: `Expense on ${expense.date}`,
          categoryId: 'default-food'
        });
      }

      // Get budget progression
      const progression = await analyticsService.getBudgetProgression({
        categoryId: 'default-food',
        month: '2025-09'
      });

      expect(progression.dailySpending).toHaveLength(4);
      expect(progression.cumulativeSpending[3]).toBe(275.00); // Total after 4 expenses
      expect(progression.projectedTotal).toBeGreaterThan(275.00);
    });
  });

  describe('real-time synchronization', () => {
    test('should emit events when data changes', async () => {
      const eventSpy = jest.fn();
      analyticsService.on('dataChanged', eventSpy);

      await storageService.createExpense({
        amount: 25.00,
        description: 'Event test',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      expect(eventSpy).toHaveBeenCalledWith({
        type: 'expense_created',
        data: expect.objectContaining({
          amount: 25.00,
          description: 'Event test'
        })
      });
    });

    test('should invalidate cache when underlying data changes', async () => {
      // Initial query
      await storageService.createExpense({
        amount: 50.00,
        description: 'Initial',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      const initialSummary = await analyticsService.getSpendingSummary({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });

      // Modify data
      await storageService.createExpense({
        amount: 25.00,
        description: 'Additional',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      // Next query should reflect changes (cache invalidated)
      const updatedSummary = await analyticsService.getSpendingSummary({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });

      expect(updatedSummary.total).toBe(75.00);
      expect(updatedSummary.count).toBe(2);
    });
  });
});