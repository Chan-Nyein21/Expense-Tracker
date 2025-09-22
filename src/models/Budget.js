/**
 * Budget Model
 * Purpose: Core domain model for budget entities with validation and business logic
 * Constitutional Requirements: Input validation, error handling, data integrity
 */

/**
 * Budget class representing a spending budget for a category
 */
export class Budget {
  /**
   * Create a new budget
   * @param {Object} data - Budget data
   * @param {string} data.categoryId - Associated category ID (required)
   * @param {number} data.amount - Budget amount (must be positive)
   * @param {string} data.period - Budget period ('weekly', 'monthly', 'yearly')
   * @param {string} data.startDate - Budget start date in YYYY-MM-DD format
   * @param {string} data.endDate - Budget end date in YYYY-MM-DD format
   * @param {number} [data.spent=0] - Amount already spent
   * @param {boolean} [data.isActive=true] - Whether budget is active
   * @param {string} [data.id] - Unique identifier (auto-generated if not provided)
   * @param {string} [data.createdAt] - Creation timestamp (auto-generated if not provided)
   * @param {string} [data.updatedAt] - Update timestamp (auto-generated if not provided)
   */
  constructor(data) {
    this.validate(data);
    
    this.id = data.id || this.generateId();
    this.categoryId = data.categoryId;
    this.amount = parseFloat(data.amount);
    this.period = data.period;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.spent = parseFloat(data.spent) || 0;
    this.isActive = data.isActive !== undefined ? Boolean(data.isActive) : true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * Validate budget data
   * @param {Object} data - Data to validate
   * @throws {Error} If validation fails
   */
  validate(data) {
    const errors = [];

    // Category ID validation
    if (!data.categoryId) {
      errors.push('Category ID is required');
    } else if (typeof data.categoryId !== 'string') {
      errors.push('Category ID must be a string');
    } else if (data.categoryId.trim().length === 0) {
      errors.push('Category ID cannot be empty');
    }

    // Amount validation
    if (!data.amount && data.amount !== 0) {
      errors.push('Amount is required');
    } else {
      const amount = parseFloat(data.amount);
      if (isNaN(amount)) {
        errors.push('Amount must be a valid number');
      } else if (amount <= 0) {
        errors.push('Amount must be greater than 0');
      } else if (!Number.isFinite(amount)) {
        errors.push('Amount must be a finite number');
      }
    }

    // Period validation
    const validPeriods = ['weekly', 'monthly', 'yearly'];
    if (!data.period) {
      errors.push('Period is required');
    } else if (!validPeriods.includes(data.period)) {
      errors.push(`Period must be one of: ${validPeriods.join(', ')}`);
    }

    // Start date validation
    if (!data.startDate) {
      errors.push('Start date is required');
    } else if (typeof data.startDate !== 'string') {
      errors.push('Start date must be a string');
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.startDate)) {
      errors.push('Start date must be in YYYY-MM-DD format');
    } else if (isNaN(Date.parse(data.startDate))) {
      errors.push('Start date must be a valid date');
    }

    // End date validation
    if (!data.endDate) {
      errors.push('End date is required');
    } else if (typeof data.endDate !== 'string') {
      errors.push('End date must be a string');
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.endDate)) {
      errors.push('End date must be in YYYY-MM-DD format');
    } else if (isNaN(Date.parse(data.endDate))) {
      errors.push('End date must be a valid date');
    } else if (data.startDate && new Date(data.endDate) <= new Date(data.startDate)) {
      errors.push('End date must be after start date');
    }

    // Spent validation (optional)
    if (data.spent !== undefined) {
      const spent = parseFloat(data.spent);
      if (isNaN(spent)) {
        errors.push('Spent amount must be a valid number');
      } else if (spent < 0) {
        errors.push('Spent amount cannot be negative');
      } else if (!Number.isFinite(spent)) {
        errors.push('Spent amount must be a finite number');
      }
    }

    // isActive validation (optional)
    if (data.isActive !== undefined && typeof data.isActive !== 'boolean') {
      errors.push('isActive must be a boolean');
    }

    if (errors.length > 0) {
      throw new Error(`Budget validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Generate a unique ID for the budget
   * @returns {string} Unique identifier
   */
  generateId() {
    return `budget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update budget data
   * @param {Object} updates - Data to update
   * @returns {Budget} Updated budget instance
   */
  update(updates) {
    const updatedData = {
      ...this.toJSON(),
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.validate(updatedData);
    
    this.categoryId = updatedData.categoryId;
    this.amount = parseFloat(updatedData.amount);
    this.period = updatedData.period;
    this.startDate = updatedData.startDate;
    this.endDate = updatedData.endDate;
    this.spent = parseFloat(updatedData.spent);
    this.isActive = Boolean(updatedData.isActive);
    this.updatedAt = updatedData.updatedAt;
    
    return this;
  }

  /**
   * Add spending to this budget
   * @param {number} amount - Amount to add
   * @returns {Budget} Updated budget instance
   */
  addSpending(amount) {
    if (typeof amount !== 'number' || amount < 0) {
      throw new Error('Spending amount must be a positive number');
    }
    
    this.spent += amount;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Remove spending from this budget
   * @param {number} amount - Amount to remove
   * @returns {Budget} Updated budget instance
   */
  removeSpending(amount) {
    if (typeof amount !== 'number' || amount < 0) {
      throw new Error('Spending amount must be a positive number');
    }
    
    this.spent = Math.max(0, this.spent - amount);
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Get remaining budget amount
   * @returns {number} Remaining amount
   */
  getRemaining() {
    return Math.max(0, this.amount - this.spent);
  }

  /**
   * Get budget utilization percentage
   * @returns {number} Percentage used (0-100+)
   */
  getUtilizationPercentage() {
    return this.amount > 0 ? (this.spent / this.amount) * 100 : 0;
  }

  /**
   * Check if budget is over limit
   * @returns {boolean} True if over budget
   */
  isOverBudget() {
    return this.spent > this.amount;
  }

  /**
   * Check if budget is within warning threshold
   * @param {number} [threshold=80] - Warning threshold percentage
   * @returns {boolean} True if near budget limit
   */
  isNearLimit(threshold = 80) {
    return this.getUtilizationPercentage() >= threshold;
  }

  /**
   * Check if budget is currently active (within date range)
   * @returns {boolean} True if budget is active
   */
  isCurrentlyActive() {
    if (!this.isActive) return false;
    
    const now = new Date();
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    
    return now >= start && now <= end;
  }

  /**
   * Get days remaining in budget period
   * @returns {number} Days remaining (can be negative if expired)
   */
  getDaysRemaining() {
    const now = new Date();
    const end = new Date(this.endDate);
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get budget status
   * @returns {string} Status: 'active', 'expired', 'upcoming', 'inactive'
   */
  getStatus() {
    if (!this.isActive) return 'inactive';
    
    const now = new Date();
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    
    if (now < start) return 'upcoming';
    if (now > end) return 'expired';
    return 'active';
  }

  /**
   * Get budget health indicator
   * @returns {string} Health: 'good', 'warning', 'danger'
   */
  getHealth() {
    const utilization = this.getUtilizationPercentage();
    
    if (utilization >= 100) return 'danger';
    if (utilization >= 80) return 'warning';
    return 'good';
  }

  /**
   * Create a copy of the budget
   * @returns {Budget} New budget instance
   */
  clone() {
    return new Budget(this.toJSON());
  }

  /**
   * Convert budget to JSON object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      categoryId: this.categoryId,
      amount: this.amount,
      period: this.period,
      startDate: this.startDate,
      endDate: this.endDate,
      spent: this.spent,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Create budget from JSON object
   * @param {Object} json - Plain object
   * @returns {Budget} New budget instance
   */
  static fromJSON(json) {
    return new Budget(json);
  }

  /**
   * Check if this budget equals another budget
   * @param {Budget} other - Other budget to compare
   * @returns {boolean} True if budgets are equal
   */
  equals(other) {
    return (
      other instanceof Budget &&
      this.id === other.id &&
      this.categoryId === other.categoryId &&
      this.amount === other.amount &&
      this.period === other.period &&
      this.startDate === other.startDate &&
      this.endDate === other.endDate &&
      this.spent === other.spent &&
      this.isActive === other.isActive
    );
  }

  /**
   * Get budget summary information
   * @returns {Object} Summary object
   */
  getSummary() {
    return {
      id: this.id,
      categoryId: this.categoryId,
      amount: this.amount,
      spent: this.spent,
      remaining: this.getRemaining(),
      utilizationPercentage: this.getUtilizationPercentage(),
      period: this.period,
      status: this.getStatus(),
      health: this.getHealth(),
      daysRemaining: this.getDaysRemaining(),
      isOverBudget: this.isOverBudget(),
      isNearLimit: this.isNearLimit()
    };
  }

  /**
   * Get formatted amounts with currency
   * @param {string} [currency='USD'] - Currency code
   * @param {string} [locale='en-US'] - Locale for formatting
   * @returns {Object} Formatted amounts
   */
  getFormattedAmounts(currency = 'USD', locale = 'en-US') {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    });

    return {
      amount: formatter.format(this.amount),
      spent: formatter.format(this.spent),
      remaining: formatter.format(this.getRemaining())
    };
  }

  /**
   * Generate budget for next period
   * @param {Object} [options] - Options for next budget
   * @returns {Budget} New budget for next period
   */
  generateNext(options = {}) {
    const { amount = this.amount, isActive = true } = options;
    
    let nextStart, nextEnd;
    
    switch (this.period) {
      case 'weekly':
        nextStart = new Date(this.endDate);
        nextStart.setDate(nextStart.getDate() + 1);
        nextEnd = new Date(nextStart);
        nextEnd.setDate(nextEnd.getDate() + 6);
        break;
        
      case 'monthly':
        nextStart = new Date(this.endDate);
        nextStart.setDate(nextStart.getDate() + 1);
        nextEnd = new Date(nextStart);
        nextEnd.setMonth(nextEnd.getMonth() + 1);
        nextEnd.setDate(nextEnd.getDate() - 1);
        break;
        
      case 'yearly':
        nextStart = new Date(this.endDate);
        nextStart.setDate(nextStart.getDate() + 1);
        nextEnd = new Date(nextStart);
        nextEnd.setFullYear(nextEnd.getFullYear() + 1);
        nextEnd.setDate(nextEnd.getDate() - 1);
        break;
        
      default:
        throw new Error(`Unknown period: ${this.period}`);
    }

    return new Budget({
      categoryId: this.categoryId,
      amount: amount,
      period: this.period,
      startDate: nextStart.toISOString().split('T')[0],
      endDate: nextEnd.toISOString().split('T')[0],
      spent: 0,
      isActive: isActive
    });
  }

  /**
   * Validate multiple budgets
   * @param {Array} budgets - Array of budget data
   * @returns {Object} Validation result
   */
  static validateBatch(budgets) {
    const results = {
      valid: [],
      invalid: [],
      duplicateCategories: []
    };

    const categoryPeriods = new Set();
    
    budgets.forEach((budgetData, index) => {
      try {
        new Budget(budgetData);
        
        // Check for duplicate category-period combinations
        const key = `${budgetData.categoryId}-${budgetData.period}`;
        if (categoryPeriods.has(key)) {
          results.duplicateCategories.push({ 
            index, 
            data: budgetData, 
            error: 'Duplicate budget for category and period' 
          });
        } else {
          categoryPeriods.add(key);
          results.valid.push({ index, data: budgetData });
        }
      } catch (error) {
        results.invalid.push({ 
          index, 
          data: budgetData, 
          error: error.message 
        });
      }
    });

    return results;
  }

  /**
   * Create multiple budgets from array
   * @param {Array} budgetsData - Array of budget data
   * @returns {Array<Budget>} Array of budget instances
   */
  static createBatch(budgetsData) {
    return budgetsData.map(data => new Budget(data));
  }

  /**
   * Sort budgets by various criteria
   * @param {Array<Budget>} budgets - Budgets to sort
   * @param {string} [field='startDate'] - Field to sort by
   * @param {string} [order='desc'] - Sort order (asc/desc)
   * @returns {Array<Budget>} Sorted budgets
   */
  static sort(budgets, field = 'startDate', order = 'desc') {
    return [...budgets].sort((a, b) => {
      let result = 0;
      
      switch (field) {
        case 'amount':
          result = a.amount - b.amount;
          break;
        case 'spent':
          result = a.spent - b.spent;
          break;
        case 'remaining':
          result = a.getRemaining() - b.getRemaining();
          break;
        case 'utilization':
          result = a.getUtilizationPercentage() - b.getUtilizationPercentage();
          break;
        case 'startDate':
          result = new Date(a.startDate) - new Date(b.startDate);
          break;
        case 'endDate':
          result = new Date(a.endDate) - new Date(b.endDate);
          break;
        default:
          result = 0;
      }
      
      return order === 'desc' ? -result : result;
    });
  }

  /**
   * Filter budgets by status
   * @param {Array<Budget>} budgets - Budgets to filter
   * @param {string} status - Status to filter by
   * @returns {Array<Budget>} Filtered budgets
   */
  static filterByStatus(budgets, status) {
    return budgets.filter(budget => budget.getStatus() === status);
  }

  /**
   * Get active budgets
   * @param {Array<Budget>} budgets - Budgets to filter
   * @returns {Array<Budget>} Active budgets
   */
  static getActive(budgets) {
    return budgets.filter(budget => budget.isCurrentlyActive());
  }

  /**
   * Get budgets over limit
   * @param {Array<Budget>} budgets - Budgets to check
   * @returns {Array<Budget>} Over-budget budgets
   */
  static getOverBudget(budgets) {
    return budgets.filter(budget => budget.isOverBudget());
  }

  /**
   * Get budgets near limit
   * @param {Array<Budget>} budgets - Budgets to check
   * @param {number} [threshold=80] - Warning threshold percentage
   * @returns {Array<Budget>} Near-limit budgets
   */
  static getNearLimit(budgets, threshold = 80) {
    return budgets.filter(budget => budget.isNearLimit(threshold));
  }
}

export default Budget;