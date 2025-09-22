/**
 * Contract Test: StorageService Category Management
 * Purpose: Test category CRUD operations interface contract
 * This test MUST FAIL until StorageService is implemented
 */

import { StorageService } from '../../src/services/StorageService.js';

describe('StorageService Category Management Contract', () => {
  let storageService;

  beforeEach(() => {
    localStorage.clear();
    storageService = new StorageService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('createCategory()', () => {
    test('should create category with valid data', async () => {
      const categoryData = {
        name: 'Test Category',
        color: '#FF6B6B',
        icon: 'test-icon',
        isDefault: false
      };

      const result = await storageService.createCategory(categoryData);

      expect(result).toBeValidCategory();
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Test Category');
      expect(result.color).toBe('#FF6B6B');
      expect(result.icon).toBe('test-icon');
      expect(result.isDefault).toBe(false);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    test('should reject category with duplicate name', async () => {
      const categoryData = {
        name: 'Duplicate',
        color: '#FF6B6B',
        icon: 'test',
        isDefault: false
      };

      await storageService.createCategory(categoryData);

      await expect(storageService.createCategory(categoryData))
        .rejects.toThrow('category name must be unique');
    });

    test('should validate required fields', async () => {
      await expect(storageService.createCategory({}))
        .rejects.toThrow('name is required');
    });

    test('should validate color format', async () => {
      const invalidData = {
        name: 'Test',
        color: 'invalid-color',
        icon: 'test',
        isDefault: false
      };

      await expect(storageService.createCategory(invalidData))
        .rejects.toThrow('color must be valid hex format');
    });
  });

  describe('listCategories()', () => {
    test('should return default categories when none exist', async () => {
      const result = await storageService.listCategories();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every(cat => cat.isDefault)).toBe(true);
    });

    test('should include user-created categories', async () => {
      const customCategory = await storageService.createCategory({
        name: 'Custom Category',
        color: '#FF6B6B',
        icon: 'custom',
        isDefault: false
      });

      const result = await storageService.listCategories();

      expect(result).toContainEqual(customCategory);
    });
  });

  describe('updateCategory()', () => {
    test('should update category fields', async () => {
      const category = await storageService.createCategory({
        name: 'Original',
        color: '#FF6B6B',
        icon: 'original',
        isDefault: false
      });

      const updates = {
        name: 'Updated',
        color: '#00FF00'
      };

      const result = await storageService.updateCategory(category.id, updates);

      expect(result.name).toBe('Updated');
      expect(result.color).toBe('#00FF00');
      expect(result.icon).toBe('original'); // Unchanged
      expect(result.updatedAt).not.toBe(category.updatedAt);
    });

    test('should prevent updating default categories', async () => {
      const categories = await storageService.listCategories();
      const defaultCategory = categories.find(cat => cat.isDefault);

      await expect(storageService.updateCategory(defaultCategory.id, { name: 'Changed' }))
        .rejects.toThrow('cannot modify default categories');
    });
  });

  describe('deleteCategory()', () => {
    test('should delete user-created category', async () => {
      const category = await storageService.createCategory({
        name: 'To Delete',
        color: '#FF6B6B',
        icon: 'delete',
        isDefault: false
      });

      const result = await storageService.deleteCategory(category.id);
      expect(result).toBe(true);

      const categories = await storageService.listCategories();
      expect(categories.find(cat => cat.id === category.id)).toBeUndefined();
    });

    test('should prevent deleting default categories', async () => {
      const categories = await storageService.listCategories();
      const defaultCategory = categories.find(cat => cat.isDefault);

      await expect(storageService.deleteCategory(defaultCategory.id))
        .rejects.toThrow('cannot delete default categories');
    });

    test('should handle category with existing expenses', async () => {
      const category = await storageService.createCategory({
        name: 'Has Expenses',
        color: '#FF6B6B',
        icon: 'expenses',
        isDefault: false
      });

      await storageService.createExpense({
        amount: 25.00,
        description: 'Test expense',
        date: '2025-09-21',
        categoryId: category.id
      });

      // Should move expenses to "Other" category before deletion
      const result = await storageService.deleteCategory(category.id);
      expect(result).toBe(true);

      const expenses = await storageService.listExpenses();
      const otherCategory = (await storageService.listCategories())
        .find(cat => cat.name === 'Other');
      
      expect(expenses[0].categoryId).toBe(otherCategory.id);
    });
  });

  describe('getCategory()', () => {
    test('should retrieve category by ID', async () => {
      const category = await storageService.createCategory({
        name: 'Get Test',
        color: '#FF6B6B',
        icon: 'get',
        isDefault: false
      });

      const result = await storageService.getCategory(category.id);
      expect(result).toEqual(category);
    });

    test('should return null for non-existent category', async () => {
      const result = await storageService.getCategory('non-existent');
      expect(result).toBeNull();
    });
  });
});