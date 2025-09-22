/**
 * Currency Formatting Utilities for Expense Tracker
 * Purpose: Centralized currency formatting, parsing, and conversion functions
 * Constitutional Requirements: Internationalization support, accessibility, error handling
 */

/**
 * Default currency settings
 */
const DEFAULT_CURRENCY = 'USD';
const DEFAULT_LOCALE = 'en-US';

/**
 * Supported currencies with their symbols and decimal places
 */
export const CURRENCIES = {
  USD: { symbol: '$', decimals: 2, name: 'US Dollar' },
  EUR: { symbol: '€', decimals: 2, name: 'Euro' },
  GBP: { symbol: '£', decimals: 2, name: 'British Pound' },
  JPY: { symbol: '¥', decimals: 0, name: 'Japanese Yen' },
  CAD: { symbol: 'C$', decimals: 2, name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', decimals: 2, name: 'Australian Dollar' },
  CHF: { symbol: 'CHF', decimals: 2, name: 'Swiss Franc' },
  CNY: { symbol: '¥', decimals: 2, name: 'Chinese Yuan' },
  INR: { symbol: '₹', decimals: 2, name: 'Indian Rupee' },
  KRW: { symbol: '₩', decimals: 0, name: 'South Korean Won' }
};

/**
 * Format currency amount for display
 * @param {number} amount - Amount to format
 * @param {Object} options - Formatting options
 * @param {string} options.currency - Currency code (e.g., 'USD', 'EUR')
 * @param {string} options.locale - Locale for formatting
 * @param {boolean} options.showSymbol - Whether to show currency symbol
 * @param {boolean} options.showCode - Whether to show currency code
 * @param {number} options.minimumFractionDigits - Minimum decimal places
 * @param {number} options.maximumFractionDigits - Maximum decimal places
 * @param {boolean} options.compact - Use compact notation for large numbers
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, options = {}) {
  const {
    currency = DEFAULT_CURRENCY,
    locale = DEFAULT_LOCALE,
    showSymbol = true,
    showCode = false,
    minimumFractionDigits = null,
    maximumFractionDigits = null,
    compact = false
  } = options;

  try {
    // Validate amount
    if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
      return showSymbol ? `${CURRENCIES[currency]?.symbol || '$'}0.00` : '0.00';
    }

    // Get currency info
    const currencyInfo = CURRENCIES[currency] || CURRENCIES[DEFAULT_CURRENCY];
    
    // Prepare Intl.NumberFormat options
    const formatOptions = {
      style: 'currency',
      currency: currency,
      currencyDisplay: showSymbol ? 'symbol' : 'code',
      minimumFractionDigits: minimumFractionDigits ?? currencyInfo.decimals,
      maximumFractionDigits: maximumFractionDigits ?? currencyInfo.decimals
    };

    // Add compact notation for large numbers
    if (compact && Math.abs(amount) >= 1000) {
      formatOptions.notation = 'compact';
      formatOptions.compactDisplay = 'short';
    }

    let formatted = new Intl.NumberFormat(locale, formatOptions).format(amount);

    // Add currency code if requested
    if (showCode && !showSymbol) {
      formatted = `${formatted} ${currency}`;
    } else if (showCode && showSymbol) {
      formatted = `${formatted} (${currency})`;
    }

    return formatted;
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `${CURRENCIES[currency]?.symbol || '$'}${amount?.toFixed(2) || '0.00'}`;
  }
}

/**
 * Format currency for expense display (optimized for expense lists)
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted currency string
 */
export function formatExpenseAmount(amount, currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE) {
  return formatCurrency(amount, {
    currency,
    locale,
    showSymbol: true,
    showCode: false,
    compact: false
  });
}

/**
 * Format currency for budget display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted currency string
 */
export function formatBudgetAmount(amount, currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE) {
  return formatCurrency(amount, {
    currency,
    locale,
    showSymbol: true,
    showCode: false,
    compact: amount >= 10000 // Use compact notation for large budgets
  });
}

/**
 * Format currency for summary displays (with compact notation)
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted currency string
 */
export function formatSummaryAmount(amount, currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE) {
  return formatCurrency(amount, {
    currency,
    locale,
    showSymbol: true,
    showCode: false,
    compact: true
  });
}

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @param {string} currency - Expected currency code
 * @param {string} locale - Locale for parsing
 * @returns {number|null} Parsed amount or null if invalid
 */
export function parseCurrency(currencyString, currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE) {
  if (!currencyString || typeof currencyString !== 'string') {
    return null;
  }

  try {
    // Remove currency symbols and codes
    const currencyInfo = CURRENCIES[currency] || CURRENCIES[DEFAULT_CURRENCY];
    let cleanString = currencyString
      .replace(new RegExp(`\\${currencyInfo.symbol}`, 'g'), '')
      .replace(new RegExp(currency, 'gi'), '')
      .replace(/[^\d.,\-]/g, '')
      .trim();

    // Handle different decimal separators based on locale
    const numberFormat = new Intl.NumberFormat(locale);
    const parts = numberFormat.formatToParts(1234.56);
    const decimalSeparator = parts.find(part => part.type === 'decimal')?.value || '.';
    const groupSeparator = parts.find(part => part.type === 'group')?.value || ',';

    // Normalize separators
    if (decimalSeparator === ',') {
      // European format: 1.234,56
      cleanString = cleanString.replace(/\./g, '').replace(',', '.');
    } else {
      // US format: 1,234.56
      cleanString = cleanString.replace(/,/g, '');
    }

    const amount = parseFloat(cleanString);
    return isNaN(amount) ? null : amount;
  } catch (error) {
    console.error('Currency parsing error:', error);
    return null;
  }
}

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export function getCurrencySymbol(currency) {
  return CURRENCIES[currency]?.symbol || '$';
}

/**
 * Get currency name
 * @param {string} currency - Currency code
 * @returns {string} Currency name
 */
export function getCurrencyName(currency) {
  return CURRENCIES[currency]?.name || 'US Dollar';
}

/**
 * Get currency decimal places
 * @param {string} currency - Currency code
 * @returns {number} Number of decimal places
 */
export function getCurrencyDecimals(currency) {
  return CURRENCIES[currency]?.decimals ?? 2;
}

/**
 * Format currency input value (for form inputs)
 * @param {string} value - Input value
 * @param {string} currency - Currency code
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted input value
 */
export function formatCurrencyInput(value, currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE) {
  if (!value) return '';

  const amount = parseCurrency(value, currency, locale);
  if (amount === null) return value;

  const currencyInfo = CURRENCIES[currency] || CURRENCIES[DEFAULT_CURRENCY];
  return amount.toFixed(currencyInfo.decimals);
}

/**
 * Validate currency amount
 * @param {number|string} amount - Amount to validate
 * @param {Object} options - Validation options
 * @param {number} options.min - Minimum amount
 * @param {number} options.max - Maximum amount
 * @param {string} options.currency - Currency code
 * @returns {Object} Validation result
 */
export function validateCurrencyAmount(amount, options = {}) {
  const { min = 0, max = Infinity, currency = DEFAULT_CURRENCY } = options;
  
  const result = {
    isValid: false,
    value: null,
    error: null
  };

  // Parse if string
  const numAmount = typeof amount === 'string' ? parseCurrency(amount, currency) : amount;
  
  if (numAmount === null || typeof numAmount !== 'number' || isNaN(numAmount) || !isFinite(numAmount)) {
    result.error = 'Invalid amount';
    return result;
  }

  if (numAmount < min) {
    result.error = `Amount must be at least ${formatCurrency(min, { currency })}`;
    return result;
  }

  if (numAmount > max) {
    result.error = `Amount must be at most ${formatCurrency(max, { currency })}`;
    return result;
  }

  result.isValid = true;
  result.value = numAmount;
  return result;
}

/**
 * Calculate percentage of budget spent
 * @param {number} spent - Amount spent
 * @param {number} budget - Budget amount
 * @returns {number} Percentage (0-100)
 */
export function calculateBudgetPercentage(spent, budget) {
  if (!budget || budget <= 0) return 0;
  return Math.min(Math.round((spent / budget) * 100), 100);
}

/**
 * Format percentage
 * @param {number} percentage - Percentage to format
 * @param {Object} options - Formatting options
 * @param {number} options.decimals - Number of decimal places
 * @param {string} options.locale - Locale for formatting
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(percentage, options = {}) {
  const { decimals = 0, locale = DEFAULT_LOCALE } = options;
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(percentage / 100);
  } catch (error) {
    return `${percentage.toFixed(decimals)}%`;
  }
}

/**
 * Get currency list for dropdowns
 * @returns {Array} Array of currency objects
 */
export function getCurrencyList() {
  return Object.entries(CURRENCIES).map(([code, info]) => ({
    code,
    symbol: info.symbol,
    name: info.name,
    decimals: info.decimals
  }));
}

/**
 * Format currency difference (for comparing amounts)
 * @param {number} current - Current amount
 * @param {number} previous - Previous amount
 * @param {Object} options - Formatting options
 * @param {string} options.currency - Currency code
 * @param {string} options.locale - Locale for formatting
 * @param {boolean} options.showSign - Whether to show + or - sign
 * @returns {Object} Formatted difference with trend info
 */
export function formatCurrencyDifference(current, previous, options = {}) {
  const { currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE, showSign = true } = options;
  
  if (typeof current !== 'number' || typeof previous !== 'number') {
    return {
      formatted: formatCurrency(0, { currency, locale }),
      difference: 0,
      percentage: 0,
      trend: 'neutral'
    };
  }

  const difference = current - previous;
  const percentage = previous !== 0 ? (difference / Math.abs(previous)) * 100 : 0;
  
  let trend = 'neutral';
  if (difference > 0) trend = 'increase';
  if (difference < 0) trend = 'decrease';

  const sign = showSign && difference !== 0 ? (difference > 0 ? '+' : '') : '';
  const formatted = `${sign}${formatCurrency(difference, { currency, locale })}`;

  return {
    formatted,
    difference,
    percentage: Math.round(percentage),
    trend
  };
}

/**
 * Round currency amount to proper decimal places
 * @param {number} amount - Amount to round
 * @param {string} currency - Currency code
 * @returns {number} Rounded amount
 */
export function roundCurrencyAmount(amount, currency = DEFAULT_CURRENCY) {
  const decimals = getCurrencyDecimals(currency);
  const factor = Math.pow(10, decimals);
  return Math.round(amount * factor) / factor;
}