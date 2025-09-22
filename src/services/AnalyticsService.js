/**
 * Analytics Service
 * Purpose: Analyze spending data, generate insights, and provide budget tracking
 * Constitutional Requirements: Performance optimization, data accuracy, comprehensive analysis
 */

import { StorageService } from './StorageService.js';
import { Expense } from '../models/Expense.js';
import { Category } from '../models/Category.js';
import { Budget } from '../models/Budget.js';
import { ValidationError, StorageError } from '../utils/errors.js';

/**
 * AnalyticsService class for spending analysis and insights
 */
export class AnalyticsService {
  constructor(storageService = null) {
    this.storageService = storageService || new StorageService();
  }

  /**
   * Get comprehensive spending summary
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Spending summary
   */
  async getSpendingSummary(options = {}) {
    try {
      const {
        startDate,
        endDate,
        categoryId,
        period = 'all' // 'all', 'today', 'week', 'month', 'year'
      } = options;

      let expenses = this.storageService.getExpenseInstances();

      // Apply filters
      expenses = this.filterExpensesByOptions(expenses, { startDate, endDate, categoryId, period });

      if (expenses.length === 0) {
        return {
          total: 0,
          count: 0,
          average: 0,
          dailyAverage: 0,
          categoryBreakdown: [],
          topExpenses: [],
          period: startDate && endDate ? { startDate, endDate } : period
        };
      }

      const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const count = expenses.length;
      const average = total / count;

      // Calculate daily average
      const dates = [...new Set(expenses.map(e => e.date))];
      const dailyAverage = dates.length > 0 ? total / dates.length : 0;

      // Get category breakdown
      const categoryBreakdown = await this.getCategoryBreakdown(expenses);

      // Get top expenses (sorted by amount, limit 10)
      const topExpenses = expenses
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10)
        .map(expense => expense.toJSON());

      return {
        total: parseFloat(total.toFixed(2)),
        count,
        average: parseFloat(average.toFixed(2)),
        dailyAverage: parseFloat(dailyAverage.toFixed(2)),
        categoryBreakdown,
        topExpenses,
        period: startDate && endDate ? { startDate, endDate } : period
      };
    } catch (error) {
      throw new Error(`Failed to get spending summary: ${error.message}`);
    }
  }

  /**
   * Get category-wise spending breakdown (alias for getCategoryBreakdown for contract compatibility)
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Category breakdown
   */
  async getSpendingByCategory(options = {}) {
    try {
      const { startDate, endDate, categoryId } = options;
      let expenses = this.storageService.getExpenseInstances();
      
      expenses = this.filterExpensesByOptions(expenses, { startDate, endDate, categoryId });
      
      return await this.getCategoryBreakdown(expenses);
    } catch (error) {
      throw new Error(`Failed to get spending by category: ${error.message}`);
    }
  }

  /**
   * Get daily spending trends
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Daily trends
   */
  async getDailyTrends(options = {}) {
    try {
      const { startDate, endDate, categoryId } = options;
      let expenses = this.storageService.getExpenseInstances();
      
      expenses = this.filterExpensesByOptions(expenses, { startDate, endDate, categoryId });
      
      // Group by date
      const dailyTotals = new Map();
      
      expenses.forEach(expense => {
        const date = expense.date;
        const current = dailyTotals.get(date) || 0;
        dailyTotals.set(date, current + expense.amount);
      });

      // Convert to sorted array
      const trends = Array.from(dailyTotals.entries()).map(([date, total]) => ({
        date,
        total: parseFloat(total.toFixed(2))
      }));

      // Sort by date
      trends.sort((a, b) => new Date(a.date) - new Date(b.date));

      return trends;
    } catch (error) {
      throw new Error(`Failed to get daily trends: ${error.message}`);
    }
  }
  async getCategoryBreakdown(expenses = null) {
    try {
      if (!expenses) {
        expenses = this.storageService.getExpenseInstances();
      }

      const categories = this.storageService.getCategoryInstances();
      const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

      // Group expenses by category
      const categoryTotals = new Map();
      const categoryCounts = new Map();

      expenses.forEach(expense => {
        const categoryId = expense.categoryId;
        const currentTotal = categoryTotals.get(categoryId) || 0;
        const currentCount = categoryCounts.get(categoryId) || 0;

        categoryTotals.set(categoryId, currentTotal + expense.amount);
        categoryCounts.set(categoryId, currentCount + 1);
      });

      const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

      // Create breakdown array
      const breakdown = [];
      categoryTotals.forEach((total, categoryId) => {
        const category = categoryMap.get(categoryId);
        const count = categoryCounts.get(categoryId);
        const percentage = totalSpent > 0 ? (total / totalSpent) * 100 : 0;

        breakdown.push({
          categoryId,
          categoryName: category ? category.name : 'Unknown Category',
          categoryColor: category ? category.color : '#CCCCCC',
          categoryIcon: category ? category.icon : 'help',
          total: parseFloat(total.toFixed(2)),
          count,
          percentage: parseFloat(percentage.toFixed(2)),
          average: parseFloat((total / count).toFixed(2))
        });
      });

      // Sort by total spending (descending)
      return breakdown.sort((a, b) => b.total - a.total);
    } catch (error) {
      throw new Error(`Failed to get category breakdown: ${error.message}`);
    }
  }

  /**
   * Get monthly spending trends
   * @param {number} months - Number of months to analyze
   * @returns {Promise<Array>} Monthly trends
   */
  async getMonthlyTrends(months = 12) {
    try {
      const expenses = this.storageService.getExpenseInstances();
      const now = new Date();
      const trends = [];

      // Generate data for each month
      for (let i = months - 1; i >= 0; i--) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
        
        const monthExpenses = expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return (
            expenseDate.getFullYear() === targetDate.getFullYear() &&
            expenseDate.getMonth() === targetDate.getMonth()
          );
        });

        const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const count = monthExpenses.length;

        trends.push({
          month: monthKey,
          year: targetDate.getFullYear(),
          monthNumber: targetDate.getMonth() + 1,
          monthName: targetDate.toLocaleDateString('en-US', { month: 'long' }),
          total: parseFloat(total.toFixed(2)),
          count,
          average: count > 0 ? parseFloat((total / count).toFixed(2)) : 0
        });
      }

      return trends;
    } catch (error) {
      throw new Error(`Failed to get monthly trends: ${error.message}`);
    }
  }

  /**
   * Generate spending insights and recommendations
   * @param {Object} options - Analysis options
   * @returns {Promise<Array>} Array of insights
   */
  async getSpendingInsights(options = {}) {
    try {
      const insights = [];
      const { compareMonths = 1 } = options;

      // Get current and previous period data
      const currentMonthExpenses = await this.getExpensesForPeriod('current_month');
      const previousMonthExpenses = await this.getExpensesForPeriod('previous_month');
      
      // High spending category insight
      const categoryBreakdown = await this.getCategoryBreakdown(currentMonthExpenses);
      if (categoryBreakdown.length > 0) {
        const topCategory = categoryBreakdown[0];
        if (topCategory.percentage > 40) {
          insights.push({
            id: `insight-high-spending-${topCategory.categoryId}`,
            type: 'high_spending_category',
            title: `High ${topCategory.categoryName} Spending`,
            description: `${topCategory.categoryName} accounts for ${topCategory.percentage.toFixed(1)}% of your spending this month`,
            priority: topCategory.percentage > 60 ? 'high' : 'medium',
            actionable: true,
            data: {
              categoryId: topCategory.categoryId,
              categoryName: topCategory.categoryName,
              percentage: topCategory.percentage,
              amount: topCategory.total
            }
          });
        }
      }

      // Spending trend insights
      if (previousMonthExpenses.length > 0 && currentMonthExpenses.length > 0) {
        const currentTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
        const previousTotal = previousMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
        const change = ((currentTotal - previousTotal) / previousTotal) * 100;

        if (Math.abs(change) > 20) {
          insights.push({
            id: 'insight-spending-trend',
            type: change > 0 ? 'spending_increase' : 'spending_decrease',
            title: `Spending ${change > 0 ? 'Increased' : 'Decreased'}`,
            description: `Your spending has ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}% compared to last month`,
            priority: Math.abs(change) > 50 ? 'high' : 'medium',
            actionable: change > 0,
            data: {
              currentAmount: currentTotal,
              previousAmount: previousTotal,
              changePercentage: change,
              changeAmount: currentTotal - previousTotal
            }
          });
        }
      }

      // Budget insights
      const budgetInsights = await this.getBudgetInsights();
      insights.push(...budgetInsights);

      // Unusual spending pattern insights
      const unusualPatterns = await this.detectUnusualPatterns();
      insights.push(...unusualPatterns);

      // Sort by priority
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return insights.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    } catch (error) {
      throw new Error(`Failed to generate insights: ${error.message}`);
    }
  }

  /**
   * Get budget analysis and status
   * @param {Object} options - Analysis options
   * @returns {Promise<Object|Array>} Budget analysis
   */
  async getBudgetAnalysis(options = {}) {
    try {
      const { categoryId, month } = options;
      
      const budgets = this.storageService.getBudgetInstances();
      let activeBudgets = budgets.filter(budget => budget.isCurrentlyActive());
      
      // Filter by category if specified
      if (categoryId) {
        activeBudgets = activeBudgets.filter(budget => budget.categoryId === categoryId);
      }

      // Filter by month if specified
      if (month) {
        const targetDate = new Date(month + '-01');
        activeBudgets = activeBudgets.filter(budget => {
          const budgetDate = new Date(budget.startDate);
          return budgetDate.getFullYear() === targetDate.getFullYear() &&
                 budgetDate.getMonth() === targetDate.getMonth();
        });
      }
      
      if (activeBudgets.length === 0) {
        return categoryId ? null : [];
      }

      const analysis = [];

      for (const budget of activeBudgets) {
        // Get expenses for this budget's category and period
        const expenses = await this.getExpensesForBudgetPeriod(budget);
        const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

        // Update budget spent amount
        budget.spent = spent;

        const budgetData = {
          budgetId: budget.id,
          categoryId: budget.categoryId,
          categoryName: await this.getCategoryName(budget.categoryId),
          budgetAmount: budget.amount,
          spentAmount: spent,
          remainingAmount: budget.getRemaining(),
          utilizationPercentage: budget.getUtilizationPercentage(),
          percentageUsed: budget.getUtilizationPercentage(), // Alias for contract compatibility
          status: budget.getStatus(),
          health: budget.getHealth(),
          daysRemaining: budget.getDaysRemaining(),
          isOverBudget: budget.isOverBudget(),
          isNearLimit: budget.isNearLimit(),
          overageAmount: budget.isOverBudget() ? spent - budget.amount : 0,
          period: budget.period,
          startDate: budget.startDate,
          endDate: budget.endDate
        };

        analysis.push(budgetData);
      }

      const sortedAnalysis = analysis.sort((a, b) => b.utilizationPercentage - a.utilizationPercentage);
      
      // Return single object if categoryId specified, otherwise array
      return categoryId ? sortedAnalysis[0] || null : sortedAnalysis;
    } catch (error) {
      throw new Error(`Failed to get budget analysis: ${error.message}`);
    }
  }

  /**
   * Get budget projection and burn rate analysis
   * @param {Object} options - Projection options
   * @returns {Promise<Object>} Budget projection
   */
  async getBudgetProjection(options = {}) {
    try {
      const { categoryId, month } = options;
      
      if (!categoryId || !month) {
        throw new ValidationError('categoryId and month are required for budget projection');
      }

      // Get budget for the category and month
      const budgetAnalysis = await this.getBudgetAnalysis({ categoryId, month });
      
      if (!budgetAnalysis) {
        throw new Error('No budget found for the specified category and month');
      }

      // Get expenses for the month so far
      const monthStart = new Date(month + '-01');
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      const today = new Date();
      const daysInMonth = monthEnd.getDate();

      // Get all expenses for this category in the month
      const expenses = this.storageService.getExpenseInstances().filter(expense => {
        const expenseDate = new Date(expense.date);
        return expense.categoryId === categoryId &&
               expenseDate >= monthStart &&
               expenseDate <= monthEnd;
      });
      
      if (expenses.length === 0) {
        return {
          budgetAmount: budgetAnalysis.budgetAmount,
          currentSpent: 0,
          dailyAverage: 0,
          projectedTotal: 0,
          willExceedBudget: false,
          projectedOverage: 0,
          daysRemaining: daysInMonth,
          recommendedDailySpend: parseFloat((budgetAnalysis.budgetAmount / daysInMonth).toFixed(2))
        };
      }

      const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Calculate daily average based on days with expenses, not current date
      const expenseDays = [...new Set(expenses.map(e => new Date(e.date).getDate()))];
      const daysWithExpenses = expenseDays.length;
      const dailyAverage = daysWithExpenses > 0 ? totalSpent / daysWithExpenses : 0;
      
      const projectedTotal = dailyAverage * daysInMonth;
      const willExceedBudget = projectedTotal > budgetAnalysis.budgetAmount;
      const projectedOverage = willExceedBudget ? projectedTotal - budgetAnalysis.budgetAmount : 0;

      const currentDay = today.getDate();
      const daysRemaining = Math.max(0, daysInMonth - currentDay);
      const remainingBudget = Math.max(0, budgetAnalysis.budgetAmount - totalSpent);

      return {
        budgetAmount: budgetAnalysis.budgetAmount,
        currentSpent: totalSpent,
        dailyAverage: parseFloat(dailyAverage.toFixed(2)),
        projectedTotal: parseFloat(projectedTotal.toFixed(2)),
        willExceedBudget,
        projectedOverage: parseFloat(projectedOverage.toFixed(2)),
        daysRemaining,
        recommendedDailySpend: daysRemaining > 0 ? parseFloat((remainingBudget / daysRemaining).toFixed(2)) : 0
      };
    } catch (error) {
      throw new Error(`Failed to get budget projection: ${error.message}`);
    }
  }

  /**
   * Detect spending anomalies
   * @param {Object} options - Detection options
   * @returns {Promise<Array>} Detected anomalies
   */
  async detectAnomalies(options = {}) {
    try {
      const { startDate, endDate, categoryId } = options;
      let expenses = this.storageService.getExpenseInstances();
      
      expenses = this.filterExpensesByOptions(expenses, { startDate, endDate, categoryId });
      
      if (expenses.length < 5) {
        return []; // Need at least 5 expenses to detect anomalies
      }

      const anomalies = [];
      const amounts = expenses.map(e => e.amount);
      const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
      const threshold = average * 3; // Consider expenses 3x above average as anomalies

      expenses.forEach(expense => {
        if (expense.amount > threshold) {
          anomalies.push({
            type: 'unusual_amount',
            expense: expense.toJSON(),
            severity: expense.amount > threshold * 2 ? 'high' : 'medium',
            reason: `Amount ${expense.amount} is significantly higher than average ${average.toFixed(2)}`,
            deviationMultiple: parseFloat((expense.amount / average).toFixed(2))
          });
        }
      });

      return anomalies.sort((a, b) => b.deviationMultiple - a.deviationMultiple);
    } catch (error) {
      throw new Error(`Failed to detect anomalies: ${error.message}`);
    }
  }

  /**
   * Get savings recommendations
   * @param {Object} options - Analysis options
   * @returns {Promise<Array>} Savings recommendations
   */
  async getSavingsRecommendations(options = {}) {
    try {
      const { startDate, endDate } = options;
      let expenses = this.storageService.getExpenseInstances();
      
      expenses = this.filterExpensesByOptions(expenses, { startDate, endDate });
      
      if (expenses.length === 0) {
        return [];
      }

      const recommendations = [];
      const categoryBreakdown = await this.getCategoryBreakdown(expenses);

      // Analyze frequent small expenses
      const frequentExpenses = new Map();
      expenses.forEach(expense => {
        if (expense.amount < 25) { // Small expenses under $25
          const key = `${expense.categoryId}-${Math.floor(expense.amount)}`;
          const current = frequentExpenses.get(key) || { count: 0, total: 0, categoryId: expense.categoryId, amount: expense.amount };
          current.count++;
          current.total += expense.amount;
          frequentExpenses.set(key, current);
        }
      });

      // Find patterns that could indicate savings opportunities
      frequentExpenses.forEach((data, key) => {
        if (data.count >= 5) { // 5 or more similar small expenses
          const monthlyProjection = data.total * (30 / expenses.length); // Project to monthly
          const potentialSavings = monthlyProjection * 0.3; // Assume 30% could be saved

          if (potentialSavings > 10) { // Only recommend if savings > $10/month
            recommendations.push({
              type: 'frequent_small_expenses',
              category: data.categoryId,
              description: `You have ${data.count} small expenses averaging $${(data.total / data.count).toFixed(2)}. Consider budgeting or bulk purchasing.`,
              potentialSavings: parseFloat(potentialSavings.toFixed(2)),
              frequency: data.count,
              averageAmount: parseFloat((data.total / data.count).toFixed(2)),
              totalAmount: parseFloat(data.total.toFixed(2))
            });
          }
        }
      });

      // Analyze high-spending categories
      categoryBreakdown.forEach(category => {
        if (category.percentage > 40) { // Categories taking up more than 40% of spending
          recommendations.push({
            type: 'high_category_spending',
            category: category.categoryId,
            description: `${category.categoryName} accounts for ${category.percentage}% of your spending. Consider reviewing these expenses.`,
            potentialSavings: parseFloat((category.total * 0.15).toFixed(2)), // Assume 15% could be saved
            currentSpending: category.total,
            percentage: category.percentage
          });
        }
      });

      return recommendations.sort((a, b) => b.potentialSavings - a.potentialSavings);
    } catch (error) {
      throw new Error(`Failed to get savings recommendations: ${error.message}`);
    }
  }

  /**
   * Compare spending between periods
   * @param {Object} options - Comparison options
   * @returns {Promise<Object>} Period comparison
   */
  async comparePeriods(options = {}) {
    try {
      const { currentPeriod, previousPeriod } = options;
      
      if (!currentPeriod || !previousPeriod) {
        throw new ValidationError('currentPeriod and previousPeriod are required');
      }

      const currentExpenses = this.filterExpensesByOptions(
        this.storageService.getExpenseInstances(),
        { startDate: currentPeriod.startDate, endDate: currentPeriod.endDate }
      );

      const previousExpenses = this.filterExpensesByOptions(
        this.storageService.getExpenseInstances(),
        { startDate: previousPeriod.startDate, endDate: previousPeriod.endDate }
      );

      const currentTotal = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
      const previousTotal = previousExpenses.reduce((sum, e) => sum + e.amount, 0);
      const changeAmount = currentTotal - previousTotal;
      const changePercentage = previousTotal > 0 ? (changeAmount / previousTotal) * 100 : 0;

      return {
        current: {
          total: parseFloat(currentTotal.toFixed(2)),
          count: currentExpenses.length,
          average: currentExpenses.length > 0 ? parseFloat((currentTotal / currentExpenses.length).toFixed(2)) : 0
        },
        previous: {
          total: parseFloat(previousTotal.toFixed(2)),
          count: previousExpenses.length,
          average: previousExpenses.length > 0 ? parseFloat((previousTotal / previousExpenses.length).toFixed(2)) : 0
        },
        change: {
          amount: parseFloat(changeAmount.toFixed(2)),
          percentage: parseFloat(changePercentage.toFixed(2)),
          direction: changeAmount > 0 ? 'increase' : changeAmount < 0 ? 'decrease' : 'no_change'
        }
      };
    } catch (error) {
      throw new Error(`Failed to compare periods: ${error.message}`);
    }
  }

  /**
   * Compare category performance
   * @param {Object} options - Comparison options
   * @returns {Promise<Array>} Category performance comparison
   */
  async compareCategoryPerformance(options = {}) {
    try {
      const { startDate, endDate } = options;
      let expenses = this.storageService.getExpenseInstances();
      
      expenses = this.filterExpensesByOptions(expenses, { startDate, endDate });
      
      const categoryBreakdown = await this.getCategoryBreakdown(expenses);
      
      // Add ranking and return with required fields
      return categoryBreakdown.map((category, index) => ({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        total: category.total,
        count: category.count,
        average: category.average,
        percentageOfTotal: category.percentage,
        rank: index + 1
      }));
    } catch (error) {
      throw new Error(`Failed to compare category performance: ${error.message}`);
    }
  }
  async getExpensesForPeriod(period) {
    const expenses = this.storageService.getExpenseInstances();
    const now = new Date();

    switch (period) {
      case 'today':
        return expenses.filter(expense => expense.isToday());
      
      case 'current_week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        return expenses.filter(expense => new Date(expense.date) >= startOfWeek);
      
      case 'current_month':
        return expenses.filter(expense => expense.isThisMonth());
      
      case 'previous_month':
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return (
            expenseDate.getFullYear() === prevMonth.getFullYear() &&
            expenseDate.getMonth() === prevMonth.getMonth()
          );
        });
      
      case 'current_year':
        return expenses.filter(expense => expense.isThisYear());
      
      default:
        return expenses;
    }
  }

  /**
   * Get expenses for a specific budget period
   * @param {Budget} budget - Budget instance
   * @returns {Promise<Array<Expense>>} Expenses in budget period
   */
  async getExpensesForBudgetPeriod(budget) {
    const expenses = this.storageService.getExpenseInstances();
    
    return expenses.filter(expense => 
      expense.categoryId === budget.categoryId &&
      expense.date >= budget.startDate &&
      expense.date <= budget.endDate
    );
  }

  /**
   * Get category name by ID
   * @param {string} categoryId - Category ID
   * @returns {Promise<string>} Category name
   */
  async getCategoryName(categoryId) {
    const category = this.storageService.getCategory(categoryId);
    return category ? category.name : 'Unknown Category';
  }

  /**
   * Get budget-related insights
   * @returns {Promise<Array>} Budget insights
   */
  async getBudgetInsights() {
    try {
      const insights = [];
      const budgetAnalysis = await this.getBudgetAnalysis();

      budgetAnalysis.forEach(budget => {
        // Over budget warning
        if (budget.isOverBudget) {
          insights.push({
            id: `insight-budget-over-${budget.budgetId}`,
            type: 'budget_warning',
            title: `Over Budget: ${budget.categoryName}`,
            description: `You've exceeded your ${budget.categoryName} budget by ${budget.spentAmount - budget.budgetAmount}`,
            priority: 'high',
            actionable: true,
            data: {
              budgetId: budget.budgetId,
              categoryId: budget.categoryId,
              categoryName: budget.categoryName,
              budgetAmount: budget.budgetAmount,
              spentAmount: budget.spentAmount,
              overAmount: budget.spentAmount - budget.budgetAmount
            }
          });
        }
        // Near limit warning
        else if (budget.isNearLimit) {
          insights.push({
            id: `insight-budget-near-${budget.budgetId}`,
            type: 'budget_warning',
            title: `Budget Warning: ${budget.categoryName}`,
            description: `You've used ${budget.utilizationPercentage.toFixed(1)}% of your ${budget.categoryName} budget`,
            priority: budget.utilizationPercentage > 90 ? 'high' : 'medium',
            actionable: true,
            data: {
              budgetId: budget.budgetId,
              categoryId: budget.categoryId,
              categoryName: budget.categoryName,
              utilizationPercentage: budget.utilizationPercentage,
              remainingAmount: budget.remainingAmount
            }
          });
        }
        // Savings opportunity
        else if (budget.utilizationPercentage < 50 && budget.daysRemaining < 7) {
          insights.push({
            id: `insight-budget-savings-${budget.budgetId}`,
            type: 'savings_opportunity',
            title: `Great Budgeting: ${budget.categoryName}`,
            description: `You're well under budget for ${budget.categoryName} with ${budget.remainingAmount} remaining`,
            priority: 'low',
            actionable: false,
            data: {
              budgetId: budget.budgetId,
              categoryId: budget.categoryId,
              categoryName: budget.categoryName,
              utilizationPercentage: budget.utilizationPercentage,
              remainingAmount: budget.remainingAmount
            }
          });
        }
      });

      return insights;
    } catch (error) {
      console.error('Failed to get budget insights:', error);
      return [];
    }
  }

  /**
   * Detect unusual spending patterns
   * @returns {Promise<Array>} Unusual pattern insights
   */
  async detectUnusualPatterns() {
    try {
      const insights = [];
      const monthlyTrends = await this.getMonthlyTrends(6);
      
      if (monthlyTrends.length < 3) {
        return insights; // Need at least 3 months of data
      }

      // Calculate average monthly spending
      const averageMonthlySpending = monthlyTrends.reduce((sum, month) => sum + month.total, 0) / monthlyTrends.length;
      const currentMonth = monthlyTrends[monthlyTrends.length - 1];

      // Detect significant deviation from average
      const deviation = ((currentMonth.total - averageMonthlySpending) / averageMonthlySpending) * 100;

      if (Math.abs(deviation) > 30) {
        insights.push({
          id: 'insight-unusual-pattern',
          type: 'unusual_pattern',
          title: deviation > 0 ? 'Unusually High Spending' : 'Unusually Low Spending',
          description: `This month's spending is ${Math.abs(deviation).toFixed(1)}% ${deviation > 0 ? 'above' : 'below'} your average`,
          priority: Math.abs(deviation) > 50 ? 'high' : 'medium',
          actionable: deviation > 0,
          data: {
            currentAmount: currentMonth.total,
            averageAmount: averageMonthlySpending,
            deviationPercentage: deviation,
            monthlyTrends: monthlyTrends.slice(-3) // Last 3 months
          }
        });
      }

      return insights;
    } catch (error) {
      console.error('Failed to detect unusual patterns:', error);
      return [];
    }
  }

  /**
   * Filter expenses by various options
   * @param {Array<Expense>} expenses - Expenses to filter
   * @param {Object} options - Filter options
   * @returns {Array<Expense>} Filtered expenses
   */
  filterExpensesByOptions(expenses, options = {}) {
    const { startDate, endDate, categoryId, period } = options;

    let filtered = [...expenses];

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(expense => expense.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(expense => expense.date <= endDate);
    }

    // Filter by category
    if (categoryId) {
      filtered = filtered.filter(expense => expense.categoryId === categoryId);
    }

    // Filter by period
    if (period && period !== 'all') {
      const now = new Date();
      switch (period) {
        case 'today':
          filtered = filtered.filter(expense => expense.isToday());
          break;
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          filtered = filtered.filter(expense => new Date(expense.date) >= weekAgo);
          break;
        case 'month':
          filtered = filtered.filter(expense => expense.isThisMonth());
          break;
        case 'year':
          filtered = filtered.filter(expense => expense.isThisYear());
          break;
      }
    }

    return filtered;
  }

  /**
   * Export analytics data
   * @param {Object} options - Export options
   * @returns {Promise<Object|string>} Analytics export data
   */
  async exportAnalytics(options = {}) {
    try {
      const { 
        includeInsights = true, 
        includeTrends = true, 
        includeBudgets = true,
        format = 'json',
        startDate,
        endDate
      } = options;

      if (format === 'csv') {
        return await this.exportAnalyticsAsCSV(options);
      }

      const filterOptions = startDate && endDate ? { startDate, endDate } : {};
      
      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        summary: await this.getSpendingSummary(filterOptions),
        categories: await this.getCategoryBreakdown(),
        metadata: {
          generatedAt: new Date(),
          format: 'json',
          filters: filterOptions
        }
      };

      if (includeTrends) {
        exportData.trends = await this.getMonthlyTrends();
      }

      if (includeInsights) {
        exportData.insights = await this.getSpendingInsights(filterOptions);
      }

      if (includeBudgets) {
        exportData.budgetAnalysis = await this.getBudgetAnalysis();
      }

      return exportData;
    } catch (error) {
      throw new Error(`Failed to export analytics: ${error.message}`);
    }
  }

  /**
   * Export analytics data as CSV
   * @param {Object} options - Export options
   * @returns {Promise<string>} CSV string
   */
  async exportAnalyticsAsCSV(options = {}) {
    try {
      const { startDate, endDate } = options;
      let expenses = this.storageService.getExpenseInstances();
      
      expenses = this.filterExpensesByOptions(expenses, { startDate, endDate });
      
      // CSV header
      let csv = 'Date,Amount,Category,Description\n';
      
      // CSV data rows
      for (const expense of expenses) {
        const categoryName = await this.getCategoryName(expense.categoryId);
        csv += `${expense.date},${expense.amount},"${categoryName}","${expense.description}"\n`;
      }
      
      return csv;
    } catch (error) {
      throw new Error(`Failed to export analytics as CSV: ${error.message}`);
    }
  }

  /**
   * Get analytics for specific date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Object>} Date range analytics
   */
  async getAnalyticsForDateRange(startDate, endDate) {
    try {
      if (!startDate || !endDate) {
        throw new ValidationError('Start date and end date are required');
      }

      const options = { startDate, endDate };
      
      const [
        summary,
        categoryBreakdown,
        insights
      ] = await Promise.all([
        this.getSpendingSummary(options),
        this.getCategoryBreakdown(),
        this.getSpendingInsights()
      ]);

      // Filter insights for the date range
      const relevantInsights = insights.filter(insight => {
        // Only include insights that are relevant to the date range
        return insight.type !== 'budget_warning' || 
               (insight.data && insight.data.categoryId);
      });

      return {
        dateRange: { startDate, endDate },
        summary,
        categoryBreakdown,
        insights: relevantInsights,
        period: this.calculatePeriodType(startDate, endDate)
      };
    } catch (error) {
      throw new Error(`Failed to get analytics for date range: ${error.message}`);
    }
  }

  /**
   * Calculate period type based on date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {string} Period type
   */
  calculatePeriodType(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return 'day';
    if (diffDays <= 7) return 'week';
    if (diffDays <= 31) return 'month';
    if (diffDays <= 365) return 'year';
    return 'custom';
  }

  /**
   * Clear analytics cache (if caching is implemented)
   * @returns {Promise<boolean>} Success status
   */
  async clearCache() {
    // Placeholder for future caching implementation
    return true;
  }
}

export default AnalyticsService;