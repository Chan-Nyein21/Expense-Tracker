/**
 * Expense Model
 * Purpose: Core domain model for expense entities with validation and business logic
 * Constitutional Requirements: Input validation, error handling, data integrity
 */

import { ValidationError } from '../utils/errors.js';

/**
 * Expense class representing a single expense entry
 */
export class Expense {
  /**
   * Create a new expense
   * @param {Object} data - Expense data
   * @param {number} data.amount - Expense amount (must be positive)
   * @param {string} data.description - Expense description (required)
   * @param {string} data.date - Expense date in YYYY-MM-DD format
   * @param {string} data.categoryId - Associated category ID
   * @param {string} [data.id] - Unique identifier (auto-generated if not provided)
   * @param {string} [data.createdAt] - Creation timestamp (auto-generated if not provided)
   * @param {string} [data.updatedAt] - Update timestamp (auto-generated if not provided)
   */
  constructor(data) {
    this.validate(data);
    
    this.id = data.id || this.generateId();
    this.amount = parseFloat(data.amount);
    this.description = data.description.trim();
    this.date = data.date;
    this.categoryId = data.categoryId;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * Validate expense data
   * @param {Object} data - Data to validate
   * @throws {Error} If validation fails
   */
  validate(data) {
    const errors = [];

    // Amount validation
    if (!data.amount && data.amount !== 0) {
      errors.push('amount is required');
    } else {
      const amount = parseFloat(data.amount);
      if (isNaN(amount)) {
        errors.push('amount must be a valid number');
      } else if (amount <= 0) {
        errors.push('amount must be positive');
      } else if (amount > 999999.99) {
        errors.push('amount cannot exceed 999999.99');
      } else if (!Number.isFinite(amount)) {
        errors.push('amount must be a finite number');
      }
    }

    // Description validation
    if (data.description === undefined || data.description === null) {
      errors.push('description is required');
    } else if (typeof data.description !== 'string') {
      errors.push('description must be a string');
    } else if (data.description.trim().length === 0) {
      errors.push('description cannot be empty');
    } else if (data.description.length > 200) {
      errors.push('description cannot exceed 200 characters');
    }

    // Date validation
    if (!data.date) {
      errors.push('date is required');
    } else if (typeof data.date !== 'string') {
      errors.push('date must be a string');
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      errors.push('date must be in YYYY-MM-DD format');
    } else if (isNaN(Date.parse(data.date))) {
      errors.push('date must be a valid date');
    } else {
      // Check if date is in the future
      const expenseDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expenseDate.setHours(0, 0, 0, 0);
      if (expenseDate > today) {
        errors.push('date cannot be in the future');
      }
    }

    // Category validation
    if (!data.categoryId) {
      errors.push('categoryId is required');
    } else if (typeof data.categoryId !== 'string') {
      errors.push('category ID must be a string');
    } else if (data.categoryId.trim().length === 0) {
      errors.push('category ID cannot be empty');
    }

    if (errors.length > 0) {
      throw new ValidationError(`ValidationError: Expense validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Generate a unique ID for the expense
   * @returns {string} Unique identifier
   */
  generateId() {
    // Generate UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Update expense data
   * @param {Object} updates - Data to update
   * @returns {Expense} Updated expense instance
   */
  update(updates) {
    const updatedData = {
      ...this.toJSON(),
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.validate(updatedData);
    
    this.amount = parseFloat(updatedData.amount);
    this.description = updatedData.description.trim();
    this.date = updatedData.date;
    this.categoryId = updatedData.categoryId;
    this.updatedAt = updatedData.updatedAt;
    
    return this;
  }

  /**
   * Create a copy of the expense
   * @returns {Expense} New expense instance
   */
  clone() {
    return new Expense(this.toJSON());
  }

  /**
   * Convert expense to JSON object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      amount: this.amount,
      description: this.description,
      date: this.date,
      categoryId: this.categoryId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Create expense from JSON object
   * @param {Object} json - Plain object
   * @returns {Expense} New expense instance
   */
  static fromJSON(json) {
    return new Expense(json);
  }

  /**
   * Check if expense is from today
   * @returns {boolean} True if expense is from today
   */
  isToday() {
    const today = new Date().toISOString().split('T')[0];
    return this.date === today;
  }

  /**
   * Check if expense is from this month
   * @returns {boolean} True if expense is from current month
   */
  isThisMonth() {
    const today = new Date();
    const expenseDate = new Date(this.date);
    return (
      expenseDate.getFullYear() === today.getFullYear() &&
      expenseDate.getMonth() === today.getMonth()
    );
  }

  /**
   * Check if expense is from this year
   * @returns {boolean} True if expense is from current year
   */
  isThisYear() {
    const today = new Date();
    const expenseDate = new Date(this.date);
    return expenseDate.getFullYear() === today.getFullYear();
  }

  /**
   * Get formatted amount with currency
   * @param {string} [currency='USD'] - Currency code
   * @param {string} [locale='en-US'] - Locale for formatting
   * @returns {string} Formatted amount
   */
  getFormattedAmount(currency = 'USD', locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(this.amount);
  }

  /**
   * Get formatted date
   * @param {string} [locale='en-US'] - Locale for formatting
   * @returns {string} Formatted date
   */
  getFormattedDate(locale = 'en-US') {
    return new Date(this.date).toLocaleDateString(locale);
  }

  /**
   * Compare two expenses for sorting
   * @param {Expense} other - Other expense to compare
   * @param {string} [field='date'] - Field to compare by
   * @param {string} [order='desc'] - Sort order (asc/desc)
   * @returns {number} Comparison result
   */
  compareTo(other, field = 'date', order = 'desc') {
    let result = 0;
    
    switch (field) {
      case 'amount':
        result = this.amount - other.amount;
        break;
      case 'description':
        result = this.description.localeCompare(other.description);
        break;
      case 'date':
        result = new Date(this.date) - new Date(other.date);
        break;
      case 'createdAt':
        result = new Date(this.createdAt) - new Date(other.createdAt);
        break;
      default:
        result = 0;
    }
    
    return order === 'desc' ? -result : result;
  }

  /**
   * Check if this expense equals another expense
   * @param {Expense} other - Other expense to compare
   * @returns {boolean} True if expenses are equal
   */
  equals(other) {
    return (
      other instanceof Expense &&
      this.id === other.id &&
      this.amount === other.amount &&
      this.description === other.description &&
      this.date === other.date &&
      this.categoryId === other.categoryId
    );
  }

  /**
   * Get expense summary information
   * @returns {Object} Summary object
   */
  getSummary() {
    return {
      id: this.id,
      amount: this.amount,
      description: this.description,
      date: this.date,
      categoryId: this.categoryId,
      isToday: this.isToday(),
      isThisMonth: this.isThisMonth(),
      isThisYear: this.isThisYear(),
      formattedAmount: this.getFormattedAmount(),
      formattedDate: this.getFormattedDate()
    };
  }

  /**
   * Validate multiple expenses
   * @param {Array} expenses - Array of expense data
   * @returns {Object} Validation result
   */
  static validateBatch(expenses) {
    const results = {
      valid: [],
      invalid: []
    };

    expenses.forEach((expenseData, index) => {
      try {
        new Expense(expenseData);
        results.valid.push({ index, data: expenseData });
      } catch (error) {
        results.invalid.push({ 
          index, 
          data: expenseData, 
          error: error.message 
        });
      }
    });

    return results;
  }

  /**
   * Create multiple expenses from array
   * @param {Array} expensesData - Array of expense data
   * @returns {Array<Expense>} Array of expense instances
   */
  static createBatch(expensesData) {
    return expensesData.map(data => new Expense(data));
  }
}

export default Expense;