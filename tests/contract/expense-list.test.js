/**
 * Contract Test: ExpenseList Component
 * Purpose: Test expense list UI component interface
 * This test MUST FAIL until ExpenseList component is implemented
 */

import { ExpenseList } from '../../src/components/ExpenseList.js';

describe('ExpenseList Component Contract', () => {
  let container;
  let expenseList;
  let mockExpenses;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    mockExpenses = [
      {
        id: 'expense-1',
        amount: 25.50,
        description: 'Coffee',
        date: '2025-09-21',
        categoryId: 'default-food',
        category: { name: 'Food', color: '#FF6B6B', icon: 'utensils' }
      },
      {
        id: 'expense-2',
        amount: 15.75,
        description: 'Bus fare',
        date: '2025-09-20',
        categoryId: 'default-transport',
        category: { name: 'Transport', color: '#4ECDC4', icon: 'car' }
      }
    ];

    expenseList = new ExpenseList({
      container,
      expenses: mockExpenses,
      onEdit: jest.fn(),
      onDelete: jest.fn(),
      onFilter: jest.fn()
    });
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('rendering', () => {
    test('should render expense items', () => {
      expenseList.render();

      const expenseItems = container.querySelectorAll('.expense-item');
      expect(expenseItems.length).toBe(2);
    });

    test('should display expense information', () => {
      expenseList.render();

      const firstItem = container.querySelector('.expense-item');
      expect(firstItem.querySelector('.expense-amount').textContent).toContain('$25.50');
      expect(firstItem.querySelector('.expense-description').textContent).toBe('Coffee');
      expect(firstItem.querySelector('.expense-date').textContent).toContain('2025-09-21');
      expect(firstItem.querySelector('.expense-category').textContent).toBe('Food');
    });

    test('should show category colors and icons', () => {
      expenseList.render();

      const firstItem = container.querySelector('.expense-item');
      const categoryIcon = firstItem.querySelector('.category-icon');
      
      expect(categoryIcon.style.color).toBe('rgb(255, 107, 107)'); // #FF6B6B
      expect(categoryIcon.classList.contains('icon-utensils')).toBe(true);
    });

    test('should show empty state when no expenses', () => {
      expenseList = new ExpenseList({
        container,
        expenses: [],
        onEdit: jest.fn(),
        onDelete: jest.fn()
      });

      expenseList.render();

      expect(container.querySelector('.empty-state')).toBeTruthy();
      expect(container.querySelector('.empty-state').textContent).toContain('No expenses');
    });
  });

  describe('sorting and filtering', () => {
    test('should render filter controls', () => {
      expenseList.render();

      expect(container.querySelector('.filter-controls')).toBeTruthy();
      expect(container.querySelector('select[name="category"]')).toBeTruthy();
      expect(container.querySelector('input[name="dateFrom"]')).toBeTruthy();
      expect(container.querySelector('input[name="dateTo"]')).toBeTruthy();
      expect(container.querySelector('input[name="search"]')).toBeTruthy();
    });

    test('should sort by date (newest first)', () => {
      expenseList.render();

      const sortSelect = container.querySelector('select[name="sort"]');
      sortSelect.value = 'date-desc';
      sortSelect.dispatchEvent(new Event('change'));

      const expenseItems = container.querySelectorAll('.expense-item');
      const firstDate = expenseItems[0].querySelector('.expense-date').textContent;
      const secondDate = expenseItems[1].querySelector('.expense-date').textContent;
      
      expect(firstDate).toContain('2025-09-21');
      expect(secondDate).toContain('2025-09-20');
    });

    test('should sort by amount (highest first)', () => {
      expenseList.render();

      const sortSelect = container.querySelector('select[name="sort"]');
      sortSelect.value = 'amount-desc';
      sortSelect.dispatchEvent(new Event('change'));

      const expenseItems = container.querySelectorAll('.expense-item');
      const firstAmount = expenseItems[0].querySelector('.expense-amount').textContent;
      
      expect(firstAmount).toContain('$25.50');
    });

    test('should filter by category', () => {
      expenseList.render();

      const categoryFilter = container.querySelector('select[name="category"]');
      categoryFilter.value = 'default-food';
      categoryFilter.dispatchEvent(new Event('change'));

      expect(expenseList.onFilter).toHaveBeenCalledWith({
        category: 'default-food'
      });
    });

    test('should filter by date range', () => {
      expenseList.render();

      const dateFromInput = container.querySelector('input[name="dateFrom"]');
      const dateToInput = container.querySelector('input[name="dateTo"]');
      
      dateFromInput.value = '2025-09-20';
      dateToInput.value = '2025-09-21';
      
      dateFromInput.dispatchEvent(new Event('change'));

      expect(expenseList.onFilter).toHaveBeenCalledWith({
        dateFrom: '2025-09-20',
        dateTo: '2025-09-21'
      });
    });

    test('should filter by search text', () => {
      expenseList.render();

      const searchInput = container.querySelector('input[name="search"]');
      searchInput.value = 'coffee';
      searchInput.dispatchEvent(new Event('input'));

      expect(expenseList.onFilter).toHaveBeenCalledWith({
        search: 'coffee'
      });
    });
  });

  describe('pagination', () => {
    test('should show pagination controls for large datasets', () => {
      const manyExpenses = Array.from({ length: 25 }, (_, i) => ({
        id: `expense-${i}`,
        amount: 10.00,
        description: `Expense ${i}`,
        date: '2025-09-21',
        categoryId: 'default-food',
        category: { name: 'Food', color: '#FF6B6B', icon: 'utensils' }
      }));

      expenseList = new ExpenseList({
        container,
        expenses: manyExpenses,
        pageSize: 10
      });

      expenseList.render();

      expect(container.querySelector('.pagination')).toBeTruthy();
      expect(container.querySelectorAll('.page-button').length).toBeGreaterThan(1);
    });

    test('should navigate between pages', () => {
      const manyExpenses = Array.from({ length: 25 }, (_, i) => ({
        id: `expense-${i}`,
        amount: 10.00,
        description: `Expense ${i}`,
        date: '2025-09-21',
        categoryId: 'default-food',
        category: { name: 'Food', color: '#FF6B6B', icon: 'utensils' }
      }));

      expenseList = new ExpenseList({
        container,
        expenses: manyExpenses,
        pageSize: 10
      });

      expenseList.render();

      const nextButton = container.querySelector('.pagination .next-page');
      nextButton.click();

      expect(container.querySelector('.pagination .current-page').textContent).toBe('2');
    });
  });

  describe('actions', () => {
    test('should show edit and delete buttons', () => {
      expenseList.render();

      const firstItem = container.querySelector('.expense-item');
      expect(firstItem.querySelector('.edit-button')).toBeTruthy();
      expect(firstItem.querySelector('.delete-button')).toBeTruthy();
    });

    test('should call onEdit when edit button clicked', () => {
      expenseList.render();

      const editButton = container.querySelector('.edit-button');
      editButton.click();

      expect(expenseList.onEdit).toHaveBeenCalledWith(mockExpenses[0]);
    });

    test('should call onDelete when delete button clicked', () => {
      expenseList.render();

      const deleteButton = container.querySelector('.delete-button');
      deleteButton.click();

      expect(expenseList.onDelete).toHaveBeenCalledWith(mockExpenses[0]);
    });

    test('should show confirmation before delete', () => {
      expenseList.render();

      const deleteButton = container.querySelector('.delete-button');
      deleteButton.click();

      expect(container.querySelector('.delete-confirmation')).toBeTruthy();
    });

    test('should support bulk selection', () => {
      expenseList = new ExpenseList({
        container,
        expenses: mockExpenses,
        enableBulkActions: true,
        onBulkDelete: jest.fn()
      });

      expenseList.render();

      expect(container.querySelector('.bulk-actions')).toBeTruthy();
      expect(container.querySelectorAll('.expense-checkbox').length).toBe(2);
    });

    test('should enable bulk delete when items selected', () => {
      expenseList = new ExpenseList({
        container,
        expenses: mockExpenses,
        enableBulkActions: true,
        onBulkDelete: jest.fn()
      });

      expenseList.render();

      const firstCheckbox = container.querySelector('.expense-checkbox');
      firstCheckbox.checked = true;
      firstCheckbox.dispatchEvent(new Event('change'));

      const bulkDeleteButton = container.querySelector('.bulk-delete-button');
      expect(bulkDeleteButton.disabled).toBe(false);
    });
  });

  describe('responsive design', () => {
    test('should stack expense information on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });

      expenseList.render();

      const expenseItem = container.querySelector('.expense-item');
      expect(expenseItem.classList.contains('mobile-layout')).toBe(true);
    });

    test('should hide non-essential columns on small screens', () => {
      expenseList.render();

      const mediaQuery = window.matchMedia('(max-width: 768px)');
      if (mediaQuery.matches) {
        expect(container.querySelector('.expense-category')).toBeFalsy();
      }
    });
  });

  describe('accessibility', () => {
    test('should have proper ARIA labels', () => {
      expenseList.render();

      const list = container.querySelector('.expense-list');
      expect(list.getAttribute('role')).toBe('list');

      const items = container.querySelectorAll('.expense-item');
      items.forEach(item => {
        expect(item.getAttribute('role')).toBe('listitem');
      });
    });

    test('should support keyboard navigation', () => {
      expenseList.render();

      const editButton = container.querySelector('.edit-button');
      expect(editButton.tabIndex).not.toBe(-1);
      expect(editButton.getAttribute('aria-label')).toContain('Edit expense');
    });

    test('should announce filter changes to screen readers', () => {
      expenseList.render();

      const searchInput = container.querySelector('input[name="search"]');
      searchInput.value = 'coffee';
      searchInput.dispatchEvent(new Event('input'));

      const announcer = container.querySelector('[aria-live="polite"]');
      expect(announcer.textContent).toContain('1 expense found');
    });
  });

  describe('performance', () => {
    test('should virtualize large lists', () => {
      const manyExpenses = Array.from({ length: 1000 }, (_, i) => ({
        id: `expense-${i}`,
        amount: 10.00,
        description: `Expense ${i}`,
        date: '2025-09-21',
        categoryId: 'default-food',
        category: { name: 'Food', color: '#FF6B6B', icon: 'utensils' }
      }));

      expenseList = new ExpenseList({
        container,
        expenses: manyExpenses,
        enableVirtualization: true
      });

      expenseList.render();

      // Should only render visible items
      const renderedItems = container.querySelectorAll('.expense-item');
      expect(renderedItems.length).toBeLessThan(50);
    });

    test('should debounce search input', (done) => {
      expenseList.render();

      const searchInput = container.querySelector('input[name="search"]');
      
      searchInput.value = 'c';
      searchInput.dispatchEvent(new Event('input'));
      
      searchInput.value = 'co';
      searchInput.dispatchEvent(new Event('input'));
      
      searchInput.value = 'cof';
      searchInput.dispatchEvent(new Event('input'));

      setTimeout(() => {
        // Should only call onFilter once after debounce
        expect(expenseList.onFilter).toHaveBeenCalledTimes(1);
        done();
      }, 300);
    });
  });
});