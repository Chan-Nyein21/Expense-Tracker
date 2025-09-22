/**
 * Storage Service
 * Purpose: Manage data persistence using localStorage with error handling and validation
 * Constitutional Requirements: Data integrity, error handling, performance optimization
 */

import { Expense } from '../models/Expense.js';
import { Category } from '../models/Category.js';
import { Budget } from '../models/Budget.js';
import { ValidationError, StorageError, NotFoundError } from '../utils/errors.js';

/**
 * StorageService class for managing application data persistence
 */
export class StorageService {
  constructor() {
    this.storageKeys = {
      expenses: 'expenses',
      categories: 'categories',
      budgets: 'budgets',
      settings: 'settings'
    };
    
    this.initializeStorage();
  }

  /**
   * Initialize storage with default data if empty
   */
  initializeStorage() {
    try {
      // Initialize expenses
      if (!this.getItem(this.storageKeys.expenses)) {
        this.setItem(this.storageKeys.expenses, []);
      }

      // Initialize categories with defaults
      if (!this.getItem(this.storageKeys.categories)) {
        const defaultCategories = Category.getDefaultCategories().map(cat => cat.toJSON());
        this.setItem(this.storageKeys.categories, defaultCategories);
      }

      // Initialize budgets
      if (!this.getItem(this.storageKeys.budgets)) {
        this.setItem(this.storageKeys.budgets, []);
      }

      // Initialize settings
      if (!this.getItem(this.storageKeys.settings)) {
        this.setItem(this.storageKeys.settings, {
          currency: 'USD',
          dateFormat: 'YYYY-MM-DD',
          theme: 'light',
          language: 'en-US'
        });
      }
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      throw new Error('Storage initialization failed');
    }
  }

  /**
   * Get item from localStorage with error handling
   * @param {string} key - Storage key
   * @returns {any} Parsed data or null
   */
  getItem(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      return null;
    }
  }

  /**
   * Set item in localStorage with error handling
   * @param {string} key - Storage key
   * @param {any} value - Data to store
   * @returns {boolean} Success status
   */
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to set item ${key}:`, error);
      return false;
    }
  }

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all storage data
   * @returns {boolean} Success status
   */
  clearAll() {
    try {
      Object.values(this.storageKeys).forEach(key => {
        localStorage.removeItem(key);
      });
      this.initializeStorage();
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  // EXPENSE OPERATIONS

  /**
   * Create a new expense
   * @param {Object} expenseData - Expense data
   * @returns {Promise<Expense>} Created expense
   */
  async createExpense(expenseData) {
    try {
      const expense = new Expense(expenseData);
      const expenses = this.getExpenses();
      expenses.push(expense.toJSON());
      
      if (this.setItem(this.storageKeys.expenses, expenses)) {
        return expense;
      } else {
        throw new StorageError('Failed to save expense');
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new StorageError(`Failed to create expense: ${error.message}`);
    }
  }

  /**
   * Get expense by ID
   * @param {string} id - Expense ID
   * @returns {Expense|null} Found expense or null
   */
  getExpense(id) {
    try {
      const expenses = this.getExpenses();
      const expenseData = expenses.find(exp => exp.id === id);
      return expenseData ? Expense.fromJSON(expenseData) : null;
    } catch (error) {
      console.error(`Failed to get expense ${id}:`, error);
      return null;
    }
  }

  /**
   * Get all expenses
   * @returns {Array<Object>} Array of expense data objects
   */
  getExpenses() {
    return this.getItem(this.storageKeys.expenses) || [];
  }

  /**
   * Get all expenses as Expense instances
   * @returns {Array<Expense>} Array of expense instances
   */
  getExpenseInstances() {
    try {
      const expenses = this.getExpenses();
      return expenses.map(expenseData => Expense.fromJSON(expenseData));
    } catch (error) {
      console.error('Failed to get expense instances:', error);
      return [];
    }
  }

  /**
   * Update an expense
   * @param {string} id - Expense ID
   * @param {Object} updates - Updates to apply
   * @returns {Expense|null} Updated expense or null
   */
  updateExpense(id, updates) {
    try {
      const expenses = this.getExpenses();
      const index = expenses.findIndex(exp => exp.id === id);
      
      if (index === -1) {
        throw new Error('Expense not found');
      }

      const existingExpense = Expense.fromJSON(expenses[index]);
      const updatedExpense = existingExpense.update(updates);
      
      expenses[index] = updatedExpense.toJSON();
      
      if (this.setItem(this.storageKeys.expenses, expenses)) {
        return updatedExpense;
      } else {
        throw new Error('Failed to save updated expense');
      }
    } catch (error) {
      throw new Error(`Failed to update expense: ${error.message}`);
    }
  }

  /**
   * Delete an expense
   * @param {string} id - Expense ID
   * @returns {boolean} Success status
   */
  deleteExpense(id) {
    try {
      const expenses = this.getExpenses();
      const filteredExpenses = expenses.filter(exp => exp.id !== id);
      
      if (filteredExpenses.length === expenses.length) {
        throw new Error('Expense not found');
      }

      return this.setItem(this.storageKeys.expenses, filteredExpenses);
    } catch (error) {
      console.error(`Failed to delete expense ${id}:`, error);
      return false;
    }
  }

  /**
   * List expenses with filtering and pagination
   * @param {Object} options - Query options
   * @returns {Object} Query result with expenses and metadata
   */
  listExpenses(options = {}) {
    try {
      const {
        categoryId,
        startDate,
        endDate,
        minAmount,
        maxAmount,
        sortBy = 'date',
        sortOrder = 'desc',
        page = 1,
        pageSize = 50
      } = options;

      let expenses = this.getExpenseInstances();

      // Apply filters
      if (categoryId) {
        expenses = expenses.filter(exp => exp.categoryId === categoryId);
      }

      if (startDate) {
        expenses = expenses.filter(exp => exp.date >= startDate);
      }

      if (endDate) {
        expenses = expenses.filter(exp => exp.date <= endDate);
      }

      if (minAmount !== undefined) {
        expenses = expenses.filter(exp => exp.amount >= minAmount);
      }

      if (maxAmount !== undefined) {
        expenses = expenses.filter(exp => exp.amount <= maxAmount);
      }

      // Sort expenses
      expenses.sort((a, b) => a.compareTo(b, sortBy, sortOrder));

      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedExpenses = expenses.slice(startIndex, endIndex);

      return {
        expenses: paginatedExpenses.map(exp => exp.toJSON()),
        total: expenses.length,
        page,
        pageSize,
        totalPages: Math.ceil(expenses.length / pageSize),
        hasNextPage: endIndex < expenses.length,
        hasPreviousPage: page > 1
      };
    } catch (error) {
      console.error('Failed to list expenses:', error);
      return {
        expenses: [],
        total: 0,
        page: 1,
        pageSize,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      };
    }
  }

  // CATEGORY OPERATIONS

  /**
   * Create a new category
   * @param {Object} categoryData - Category data
   * @returns {Category} Created category
   */
  createCategory(categoryData) {
    try {
      const category = new Category(categoryData);
      const categories = this.getCategories();
      
      // Check for duplicate names
      if (!Category.isNameUnique(category.name, this.getCategoryInstances())) {
        throw new Error('Category name already exists');
      }

      categories.push(category.toJSON());
      
      if (this.setItem(this.storageKeys.categories, categories)) {
        return category;
      } else {
        throw new Error('Failed to save category');
      }
    } catch (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }
  }

  /**
   * Get category by ID
   * @param {string} id - Category ID
   * @returns {Category|null} Found category or null
   */
  getCategory(id) {
    try {
      const categories = this.getCategories();
      const categoryData = categories.find(cat => cat.id === id);
      return categoryData ? Category.fromJSON(categoryData) : null;
    } catch (error) {
      console.error(`Failed to get category ${id}:`, error);
      return null;
    }
  }

  /**
   * Get all categories
   * @returns {Array<Object>} Array of category data objects
   */
  getCategories() {
    return this.getItem(this.storageKeys.categories) || [];
  }

  /**
   * Get all categories as Category instances
   * @returns {Array<Category>} Array of category instances
   */
  getCategoryInstances() {
    try {
      const categories = this.getCategories();
      return categories.map(categoryData => Category.fromJSON(categoryData));
    } catch (error) {
      console.error('Failed to get category instances:', error);
      return [];
    }
  }

  /**
   * Update a category
   * @param {string} id - Category ID
   * @param {Object} updates - Updates to apply
   * @returns {Category|null} Updated category or null
   */
  updateCategory(id, updates) {
    try {
      const categories = this.getCategories();
      const index = categories.findIndex(cat => cat.id === id);
      
      if (index === -1) {
        throw new Error('Category not found');
      }

      const existingCategory = Category.fromJSON(categories[index]);
      
      // Check for duplicate names (excluding current category)
      if (updates.name && !Category.isNameUnique(updates.name, this.getCategoryInstances(), id)) {
        throw new Error('Category name already exists');
      }

      const updatedCategory = existingCategory.update(updates);
      categories[index] = updatedCategory.toJSON();
      
      if (this.setItem(this.storageKeys.categories, categories)) {
        return updatedCategory;
      } else {
        throw new Error('Failed to save updated category');
      }
    } catch (error) {
      throw new Error(`Failed to update category: ${error.message}`);
    }
  }

  /**
   * Delete a category
   * @param {string} id - Category ID
   * @returns {boolean} Success status
   */
  deleteCategory(id) {
    try {
      const categories = this.getCategories();
      const category = categories.find(cat => cat.id === id);
      
      if (!category) {
        throw new Error('Category not found');
      }

      // Prevent deletion of default categories that are in use
      if (category.isDefault) {
        const expenses = this.getExpenses();
        const hasExpenses = expenses.some(exp => exp.categoryId === id);
        if (hasExpenses) {
          throw new Error('Cannot delete default category with existing expenses');
        }
      }

      const filteredCategories = categories.filter(cat => cat.id !== id);
      return this.setItem(this.storageKeys.categories, filteredCategories);
    } catch (error) {
      console.error(`Failed to delete category ${id}:`, error);
      return false;
    }
  }

  // BUDGET OPERATIONS

  /**
   * Create a new budget
   * @param {Object} budgetData - Budget data
   * @returns {Budget} Created budget
   */
  createBudget(budgetData) {
    try {
      const budget = new Budget(budgetData);
      const budgets = this.getBudgets();
      budgets.push(budget.toJSON());
      
      if (this.setItem(this.storageKeys.budgets, budgets)) {
        return budget;
      } else {
        throw new Error('Failed to save budget');
      }
    } catch (error) {
      throw new Error(`Failed to create budget: ${error.message}`);
    }
  }

  /**
   * Get budget by ID
   * @param {string} id - Budget ID
   * @returns {Budget|null} Found budget or null
   */
  getBudget(id) {
    try {
      const budgets = this.getBudgets();
      const budgetData = budgets.find(budget => budget.id === id);
      return budgetData ? Budget.fromJSON(budgetData) : null;
    } catch (error) {
      console.error(`Failed to get budget ${id}:`, error);
      return null;
    }
  }

  /**
   * Get all budgets
   * @returns {Array<Object>} Array of budget data objects
   */
  getBudgets() {
    return this.getItem(this.storageKeys.budgets) || [];
  }

  /**
   * Get all budgets as Budget instances
   * @returns {Array<Budget>} Array of budget instances
   */
  getBudgetInstances() {
    try {
      const budgets = this.getBudgets();
      return budgets.map(budgetData => Budget.fromJSON(budgetData));
    } catch (error) {
      console.error('Failed to get budget instances:', error);
      return [];
    }
  }

  /**
   * Update a budget
   * @param {string} id - Budget ID
   * @param {Object} updates - Updates to apply
   * @returns {Budget|null} Updated budget or null
   */
  updateBudget(id, updates) {
    try {
      const budgets = this.getBudgets();
      const index = budgets.findIndex(budget => budget.id === id);
      
      if (index === -1) {
        throw new Error('Budget not found');
      }

      const existingBudget = Budget.fromJSON(budgets[index]);
      const updatedBudget = existingBudget.update(updates);
      
      budgets[index] = updatedBudget.toJSON();
      
      if (this.setItem(this.storageKeys.budgets, budgets)) {
        return updatedBudget;
      } else {
        throw new Error('Failed to save updated budget');
      }
    } catch (error) {
      throw new Error(`Failed to update budget: ${error.message}`);
    }
  }

  /**
   * Delete a budget
   * @param {string} id - Budget ID
   * @returns {boolean} Success status
   */
  deleteBudget(id) {
    try {
      const budgets = this.getBudgets();
      const filteredBudgets = budgets.filter(budget => budget.id !== id);
      
      if (filteredBudgets.length === budgets.length) {
        throw new Error('Budget not found');
      }

      return this.setItem(this.storageKeys.budgets, filteredBudgets);
    } catch (error) {
      console.error(`Failed to delete budget ${id}:`, error);
      return false;
    }
  }

  /**
   * Set budget for a category (create or update)
   * @param {string} categoryId - Category ID
   * @param {Object} budgetData - Budget configuration
   * @returns {Promise<Budget>} Created or updated budget
   */
  async setBudget(categoryId, budgetData) {
    try {
      // Calculate end date if not provided
      const startDate = new Date(budgetData.startDate);
      let endDate = budgetData.endDate;
      
      if (!endDate) {
        switch (budgetData.period) {
          case 'weekly':
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            break;
          case 'monthly':
          default:
            endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
            break;
          case 'yearly':
            endDate = new Date(startDate.getFullYear(), 11, 31);
            break;
        }
        endDate = endDate.toISOString().split('T')[0];
      }

      // Check if budget already exists for this category and period
      const budgets = this.getBudgets();
      const existingBudget = budgets.find(budget => 
        budget.categoryId === categoryId && 
        budget.period === budgetData.period &&
        budget.startDate === budgetData.startDate
      );

      if (existingBudget) {
        // Update existing budget
        return this.updateBudget(existingBudget.id, { ...budgetData, endDate });
      } else {
        // Create new budget
        const newBudgetData = {
          ...budgetData,
          categoryId,
          endDate
        };
        return this.createBudget(newBudgetData);
      }
    } catch (error) {
      throw new Error(`Failed to set budget: ${error.message}`);
    }
  }

  // DATA OPERATIONS

  /**
   * Export all data
   * @returns {Object} Exported data
   */
  exportData() {
    try {
      return {
        version: '1.0.0',
        exportDate: new Date(),
        totalExpenses: this.getExpenses().length,
        totalCategories: this.getCategories().length,
        data: {
          expenses: this.getExpenses(),
          categories: this.getCategories(),
          budgets: this.getBudgets(),
          settings: this.getSettings()
        }
      };
    } catch (error) {
      throw new Error(`Failed to export data: ${error.message}`);
    }
  }

  /**
   * Import data
   * @param {Object} data - Data to import
   * @returns {Object} Import result
   */
  importData(data) {
    try {
      const result = {
        success: true,
        imported: { expenses: 0, categories: 0, budgets: 0 },
        skipped: { expenses: 0, categories: 0, budgets: 0 },
        errors: []
      };

      // Import expenses
      if (data.expenses && Array.isArray(data.expenses)) {
        const validation = Expense.validateBatch(data.expenses);
        validation.valid.forEach(({ data: expenseData }) => {
          try {
            this.createExpense(expenseData);
            result.imported.expenses++;
          } catch (error) {
            result.skipped.expenses++;
            result.errors.push(`Expense: ${error.message}`);
          }
        });
        result.skipped.expenses += validation.invalid.length;
        validation.invalid.forEach(({ error }) => {
          result.errors.push(`Expense validation: ${error}`);
        });
      }

      // Import categories
      if (data.categories && Array.isArray(data.categories)) {
        const validation = Category.validateBatch(data.categories);
        validation.valid.forEach(({ data: categoryData }) => {
          try {
            this.createCategory(categoryData);
            result.imported.categories++;
          } catch (error) {
            result.skipped.categories++;
            result.errors.push(`Category: ${error.message}`);
          }
        });
        result.skipped.categories += validation.invalid.length + validation.duplicateNames.length;
        validation.invalid.forEach(({ error }) => {
          result.errors.push(`Category validation: ${error}`);
        });
        validation.duplicateNames.forEach(({ error }) => {
          result.errors.push(`Category: ${error}`);
        });
      }

      return result;
    } catch (error) {
      return {
        success: false,
        imported: { expenses: 0, categories: 0, budgets: 0 },
        skipped: { expenses: 0, categories: 0, budgets: 0 },
        errors: [`Import failed: ${error.message}`]
      };
    }
  }

  /**
   * Get application settings
   * @returns {Object} Settings object
   */
  getSettings() {
    return this.getItem(this.storageKeys.settings) || {};
  }

  /**
   * Update application settings
   * @param {Object} updates - Settings to update
   * @returns {boolean} Success status
   */
  updateSettings(updates) {
    try {
      const currentSettings = this.getSettings();
      const newSettings = { ...currentSettings, ...updates };
      return this.setItem(this.storageKeys.settings, newSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
      return false;
    }
  }

  /**
   * Get storage size information
   * @returns {Object} Storage size data
   */
  getStorageInfo() {
    try {
      const info = {};
      Object.entries(this.storageKeys).forEach(([key, storageKey]) => {
        const data = this.getItem(storageKey);
        info[key] = {
          count: Array.isArray(data) ? data.length : (data ? 1 : 0),
          size: JSON.stringify(data || {}).length
        };
      });
      
      const totalSize = Object.values(info).reduce((sum, item) => sum + item.size, 0);
      
      return {
        ...info,
        total: {
          size: totalSize,
          sizeFormatted: this.formatBytes(totalSize)
        }
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return {};
    }
  }

  /**
   * Format bytes to human readable string
   * @param {number} bytes - Bytes to format
   * @returns {string} Formatted string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default StorageService;