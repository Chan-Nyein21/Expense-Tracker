/**
 * Contract Test: Dashboard Component
 * Purpose: Test dashboard UI component with analytics display
 * This test MUST FAIL until Dashboard component is implemented
 */

import { Dashboard } from '../../src/components/Dashboard.js';

describe('Dashboard Component Contract', () => {
  let container;
  let dashboard;
  let mockAnalyticsService;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    mockAnalyticsService = {
      getSpendingSummary: jest.fn(),
      getSpendingByCategory: jest.fn(),
      getDailyTrends: jest.fn(),
      getBudgetAnalysis: jest.fn(),
      getSpendingInsights: jest.fn()
    };

    dashboard = new Dashboard({
      container,
      analyticsService: mockAnalyticsService,
      onViewDetails: jest.fn()
    });
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('initialization', () => {
    test('should render dashboard sections', () => {
      dashboard.render();

      expect(container.querySelector('.dashboard')).toBeTruthy();
      expect(container.querySelector('.summary-cards')).toBeTruthy();
      expect(container.querySelector('.charts-section')).toBeTruthy();
      expect(container.querySelector('.insights-section')).toBeTruthy();
    });

    test('should fetch analytics data on render', async () => {
      mockAnalyticsService.getSpendingSummary.mockResolvedValue({
        total: 500.00,
        count: 25,
        average: 20.00
      });

      await dashboard.render();

      expect(mockAnalyticsService.getSpendingSummary).toHaveBeenCalled();
    });
  });

  describe('summary cards', () => {
    test('should display spending summary', async () => {
      mockAnalyticsService.getSpendingSummary.mockResolvedValue({
        total: 1250.75,
        count: 45,
        average: 27.79,
        period: { startDate: '2025-09-01', endDate: '2025-09-30' }
      });

      await dashboard.render();

      const totalCard = container.querySelector('.summary-card[data-metric="total"]');
      expect(totalCard.querySelector('.metric-value').textContent).toContain('$1,250.75');
      
      const countCard = container.querySelector('.summary-card[data-metric="count"]');
      expect(countCard.querySelector('.metric-value').textContent).toContain('45');
      
      const averageCard = container.querySelector('.summary-card[data-metric="average"]');
      expect(averageCard.querySelector('.metric-value').textContent).toContain('$27.79');
    });

    test('should show period comparison', async () => {
      mockAnalyticsService.getSpendingSummary.mockResolvedValue({
        total: 1000.00,
        count: 40,
        average: 25.00,
        comparison: {
          previousTotal: 800.00,
          change: 200.00,
          changePercentage: 25.00,
          direction: 'increase'
        }
      });

      await dashboard.render();

      const totalCard = container.querySelector('.summary-card[data-metric="total"]');
      const comparison = totalCard.querySelector('.metric-comparison');
      
      expect(comparison.textContent).toContain('+25%');
      expect(comparison.classList.contains('increase')).toBe(true);
    });

    test('should display budget status', async () => {
      mockAnalyticsService.getBudgetAnalysis.mockResolvedValue({
        budgetAmount: 1500.00,
        spentAmount: 1200.00,
        remainingAmount: 300.00,
        percentageUsed: 80.00,
        isOverBudget: false
      });

      await dashboard.render();

      const budgetCard = container.querySelector('.summary-card[data-metric="budget"]');
      expect(budgetCard.querySelector('.metric-value').textContent).toContain('80%');
      expect(budgetCard.querySelector('.budget-remaining').textContent).toContain('$300');
    });
  });

  describe('charts section', () => {
    test('should render category spending chart', async () => {
      mockAnalyticsService.getSpendingByCategory.mockResolvedValue([
        { categoryId: 'food', categoryName: 'Food', total: 400.00, percentage: 40.0 },
        { categoryId: 'transport', categoryName: 'Transport', total: 300.00, percentage: 30.0 },
        { categoryId: 'entertainment', categoryName: 'Entertainment', total: 200.00, percentage: 20.0 }
      ]);

      await dashboard.render();

      expect(container.querySelector('.chart-container[data-chart="category"]')).toBeTruthy();
      expect(container.querySelector('#categoryChart')).toBeTruthy();
    });

    test('should render spending trends chart', async () => {
      mockAnalyticsService.getDailyTrends.mockResolvedValue([
        { date: '2025-09-19', total: 45.00 },
        { date: '2025-09-20', total: 67.50 },
        { date: '2025-09-21', total: 32.25 }
      ]);

      await dashboard.render();

      expect(container.querySelector('.chart-container[data-chart="trends"]')).toBeTruthy();
      expect(container.querySelector('#trendsChart')).toBeTruthy();
    });

    test('should support chart type switching', () => {
      dashboard.render();

      const chartToggle = container.querySelector('.chart-toggle');
      expect(chartToggle.querySelector('button[data-chart="pie"]')).toBeTruthy();
      expect(chartToggle.querySelector('button[data-chart="bar"]')).toBeTruthy();
      expect(chartToggle.querySelector('button[data-chart="line"]')).toBeTruthy();
    });

    test('should update charts when type changed', async () => {
      mockAnalyticsService.getSpendingByCategory.mockResolvedValue([
        { categoryId: 'food', categoryName: 'Food', total: 400.00, percentage: 40.0 }
      ]);

      await dashboard.render();

      const barChartButton = container.querySelector('button[data-chart="bar"]');
      barChartButton.click();

      expect(container.querySelector('#categoryChart').getAttribute('data-type')).toBe('bar');
    });
  });

  describe('insights section', () => {
    test('should display spending insights', async () => {
      mockAnalyticsService.getSpendingInsights.mockResolvedValue([
        {
          type: 'high_spending_category',
          title: 'High Food Spending',
          description: 'Your food spending is 25% higher than usual',
          priority: 'high',
          actionable: true
        },
        {
          type: 'savings_opportunity',
          title: 'Coffee Savings',
          description: 'You could save $50/month by reducing coffee purchases',
          priority: 'medium',
          actionable: true
        }
      ]);

      await dashboard.render();

      const insights = container.querySelectorAll('.insight-card');
      expect(insights.length).toBe(2);
      
      expect(insights[0].querySelector('.insight-title').textContent).toBe('High Food Spending');
      expect(insights[0].classList.contains('priority-high')).toBe(true);
    });

    test('should show insight actions', () => {
      dashboard.render();

      const insightCard = container.querySelector('.insight-card[data-actionable="true"]');
      expect(insightCard.querySelector('.insight-actions')).toBeTruthy();
      expect(insightCard.querySelector('.view-details-button')).toBeTruthy();
    });

    test('should handle empty insights', async () => {
      mockAnalyticsService.getSpendingInsights.mockResolvedValue([]);

      await dashboard.render();

      const insightsSection = container.querySelector('.insights-section');
      expect(insightsSection.querySelector('.no-insights')).toBeTruthy();
      expect(insightsSection.querySelector('.no-insights').textContent).toContain('No insights available');
    });
  });

  describe('time period selection', () => {
    test('should render period selector', () => {
      dashboard.render();

      const periodSelector = container.querySelector('.period-selector');
      expect(periodSelector).toBeTruthy();
      expect(periodSelector.querySelector('button[data-period="week"]')).toBeTruthy();
      expect(periodSelector.querySelector('button[data-period="month"]')).toBeTruthy();
      expect(periodSelector.querySelector('button[data-period="year"]')).toBeTruthy();
    });

    test('should update data when period changes', async () => {
      await dashboard.render();

      const monthButton = container.querySelector('button[data-period="month"]');
      monthButton.click();

      expect(mockAnalyticsService.getSpendingSummary).toHaveBeenCalledWith(
        expect.objectContaining({
          period: 'month'
        })
      );
    });

    test('should support custom date range', () => {
      dashboard.render();

      const customButton = container.querySelector('button[data-period="custom"]');
      customButton.click();

      expect(container.querySelector('.custom-date-range')).toBeTruthy();
      expect(container.querySelector('input[name="startDate"]')).toBeTruthy();
      expect(container.querySelector('input[name="endDate"]')).toBeTruthy();
    });
  });

  describe('loading states', () => {
    test('should show loading indicators', () => {
      dashboard.render();

      expect(container.querySelector('.summary-cards .loading')).toBeTruthy();
      expect(container.querySelector('.charts-section .loading')).toBeTruthy();
      expect(container.querySelector('.insights-section .loading')).toBeTruthy();
    });

    test('should hide loading when data loaded', async () => {
      mockAnalyticsService.getSpendingSummary.mockResolvedValue({
        total: 500.00,
        count: 25,
        average: 20.00
      });

      await dashboard.render();

      expect(container.querySelector('.summary-cards .loading')).toBeFalsy();
    });

    test('should show error states for failed requests', async () => {
      mockAnalyticsService.getSpendingSummary.mockRejectedValue(new Error('Failed to load'));

      await dashboard.render();

      expect(container.querySelector('.summary-cards .error')).toBeTruthy();
      expect(container.querySelector('.error-message').textContent).toContain('Failed to load');
    });
  });

  describe('responsive design', () => {
    test('should stack cards on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      dashboard.render();

      const summaryCards = container.querySelector('.summary-cards');
      expect(summaryCards.classList.contains('mobile-stack')).toBe(true);
    });

    test('should adjust chart sizes for screen', () => {
      dashboard.render();

      const chartContainers = container.querySelectorAll('.chart-container');
      chartContainers.forEach(container => {
        expect(container.style.width).toBeDefined();
        expect(container.style.height).toBeDefined();
      });
    });
  });

  describe('accessibility', () => {
    test('should have proper ARIA labels', () => {
      dashboard.render();

      const dashboard_element = container.querySelector('.dashboard');
      expect(dashboard_element.getAttribute('role')).toBe('main');
      expect(dashboard_element.getAttribute('aria-label')).toBe('Expense Dashboard');
    });

    test('should support keyboard navigation', () => {
      dashboard.render();

      const periodButtons = container.querySelectorAll('.period-selector button');
      periodButtons.forEach(button => {
        expect(button.tabIndex).not.toBe(-1);
      });
    });

    test('should provide chart descriptions', async () => {
      mockAnalyticsService.getSpendingByCategory.mockResolvedValue([
        { categoryId: 'food', categoryName: 'Food', total: 400.00, percentage: 40.0 }
      ]);

      await dashboard.render();

      const chartContainer = container.querySelector('.chart-container[data-chart="category"]');
      expect(chartContainer.querySelector('.chart-description')).toBeTruthy();
    });
  });

  describe('data refresh', () => {
    test('should provide refresh button', () => {
      dashboard.render();

      expect(container.querySelector('.refresh-button')).toBeTruthy();
    });

    test('should refresh data when button clicked', async () => {
      await dashboard.render();

      const refreshButton = container.querySelector('.refresh-button');
      refreshButton.click();

      expect(mockAnalyticsService.getSpendingSummary).toHaveBeenCalledTimes(2);
    });

    test('should auto-refresh periodically', (done) => {
      dashboard = new Dashboard({
        container,
        analyticsService: mockAnalyticsService,
        autoRefresh: true,
        refreshInterval: 100 // 100ms for testing
      });

      dashboard.render();

      setTimeout(() => {
        expect(mockAnalyticsService.getSpendingSummary).toHaveBeenCalledTimes(2);
        done();
      }, 150);
    });
  });
});