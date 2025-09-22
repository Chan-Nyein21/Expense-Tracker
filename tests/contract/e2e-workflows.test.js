/**
 * Contract Test: End-to-End Workflows
 * Purpose: Test complete user journeys and application workflows
 * This test MUST FAIL until full application is implemented
 */

import { App } from '../../src/App.js';

describe('E2E Workflow Contract Tests', () => {
  let container;
  let app;

  beforeEach(async () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    localStorage.clear();
    
    app = new App({ container });
    await app.init();
  });

  afterEach(() => {
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
    localStorage.clear();
  });

  describe('complete expense management workflow', () => {
    test('should complete full expense lifecycle: create -> view -> edit -> delete', async () => {
      // Step 1: Navigate to add expense page
      const addExpenseLink = container.querySelector('a[href="#/add-expense"]');
      addExpenseLink.click();

      expect(container.querySelector('.add-expense-view')).toBeTruthy();

      // Step 2: Fill and submit expense form
      const form = container.querySelector('.expense-form form');
      const amountInput = form.querySelector('input[name="amount"]');
      const descriptionInput = form.querySelector('input[name="description"]');
      const dateInput = form.querySelector('input[name="date"]');
      const categorySelect = form.querySelector('select[name="categoryId"]');

      amountInput.value = '52.75';
      descriptionInput.value = 'Test restaurant meal';
      dateInput.value = '2025-09-21';
      categorySelect.value = 'default-food';

      const submitEvent = new Event('submit');
      await form.dispatchEvent(submitEvent);

      // Step 3: Verify redirect to expenses list
      expect(container.querySelector('.expenses-view')).toBeTruthy();

      // Step 4: Verify expense appears in list
      const expenseItems = container.querySelectorAll('.expense-item');
      expect(expenseItems.length).toBe(1);
      
      const expenseItem = expenseItems[0];
      expect(expenseItem.querySelector('.expense-amount').textContent).toContain('$52.75');
      expect(expenseItem.querySelector('.expense-description').textContent).toBe('Test restaurant meal');

      // Step 5: Edit the expense
      const editButton = expenseItem.querySelector('.edit-button');
      editButton.click();

      expect(container.querySelector('.edit-expense-view')).toBeTruthy();

      // Step 6: Update expense details
      const editForm = container.querySelector('.expense-form form');
      const editDescriptionInput = editForm.querySelector('input[name="description"]');
      editDescriptionInput.value = 'Updated restaurant meal';

      const updateSubmitEvent = new Event('submit');
      await editForm.dispatchEvent(updateSubmitEvent);

      // Step 7: Verify update in expenses list
      expect(container.querySelector('.expenses-view')).toBeTruthy();
      
      const updatedItem = container.querySelector('.expense-item');
      expect(updatedItem.querySelector('.expense-description').textContent).toBe('Updated restaurant meal');

      // Step 8: Delete the expense
      const deleteButton = updatedItem.querySelector('.delete-button');
      deleteButton.click();

      // Step 9: Confirm deletion
      const confirmButton = container.querySelector('.confirm-delete-button');
      await confirmButton.click();

      // Step 10: Verify expense is removed
      const remainingItems = container.querySelectorAll('.expense-item');
      expect(remainingItems.length).toBe(0);
    });

    test('should show analytics updates in real-time during expense workflow', async () => {
      // Start at dashboard
      const dashboardLink = container.querySelector('a[href="#/dashboard"]');
      dashboardLink.click();

      // Initial dashboard should show zero expenses
      let totalCard = container.querySelector('.summary-card[data-metric="total"] .metric-value');
      expect(totalCard.textContent).toContain('$0');

      // Add first expense
      const addExpenseLink = container.querySelector('a[href="#/add-expense"]');
      addExpenseLink.click();

      const form = container.querySelector('.expense-form form');
      form.querySelector('input[name="amount"]').value = '100.00';
      form.querySelector('input[name="description"]').value = 'First expense';
      form.querySelector('input[name="date"]').value = '2025-09-21';
      form.querySelector('select[name="categoryId"]').value = 'default-food';

      await form.dispatchEvent(new Event('submit'));

      // Return to dashboard and verify update
      dashboardLink.click();
      await app.refreshDashboard();

      totalCard = container.querySelector('.summary-card[data-metric="total"] .metric-value');
      expect(totalCard.textContent).toContain('$100');

      // Add second expense
      addExpenseLink.click();

      const secondForm = container.querySelector('.expense-form form');
      secondForm.querySelector('input[name="amount"]').value = '50.00';
      secondForm.querySelector('input[name="description"]').value = 'Second expense';
      secondForm.querySelector('input[name="date"]').value = '2025-09-21';
      secondForm.querySelector('select[name="categoryId"]').value = 'default-transport';

      await secondForm.dispatchEvent(new Event('submit'));

      // Return to dashboard and verify cumulative total
      dashboardLink.click();
      await app.refreshDashboard();

      totalCard = container.querySelector('.summary-card[data-metric="total"] .metric-value');
      expect(totalCard.textContent).toContain('$150');

      // Verify category breakdown
      const categoryChart = container.querySelector('#categoryChart');
      expect(categoryChart).toBeTruthy();
    });
  });

  describe('budget management workflow', () => {
    test('should complete budget setup and monitoring workflow', async () => {
      // Step 1: Navigate to settings
      const settingsLink = container.querySelector('a[href="#/settings"]');
      settingsLink.click();

      expect(container.querySelector('.settings-view')).toBeTruthy();

      // Step 2: Set up budget for food category
      const budgetSection = container.querySelector('.budget-settings');
      const foodBudgetInput = budgetSection.querySelector('input[data-category="default-food"]');
      foodBudgetInput.value = '200.00';
      foodBudgetInput.dispatchEvent(new Event('change'));

      // Step 3: Add expenses that approach budget limit
      const addExpenseLink = container.querySelector('a[href="#/add-expense"]');
      addExpenseLink.click();

      // Add expense consuming 75% of budget
      let form = container.querySelector('.expense-form form');
      form.querySelector('input[name="amount"]').value = '150.00';
      form.querySelector('input[name="description"]').value = 'Large food expense';
      form.querySelector('input[name="date"]').value = '2025-09-21';
      form.querySelector('select[name="categoryId"]').value = 'default-food';

      await form.dispatchEvent(new Event('submit'));

      // Step 4: Check dashboard for budget warning
      const dashboardLink = container.querySelector('a[href="#/dashboard"]');
      dashboardLink.click();

      const budgetCard = container.querySelector('.summary-card[data-metric="budget"]');
      expect(budgetCard.querySelector('.metric-value').textContent).toContain('75%');
      expect(budgetCard.classList.contains('warning')).toBe(true);

      // Step 5: Add expense that exceeds budget
      addExpenseLink.click();

      form = container.querySelector('.expense-form form');
      form.querySelector('input[name="amount"]').value = '75.00';
      form.querySelector('input[name="description"]').value = 'Over budget expense';
      form.querySelector('input[name="date"]').value = '2025-09-21';
      form.querySelector('select[name="categoryId"]').value = 'default-food';

      await form.dispatchEvent(new Event('submit'));

      // Step 6: Verify budget exceeded notification
      expect(container.querySelector('.budget-exceeded-notification')).toBeTruthy();

      // Step 7: Check dashboard shows budget exceeded
      dashboardLink.click();

      const updatedBudgetCard = container.querySelector('.summary-card[data-metric="budget"]');
      expect(updatedBudgetCard.querySelector('.metric-value').textContent).toContain('112.5%'); // 225/200
      expect(updatedBudgetCard.classList.contains('exceeded')).toBe(true);
    });
  });

  describe('data export/import workflow', () => {
    test('should complete data backup and restore workflow', async () => {
      // Step 1: Create some test data
      await app.storageService.createExpense({
        amount: 75.00,
        description: 'Original expense',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      await app.storageService.createCategory({
        name: 'Custom Category',
        color: '#FF6B6B',
        icon: 'custom',
        isDefault: false
      });

      // Step 2: Export data
      const settingsLink = container.querySelector('a[href="#/settings"]');
      settingsLink.click();

      const exportButton = container.querySelector('.export-data-button');
      exportButton.click();

      // Verify export was triggered (download should start)
      expect(app.storageService.exportData).toHaveBeenCalled();

      // Step 3: Clear all data
      const clearDataButton = container.querySelector('.clear-data-button');
      clearDataButton.click();

      const confirmClearButton = container.querySelector('.confirm-clear-button');
      await confirmClearButton.click();

      // Step 4: Verify data is cleared
      const dashboardLink = container.querySelector('a[href="#/dashboard"]');
      dashboardLink.click();

      const totalCard = container.querySelector('.summary-card[data-metric="total"] .metric-value');
      expect(totalCard.textContent).toContain('$0');

      // Step 5: Import data back
      settingsLink.click();

      const fileInput = container.querySelector('input[type="file"]');
      const mockExportData = {
        version: '1.0.0',
        exportDate: new Date(),
        data: {
          expenses: [{
            id: 'restored-expense-1',
            amount: 75.00,
            description: 'Original expense',
            date: '2025-09-21',
            categoryId: 'default-food',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }],
          categories: [{
            id: 'restored-cat-1',
            name: 'Custom Category',
            color: '#FF6B6B',
            icon: 'custom',
            isDefault: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }],
          settings: {}
        }
      };

      const file = new File([JSON.stringify(mockExportData)], 'backup.json', { type: 'application/json' });
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        configurable: true
      });

      fileInput.dispatchEvent(new Event('change'));

      // Step 6: Verify data is restored
      dashboardLink.click();

      const restoredTotalCard = container.querySelector('.summary-card[data-metric="total"] .metric-value');
      expect(restoredTotalCard.textContent).toContain('$75');
    });
  });

  describe('responsive design workflow', () => {
    test('should adapt interface for mobile usage workflow', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      // Trigger resize event
      window.dispatchEvent(new Event('resize'));

      // Navigation should become mobile-friendly
      const navigation = container.querySelector('.app-navigation');
      expect(navigation.classList.contains('mobile-nav')).toBe(true);

      // Dashboard cards should stack
      const dashboardLink = container.querySelector('a[href="#/dashboard"]');
      dashboardLink.click();

      const summaryCards = container.querySelector('.summary-cards');
      expect(summaryCards.classList.contains('mobile-stack')).toBe(true);

      // Expense list should show condensed view
      const expensesLink = container.querySelector('a[href="#/expenses"]');
      expensesLink.click();

      const expenseList = container.querySelector('.expense-list');
      expect(expenseList.classList.contains('mobile-layout')).toBe(true);

      // Forms should be touch-friendly
      const addExpenseLink = container.querySelector('a[href="#/add-expense"]');
      addExpenseLink.click();

      const form = container.querySelector('.expense-form');
      expect(form.classList.contains('mobile-form')).toBe(true);

      const inputs = form.querySelectorAll('input, select');
      inputs.forEach(input => {
        expect(parseFloat(getComputedStyle(input).minHeight)).toBeGreaterThan(44); // Touch target size
      });
    });
  });

  describe('accessibility workflow', () => {
    test('should support keyboard-only navigation workflow', () => {
      // Tab through navigation
      const navLinks = container.querySelectorAll('.app-navigation a');
      
      // First link should be focusable
      navLinks[0].focus();
      expect(document.activeElement).toBe(navLinks[0]);

      // Tab to next link
      navLinks[1].focus();
      expect(document.activeElement).toBe(navLinks[1]);

      // Enter should activate link
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      navLinks[1].dispatchEvent(enterEvent);

      // Should navigate to corresponding view
      expect(container.querySelector('.expenses-view')).toBeTruthy();

      // Form navigation
      const addExpenseLink = container.querySelector('a[href="#/add-expense"]');
      addExpenseLink.click();

      const formInputs = container.querySelectorAll('.expense-form input, .expense-form select');
      
      // Tab through form fields
      formInputs[0].focus();
      expect(document.activeElement).toBe(formInputs[0]);

      // All inputs should be keyboard accessible
      formInputs.forEach(input => {
        expect(input.tabIndex).not.toBe(-1);
      });
    });

    test('should provide screen reader accessible workflow', () => {
      // Dashboard should have proper ARIA labels
      const dashboardLink = container.querySelector('a[href="#/dashboard"]');
      dashboardLink.click();

      const dashboard = container.querySelector('.dashboard');
      expect(dashboard.getAttribute('role')).toBe('main');
      expect(dashboard.getAttribute('aria-label')).toBeTruthy();

      // Summary cards should be announced
      const summaryCards = container.querySelectorAll('.summary-card');
      summaryCards.forEach(card => {
        expect(card.getAttribute('aria-label')).toBeTruthy();
      });

      // Form errors should be associated with inputs
      const addExpenseLink = container.querySelector('a[href="#/add-expense"]');
      addExpenseLink.click();

      const form = container.querySelector('.expense-form form');
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      const errorElements = container.querySelectorAll('.field-error');
      errorElements.forEach(error => {
        const fieldName = error.getAttribute('data-field');
        const associatedInput = container.querySelector(`input[name="${fieldName}"], select[name="${fieldName}"]`);
        expect(associatedInput.getAttribute('aria-describedby')).toBe(error.id);
        expect(associatedInput.getAttribute('aria-invalid')).toBe('true');
      });
    });
  });

  describe('offline functionality workflow', () => {
    test('should handle offline expense management workflow', async () => {
      // Go offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      window.dispatchEvent(new Event('offline'));

      // Should show offline indicator
      expect(container.querySelector('.offline-indicator')).toBeTruthy();

      // Add expense while offline
      const addExpenseLink = container.querySelector('a[href="#/add-expense"]');
      addExpenseLink.click();

      const form = container.querySelector('.expense-form form');
      form.querySelector('input[name="amount"]').value = '30.00';
      form.querySelector('input[name="description"]').value = 'Offline expense';
      form.querySelector('input[name="date"]').value = '2025-09-21';
      form.querySelector('select[name="categoryId"]').value = 'default-food';

      await form.dispatchEvent(new Event('submit'));

      // Should show pending sync indicator
      expect(container.querySelector('.pending-sync-indicator')).toBeTruthy();

      // Come back online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });

      window.dispatchEvent(new Event('online'));

      // Should automatically sync
      expect(container.querySelector('.syncing-indicator')).toBeTruthy();

      // After sync, pending indicator should disappear
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for sync
      expect(container.querySelector('.pending-sync-indicator')).toBeFalsy();
    });
  });

  describe('error recovery workflow', () => {
    test('should recover gracefully from various error scenarios', async () => {
      // Scenario 1: Form submission error
      const addExpenseLink = container.querySelector('a[href="#/add-expense"]');
      addExpenseLink.click();

      // Mock submission failure
      jest.spyOn(app.storageService, 'createExpense').mockRejectedValue(new Error('Storage full'));

      const form = container.querySelector('.expense-form form');
      form.querySelector('input[name="amount"]').value = '25.00';
      form.querySelector('input[name="description"]').value = 'Error test';
      form.querySelector('input[name="date"]').value = '2025-09-21';
      form.querySelector('select[name="categoryId"]').value = 'default-food';

      await form.dispatchEvent(new Event('submit'));

      // Should show error message
      expect(container.querySelector('.error-notification')).toBeTruthy();
      expect(container.querySelector('.error-notification').textContent).toContain('Storage full');

      // Should allow retry
      const retryButton = container.querySelector('.retry-button');
      expect(retryButton).toBeTruthy();

      // Scenario 2: Navigation error recovery
      // Mock route error
      jest.spyOn(app.router, 'navigate').mockImplementation(() => {
        throw new Error('Navigation failed');
      });

      const expensesLink = container.querySelector('a[href="#/expenses"]');
      expensesLink.click();

      // Should show error page but maintain navigation
      expect(container.querySelector('.error-view')).toBeTruthy();
      expect(container.querySelector('.app-navigation')).toBeTruthy();

      // Should allow navigation to other routes
      const dashboardLink = container.querySelector('a[href="#/dashboard"]');
      expect(dashboardLink).toBeTruthy();
    });
  });

  describe('performance under load workflow', () => {
    test('should maintain usability with large datasets', async () => {
      // Create many expenses for performance testing
      const expenses = [];
      for (let i = 0; i < 500; i++) {
        expenses.push({
          amount: Math.random() * 100,
          description: `Performance test expense ${i}`,
          date: '2025-09-21',
          categoryId: i % 2 === 0 ? 'default-food' : 'default-transport'
        });
      }

      // Batch create expenses
      const startTime = performance.now();
      for (const expense of expenses) {
        await app.storageService.createExpense(expense);
      }
      const createTime = performance.now() - startTime;

      // Navigate to expenses list
      const expensesLink = container.querySelector('a[href="#/expenses"]');
      
      const navigationStart = performance.now();
      expensesLink.click();
      const navigationTime = performance.now() - navigationStart;

      // Should load list within reasonable time
      expect(navigationTime).toBeLessThan(1000); // 1 second max

      // List should be virtualized for performance
      const expenseItems = container.querySelectorAll('.expense-item');
      expect(expenseItems.length).toBeLessThan(100); // Should not render all 500

      // Navigation to dashboard should be responsive
      const dashboardLink = container.querySelector('a[href="#/dashboard"]');
      
      const dashboardStart = performance.now();
      dashboardLink.click();
      const dashboardTime = performance.now() - dashboardStart;

      expect(dashboardTime).toBeLessThan(500); // 500ms max

      // Analytics should complete within reasonable time
      const analyticsStart = performance.now();
      await app.refreshDashboard();
      const analyticsTime = performance.now() - analyticsStart;

      expect(analyticsTime).toBeLessThan(2000); // 2 seconds max for large dataset
    });
  });
});