/**
 * Contract Test: CategoryManager Component
 * Purpose: Test category management UI component
 * This test MUST FAIL until CategoryManager component is implemented
 */

import { CategoryManager } from '../../src/components/CategoryManager.js';

describe('CategoryManager Component Contract', () => {
  let container;
  let categoryManager;
  let mockStorageService;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    mockStorageService = {
      listCategories: jest.fn(),
      createCategory: jest.fn(),
      updateCategory: jest.fn(),
      deleteCategory: jest.fn()
    };

    categoryManager = new CategoryManager({
      container,
      storageService: mockStorageService,
      onCategoryChange: jest.fn()
    });
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('initialization', () => {
    test('should render category management interface', async () => {
      mockStorageService.listCategories.mockResolvedValue([
        { id: 'cat-1', name: 'Food', color: '#FF6B6B', icon: 'utensils', isDefault: true },
        { id: 'cat-2', name: 'Custom', color: '#00FF00', icon: 'custom', isDefault: false }
      ]);

      await categoryManager.render();

      expect(container.querySelector('.category-manager')).toBeTruthy();
      expect(container.querySelector('.category-list')).toBeTruthy();
      expect(container.querySelector('.add-category-button')).toBeTruthy();
    });

    test('should display existing categories', async () => {
      mockStorageService.listCategories.mockResolvedValue([
        { id: 'cat-1', name: 'Food', color: '#FF6B6B', icon: 'utensils', isDefault: true }
      ]);

      await categoryManager.render();

      const categoryItem = container.querySelector('.category-item');
      expect(categoryItem.querySelector('.category-name').textContent).toBe('Food');
      expect(categoryItem.querySelector('.category-icon').style.color).toBe('rgb(255, 107, 107)');
    });
  });

  describe('category creation', () => {
    test('should show add category form', () => {
      categoryManager.render();

      const addButton = container.querySelector('.add-category-button');
      addButton.click();

      expect(container.querySelector('.category-form')).toBeTruthy();
      expect(container.querySelector('input[name="name"]')).toBeTruthy();
      expect(container.querySelector('input[name="color"]')).toBeTruthy();
      expect(container.querySelector('select[name="icon"]')).toBeTruthy();
    });

    test('should validate category form', () => {
      categoryManager.render();

      const addButton = container.querySelector('.add-category-button');
      addButton.click();

      const form = container.querySelector('.category-form');
      const submitEvent = new Event('submit');
      form.dispatchEvent(submitEvent);

      expect(container.querySelector('.field-error[data-field="name"]')).toBeTruthy();
    });

    test('should create new category', async () => {
      mockStorageService.createCategory.mockResolvedValue({
        id: 'new-cat',
        name: 'New Category',
        color: '#00FF00',
        icon: 'star',
        isDefault: false
      });

      categoryManager.render();

      const addButton = container.querySelector('.add-category-button');
      addButton.click();

      // Fill form
      container.querySelector('input[name="name"]').value = 'New Category';
      container.querySelector('input[name="color"]').value = '#00FF00';
      container.querySelector('select[name="icon"]').value = 'star';

      const form = container.querySelector('.category-form');
      const submitEvent = new Event('submit');
      await form.dispatchEvent(submitEvent);

      expect(mockStorageService.createCategory).toHaveBeenCalledWith({
        name: 'New Category',
        color: '#00FF00',
        icon: 'star',
        isDefault: false
      });
    });
  });

  describe('category editing', () => {
    test('should prevent editing default categories', async () => {
      mockStorageService.listCategories.mockResolvedValue([
        { id: 'cat-1', name: 'Food', color: '#FF6B6B', icon: 'utensils', isDefault: true }
      ]);

      await categoryManager.render();

      const editButton = container.querySelector('.category-item .edit-button');
      expect(editButton.disabled).toBe(true);
    });

    test('should allow editing custom categories', async () => {
      mockStorageService.listCategories.mockResolvedValue([
        { id: 'cat-1', name: 'Custom', color: '#00FF00', icon: 'star', isDefault: false }
      ]);

      await categoryManager.render();

      const editButton = container.querySelector('.category-item .edit-button');
      editButton.click();

      expect(container.querySelector('.category-form')).toBeTruthy();
      expect(container.querySelector('input[name="name"]').value).toBe('Custom');
    });
  });

  describe('category deletion', () => {
    test('should prevent deleting default categories', async () => {
      mockStorageService.listCategories.mockResolvedValue([
        { id: 'cat-1', name: 'Food', color: '#FF6B6B', icon: 'utensils', isDefault: true }
      ]);

      await categoryManager.render();

      const deleteButton = container.querySelector('.category-item .delete-button');
      expect(deleteButton.disabled).toBe(true);
    });

    test('should show confirmation for deletion', async () => {
      mockStorageService.listCategories.mockResolvedValue([
        { id: 'cat-1', name: 'Custom', color: '#00FF00', icon: 'star', isDefault: false }
      ]);

      await categoryManager.render();

      const deleteButton = container.querySelector('.category-item .delete-button');
      deleteButton.click();

      expect(container.querySelector('.delete-confirmation')).toBeTruthy();
    });
  });

  describe('color picker', () => {
    test('should provide color presets', () => {
      categoryManager.render();

      const addButton = container.querySelector('.add-category-button');
      addButton.click();

      const colorPresets = container.querySelectorAll('.color-preset');
      expect(colorPresets.length).toBeGreaterThan(5);
    });

    test('should support custom color input', () => {
      categoryManager.render();

      const addButton = container.querySelector('.add-category-button');
      addButton.click();

      const colorInput = container.querySelector('input[name="color"]');
      expect(colorInput.type).toBe('color');
    });
  });
});