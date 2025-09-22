/**
 * Contract Test: StorageService Data Operations
 * Purpose: Test data export/import, backup, and sync operations
 * This test MUST FAIL until StorageService is implemented
 */

import { StorageService } from '../../src/services/StorageService.js';

describe('StorageService Data Operations Contract', () => {
  let storageService;

  beforeEach(() => {
    localStorage.clear();
    storageService = new StorageService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('exportData()', () => {
    test('should export all user data as JSON', async () => {
      // Create test data
      const category = await storageService.createCategory({
        name: 'Export Test',
        color: '#FF6B6B',
        icon: 'export',
        isDefault: false
      });

      await storageService.createExpense({
        amount: 50.00,
        description: 'Export test expense',
        date: '2025-09-21',
        categoryId: category.id
      });

      const exportData = await storageService.exportData();

      expect(exportData).toBeValidExportData();
      expect(exportData.version).toBeDefined();
      expect(exportData.exportDate).toBeDefined();
      expect(exportData.data.expenses).toBeInstanceOf(Array);
      expect(exportData.data.categories).toBeInstanceOf(Array);
      expect(exportData.data.settings).toBeInstanceOf(Object);
      expect(exportData.data.expenses.length).toBe(1);
    });

    test('should include export metadata', async () => {
      const exportData = await storageService.exportData();

      expect(exportData.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(exportData.exportDate).toBeInstanceOf(Date);
      expect(exportData.totalExpenses).toBeTypeOf('number');
      expect(exportData.totalCategories).toBeTypeOf('number');
    });

    test('should support filtered export', async () => {
      await storageService.createExpense({
        amount: 30.00,
        description: 'Filtered expense',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      const exportData = await storageService.exportData({
        dateRange: {
          start: '2025-09-01',
          end: '2025-09-30'
        },
        includeCategories: false
      });

      expect(exportData.data.expenses).toBeDefined();
      expect(exportData.data.categories).toBeUndefined();
    });
  });

  describe('importData()', () => {
    test('should import valid data structure', async () => {
      const importData = {
        version: '1.0.0',
        exportDate: new Date(),
        data: {
          expenses: [{
            id: 'import-expense-1',
            amount: 75.00,
            description: 'Imported expense',
            date: '2025-09-20',
            categoryId: 'default-food',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }],
          categories: [{
            id: 'import-cat-1',
            name: 'Imported Category',
            color: '#00FF00',
            icon: 'import',
            isDefault: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }],
          settings: {
            currency: 'USD',
            theme: 'light'
          }
        }
      };

      const result = await storageService.importData(importData);

      expect(result.success).toBe(true);
      expect(result.imported.expenses).toBe(1);
      expect(result.imported.categories).toBe(1);
      expect(result.skipped).toBeDefined();
      expect(result.errors).toBeInstanceOf(Array);
    });

    test('should validate import data structure', async () => {
      const invalidData = {
        version: '1.0.0',
        data: {
          expenses: 'invalid-array'
        }
      };

      await expect(storageService.importData(invalidData))
        .rejects.toThrow('invalid data structure');
    });

    test('should handle duplicate data during import', async () => {
      // Create existing expense
      await storageService.createExpense({
        amount: 50.00,
        description: 'Existing expense',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      const importData = {
        version: '1.0.0',
        exportDate: new Date(),
        data: {
          expenses: [{
            amount: 50.00,
            description: 'Existing expense',
            date: '2025-09-21',
            categoryId: 'default-food'
          }],
          categories: [],
          settings: {}
        }
      };

      const result = await storageService.importData(importData, {
        skipDuplicates: true
      });

      expect(result.skipped.expenses).toBe(1);
      expect(result.imported.expenses).toBe(0);
    });

    test('should support merge strategies', async () => {
      const importData = {
        version: '1.0.0',
        exportDate: new Date(),
        data: {
          expenses: [],
          categories: [],
          settings: {
            currency: 'EUR',
            theme: 'dark'
          }
        }
      };

      const result = await storageService.importData(importData, {
        mergeStrategy: 'overwrite'
      });

      expect(result.success).toBe(true);

      const settings = await storageService.getSettings();
      expect(settings.currency).toBe('EUR');
      expect(settings.theme).toBe('dark');
    });
  });

  describe('backup and restore', () => {
    test('should create automatic backups', async () => {
      await storageService.createExpense({
        amount: 100.00,
        description: 'Backup test',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      const backup = await storageService.createBackup();

      expect(backup.id).toBeDefined();
      expect(backup.createdAt).toBeInstanceOf(Date);
      expect(backup.size).toBeTypeOf('number');
      expect(backup.data).toBeDefined();
    });

    test('should list available backups', async () => {
      await storageService.createBackup();
      await storageService.createBackup();

      const backups = await storageService.listBackups();

      expect(Array.isArray(backups)).toBe(true);
      expect(backups.length).toBe(2);
      expect(backups[0].createdAt).toBeInstanceOf(Date);
    });

    test('should restore from backup', async () => {
      // Create initial data
      await storageService.createExpense({
        amount: 50.00,
        description: 'Original',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      const backup = await storageService.createBackup();

      // Modify data
      await storageService.createExpense({
        amount: 75.00,
        description: 'Modified',
        date: '2025-09-21',
        categoryId: 'default-food'
      });

      // Restore
      const result = await storageService.restoreBackup(backup.id);
      expect(result.success).toBe(true);

      const expenses = await storageService.listExpenses();
      expect(expenses.length).toBe(1);
      expect(expenses[0].description).toBe('Original');
    });

    test('should manage backup retention', async () => {
      // Create many backups
      for (let i = 0; i < 15; i++) {
        await storageService.createBackup();
      }

      const backups = await storageService.listBackups();
      
      // Should only keep 10 most recent backups
      expect(backups.length).toBeLessThanOrEqual(10);
    });
  });

  describe('storage optimization', () => {
    test('should compress large datasets', async () => {
      // Create many expenses
      for (let i = 0; i < 100; i++) {
        await storageService.createExpense({
          amount: Math.random() * 100,
          description: `Test expense ${i}`,
          date: '2025-09-21',
          categoryId: 'default-food'
        });
      }

      const stats = await storageService.getStorageStats();
      
      expect(stats.totalSize).toBeDefined();
      expect(stats.compressedSize).toBeLessThan(stats.totalSize);
      expect(stats.compressionRatio).toBeGreaterThan(0);
    });

    test('should perform data cleanup', async () => {
      // Create old data
      const oldExpense = await storageService.createExpense({
        amount: 50.00,
        description: 'Old expense',
        date: '2020-01-01', // Very old
        categoryId: 'default-food'
      });

      // Run cleanup
      const cleanupResult = await storageService.cleanup({
        deleteOlderThan: '2024-01-01'
      });

      expect(cleanupResult.deletedExpenses).toBe(1);
      expect(cleanupResult.spaceFreed).toBeGreaterThan(0);
    });
  });
});