/**
 * Contract Test: Settings Component
 * Purpose: Test application settings UI component
 * This test MUST FAIL until Settings component is implemented
 */

import { Settings } from '../../src/components/Settings.js';

describe('Settings Component Contract', () => {
  let container;
  let settings;
  let mockStorageService;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    mockStorageService = {
      getSettings: jest.fn(),
      updateSettings: jest.fn(),
      exportData: jest.fn(),
      importData: jest.fn(),
      clearData: jest.fn()
    };

    settings = new Settings({
      container,
      storageService: mockStorageService,
      onSettingsChange: jest.fn()
    });
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('settings display', () => {
    test('should render settings sections', async () => {
      mockStorageService.getSettings.mockResolvedValue({
        currency: 'USD',
        theme: 'light',
        language: 'en',
        dateFormat: 'MM/DD/YYYY'
      });

      await settings.render();

      expect(container.querySelector('.settings')).toBeTruthy();
      expect(container.querySelector('.general-settings')).toBeTruthy();
      expect(container.querySelector('.appearance-settings')).toBeTruthy();
      expect(container.querySelector('.data-settings')).toBeTruthy();
    });

    test('should load current settings', async () => {
      mockStorageService.getSettings.mockResolvedValue({
        currency: 'EUR',
        theme: 'dark',
        language: 'en',
        dateFormat: 'DD/MM/YYYY'
      });

      await settings.render();

      expect(container.querySelector('select[name="currency"]').value).toBe('EUR');
      expect(container.querySelector('select[name="theme"]').value).toBe('dark');
      expect(container.querySelector('select[name="dateFormat"]').value).toBe('DD/MM/YYYY');
    });
  });

  describe('general settings', () => {
    test('should update currency setting', async () => {
      mockStorageService.getSettings.mockResolvedValue({
        currency: 'USD',
        theme: 'light'
      });

      await settings.render();

      const currencySelect = container.querySelector('select[name="currency"]');
      currencySelect.value = 'EUR';
      currencySelect.dispatchEvent(new Event('change'));

      expect(mockStorageService.updateSettings).toHaveBeenCalledWith({
        currency: 'EUR'
      });
    });

    test('should update date format', async () => {
      mockStorageService.getSettings.mockResolvedValue({
        dateFormat: 'MM/DD/YYYY'
      });

      await settings.render();

      const dateFormatSelect = container.querySelector('select[name="dateFormat"]');
      dateFormatSelect.value = 'DD/MM/YYYY';
      dateFormatSelect.dispatchEvent(new Event('change'));

      expect(mockStorageService.updateSettings).toHaveBeenCalledWith({
        dateFormat: 'DD/MM/YYYY'
      });
    });
  });

  describe('appearance settings', () => {
    test('should update theme', async () => {
      mockStorageService.getSettings.mockResolvedValue({
        theme: 'light'
      });

      await settings.render();

      const themeSelect = container.querySelector('select[name="theme"]');
      themeSelect.value = 'dark';
      themeSelect.dispatchEvent(new Event('change'));

      expect(mockStorageService.updateSettings).toHaveBeenCalledWith({
        theme: 'dark'
      });
      expect(document.body.classList.contains('theme-dark')).toBe(true);
    });

    test('should preview theme changes', () => {
      settings.render();

      const themeSelect = container.querySelector('select[name="theme"]');
      themeSelect.value = 'dark';
      themeSelect.dispatchEvent(new Event('change'));

      expect(document.body.classList.contains('theme-dark')).toBe(true);
    });
  });

  describe('data management', () => {
    test('should export data', async () => {
      mockStorageService.exportData.mockResolvedValue({
        version: '1.0.0',
        data: { expenses: [], categories: [] }
      });

      await settings.render();

      const exportButton = container.querySelector('.export-data-button');
      exportButton.click();

      expect(mockStorageService.exportData).toHaveBeenCalled();
    });

    test('should import data', async () => {
      mockStorageService.importData.mockResolvedValue({
        success: true,
        imported: { expenses: 5, categories: 2 }
      });

      await settings.render();

      const fileInput = container.querySelector('input[type="file"]');
      const file = new File(['{"version":"1.0.0"}'], 'backup.json', { type: 'application/json' });
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        configurable: true
      });

      fileInput.dispatchEvent(new Event('change'));

      expect(mockStorageService.importData).toHaveBeenCalled();
    });

    test('should clear all data with confirmation', async () => {
      await settings.render();

      const clearButton = container.querySelector('.clear-data-button');
      clearButton.click();

      expect(container.querySelector('.clear-confirmation')).toBeTruthy();

      const confirmButton = container.querySelector('.confirm-clear-button');
      confirmButton.click();

      expect(mockStorageService.clearData).toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    test('should validate import file format', async () => {
      await settings.render();

      const fileInput = container.querySelector('input[type="file"]');
      const invalidFile = new File(['invalid json'], 'backup.txt', { type: 'text/plain' });
      
      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        configurable: true
      });

      fileInput.dispatchEvent(new Event('change'));

      expect(container.querySelector('.error-message')).toBeTruthy();
      expect(mockStorageService.importData).not.toHaveBeenCalled();
    });
  });
});