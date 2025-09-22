/**
 * Contract Test: App Integration
 * Purpose: Test main application component and routing
 * This test MUST FAIL until App component is implemented
 */

import { App } from '../../src/App.js';

describe('App Integration Contract', () => {
  let container;
  let app;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    localStorage.clear();
  });

  afterEach(() => {
    document.body.removeChild(container);
    localStorage.clear();
  });

  describe('application initialization', () => {
    test('should initialize and render main app structure', async () => {
      app = new App({ container });
      await app.init();

      expect(container.querySelector('.app')).toBeTruthy();
      expect(container.querySelector('.app-header')).toBeTruthy();
      expect(container.querySelector('.app-navigation')).toBeTruthy();
      expect(container.querySelector('.app-main')).toBeTruthy();
      expect(container.querySelector('.app-footer')).toBeTruthy();
    });

    test('should load and initialize services', async () => {
      app = new App({ container });
      await app.init();

      expect(app.storageService).toBeDefined();
      expect(app.analyticsService).toBeDefined();
      expect(app.router).toBeDefined();
    });

    test('should render navigation menu', async () => {
      app = new App({ container });
      await app.init();

      const navigation = container.querySelector('.app-navigation');
      expect(navigation.querySelector('a[href="#/dashboard"]')).toBeTruthy();
      expect(navigation.querySelector('a[href="#/expenses"]')).toBeTruthy();
      expect(navigation.querySelector('a[href="#/add-expense"]')).toBeTruthy();
      expect(navigation.querySelector('a[href="#/analytics"]')).toBeTruthy();
      expect(navigation.querySelector('a[href="#/settings"]')).toBeTruthy();
    });
  });

  describe('routing', () => {
    test('should navigate to dashboard by default', async () => {
      app = new App({ container });
      await app.init();

      expect(container.querySelector('.dashboard-view')).toBeTruthy();
      expect(container.querySelector('.nav-item.active').getAttribute('href')).toBe('#/dashboard');
    });

    test('should navigate to expenses list', async () => {
      app = new App({ container });
      await app.init();

      const expensesLink = container.querySelector('a[href="#/expenses"]');
      expensesLink.click();

      expect(container.querySelector('.expenses-view')).toBeTruthy();
      expect(container.querySelector('.nav-item.active').getAttribute('href')).toBe('#/expenses');
    });

    test('should navigate to add expense form', async () => {
      app = new App({ container });
      await app.init();

      const addLink = container.querySelector('a[href="#/add-expense"]');
      addLink.click();

      expect(container.querySelector('.add-expense-view')).toBeTruthy();
      expect(container.querySelector('.expense-form')).toBeTruthy();
    });

    test('should handle deep linking', async () => {
      window.location.hash = '#/expenses';
      
      app = new App({ container });
      await app.init();

      expect(container.querySelector('.expenses-view')).toBeTruthy();
    });

    test('should handle 404 routes', async () => {
      window.location.hash = '#/non-existent';
      
      app = new App({ container });
      await app.init();

      expect(container.querySelector('.not-found-view')).toBeTruthy();
    });
  });

  describe('expense management flow', () => {
    test('should add new expense', async () => {
      app = new App({ container });
      await app.init();

      // Navigate to add expense
      const addLink = container.querySelector('a[href="#/add-expense"]');
      addLink.click();

      // Fill and submit form
      const form = container.querySelector('.expense-form form');
      const amountInput = form.querySelector('input[name="amount"]');
      const descriptionInput = form.querySelector('input[name="description"]');
      const dateInput = form.querySelector('input[name="date"]');
      const categorySelect = form.querySelector('select[name="categoryId"]');

      amountInput.value = '25.50';
      descriptionInput.value = 'Test expense';
      dateInput.value = '2025-09-21';
      categorySelect.value = 'default-food';

      const submitEvent = new Event('submit');
      await form.dispatchEvent(submitEvent);

      // Should redirect to expenses list
      expect(container.querySelector('.expenses-view')).toBeTruthy();
      
      // Should show the new expense
      const expenseItems = container.querySelectorAll('.expense-item');
      expect(expenseItems.length).toBe(1);
      expect(expenseItems[0].querySelector('.expense-description').textContent).toBe('Test expense');
    });

    test('should edit existing expense', async () => {
      app = new App({ container });
      await app.init();

      // First add an expense
      await app.storageService.createExpense({
        amount: 50.00,
        description: 'Original expense',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      // Navigate to expenses
      const expensesLink = container.querySelector('a[href="#/expenses"]');
      expensesLink.click();

      // Click edit button
      const editButton = container.querySelector('.edit-button');
      editButton.click();

      // Should navigate to edit form
      expect(container.querySelector('.edit-expense-view')).toBeTruthy();
      expect(container.querySelector('input[name="description"]').value).toBe('Original expense');

      // Update description
      const descriptionInput = container.querySelector('input[name="description"]');
      descriptionInput.value = 'Updated expense';

      const form = container.querySelector('form');
      const submitEvent = new Event('submit');
      await form.dispatchEvent(submitEvent);

      // Should redirect back to expenses
      expect(container.querySelector('.expenses-view')).toBeTruthy();
      
      // Should show updated expense
      const updatedItem = container.querySelector('.expense-item');
      expect(updatedItem.querySelector('.expense-description').textContent).toBe('Updated expense');
    });

    test('should delete expense', async () => {
      app = new App({ container });
      await app.init();

      // Add an expense
      await app.storageService.createExpense({
        amount: 75.00,
        description: 'To be deleted',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      // Navigate to expenses
      const expensesLink = container.querySelector('a[href="#/expenses"]');
      expensesLink.click();

      // Click delete button
      const deleteButton = container.querySelector('.delete-button');
      deleteButton.click();

      // Confirm deletion
      const confirmButton = container.querySelector('.confirm-delete-button');
      await confirmButton.click();

      // Should remove the expense
      const expenseItems = container.querySelectorAll('.expense-item');
      expect(expenseItems.length).toBe(0);
    });
  });

  describe('dashboard integration', () => {
    test('should display analytics on dashboard', async () => {
      app = new App({ container });
      await app.init();

      // Add some test data
      await app.storageService.createExpense({
        amount: 100.00,
        description: 'Test expense 1',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      await app.storageService.createExpense({
        amount: 50.00,
        description: 'Test expense 2',
        date: '2025-09-20',
        categoryId: 'default-transport'
      });

      // Refresh dashboard
      await app.refreshDashboard();

      expect(container.querySelector('.summary-card[data-metric="total"]')).toBeTruthy();
      expect(container.querySelector('.chart-container[data-chart="category"]')).toBeTruthy();
    });

    test('should update dashboard when expenses change', async () => {
      app = new App({ container });
      await app.init();

      const initialTotal = container.querySelector('.summary-card[data-metric="total"] .metric-value').textContent;

      // Add new expense
      await app.storageService.createExpense({
        amount: 25.00,
        description: 'New expense',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      // Trigger dashboard update
      app.emit('expenseAdded');

      const updatedTotal = container.querySelector('.summary-card[data-metric="total"] .metric-value').textContent;
      expect(updatedTotal).not.toBe(initialTotal);
    });
  });

  describe('state management', () => {
    test('should persist application state', async () => {
      app = new App({ container });
      await app.init();

      // Change some settings
      await app.storageService.updateSettings({
        currency: 'EUR',
        theme: 'dark'
      });

      // Create new app instance
      const newApp = new App({ container: document.createElement('div') });
      await newApp.init();

      const settings = await newApp.storageService.getSettings();
      expect(settings.currency).toBe('EUR');
      expect(settings.theme).toBe('dark');
    });

    test('should handle offline state', async () => {
      app = new App({ container });
      await app.init();

      // Simulate offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      window.dispatchEvent(new Event('offline'));

      expect(container.querySelector('.offline-indicator')).toBeTruthy();
    });

    test('should sync when coming back online', async () => {
      app = new App({ container });
      await app.init();

      // Go offline and add expense
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      await app.storageService.createExpense({
        amount: 30.00,
        description: 'Offline expense',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      // Come back online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });

      window.dispatchEvent(new Event('online'));

      // Should attempt to sync
      expect(app.syncService.sync).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    test('should display error notifications', async () => {
      app = new App({ container });
      await app.init();

      // Trigger an error
      app.showError('Test error message');

      expect(container.querySelector('.error-notification')).toBeTruthy();
      expect(container.querySelector('.error-notification').textContent).toContain('Test error message');
    });

    test('should handle service initialization errors', async () => {
      // Mock service failure
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const mockStorageService = {
        init: jest.fn().mockRejectedValue(new Error('Storage init failed'))
      };

      app = new App({ 
        container,
        storageService: mockStorageService
      });

      await app.init();

      expect(container.querySelector('.initialization-error')).toBeTruthy();
    });

    test('should recover from errors gracefully', async () => {
      app = new App({ container });
      await app.init();

      // Trigger error state
      app.showError('Test error');

      // Should still be navigable
      const dashboardLink = container.querySelector('a[href="#/dashboard"]');
      dashboardLink.click();

      expect(container.querySelector('.dashboard-view')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    test('should support keyboard navigation', async () => {
      app = new App({ container });
      await app.init();

      const navLinks = container.querySelectorAll('.app-navigation a');
      navLinks.forEach(link => {
        expect(link.tabIndex).not.toBe(-1);
      });
    });

    test('should provide skip links', async () => {
      app = new App({ container });
      await app.init();

      expect(container.querySelector('.skip-link')).toBeTruthy();
      expect(container.querySelector('.skip-link').getAttribute('href')).toBe('#main-content');
    });

    test('should update page title for screen readers', async () => {
      app = new App({ container });
      await app.init();

      const expensesLink = container.querySelector('a[href="#/expenses"]');
      expensesLink.click();

      expect(document.title).toContain('Expenses');
    });
  });

  describe('performance', () => {
    test('should lazy load routes', async () => {
      app = new App({ container });
      await app.init();

      // Dashboard should be loaded
      expect(container.querySelector('.dashboard-view')).toBeTruthy();

      // Other routes should not be loaded yet
      expect(container.querySelector('.analytics-view')).toBeFalsy();
    });

    test('should cache component instances', async () => {
      app = new App({ container });
      await app.init();

      const dashboardLink = container.querySelector('a[href="#/dashboard"]');
      const expensesLink = container.querySelector('a[href="#/expenses"]');

      // Navigate between routes
      expensesLink.click();
      dashboardLink.click();

      // Components should be cached and reused
      expect(app.componentCache.has('dashboard')).toBe(true);
      expect(app.componentCache.has('expenses')).toBe(true);
    });
  });
});