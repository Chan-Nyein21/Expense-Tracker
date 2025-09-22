/**
 * Contract Test: ExpenseForm Component
 * Purpose: Test expense form UI component interface
 * This test MUST FAIL until ExpenseForm component is implemented
 */

import { ExpenseForm } from '../../src/components/ExpenseForm.js';

describe('ExpenseForm Component Contract', () => {
  let container;
  let expenseForm;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Mock categories for testing
    const mockCategories = [
      { id: 'default-food', name: 'Food', icon: '🍕', color: '#FF6B6B' },
      { id: 'default-transport', name: 'Transport', icon: '🚗', color: '#4ECDC4' }
    ];
    
    expenseForm = new ExpenseForm({
      container,
      onSubmit: jest.fn(),
      onCancel: jest.fn(),
      categories: mockCategories
    });
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('initialization', () => {
    test('should render form elements', () => {
      expenseForm.render();

      expect(container.querySelector('form')).toBeTruthy();
      expect(container.querySelector('input[name="amount"]')).toBeTruthy();
      expect(container.querySelector('input[name="description"]')).toBeTruthy();
      expect(container.querySelector('input[name="date"]')).toBeTruthy();
      expect(container.querySelector('select[name="categoryId"]')).toBeTruthy();
      expect(container.querySelector('button[type="submit"]')).toBeTruthy();
    });

    test('should set default values', () => {
      expenseForm.render();

      const dateInput = container.querySelector('input[name="date"]');
      const today = new Date().toISOString().split('T')[0];
      expect(dateInput.value).toBe(today);
    });

    test('should populate categories dropdown', async () => {
      await expenseForm.render();

      const categorySelect = container.querySelector('select[name="categoryId"]');
      const options = categorySelect.querySelectorAll('option');
      
      expect(options.length).toBeGreaterThan(1); // At least one option plus default
      expect(options[0].value).toBe('');
      expect(options[0].textContent).toBe('Select category...');
    });
  });

  describe('form validation', () => {
    test('should validate required fields', () => {
      expenseForm.render();

      const form = container.querySelector('form');
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      expect(container.querySelector('.error-message')).toBeTruthy();
      expect(expenseForm.onSubmit).not.toHaveBeenCalled();
    });

    test('should validate amount format', () => {
      expenseForm.render();

      const amountInput = container.querySelector('input[name="amount"]');
      amountInput.value = 'invalid-amount';

      const form = container.querySelector('form');
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      expect(container.querySelector('.field-error[data-field="amount"]')).toBeTruthy();
    });

    test('should validate positive amount', () => {
      expenseForm.render();

      const amountInput = container.querySelector('input[name="amount"]');
      amountInput.value = '-50.00';

      const form = container.querySelector('form');
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      const errorElement = container.querySelector('.field-error[data-field="amount"]');
      expect(errorElement.textContent).toContain('must be positive');
    });

    test('should validate date format', () => {
      expenseForm.render();

      const dateInput = container.querySelector('input[name="date"]');
      dateInput.value = 'invalid-date';

      const form = container.querySelector('form');
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      expect(container.querySelector('.field-error[data-field="date"]')).toBeTruthy();
    });

    test('should validate future dates', () => {
      expenseForm.render();

      const dateInput = container.querySelector('input[name="date"]');
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      dateInput.value = futureDate.toISOString().split('T')[0];

      const form = container.querySelector('form');
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      const errorElement = container.querySelector('.field-error[data-field="date"]');
      expect(errorElement.textContent).toContain('cannot be in the future');
    });

    test('should validate description length', () => {
      expenseForm.render();

      const descriptionInput = container.querySelector('input[name="description"]');
      descriptionInput.value = 'a'.repeat(256); // Too long

      const form = container.querySelector('form');
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      const errorElement = container.querySelector('.field-error[data-field="description"]');
      expect(errorElement.textContent).toContain('too long');
    });
  });

  describe('form submission', () => {
    test('should submit valid form data', () => {
      expenseForm.render();

      // Wait for categories to load and get the first available category
      const categorySelect = container.querySelector('select[name="categoryId"]');
      const categoryOptions = categorySelect.querySelectorAll('option[value]:not([value=""])');
      const firstCategoryValue = categoryOptions.length > 0 ? categoryOptions[0].value : 'default-food';

      // Fill form with valid data
      container.querySelector('input[name="amount"]').value = '25.50';
      container.querySelector('input[name="description"]').value = 'Test expense';
      container.querySelector('input[name="date"]').value = '2025-09-21';
      categorySelect.value = firstCategoryValue;

      const form = container.querySelector('form');
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      expect(expenseForm.onSubmit).toHaveBeenCalledWith({
        amount: 25.50,
        description: 'Test expense',
        date: '2025-09-21',
        categoryId: firstCategoryValue
      });
    });

    test('should clear form after successful submission', async () => {
      expenseForm.render();

      // Fill and submit form with all required fields
      container.querySelector('input[name="amount"]').value = '25.50';
      container.querySelector('input[name="description"]').value = 'Test expense';
      
      // Set a category if dropdown has options
      const categorySelect = container.querySelector('select[name="categoryId"]');
      const options = categorySelect.querySelectorAll('option');
      if (options.length > 1) {
        categorySelect.value = options[1].value; // Select first non-empty option
      }

      // Mock successful submission
      expenseForm.onSubmit.mockResolvedValue({ success: true });

      // Check if form is valid first
      expect(expenseForm.onSubmit).not.toHaveBeenCalled();

      const form = container.querySelector('form');
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if onSubmit was called
      expect(expenseForm.onSubmit).toHaveBeenCalled();

      expect(container.querySelector('input[name="amount"]').value).toBe('');
      expect(container.querySelector('input[name="description"]').value).toBe('');
    });

    test('should show loading state during submission', async () => {
      expenseForm.render();

      // Fill form with all required fields
      container.querySelector('input[name="amount"]').value = '25.50';
      container.querySelector('input[name="description"]').value = 'Test expense';
      
      // Set a category if dropdown has options
      const categorySelect = container.querySelector('select[name="categoryId"]');
      const options = categorySelect.querySelectorAll('option');
      if (options.length > 1) {
        categorySelect.value = options[1].value; // Select first non-empty option
      }

      // Mock slow submission
      expenseForm.onSubmit.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      );

      const form = container.querySelector('form');
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      expect(container.querySelector('.loading')).toBeTruthy();
      expect(container.querySelector('button[type="submit"]').disabled).toBe(true);
    });

    test('should handle submission errors', async () => {
      expenseForm.render();

      // Fill form with all required fields
      container.querySelector('input[name="amount"]').value = '25.50';
      container.querySelector('input[name="description"]').value = 'Test expense';
      
      // Set a category if dropdown has options
      const categorySelect = container.querySelector('select[name="categoryId"]');
      const options = categorySelect.querySelectorAll('option');
      if (options.length > 1) {
        categorySelect.value = options[1].value; // Select first non-empty option
      }

      // Mock failed submission
      expenseForm.onSubmit.mockRejectedValue(new Error('Submission failed'));

      const form = container.querySelector('form');
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      // Wait for async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(container.querySelector('.error-message')).toBeTruthy();
      expect(container.querySelector('.error-message').textContent).toContain('Submission failed');
    });
  });

  describe('edit mode', () => {
    test('should populate form with existing expense data', () => {
      const existingExpense = {
        id: 'expense-1',
        amount: 75.25,
        description: 'Existing expense',
        date: '2025-09-20',
        categoryId: 'default-transport'
      };

      // Mock categories for edit mode test
      const mockCategories = [
        { id: 'default-food', name: 'Food', icon: '🍕', color: '#FF6B6B' },
        { id: 'default-transport', name: 'Transport', icon: '🚗', color: '#4ECDC4' }
      ];

      expenseForm = new ExpenseForm({
        container,
        expense: existingExpense,
        onSubmit: jest.fn(),
        onCancel: jest.fn(),
        categories: mockCategories
      });

      expenseForm.render();

      expect(container.querySelector('input[name="amount"]').value).toBe('75.25');
      expect(container.querySelector('input[name="description"]').value).toBe('Existing expense');
      expect(container.querySelector('input[name="date"]').value).toBe('2025-09-20');
      expect(container.querySelector('select[name="categoryId"]').value).toBe('default-transport');
    });

    test('should show update button in edit mode', () => {
      const existingExpense = {
        id: 'expense-1',
        amount: 50.00,
        description: 'Edit test',
        date: '2025-09-20',
        categoryId: 'default-food'
      };

      // Mock categories for edit mode test
      const mockCategories = [
        { id: 'default-food', name: 'Food', icon: '🍕', color: '#FF6B6B' },
        { id: 'default-transport', name: 'Transport', icon: '🚗', color: '#4ECDC4' }
      ];

      expenseForm = new ExpenseForm({
        container,
        expense: existingExpense,
        onSubmit: jest.fn(),
        categories: mockCategories
      });

      expenseForm.render();

      const submitButton = container.querySelector('button[type="submit"]');
      expect(submitButton.textContent).toContain('Update');
    });

    test('should include expense ID in edit submission', () => {
      const existingExpense = {
        id: 'expense-1',
        amount: 50.00,
        description: 'Edit test',
        date: '2025-09-20',
        categoryId: 'default-food'
      };

      // Mock categories for edit mode test
      const mockCategories = [
        { id: 'default-food', name: 'Food', icon: '🍕', color: '#FF6B6B' },
        { id: 'default-transport', name: 'Transport', icon: '🚗', color: '#4ECDC4' }
      ];

      expenseForm = new ExpenseForm({
        container,
        expense: existingExpense,
        onSubmit: jest.fn(),
        categories: mockCategories
      });

      expenseForm.render();

      const form = container.querySelector('form');
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      expect(expenseForm.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'expense-1'
        })
      );
    });
  });

  describe('accessibility', () => {
    test('should have proper form labels', () => {
      expenseForm.render();

      expect(container.querySelector('label[for="amount"]')).toBeTruthy();
      expect(container.querySelector('label[for="description"]')).toBeTruthy();
      expect(container.querySelector('label[for="date"]')).toBeTruthy();
      expect(container.querySelector('label[for="categoryId"]')).toBeTruthy();
    });

    test('should associate error messages with fields', () => {
      expenseForm.render();

      // Trigger validation error
      const form = container.querySelector('form');
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      const amountInput = container.querySelector('input[name="amount"]');
      const errorMessage = container.querySelector('.field-error[data-field="amount"]');
      
      expect(amountInput.getAttribute('aria-describedby')).toBe(errorMessage.id);
      expect(amountInput.getAttribute('aria-invalid')).toBe('true');
    });

    test('should support keyboard navigation', () => {
      expenseForm.render();

      const inputs = container.querySelectorAll('input, select, button');
      inputs.forEach(input => {
        expect(input.tabIndex).not.toBe(-1);
      });
    });
  });

  describe('responsive behavior', () => {
    test('should adapt to mobile layout', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      expenseForm.render();

      expect(container.querySelector('.form-mobile')).toBeTruthy();
    });

    test('should stack form fields vertically on small screens', () => {
      expenseForm.render();

      const formContainer = container.querySelector('.form-container');
      expect(getComputedStyle(formContainer).flexDirection).toBe('column');
    });
  });
});