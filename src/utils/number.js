/**
 * Number Formatting Utilities for Expense Tracker
 * Purpose: Centralized number formatting, parsing, and calculation functions
 * Constitutional Requirements: Internationalization support, accessibility, error handling
 */

/**
 * Default locale for number formatting
 */
const DEFAULT_LOCALE = 'en-US';

/**
 * Format number for display
 * @param {number} value - Number to format
 * @param {Object} options - Formatting options
 * @param {string} options.locale - Locale for formatting
 * @param {number} options.minimumFractionDigits - Minimum decimal places
 * @param {number} options.maximumFractionDigits - Maximum decimal places
 * @param {boolean} options.useGrouping - Whether to use thousand separators
 * @param {string} options.notation - Notation type: 'standard', 'scientific', 'engineering', 'compact'
 * @param {string} options.compactDisplay - Compact display: 'short', 'long'
 * @param {string} options.signDisplay - Sign display: 'auto', 'never', 'always', 'exceptZero'
 * @returns {string} Formatted number string
 */
export function formatNumber(value, options = {}) {
  const {
    locale = DEFAULT_LOCALE,
    minimumFractionDigits = 0,
    maximumFractionDigits = 20,
    useGrouping = true,
    notation = 'standard',
    compactDisplay = 'short',
    signDisplay = 'auto'
  } = options;

  try {
    // Validate input
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      return '0';
    }

    const formatOptions = {
      minimumFractionDigits,
      maximumFractionDigits,
      useGrouping,
      notation,
      signDisplay
    };

    // Add compact display for compact notation
    if (notation === 'compact') {
      formatOptions.compactDisplay = compactDisplay;
    }

    return new Intl.NumberFormat(locale, formatOptions).format(value);
  } catch (error) {
    console.error('Number formatting error:', error);
    return value?.toString() || '0';
  }
}

/**
 * Format integer number
 * @param {number} value - Number to format
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted integer string
 */
export function formatInteger(value, locale = DEFAULT_LOCALE) {
  return formatNumber(value, {
    locale,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true
  });
}

/**
 * Format decimal number with fixed precision
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted decimal string
 */
export function formatDecimal(value, decimals = 2, locale = DEFAULT_LOCALE) {
  return formatNumber(value, {
    locale,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: true
  });
}

/**
 * Format number in compact notation (e.g., 1.2K, 3.4M)
 * @param {number} value - Number to format
 * @param {Object} options - Formatting options
 * @param {string} options.locale - Locale for formatting
 * @param {string} options.compactDisplay - 'short' or 'long'
 * @param {number} options.maximumFractionDigits - Maximum decimal places
 * @returns {string} Formatted compact number string
 */
export function formatCompactNumber(value, options = {}) {
  const {
    locale = DEFAULT_LOCALE,
    compactDisplay = 'short',
    maximumFractionDigits = 1
  } = options;

  return formatNumber(value, {
    locale,
    notation: 'compact',
    compactDisplay,
    maximumFractionDigits
  });
}

/**
 * Format percentage with proper symbol
 * @param {number} value - Value to format as percentage (0-1 or 0-100)
 * @param {Object} options - Formatting options
 * @param {boolean} options.isDecimal - Whether input is decimal (0-1) or percentage (0-100)
 * @param {number} options.decimals - Number of decimal places
 * @param {string} options.locale - Locale for formatting
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, options = {}) {
  const {
    isDecimal = false,
    decimals = 1,
    locale = DEFAULT_LOCALE
  } = options;

  try {
    // Validate input
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      return '0%';
    }

    // Convert to decimal if needed
    const decimalValue = isDecimal ? value : value / 100;

    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(decimalValue);
  } catch (error) {
    console.error('Percentage formatting error:', error);
    return `${value.toFixed(decimals)}%`;
  }
}

/**
 * Format ordinal numbers (1st, 2nd, 3rd, etc.)
 * @param {number} value - Number to format as ordinal
 * @param {string} locale - Locale for formatting
 * @returns {string} Formatted ordinal string
 */
export function formatOrdinal(value, locale = DEFAULT_LOCALE) {
  try {
    // Validate input
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      return '0th';
    }

    // Use Intl.PluralRules for proper ordinal formatting
    const pr = new Intl.PluralRules(locale, { type: 'ordinal' });
    const rule = pr.select(value);

    const suffixes = {
      'en-US': {
        one: 'st',
        two: 'nd',
        few: 'rd',
        other: 'th'
      },
      'en-GB': {
        one: 'st',
        two: 'nd',
        few: 'rd',
        other: 'th'
      }
    };

    const localeSuffixes = suffixes[locale] || suffixes['en-US'];
    const suffix = localeSuffixes[rule] || localeSuffixes.other;

    return `${formatInteger(value, locale)}${suffix}`;
  } catch (error) {
    console.error('Ordinal formatting error:', error);
    // Fallback for English ordinals
    const lastDigit = Math.abs(value) % 10;
    const lastTwoDigits = Math.abs(value) % 100;
    
    let suffix = 'th';
    if (lastTwoDigits < 11 || lastTwoDigits > 13) {
      if (lastDigit === 1) suffix = 'st';
      else if (lastDigit === 2) suffix = 'nd';
      else if (lastDigit === 3) suffix = 'rd';
    }
    
    return `${value}${suffix}`;
  }
}

/**
 * Parse number from string with locale support
 * @param {string} numberString - String to parse
 * @param {string} locale - Locale for parsing
 * @returns {number|null} Parsed number or null if invalid
 */
export function parseNumber(numberString, locale = DEFAULT_LOCALE) {
  if (!numberString || typeof numberString !== 'string') {
    return null;
  }

  try {
    // Get locale-specific separators
    const numberFormat = new Intl.NumberFormat(locale);
    const parts = numberFormat.formatToParts(1234.56);
    const decimalSeparator = parts.find(part => part.type === 'decimal')?.value || '.';
    const groupSeparator = parts.find(part => part.type === 'group')?.value || ',';

    // Clean the string
    let cleanString = numberString.trim();
    
    // Remove all characters except digits, decimal separator, group separator, and minus sign
    const allowedChars = new RegExp(`[^\\d${escapeRegExp(decimalSeparator)}${escapeRegExp(groupSeparator)}\\-]`, 'g');
    cleanString = cleanString.replace(allowedChars, '');

    // Normalize separators
    if (decimalSeparator === ',') {
      // European format: 1.234,56
      const lastCommaIndex = cleanString.lastIndexOf(',');
      const lastDotIndex = cleanString.lastIndexOf('.');
      
      if (lastCommaIndex > lastDotIndex) {
        // Comma is decimal separator
        cleanString = cleanString.replace(/\./g, '').replace(',', '.');
      } else {
        // Dot is decimal separator, comma is group separator
        cleanString = cleanString.replace(/,/g, '');
      }
    } else {
      // US format: 1,234.56
      const lastDotIndex = cleanString.lastIndexOf('.');
      const lastCommaIndex = cleanString.lastIndexOf(',');
      
      if (lastDotIndex > lastCommaIndex) {
        // Dot is decimal separator
        cleanString = cleanString.replace(/,/g, '');
      } else {
        // Both could be group separators or comma could be decimal
        const commaCount = (cleanString.match(/,/g) || []).length;
        if (commaCount === 1 && lastCommaIndex > cleanString.length - 4) {
          // Single comma near the end, likely decimal separator
          cleanString = cleanString.replace(',', '.');
        } else {
          // Multiple commas or comma not near end, likely group separators
          cleanString = cleanString.replace(/,/g, '');
        }
      }
    }

    const number = parseFloat(cleanString);
    return isNaN(number) ? null : number;
  } catch (error) {
    console.error('Number parsing error:', error);
    return null;
  }
}

/**
 * Round number to specified decimal places
 * @param {number} value - Number to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded number
 */
export function roundNumber(value, decimals = 0) {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return 0;
  }
  
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Clamp number between min and max values
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clampNumber(value, min, max) {
  if (typeof value !== 'number' || isNaN(value)) {
    return min;
  }
  
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate number range array
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} step - Step size
 * @returns {Array} Array of numbers
 */
export function numberRange(start, end, step = 1) {
  const range = [];
  
  if (step === 0) {
    throw new Error('Step cannot be zero');
  }
  
  if (step > 0) {
    for (let i = start; i <= end; i += step) {
      range.push(i);
    }
  } else {
    for (let i = start; i >= end; i += step) {
      range.push(i);
    }
  }
  
  return range;
}

/**
 * Calculate percentage change between two numbers
 * @param {number} oldValue - Original value
 * @param {number} newValue - New value
 * @returns {number} Percentage change
 */
export function calculatePercentageChange(oldValue, newValue) {
  if (typeof oldValue !== 'number' || typeof newValue !== 'number' || oldValue === 0) {
    return 0;
  }
  
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}

/**
 * Format number range (e.g., "10-20", "$100-$200")
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {Object} options - Formatting options
 * @param {string} options.separator - Range separator
 * @param {string} options.locale - Locale for formatting
 * @param {number} options.decimals - Number of decimal places
 * @param {string} options.prefix - Prefix for each number
 * @param {string} options.suffix - Suffix for each number
 * @returns {string} Formatted range string
 */
export function formatNumberRange(min, max, options = {}) {
  const {
    separator = '-',
    locale = DEFAULT_LOCALE,
    decimals = 0,
    prefix = '',
    suffix = ''
  } = options;

  const formatOptions = {
    locale,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  };

  const formattedMin = `${prefix}${formatNumber(min, formatOptions)}${suffix}`;
  const formattedMax = `${prefix}${formatNumber(max, formatOptions)}${suffix}`;

  return `${formattedMin}${separator}${formattedMax}`;
}

/**
 * Format file size in bytes
 * @param {number} bytes - Size in bytes
 * @param {Object} options - Formatting options
 * @param {string} options.locale - Locale for formatting
 * @param {number} options.decimals - Number of decimal places
 * @param {boolean} options.binary - Use binary (1024) or decimal (1000) units
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes, options = {}) {
  const {
    locale = DEFAULT_LOCALE,
    decimals = 1,
    binary = true
  } = options;

  if (typeof bytes !== 'number' || bytes < 0) {
    return '0 B';
  }

  const base = binary ? 1024 : 1000;
  const units = binary 
    ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
    : ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

  if (bytes === 0) {
    return '0 B';
  }

  const exponent = Math.floor(Math.log(bytes) / Math.log(base));
  const value = bytes / Math.pow(base, exponent);

  return `${formatDecimal(value, decimals, locale)} ${units[exponent]}`;
}

/**
 * Check if number is within range
 * @param {number} value - Value to check
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {boolean} True if value is within range
 */
export function isNumberInRange(value, min, max) {
  return typeof value === 'number' && 
         isFinite(value) && 
         value >= min && 
         value <= max;
}

/**
 * Escape special regex characters
 * @param {string} string - String to escape
 * @returns {string} Escaped string
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}