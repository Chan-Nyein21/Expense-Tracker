/**
 * ExpenseForm Component for Expense Tracker
 * Purpose: Form component for creating and editing expenses
 * Constitutional Requirements: Accessibility, validation, error handling
 */

import { Component } from './Component.js';
import { StorageService } from '../services/StorageService.js';
import { formatDateForInput } from '../utils/date.js';
import { formatExpenseAmount } from '../utils/currency.js';
import {
  validateExpenseAmount,
  validateExpenseDescription,
  validateExpenseDate,
  validateUuid
} from '../utils/validation.js';

/**
 * ExpenseForm component for adding/editing expenses
 */
export class ExpenseForm extends Component {
  /**
   * Create ExpenseForm
   * @param {Object} options - Component options
   * @param {HTMLElement} options.container - Container element
   * @param {Function} options.onSubmit - Submit callback
   * @param {Function} options.onCancel - Cancel callback
   * @param {Function} options.onChange - Change callback
   * @param {Function} options.onValidation - Validation callback
   * @param {Object} options.data - Initial form data
   * @param {boolean} options.editMode - Whether form is in edit mode
   */
  constructor(options = {}) {
    super(options);
    
    // Initialize services
    this.storageService = new StorageService();
    
    // Event callbacks
    this.onSubmit = options.onSubmit || (() => {});
    this.onCancel = options.onCancel || (() => {});
    this.onChange = options.onChange || (() => {});
    this.onValidation = options.onValidation || (() => {});
    
    // Categories (use provided categories or load from storage)
    this.providedCategories = options.categories || null;
    
    // Handle expense data (for edit mode)
    const expenseData = options.expense || options.data || {};
    
    // Form state
    this.formData = {
      amount: '',
      description: '',
      date: formatDateForInput(new Date()),
      categoryId: '',
      ...expenseData
    };
    
    this.validationErrors = {};
    this.isSubmitting = false;
    this.editMode = options.editMode || !!options.expense;
    this.expenseId = expenseData?.id || null;
  }

  /**
   * Load categories for dropdown (synchronous)
   */
  loadCategories() {
    try {
      // Use provided categories if available (for testing)
      if (this.providedCategories) {
        return this.providedCategories;
      }
      
      const categories = this.storageService.getCategories();
      
      // Ensure we have some default categories
      if (categories.length === 0) {
        const defaultCategories = [
          { id: 'default-food', name: 'Food & Dining', color: '#ff6b6b' },
          { id: 'default-transport', name: 'Transportation', color: '#4ecdc4' },
          { id: 'default-shopping', name: 'Shopping', color: '#45b7d1' },
          { id: 'default-entertainment', name: 'Entertainment', color: '#96ceb4' },
          { id: 'default-utilities', name: 'Utilities', color: '#feca57' },
          { id: 'default-other', name: 'Other', color: '#ff9ff3' }
        ];
        
        // Save default categories
        for (const category of defaultCategories) {
          this.storageService.saveCategory(category);
        }
        
        return defaultCategories;
      }
      
      return categories;
    } catch (error) {
      console.error('Failed to load categories:', error);
      return [];
    }
  }

  /**
   * Render the form component
   * @returns {Promise<void>}
   */
  async render() {
    if (!this.container) {
      throw new Error('Component container is required');
    }

    try {
      // Create component structure (synchronous)
      this.createStructure();
      
      // Bind event listeners
      this.bindEvents();
      
      // Apply initial state
      this.applyState();
      
      // Mark as rendered
      this.container.setAttribute('data-component-rendered', 'true');
      
      // Emit rendered event
      this.dispatchEvent('component:rendered', { component: this });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create the form structure (synchronous)
  /**
   * Create the form structure (synchronous)
   */
  createStructure() {
    // Load categories synchronously
    const categories = this.loadCategories();
    
    // Add responsive class for mobile detection
    const isMobile = window.innerWidth <= 768;
    const containerClass = isMobile ? 'form-mobile' : 'form-desktop';
    
    // Add component styles
    this.addComponentStyles();
    
    // Create form HTML
    this.container.innerHTML = `
      <form class="expense-form ${containerClass}" novalidate>
        <div class="form-header">
          <h2 class="form-title">${this.editMode ? 'Edit Expense' : 'Add Expense'}</h2>
        </div>
        
        <div class="form-container">
          <div class="form-group">
            <label for="amount" class="form-label">
              Amount *
            </label>
            <div class="input-wrapper">
              <input
                type="number"
                id="amount"
                name="amount"
                class="form-input"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                max="1000000"
                required
                aria-describedby="amount-error"
                value="${this.formData.amount}"
              />
              <span class="currency-symbol">$</span>
            </div>
            <div id="amount-error" class="field-error" data-field="amount" role="alert"></div>
          </div>

          <div class="form-group">
            <label for="description" class="form-label">
              Description *
            </label>
            <input
              type="text"
              id="description"
              name="description"
              class="form-input"
              placeholder="What did you spend on?"
              maxlength="255"
              required
              aria-describedby="description-error"
              value="${this.formData.description}"
            />
            <div id="description-error" class="field-error" data-field="description" role="alert"></div>
          </div>

          <div class="form-group">
            <label for="date" class="form-label">
              Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              class="form-input"
              required
              aria-describedby="date-error"
              value="${this.formData.date}"
            />
            <div id="date-error" class="field-error" data-field="date" role="alert"></div>
          </div>

          <div class="form-group">
            <label for="categoryId" class="form-label">
              Category *
            </label>
            <select
              id="categoryId"
              name="categoryId"
              class="form-select"
              required
              aria-describedby="category-error"
            >
              <option value="">Select category...</option>
              ${categories.map(category => `
                <option 
                  value="${category.id}" 
                  ${category.id === this.formData.categoryId ? 'selected' : ''}
                >
                  ${category.name}
                </option>
              `).join('')}
            </select>
            <div id="category-error" class="field-error" data-field="categoryId" role="alert"></div>
          </div>
        </div>

        <div class="form-footer">
          <button type="button" class="btn btn-secondary" data-action="cancel">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary">
            <span class="btn-text">${this.editMode ? 'Update' : 'Add'} Expense</span>
            <span class="loading-spinner" style="display: none;">⟳</span>
          </button>
        </div>

        <div class="error-message" role="alert" aria-live="polite" style="display: none;"></div>
      </form>
    `;
  }

  /**
   * Add component styles for responsive layout
   */
  addComponentStyles() {
    // Check if styles already added
    if (document.getElementById('expense-form-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'expense-form-styles';
    style.textContent = `
      .form-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      
      .form-group {
        display: flex;
        flex-direction: column;
      }
      
      .form-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        margin-top: 1rem;
      }
      
      @media (min-width: 768px) {
        .form-container {
          flex-direction: column;
        }
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    const form = this.container.querySelector('form');
    const cancelBtn = this.container.querySelector('button[data-action="cancel"]');
    const inputs = this.container.querySelectorAll('input, select, textarea');

    if (form) {
      this.bindDOMEvent(form, 'submit', this.handleSubmit);
    }

    if (cancelBtn) {
      this.bindDOMEvent(cancelBtn, 'click', this.handleCancel);
    }

    inputs.forEach(input => {
      this.bindDOMEvent(input, 'input', this.handleInputChange);
      this.bindDOMEvent(input, 'blur', this.handleInputBlur);
    });

    if (form) {
      this.bindDOMEvent(form, 'change', this.handleFormChange);
    }
  }

  /**
   * Handle form submission
   * @param {Event} event - Submit event
   */
  async handleSubmit(event) {
    event.preventDefault();
    
    try {
      // Get current form data
      const currentFormData = this.getFormData();

      // Validate form
      const isValid = this.validateForm(currentFormData);

      if (!isValid) {
        return;
      }

      // Set loading state
      this.setLoadingState(true);

      // Format data for submission
      const submissionData = {
        ...currentFormData,
        amount: parseFloat(currentFormData.amount)
      };

      // Add ID if in edit mode
      if (this.editMode && this.formData.id) {
        submissionData.id = this.formData.id;
      }

      // Call onSubmit callback and wait for completion
      const result = await this.onSubmit(submissionData);

      // Check if submission was successful
      if (result && result.success !== false) {
        // Clear form if successful
        this.resetForm();
      }
      
      this.setLoadingState(false);

    } catch (error) {
      this.setLoadingState(false);
      this.showSubmissionError('Submission failed. Please try again.');
      console.error('Form submission error:', error);
    }
  }

  /**
   * Handle cancel button click
   * @param {Event} event - Click event
   */
  handleCancel(event) {
    event.preventDefault();
    this.onCancel();
  }

  /**
   * Handle input change events
   * @param {Event} event - Input event
   */
  handleInputChange(event) {
    const { name, value } = event.target;
    
    // Update form data
    this.formData[name] = value;
    
    // Clear field error on change
    this.clearFieldError(name);
    
    // Emit change event
    this.onChange(name, value, this.formData);
  }

  /**
   * Handle input blur events
   * @param {Event} event - Blur event  
   */
  handleInputBlur(event) {
    const { name, value } = event.target;
    
    // Validate field on blur
    this.validateField(name, value);
  }

  /**
   * Handle form change events
   * @param {Event} event - Change event
   */
  handleFormChange(event) {
    // Emit validation event with current form state
    this.onValidation(this.validationErrors, this.formData);
  }

  /**
   * Get current form data
   * @returns {Object} Form data object
   */
  getFormData() {
    const form = this.findElement('form');
    if (!form) return this.formData;
    
    const formData = new FormData(form);
    
    return {
      amount: formData.get('amount') || '',
      description: formData.get('description') || '',
      date: formData.get('date') || '',
      categoryId: formData.get('categoryId') || ''
    };
  }

  /**
   * Set form data and update UI
   * @param {Object} data - Form data to set
   */
  setFormData(data) {
    this.formData = { ...this.formData, ...data };
    
    // Update form fields
    Object.entries(this.formData).forEach(([name, value]) => {
      const field = this.findElement(`[name="${name}"]`);
      if (field) {
        field.value = value;
      }
    });
  }

  /**
   * Validate entire form
   * @returns {boolean} Whether form is valid
   */
  validateForm() {
    const currentFormData = this.getFormData();
    let isFormValid = true;

    // Validate amount
    const amountValue = parseFloat(currentFormData.amount);
    if (!currentFormData.amount || isNaN(amountValue)) {
      this.showFieldError('amount', 'Amount is required');
      isFormValid = false;
    } else {
      const amountResult = validateExpenseAmount(amountValue);
      if (!amountResult.isValid) {
        this.showFieldError('amount', amountResult.errors[0]);
        isFormValid = false;
      }
    }

    // Validate description
    if (!currentFormData.description.trim()) {
      this.showFieldError('description', 'Description is required');
      isFormValid = false;
    } else {
      const descResult = validateExpenseDescription(currentFormData.description);
      if (!descResult.isValid) {
        this.showFieldError('description', descResult.errors[0]);
        isFormValid = false;
      }
    }

    // Validate date
    if (!currentFormData.date) {
      this.showFieldError('date', 'Date is required');
      isFormValid = false;
    } else {
      const dateResult = validateExpenseDate(currentFormData.date);
      if (!dateResult.isValid) {
        this.showFieldError('date', dateResult.errors[0]);
        isFormValid = false;
      }
    }

    // Validate category
    if (!currentFormData.categoryId) {
      this.showFieldError('categoryId', 'Category is required');
      isFormValid = false;
    }

    return isFormValid;
  }

  /**
   * Validate single field
   * @param {string} fieldName - Field name
   * @param {string} value - Field value
   * @returns {boolean} Whether field is valid
   */
  validateField(fieldName, value) {
    let isValid = true;
    let errorMessage = '';

    switch (fieldName) {
      case 'amount':
        const amountValue = parseFloat(value);
        if (!value || isNaN(amountValue)) {
          isValid = false;
          errorMessage = 'Amount is required';
        } else {
          const amountResult = validateExpenseAmount(amountValue);
          if (!amountResult.isValid) {
            isValid = false;
            errorMessage = amountResult.errors[0];
          }
        }
        break;

      case 'description':
        if (!value.trim()) {
          isValid = false;
          errorMessage = 'Description is required';
        } else {
          const descResult = validateExpenseDescription(value);
          if (!descResult.isValid) {
            isValid = false;
            errorMessage = descResult.errors[0];
          }
        }
        break;

      case 'date':
        if (!value) {
          isValid = false;
          errorMessage = 'Date is required';
        } else {
          const dateResult = validateExpenseDate(value);
          if (!dateResult.isValid) {
            isValid = false;
            errorMessage = dateResult.errors[0];
          }
        }
        break;

      case 'categoryId':
        if (!value || value.trim() === '') {
          isValid = false;
          errorMessage = 'Category is required';
        }
        break;
    }

    if (isValid) {
      this.clearFieldError(fieldName);
    } else {
      this.showFieldError(fieldName, errorMessage);
    }

    return isValid;
  }

  /**
   * Reset form to initial state
   */
  resetForm() {
    // Reset form data
    this.formData = {
      amount: '',
      description: '',
      date: formatDateForInput(new Date()),
      categoryId: ''
    };

    // Reset form fields
    const form = this.findElement('form');
    if (form) {
      form.reset();
      
      // Set default date
      const dateField = this.findElement('[name="date"]');
      if (dateField) {
        dateField.value = this.formData.date;
      }
    }

    // Clear errors
    this.clearErrors();
    
    // Reset validation state
    this.validationErrors = {};
  }

  /**
   * Set submitting state
   * @param {boolean} isSubmitting - Whether form is submitting
   */
  setSubmittingState(isSubmitting) {
    const submitBtn = this.findElement('button[type="submit"]');
    const btnText = this.findElement('.btn-text');
    const spinner = this.findElement('.loading-spinner');
    const form = this.findElement('form');

    if (submitBtn) {
      submitBtn.disabled = isSubmitting;
      
      // Add/remove loading class for test compatibility
      if (isSubmitting) {
        submitBtn.classList.add('loading');
      } else {
        submitBtn.classList.remove('loading');
      }
    }

    // Also add loading class to form for easier selector
    if (form) {
      if (isSubmitting) {
        form.classList.add('loading');
      } else {
        form.classList.remove('loading');
      }
    }

    if (btnText && spinner) {
      if (isSubmitting) {
        btnText.style.display = 'none';
        spinner.style.display = 'inline';
      } else {
        btnText.style.display = 'inline';
        spinner.style.display = 'none';
      }
    }

    this.isSubmitting = isSubmitting;
  }

  /**
   * Show error message in form
   * @param {string} message - Error message
   */
  showErrorMessage(message) {
    const errorElement = this.findElement('.error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      
      // Focus error for screen readers
      errorElement.focus();
    }
  }

  /**
   * Clear all error messages
   */
  clearErrors() {
    // Clear general error
    const errorElement = this.findElement('.error-message');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }

    // Clear field errors
    const fieldErrors = this.findElements('.field-error');
    fieldErrors.forEach(error => {
      error.textContent = '';
      error.style.display = 'none';
    });

    // Remove invalid styling
    const invalidFields = this.findElements('.invalid');
    invalidFields.forEach(field => {
      field.removeAttribute('aria-invalid');
      field.classList.remove('invalid');
    });
  }

  /**
   * Clear error for specific field
   * @param {string} fieldName - Field name
   */
  clearFieldError(fieldName) {
    const errorElement = this.findElement(`[data-field="${fieldName}"]`);
    const field = this.findElement(`[name="${fieldName}"]`);
    
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
    
    if (field) {
      field.removeAttribute('aria-invalid');
      field.classList.remove('invalid');
    }
    
    // Remove from validation errors
    delete this.validationErrors[fieldName];
  }

  /**
   * Show error for specific field
   * @param {string} fieldName - Field name
   * @param {string} message - Error message
   */
  showFieldError(fieldName, message) {
    const errorElement = this.findElement(`[data-field="${fieldName}"]`);
    const field = this.findElement(`[name="${fieldName}"]`);
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
    
    if (field) {
      field.setAttribute('aria-invalid', 'true');
      field.classList.add('invalid');
    }
    
    // Add to validation errors
    this.validationErrors[fieldName] = message;
  }

  /**
   * Set loading state for form submission
   * @param {boolean} isLoading - Whether form is in loading state
   */
  setLoadingState(isLoading) {
    this.setSubmittingState(isLoading);
  }

  /**
   * Show submission error message
   * @param {string} message - Error message to display
   */
  showSubmissionError(message) {
    this.showErrorMessage(message);
  }
}