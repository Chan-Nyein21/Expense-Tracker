/**
 * Contract Test: AnalyticsService Interface
 * Purpose: Test analytics calculations and insights generation
 * This test MUST FAIL until AnalyticsService is implemented
 */

import { AnalyticsService } from '../../src/services/AnalyticsService.js';
import { StorageService } from '../../src/services/StorageService.js';

describe('AnalyticsService Interface Contract', () => {
  let analyticsService;
  let storageService;

  beforeEach(() => {
    localStorage.clear();
    storageService = new StorageService();
    analyticsService = new AnalyticsService(storageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('spending summary analytics', () => {
    test('should calculate total spending for period', async () => {
      // Create test expenses
      await storageService.createExpense({
        amount: 50.00,
        description: 'Test 1',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      await storageService.createExpense({
        amount: 75.00,
        description: 'Test 2',
        date: '2025-09-20',
        categoryId: 'default-transport'
      });

      const summary = await analyticsService.getSpendingSummary({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });

      expect(summary.total).toBe(125.00);
      expect(summary.count).toBe(2);
      expect(summary.average).toBe(62.50);
      expect(summary.period).toEqual({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });
    });

    test('should calculate spending by category', async () => {
      await storageService.createExpense({
        amount: 100.00,
        description: 'Food expense',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      await storageService.createExpense({
        amount: 50.00,
        description: 'Food expense 2',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      await storageService.createExpense({
        amount: 75.00,
        description: 'Transport expense',
        date: '2025-09-21',
        categoryId: 'default-transport'
      });

      const summary = await analyticsService.getSpendingByCategory({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });

      expect(Array.isArray(summary)).toBe(true);
      expect(summary.length).toBe(2);
      
      const foodCategory = summary.find(cat => cat.categoryId === 'default-food');
      expect(foodCategory.total).toBe(150.00);
      expect(foodCategory.count).toBe(2);
      expect(foodCategory.percentage).toBe(66.67);
    });

    test('should calculate daily spending trends', async () => {
      await storageService.createExpense({
        amount: 50.00,
        description: 'Day 1',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      await storageService.createExpense({
        amount: 75.00,
        description: 'Day 2',
        date: '2025-09-20',
        categoryId: 'default-food'
      });

      const trends = await analyticsService.getDailyTrends({
        startDate: '2025-09-20',
        endDate: '2025-09-21'
      });

      expect(Array.isArray(trends)).toBe(true);
      expect(trends.length).toBe(2);
      expect(trends[0].date).toBe('2025-09-20');
      expect(trends[0].total).toBe(75.00);
      expect(trends[1].date).toBe('2025-09-21');
      expect(trends[1].total).toBe(50.00);
    });
  });

  describe('budget analytics', () => {
    test('should calculate budget vs actual spending', async () => {
      // Set budget
      await storageService.setBudget('default-food', {
        amount: 200.00,
        period: 'monthly',
        startDate: '2025-09-01'
      });

      await storageService.createExpense({
        amount: 150.00,
        description: 'Food spending',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      const budgetAnalysis = await analyticsService.getBudgetAnalysis({
        categoryId: 'default-food',
        month: '2025-09'
      });

      expect(budgetAnalysis.budgetAmount).toBe(200.00);
      expect(budgetAnalysis.spentAmount).toBe(150.00);
      expect(budgetAnalysis.remainingAmount).toBe(50.00);
      expect(budgetAnalysis.percentageUsed).toBe(75.00);
      expect(budgetAnalysis.isOverBudget).toBe(false);
    });

    test('should detect budget overruns', async () => {
      await storageService.setBudget('default-food', {
        amount: 100.00,
        period: 'monthly',
        startDate: '2025-09-01'
      });

      await storageService.createExpense({
        amount: 150.00,
        description: 'Over budget',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      const budgetAnalysis = await analyticsService.getBudgetAnalysis({
        categoryId: 'default-food',
        month: '2025-09'
      });

      expect(budgetAnalysis.isOverBudget).toBe(true);
      expect(budgetAnalysis.overageAmount).toBe(50.00);
      expect(budgetAnalysis.percentageUsed).toBe(150.00);
    });

    test('should project budget burn rate', async () => {
      await storageService.setBudget('default-food', {
        amount: 300.00,
        period: 'monthly',
        startDate: '2025-09-01'
      });

      // Create expenses for first 10 days
      for (let day = 1; day <= 10; day++) {
        await storageService.createExpense({
          amount: 10.00,
          description: `Day ${day}`,
          date: `2025-09-${day.toString().padStart(2, '0')}`,
          categoryId: 'default-food'
        });
      }

      const projection = await analyticsService.getBudgetProjection({
        categoryId: 'default-food',
        month: '2025-09'
      });

      expect(projection.dailyAverage).toBe(10.00);
      expect(projection.projectedTotal).toBe(300.00); // 30 days * 10 (September has 30 days)
      expect(projection.willExceedBudget).toBe(false); // 300 projected = 300 budget, so no exceed
      expect(projection.projectedOverage).toBe(0.00); // 300 - 300 = 0
    });
  });

  describe('insights and recommendations', () => {
    test('should generate spending insights', async () => {
      // Create varied spending pattern
      await storageService.createExpense({
        amount: 200.00,
        description: 'Large expense',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      await storageService.createExpense({
        amount: 15.00,
        description: 'Small expense',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      const insights = await analyticsService.getSpendingInsights({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });

      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
      
      const insight = insights[0];
      expect(insight.type).toBeDefined();
      expect(insight.title).toBeDefined();
      expect(insight.description).toBeDefined();
      expect(insight.priority).toBeIn(['low', 'medium', 'high']);
    });

    test('should detect unusual spending patterns', async () => {
      // Create normal spending
      for (let i = 0; i < 20; i++) {
        await storageService.createExpense({
          amount: 25.00,
          description: `Normal expense ${i}`,
          date: '2025-09-15',
          categoryId: 'default-food'
        });
      }

      // Create unusual spending
      await storageService.createExpense({
        amount: 500.00,
        description: 'Unusual large expense',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      const anomalies = await analyticsService.detectAnomalies({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });

      expect(Array.isArray(anomalies)).toBe(true);
      expect(anomalies.length).toBeGreaterThan(0);
      
      const anomaly = anomalies[0];
      expect(anomaly.type).toBe('unusual_amount');
      expect(anomaly.expense.amount).toBe(500.00);
      expect(anomaly.severity).toBeDefined();
    });

    test('should provide savings recommendations', async () => {
      // Create spending pattern that suggests savings opportunities
      for (let i = 0; i < 10; i++) {
        await storageService.createExpense({
          amount: 15.00,
          description: 'Daily coffee',
          date: `2025-09-${(i + 1).toString().padStart(2, '0')}`,
          categoryId: 'default-food'
        });
      }

      const recommendations = await analyticsService.getSavingsRecommendations({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      const recommendation = recommendations[0];
      expect(recommendation.type).toBeDefined();
      expect(recommendation.category).toBeDefined();
      expect(typeof recommendation.potentialSavings).toBe('number');
      expect(recommendation.description).toBeDefined();
    });
  });

  describe('comparative analytics', () => {
    test('should compare periods', async () => {
      // Current period
      await storageService.createExpense({
        amount: 100.00,
        description: 'Current',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      // Previous period
      await storageService.createExpense({
        amount: 80.00,
        description: 'Previous',
        date: '2025-08-21',
        categoryId: 'default-food'
      });

      const comparison = await analyticsService.comparePeriods({
        currentPeriod: {
          startDate: '2025-09-01',
          endDate: '2025-09-30'
        },
        previousPeriod: {
          startDate: '2025-08-01',
          endDate: '2025-08-31'
        }
      });

      expect(comparison.current.total).toBe(100.00);
      expect(comparison.previous.total).toBe(80.00);
      expect(comparison.change.amount).toBe(20.00);
      expect(comparison.change.percentage).toBe(25.00);
      expect(comparison.change.direction).toBe('increase');
    });

    test('should compare category performance', async () => {
      await storageService.createExpense({
        amount: 150.00,
        description: 'Food',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      await storageService.createExpense({
        amount: 50.00,
        description: 'Transport',
        date: '2025-09-21',
        categoryId: 'default-transport'
      });

      const comparison = await analyticsService.compareCategoryPerformance({
        startDate: '2025-09-01',
        endDate: '2025-09-30'
      });

      expect(Array.isArray(comparison)).toBe(true);
      expect(comparison.length).toBe(2);
      
      comparison.forEach(category => {
        expect(category.categoryId).toBeDefined();
        expect(typeof category.total).toBe('number');
        expect(typeof category.rank).toBe('number');
        expect(typeof category.percentageOfTotal).toBe('number');
      });
    });
  });

  describe('export analytics', () => {
    test('should export analytics data', async () => {
      await storageService.createExpense({
        amount: 75.00,
        description: 'Export test',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      const exportData = await analyticsService.exportAnalytics({
        startDate: '2025-09-01',
        endDate: '2025-09-30',
        format: 'json'
      });

      expect(exportData.summary).toBeDefined();
      expect(exportData.categories).toBeDefined();
      expect(exportData.trends).toBeDefined();
      expect(exportData.insights).toBeDefined();
      expect(exportData.metadata.generatedAt).toBeInstanceOf(Date);
    });

    test('should export analytics as CSV', async () => {
      const csvData = await analyticsService.exportAnalytics({
        startDate: '2025-09-01',
        endDate: '2025-09-30',
        format: 'csv'
      });

      expect(typeof csvData).toBe('string');
      expect(csvData).toContain('Date,Amount,Category,Description');
    });
  });
});