/**
 * Unit Tests for Formatting Utilities
 * Purpose: Test all formatting functions for correctness and edge cases
 */

import {
  formatDate,
  formatExpenseDate,
  formatDateForInput,
  formatRelativeDate,
  formatCustomDate,
  getDateRange,
  getDaysInMonth,
  isToday,
  isThisWeek,
  isThisMonth,
  parseDate,
  addDays,
  addMonths,
  getStartAndEndOfDay,
  getWeekDays,
  getMonthNames
} from '../../src/utils/date.js';

import {
  formatCurrency,
  formatExpenseAmount,
  formatBudgetAmount,
  formatSummaryAmount,
  parseCurrency,
  getCurrencySymbol,
  getCurrencyName,
  getCurrencyDecimals,
  formatCurrencyInput,
  validateCurrencyAmount,
  calculateBudgetPercentage,
  formatPercentage as formatCurrencyPercentage,
  getCurrencyList,
  formatCurrencyDifference,
  roundCurrencyAmount,
  CURRENCIES
} from '../../src/utils/currency.js';

import {
  formatNumber,
  formatInteger,
  formatDecimal,
  formatCompactNumber,
  formatPercentage,
  formatOrdinal,
  parseNumber,
  roundNumber,
  clampNumber,
  numberRange,
  calculatePercentageChange,
  formatNumberRange,
  formatFileSize,
  isNumberInRange
} from '../../src/utils/number.js';

describe('Date Formatting Utilities', () => {
  describe('formatDate', () => {
    test('should format dates in different styles', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      
      expect(formatDate(date, { format: 'short' })).toMatch(/12\/25\/23|25\/12\/23|23\/12\/25/);
      expect(formatDate(date, { format: 'medium' })).toContain('Dec');
      expect(formatDate(date, { format: 'long' })).toContain('December');
    });

    test('should handle string date inputs', () => {
      const result = formatDate('2023-12-25');
      expect(result).toContain('Dec');
    });

    test('should handle invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('Invalid Date');
      expect(formatDate(null)).toBe('Invalid Date');
    });

    test('should format custom dates', () => {
      const date = new Date('2023-12-25T10:30:45');
      const result = formatCustomDate(date, 'YYYY-MM-DD HH:mm:ss');
      expect(result).toBe('2023-12-25 10:30:45');
    });
  });

  describe('formatExpenseDate', () => {
    test('should format dates for expense display', () => {
      const date = new Date('2023-12-25');
      const result = formatExpenseDate(date);
      expect(result).toMatch(/12\/25\/23|25\/12\/23|23\/12\/25/);
    });
  });

  describe('formatDateForInput', () => {
    test('should format dates for HTML input fields', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      expect(formatDateForInput(date)).toBe('2023-12-25');
    });

    test('should handle invalid dates', () => {
      expect(formatDateForInput('invalid')).toBe('');
      expect(formatDateForInput(null)).toBe('');
    });
  });

  describe('formatRelativeDate', () => {
    test('should format relative dates', () => {
      const now = new Date();
      
      // Today
      expect(formatRelativeDate(now)).toContain('now');
      
      // Yesterday
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayResult = formatRelativeDate(yesterday);
      expect(yesterdayResult).toMatch(/yesterday|1 day ago/);
      
      // Last week
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastWeekResult = formatRelativeDate(lastWeek);
      expect(lastWeekResult).toMatch(/7 days ago|week ago/);
    });
  });

  describe('getDateRange', () => {
    test('should get week range', () => {
      const date = new Date('2023-12-25'); // Monday
      const range = getDateRange('week', date);
      
      expect(range.start).toBeDefined();
      expect(range.end).toBeDefined();
      expect(range.end.getTime()).toBeGreaterThan(range.start.getTime());
    });

    test('should get month range', () => {
      const date = new Date('2023-12-15');
      const range = getDateRange('month', date);
      
      expect(range.start.getDate()).toBe(1);
      expect(range.start.getMonth()).toBe(11); // December (0-indexed)
    });

    test('should get year range', () => {
      const date = new Date('2023-06-15');
      const range = getDateRange('year', date);
      
      expect(range.start.getMonth()).toBe(0); // January
      expect(range.start.getDate()).toBe(1);
      expect(range.end.getMonth()).toBe(11); // December
      expect(range.end.getDate()).toBe(31);
    });

    test('should throw error for invalid period', () => {
      expect(() => getDateRange('invalid')).toThrow('Unsupported period');
    });
  });

  describe('getDaysInMonth', () => {
    test('should return correct days in month', () => {
      expect(getDaysInMonth(2023, 0)).toBe(31); // January
      expect(getDaysInMonth(2023, 1)).toBe(28); // February (non-leap)
      expect(getDaysInMonth(2024, 1)).toBe(29); // February (leap)
      expect(getDaysInMonth(2023, 3)).toBe(30); // April
    });
  });

  describe('date utility functions', () => {
    test('should check if date is today', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      expect(isToday(today)).toBe(true);
      expect(isToday(yesterday)).toBe(false);
    });

    test('should parse date strings', () => {
      expect(parseDate('2023-12-25')).toBeInstanceOf(Date);
      expect(parseDate('invalid')).toBe(null);
      expect(parseDate('')).toBe(null);
    });

    test('should add days to date', () => {
      const date = new Date('2023-12-25');
      const newDate = addDays(date, 5);
      expect(newDate.getDate()).toBe(30);
    });

    test('should add months to date', () => {
      const date = new Date('2023-10-15');
      const newDate = addMonths(date, 2);
      expect(newDate.getMonth()).toBe(11); // December
    });
  });

  describe('getWeekDays and getMonthNames', () => {
    test('should return week days', () => {
      const weekDays = getWeekDays();
      expect(weekDays).toHaveLength(7);
      expect(weekDays[0]).toMatch(/Sun|Mon/); // Depends on locale
    });

    test('should return month names', () => {
      const monthNames = getMonthNames();
      expect(monthNames).toHaveLength(12);
      expect(monthNames[0]).toContain('Jan');
      expect(monthNames[11]).toContain('Dec');
    });
  });
});

describe('Currency Formatting Utilities', () => {
  describe('formatCurrency', () => {
    test('should format currency with default options', () => {
      const result = formatCurrency(1234.56);
      expect(result).toMatch(/\$1,234\.56|\$1234\.56/);
    });

    test('should format different currencies', () => {
      expect(formatCurrency(100, { currency: 'EUR' })).toContain('€');
      expect(formatCurrency(100, { currency: 'GBP' })).toContain('£');
      expect(formatCurrency(100, { currency: 'JPY' })).toContain('¥');
    });

    test('should handle compact notation', () => {
      const result = formatCurrency(1234567, { compact: true });
      expect(result).toMatch(/\$1\.\d+M/);
    });

    test('should handle invalid amounts', () => {
      expect(formatCurrency(NaN)).toContain('$0.00');
      expect(formatCurrency(null)).toContain('$0.00');
      expect(formatCurrency(undefined)).toContain('$0.00');
    });

    test('should show currency codes when requested', () => {
      const result = formatCurrency(100, { showCode: true, currency: 'EUR' });
      expect(result).toContain('EUR');
    });
  });

  describe('parseCurrency', () => {
    test('should parse currency strings', () => {
      expect(parseCurrency('$1,234.56')).toBe(1234.56);
      expect(parseCurrency('€100.00')).toBe(100);
      expect(parseCurrency('1234.56')).toBe(1234.56);
    });

    test('should handle different locales', () => {
      expect(parseCurrency('1.234,56', 'EUR', 'de-DE')).toBe(1234.56);
    });

    test('should return null for invalid inputs', () => {
      expect(parseCurrency('invalid')).toBe(null);
      expect(parseCurrency('')).toBe(null);
      expect(parseCurrency(null)).toBe(null);
    });
  });

  describe('currency utility functions', () => {
    test('should get currency info', () => {
      expect(getCurrencySymbol('USD')).toBe('$');
      expect(getCurrencyName('EUR')).toBe('Euro');
      expect(getCurrencyDecimals('JPY')).toBe(0);
      expect(getCurrencyDecimals('USD')).toBe(2);
    });

    test('should validate currency amounts', () => {
      const valid = validateCurrencyAmount(100);
      expect(valid.isValid).toBe(true);
      expect(valid.value).toBe(100);

      const invalid = validateCurrencyAmount(-10);
      expect(invalid.isValid).toBe(false);
      expect(invalid.error).toContain('at least');
    });

    test('should calculate budget percentages', () => {
      expect(calculateBudgetPercentage(250, 1000)).toBe(25);
      expect(calculateBudgetPercentage(1200, 1000)).toBe(100);
      expect(calculateBudgetPercentage(100, 0)).toBe(0);
    });

    test('should format currency differences', () => {
      const diff = formatCurrencyDifference(150, 100);
      expect(diff.difference).toBe(50);
      expect(diff.trend).toBe('increase');
      expect(diff.formatted).toContain('+');
    });

    test('should round currency amounts', () => {
      expect(roundCurrencyAmount(123.456, 'USD')).toBe(123.46);
      expect(roundCurrencyAmount(123.4, 'JPY')).toBe(123);
    });
  });

  describe('getCurrencyList', () => {
    test('should return currency list', () => {
      const currencies = getCurrencyList();
      expect(currencies).toBeInstanceOf(Array);
      expect(currencies.length).toBeGreaterThan(5);
      expect(currencies[0]).toHaveProperty('code');
      expect(currencies[0]).toHaveProperty('symbol');
      expect(currencies[0]).toHaveProperty('name');
    });
  });
});

describe('Number Formatting Utilities', () => {
  describe('formatNumber', () => {
    test('should format numbers with default options', () => {
      expect(formatNumber(1234.567)).toBe('1,234.567');
    });

    test('should format integers', () => {
      expect(formatInteger(1234.567)).toBe('1,235');
    });

    test('should format decimals with fixed precision', () => {
      expect(formatDecimal(1234.567, 2)).toBe('1,234.57');
    });

    test('should format compact numbers', () => {
      const result = formatCompactNumber(1234567);
      expect(result).toMatch(/1\.2M|1,2M/);
    });

    test('should handle invalid numbers', () => {
      expect(formatNumber(NaN)).toBe('0');
      expect(formatNumber(null)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
    });
  });

  describe('formatPercentage', () => {
    test('should format percentages from decimals', () => {
      expect(formatPercentage(0.25, { isDecimal: true })).toBe('25.0%');
    });

    test('should format percentages from whole numbers', () => {
      expect(formatPercentage(25, { isDecimal: false })).toBe('25.0%');
    });

    test('should handle invalid percentages', () => {
      expect(formatPercentage(NaN)).toBe('0%');
    });
  });

  describe('formatOrdinal', () => {
    test('should format ordinal numbers', () => {
      expect(formatOrdinal(1)).toBe('1st');
      expect(formatOrdinal(2)).toBe('2nd');
      expect(formatOrdinal(3)).toBe('3rd');
      expect(formatOrdinal(4)).toBe('4th');
      expect(formatOrdinal(11)).toBe('11th');
      expect(formatOrdinal(21)).toBe('21st');
      expect(formatOrdinal(22)).toBe('22nd');
      expect(formatOrdinal(23)).toBe('23rd');
    });

    test('should handle invalid numbers', () => {
      expect(formatOrdinal(NaN)).toBe('0th');
    });
  });

  describe('parseNumber', () => {
    test('should parse number strings', () => {
      expect(parseNumber('1,234.56')).toBe(1234.56);
      expect(parseNumber('1234.56')).toBe(1234.56);
      expect(parseNumber('-123.45')).toBe(-123.45);
    });

    test('should handle different locales', () => {
      expect(parseNumber('1.234,56', 'de-DE')).toBe(1234.56);
    });

    test('should return null for invalid inputs', () => {
      expect(parseNumber('invalid')).toBe(null);
      expect(parseNumber('')).toBe(null);
      expect(parseNumber(null)).toBe(null);
    });
  });

  describe('utility functions', () => {
    test('should round numbers', () => {
      expect(roundNumber(123.456, 2)).toBe(123.46);
      expect(roundNumber(123.456, 0)).toBe(123);
    });

    test('should clamp numbers', () => {
      expect(clampNumber(5, 0, 10)).toBe(5);
      expect(clampNumber(-5, 0, 10)).toBe(0);
      expect(clampNumber(15, 0, 10)).toBe(10);
    });

    test('should generate number ranges', () => {
      expect(numberRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
      expect(numberRange(0, 10, 2)).toEqual([0, 2, 4, 6, 8, 10]);
      expect(numberRange(5, 1, -1)).toEqual([5, 4, 3, 2, 1]);
    });

    test('should calculate percentage change', () => {
      expect(calculatePercentageChange(100, 150)).toBe(50);
      expect(calculatePercentageChange(100, 75)).toBe(-25);
      expect(calculatePercentageChange(0, 100)).toBe(0);
    });

    test('should format number ranges', () => {
      const result = formatNumberRange(10, 20, { prefix: '$', suffix: '' });
      expect(result).toBe('$10-$20');
    });

    test('should format file sizes', () => {
      expect(formatFileSize(1024)).toBe('1.0 KiB');
      expect(formatFileSize(1000, { binary: false })).toBe('1.0 KB');
      expect(formatFileSize(0)).toBe('0 B');
    });

    test('should check if number is in range', () => {
      expect(isNumberInRange(5, 0, 10)).toBe(true);
      expect(isNumberInRange(-1, 0, 10)).toBe(false);
      expect(isNumberInRange(11, 0, 10)).toBe(false);
    });
  });
});